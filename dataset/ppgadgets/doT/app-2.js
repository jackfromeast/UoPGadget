'use strict';

var doT = require('dot');

// Object.prototype.destination = "/home/ubuntu/ppaeg/dataset/ppgadgets/doT/tmp"

// compile to arbitrary destination
const templates = doT.process({path: __dirname+'/views'});