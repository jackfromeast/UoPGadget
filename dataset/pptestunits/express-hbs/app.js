const hbs = require('express-hbs');

// Register the 'emptyComment' partial
hbs.handlebars.registerPartial('emptyComment', '');

const source = `foo{{> emptyComment}}`
const template =  hbs.handlebars.compile(source);
template({msg:"World!"})

