const fs = require('fs');
const path = require('path');

const exportedAPIs = require('./exported_apis');

const extractedPropsPath = '/home/ubuntu/PPAEG/output/silent-spring/extracted-props/';
const undefinedPropsPath = '/home/ubuntu/PPAEG/output/silent-spring/undefined-props/';

let banned = ['FORCE_COLOR', 'NODE_DISABLE_COLORS', 'NO_COLOR', 'TMUX', 'CI','TEAMCITY_VERSION' ];

function poluteAll(props, accessed) {
    let proto = Object.prototype;
    props.push("contextExtensions");
    for (let i = 0; i < props.length; i++) {                
        let currProp = props[i];
        if (!proto.hasOwnProperty(currProp) && currProp != "get" && props[i] != "set" && props[i] != "writable" && props[i] != "enumerable" && props[i] != "value" && props[i] != "prototype" &&  props[i] != "__proto__" &&  props[i] != 4)
            Object.defineProperty(proto, currProp, { get: function() { if(this[currProp + "cs"]) return this[currProp + "cs"]; if (currProp != "configurable" && !banned.includes(currProp)) accessed.add(currProp); return undefined; }, set: function(val){ this[currProp + "cs"] = val} });
    }
}

function main() {
    const prototype = Object.prototype;
    for (const apiName in exportedAPIs) {
        if(apiName == 'jade'){
            continue;
        }
        try {
            const extractedPropsFile = path.join(extractedPropsPath, `${apiName}-extracted-props.json`);
            const undefinedPropsFile = path.join(undefinedPropsPath, `${apiName}-undefined-props.json`);

            const props = JSON.parse(fs.readFileSync(extractedPropsFile, 'utf8'));
            global.accessed = new Set();

            poluteAll(props, global.accessed);

            // Run the API
            try {
                exportedAPIs[apiName]();
            } catch (e) {
                console.error(`[!] Error running API "${apiName}":`, e);
            }

            // Clean up hooks
            // for (const prop of props) {
            //     delete Object.prototype[prop];
            // }
            Object.prototype = prototype;
            
            console.log(undefinedPropsFile)
            console.log(global.accessed)
            // Write the results
            fs.writeFileSync(undefinedPropsFile, Array.from(global.accessed).join('\n'));
        } catch (e) {
            console.error(`[!] Error processing API "${apiName}":`, e);
        }
    }
}

main();