const mustache = require('mustache');
const path = require('path');
const fs = require('fs');

const FLAG = "FakeCTF{panda-sensei}";
fs.readFile(__dirname+'/views/admin.html', (err, content) => {
    let rendered = mustache.render(content.toString(), {is_admin:false, flag:FLAG})
})

