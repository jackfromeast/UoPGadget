const blade = require('blade');
const fs = require('fs');
const path = require('path');

var S$ = require('../../../lib/S$')

// Object.prototype.value = "somevalue"
// Object.prototype.itemAlias = "){console.log('RCE!')}\n,function("

Object.prototype.value = "somevalue"
// Object.prototype.itemAlias = S$.pureSymbol('itemAlias_undef')



// This template includes the `foreach` directive
const mainFilePath = path.join(__dirname, '/views/foreach.blade');

fs.readFile(mainFilePath, 'utf8', (err, mainFile) => {
    blade.compile(mainFile, { filename: mainFilePath, debug: true }, (err, tmpl) => {
        // tmpl({}, function(err, html) {
        //     console.log(html);
        // });
    });
});