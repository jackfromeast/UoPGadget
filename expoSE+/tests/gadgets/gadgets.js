/**
 * Test file for the gadgets detection
 */


var S$ = require('../../lib/S$')

function test(){
    var x = {}
    var result = ''

    var load = x.undefinedProp
    if(load.content == 'helloworld'){
        return result.xxx
    }else{
        return result
    }

}

function verify(){
    
    Object.prototype.undefinedProp = S$.pureSymbol('undefinedProp_undef')

    let result = test()

}

verify()