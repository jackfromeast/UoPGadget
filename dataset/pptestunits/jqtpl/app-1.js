const jqtpl = require('jqtpl');
const fs = require('fs')


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

let tpl = `{{if a == 6}}
<div>\${a}</div>
{{else a == 5}}
<div>5</div>
{{else}}
<div>a is not 6 and not 5</div>
{{/if}}`

jqtpl.render(tpl, {a:6});