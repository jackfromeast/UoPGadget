/** jackfromeast
 * 
 * class SymbolicState:
 * 1/ preserve the symolic state of the program (path constraints, input symbols, wrapper symbols, etc.)
 * 2/ create pure/symbolic symbols
 * 
 * TODO: class SymbolicSolver:
 * 1/ solve the path constraints and generate alternative inputs
 * 
 * class SymbolicModel:
 * 1/ provide a bunch of helper functions to generate symbolic representation for different operations(binary operations, unary operations)
 * 2/ currently do not include the modeled functions
 * 
 */

// JALANGI DO NOT INSTRUMENT

import Log from "./utilities/log";
import ObjectHelper from "./utilities/object-helper";
import Coverage from "./coverage";
import Config from "./config";
import SymbolicHelper from "./symbolic-helper";
import { SymbolicObject } from "./values/symbolic-object";
import { PureSymbol } from "./values/pure-symbol";
import { WrappedValue, ConcolicValue } from "./values/wrapped-values";
import { stringify } from "./utilities/safe-json";
import Stats from "../../lib/Stats/bin/main";
import Z3 from "z3javascript";
import Helpers from "./models/helpers";

class SymbolicState {
	constructor(input, undefinedPool, sandbox) {
		this.ctx = new Z3.Context();
		this.slv = new Z3.Solver(this.ctx,
			Config.incrementalSolverEnabled,
			[
				{ name: "smt.string_solver", value: Config.stringSolver }, 
				//				{ name: "timeout", value: Config.maxSolverTime },
				{ name: "random_seed", value: Math.floor(Math.random() * Math.pow(2, 32))},
				{ name: "phase_selection", value: 5 }
			]
		);

		this.helpers = new Helpers(this, this.ctx);

		Z3.Query.MAX_REFINEMENTS = Config.maxRefinements;

		this.input = input;
		this.inputSymbols = {}; // not including pureSymbol and SymbolicObject, only for symbol that pass to sovler
		this.wrapperSymbols = {}; // pureSymbol and SymbolicObject
		this.pathCondition = [];
		this.undefinedPool = undefinedPool; // lzy: add newly find undefined properties while path exploration

		this.stats = new Stats();
		this.coverage = new Coverage(sandbox);
		this.errors = [];

		this._setupSmtFunctions();
	}

	/** Set up a bunch of SMT functions used by the models **/
	_setupSmtFunctions() {

		this.stringRepeat = this.ctx.mkRecFunc(this.ctx.mkStringSymbol("str.repeat"), [this.ctx.mkStringSort(), this.ctx.mkIntSort()], this.ctx.mkStringSort());

		this.slv.fromString("(define-fun-rec str.repeat ((a String) (b Int)) String (if (<= b 0) \"\" (str.++ a (str.repeat a (- b 1)))))");

		this.whiteLeft = this.ctx.mkRecFunc(this.ctx.mkStringSymbol("str.whiteLeft"), [this.ctx.mkStringSort(), this.ctx.mkIntSort()], this.ctx.mkIntSort());
		this.whiteRight = this.ctx.mkRecFunc(this.ctx.mkStringSymbol("str.whiteRight"), [this.ctx.mkStringSort(), this.ctx.mkIntSort()], this.ctx.mkIntSort());

		/** Set up trim methods **/
		this.slv.fromString( 
			"(define-fun str.isWhite ((c String)) Bool (= c \" \"))\n" + //TODO: Only handles  
			"(define-fun-rec str.whiteLeft ((s String) (i Int)) Int (if (str.isWhite (str.at s i)) (str.whiteLeft s (+ i 1)) i))\n" +
      "(define-fun-rec str.whiteRight ((s String) (i Int)) Int (if (str.isWhite (str.at s i)) (str.whiteRight s (- i 1)) i))\n"
		);
	}

	pushCondition(cnd, binder) {
		this.pathCondition.push({
			ast: cnd,
			binder: binder || false,
			forkIid: this.coverage.last()
		});
	}

