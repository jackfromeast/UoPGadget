/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

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

function BuildUnaryJumpTable(state) {
	const ctx = state.ctx;
	return {
		"boolean":  {
			"+": function(val_s) {
				return ctx.mkIte(val_s, state.constantSymbol(1), state.constantSymbol(0));
			},
			"-": function(val_s) {
				return ctx.mkIte(val_s, state.constantSymbol(-1), state.constantSymbol(0));               
			},
			"!": function(val_s) {
				return ctx.mkNot(val_s);
			}
		},
		"number": {
			"!": function(val_s, val_c) {
				let bool_s = state.asSymbolic(state.toBool(new ConcolicValue(val_c, val_s)));
				return bool_s ? ctx.mkNot(bool_s) : undefined;
			},
			"+": function(val_s) {
				return val_s;
			},
			"-": function(val_s) {
				return ctx.mkUnaryMinus(val_s);
			}
		},
		"string": {
			"!": function(val_s, val_c) {
				let bool_s = state.asSymbolic(state.toBool(new ConcolicValue(val_c, val_s)));
				return bool_s ? ctx.mkNot(bool_s) : undefined;
			},
			"+": function(val_s) {
				return ctx.mkStrToInt(val_s);
			},
			"-": function(val_s) {
				return ctx.mkUnaryMinus(
					ctx.mkStrToInt(val_s)
				);
			}
		}
	}; 
}

class SymbolicState {
	constructor(input, undefinedUnderTest, inherit, sandbox) {
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
		this.MAX_PC_LENGTH = 30;

		this.input = input;
		this.inputSymbols = {}; 			/** symbols passing to the sovler, not including pureSymbol and symbolicObject, */
		this.wrapperSymbols = {}; 			/** pureSymbol and symbolicObject */
		this.pathCondition = [];
		this.parallelid = 0;				/** indicate path constraints that are parallel should be 
											view as one constraint in bound computation.
											e.g. this[concolicVar], then we may add constraints for all the property name to the var. these constraints are paralleled.
											*/
		this.undefinedPool = inherit.undefinedPool; /** current undefined pool */

		this.stats = new Stats();
		this.result = false; 				/** found the gadget or not */
		this.coverage = new Coverage(sandbox);
		this.errors = [];

		/** Helper Properties */
		this.withHelper = inherit.withHelper;	/** whether use helper properties */
		this.retHelper = false;				/** whether retrun the helper candidates */
		this.hasLoaded = false;				/** whether the polluted variable has been visited */
		this.helperCandidates = [];			/** patching undefined property candidates */
		
		/** Sandbox for Prototype */
		this.saved_prototype = {};
		
		/** for...in Properties load */
		this.forinIndex = 0;							/** used for forin key naming */
		this.forinLoad = inherit.forinLoad || false;	/** whether create symbolic key and value when encounter for loop*/
		this.symbolicKey = {};							/** save the created symbolic key */
		this.forinKeys= inherit.forinKeys || [];		/** help to initial the found/identified forin key, saved for next round*/
		this.forinKeyBound = inherit.forinKeyBound || 0;

		this._unaryJumpTable = BuildUnaryJumpTable(this);
		this._setupSmtFunctions();

		this.undefinedUnderTest = undefinedUnderTest;
	}

