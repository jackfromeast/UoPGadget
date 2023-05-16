pug = require("pug")


// Object.prototype['code'] = { 
//     val: "console.log('code injection!!!')"
// }

Object.prototype.code = S$.pureSymbol('code_undef');

const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));