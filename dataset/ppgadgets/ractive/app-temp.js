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

Object.prototype.el = "xxx"

var ractive = new Ractive({
  template: template,
  data: { greeting: 'Hello', name: 'world' }
});

console.log(ractive.toHTML());
