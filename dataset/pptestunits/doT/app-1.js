'use strict';

var doT = require('dot');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

// injected code can only be executed if undefined is passed to template function
const templates = doT.process({path: __dirname+'/views'});
var mytemplate = require(__dirname+'/views/mytemplate.js')