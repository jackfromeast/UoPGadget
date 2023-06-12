const Hamlet = require('hamlet').hamlet;

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

templateString = `<body>
<p>Some paragraph.
<ul>
    <li>Item 1
    <li>Item 2
<.foo>
    <span#bar data-attr=#{foo}>baz # this is a comment`


Hamlet(templateString, {foo:'f'})