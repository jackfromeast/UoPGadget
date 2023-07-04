const whiskers = require('whiskers');
const fs = require('fs');
const path = require('path');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

const translate = function(text) {
  if (text === 'Hello world') {
    return 'Bonjour le monde';
  }
  return text;
};

fs.readFile(path.join(__dirname, 'views/template.html'), 'utf8', (err, data) => {
  if (err) throw err;
  
  const context = {
    message: translate('Hello world'),
  };

  const output = whiskers.render(data, context);
  console.log(output);
});
