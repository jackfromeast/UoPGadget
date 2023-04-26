'use strict';
var doT = require('dot');

// Object.prototype.templateSettings = {varname: 'it=(console.log("executed"),{})'};
// for node-find-undefined
console.log("="*20+"start"+"="*20+"\n")

const templates = doT.process({path: __dirname});
// templates.test(); // Will not print "executed"

// for node-find-undefined
console.log("="*20+"end"+"="*20+"\n")
