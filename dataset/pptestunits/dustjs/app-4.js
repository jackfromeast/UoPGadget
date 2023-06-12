var dust = require('dustjs-linkedin');


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

content = "{!\n"                      +
"  Multiline\n"             +
"  {#foo}{bar}{/foo}\n"     +
"!}\n"                      +
"{!before!}Hello{!after!}";

var tmpl = dust.compile(content, "comments");
dust.loadSource(tmpl);

dust.render("comments", {}, function(err, out) {
    console.log(out)
});