const coffeeScript = require('coffee-script');

script = `
for number in [1..10]
  console.log number
`

const compiledJs = coffeeScript.compile(script, { bare: true });
console.log(compiledJs);