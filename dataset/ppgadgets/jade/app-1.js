var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname+'/views/', 'index.jade');


// Object.prototype.self = 1;
Object.prototype.code = {
    'val': "console.log('hello world');"
}

jade.renderFile(templatePath);