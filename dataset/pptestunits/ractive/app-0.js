const Ractive = require('ractive');
const fs = require('fs');
const path = require('path');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

let template = fs.readFileSync(path.resolve(__dirname, 'views/template.ract'), 'utf8');

let ractive = new Ractive({
  template: template,
  data: {
    translate: function(text) {
      return 'Ni hao';
    }
  }
});

console.log(ractive.toHTML());
