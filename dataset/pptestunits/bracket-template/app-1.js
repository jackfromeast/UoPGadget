const path = require('path');
const brkt = require('bracket-template').default;
const fs = require('fs');

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

template = `
<!-- Call block -->
Hello [[# block1('world') ]]

<!-- Block definition -->
[[## block1(arg1)
  from block1 (with '[[= arg1 ]]')
#]]
`
brkt.compile(template)