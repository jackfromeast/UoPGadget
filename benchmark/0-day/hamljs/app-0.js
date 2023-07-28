const haml = require('hamljs')
const fs = require('fs')

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

var options = {
    filename: 'page.haml',
    locals: {
      title: 'Welcome',
      body: 'wahoo',
      usersOnline: 15
    }
}

// AVI
// gadget 1
// Object.prototype.onerror = "alert(1);"

let ret = haml.render(fs.readFileSync(__dirname+'/views/page.haml'), options)
