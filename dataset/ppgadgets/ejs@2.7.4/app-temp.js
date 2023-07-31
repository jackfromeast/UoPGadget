const ejs = require('ejs')
const path = require('path');

Object.prototype.filename = "/flag"
Object.prototype.compileDebug = 1

// Define the template string
const templateString = `
  <h1>Hello, <%= name %>!</h1>
  <p>Today is <%= date %>.</p>
`;

// Compile the template string into a template function
const templateFunction = ejs.compile(templateString);

// Define the data object
// const data = {
//   name: 'John Doe',
//   date: new Date().toLocaleDateString()
// };

// Render the template with the data object
const output = templateFunction({});
