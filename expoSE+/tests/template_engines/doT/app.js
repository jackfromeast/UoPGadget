'use strict';

var doT = require('dot');


var S$ = require('../../../lib/S$')
Object.prototype.templateSettings = S$.pureSymbol('templateSettings_undef')

// Object.prototype.templateSettings = {varname: 'it=(console.log("executed"),{})'};

const templates = doT.process({path: './'});
templates.test(); // Will not print "executed"
