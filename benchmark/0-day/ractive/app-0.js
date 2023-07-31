const Ractive = require('ractive');
const fs = require('fs');
const path = require('path');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

// Object.prototype.statics = {}
// Object.prototype.class = '">\n<script>alert(1)</script>\n<p>'

// this will also work
// Object.prototype.statics = {
//   'class': '">\n<script>alert(1)</script>\n<p>'
// }

let template = fs.readFileSync(path.resolve(__dirname, 'views/template.ract'), 'utf8');


var ractive = new Ractive({
  template: template,
  data: { greeting: 'Hello', name: 'world' }
});

if(Object._expose._isSymbolic(ractive.toHTML())) {
  Object._expose._foundGadgets();
}
