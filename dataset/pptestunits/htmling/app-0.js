const htmling = require('htmling');
const fs = require('fs')


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

options = {
    "title": "User List",
    "description": "A list of users",
    "users": [
      {
        "name": "Alice"
      },
      {
        "name": "George"
      }
    ]
  }

var template = htmling.file(__dirname+'/views/page.html')
// template.render(options)