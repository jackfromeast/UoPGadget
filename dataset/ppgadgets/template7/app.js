// for node-find-undefined
console.log("="*20+"start"+"="*20+"\n")

const template7 = require('template7');

const source = `Hello{{msg}}`
// const source = `Hello {{join myArray delimiter=", "}}`
const template =  template7.compile(source);

console.log(template.toString())
console.log(template({msg:"World!"}))
// for node-find-undefined
console.log("="*20+"end"+"="*20+"\n")
