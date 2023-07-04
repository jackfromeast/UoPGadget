// mixins feature in Slm

const slm = require('slm');
const fs = require('fs');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

fs.readFile('./views/template.html', 'utf8', function(err, data) {
  if (err) throw err;
  var template = slm.compile(data);
  var html = template();
  console.log(html);
});