	/**
   * Creates a full (up to date) solver instance and then calls toString on it to create an SMT2Lib problem
   * TODO: This is a stop-gag implementation for the work with Ronny - not to be relied upon.
   */
	inlineToSMTLib() {
		this.slv.push();
		this.pathCondition.forEach(pcItem => this.slv.assert(pcItem.ast));
		const resultString = this.slv.toString();
		this.slv.pop();
		return resultString;
	}

	/**
    * Returns the final PC as a string (if any symbols exist)
    */
	finalPC() {
		return this.pathCondition.filter(x => x.ast).map(x => x.ast);
	}

	_stringPC(pc) {
		return pc.length ? pc.reduce((prev, current) => {
			let this_line = current.simplify().toPrettyString().replace(/\s+/g, " ").replace(/not /g, "¬");

			if (this_line.startsWith("(¬")) {
				this_line = this_line.substr(1, this_line.length - 2);
			}

			if (this_line == "true" || this_line == "false") {
				return prev;
			} else {
				return prev + (prev.length ? ", " : "") + this_line;
			}
		}, "") : "";
	}

	_addInput(pc, solution, pcIndex, childInputs) {
		solution._bound = pcIndex + 1;
		childInputs.push({
			input: solution,
			pc: this._stringPC(pc),
			forkIid: this.pathCondition[pcIndex].forkIid
		});
	}

	_buildPC(childInputs, i, inputCallback) {

		const newPC = this.ctx.mkNot(this.pathCondition[i].ast);

		const allChecks = this.pathCondition.slice(0, i).reduce((last, next) => last.concat(next.ast.checks), []).concat(newPC.checks);

		Log.logMid(`Checking if ${newPC.simplify().toString()} is satisfiable`);

		/** jackfromeast
		 *  ExpoSE serves each PC as a separate SMT query which seems does not follows the general idea
		 *  We will and all the previous PC together with the current mkNot PC and check if it is satisfiable
		 */
		
		const solution = this._checkSat(newPC, i, allChecks);

		if (solution) {
			this._addInput(newPC, solution, i, childInputs);
			Log.logMid(`Satisfiable. Remembering new input: ${ObjectHelper.asString(solution)}`);

			if (inputCallback) {
				inputCallback(childInputs);
			}

		} else {
			Log.logHigh(`${newPC.toString()} is not satisfiable`);
		}
	}

	_buildAsserts(i) {
		return this.pathCondition.slice(0, i).map(x => x.ast);
	}

	/**
	 * Solve the current PC and get the alternative inputs for the next round
	 * 
	 * __bound: the upper bound of the current PC
	 * Only mkNot the PC after __bound and assume the pc before __bound always holds true
	 * 
	 * @param {*} inputCallback 
	 */
	alternatives(inputCallback) {
		let childInputs = [];

		if (this.input._bound > this.pathCondition.length) {
			throw `Bound ${this.input._bound} > ${this.pathCondition.length}, divergence has occured`;
		}

		// For each pure symbol, summarize it
		for (let symbol of Object.values(this.wrapperSymbols)) {
			if (this.isPureSymbol(symbol)) {
				this.summaryPureSymbol(symbol);
			}
		}

		// Path conditions before _bound should always holds true
		this._buildAsserts(Math.min(this.input._bound, this.pathCondition.length)).forEach(x => this.slv.assert(x));
		this.slv.push();

		for (let i = this.input._bound; i < this.pathCondition.length; i++) {

			//TODO: Make checks on expressions smarter
			if (!this.pathCondition[i].binder) {
				this._buildPC(childInputs, i, inputCallback);
			}

			Log.logMid(this.slv.toString());

			//Push the current thing we're looking at to the solver
			this.slv.assert(this.pathCondition[i].ast);
			this.slv.push();
		}

		this.slv.reset();

		//Guarentee inputCallback is called at least once
		inputCallback(childInputs);
	}

