const lodash = require('lodash')
const fs = require('fs')

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

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
