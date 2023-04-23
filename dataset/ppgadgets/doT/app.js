'use strict';

var assert = require('assert');
var doT = require('..');

var logged;

Object.prototype.templateSettings = {varname: 'it=(console.log("executed"),{})'};

const templates = doT.process({path: './examples'});
templates.test();