	/** jackfromeast
	 * @param {*} concrete: the concrete value to be converted to a symbolic value
	 * @returns sort: the sort of the symbolic value
	 */
	_getSort(concrete) {
		let sort;

		switch (typeof(concrete)) {
		case "boolean":
			sort = this.ctx.mkBoolSort();
			break;
		case "number":
			sort = this.ctx.mkRealSort();
			break;
		case "string":
			sort = this.ctx.mkStringSort();
			break;
		default:
			Log.log(`Symbolic input variable of type ${typeof val} not yet supported.`);
		}
		return sort;
	}

	/** jackfromeast
	 * 
	 * when we create an pure symbol, what we are trying to say is that the type/sort of the value is undecidable yet
	 * in ExpoSE, they try to mkNot of all the others types and test them one by one
	 * in ExpoSE+, we try to determine the type of the value in the first round, add the possible type constraints and only check these types in the following rounds
	 * 
	 * @param {string} name 
	 * @returns symbolic value
	 */
	createPureSymbol(name) {

		this.stats.seen("Pure Symbols");

		// if it is not the first round, pureType would contains an concrete type e.g. strings
		let pureType = this.createSymbolicValue(name + "_t", "undefined");

		if (pureType.getConcrete() !== "undefined") {
			// in the following rounds,
			switch (pureType.getConcrete()) {
			case "string":
				// TODO: FIX THIS
				this.assertEqual(pureType, SymbolicHelper.concolic("string"), this); // add the first type constraint
				return this.createSymbolicValue(name, "xxx");
			case "number":
				this.assertEqual(pureType, SymbolicHelper.concolic("number"), this);
				return this.createSymbolicValue(name, 0);
			case "boolean":
				this.assertEqual(pureType, SymbolicHelper.concolic("boolean"), this);
				return this.createSymbolicValue(name, false);
			case "object":
				this.assertEqual(pureType, SymbolicHelper.concolic("object"), this);
				return this.createSymbolicValue(name, {});
			case "array_number":
				this.assertEqual(pureType, SymbolicHelper.concolic("array_number"), this);
				return this.createSymbolicValue(name, [0]);
			case "array_string":
				this.assertEqual(pureType, SymbolicHelper.concolic("array_string"), this);
				return this.createSymbolicValue(name, ["seed_string"]);
			case "array_bool":
				this.assertEqual(pureType, SymbolicHelper.concolic("array_bool"), this);
				return this.createSymbolicValue(name, [false]);
			case "null":
				return null;
			default:
				Log.log(`Symbolic input variable of type ${typeof val} not yet supported.`);
			}
		} else {
			// in the first round, we create a real pure symbol
			let res = new PureSymbol(name);
			this.wrapperSymbols[name] = res;
			res.setPureType(pureType);
			return res;
		}
	}

	/**
	 * Push type constraints of the pure symbol to the PC
	 * @param {pureSymbol} pureSymbol 
	 * @returns 
	 */
	summaryPureSymbol(pureSymbol){
		let pureType = pureSymbol.getPureType();
		let possibleTypes = pureSymbol.getPossibleTypes();

		for (let type of possibleTypes) {
			this.assertEqual(pureType, SymbolicHelper.concolic(type));
		}
	}

	createSymbolicValue(name, concrete) {

		Log.logMid(`Args ${stringify(arguments)} ${name} ${concrete}`);

		this.stats.seen("Symbolic Values");

		//TODO: Very ugly short circuit
		if (!(concrete instanceof Array) && typeof concrete === "object") {
			this.wrapperSymbols[name] = new SymbolicObject(name);
			return this.wrapperSymbols[name];
		}

		let symbolic;
		let arrayType;

		if (concrete instanceof Array) {
			this.stats.seen("Symbolic Arrays");
			symbolic = this.ctx.mkArray(name, this._getSort(concrete[0]));
			this.pushCondition(this.ctx.mkGe(symbolic.getLength(), this.ctx.mkIntVal(0)), true);
			arrayType = typeof(concrete[0]);
		} else {
			this.stats.seen("Symbolic Primitives");
			const sort = this._getSort(concrete);
			const symbol = this.ctx.mkStringSymbol(name);
			symbolic = this.ctx.mkConst(symbol, sort);
		}

		// Use generated input if available
		if (name in this.input) {
			concrete = this.input[name];
		} else {
			this.input[name] = concrete;
		}

		this.inputSymbols[name] = symbolic;

		Log.logMid(`Initializing fresh symbolic variable ${symbolic} using concrete value ${concrete}`);
		return new ConcolicValue(concrete, symbolic, arrayType);
	}

