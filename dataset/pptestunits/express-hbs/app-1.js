const hbs = require('express-hbs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const source = `Hello {{ msg }}`;
const template =  hbs.handlebars.compile(source);

template({msg:"World!"})

