const hbs = require('express-hbs');

const source = `Hello {{ msg }}`;
const template =  hbs.handlebars.compile(source);

template({msg:"World!"})

