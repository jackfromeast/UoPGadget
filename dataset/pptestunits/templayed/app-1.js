const fs = require('fs');
const path = require('path');
const templayed = require('templayed');

try{
    Object._expose.setupSymbols()
  }
  catch(e){
    console.log("[!] symbolic execution not enabled")
  }
  

const data = {
    names: [{firstName: "Paul", lastName: "Engel"}, {firstName: "Chunk", lastName: "Norris"}],
    fullName: function() {
        return this.lastName + ", " + this.firstName;
    }
};

const templatePath = path.join(__dirname, 'views', 'template2.html');
const templateStr = fs.readFileSync(templatePath, 'utf8');

const template = templayed(templateStr);

const html = template(data);

console.log(html); 
