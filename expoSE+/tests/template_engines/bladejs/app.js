/*
./expoSE+ --undefined-file /home/ubuntu/PPAEG/output/undefined-props-node/bladejs-undefined-props.json /home/ubuntu/PPAEG/expoSE+/tests/template_engines/bladejs/app.js
*/

const blade = require('blade');
// Object.prototype.name = "somename"
// Object.prototype.value = "somevalue"
// Object.prototype.code = "process.mainModule.require('child_process').execSync(\`touch a.txt\`)"

var S$ = require('../../../lib/S$')
Object.prototype.name = ""
Object.prototype.value = ""
Object.prototype.code = S$.pureSymbol('code_undef')


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
            
blade.compile(template, {'debug': false}, function(err, tmpl) {
    if (err) {
        console.log(err);
    }else{
        tmpl({'nav': []}, function(err, html) {
            // console.log(html, err);
        });
    }
});