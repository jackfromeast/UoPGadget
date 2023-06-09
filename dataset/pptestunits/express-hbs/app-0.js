const hbs = require('express-hbs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

// Register the 'emptyComment' partial
hbs.handlebars.registerPartial('emptyComment', '');

const source = `foo{{> emptyComment}}`
const template =  hbs.handlebars.compile(source);
template({msg:"World!"})

