var dust = require('dustjs-linkedin');


try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

content = "{?tags}\n"                     +
"  <ul>{~n}\n"                  +
"    {#tags}\n"                 +
"      {~s} <li>{.}</li>{~n}\n" +
"    {/tags}\n"                 +
"  </ul>\n"                     +
"{:else}\n"                     +
"  No Tags!\n"                  +
"{/tags}\n"                     +
"{~n}\n"                        +
"{^likes}\n"                    +
"  No Likes!\n"                 +
"{:else}\n"                     +
"  <ul>{~n}\n"                  +
"    {#likes}\n"                +
"      {~s} <li>{.}</li>{~n}\n" +
"    {/likes}\n"                +
"  </ul>\n"                     +
"{/likes}";

var tmpl = dust.compile(content, "conditional");
dust.loadSource(tmpl);

dust.render("conditional",{ tags: [], likes: ["moe", "larry", "curly", "shemp"] }, function(err, out) {
    console.log(out)
});