const hogan = require("hogan.js");


/* Polluted Payload*/
// inject property to root prototype
// hogan, need more time to investigate
// Object.prototype['\x0a']= '{{';
// Object.prototype.sectionTags = ['<thead>'];
// Object.prototype["\x0a<table border=\"1\">\x0a  <thead>\x0a    <tr>\x0a      <th>City</th>\x0a      <th>Pollution index</th>\x0a      <th>Year</th>\x0a    </tr>\x0a  </thead>\x0a  <tbody>\x0a  {{#data}}\x0a    <tr>\x0a      <td>{{city}}</td>\x0a      <td>{{pollution}}</td>\x0a      <td>{{year}}</td>\x0a    </tr>\x0a  {{/data}}\x0a  {{^data}}\x0a    Nothing found\x0a  {{/data}}\x0a  </tbody>\x0a</table>\x0a||false||false||||false"] = 'gg';



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