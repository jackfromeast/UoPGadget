'use strict';

var doT = require('dot');


var S$ = require('../../../lib/S$')
Object.prototype.templateSettings = {varname: S$.pureSymbol('templateSettings_undef')};
// Object.prototype.templateSettings = S$.pureSymbol('templateSettings_undef')

// Object.prototype.templateSettings = {varname: 'it=(console.log("executed"),{})'};

const templates = doT.process({path: __dirname+'/views'});
templates.test();