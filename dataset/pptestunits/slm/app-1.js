// use the "output" feature in Slm

const slm = require('slm');
const fs = require('fs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const translate = function() {
  return 'Bonjour le monde';
};

fs.readFile('./views/template1.html', 'utf8', function(err, data) {
  if (err) throw err;
  var template = slm.compile(data);
  var html = template({ translate: translate });
  console.log(html);
});
