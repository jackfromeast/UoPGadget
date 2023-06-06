/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

var S$ = require('S$');
var x = S$.pureSymbol('X');

if (x.layer1_0 == "fixer") {
	if(x.layer1_1){
		let y = x.layer1_1
		if(y.length === 3){
			throw 'Reachable';
		}
	}
}