'use strict';

var doT = require('dot');

Object.prototype.destination = "/home/ubuntu/ppaeg/dataset/ppgadgets/doT/tmp"

// injected code can only be executed if undefined is passed to template function
const templates = doT.process({path: __dirname+'/views'});
var mytemplate = require(__dirname+'/views/mytemplate.js')