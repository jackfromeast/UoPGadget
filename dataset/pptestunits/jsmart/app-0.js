const path = require('path');
const fs = require('fs');
const jSmart = require('jsmart');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}


// Define your custom function
function translate(params) {
  return 'Bonjour le monde';
}

// Register your custom function
jSmart.prototype.registerPlugin(
  'function',
  'translate',
  translate
);

// Load the template
const templatePath = path.join(__dirname, 'views', 'template.html');
const templateData = fs.readFileSync(templatePath, 'utf8');

// Compile the template
let tpl = new jSmart(templateData);

// Apply the template
let res = tpl.fetch();

console.log(res);
