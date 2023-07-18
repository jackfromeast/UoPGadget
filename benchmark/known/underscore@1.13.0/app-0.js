const _ = require('underscore');
const fs = require('fs');
const path = require('path');
var templateString = fs.readFileSync(path.join(__dirname, 'views', 'template.html'), 'utf8');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

function translate(text) {
  return 'Bonjour le monde';
}

// Object.prototype.variable = "data, tmp, it=process.mainModule.require('child_process').execSync(\`sleep 10\`)"

var template = _.template(templateString);

var result = template({ data: { translate: translate } });

console.log(result);
