// Tangular custom helper feature
const path = require('path');
const fs = require('fs');
require('tangular');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

Tangular.register('translate', function(value) {
    return 'Bonjour le monde';
});

const templateString = fs.readFileSync(path.join(__dirname, 'views', 'template.html'), 'utf8');

const template = Tangular.compile(templateString);

const output = template({ translate: Tangular.helpers.translate });
console.log(output); 