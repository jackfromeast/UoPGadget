const exportedAPIs = {
    ['require']: __exported_api_require,
    ['spawnSync']: __exported_api_spawnSync,
    ['runInNewContext']: __exported_api_runInNewContext,
    ['hogan']: __exported_api_hogan,
    ['loadsh']: __exported_api_lodash,
    ['blade']: __exported_api_blade
}

function __exported_api_require(){
    const _ = require('./analysis');
    // Delete the cache entry for the module to re-execute it next
    delete require.cache[require.resolve('./analysis')];
}

function __exported_api_spawnSync(){
    const { spawnSync } = require('child_process');
    const _ = spawnSync('ls', ['', '/usr']);
}

function __exported_api_runInNewContext(){
    const vm = require('vm');
    const context = {x: 10, y: 20};
    vm.runInNewContext('x', context);
}

function __exported_api_hogan(){
    const hogan = require("hogan.js");
    const TEMPLATE = `
    <p1>Template</p1>
    `;
    const _ = hogan.compile(TEMPLATE);
}

function __exported_api_lodash(){
    const lodash = require('lodash')
    const fs = require('fs')
    fs.readFile('../../dataset/ppgadgets/lodash/template.ejs', (err, content) => {
        let compiled = lodash.template(content)
        let rendered = compiled({...options})
    })
}

function __exported_api_blade(){
    const blade = require('blade');
    const template = `html
    head
        title Blade
    body
        #nav
            ul
                - for(var i in nav)
                    li
                        a(href=nav[i])= i
        #content.center
            h1 Blade is cool`;
            
    blade.compile(template, {'debug': true}, function(err, tmpl) {
        tmpl({'nav': []}, function(err, html) {
            console.log(html, err);
        });
    });
}

module.exports = exportedAPIs