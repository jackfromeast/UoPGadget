var jazz = require("jazz");


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}


var template = jazz.compile("my template source code {someVariable}");
template.eval({"someVariable": "lolmuffin"}, ()=>{});