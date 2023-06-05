/** Transform a single JS file into Jalangi2 format **/

const esotope = require("esotope");
const acorn = require("acorn");

var babel;
try {
  babel = require("@babel/core");
} catch (e) {}

const fs = require("fs");
const path = require("path");
const instUtil = require("../instrument/instUtil");
const ArgumentParser = require("argparse").ArgumentParser;

/** Jalangi does injection in a terrible way (why oh god why) **/

global.J$ = {};
require('../Config');
require('../Constants');
require('../instrument/astUtil');
require('../instrument/esnstrument');
global.acorn = acorn;
global.babel = babel;
global.esotope = esotope;

/** end of Jalangi init **/

const parser = new ArgumentParser({
    addHelp: true,
    description: "Utility to apply Jalangi instrumentation to files or a folder."
});

parser.addArgument(['inputFiles'], {
    help: "either a list of JavaScript files to instrument, or a single directory under which all JavaScript and HTML files should be instrumented (modulo the --no_html and --exclude flags)",
    nargs: '+'
});

const args = parser.parseArgs();

const options = {
    code: '' + fs.readFileSync(args.inputFiles[0]),
    isEval: false,
    origCodeFileName: args.inputFiles[0],
    instCodeFileName: args.inputFiles[1],
    inlineSourceMap: true,
    inlineSource: true
};

const instResult = J$.instrumentCode(options);

if (!instResult) {
    throw 'Error instrumenting'; 
}

const instrumentedCode = instUtil.applyASTHandler(instResult, null, J$);
fs.writeFileSync(args.inputFiles[1].replace(/.js$/, ".json"), instResult.sourceMapString, "utf8");
fs.writeFileSync(args.inputFiles[1], instrumentedCode, "utf8");
