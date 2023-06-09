var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname+'/views/', 'when-case.jade');


// Object.prototype.name = "polluted";
// Object.prototype.buffer = true;

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

jade.renderFile(templatePath);