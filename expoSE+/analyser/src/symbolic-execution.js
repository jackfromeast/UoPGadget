/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2014@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

// JALANGI DO NOT INSTRUMENT

/**
 * Looks like the Hook function provided by the jalangji2
 */

/*global window*/
/*global Element*/
/*global document*/

import { ConcolicValue } from "./values/wrapped-values";
import { SymbolicObject } from "./values/symbolic-object";
import ObjectHelper from "./utilities/object-helper";
import SymbolicState from "./symbolic-state";
import Log from "./utilities/log";
import Exception from "./error-exception";
import { isNative } from "./utilities/IsNative";
import ModelBuilder from "./models/models";
import External from "./external";
import {binaryTypeCoercion, unaryTypeCoercion} from "./type-coercion";
const fs = require("fs");

class SymbolicExecution {

	constructor(sandbox, initialInput, undefinedUnderTest, inherit, exitFn) {
		this._sandbox = sandbox;
		this.state = new SymbolicState(initialInput, undefinedUnderTest, inherit, this._sandbox);
		this.models = ModelBuilder(this.state);
		this._fileList = new Array();
		this._exitFn = exitFn;

		if (typeof window !== "undefined") {

			window._ExpoSE = this;

			setTimeout(() => {
				console.log("Finish timeout (callback)");
				this.finished();
				External.close();
			}, 1000 * 60 * 1);

			const storagePool = {};

			window.localStorage.setItem = function(key, val) {
				storagePool[key] = val;
			};

			window.localStorage.getItem = function(key) { 
				return storagePool[key];
			};

			console.log("Browser mode setup finished");

		} else { 
			const process = External.load("process");

			//Bind any uncaught exceptions to the uncaught exception handler
			process.on("uncaughtException", this._uncaughtException.bind(this));

			//Bind the exit handler to the exit callback supplied
			process.on("exit", this.finished.bind(this));
		}

	}

	finished() {
		this._exitFn(this.state, this.state.coverage);
	}

	/**
	 * Hook function for uncaught exceptions and throwed errors
	 * 
	 * check whether the exception is due to the unexpected loading of polluted value
	 * if it is, set this.retHelper to ture which will return current state.helperCandidates
	 * 
	 * @param {*} e: Exception
	 * @returns 
	 */
	_uncaughtException(e) {

		//Ignore NotAnErrorException
		if (e instanceof Exception.NotAnErrorException) {
			return;
		}

		if (Exception.isUndefCausedError(e)){
			Log.log(`Uncaught exception ${e}`);
			Log.log("Assume it is due to the unexpected loading of polluted value, decide to explore the helper candidates.");

			this.state.retHelper = true;

		}else{
			Log.log(`Uncaught exception ${e} Stack: ${e.stack ? e.stack : ""}`);
		}

		this.state.errors.push({
			error: "" + e,
			stack: e.stack
		});
	}

	report(sourceString) {

		if (sourceString && !this.state.isSymbolic(sourceString)) {
			if (sourceString.documentURI) {
				sourceString = "" + sourceString.documentURI;
			} else if (sourceString.baseURI) {
				sourceString = "" + sourceString.baseURI;
			} else if (sourceString && sourceString.toString) {
				let tsourceString = sourceString.toString();
				if (tsourceString.includes("Object]")) {
					sourceString = ObjectHelper.asString(sourceString);
				} else {
					sourceString = tsourceString;
				}
			} else {
				sourceString = ObjectHelper.asString(sourceString);
			}
		} else {
			sourceString = this.state.asSymbolic(sourceString).simplify();
		}

		console.log(`OUTPUT_LOAD_EVENT: !!!${this.state.inlineToSMTLib()}!!! !!!"${sourceString}"!!!`);
	}

	_reportFn(f, base, args) {
		if (typeof(window) !== "undefined") {
			if ((f.name == "appendChild" || f.name == "prependChild" || f.name == "insertBefore" || f.name == "replaceChild") && args[0] && (args[0].src || args[0].innerHTML.includes("src="))) {
				this.report(args[0].src);
				args[0].src = this.state.getConcrete(args[0].src);
			}
      
			if (f.name == "open" || f.name == "fetch") {
				this.report(args[1]);
			}
		}
	}

