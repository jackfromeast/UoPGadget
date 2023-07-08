const whiskers = require('whiskers');
const fs = require('fs');
const path = require('path');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const context = {
  add2and2: function() {
    return 2 + 2;
  }()
};

fs.readFile(path.join(__dirname, 'views/template1.html'), 'utf8', (err, data) => {
  if (err) throw err;
  
  const output = whiskers.render(data, context);
  console.log(output);
});
