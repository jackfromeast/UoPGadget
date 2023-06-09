pug = require("pug")


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const path = require('path');
const templatePath = path.join(__dirname+"/views/", 'attrs.pug');
const template = pug.compileFile(templatePath);

// console.log(template({}));