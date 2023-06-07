const blade = require('blade');
const fs = require('fs');
const path = require('path');
// var S$ = require('../../../lib/S$')


// The template will broken but our injected code will be executed
// Object.prototype.value = "somevalue"
// Object.prototype.output = {
//     to: "console.log('RCE!')\nxxx"
// }

Object.prototype.value = "somevalue"
// Object.prototype.output = {
//     to: S$.pureSymbol('output_undef')
// }
// Object.prototype.output = S$.pureSymbol('output_undef')

// This template includes the `render` directive
const mainFilePath = path.join(__dirname, '/views/functions_and_block.blade');

Object._expose.setupSymbols()
fs.readFile(mainFilePath, 'utf8', (err, mainFile) => {
    blade.compile(mainFile, { filename: mainFilePath, debug: true }, (err, tmpl) => {
        // if (err) throw err;

        // tmpl({}, function(err, html) {
        //     if (err) throw err;
        //     console.log(html);
        // });
    });
});