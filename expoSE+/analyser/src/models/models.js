/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */


import NotAnErrorException from "../not-an-error-exception";
import { isNative } from "../utilities/IsNative";
import { ConcolicValue } from "../values/wrapped-values";

import Helpers from './helpers';
import MathModels from './math-models';
import ArrayModels from './array-models';
import StringModels from './string-models';
import FnModels from './fn-models';
import RegexModels from './regex-models';
import DOMModels from './dom-models';
import JSONModels from './json-models';
import Log from "../utilities/log";

function Model() {
	this._models = [];

	this.add = function(fn, mdl) {
		this._models.push({ 
			fn: fn,
			mdl: function() {
				return mdl.call(null, this, arguments);
			}
		});
	};

	this.get = function(fn) {
		const found = this._models.find(x => x.fn == fn);
		return found ? found.mdl : null;
	};
}

/**
 * Builds a set of function models bound to a given SymbolicState
 */
function BuildModels(state) {
	const ctx = state.ctx;
	const model = new Model();
	const helpers = Helpers(state, ctx, model);

	MathModels(state, ctx, model, helpers);
	StringModels(state, ctx, model, helpers);
	RegexModels(state, ctx, model, helpers);
	ArrayModels(state, ctx, model, helpers);
	FnModels(state, ctx, model, helpers);
    DOMModels(state, ctx, model, helpers);
    JSONModels(state, ctx, model, helpers);

	/**
	 * Models for methods on Object
	 */
	model.add(Object, function(base, args) {
		const concrete = state.concretizeCall(Object, base, args, false);
		let result = Object.apply(concrete.base, concrete.args);

		if (!(concrete.args[0] instanceof Object) && state.isSymbolic(args[0])) {
			result = new ConcolicValue(result, state.asSymbolic(args[0]));
		}

		return result;
	});

	/**
	 * Secret _expose hooks for symbols.js
	 */

	Object._expose = {};
	Object._expose.makeSymbolic = function(name, initial) { return state.createSymbolicValue(name, initial); };
	Object._expose.notAnError = function() { return NotAnErrorException; };
	Object._expose.pureSymbol = function(name) { return state.createPureSymbol(name); };
	Object._expose._isSymbolic = function(val) { return state.isSymbolic(val)?true:false};
	Object._expose.setupSymbols = function() { return state._setupUndefinedUT()};
	Object._expose.setupASymbol = function(name, val) { return state.setupUndefined(name, val)};
	Object._expose._foundGadgets = function() {
		Log.logSink("ACI: Arbitrary Content Interpolation");
		Log.logSink("Found a potential flow to the return value");
		state.foundGadgets();
	};
	Object._expose._foundGadgetsEval = function() {
		Log.logSink("Found a potential flow to the eval function!");
		state.foundGadgets();
	};

	return model;
}

export default BuildModels;
