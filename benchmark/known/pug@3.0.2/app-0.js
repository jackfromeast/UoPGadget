pug = require("pug")

// gadget 1
// Object.prototype.block = {
//     type: "Text",
//     line: "process.mainModule.require('child_process').execSync(`bash -c 'sleep 10'`)"
// }

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));