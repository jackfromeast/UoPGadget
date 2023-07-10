var ECT = require('ect');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });

ectRenderer.render('index');