const lodash = require('lodash')
const fs = require('fs')

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
