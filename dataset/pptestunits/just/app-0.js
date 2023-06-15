var JUST = require('just');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

var just = new JUST({ root : __dirname + '/view', useCache : true, ext : '.html' });

just.render('page', { title: 'Hello, World!' }, function(error, html) {
	// console.log(error);
	// console.log(html);
});