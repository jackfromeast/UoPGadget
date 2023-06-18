/**
 * Test case for copyProp function
 * 
 * Description:
 * 1/ for in operation on symbolic object instance: need to create two new symbolic val as the key and value, the key should fixed to string type, the value should be any type.
 * 
 * 2/ getFiled and setField operation on symbolic object instance should works well to make the symbolic val flows from fromObj to toObj.
 * 
 * Source: doT/lib/index.js::copy
 * Author: jackfromeast
 */

var PASS = false;
var S$ = require('S$');

var fromobj = S$.pureSymbol('fromObj_undef');

// from doT
function copy(o, to) {
	to = to || {};
	for (var property in o) {
		to[property] = o[property];
	}
	return to;
}

toObj = copy(fromobj, {varname: "it"});

if(Object._expose._isSymbolic(toObj.varname)){
    PASS = true;
}


if(PASS){
    throw "[+] TEST PASS!";
}else{
    throw "[-] TEST FAIL!";
}