	getSolution(model) {
		let solution = {};

		for (const name of Object.keys(this.inputSymbols)) {
		// for (let name in this.inputSymbols) {
			let solutionAst = model.eval(this.inputSymbols[name]);
			solution[name] = solutionAst.asConstant(model);
			solutionAst.destroy();
		}

		model.destroy();
		return solution;
	}

	_checkSat(clause, i, checks) {

		const startTime = (new Date()).getTime();
		let model = (new Z3.Query([clause], checks)).getModel(this.slv);
		const endTime = (new Date()).getTime();

		this.stats.max("Max Queries (Any)", Z3.Query.LAST_ATTEMPTS);

		if (model) {
			this.stats.max("Max Queries (Succesful)", Z3.Query.LAST_ATTEMPTS);
		} else {
			this.stats.seen("Failed Queries");
			if (Z3.Query.LAST_ATTEMPTS == Z3.Query.MAX_REFINEMENTS) {
				this.stats.seen("Failed Queries (Max Refinements)");
			}
		}

		Log.logQuery(clause.toString(),
			this.slv.toString(),
			checks.length,
			startTime,
			endTime,
			model ? model.toString() : undefined,
			Z3.Query.LAST_ATTEMPTS, Z3.Query.LAST_ATTEMPTS == Z3.Query.MAX_REFINEMENTS
		);

		return model ? this.getSolution(model) : undefined;
	}
}

/** jackfromeast
 * 
 * 1/ provide a bunch of helper functions to generate symbolic representation for different operations(binary operations, unary operations)
 * 2/ currently do not include the modeled functions
 * 
 * If the model function need to add pc to the state, then it need to pass the state as an argument
 * E.g. condition(result, state) => {... state.pushCondition(...)}
 * 
 * TODO: we should puts this in the models folder !!!
 */
class SymbolicModel {
	constructor(ctx, stats){
		this.ctx = ctx;
		this.stats = stats;

		this._unaryJumpTable = _buildUnaryJumpTable();
	}

	/**
     * Perform a unary op on a ConcolicValue or a concrete value
     * Concretizes the ConcolicValue if we don't know how to do that action symbolically
     */
	unary(op, left) {
		const result_c = SymbolicHelper.evalUnary(op, SymbolicHelper.getConcrete(left));
		const result_s = SymbolicHelper.isSymbolic(left) ? this._symbolicUnary(op, SymbolicHelper.getConcrete(left), SymbolicHelper.asSymbolic(left)) : undefined;
		return result_s ? new ConcolicValue(result_c, result_s) : result_c;
	}

	/**
     * Perform a symbolic unary action.
     * Expects an Expr and returns an Expr or undefined if we don't
     * know how to do this op symbolically
     */
	_symbolicUnary(op, left_c, left_s) {
		this.stats.seen("Symbolic Unary");
	
		const unaryFn = this._unaryJumpTable[typeof(left_c)] ? this._unaryJumpTable[typeof(left_c)][op] : undefined;

		if (unaryFn) {
			return unaryFn(left_s, left_c);
		} else {
			Log.log(`Unsupported symbolic operand: ${op} on ${left_c} symbolic ${left_s}`);
			return undefined;
		}
	}