	/** jackfromeast
	 * symbolicCheckForEvalLikeFunctions
	 * @param {*} f 
	 * @param {*} args 
	 * @param {*} state 
	 * @returns 
	 */
	OldsymbolicCheckForEvalLikeFunctions(f, args, state){
		switch(f.name){
		case "eval":
			return state.isSymbolic(args[0]);
		case "Function":
			return Array.from(args).some(arg => state.isSymbolic(arg));
		case "execScript":
			return state.isSymbolic(args[0]);
		case "executeJavaScript":
			return state.isSymbolic(args[0]);
		case "execCommand":
			return state.isSymbolic(args[0]);
		case "setTimeout":
			return state.isSymbolic(args[0]);
		case "setInterval":
			return state.isSymbolic(args[0]);
		case "setImmediate":
			return state.isSymbolic(args[0]);
		default:
			return false;
		}
	}

	symbolicCheckForEvalLikeFunctions(f, args, state){
		if(f===eval){
			return state.isSymbolic(args[0]);
		} else if (f === Function) {
			return Array.from(args).some(arg => state.isSymbolic(arg));
		} else if(f===setTimeout){
			return state.isSymbolic(args[0]);
		}else if(f===setInterval){
			return state.isSymbolic(args[0]);
		}else if(f===setImmediate){
			return state.isSymbolic(args[0]);
		}else{
			return false;
		}
	}

	/** jackfromeast
	 * need to check whether this is correct
	 * @param {*} f 
	 * @param {*} args 
	 * @param {*} state 
	 * @returns 
	 */
	symbolicCheckForFileAccessFunction(f, args, state) {
		if(f===fs.readFile || f===fs.readFileSync){
			return state.isSymbolic(args[0]);
		}else if(f===fs.writeFile || f===fs.writeFileSync){
			return (state.isSymbolic(args[0]) || state.isSymbolic(args[1]));
		}else{
			return false;
		}
		
	}

	symbolicCheckForSinkFunctions(f, args, state) {
		return this.symbolicCheckForEvalLikeFunctions(f, args, state) ||
				this.symbolicCheckForFileAccessFunction(f, args, state);
	}

	invokeFunPre(iid, f, base, args, _isConstructor, _isMethod) {
		this.state.coverage.touch(iid);
		Log.logHigh(`Execute function ${ObjectHelper.asString(f)} at ${this._location(iid)}`);

		/** jackfromeast
 		 * add symbolic check for eval-like functions
		 * check whether the argument of eval-like functions are symbolic, which usually means that our undefined property has flows to the sink
		 */
		if(f && this.symbolicCheckForSinkFunctions(f, args, this.state)){
			Log.logSink("Found a potential flow to the sink: " + f.name + " at" + this._location(iid).toString());
			Log.logSink("Current input: " + JSON.stringify(this.state.input));
			Log.logSink("Current state: " + this.state.pathCondition.map(x => x.ast));
			this.state.foundGadgets();
		}

		f = this.state.getConcrete(f);
		this._reportFn(f, base, args);

		const functionName = f ? f.name : "undefined";

		const fn_model = this.models.get(f);
		Log.logMid(fn_model ? ("Exec Model: " + functionName + " " + (new Error()).stack) : functionName + " unmodeled");

		/** jackfromeast
		 * 
		 * If non of the base and arguments are symbolic, we do not need to call the model function
		 * base is the object that the function is called on like this.buf.join()
		 * If non of the arguments  are symbolic, we do not need to call the model function
		 * Probably there are several cases that modeled function are needed, but currently I just ignore them
		 */
		if(!this.state.isSymbolicDeep(base) && !Object.values(args).some(x => this.state.isSymbolicDeep(x)||x instanceof SymbolicObject)){
			return {
				f: f,
				base: base,
				args: args,
				skip: false};
		}
		
		/**
		 * Concretize the function if it is native and we do not have a custom model for it
		 * TODO: We force concretization on toString functions to avoid recursive call from the lookup into this.models
		 * TODO: This is caused by getField(obj) calling obj.toString()
		 * TODO: A better solution to this needs to be found
		 */
		if (!fn_model && isNative(f)) {
			const concretized = this.state.concretizeCall(f, base, args);
			base = concretized.base;
			args = concretized.args;
			if (concretized.count > 0) {
				this.state.stats.set("Unmodeled Function Call", functionName);
			}
		} else if (fn_model) {
			this.state.stats.set("Modeled Function Call", functionName);
		} else {
			this.state.stats.seen("General Function Call");
		}

		/**
		 * End of conc
		 */
		return {
			f: fn_model || f,
			base: base,
			args: args,
			skip: false
		};
	}

