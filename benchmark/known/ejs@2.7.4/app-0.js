const ejs = require('ejs')
const path = require('path');
const templatePath = path.join(__dirname, 'views', 'login_register.ejs');

// gadget 1
// Object.prototype.outputFunctionName = "_tmp1;global.process.mainModule.require('child_process').exec('bash -c \"sleep 10\"');var __tmp2"

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

var result = ejs.renderFile(templatePath, {
    title:" storeHtml | logins ",
    buttonHintF:"login",
    buttonHintS:"No account? Register now",
    hint:"login",
    next:"/register"
})

