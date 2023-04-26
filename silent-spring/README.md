## Compare with Silent-Spring

### Step 1
install the test codebase in `./dataset/ppaeg-codeql/xxx/xxx-code`

### Step 2
`cd silent-spring/find-undefined`
extract the property names from the codebase: `node extract-property-silent-spring.js hogan, ejs`
To extract the property names for all the codebase under `./dataset/ppaeg-codeql/`: `node extract-property-silent-spring.js all`
The output file will be saved in `output/silent-spring/extracted-props/`

### Step 3
To dynamically test the export api and find undefined properties:
`cd silent-spring/find-undefined`
1. add the export api that going to be tested in `silent-spring/find-undefined/exported_apis.js`
2. make sure that the `app-%d.js` under `dataset/ppgadgets` 
    1. comment out prototype pollution exploit part 
    2. do not use relative path(use`__dirname`instead) 
2. run `node ./find-undefined-property.js all` to test all the exported apis

TODO:
1. currently running `jade` would cause the process exit with 1 directly without any errors throw out
2. running `squirrellyjs`, `pug`, and `mustache` would cause the following error when running in vm sandbox
```
    /home/ubuntu/PPAEG/silent-spring/find-undefined/exported_apis.js:41
                  throw err;
                  ^

TypeError [ERR_INVALID_URL]: Invalid URL: file://:undefined/home/ubuntu/PPAEG/dataset/ppgadgets/mustache/node_modules/side-channel/package.json
    at onParseError (internal/url.js:259:9)
    at new URL (internal/url.js:335:5)
    at new URL (internal/url.js:332:22)
    at resolvePackageTargetString (internal/modules/esm/resolve.js:343:20)
    at resolvePackageTarget (internal/modules/esm/resolve.js:374:12)
    at resolvePackageTarget (internal/modules/esm/resolve.js:420:26)
    at resolvePackageTarget (internal/modules/esm/resolve.js:386:20)
    at packageExportsResolve (internal/modules/esm/resolve.js:475:22)
    at resolveExports (internal/modules/cjs/loader.js:432:36)
    at Function.Module._findPath (internal/modules/cjs/loader.js:472:31)
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:867:27)
    at Function.Module._load (internal/modules/cjs/loader.js:725:27)
    at Module.require (internal/modules/cjs/loader.js:952:19)
    at require (internal/modules/cjs/helpers.js:88:18)
    at Object.<anonymous> (/home/ubuntu/PPAEG/dataset/ppgadgets/mustache/node_modules/qs/lib/stringify.js:3:22)
    at Module._compile (internal/modules/cjs/loader.js:1063:30) {
  inputcs: 'file://:undefined/home/ubuntu/PPAEG/dataset/ppgadgets/mustache/node_modules/side-channel/package.json',
  codecs: 'ERR_INVALID_URL'
}
```
So, currently, the dynamically undefined finding script doesn't work on the four template engine.


### Step4

1. setup CodeQL
```
cd /home/ubuntu/PPAEG/dataset/ppaeg-codeql
sh dataset/ppaeg-codeql/createCodeQLdb.sh ./
```