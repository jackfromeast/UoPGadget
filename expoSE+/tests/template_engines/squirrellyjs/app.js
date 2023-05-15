const express = require('express')
var sqrl = require('squirrelly')
const fs = require('fs')
const path = this.require('path')
const app = express()
const port = 8000

templatePath = path.join(__dirname, 'index.squirrelly');

// express: app.render: merge
// Object.prototype.defaultFilter="e')); console.log('RCE') //";//prototype pollution

// for symboilc execution
var S$ = require('../../../lib/S$')
Object.prototype.defaultFilter = S$.pureSymbol('defaultFilter_undef');


// for node-find-undefined
console.log("="*20+"start"+"="*20+"\n")

app.set('views', __dirname);
app.set('view engine', 'squirrelly')
app.get('/', (req, res) => {
   res.render(templatePath, {'testValue':'test'})
})
// console.log("===========start===========")
// // call sqrl.renderFile
// fs.readFileSync('index.squirrelly', 'utf8', function (err,data) {
//     if (err) {
//         return console.log(err);
//     }
//     var result = sqrl.compile(data, {'testValue':'test'});
// });
// console.log("===========end===========")
// sqrl.compile('index.squirrelly', {'testValue':'test'})
 
app.listen(port, () => {})
module.exports = app;

// for node-find-undefined
console.log("="*20+"end"+"="*20+"\n")


