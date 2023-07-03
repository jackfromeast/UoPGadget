const fs = require('fs');
const path = require('path');
const templayed = require('templayed');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

function translate(text) {
    return 'Bonjour le monde';
}

const templatePath = path.join(__dirname, 'views', 'template.html');
const templateStr = fs.readFileSync(templatePath, 'utf8');

const template = templayed(templateStr);

const context = {
    message: translate('Hello world')
};

console.log(template(context));
