const hogan = require("hogan.js");

/* Exported Function Call*/
const TEMPLATE = `
<p1>Template</p1>
`;

var options = {'asString': true};    
const template = hogan.compile(TEMPLATE, options);

//pp2rce sink
Function(`return ${template}`)();
