var dust = require('dustjs-linkedin');


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

var tmpl = dust.compile("Hello world! Using Dust version {version}!", "hello");
dust.loadSource(tmpl);

dust.render("hello", { version: dust.version }, function(err, out) {});