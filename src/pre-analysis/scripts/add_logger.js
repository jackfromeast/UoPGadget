const fs = require("fs");
const { parse } = require("csv-parse");
const { resolve } = require("path");

/**
 * TODO: Limit the analyzed files through function call graph analysis
 */
var PATH_INCLUDE = [
    "/fcase1.js",
    "/node_modules/hogan.js/lib/compiler.js",
    "/node_modules/hogan.js/lib/hogan.js",
    "/node_modules/hogan.js/lib/template.js"
]

// var ORI_PATH_SUFFIX = "src/pre-analysis/test5/test_unit"
// var WORK_PATH_SUFFIX = "src/pre-analysis/test5/test_unit_tmp"
var ORI_PATH_SUFFIX = "./test_unit"
var WORK_PATH_SUFFIX = "./test_unit_tmp"

var found_object_base = []

function read_csv(){
   return new Promise((resolve, reject) => {
    fs.createReadStream("./ql-results.csv")
    // fs.createReadStream("src/pre-analysis/test5/ql-results.csv")
    .pipe(parse({ delimiter: ",", from_line: 1}))
    .on("data", function (row) {
        if(PATH_INCLUDE.indexOf(row[4])!=-1){
            let item = {
                "base": row[3].split('---')[0].split('|')[0].slice(3, -1),
                "filename": row[4],
                "startline": parseInt(row[5]),
                "endline": parseInt(row[7]),
                "statement_endline":parseInt(row[3].split('---')[2].split('|')[0].slice(3, -1)),
                "function_endline":parseInt(row[3].split('---')[3].split('|')[0].slice(3, -1))
            }
            if(found_object_base.indexOf(item)==-1){
                found_object_base.push(item);
            }


        }
    })
    .on('end', () => {
        resolve(found_object_base);
    })
}) 
}

/* 
    retrun the express that appears as the first argument of util.inspect()
*/
function selectBase(base){
    var ignoreLike = /[\.]{3}/;
    var lineBreakLike = /[\n]+/;

    var identifierLike = /(?<=[\]\}]*)[$A-Za-z_][0-9A-Za-z_$]*(?=[\]\}]*)/i
    
    // the most easy case: varaiable name
    // but also handle other valid expression
    // tokens[j]    => tokens[j] 
    // [context]    => context
    // {node}       => node
    if(identifierLike.test(base)){
        return identifierLike.exec(base);
    }
    else if(ignoreLike.test(base)){
        return -1;
    }
    else if(lineBreakLike.test(base)){
        return -1;
    }
    else{
        return -1;
    }

}

/*
    append the logger code
    To aviod add line in side a statement, outside a function,
    get the statment's start line and end line of the property reference(rather than expr itself)
    get the func's boundary of the property reference 

    known limitation: could not handle property reference in return statement

*/
function appendFile(filename, append_items){
    const filedata = fs.readFileSync(ORI_PATH_SUFFIX+filename, 'utf8').split('\n');
    let append_line_count = 0;
    for (let index in append_items){
        let obj = append_items[index];
        
        if(selectBase(obj.base)!==-1){
            // get the endline of its statement, however, the statement shouldn't be the last line of the function
            if(obj.statement_endline >= obj.function_endline-1){
                continue;
            }

            // logger_code: try{__ppaeg_logger.push(__ppaeg_util.inspect(upperLayerNode, __ppaeg_options))}catch(e){};
            let logger_code = "try{global.__ppaeg_logger.push(global.__ppaeg_util.inspect(" + selectBase(obj.base) + ", global.__ppaeg_options))}catch(e){};"

            filedata.splice(obj.statement_endline+append_line_count, 0, logger_code);
            append_line_count++;
        }
    }

    fs.writeFileSync(WORK_PATH_SUFFIX+filename, filedata.join('\n'), 'utf8')
}

/**
 * append logger code at the beginning and the end of test main file
 */
function appendLoggerCode(){
    let header = "const fs = require('fs');\nglobal.__ppaeg_util = require('util')\nglobal.__ppaeg_options = {showHidden:true, depth:3,compact:true, maxArrayLength:2, maxStringLengthL:30}\nglobal.__ppaeg_logger = []";
    let footer = "fs.writeFile('../logged_objs.json', JSON.stringify(__ppaeg_logger, null, '\t'), 'utf8', ()=>{});"

    let filedata = fs.readFileSync(ORI_PATH_SUFFIX+'/test.js', 'utf8').split('\n');
    
    filedata.splice(0, 0, header);
    filedata.splice(filedata.length+1, 0, footer);
    fs.writeFileSync(WORK_PATH_SUFFIX+'/test.js', filedata.join('\n'), 'utf8')
}

/**
 * sort the found_object_base by filename
 */
function groupbyFilename(found_object_base){
    let grouped_found_objects = {};

    for (let index in found_object_base){
        let obj = found_object_base[index]
        if(!grouped_found_objects.hasOwnProperty(obj.filename)){
            grouped_found_objects[obj.filename] = [];
        }
        grouped_found_objects[obj.filename].push(obj);
    }

    return grouped_found_objects;
}


read_csv
    .then((found_object_base)=>{
        found_object_base = groupbyFilename(found_object_base);

        for (let filename in found_object_base){
            appendFile(filename, found_object_base[filename]);
        }
        
        appendLoggerCode();

        fs.writeFile('./append_code.json', JSON.stringify(found_object_base, null, "\t"), 'utf8', ()=>{});
    
    })



