var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname+"/views/", 'index.jade');

jade.renderFile(templatePath);