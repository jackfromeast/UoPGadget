'use strict';

var assert = require('assert');
var doT = require('dot');

Object.prototype.templateSettings = {varname: 'it=(console.log("executed"),{})'};

const templates = doT.process({path: './'});
templates.test(); // Will not print "executed"
