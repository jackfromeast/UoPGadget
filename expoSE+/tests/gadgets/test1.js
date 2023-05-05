var S$ = require('../../lib/S$')

a = S$.pureSymbol('a')
// let a = S$.symbol('a', "xxx")

if(a === 'helloworld'){
    console.log('hello world')}
else{
    console.log('not hello world')
}