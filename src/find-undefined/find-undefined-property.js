/**
 * Dynamic analysis for undefined properties
 * 
 * The script will read extracted properties from nodeExtractedPropertyPath and 
 * set getter and setter in the root prototype for each extracted property
 * call the exported API and collect the undefined properties
 * 
 * 
 * extractedProps: where t find all extracted properties
 * testAPI: which exported APIs are going to test, change this one
 * exportedAPIs: all exported APIs function, easy for call by name, do not remove any
 * 
 * usage:
 *  node find-undefined-property.js hogan:hogan nodejs-lib:require nodejs:spawnSync
 * author: jackfromeast
 */
const fs = require('fs').promises;


const exportedAPIs = require('./exported_apis')
var banned = [
    4, // '4' would cause nodejs crash when calling runInNewContext
    "compile", // would cause hogan crash
    "f", // would cause hogan crash
    0, // would cause hogan crash
    "asString", // would cause hogan crash
    "delimiters", // would cause hogan crash
    "modelGet", // would cause hogan crash
    "disableLambda", // would cause hogan crash
]
var undefinedProperties = {}
var currAPI = ""
const extractedProps = []
const testAPI = [];
const args = process.argv.slice(2);

// loop through the arguments and split them into keys and values
args.forEach(arg => {
    const [key, value] = arg.split(':');
    extractedProps.push(key);
    testAPI.push(value);
  });
  

// define getter and setter inside Object.prototype given a property name
function defineHook(currProp){
    Object.defineProperty(
        Object.prototype,
        currProp, {
            get: function() {
                if(this[currProp + "_added"])
                    return this[currProp + "_added"];
                if (!banned.includes(currProp) && !undefinedProperties[currAPI].includes(currProp))
                    undefinedProperties[currAPI].push(currProp)
                return undefined;
            },
            set: function(val){
                this[currProp + "_added"] = val;
            },
            configurable: true
        }
    );
}

function deleteHooks(propNames){
    for (let prop of propNames){
        try{
            delete Object.prototype[prop.toString()]
        }
        catch(err){}
    }
}



function readPropertyNames(nodeExtractedPropertyPath) {
    return fs.readFile(nodeExtractedPropertyPath, 'utf8')
      .then(data => JSON.parse(data))
      .catch(err => {
        console.error(err);
        return {};
      });
  }

function addHooks(propertyNames) {
    for (var prop of propertyNames) {
        if(!banned.includes(prop)){
            try{
                defineHook(prop.toString());
            }
            catch(err){
                try{
                    console.log("[!] Cannot define getter/setter for: "+ prop)
                }
                catch(err){}
            }
        }
    }
}
  
async function findUndefined(propFilename, apiName) {
    try {
        let nodeExtractedPropertyPath = `/home/PPAEG/output/extracted-props/${propFilename}-extracted-props.json`
        let resultPath = `/home/PPAEG/output/undefined-props/${propFilename}-undefined-props.json`

        const propertyNames = await readPropertyNames(nodeExtractedPropertyPath);
        

        // initial
        let key = `${propFilename}-${apiName}`
        undefinedProperties[key] = []

        // group 16 properties as a chunk
        const chunkSize = 1;
        const chunks = [];
        for (let i = 0; i < propertyNames.length; i += chunkSize) {
            const chunk = propertyNames.slice(i, i + chunkSize);
            chunks.push(chunk);
        }
        for (let chunk of chunks) {
            addHooks(chunk);
            // use this line to debug which property cause the api crash
            console.log(chunk);
            try{
                exportedAPIs[apiName]();
            }
            catch(TypeError){
                console.log(`[-] Adding ${chunk} into the blacklist(banned).`);
            }
            
            deleteHooks(chunk);
        }

        console.log(`[+] Found undefined properties in ${key}: ${undefinedProperties[key].length}`)
        
        await fs.writeFile(resultPath, JSON.stringify(undefinedProperties, null, indent=4));
    } catch (err) {
        console.error(err);
    }
}

function main(){
    for (const [index, propFilename] of extractedProps.entries()) {
        const apiName = testAPI[index];

        findUndefined(propFilename, apiName)
    }
}

main()