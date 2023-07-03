const path = require('path');
var saker = require('saker');
const fs = require('fs');

try{
    Object._expose.setupSymbols()
  }
  catch(e){
    console.log("[!] symbolic execution not enabled")
  }

const templateString = fs.readFileSync(path.join(__dirname, 'views', 'template1.html'), 'utf8');

const model = {
    translate: function(text) {
        return text === 'Hello world' ? 'Bonjour le monde' : text;
    }
};

const template = saker.compile(templateString);

console.log(template.call({layout: null}, model));
