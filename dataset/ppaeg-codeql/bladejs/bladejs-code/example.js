/*********************
 * Welcome to bladejs.
 * Bladejs is a js view engine, based on Laravel Blade and will compile bjs files into js
 * files to bring less overhead of parsing run time.
 * Any views will be converted into node.js module, and can be loaded with require()
 */

// Load the bladejs. * If not install try running: npm install bladejs
var blade = require("./bladejs");

// Set the path of the views, and the place to hold the caches.
// Blade will generate the caches of bjs files, and vanilla JavaScript will be runned on runtime.
// This ability brings you less overhead possible.

// Make sure you put the caches place into .gitignore file, hence they are generating on change of the source view.

blade.set({
    views: './views/',
    caches: './caches/'
});

// Use blade.render function, and give the name of bjs file.
// Important: .bjs should not mention in the address

var result = blade.render("sample" , {author: "Ali T`orabi" , add : function (i) { return i + 1000 }}) ;

// The out put as parsed html
console.log(result);