const mustache = require('mustache');
const path = require('path');
const fs = require('fs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

const FLAG = "FakeCTF{panda-sensei}";
fs.readFile(__dirname+'/views/admin.html', (err, content) => {

    // Object.prototype[content+":{{:}}"] = [["name", "flag", 0, 100]]

    let rendered = mustache.render(content.toString(), {is_admin:false, flag:FLAG})

    console.log(rendered)
})
