var sqrl = require('squirrelly')
const path = require('path')


templatePath = path.join(__dirname+'/views/', 'complex.sqrl');

try{
   Object._expose.setupSymbols()
}
catch(e){
   console.log("[!] symbolic execution not enabled")
}


sqrl.renderFile(templatePath, { kids: ['Ben', 'Polly', 'Joel', 'Phronsie', 'Davie'] });