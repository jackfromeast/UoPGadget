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

let memo = {};
const FLAG = "FakeCTF{panda-sensei}";

/** Edit memo */
app.post('/edit', (req, res) => {
    let ip = req.ip;
    let index = req.body.index;
    let new_memo = req.body.memo;

    /* Admin can edit anyone's memo for censorship */
    ip = req.body.ip;

    /* Update memo */
    memo[ip][index] = new_memo;
    res.json({status: 'success', result: 'Successfully updated'});
});

/** Admin panel */
app.get('/admin', (req, res) => {
    res.render('admin', {is_admin:false, flag:FLAG});
});

app.listen(3000, () => {
    console.log("Server is up!");
});
