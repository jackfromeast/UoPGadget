const path = require('path');
const qejs = require('qejs');
const fs = require('fs');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

const helpers = {
    translate: function(text) {
        return 'Bonjour le monde';
    }
};

const templatePath = path.join(__dirname, 'views', 'template.html');
const templateStr = fs.readFileSync(templatePath, 'utf8');

const template = qejs.compile(templateStr);

const output = template(helpers);
output.then(console.log);
