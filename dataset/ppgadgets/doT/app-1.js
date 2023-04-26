'use strict';

var assert = require('assert');
var doT = require('dot');


// Object.prototype.global = '}console.log("xxx")}())//';

// if(typeof module!=='undefined' && module.exports) module.exports=itself;
// else if(typeof define==='function') define(function(){return itself;});
// else {console.log("executed")=console.log("executed")||{};console.log("executed")['ttest']=itself;}}());
// for node-find-undefined
console.log("="*20+"start"+"="*20+"\n")


const templates = doT.process({path: __dirname});

// injected code can only be executed if undefined is passed to template function
// templates.test();
var ttest = require(__dirname+'/ttest.js')
console.log(ttest.toString());


var __line = 1
  , __lines = "<%- include ./header %>\n  <main>\n    <h2>This is the main content of the page.</h2>\n    <p>Here you can add more content as needed.</p>\n  </main>\n<%- include ./footer %>\n"
  , __filename = "/home/ubuntu/PPAEG/dataset/ppgadgets/ejs/views/main.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  var __locals = (console.log('inject!') || {}),
xxx = __locals.xxx;
  with (console.log('inject!') || {}) {
    ; (function(){
      var __line = 1
      , __lines = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Node.js EJS Include Example</title>\n</head>\n<body>\n  <header>\n    <h1>Welcome to my website!</h1>\n  </header>\n"
      , __filename = "/home/ubuntu/PPAEG/dataset/ppgadgets/ejs/views/header.ejs";
      try {
    ; __append("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Node.js EJS Include Example</title>\n</head>\n<body>\n  <header>\n    <h1>Welcome to my website!</h1>\n  </header>\n")
    ; __line = 12
      } catch (e) {
        rethrow(e, __lines, __filename, __line, escapeFn);
      }
    ; }).call(this)
    ; __append("\n  <main>\n    <h2>This is the main content of the page.</h2>\n    <p>Here you can add more content as needed.</p>\n  </main>\n")
    ; __line = 6
    ; (function(){
      var __line = 1
      , __lines = "<footer>\n    <p>Copyright © 2023 - My Website</p>\n  </footer>\n</body>\n</html>\n"
      , __filename = "/home/ubuntu/PPAEG/dataset/ppgadgets/ejs/views/footer.ejs";
      try {
    ; __append("<footer>\n    <p>Copyright © 2023 - My Website</p>\n  </footer>\n</body>\n</html>\n")
    ; __line = 6
      } catch (e) {
        rethrow(e, __lines, __filename, __line, escapeFn);
      }
    ; }).call(this)
    ; __append("\n")
    ; __line = 7
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL=/home/ubuntu/PPAEG/dataset/ppgadgets/ejs/views/main.ejs