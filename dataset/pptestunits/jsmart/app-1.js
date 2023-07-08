const path = require('path');
const jSmart = require('jsmart');
const fs = require('fs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}


const templateContent = fs.readFileSync(path.join(__dirname, 'views', 'template1.html'), 'utf8');
const template = new jSmart(templateContent);
const output = template.fetch();
console.log(output);
