const fs = require('fs');
const vm = require('vm');
const path = require('path');

var ppgadgetsPath = __dirname + "/../../dataset/ppgadgets/"

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


function runAppInContext(appName, appJsPath) {
  // const appJsPath = path.join(ppgadgetsPath, appName, filename);
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');

  const context = {
      Object: {
        prototype: Object.prototype,
      },
      accessed: global.accessed,
      require: (moduleName) => {
          try {
              return require(path.resolve(ppgadgetsPath, appName, 'node_modules', moduleName));
          } catch (err) {
              if (err.code === 'MODULE_NOT_FOUND') {
                  return require(moduleName);
              } else {
                  throw err;
              }
          }
      },
      __dirname: path.dirname(appJsPath),
      console: console,
  };

  const sandbox = vm.createContext(context);
  const script = new vm.Script(appJsContent);
  try{
    script.runInContext(sandbox);
  }
  catch(err){
    console.log(err);
  }

}

// function executeAppFiles(appName) {
//   const appDirectory = path.join(ppgadgetsPath, appName);
//   fs.readdirSync(appDirectory, (err, files) => {
//       if (err) {
//           console.error(`Error reading directory ${appDirectory}:`, err);
//           return;
//       }
//       try{
//         const appFiles = files.filter(file => /^app(-\d+)?\.js$/.test(file));
//         appFiles.forEach(file => {
//             const appJsPath = path.join(appDirectory, file);
//             console.log(`[+] Executing file: ${appJsPath}`);
//             runAppInContext(appName, appJsPath);
//         });
//       }
//       catch (err) {
//           console.error(`[!] Error executing app ${appName}:`, err);
//       }
//   });
// }

function executeAppFiles(appName) {
  const appDirectory = path.join(ppgadgetsPath, appName);
  try {
      const files = fs.readdirSync(appDirectory);
      const appFiles = files.filter(file => /^app(-\d+)?\.js$/.test(file));
      appFiles.forEach(file => {
          const appJsPath = path.join(appDirectory, file);
          console.log(`[+] Executing file: ${appJsPath}`);
          runAppInContext(appName, appJsPath);
      });
  } catch (err) {
      console.error(`[!] Error executing app ${appName}:`, err);
  }
}


function __exported_api_doT() {
    executeAppFiles('doT');
}

function __exported_api_ejs() {
  executeAppFiles('ejs');
}

function __exported_api_handlebars() {
  executeAppFiles('express-hbs');
}

function __exported_api_hogan() {
  executeAppFiles('hogan');
}

function __exported_api_jade() {
  executeAppFiles('jade');
}

function __exported_api_lodash() {
  executeAppFiles('lodash');
}

function __exported_api_mustache() {
  executeAppFiles('mustache');
}

function __exported_api_pug() {
  executeAppFiles('pug');
}

function __exported_api_squirrellyjs() {
  executeAppFiles('squirrellyjs');
}

function __exported_api_template7() {
  executeAppFiles('template7');
}

function __exported_api_bladejs() {
  executeAppFiles('bladejs');
}

function __exported_api_nunjunks() {
  executeAppFiles('nunjunks');
}

const exportedAPIs = {
    ['require']: __exported_api_require,
    ['spawnSync']: __exported_api_spawnSync,
    ['runInNewContext']: __exported_api_runInNewContext,
    ['doT']: __exported_api_doT,
    ['ejs']: __exported_api_ejs,
    ['handlebars']: __exported_api_handlebars,
    ['hogan']: __exported_api_hogan,
    ['jade']: __exported_api_jade,
    ['lodash']: __exported_api_lodash,
    ['mustache']: __exported_api_mustache,
    ['pug']: __exported_api_pug,
    ['nunjunks']: __exported_api_nunjunks,
    ['squirrellyjs']: __exported_api_squirrellyjs,
    ['template7']: __exported_api_template7,
    ['bladejs']: __exported_api_bladejs,
}

module.exports = exportedAPIs