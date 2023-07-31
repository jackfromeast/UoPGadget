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

Object.prototype.parent = "true"

// Load the template
let templatePath = path.resolve(__dirname, 'views/attri.vash');
let templateContent = fs.readFileSync(templatePath, 'utf8');

// Compile the template
let template = vash.compile(templateContent);

// Render the template with some model data
model = { formName: 'addresses' }
let rendered = template(model);

console.log(rendered);