	_buildUnaryJumpTable() {
		return {
			"boolean":  {
				"+": function(val_s) {
					return this.ctx.mkIte(val_s, this.constantSymbol(1), this.constantSymbol(0));
				},
				"-": function(val_s) {
					return this.ctx.mkIte(val_s, this.constantSymbol(-1), this.constantSymbol(0));               
				},
				"!": function(val_s) {
					return this.ctx.mkNot(val_s);
				}
			},
			"number": {
				"!": function(val_s, val_c) {
					let bool_s = SymbolicHelper.asSymbolic(SymbolicHelper.toBool(new ConcolicValue(val_c, val_s)));
					return bool_s ? this.ctx.mkNot(bool_s) : undefined;
				},
				"+": function(val_s) {
					return val_s;
				},
				"-": function(val_s) {
					return this.ctx.mkUnaryMinus(val_s);
				}
			},
			"string": {
				"!": function(val_s, val_c) {
					let bool_s = SymbolicHelper.asSymbolic(SymbolicHelper.toBool(new ConcolicValue(val_c, val_s)));
					return bool_s ? this.ctx.mkNot(bool_s) : undefined;
				},
				"+": function(val_s) {
					return this.ctx.mkStrToInt(val_s);
				},
				"-": function(val_s) {
					return this.ctx.mkUnaryMinus(
						this.ctx.mkStrToInt(val_s)
					);
				}
			}
		}; 
	}

	/** 
   	* Symbolic binary operation, expects at least one values and an operator
   	*/
	binary(op, left, right) {
		// jackfromeast
		left = SymbolicHelper.concolic(left);
		right = SymbolicHelper.concolic(right);

		if (typeof SymbolicHelper.getConcrete(left) === "string") {
			right = SymbolicHelper.ToString(right);
		}

		const result_c = SymbolicHelper.evalBinary(op, SymbolicHelper.getConcrete(left), SymbolicHelper.getConcrete(right));
		const result_s = this._symbolicBinary(op, SymbolicHelper.getConcrete(left), SymbolicHelper.asSymbolic(left), SymbolicHelper.getConcrete(right), SymbolicHelper.asSymbolic(right));
		return typeof(result_s) !== undefined ? new ConcolicValue(result_c, result_s) : result_c;
	}

	_symbolicBinary(op, left_c, left_s, right_c, right_s) {
		this.stats.seen("Symbolic Binary");

		Log.logMid(`Symbolic Binary: ${stringify(arguments)}`);

		switch (op) {
		case "===":
		case "==":
			return this.ctx.mkEq(left_s, right_s);
		case "!==":
		case "!=":
			return this.ctx.mkNot(this.ctx.mkEq(left_s, right_s));
		case "&&":
			return this.ctx.mkAnd(left_s, right_s);
		case "||":
			return this.ctx.mkOr(left_s, right_s);
		case ">":
			return this.ctx.mkGt(left_s, right_s);
		case ">=":
			return this.ctx.mkGe(left_s, right_s);
		case "<=":
			return this.ctx.mkLe(left_s, right_s);
		case "<":
			return this.ctx.mkLt(left_s, right_s);
		case "<<":
		case "<<<":
			left_s = this.ctx.mkRealToInt(left_s);
			right_s = this.ctx.mkRealToInt(right_s);
			return this.ctx.mkIntToReal(this.ctx.mkMul(left_s, this.ctx.mkPower(this.ctx.mkIntVal(2), right_s)));
		case ">>":
		case ">>>":
			left_s = this.ctx.mkRealToInt(left_s);
			right_s = this.ctx.mkRealToInt(right_s);
			return this.ctx.mkIntToReal(this.ctx.mkDiv(left_s, this.ctx.mkPower(this.ctx.mkIntVal(2), right_s)));
		case "+":
			return typeof left_c === "string" ? this.ctx.mkSeqConcat([left_s, right_s]) : this.ctx.mkAdd(left_s, right_s);
		case "-":
			return this.ctx.mkSub(left_s, right_s);
		case "*":
			return this.ctx.mkMul(left_s, right_s);
		case "/":
			return this.ctx.mkDiv(left_s, right_s);
		case "%":
			return this.ctx.mkMod(left_s, right_s);
		default:
			Log.log(`Symbolic execution does not support operand ${op}, concretizing.`);
			break;
		}

		return undefined;
	}


