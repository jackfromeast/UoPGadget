pug = require("pug")


// Object.prototype['code'] = { 
//     val: "console.log('code injection!!!')"
// }


const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));