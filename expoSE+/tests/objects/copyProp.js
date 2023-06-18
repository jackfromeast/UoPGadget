/**
 * Test case for copyProp function
 * 
 * Description:
 * 1/ for in operation on symbolic object instance: need to create two new symbolic val as the key and value, the key should fixed to string type, the value should be any type.
 * 
 * 2/ getFiled and setField operation on symbolic object instance should works well to make the symbolic val flows from fromObj to toObj.
 * 
 * Source: squirrelly/dist/squirrelly.cjs.js::copyProps
 * Author: jackfromeast
 */

var PASS = false;
var S$ = require('S$');

var fromobj = S$.pureSymbol('fromObj_undef');

// from pug
function copyProps(toObj, fromObj) {
    for (var key in fromObj) {
        if (hasOwnProp(fromObj, key)) {
            if (fromObj[key] != null &&
                typeof fromObj[key] == 'object' &&
                (key === 'storage' || key === 'prefixes') &&
                !notConfig // not called from Cache.load
            ) {
                toObj[key] = copyProps(/*toObj[key] ||*/ {}, fromObj[key]);
            }
            else {
                toObj[key] = fromObj[key];
            }
        }
    }
    return toObj;
}

function hasOwnProp(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

if(fromobj["views options"]){
    toObj = copyProps({}, fromobj["views options"]);
    if(Object._expose._isSymbolic(toObj)){
        PASS = true;
    }
}

if(PASS){
    throw "[+] TEST PASS!";
}else{
    throw "[-] TEST FAIL!";
}


// from doT
function copy(o, to) {
	to = to || {};
	for (var property in o) {
		to[property] = o[property];
	}
	return to;
}

copy(fromobj, toObj);