	/**
	 * we assme the input of the for...in loaded property has the following items
	 * this.input:{
	 * 	forin_{id}_key_undef_t: "string",
	 * 	forin_{id}_key_undef: "somekey",
	 * 	forin_{id}_undef_t: "atype",
	 * 	forin_{id}_undef: "someval"
	 * }
	 * 
	 * =>
	 * set forin_{id}_key_undef_t = "string" 
	 * 
	 * if somekey == "":
	 * 		// means we didn't find the constraints for the key, so we keep the key as it is and try again
	 * 		somekey = "forin_{id}",
	 * 		this.input: {
	 * 			forin_{id}_key_undef_t: "string",
	 * 			forin_{id}_key_undef: "somekey",
	 * 			somekey_undef_t: "atype",
	 * 			somekey_undef: "someval"
	 * 		},
	 * 		this.symbolicKey[`${somekey}`] = createPureSymbol(`${somekey}_key_undef`),
	 * 		Object.prototype[`${somekey}`] = createPureSymbol(`${somekey}_undef`)
	 * 		this.state.forinLoad = false
	 * 
	 * else:
	 * 		// if we found a concrete key name, then we will use the keyname to pollute the root prototype directly
	 * 		// we will remove the symbolic key as we no longer need it
	 *		this.input: {
	 * 			forin_{id}_key_undef_t: "string",
	 * 			forin_{id}_key_undef: "somekey",
	 * 			somekey_undef_t: "atype",
	 * 			somekey_undef: "someval",
	 * 			_bound: this.input._bound-2
	 * 		}
	 * 
	 * 		Object.prototype[`${somekey}`] = createPureSymbol(`${somekey}_undef`)
	 * 		this.state.forinLoad = false
	 * 		;
	 * 
	 */
	_setupForinKeyVal(){
		// Loop over all properties of this.input
		for (let key in this.input) {
			// Check if key matches the "forin_{id}_key_undef" pattern
			if (/^forin_\d+_key_undef$/.test(key)) {
				// Extract ID from the key
				let id = key.split("_")[1];
				let somekey = this.input[key];
		
				// Correct the key type to string
				this.input[`${key}_t`] = "string";
		
				// Modify key if there are no constraints
				if (somekey === "") {
					somekey = `forin_${id}`;
					this.input[key] = somekey;
				} else {
					// Modify key and value based on the existing constraints
					let existingTypeKey = `forin_${id}_undef_t`;
					let newTypeKey = `${somekey}_undef_t`;
					this.input[newTypeKey] = this.input[existingTypeKey];
					delete this.input[existingTypeKey];
					
		
					let existingValKey = `forin_${id}_undef`;
					let newValKey = `${somekey}_undef`;
					if(this.input[existingValKey]){
						this.input[newValKey] = this.input[existingValKey];
						delete this.input[existingValKey];
					}
					/**
					 * here we need to remove all the contraints in the _bound for the symbolic key
					 * usually the number is 2, but there might be more
					 */
					this.input._bound -= this.forinKeyBound;

					this.forinKeys.push(somekey);
				}
		
				if(somekey === `forin_${id}`){
					this.symbolicKey[`${somekey}`] = this.createPureSymbol(`${somekey}_key_undef`);
				}
				Object.prototype[`${somekey}`] = this.createPureSymbol(`${somekey}_undef`);
		
				// Update the state
				this.forinLoad = false;
			}
		}
	}


	setupUndefined(propName, propValue) {
		/**
		 * Even though getter helps us to track the first access of the property
		 * but it will cause the unexpected behavior of the property in its decentants
		 * since getter will also be inherited
		 * 
		 * if propName='line', propValue=1
		 * {}.line = 0 // will not assign new property named 'line' to {}
		 * Object.prototype.line = 0
		 */
		// Object.defineProperty(Object.prototype, propName, {
		// 	get() {
		// 		Log.log(`${propName} has been visited for the first time`);
		// 		global.J$.analysis.state.hasLoaded = true;

		// 		// After first access, replace getter with simple value
		// 		Object.defineProperty(Object.prototype, propName, {
		// 			value: propValue,
		// 			writable: true,
		// 			configurable: true,
		// 			enumerable: true
		// 		});

		// 		// Return the new value
		// 		return this[propName];
		// 	},
		// 	set(value) {
		// 		propValue = value;
		// 	},
		// 	configurable: true,
		// 	enumerable: true
		// });
		Object.prototype[propName] = propValue;
		if(!this.undefinedUnderTest.includes(propName)) {
			this.undefinedPool.push(propName);
		}
	}

