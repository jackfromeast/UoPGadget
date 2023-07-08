// use external object support feature of this template engine

const path = require('path');
const fs = require('fs');
const Et = require('easytemplatejs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const templateFilePath = path.join(__dirname, 'views', 'template2.html');
const tmplText = fs.readFileSync(templateFilePath, 'utf8');

// Prepare the external objects
const externalObjects = {
  people: ['MoMo', 'Joy', 'Ray']
};

// Execute the template directly
var result = Et.template(tmplText, Object.assign({}, externalObjects));

console.log(result);
