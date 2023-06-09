var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname+"/views/", 'index.jade');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

jade.renderFile(templatePath);