	/**
	 * Called after a function completes execution
	 */
	invokeFun(iid, f, base, args, result, _isConstructor, _isMethod) {
		this.state.coverage.touch(iid);
		Log.logHigh(`Exit function (${ObjectHelper.asString(f)}) near ${this._location(iid)}`);
		return { result: result };
	}

	literal(iid, val, _hasGetterSetter) {
		this.state.coverage.touch(iid);
		return { result: val };
	}

	forinObject(iid, val) {
		this.state.coverage.touch(iid);
		
		// currently, we only support one symbolic key-value pair
		if(this.state.forinLoad && !this.state.forinIndex){
			// add both symbolic key and value to prototype, which will be looped over
			let key = `forin_${this.state.forinIndex++}`;

			let keyType = this.state.createSymbolicValueType(key+"_key_undef_t", "string");
			this.state.assertEqual(keyType, this.state.concolic("string"));
			this.state.input._bound += 1;

			this.state.symbolicKey[key] = this.state.createSymbolicValue(key+"_key_undef", key);

			// setup the corresponding symbolic value in the root prototype
			let keyValue = this.state.createPureSymbol(key+"_undef");
			this.state.setupUndefined(key, keyValue);
		}

		// jackfromeast
		// if the object is symbolic, we will enumerate its concrete properties
		if(this.state.isSymbolic(val)){
			return { result: this.state.getConcrete(val) };
		}
		return { result: val };
	}

	_location(iid) {
		return this._sandbox.iidToLocation(this._sandbox.getGlobalIID(iid));
	}

	endExpression(iid) {
		this.state.coverage.touch(iid);
	}

	declare(iid, name, val, _isArgument, _argumentIndex, _isCatchParam) {
		this.state.coverage.touch(iid);
		Log.logHigh(`decl ${name} at ${this._location(iid)}`);
		return {
			result: val
		};
	}

	_filterPath(path){
		// filter out the path that contains the following strings

		if(path.includes("acorn") || path.includes("babel") || path.includes("mime")){
			return true;
		}
		else{
			return false;
		}
	}

	/**
	 * Filter out the property by its name
	 * @param {*} prop 
	 */
	_filterProp(prop){
		// numberic like property name will be filtered out
		// '1', '2', '3'
		if(!isNaN(parseFloat(prop)) && isFinite(prop)){
			return true;
		} else if(prop === "undefined"){
			return true;
		} else if(prop.includes("Symbol(")){
			return true;
		}
		return false;
	}

	getFieldPre(iid, base, offset, _isComputed, _isOpAssign, _isMethodCall) {
		this.state.coverage.touch(iid);

		// check undefined properties
		// our polluted undefined properties will also be assessed in symbols.js, exclude them
		if (base && !this.state.isSymbolic(offset) && !offset.toString().endsWith("_undef")) {
			if(base[offset] === undefined && !this._filterPath(this._location(iid).toString()) 
				&& !this._filterProp(offset.toString())){

				// if this.state.undefinedPool does not contain this offset, add it to the pool
				if(!this.state.undefinedPool.includes(offset.toString())){
					Log.logUndefined("Found undefined property: " + offset.toString() + " at " + this._location(iid).toString());
					this.state.undefinedPool.push(offset.toString());
				}

				// for the helper candidates
				// we collect all the undefined property lookups after the first time of polluted value loaded
				if(this.state.hasLoaded){
					this.state.addHelperCandidate(offset.toString());
					// this.state.helperCandidates.push(offset.toString());
				} 
			}
		}

		/**
		 * log the first access to the polluted value in root prototype
		 * no symbolic value should be loaded yet
		 * 
		 * FIXME: test this logic
		 */
		if (!this.state.hasLoaded){
			try{
				if(this.state.undefinedUnderTest.includes(offset) && !base.hasOwnProperty(offset)){
					this.state.hasLoaded = true;
				}
			}
			catch(e){
				if(this.state.isSymbolic(offset) || this.state.isSymbolic(base)){
					throw "Symbolic value shouldn't load before this.state.hasLoaded = false";
				}
			}
		}

		// For the pure symbol
		// However, the method call also triggers getFieldPre, so it does not nessarily mean that the base is a object
		if (this.state.isPureSymbol(base)){
			base.addType("method", "getField", undefined, offset);
		}

		return {
			base: base,
			offset: offset,
			skip: this.state.isWrapped(base) || this.state.isWrapped(offset)
		};
	}

