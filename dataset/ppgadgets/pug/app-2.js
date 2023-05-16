pug = require("pug")

// this is not working
Object.prototype['startingLine'] = "console.log('code injection!!!')"


const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));