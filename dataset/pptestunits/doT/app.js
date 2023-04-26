'use strict';
var doT = require('dot');

const templates = doT.process({path: __dirname});
// templates.test(); // Will not print "executed"