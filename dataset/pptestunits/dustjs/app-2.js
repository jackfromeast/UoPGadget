var dust = require('dustjs-linkedin');


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

var tmpl = dust.compile("{#names}{title} {name}{~n}{/names}", "empty_array");
dust.loadSource(tmpl);

dust.render("empty_array", { title: "Sir", names: [] }, function(err, out) {
    // console.log(out)
});