/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */



/**
 * Thrown by the underlying script when the run should immediately terminate without an error
 */

function NotAnErrorException() {}

NotAnErrorException.prototype.toString = function() {
	return "NotAnErrorException";
};

/**
 * This is place to decide whether an error is caused by undefined
 * 
 * @param {*} e 
 * @returns 
 */
function isUndefCausedError(e) {
	if (e instanceof TypeError || e instanceof Error) {
		const errorMessage = e.message.toLowerCase();

		// Error message patterns for different browsers
		const undefinedErrors = [
			"cannot read properties of undefined",
			"undefined is not an object",
			"is not a function"
		];

		// Checking against defined error patterns
		for (let err of undefinedErrors) {
			if (errorMessage.includes(err)) {
				return true;
			}
		}

		// Using a Regex to match 'plugin <any_string> not found'
		// For Jade/Pug uses addWith
		const pluginErrorRegex = /plugin '.*' not found/;
		if (pluginErrorRegex.test(errorMessage)) {
			return true;
		}
	}

	return false;
}


export default {NotAnErrorException, isUndefCausedError};
