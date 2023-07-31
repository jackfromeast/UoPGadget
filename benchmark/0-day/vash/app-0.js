// app.js
const path = require('path');
const fs = require('fs');
const vash = require('vash');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

// Object.prototype.args = ["models", "helper", "__vopts", "runtime", "it=(console.log('gg'))"]

// Load the template
let templatePath = path.resolve(__dirname, 'views/template.vash');
let templateContent = fs.readFileSync(templatePath, 'utf8');

// Compile the template
let template = vash.compile(templateContent);

// Render the template with some model data
let rendered = template();

console.log(rendered);
