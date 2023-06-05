/** Preamble generates a Jalangi2 preamble given a set of analysis **/

const acorn = require("acorn");

try {
const babel = require("@babel/core");
} catch (e) {}

const fs = require("fs");
const path = require("path");
const instUtil = require("../instrument/instUtil");
const ArgumentParser = require("argparse").ArgumentParser;
const EXTRA_SCRIPTS_DIR = "__jalangi_extra";

function getJalangiRoot() {
    return path.join(__dirname, '../../..');
}

require('../headers').headerSources.forEach(header => {
    require(path.join(getJalangiRoot(), header));
});

const parser = new ArgumentParser({
    addHelp: true,
    description: "Utility to apply Jalangi instrumentation to files or a folder."
});

parser.addArgument(['--analysis'], {
    help: "Analysis script.",
    action: "append"
});

parser.addArgument(['--initParam'], {
    help:"initialization parameter for analysis, specified as key:value", action:'append'
});

parser.addArgument(['--extra_app_scripts'], {
    help: "list of extra application scripts to be injected and instrumented, separated by path.delimiter" 
});

const options = parser.parseArgs();

instUtil.setHeaders();

const preambleData = instUtil.getScriptsToLoad(options.analysis,
    options.initParam,
    options.extra_app_scripts ? options.extra_app_scripts.split(path.delimiter) : [],
    EXTRA_SCRIPTS_DIR,
    getJalangiRoot());

preambleData.forEach(script => {
    console.log('' + script);
});
