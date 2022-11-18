/*
lodash@<4.17.5 CVE-2018-3721
merge() -> lodash.baseMerge() -> lodash.baseMergeDeep()
*/

var lodash_pkg = require('lodash'); 
var express = require('express');

var app = express();
var bodyParser = require('body-parser');

// this should be obtained from a database
var user_profile = {
    "username": "jack",
    "password": "123456"
}

app.use(bodyParser.json({type: 'application/json'}));
app.post('/', function(req, res){
    var meraged_value = lodash_pkg.merge(user_profile, req.body);
    res.send(meraged_value);
})

app.listen(80, function(){
    console.log("Example of Prototype Pollution Case 1!\nListening on the 80 port and 8096 on the host!");
})