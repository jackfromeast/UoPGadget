const template7 = require('template7');

const source = `Hello{{msg}}`
const template =  template7.compile(source);


console.log(template({msg:"World!"}))

