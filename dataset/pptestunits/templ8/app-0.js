const Templ8 = require('templ8');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}


const engine = new Templ8("views");
engine.verbose = true; 

engine.render('template', {
    "user": {
      "name": "Sean"
    }
  }).then((html) => {
    console.log(html);
  }).catch((err) => {
    console.error(err);
  });
