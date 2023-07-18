var jade = require('jade');
const path = require('path');
const templatePath = path.join(__dirname+'/views/', 'index.jade');

// Object.prototype.self = 1;
// Object.prototype.code = {
//     'val': "global.process.mainModule.require('child_process').execSync('sleep 10');"
// }

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}


jade.renderFile(templatePath);