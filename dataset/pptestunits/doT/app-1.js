'use strict';

var assert = require('assert');
var doT = require('dot');


const templates = doT.process({path: __dirname});

// injected code can only be executed if undefined is passed to template function
// templates.test();
var ttest = require(__dirname+'/ttest.js')
console.log(ttest.toString());


