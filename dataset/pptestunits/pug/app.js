pug = require("pug")


const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));