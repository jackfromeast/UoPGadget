const ejs = require('ejs')
const path = require('path');
const templatePath = path.join(__dirname, 'views', 'login_register.ejs');


// Object.prototype.destructuredLocals = ["__line=__line;console.log('Th1s1sAn1njection!!!')//"]

// For symbolic execution
var S$ = require('../../../lib/S$')
Object.prototype.destructuredLocals = S$.pureSymbol('destructuredLocals_undef')

var result = ejs.renderFile(templatePath, {
    title:" storeHtml | logins ",
    buttonHintF:"login",
    buttonHintS:"No account? Register now",
    hint:"login",
    next:"/register"
})