	/** jackfromeast
	* Symbolic field lookup - currently only has support for symbolic arrays / strings
   	*/
	symbolicField(base_c, base_s, field_c, field_s, state) {
		this.stats.seen("Symbolic Field");

		function canHaveFields() {
			return typeof base_c === "string" || base_c instanceof Array;
		}

		function isRealNumber() {
			return typeof field_c === "number" && Number.isFinite(field_c);
		}

		if (canHaveFields() && isRealNumber()) { 
			const withinBounds = this.ctx.mkAnd(
				this.ctx.mkGt(field_s, this.ctx.mkIntVal(-1)),
				this.ctx.mkLt(field_s, base_s.getLength())
			);
			
			if (this.conditional(new ConcolicValue(field_c > -1 && field_c < base_c.length, withinBounds), state)) {
				return base_s.getField(this.ctx.mkRealToInt(field_s));
			} else {
				return undefined;
			}
		}

		switch (field_c) {
		case "length": {
			if (base_s.getLength()) {
				return base_s.getLength();
			} else {
				Log.log("No length field on symbolic value");
			}
			break;
		}
		default: {
			Log.log("Unsupported symbolic field - concretizing " + base_c + " and field " + field_c);
			break;
		}

		}

		return undefined;
	}

	conditional(result, state) {

		const result_c = this.getConcrete(result),
			result_s = this.asSymbolic(result);

		if (result_c === true) {
			Log.logMid(`Concrete result was true, pushing ${result_s}`);
			state.pushCondition(result_s);
		} else if (result_c === false) {
			Log.logMid(`Concrete result was false, pushing not of ${result_s}`);
			state.pushCondition(this.ctx.mkNot(result_s));
		} else {
			Log.log("WARNING: Symbolic Conditional on non-bool, concretizing");
		}

		return result_c;
	}

	/** jackfromeast
	 * Used for making the input argument of a function concrete
	 */
	concretizeCall(f, base, args, report = true) {

		const numConcretizedProperties = { val: 0 };
		base = this._deepConcrete(base, numConcretizedProperties); 

		const n_args = Array(args.length);

		for (let i = 0; i < args.length; i++) {
			n_args[i] = this._deepConcrete(args[i], numConcretizedProperties);
		}

		if (report && numConcretizedProperties.val) {
			this.stats.set("Concretized Function Calls", f.name);
			Log.logMid(`Concrete function concretizing all inputs ${ObjectHelper.asString(f)} ${ObjectHelper.asString(base)} ${ObjectHelper.asString(args)}`);
		}

		return {
			base: base,
			args: n_args,
			count: numConcretizedProperties.val
		};
	}

	_deepConcrete(start, _concreteCount) {
		start = this.getConcrete(start);	
		/*
		let worklist = [this.getConcrete(start)];
		let seen = [];

		while (worklist.length) {
			const arg = worklist.pop();
			seen.push(arg);

			for (let i in arg) {
				if (this.isSymbolic(arg[i])) {
					arg[i] = this.getConcrete(arg[i]);
					concreteCount.val += 1;
				}

				const seenBefore = !!seen.find(x => x === arg); 
				if (arg[i] instanceof Object && !seenBefore) {
					worklist.push(arg[i]); 
				}
			}
		}
    	*/
		return start;
	}

	/**
	 * Return a symbol which will always be equal to the constant value val
	 * returns undefined if the theory is not supported.
	 */
	constantSymbol(val) {
		this.stats.seen("Wrapped Constants");

		if (val && typeof(val) === "object") {
			val = val.valueOf();
		}

		switch (typeof(val)) {
		case "boolean":
			return val ? this.ctx.mkTrue() : this.ctx.mkFalse();
		case "number":
			return this.ctx.mkNumeral("" + val, this.ctx.mkRealSort());
		case "string":
			return this.ctx.mkString(val.toString());
		default:
			Log.log("Symbolic expressions with " + typeof(val) + " literals not yet supported.");
		}

		return undefined;
	}

	/**
     * Assert left == right on the path condition
	 * 
	 * @param {boolean} push_constraints
     */
	assertEqual(left, right, state) {
		const equalityTest = this.binary("==", left, right);

		this.conditional(equalityTest, state);
		return this.getConcrete(equalityTest);
	}

}




export default { SymbolicState, SymbolicModel };