const atpl = require('atpl');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const output = atpl.renderFileSync(__dirname + '/views', 'simple.html', { name: 'test1' }, false)
// console.log(output)
