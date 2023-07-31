const path = require('path');
var saker = require('saker');
const fs = require('fs');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

// Object.prototype['$saker_raw$'] = 1
// Object.prototype.str = "<script>alert(1)</script>"

const templateString = fs.readFileSync(__dirname+'/views/template.html','utf8');

const template = saker.compile(templateString);

const model = {
    translate: function(text) {
        return text === 'Hello world' ? 'Bonjour le monde' : text;
    }
};

out = template.call({layout: null}, model);
if(Object._expose._isSymbolic(out)) {
  Object._expose._foundGadgets();
}

