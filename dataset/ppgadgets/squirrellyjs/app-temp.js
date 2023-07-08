var sqrl = require('squirrelly')
const path = require('path')


templatePath = path.join(__dirname+'/views/', 'each.sqrl');

Object.prototype.settings = {
   'view options':{
      varName: 'it=(console.log("gg"))',
      useWith: true
     }
   }
;

let tmp = sqrl.renderFile(templatePath, { kids: ['Ben', 'Polly', 'Joel', 'Phronsie', 'Davie'] });