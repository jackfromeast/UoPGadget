const Hamlet = require('hamlet').hamlet;
const fs = require('fs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const templateString = fs.readFileSync(__dirname + '/views/wrapped.hamlet', 'utf8')

Hamlet(templateString, {})