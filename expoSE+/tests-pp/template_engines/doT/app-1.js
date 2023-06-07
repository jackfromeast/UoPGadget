'use strict';

var assert = require('assert');
var doT = require('dot');

// for symboilc execution
var S$ = require('../../../lib/S$')
Object.prototype.global = S$.pureSymbol('global_undef')

// Object.prototype.global = "}process.mainModule.require('child_process').execSync(\`sleep 10\`)}())//";

const templates = doT.process({path: __dirname+'/views'});

var ttest = require(__dirname+'/views/test.js')