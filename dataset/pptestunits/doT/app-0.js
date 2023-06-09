'use strict';
var doT = require('dot');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const templates = doT.process({path: __dirname+'/views'});
templates.test();