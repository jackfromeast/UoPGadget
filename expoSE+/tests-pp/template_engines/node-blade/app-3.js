const blade = require('blade');
const fs = require('fs');
const path = require('path');
var S$ = require('../../../lib/S$')


// Object.prototype.value = "somevalue"
// Object.prototype.exposing = ["console.log('RCE!')"]

Object.prototype.value = "somevalue"
// Object.prototype.exposing = S$.pureSymbol('line_undef')


// This template includes the `include` directive
const mainFilePath = path.join(__dirname, '/views/include.blade');

fs.readFile(mainFilePath, 'utf8', (err, mainFile) => {
    if (err) throw err;

    blade.compile(mainFile, { filename: mainFilePath, debug: true }, (err, tmpl) => {
        if (err) throw err;

        tmpl({}, function(err, html) {
            if (err) throw err;
            console.log(html);
        });
    });
});