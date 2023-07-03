const path = require('path');
const jSmart = require('jsmart');
const fs = require('fs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}


let templateData = fs.readFileSync(path.join(__dirname, 'views', 'template2.html'), 'utf8');

let smarty = new jSmart(templateData);
let result = smarty.fetch();

console.log(result);
