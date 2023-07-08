const liquor = require('liquor');
const fs = require('fs');
const path = require('path');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const translate = function(text) {
    if(text === 'Hello world') {
        return 'Bonjour le monde';
    }
};

let data = {
    message: translate('Hello world'),
};

let templateString = fs.readFileSync(path.join(__dirname, 'views', 'template.liquor'), 'utf8');

let template = liquor.compile(templateString);
let result = template(data);

console.log(result);
