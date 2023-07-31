const htmling = require('htmling');
const fs = require('fs')


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

// Object.prototype.if = {
//     "expression": {
//       "type": "CallExpression",
//       "callee": {
//         "type": "MemberExpression",
//         "computed": false,
//         "object": {
//           "type": "Identifier",
//           "name": "console"
//         },
//         "property": {
//           "type": "Identifier",
//           "name": "log"
//         }
//       },
//       "arguments": [
//         {
//           "type": "Literal",
//           "value": "gg",
//           "raw": "'gg'"
//         }
//       ]
//     }
// }

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
let tmp = template.render(options)