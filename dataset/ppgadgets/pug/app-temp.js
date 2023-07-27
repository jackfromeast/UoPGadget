pug = require("pug")

// Object.prototype.interpolated = true
Object.prototype.val = 'console.log("GG!")'

const path = require('path');
const templatePath = path.join(__dirname+"/views/", 'emptyComment.pug');
const template = pug.compileFile(templatePath);

template({});