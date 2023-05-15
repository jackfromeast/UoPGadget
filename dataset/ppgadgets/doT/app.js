'use strict';
var doT = require('dot');

Object.prototype.templateSettings = {varname: 'it=(console.log("executed"),{})'};

const templates = doT.process({path: __dirname});
// templates.test(); // Will not print "executed"