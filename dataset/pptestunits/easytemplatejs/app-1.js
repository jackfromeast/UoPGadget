// use out() function of the template engine
const path = require('path');
const fs = require('fs');
const Et = require('easytemplatejs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const helpers = {
  translate: function(text) {
    if (text === 'Hello world') {
      return 'Bonjour le monde';
    } else {
      return text;
    }
  }
};

const templateFilePath = path.join(__dirname, 'views', 'template1.html');
const tmplText = fs.readFileSync(templateFilePath, 'utf8');

var result = Et.template(tmplText, helpers);

console.log(result);
