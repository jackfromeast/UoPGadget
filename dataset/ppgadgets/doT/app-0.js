'use strict';
var doT = require('dot');

// Object.prototype.templateSettings = {varname: "it=(process.mainModule.require('child_process').execSync('sleep 10'),{})"};

const templates = doT.process({path: __dirname+'/views'});
templates.test();