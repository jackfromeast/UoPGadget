const _ = require('underscore');
const fs = require('fs');
const path = require('path');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

function translate(text) {
    return 'Bonjour le monde';
}

var templateString = fs.readFileSync(path.join(__dirname, 'views', 'template.html'), 'utf8');

var template = _.template(templateString);

var result = template({ data: { translate: translate } });

console.log(result);
