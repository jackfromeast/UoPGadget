var ECT = require('ect');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

var renderer = ECT({ root : {
	page: '<p>Page content</p>'
	}
});

var html = renderer.render('page', {});
// console.log(html);