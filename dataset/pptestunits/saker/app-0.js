const path = require('path');
var saker = require('saker');
const fs = require('fs');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

const templateString = fs.readFileSync(path.join(__dirname, 'views', 'template.html'), 'utf8');

const template = saker.compile(templateString);

const model = {
    translate: function(text) {
        return text === 'Hello world' ? 'Bonjour le monde' : text;
    }
};

console.log(template.call({layout: null}, model));

