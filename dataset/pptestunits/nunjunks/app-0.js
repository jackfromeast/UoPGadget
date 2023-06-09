const nunjucks = require("nunjucks");

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

nunjucks.compile(" {{ content }} ").render();