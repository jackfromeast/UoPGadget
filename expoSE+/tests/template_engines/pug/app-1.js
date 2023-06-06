pug = require("pug")
S$ = require("../../../lib/S$")


// Object.prototype['code'] = { 
//     val: "console.log('code injection!!!')"
// }
Object.prototype.self = 1
Object.prototype.code = S$.pureSymbol('code_undef');

const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));