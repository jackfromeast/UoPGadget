/**
 * Test file for the gadgets detection
 */


var S$ = require('../../lib/S$')

function test(){
    var x = {}
    var result = ''

    var load = x.undefinedProp
    if(load.type == 'helloworld'){
        return result + x.undefinedProp.type
    }else{
        return result
    }

}

function verify(){
    
    Object.prototype.undefinedProp = S$.pureSymbol('undefinedProp_undef')

    let result = test()
    
    if(Object._expose._isSymbolic(result)){
        throw "[!] Found undefined value flows to the sink."
    }

}

verify()