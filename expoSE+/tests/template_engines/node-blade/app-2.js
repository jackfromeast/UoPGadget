const blade = require('blade');

/**
 * prototype pollution
 */

var S$ = require('../../../lib/S$')

// Object.prototype.line = '1\nconsole.log("RCE!")\n'
// Object.prototype.value = "somevalue" // helper property, bladejs/lib/parser/index.js::1316

// Object.prototype.line = S$.pureSymbol('line_undef')
Object.prototype.value = "somevalue" // helper property, bladejs/lib/parser/index.js::1316


const template = `html
    head
        title Blade
    body
        #nav
            ul
                - for(var i in nav)
                    li
                        a(href=nav[i])= i
        #content.center
            h1 Blade is cool`;

blade.compile(template, {'debug': true}, function(err, tmpl) {
    tmpl({'nav': []}, function(err, html) {
        console.log(html, err);
    });
});


