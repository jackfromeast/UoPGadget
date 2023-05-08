/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

// TDDO: Make all of these into a class
class SymbolicHelper {

	static isWrapped(val) {
		return val instanceof WrappedValue;
	}

	static isSymbolic(val) {
		return !!ConcolicValue.getSymbolic(val);
	}

	static isPureSymbol(symbol){
		return symbol instanceof PureSymbol;
	}

	static updateSymbolic(val, val_s) {
		return ConcolicValue.setSymbolic(val, val_s);
	}

	static getConcrete(val) {
		return val instanceof WrappedValue ? val.getConcrete() : val;
	}

	static arrayType(val) {
		return val instanceof WrappedValue ? val.getArrayType() : undefined;
	}

	static getSymbolic(val) {
		return ConcolicValue.getSymbolic(val);
	}

	static asSymbolic(val) {
		return ConcolicValue.getSymbolic(val) || this.constantSymbol(val);
	}

	/**
	 * If val is a symbolic value then return val otherwise wrap it
	 * with a constant symbol inside a ConcolicValue.
	 *
	 * Used to turn a concrete value into a constant symbol for symbolic ops.
	 */
	static concolic(val) {
		return this.isSymbolic(val) ? val : new ConcolicValue(val, this.constantSymbol(val));
	}
	
	/**
     * Coerce either a concrete or ConcolicValue to a boolean
     * Concretizes the ConcolicValue if no coercion rule is known
     */
	static toBool(val) {
	
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

	static ToString(symbol) {
		if (typeof this.getConcrete(symbol) !== "string") {
			Log.log(`TODO: Concretizing non string input ${symbol} reduced to ${this.getConcrete(symbol)}`);
			return "" + this.getConcrete(symbol); 
		}
		return symbol;
	}

	static evalBinary(op, left, right){
		const BinaryJumpTable = {
			"==": function(left, right) { return left == right; },
			"===": function(left, right) { return left === right; },
		
			"!=": function(left, right) { return left != right; },
			"!==": function(left, right) { return left !== right; },
		
			"<": function(left, right) { return left < right; },
			">": function(left, right) { return left > right; },
		
			"<=": function(left, right) { return left <= right; },
			">=": function(left, right) { return left >= right; },
			
			"+": function(left, right) { return left + right; },
			"-": function(left, right) { return left - right; },
		
			"*": function(left, right) { return left * right; },
			"/": function(left, right) { return left / right; },
		
			"%": function(left, right) { return left % right; },
			
			">>": function(left, right) { return left >> right; },
			"<<": function(left, right) { return left << right; },
			">>>": function(left, right) { return left >>> right; },
		
			"&": function(left, right) { return left & right; },
			"&&": function(left, right) { return left && right; },
		
			"|": function(l, r) { return l | r; },
			"||": function(l, r) { return l || r; },
		
			"^": function(l, r) { return l ^ r; },
			"instanceof": function(l, r) { return l instanceof r; },
			"in": function(l, r) { return l in r; }
		};

		return BinaryJumpTable[op](left, right);
	}
	
	static evalUnary(op, left){
		const UnaryJumpTable = {
			"!": function(v) { return !v; },
			"~": function(v) { return ~v; },
			"-": function(v) { return -v; },
			"+": function(v) { return +v; },
			"typeof": function(v) { return typeof v; }
		};

		return UnaryJumpTable[op](left);
	}
}

export default SymbolicHelper;
