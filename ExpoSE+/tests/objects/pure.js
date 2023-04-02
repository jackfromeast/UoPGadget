/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

var S$ = require('../../lib/S$');
var test = {};
Object.prototype.hello = S$.pureSymbol('undefinedProp_undef')
// var test = S$.pureSymbol('test')

if (test.hello === 'what') {
	throw 'Reachable';
}

test.hello = 'what';

if (test.hello != 'what') {
	throw 'Unreachable';
}
