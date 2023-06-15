const jqtpl = require('jqtpl');
const fs = require('fs')


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

let tpl = `<div>{{! its a comment}}</div>`

jqtpl.render(tpl, {});