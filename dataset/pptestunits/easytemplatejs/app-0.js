const path = require('path');
const fs = require('fs');
var Et = require('easytemplatejs');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

const helpers = {
  translate: function() {
    return "'Bonjour le monde'";
  }
};

const templateFilePath = path.join(__dirname, 'views', 'template.html');
const tmplText = fs.readFileSync(templateFilePath, 'utf8');

var result = Et.template(tmplText, { translate: helpers.translate() });

console.log(result);