	_setupUndefinedUT() {
		// pollute the prototype
		// Object.prototype[this.undefinedUnderTest[i]] = this.createPureSymbol(this.undefinedUnderTest[i]+"_undef");
		for (let i=0; i < this.undefinedUnderTest.length; i++) {
			const propName = this.undefinedUnderTest[i];

			// set helper property value to the fixed "true"
			if (this.withHelper && propName === this.withHelper){
				Object.prototype[propName] = "true";
			}else{
				const propValue = this.createPureSymbol(propName + "_undef");
				this.setupUndefined(propName, propValue);
			}
		}
		if(this.forinKeys.length > 0){
			for( let i=0; i < this.forinKeys.length; i++ ){
				const propName = this.forinKeys[i];
				const propValue = this.createPureSymbol(propName + "_undef");

				this.setupUndefined(propName, propValue);
			}
		}

		this._setupForinKeyVal();

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

	conditional(result) {

		const result_c = this.getConcrete(result),
			result_s = this.asSymbolic(result);

		if (result_c === true) {
			Log.logMid(`Concrete result was true, pushing ${result_s}`);
			this.pushCondition(result_s);
		} else if (result_c === false) {
			Log.logMid(`Concrete result was false, pushing not of ${result_s}`);
			this.pushCondition(this.ctx.mkNot(result_s));
		} else {
			Log.log("WARNING: Symbolic Conditional on non-bool, concretizing");
		}

		return result_c;
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

	/**
	 * Count the number of parallel path constraints before pcIndex
	 * 
	 * 
	 * @param {*} pc 
	 */
	_removeParallelPC(pcIndex) {
		let countMap = {};
		for(let i=0; i<=pcIndex; i++){
			if(this.pathCondition[i].parallelid !== -1){
				if(countMap[this.pathCondition[i].parallelid]){
					countMap[this.pathCondition[i].parallelid]++;
				}else{
					countMap[this.pathCondition[i].parallelid] = 1;
				}
			}
		}
		return (pcIndex+1) + Object.keys(countMap).length - Object.values(countMap).reduce((acc, value) => acc + value, 0);
	}

	_addInput(pc, solution, pcIndex, childInputs) {
		// solution._bound = this._removeParallelPC(pcIndex);
		solution._bound = pcIndex+1;
		childInputs.push({
			input: solution,
			pc: this._stringPC(pc),
			forkIid: this.pathCondition[pcIndex].forkIid
		});
	}

	_solvePC(childInputs, i, inputCallback, mkNot=true) {
		var newPC = this.pathCondition[i].ast;
		if(mkNot){ 
			newPC = this.ctx.mkNot(newPC);
		}
		const allChecks = this.pathCondition.slice(0, i).reduce((last, next) => last.concat(next.ast.checks), []).concat(newPC.checks);

		Log.logMid(`Checking if ${newPC.simplify().toString()} is satisfiable`);

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
			// Log.log(`${JSON.stringify(this.input)}`);
			throw `Bound ${this.input._bound} > ${this.pathCondition.length}, divergence has occured`;
		}

		// Path conditions before _bound should always holds true
		this._buildAsserts(Math.min(this.input._bound, this.pathCondition.length)).forEach(x => this.slv.assert(x));
		this.slv.push();

		for (let i = this.input._bound; i < this.pathCondition.length; i++) {

			//TODO: Make checks on expressions smarter
			if (!this.pathCondition[i].binder) {
				this._solvePC(childInputs, i, inputCallback);
			}

			Log.logMid(this.slv.toString());

			//Push the current thing we're looking at to the solver
			this.slv.assert(this.pathCondition[i].ast);
			this.slv.push();

			if(i>this.MAX_PC_LENGTH){
				break;
			}
		}


		/** jackfromeast
		 * 
		 * if bound > pathCondition.length, meaning there is error in the program
		 * if bound < pathCondition.length, meaning there are newly discovered path condition, and we already add them to the childInputs
		 * if bound == pathCondition.length, meaning there is no newly discovered path condition
		 * 
		 * but if there are newly discovered pure symbol, we should add them to the childInputs and explore the next round
		 * 
		 * update: replaced childInputs.length==0 lol
		 */
		if (this.pathCondition.length>0 && childInputs.length==0 && this._getPureSymbolNum()) {
			// solve the exisiting path condition(before the _bound)
			this._solvePC(childInputs, this.input._bound-1, inputCallback, false);
		}
		
		// solve done
		this.slv.reset();

		/**
		 * calculate the number of constraints in bounds related to the symbolic key 
		 */
		if(this.forinLoad && childInputs.length){
			for(let i=0; i<childInputs.length; i++){
				childInputs[i].forinKeyBound = this._getForinKeyBound(childInputs[i].input);
			}
		}


		/** jackfromeast
		 * For each pure symbol, summarize it
		 * Instead of pushing the constraints to the solver and get the pure symbol's type,
		 * We add them directly to the childInputs
		 * 
		 * If we have more than one pure symbol, we will make the combination of the pure symbols and add them to the childInputs
		 */
		if (this._getPureSymbolNum()) {
			let pureSymbolTypes = this.summaryPureSymbol();
			let childInputsWithTypes = [];

			if(childInputs.length == 0) {
				for (let i = 0; i < pureSymbolTypes.length; i++) {
					childInputsWithTypes.push({
						input: Object.assign(pureSymbolTypes[i], {_bound: Object.keys(pureSymbolTypes[i]).length}),
						pc: "",
						forkIid: this.coverage.last()
					});

				}
			}
			else{
				for (let i = 0; i < childInputs.length; i++) {
					for (let j = 0; j < pureSymbolTypes.length; j++) {
						let newItem = Object.assign({}, childInputs[i]);
						newItem.input = Object.assign({}, childInputs[i].input, pureSymbolTypes[j]);
						newItem.input._bound += this._getPureSymbolNum();
						childInputsWithTypes.push(newItem);
					}
				}
			}

			childInputs = childInputsWithTypes;
		}

		// add inherited info to the childInputs
		for (let i = 0; i < childInputs.length; i++) {
			childInputs[i].forinLoad = this.forinLoad;
			childInputs[i].forinKeys = this.forinKeys;
		}

		//Guarentee inputCallback is called at least once
		inputCallback(childInputs);
	}

	/**
	 * calculate the number of constraints in bounds related to the symbolic key
	 * e.g. 
	 * 		pc: "(= forin_0_key_undef_t \"string\"),(not (= forin_0_key_undef \"hiddenKey\")),(not (= forin_0_key_undef \"hiddenKey2\"))"
	 * 		and _bound = 3,
	 * 		then retrun 3
	 * 
	 * @param {*} input 
	 */
	_getForinKeyBound(input){
		let count = 0;
		for(let i=0; i<input._bound; i++){
			// since we only support one symbolic key
			if(this.pathCondition[i].ast.toString().includes("forin_0_key_undef")){
				count++;
			}
		}
		return count;
	}

	/**
	 * get the current pure symbol's num
	 */
	_getPureSymbolNum(){
		let num = 0;
		for(let symbol of Object.values(this.wrapperSymbols)){
			if(this.isPureSymbol(symbol)){
				num++;
			}
		}
		return num;
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

	// jackfromeast
	// used for making the input argument of a function concrete
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
		let pureType = this.createSymbolicValueType(name + "_t", "unknown");

		if (pureType.getConcrete() !== "unknown") {
			// in the following rounds,
			switch (pureType.getConcrete()) {
			case "string":
				this.assertEqual(pureType, this.concolic("string")); // add the first type constraint
				return this.createSymbolicValue(name, "seed_string");
			case "number":
				this.assertEqual(pureType, this.concolic("number"));
				return this.createSymbolicValue(name, 0);
			case "boolean":
				this.assertEqual(pureType, this.concolic("boolean"));
				return this.createSymbolicValue(name, false);
			case "object":{
				this.assertEqual(pureType, this.concolic("object"));
				let symbolObj = this.createSymbolicValue(name, {});
				
				// set symbolic variables for found elements of the current object in the Inputs
				for (let key of Object.keys(this.input)){
					let reg = new RegExp(`^${name}_elements_(\\w+)_t$`);

					if(reg.test(key)){
						let element_name = reg.exec(key)[1];
						let element_symbol = this.createPureSymbol(`${name}_elements_${element_name}`);

						if(element_symbol !== undefined){
							symbolObj.setField(this, element_name, element_symbol);
						}
					}
				}
				return symbolObj;
			}
			case "array_number":
				this.assertEqual(pureType, this.concolic("array_number"));
				return this.createSymbolicValue(name, [0]);
			case "array_string":
				this.assertEqual(pureType, this.concolic("array_string"));
				return this.createSymbolicValue(name, ["seed_string"]);
			case "array_bool":
				this.assertEqual(pureType, this.concolic("array_bool"));
				return this.createSymbolicValue(name, [false]);
			case "null":
				return null;
			/**
			 * meaning the symbolic value are set to undefined on purpose
			 * in the following round, this field will always be set to undefine which is intended
			 * other types will be explored from other partent branches
			 */
			case "undefined":
				this.assertEqual(pureType, this.concolic("undefined"));
				return undefined;
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
	 * generate possible combination of pure symbols's possible types
	 * we donot push these type constraints to the PC directly
	 * 
	 * add undefined types if pure symbol > 2
	 * this makes we can test the scenario that only one/a few of them appears in a single round
	 * 
	 * @returns [{pureSymbol1_t: 'String', pureSymbol2_t: 'Number'}, {...}]
	 */
	summaryPureSymbol(){
		let possibleTypes = {};
		for (let symbol of Object.values(this.wrapperSymbols)) {
			if (this.isPureSymbol(symbol)) {
				possibleTypes[symbol.getName()+"_t"] = symbol.getPossibleTypes();
			}
		}

		if(Object.keys(possibleTypes).length > 1){
			for (let key of Object.keys(possibleTypes)) {
				possibleTypes[key].push("undefined");
			}
		}

		const generateCombinations = (obj) => {
			let keys = Object.keys(obj);
			if (!keys.length) return [{}];
			let result = [];
			let rest = generateCombinations(
				Object.fromEntries(Object.entries(obj).slice(1))
			);
			for (let val of obj[keys[0]]) {
				for (let comb of rest) {
					// result.push({ [keys[0]]: val, ...comb }); donot support ... syntax
					let newObj = Object.assign({}, comb);
					newObj[keys[0]] = val;
					result.push(newObj);
				}
			}
			return result;
		};

		return generateCombinations(possibleTypes);
	}

	/**
	 * This function is used to create the symbol for symbolic variable's types.
	 * @param {*} name 
	 * @param {*} type 
	 * @returns 
	 */
	createSymbolicValueType(name, type) {

		let symbolic;
		let arrayType;

		// Use generated input if available
		if (name in this.input && this._typeCheck(name)) {
			type = this.input[name];
		} else {
			this.input[name] = type;
		}

		// if the concrete value is undefined, meaning it is a pure symbol, it shouldn't appear in the PC of this round
		this.stats.seen("Symbolic Primitives");
		const sort = this._getSort("astring");
		const symbol = this.ctx.mkStringSymbol(name);
		symbolic = this.ctx.mkConst(symbol, sort);
		

		// if the concrete value is unknown, meaning it is a pure symbol, it shouldn't appear in the PC of this round
		// we assume that all the symbolic values with "unknown" concrete value are pure symbols
		if (type !== "unknown"){
			this.inputSymbols[name] = symbolic;
		}

		return new ConcolicValue(type, symbolic, arrayType);
	}

	/**
	 * Assigning symbolic values to input variables
	 * 
	 * @param {*} name 
	 * @param {*} concrete 
	 * @returns 
	 */
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

		// Use generated input if available
		if (name in this.input && this._typeCheck(name)) {
			concrete = this.input[name];
		} else {
			this.input[name] = concrete;
		}

		if (concrete instanceof Array) {
			this.stats.seen("Symbolic Arrays");
			symbolic = this.ctx.mkArray(name, this._getSort(concrete[0]));
			this.pushCondition(this.ctx.mkGe(symbolic.getLength(), this.ctx.mkIntVal(0)), true);
			arrayType = typeof(concrete[0]);
		} else {
			// if the concrete value is undefined, meaning it is a pure symbol, it should appear in the PC of this round
			this.stats.seen("Symbolic Primitives");
			const sort = this._getSort(concrete);
			const symbol = this.ctx.mkStringSymbol(name);
			symbolic = this.ctx.mkConst(symbol, sort);
		}

		this.inputSymbols[name] = symbolic;

		Log.logMid(`Initializing fresh symbolic variable ${symbolic} using concrete value ${concrete}`);
		return new ConcolicValue(concrete, symbolic, arrayType);
	}

	_typeCheck(name) {
		if (name.endsWith("_t") && !["string", "boolean", "number", "object", "array_number", "array_string", "array_bool", "undefined"].includes(this.input[name])) {
			return false;
		} else {
			return true;
		}
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

	isWrapped(val) {
		return val instanceof WrappedValue;
	}

	isSymbolic(val) {
		return !!ConcolicValue.getSymbolic(val);
	}


	/** jackfromeast
	 * To avoid Maximum call stack size exceeded error, we only check the first level of the object
	 * @param {*} val : could be ConcolicValue; object or array that has concolic value inside; normal value
	 * @returns 
	 */
	isSymbolicDeep(val) {
		// Firstly check if the value is symbolic
		if(this.isSymbolic(val)){
			return true;
		}
		// The val is not symbolic directly, could be an object or an array that contains symbolic value
		else{
			// not a object or an array, return false
			if (typeof val !== "object" || val === null) {
				return false;
			}
			else{
				// Get the value's own property names
				let keys = Object.keys(val);
	
				// Loop over each property in the value
				for (let i = 0; i < keys.length; i++) {
					let prop = keys[i];
					let descriptor = Object.getOwnPropertyDescriptor(val, prop);
	
					// If the property is not a getter, check if it's symbolic
					if (!(descriptor && descriptor.get)) {
						if (this.isSymbolic(val[prop])) {
							return true;
						}
					}
				
				}

				return false;
			}
		}
	}
	
	

	/** jackfromeast
	 * check if the symbol is a pure symbol
	 */
	isPureSymbol(symbol){
		return symbol instanceof PureSymbol;
	}

	updateSymbolic(val, val_s) {
		return ConcolicValue.setSymbolic(val, val_s);
	}

	getConcrete(val) {
		return val instanceof WrappedValue ? val.getConcrete() : val;
	}

	arrayType(val) {
		return val instanceof WrappedValue ? val.getArrayType() : undefined;
	}

	getSymbolic(val) {
		return ConcolicValue.getSymbolic(val);
	}

	asSymbolic(val) {
		return ConcolicValue.getSymbolic(val) || this.constantSymbol(val);
	}

	_symbolicBinary(op, left_c, left_s, right_c, right_s) {
		this.stats.seen("Symbolic Binary");

		Log.logMid(`Symbolic Binary: ${stringify(arguments)}`);

		// restore the root prototype when entering the Z3's world
		this.savePrototype();

		let ret = undefined;

		switch (op) {
		case "===":
		case "==":
			ret = this.ctx.mkEq(left_s, right_s);
			break;
		case "!==":
		case "!=":
			ret = this.ctx.mkNot(this.ctx.mkEq(left_s, right_s));
			break;
		case "&&":
			ret = this.ctx.mkAnd(left_s, right_s);
			break;
		case "||":
			ret = this.ctx.mkOr(left_s, right_s);
			break;
		case ">":
			ret = this.ctx.mkGt(left_s, right_s);
			break;
		case ">=":
			ret = this.ctx.mkGe(left_s, right_s);
			break;
		case "<=":
			ret = this.ctx.mkLe(left_s, right_s);
			break;
		case "<":
			ret = this.ctx.mkLt(left_s, right_s);
			break;
		case "<<":
		case "<<<":
			left_s = this.ctx.mkRealToInt(left_s);
			right_s = this.ctx.mkRealToInt(right_s);
			ret = this.ctx.mkIntToReal(this.ctx.mkMul(left_s, this.ctx.mkPower(this.ctx.mkIntVal(2), right_s)));
			break;
		case ">>":
		case ">>>":
			left_s = this.ctx.mkRealToInt(left_s);
			right_s = this.ctx.mkRealToInt(right_s);
			ret = this.ctx.mkIntToReal(this.ctx.mkDiv(left_s, this.ctx.mkPower(this.ctx.mkIntVal(2), right_s)));
			break;
		case "+":
			ret = typeof left_c === "string" ? this.ctx.mkSeqConcat([left_s, right_s]) : this.ctx.mkAdd(left_s, right_s);
			break;
		case "-":
			ret = this.ctx.mkSub(left_s, right_s);
			break;
		case "*":
			ret = this.ctx.mkMul(left_s, right_s);
			break;
		case "/":
			ret = this.ctx.mkDiv(left_s, right_s);
			break;
		case "%":
			ret = this.ctx.mkMod(left_s, right_s);
			break;
		default:
			Log.log(`Symbolic execution does not support operand ${op}, concretizing.`);
			break;
		}

		this.restorePrototype();
		return ret;
	}

	/** 
   	* Symbolic binary operation, expects at least one values and an operator
   	*/
	binary(op, left, right) {
		// jackfromeast
		left = this.concolic(left);
		right = this.concolic(right);

		if (typeof this.getConcrete(left) === "string") {
			right = this.ToString(right);
		}

		const result_c = SymbolicHelper.evalBinary(op, this.getConcrete(left), this.getConcrete(right));
		const result_s = this._symbolicBinary(op, this.getConcrete(left), this.asSymbolic(left), this.getConcrete(right), this.asSymbolic(right));
		return typeof(result_s) !== undefined ? new ConcolicValue(result_c, result_s) : result_c;
	}

	/** jackfromeast
	 * What does this mean?
	 * Symbolic field lookup - currently only has support for symbolic arrays / strings
   	*/
	symbolicField(base_c, base_s, field_c, field_s) {
		this.stats.seen("Symbolic Field");

		this.savePrototype();
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
            
			let res = undefined;
			if (this.conditional(new ConcolicValue(field_c > -1 && field_c < base_c.length, withinBounds))) {
				res = base_s.getField(this.ctx.mkRealToInt(field_s));
			}
			this.restorePrototype();
			return res;
		}

		switch (field_c) {
		case "length": {
			if (base_s.getLength()) {
				this.restorePrototype();
				return base_s.getLength();
			} else {
				Log.log("No length field on symbolic value");
			}
			break;
		}
		default: {
			// Log.log("Unsupported symbolic field - concretizing " + base_c + " and field " + field_c);
			break;
		}

		}
		this.restorePrototype();
		return undefined;
	}

	/**
     * Coerce either a concrete or ConcolicValue to a boolean
     * Concretizes the ConcolicValue if no coercion rule is known
     */
	toBool(val) {
        
		if (this.isSymbolic(val)) {
			const val_type = typeof this.getConcrete(val);

			switch (val_type) {
			case "boolean":
				return val;
			case "number":
				return this.binary("!=", val, this.concolic(0));
			case "string":
				return this.binary("!=", val, this.concolic(""));
			}

			Log.log("WARNING: Concretizing coercion to boolean (toBool) due to unknown type");
		}

		return this.getConcrete(!!val);
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

	ToString(symbol) {

		if (typeof this.getConcrete(symbol) !== "string") {
			Log.log(`TODO: Concretizing non string input ${symbol} reduced to ${this.getConcrete(symbol)}`);
			return "" + this.getConcrete(symbol); 
		}

		return symbol;
	}

	/**
     * Perform a unary op on a ConcolicValue or a concrete value
     * Concretizes the ConcolicValue if we don't know how to do that action symbolically
     */
	unary(op, left) {
		const result_c = SymbolicHelper.evalUnary(op, this.getConcrete(left));
		const result_s = this.isSymbolic(left) ? this._symbolicUnary(op, this.getConcrete(left), this.asSymbolic(left)) : undefined;
		return result_s ? new ConcolicValue(result_c, result_s) : result_c;
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
     * If val is a symbolic value then return val otherwise wrap it
     * with a constant symbol inside a ConcolicValue.
     *
     * Used to turn a concrete value into a constant symbol for symbolic ops.
     */
	concolic(val) {
		return this.isSymbolic(val) ? val : new ConcolicValue(val, this.constantSymbol(val));
	}

	foundGadgets(){
		this.result = true;
	}

	/**
     * Assert left == right on the path condition
	 * 
	 * @param {boolean} push_constraints
     */
	assertEqual(left, right) {
		const equalityTest = this.binary("==", left, right);
		this.conditional(equalityTest);
		return this.getConcrete(equalityTest);
	}

	addHelperCandidate(prop) {
		let index = this.helperCandidates.indexOf(prop);
		if (index != -1){
			this.helperCandidates.splice(index, 1);
		}
		this.helperCandidates.unshift(prop);
	}

	/**
	 * FIXME: Whenever we try to call this.ctx.*, we need to save and restore the prototype
	 * 
	 */
	savePrototype(){
		this.saved_prototype = {};
		for (var key in Object.prototype) {
			this.saved_prototype[key] = Object.prototype[key];
			delete Object.prototype[key];
		}
	}

	restorePrototype(){
		for (var key in this.saved_prototype) {
			Object.prototype[key] = this.saved_prototype[key];
		}
	}
}

export default SymbolicState;