/**
 * Test file for the gadgets detection
 */


var S$ = require('../../lib/S$')

function test(){
    var x = {}
    var result = ''

    var load = x.undefinedProp
    if(load.content == 'helloworld'){
        return result.xxx
    }else{
        return result
    }

}

function verify(){
    
    Object.prototype.undefinedProp = S$.pureSymbol('undefinedProp_undef')

    let result = test()

}

verify()


/**
 * {
    "source": "/home/ubuntu/PPAEG/expoSE+/tests/gadgets/gadgets.js",
    "start": 1683602738184,
    "end": 1683602752333,
    "undefinedMap": {
        "{\"_bound\":0,\"undefinedProp_undef_t\":\"undefined\"}": [
            "content"
        ],
        "{\"undefinedProp_undef_t\":\"object\",\"undefinedProp_undef_elements_content_0_t\":\"string\",\"undefinedProp_undef_elements_content_0\":\"helloworld\",\"_bound\":3}": [
            "xxx"
        ]
    },
    "done": [
        {
            "id": 0,
            "input": {
                "_bound": 0,
                "undefinedProp_undef_t": "undefined"
            },
            "stringifiedPC": "(not (= undefinedProp_undef_t \"object\"))",
            "alternatives": [
                {
                    "input": {
                        "undefinedProp_undef_t": "object",
                        "_bound": 1
                    },
                    "pc": "",
                    "forkIid": 465
                }
            ],
            "time": 3516
        },
        {
            "id": 1,
            "input": {
                "undefinedProp_undef_t": "object",
                "_bound": 1,
                "undefinedProp_undef_elements_content_0_t": "undefined"
            },
            "stringifiedPC": "(= undefinedProp_undef_t \"object\"),(not (= undefinedProp_undef_elements_content_0_t \"string\"))",
            "alternatives": [
                {
                    "input": {
                        "undefinedProp_undef_t": "object",
                        "undefinedProp_undef_elements_content_0_t": "string",
                        "_bound": 2
                    },
                    "pc": "",
                    "forkIid": 377
                }
            ],
            "time": 3473
        },
        {
            "id": 2,
            "input": {
                "undefinedProp_undef_t": "object",
                "undefinedProp_undef_elements_content_0_t": "string",
                "_bound": 2,
                "undefinedProp_undef_elements_content_0": "xxx"
            },
            "stringifiedPC": "(= undefinedProp_undef_t \"object\"),(= undefinedProp_undef_elements_content_0_t \"string\"),(not (= undefinedProp_undef_elements_content_0 \"helloworld\"))",
            "alternatives": [
                {
                    "input": {
                        "undefinedProp_undef_t": "object",
                        "undefinedProp_undef_elements_content_0_t": "string",
                        "undefinedProp_undef_elements_content_0": "helloworld",
                        "_bound": 3
                    },
                    "pc": "",
                    "forkIid": 8
                }
            ],
            "time": 3655
        },
        {
            "id": 3,
            "input": {
                "undefinedProp_undef_t": "object",
                "undefinedProp_undef_elements_content_0_t": "string",
                "undefinedProp_undef_elements_content_0": "helloworld",
                "_bound": 3
            },
            "stringifiedPC": "(= undefinedProp_undef_t \"object\"),(= undefinedProp_undef_elements_content_0_t \"string\"),(= undefinedProp_undef_elements_content_0 \"helloworld\")",
            "alternatives": [],
            "time": 3497
        }
    ]
}
 */