const template7 = require('template7');


// still working on this
// ???

const source = `Hello{{msg}}`
// const source = `Hello {{join myArray delimiter=", "}}`
const template =  template7.compile(source);

console.log(template.toString())
console.log(template({msg:"World!"}))
