const express = require('express');
const mustache = require('mustache');
const path = require('path');
const fs = require('fs');
const app = express();

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

let index = "<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset=\"UTF-8\">\n        <link rel=\"stylesheet\" href=\"https://cdn.simplecss.org/simple.min.css\">\n        <title>Admin Panel - lolpanda</title>\n    </head>\n    <body>\n        <header>\n            <h1>Admin Panel</h1>\n            <p>Please leave this page if you're not the admin.</p>\n        </header>\n        <main>\n            <article style=\"text-align: center;\">\n                <h2>FLAG</h2>\n                <p>\n                    {{#is_admin}}\n                    FLAG: <code>{{flag}}</code>\n                    {{/is_admin}}\n                    {{^is_admin}}\n                    <mark>Access Denied</mark>\n                    {{/is_admin}}\n                </p>\n            </article>\n        </main>\n    </body>\n</html>\n:{{:}}"
Object.prototype[index] = [["name", "this_is_flag", 0, 100]];
const FLAG = "FakeCTF{panda-sensei}";

/** Admin panel */
app.get('/admin', (req, res) => {
    res.render('admin', {is_admin:false, this_is_flag:FLAG});
    // res.render(mustache.render(content.toString(), options))
});

app.listen(3000, () => {
    console.log("Server is up!");
});