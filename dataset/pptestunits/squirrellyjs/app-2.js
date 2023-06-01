var sqrl = require('squirrelly')
const path = require('path')


templatePath = path.join(__dirname+'/views/', 'complex.sqrl');

Object.prototype.settings = {
    'view options':{
       prefixes: {
          h: "@",
          b: "al",
          i: "",
          r: "*",
          c: "/",
          e: "!",
        }
    }
 };

sqrl.renderFile(templatePath, { kids: ['Ben', 'Polly', 'Joel', 'Phronsie', 'Davie'] });