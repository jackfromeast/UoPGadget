///<reference path='../imports.d.ts'/>
"use strict";
var RuntimeUtils = require('../runtime/RuntimeUtils');
/**
 * ExpressionTokenizer
 */
var ExpressionTokenizer = (function () {
    /**
     * Creates a new ExpressionTokenizer.
     */
    function ExpressionTokenizer(stringReader) {
        this.stringReader = stringReader;
        this.eof = false;
        this.end = false;
        this.stringOffset = 0;
    }
    //static tokenizeString(string: string) {
    //	return tokenizeStringReader(new StringReader.StringReader(string));
    //}
    //
    //static tokenizeStringReader(stringReader: StringReader.StringReader) {
    //	return new ExpressionTokenizer(stringReader).tokenizeAll();
    //}
    /**
     * Return a list of tokens.
     *
     * @return list of tokenized tokens.
     */
    ExpressionTokenizer.prototype.tokenizeAll = function () {
        var tokens = [];
        while (this.hasMore()) {
            var token = this.readNext();
            if (token.type == 'eof')
                break;
            //console.log(token);
            //if (token == null) break;
            tokens.push(token);
        }
        return tokens;
    };
    /**
     *
     */
    ExpressionTokenizer.prototype.hasMore = function () {
        if (this.end)
            return false;
        //console.log(this.stringReader);
        //console.log(this.stringReader.hasMore());
        //console.log('[' + this.stringReader.peekChars(100) + ']');
        //console.log(this.stringReader.findRegexp(/^(\s*$|\-?[%\}]\})/));
        return this.stringReader.hasMore() && (this.stringReader.findRegexp(/^(\s*$|\-?[%\}]\})/).position != 0);
        //try {
        //	return this.eof;
        //} finally {
        //	if (this.stringReader.hasMore() && (this.stringReader.findRegexp(/^(\s*$|\-?[%\}]\})/).position != 0)) this.eof = true;
        //}
    };
    ExpressionTokenizer.prototype.emitToken = function (type, rawValue, value) {
        if (value === undefined)
            value = rawValue;
        //console.log("emitToken('" + type + "', '" + value + "')");
        return {
            type: type,
            value: value,
            rawValue: rawValue,
            stringOffset: this.stringOffset
        };
    };
    /**
     *
     */
    ExpressionTokenizer.prototype.readNext = function () {
        //this.end = false;
        while (!this.end && this.stringReader.hasMore()) {
            if (this.stringReader.findRegexp(/^\-?[%\}]\}/).position == 0) {
                this.end = true;
                continue;
            }
            this.stringOffset = this.stringReader.getOffset();
            var currentChar = this.stringReader.peekChars(1);
            //var token;
            //console.log(currentChar);
            switch (currentChar) {
                // Spaces: ignore.
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                case '\v':
                    this.stringReader.skipChars(1);
                    break;
                // String:
                case '\'':
                case '"':
                    //throw(new Error("Strings not implemented"));
                    var result = this.stringReader.findRegexp(/^(["'])(?:(?=(\\?))\2.)*?\1/);
                    if (result.position !== 0)
                        throw (new Error("Invalid string"));
                    var value = this.stringReader.readChars(result.length);
                    try {
                        if (value.charAt(0) == "'") {
                            // @TODO: fix ' escape characters
                            return this.emitToken('string', value, value.substr(1, value.length - 2));
                        }
                        else {
                            return this.emitToken('string', value, JSON.parse(value));
                        }
                    }
                    catch (e) {
                        throw (new Error("Can't parse [" + value + "]"));
                    }
                default:
                    // Numbers
                    if (currentChar.match(/^\d$/)) {
                        var result = this.stringReader.findRegexp(/^(0b[0-1]+|0x[0-9A-Fa-f]+|0[0-7]*|[1-9]\d*(\.\d+)?)/);
                        if (result.position !== 0)
                            throw (new Error("Invalid numeric"));
                        var value = this.stringReader.readChars(result.length);
                        return this.emitToken('number', value, RuntimeUtils.interpretNumber(value));
                    }
                    else {
                        var operatorIndex = -1;
                        var _parts;
                        var currentChars = this.stringReader.peekChars(5);
                        // Found a bit operator
                        if (_parts = currentChars.match(/^(b-and|b-or|b-xor)/)) {
                            var operator = _parts[0];
                            try {
                                return this.emitToken('operator', operator);
                            }
                            finally {
                                this.stringReader.skipChars(operator.length);
                            }
                        }
                        else if (-1 != (operatorIndex = ExpressionTokenizer.operators3.indexOf(currentChars.substr(0, 3)))) {
                            try {
                                return this.emitToken('operator', currentChars.substr(0, 3));
                            }
                            finally {
                                this.stringReader.skipChars(3);
                            }
                        }
                        else if (-1 != (operatorIndex = ExpressionTokenizer.operators2.indexOf(currentChars.substr(0, 2)))) {
                            try {
                                return this.emitToken('operator', currentChars.substr(0, 2));
                            }
                            finally {
                                this.stringReader.skipChars(2);
                            }
                        }
                        else if (-1 != (operatorIndex = ExpressionTokenizer.operators1.indexOf(currentChar))) {
                            try {
                                return this.emitToken('operator', currentChar);
                            }
                            finally {
                                this.stringReader.skipChars(1);
                            }
                        }
                        else if (currentChar.match(/^[a-z_\$]$/i)) {
                            var result = this.stringReader.findRegexp(/^[a-z_\$]\w*/i);
                            if (result.position !== 0)
                                throw (new Error("Assertion failed! Not expected!"));
                            var value = this.stringReader.readChars(result.length);
                            return this.emitToken('id', value);
                        }
                        else {
                            this.stringReader.skipChars(1);
                            throw (new Error("Unknown token '" + currentChar + "' in '" + this.stringReader.peekChars(10) + "'"));
                        }
                    }
            }
        }
        //console.log(tokens);
        return this.emitToken('eof', null);
        //return null;
    };
    ExpressionTokenizer.operators3 = [
        '===', '!=='
    ];
    ExpressionTokenizer.operators2 = [
        '++', '--', '&&', '||', '..', '//', '**',
        '==', '>=', '<=', '!=', '?:'
    ];
    ExpressionTokenizer.operators1 = [
        '+', '-', '*', '/', '%', '|', '(', ')',
        '{', '}', '[', ']', '.', ':', ',', '<', '>', '?', '=', '~'
    ];
    return ExpressionTokenizer;
}());
exports.ExpressionTokenizer = ExpressionTokenizer;
