const template7 = require('template7');

try{
    Object._expose.setupSymbols()
 }
 catch(e){
    console.log("[!] symbolic execution not enabled")
 }


const source = `Hello{{msg}}`
const template =  template7.compile(source);


console.log(template({msg:"World!"}))

