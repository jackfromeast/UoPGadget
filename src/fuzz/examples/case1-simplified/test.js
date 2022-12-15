const hogan = require("hogan.js");

const TEMPLATE = `
<p1>Template</p1>
`;
const template = hogan.compile(TEMPLATE);

// pp2rce sink
Function(`return ${template}`)();