	_getFieldSymbolicOffset(base, offset) {
		offset = this.state.ToString(offset);   
		const base_c = this.state.getConcrete(base);

		// these are parallel constraints
		for (const idx in base_c) {
			const is_this_idx = this.state.binary("==", idx, offset);
			this.state.conditional(this.state.asSymbolic(is_this_idx));
		}
		// this.state.parallelid++;
	}

	/** 
     * GetField will be skipped if the base or offset is not wrapped (SymbolicObject or isSymbolic)
     */
	getField(iid, base, offset, _val, _isComputed, _isOpAssign, _isMethodCall) {

		//TODO: This is a horrible hacky way of making certain request attributes symbolic
		//TODO: Fix this!
		if (typeof(window) != "undefined") {
            
			if (base == window.navigator) {
				if (offset == "userAgent") {
					return { result: Object._expose.makeSymbolic(offset, window.navigator.userAgent) };
				}
			}

			if (base == window.document) {
				if (offset == "cookie") {
					return { result: Object._expose.makeSymbolic(offset, "") };
				}            

				if (offset == "lastModified") {
					return { result: Object._expose.makeSymbolic(offset, window.document.lastModified) };
				}

				if (offset == "referrer") {
					return { result: Object._expose.makeSymbolic(offset, window.document.referer) };
				} 
			}

			if (base == window.location) {
				if (offset == "origin") {
					return { result: Object._expose.makeSymbolic(offset, window.location.origin) };
				}
				if (offset == "host") {
					return { result: Object._expose.makeSymbolic(offset, window.location.host) };
				}
			}

		}

		Log.logHigh(`Get field ${ObjectHelper.asString(base)}[${ObjectHelper.asString(offset)}] at ${this._location(iid)}`);

		//If dealing with a SymbolicObject then concretize the offset and defer to SymbolicObject.getField
		if (base instanceof SymbolicObject) {
			Log.logMid("Potential loss of precision, cocretize offset on SymbolicObject field lookups");
			return {
				result: base.getField(this.state, this.state.getConcrete(offset))
			};
		}

		//If we are evaluating a symbolic string offset on a concrete base then enumerate all fields
		//Then return the concrete lookup
		if (!this.state.isSymbolic(base) && 
             this.state.isSymbolic(offset) &&
             typeof this.state.getConcrete(offset) == "string" &&
			!/^forin_\d+$/.test(this.state.getConcrete(offset))) {
			this._getFieldSymbolicOffset(base, offset);
			return {
				result: base[this.state.getConcrete(offset)]
			};
		}

		//If the array is a symbolic int and the base is a concrete array then enumerate all the indices
		if (!this.state.isSymbolic(base) &&
             this.state.isSymbolic(offset) &&
             this.state.getConcrete(base) instanceof Array &&
             typeof this.state.getConcrete(offset) == "number") {

			for (let i = 0; i < this.state.getConcrete(base).length; i++) {
				this.state.assertEqual(i, offset); 
			}

			return {
				result: base[this.state.getConcrete(offset)]
			};
		}

		//Otherwise defer to symbolicField
		const result_s = this.state.isSymbolic(base) ? this.state.symbolicField(this.state.getConcrete(base), this.state.asSymbolic(base), this.state.getConcrete(offset), this.state.asSymbolic(offset)) : undefined;
		const result_c = this.state.getConcrete(base)[this.state.getConcrete(offset)];

		return {
			result: result_s ? new ConcolicValue(result_c, result_s) : result_c
		};
	}

	putFieldPre(iid, base, offset, val, _isComputed, _isOpAssign) {
		this.state.coverage.touch(iid);
		Log.logHigh(`Put field ${ObjectHelper.asString(base)}[${ObjectHelper.asString(offset)}] at ${this._location(iid)}`);

		// for the pure symbol
		if (this.state.isPureSymbol(base)){
			base.addType("method", "putField");
		}

		return {
			base: base,
			offset: offset,
			val: val,
			skip: this.state.isWrapped(base) || this.state.isWrapped(offset)
		};
	}

