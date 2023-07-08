const swig = require('swig');
const path = require('path');
const fs = require('fs');

swig.setFilter('translate', function(input) {
  return 'Bonjour le monde';
});

const template = swig.compileFile(path.join(__dirname, 'views', 'template.html'));

console.log(template({}));
