/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

import log from "../utilities/log";
import { WrappedValue } from "./wrapped-values";

class SymbolicObject extends WrappedValue {
    
    constructor(name) {
       	super({});

        this.__defineProperty("_name", name);
        this.__defineProperty("_core", this.getConcrete());
        this.__defineProperty("_set", {});
        this.__defineProperty("_lastIndex", 0);
    }

    __defineProperty(name, value){
        Object.defineProperty(this, name, {
            value: value,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }

    setField(state, offset, v) {
    	
    	state.stats.seen("Symbolic Object Field Overrides");

    	this._core[offset] = v;
    	this._set[offset] = true;
    }

    getField(state, offset) {

    	state.stats.seen("Symbolic Object Field Lookups");

        /**
         * lazy initialization of symbolic object fields except:
         * 1/ FIXME: reading object's built-in methods
         * 2/ the field is meant to be undefined(the field will be set as in the this._set[offset] = true;)
         */
    	if (!this._set[offset]) {
            // Can't use offset in name, if offset is a symbol is will crash
            // console.log("Creating pure symbol for offset " + offset);
    		// this._core[offset] = state.createPureSymbol(`${this._name}_elements_${offset}_${this._lastIndex++}`);
            this.setField(state, offset, state.createPureSymbol(`${this._name}_elements_${offset}`))
    	}

    	return this._core[offset];
    }

    delete(offset) {
    	this._set[offset] = false;
    	delete this._core[offset];
    }
}

export { SymbolicObject };
