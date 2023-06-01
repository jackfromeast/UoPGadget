var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname+'/views/', 'when-case.jade');


// Object.prototype.name = "polluted";
// Object.prototype.buffer = true;

jade.renderFile(templatePath);