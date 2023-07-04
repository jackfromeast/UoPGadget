// use the async feature of the template engine
const path = require('path');
const qejs = require('qejs');
const fs = require('fs');

try{
    Object._expose.setupSymbols()
  }
  catch(e){
    console.log("[!] symbolic execution not enabled")
  }

const helpers = {
    renderUserName: function(user) {
        return user || '';
    }
};

const templatePath = path.join(__dirname, 'views', 'template1.html');
const templateStr = fs.readFileSync(templatePath, 'utf8');
const template = qejs.compile(templateStr);

let user = {
    name: 'John',
    getNameAsync: function() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(this.name);
            }, 1000);
        });
    }
}
user.getNameAsync().then(userName => {
    const output = template({ ...helpers, user: userName });
    output.then(console.log);
});