	putField(iid, base, offset, val, _isComputed, _isOpAssign) {

		Log.logHigh(`PutField ${base.toString()} at ${offset}`);

		if (base instanceof SymbolicObject) {
			return {
				result: base.setField(this.state, this.state.getConcrete(offset), val)
			};
		}

		//TODO: Enumerate if symbolic offset and concrete input

		if (this.state.isSymbolic(base) && this.state.getConcrete(base) instanceof Array && this.state.arrayType(base) == typeof(val)) {
			Log.log("TODO: Check that setField is homogonous");

			//SetField produce a new array
			//Therefore the symbolic portion of base needs to be updated
			const base_s = this.state.asSymbolic(base).setField(
				this.state.asSymbolic(offset),
				this.state.asSymbolic(val));

			this.state.getConcrete(base)[this.state.getConcrete(offset)] = val; 
			this.state.updateSymbolic(base, base_s);

			if (typeof(document) !== "undefined" && this.state.getConcrete(base) instanceof Element && document.contains(this.state.getConcrete(base)) && offset === "innerHTML") {
				const tv = this.state.getConcrete(val);
				if (typeof(tv) === "string" && tv.includes("src=")) {
					const sourceString = this.state.asSymbolic(val).toString();
					this.report(sourceString);
				}
			}

			return {
				result: val
			};
		}

		this.state.getConcrete(base)[this.state.getConcrete(offset)] = val;

		return { result: val };
	}

	read(iid, name, val, _isGlobal, _isScriptLocal) {
		this.state.coverage.touch(iid);
		Log.logHigh(`Read ${name} at ${this._location(iid)}`);
		return { result: val };
	}

	write(iid, name, val, _lhs, _isGlobal, _isScriptLocal) {
		this.state.coverage.touch(iid);
		Log.logHigh(`Write ${name} at ${this._location(iid)}`);

		// convert the key to a symbolic key
		if (Object.keys(this.state.symbolicKey).includes(val)){
			val = this.state.symbolicKey[val];
		}

		return { result: val };
	}

	_return(iid, val) {
		this.state.coverage.touch(iid);
		return { result: val };
	}

	_throw(iid, val) {
		this.state.coverage.touch(iid);
		return { result: val };
	}

	_with(iid, val) {
		this.state.coverage.touch(iid);
		Log.logHigh("With {val}");
		return { result: val };
	}

	functionEnter(iid, f, _dis, _args) {
		this.state.coverage.touch(iid);
		Log.logHigh(`Entering ${ObjectHelper.asString(f)} near ${this._location(iid)}`);
	}

	functionExit(iid, returnVal, wrappedExceptionVal) {
		this.state.coverage.touch(iid);
		Log.logHigh(`Exiting function ${this._location(iid)}`);
		return {
			returnVal: returnVal,
			wrappedExceptionVal: wrappedExceptionVal,
			isBacktrack: false
		};
	}

	_scriptDepth() {
		return this._fileList.length;
	}

	_addScript(fd) {
		this._fileList.push(fd);
	}

	_removeScript() {
		return this._fileList.pop();
	}

	scriptEnter(iid, instrumentedFileName, originalFileName) {
		//this.state.coverage.touch(iid);

		const enterString = `====== ENTERING SCRIPT ${originalFileName} depth ${this._scriptDepth()} ======`;

		if (this._scriptDepth() == 0) {
			Log.log(enterString);
		} else {
			Log.logMid(enterString);
		}

		this._addScript(originalFileName);
	}

	scriptExit(iid, wrappedExceptionVal) {
		//this.state.coverage.touch(iid);
		
		const originalFileName = this._removeScript();
		const exitString = `====== EXITING SCRIPT ${originalFileName} depth ${this._scriptDepth()} ======`;

		if (this._scriptDepth() > 0) {
			Log.logMid(exitString);
		} else {
			Log.log(exitString);
		}

		return {
			wrappedExceptionVal: wrappedExceptionVal,
			isBacktrack: false
		};
	}

