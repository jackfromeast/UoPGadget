/**
 * 
 * Test case for custom handler
 * 
 * Custom handler is built on the concept that we cannot cast all the operations on symbolic variables to the logic formula without custom insight/modeling.
 * 
 * An example would be the addWith function in with package. It takes in an string which represent a piece of code, and output the string which represent the code after the addition of with scope. However, inside the addWith function, it try to parse the string into AST, and then do the transformation. Considering if we are passing an symbolic value of string, it is impossible to model the process to the constraints formula for our input.
 * 
 * Another example would be constantinople package which is used to evaluate the constant expression. It is impossible to model the process of evaluating the constant expression to the constraints formula.
 * 
 * Therefore, we need to manually provide an custom handler when these external function are called and we are passing symbolic value as the input. The retrun value could be 1/ true/false or other value can be predicted at runtime or even before(e.g. isconstant) 2/ a symbolic value which acceptable precision loss (e.g. addwith).
 */

var PASS = false;
var S$ = require('S$');
var constantinople = require('constantinople');

var symbol = S$.pureSymbol('symbol_undef');

function isConstant(src) {
    return constantinople(src, {pug: runtime, pug_interp: undefined});
}


if(symbol === 'helloworld'){
    if(!isConstant(symbol)){
        PASS = true;
    }
}

if(PASS){
    throw "[+] TEST PASS!";
}else{
    throw "[-] TEST FAIL!";
}


