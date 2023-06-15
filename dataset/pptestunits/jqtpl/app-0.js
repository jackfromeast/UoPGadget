const jqtpl = require('jqtpl');
const fs = require('fs')


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

let tpl = "<div>${a}</div>"
jqtpl.render(tpl, {a:123});