	binaryPre(iid, op, left, right, _isOpAssign, _isSwitchCaseComparison, _isComputed) {

		// For the pure symbol
		if(this.state.isPureSymbol(left)||this.state.isPureSymbol(right)){
			if(this.state.isPureSymbol(left) && !this.state.isWrapped(right)){
				left.addType("binary", op, typeof(right));
			}else if(!this.state.isWrapped(left) && this.state.isPureSymbol(right)){
				right.addType("binary", op, typeof(left));
			}
		}

		// Type Coercion
		if (this.state.isSymbolic(left) || this.state.isSymbolic(right)) {
			let res = binaryTypeCoercion(op, left, right);
			left = res.op1;
			right = res.op2;
		}

		// in operator for undefined property
		if (op === "in" && !this.state.isSymbolic(left) && !this.state.isSymbolic(right)) {
			if (right[left]===undefined && !(left in right) &&
				!this._filterPath(this._location(iid).toString()) &&
				!this._filterProp(left.toString())) {

				// if this.state.undefinedPool does not contain this offset, add it to the pool
				if(!this.state.undefinedPool.includes(left.toString())){
					Log.logUndefined("Found undefined property through in operator: " + left.toString() + " at " + this._location(iid).toString());
					this.state.undefinedPool.push(left.toString());
				}
			}
		}
		
 
		// Don't do symbolic logic if the symbolic values are diff types
		// Concretise instead
		if (this.state.isWrapped(left) || this.state.isWrapped(right)) {
 
			const left_c  = this.state.getConcrete(left);
			const right_c = this.state.getConcrete(right);

			//We also consider boxed primitives to be primitive
			const is_primative = typeof(left_c) != "object" || (left_c instanceof Number || left_c instanceof String || left_c instanceof Boolean);
			const is_null = left_c === undefined || right_c === undefined || left_c === null || right_c === null;
			const is_real = typeof(left_c) == "number" ? (Number.isFinite(left_c) && Number.isFinite(right_c)) : true;

			//TODO: Work out how to check that boxed values are the same type
			const is_same_type = typeof(left_c) === typeof(right_c) || (!is_null && left_c.valueOf() === right_c.valueOf());

			if (!is_same_type || !is_primative || is_null || !is_real) {
				Log.log(`Concretizing binary ${op} on operands of differing types. Type coercion not yet implemented symbolically. (${ObjectHelper.asString(left_c)}, ${ObjectHelper.asString(right_c)}) (${typeof left_c}, ${typeof right_c})`);
				left = left_c;
				right = right_c;
			} else {
				Log.logHigh("Not concretizing " + op + " " + left + " " + right + " " + typeof left_c + " " + typeof right_c);
			}
		}

		// Don't evaluate natively when args are symbolic
		return {
			op: op,
			left: left,
			right: right,
			skip: this.state.isWrapped(left) || this.state.isWrapped(right)
		};
	}

	binary(iid, op, left, right, result_c, _isOpAssign, _isSwitchCaseComparison, _isComputed) {
		this.state.coverage.touch(iid);

		Log.logHigh("Op " + op + " left " + ObjectHelper.asString(left) + " right " + ObjectHelper.asString(right) + " result_c " + ObjectHelper.asString(result_c) + " at " + this._location(iid));

		let result;

		if (this.state.isSymbolic(left) || this.state.isSymbolic(right)) {
			result = this.state.binary(op, left, right);
		} else {
			result = result_c;
		}

		return {
			result: result
		};
	}

	unaryPre(iid, op, left) {
		
		// For the pure symbol
		if(this.state.isPureSymbol(left)){
			left.addType("unary", op);
		}

		// Type Coercion
		if (this.state.isSymbolic(left)) {
			left = unaryTypeCoercion(op, left);
		}

		// Don't evaluate natively when args are symbolic
		return {
			op: op,
			left: left,
			skip: this.state.isWrapped(left)
		};
	}

	unary(iid, op, left, result_c) {
		this.state.coverage.touch(iid);

		Log.logHigh("Unary " + op + " left " + ObjectHelper.asString(left) + " result " + ObjectHelper.asString(result_c)); 

		return {
			result: this.state.unary(op, left)
		};
	}
	
	/**
	 * This callback is called after a condition check before branching. Branching can happen in various statements
     * including if-then-else, switch-case, while, for, ||, &&, ?:.
	 * 
	 * Among them, the return value of if-then-else, switch-case, while, for is in boolean type.
	 * The return value of || and && could be the value itself
	 */
	conditional(iid, result) {
		this.state.coverage.touch_cnd(iid, this.state.getConcrete(result)); 
		Log.logHigh(`Evaluating conditional ${ObjectHelper.asString(result)}`);

		if (this.state.isSymbolic(result)) {
			Log.logMid(`Evaluating symbolic condition ${this.state.asSymbolic(result)} at ${this._location(iid)}`);
			this.state.conditional(this.state.toBool(result));
		}

		// To handle chained || and && operators
		// return J$.C(left): boolean, left: any type (including symbolic variable)
		return [{ result: this.state.getConcrete(result) }, result];
	}

	instrumentCodePre(iid, code) {
		return { code: code, skip: false };
	}

	instrumentCode(iid, code, _newAst) {
		return { result: code };
	}

	/*runInstrumentedFunctionBody(iid) {}*/
	onReady(cb) { cb(); }
}

export default SymbolicExecution;
