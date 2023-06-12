const atpl = require('atpl');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

function done(result) { console.log(result)};
atpl.renderFile(__dirname + '/views', 'simple.html', { name: 'test1' }, false, (err, result) => {
    done(result);
});