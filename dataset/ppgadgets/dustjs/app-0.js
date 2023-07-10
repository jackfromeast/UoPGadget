var dust = require('dustjs-linkedin');


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

// arbitrary value interpolation
Object.prototype.title = "arbitrary value"

var tmpl = dust.compile("{#names}{title} {name}{~n}{/names}", "array");
dust.loadSource(tmpl);

dust.render("array", { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] }, function(err, out) {
    console.log(out)
});