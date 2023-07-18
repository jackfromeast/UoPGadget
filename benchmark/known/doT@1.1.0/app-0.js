'use strict';
var doT = require('dot');

// Object.prototype.templateSettings = {varname: "it=(process.mainModule.require('child_process').execSync('sleep 10'),{})"};

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const templates = doT.process({path: __dirname+'/views'});
templates.test();