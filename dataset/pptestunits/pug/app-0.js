pug = require("pug")


// const template = pug.compile(`h1= msg`);
// console.log(template({msg: "Hello World"}));

const path = require('path');
const templatePath = path.join(__dirname+"/views/", 'attrs.pug');
const template = pug.compileFile(templatePath);

// console.log(template({}));