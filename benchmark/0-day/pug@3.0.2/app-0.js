pug = require("pug")

// Object.prototype['code'] = { 
//     val: "process.mainModule.require('child_process').execSync(\`sleep 10\`)",
// }

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}


const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));