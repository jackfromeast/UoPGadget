/**
 * Extract direct property names from the source file
 * could specify multi codebases in the /home/PPAEG/dataset/ppaeg-codeql
 * 
 * usage:
 * node extract-property-silent-spring.js hogan, ejs
 */

let wrench = require("wrench");
const {Parser} = require("acorn")
let estraverse = require("estraverse");
let fs = require("fs");

const codebaseNames = process.argv.slice(2);
// let codeSrcRootPath = `../../dataset/ppaeg-codeql/${codebaseName}`
// let outputPath = `../../output/${codebaseName}-extracted-props.json`

function analyzeProps(targetDir) {
    let files = wrench.readdirSyncRecursive(targetDir);
    let props = new Set();
    files = files.filter((file) => file.match(/.*\.js$/)); 
    for (let i = 0; i < files.length; i++) {
        // console.log(`${i} ${props.size}`);
        let file = files[i];
        try {
            let ast = Parser.parse(fs.readFileSync(`${targetDir}/${file}`).toString());
            estraverse.traverse(ast, {
                enter: function (node, parent) {
                    if (node.type == 'MemberExpression') {
                        if (node.property.type === "Identifier")
                            return props.add(node.property.name);
                        if (node.property.type === "Literal")
                            return props.add(node.property.value);
                    }
                }
            });
        } catch(e) {
            console.log(e);
            // best effort
        }
    }
    return Array.from(props);
}

// const props = analyzeProps(codeSrcPath)
// console.log("Total properties: " + props.length)
// fs.writeFileSync(outputPath, JSON.stringify(props));

function extractProps(){

    for (var codebaseName of codebaseNames){
        let codeSrcPath = `../../dataset/ppaeg-codeql/${codebaseName}`
        let outputPath = `../../output/extracted-props/${codebaseName}-extracted-props.json`

        const props = analyzeProps(codeSrcPath)
        console.log(`[+] Found total properties for ${codebaseName}: ${props.length}`)
        fs.writeFileSync(outputPath, JSON.stringify(props));
    }

}

extractProps()