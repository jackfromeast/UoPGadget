# AEG for Prototype Pollution

![logo](https://github.com/jackfromeast/PPAEG/blob/master/.assets/ppaeg.logo.png)

Please refer to [our wiki page](https://github.com/jackfromeast/PPAEG/wiki/home) for more information!

## Installment

If this system is still a private repo, please follow the link and clone the repo through your github token:

```
git clone https://<your_private_token>@github.com/jackfromeast/ppaeg.git
```

#### install node v14

install nvm to control the nodejs version:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm install 14
```

#### install codeql
CodeQL need to be installed for two reason: 1/ compared with slient-spring 2/could us find the sink in the codebase as an prelimiary selection.
I recommand install both codeql cli and codeql plugin for vscode.

To download the codeql cli, we can just download its release file:
```
cd ~
wget https://github.com/github/codeql-cli-binaries/releases/download/v2.13.3/codeql-linux64.zip
cd /path/to/ppaeg/silent-spring/codeql/queries
/path/to/codeql/codeql pack install
```

Setup the codeql database for each codebase placed in the ./dataset/ppaeg-codeql:
```
cd /path/to/ppaeg/ppaeg-codeql/
bash ./dataset/ppaeg-codeql/createCodeQLdb.sh
```


#### Install the dependency of each compoent

download dependency for codebases in the dataset at different location:

````
bash ./scripts/npm-install.sh ./dataset/ppgadgets
bash ./scripts/npm-install.sh ./dataset/pptestunits
bash ./scripts/npm-install.sh /home/ubuntu/ppaeg/expoSE+/pptests/template_engines
````

To set the dependency for ExpoSE+:
```
sudo apt-get update
sudo apt-get install build-essential

cd expoSE+
npm install # this will take 20 mins

cd node_modules/z3javascript
run npm build
```

## Getting started with ExpoSE+

ExpoSE+ is a our concolic execution engine for javascript, capable of symbolically executing designated variables while concretely executing a program. The primary aim of this execution engine is to detect prototype pollution gadgets. Depending on the specific task or goal, ExpoSE+ offers multiple execution options.

#### vanilla option

+ **goal**

    In this mode, ExpoSE+ concolically executes a program with specified symbolic variables. This mode is often used for ExpoSE+ engine utility testing and test replay.

+ **how to specify the symbolic variable**: 

    1. For regular use, specify it directly in the test program. Refer to the following code snippet:

        ```
        // test.js
        var S$ = require('/path/to/S$');
        
        var symbol = S$.pureSymbol('symbol');
        
        function test(symbol){
        	//...
        }
        
        test()
        ```

    2. For test replay, to make the backend aware of the under-testing undefined property, use the API to pollute the prototype as shown below:

        ```
        var S$ = require('/path/to/S$');
        
        var propName = 'xxx';
        var propValue = S$.pureSymbol('xxx_undef');
        Object._expose.setupASymbol(propName, propValue);
        ```

+ **how to specify the initial input for the symbolic variables**

    You can specify the initial input via the command line argument:

    (**FIXME**: there is no reason that we cannot specify the input in the test file and with the definition of the symbolic variables)

    ```
    ./expoSE --input "{\"symbol_t\": \"array_string\", \"symbol\": [\"astring\"], \"_bound\": 1}" test.js
    ```

#### main property only option:

+ **goal**

    This mode is designed to discover the main property of the test file given a set of undefined properties identified through our instrumented Node.js.

+ **how to specify the symbolic variable**: 

    Initial undefined properties can be specified through the command line argument like this:

    ```
    ./expoSE --undefined-utq /path/to/temp-ut.json test.js
    ```

    Format of `temp-ut.json` should resemble the example below. Each array item in the JSON object will be tested separately as a group of undefined properties. This file can be automatically generated from `undefined-props.json` through the `find-undefined-node/convert-ut.js` script.

    ```
    // /path/to/temp-ut.json
    [
      [
        "_handle"
      ],
      [
        "initialize"
      ],
      [
        "value"
      ]
    ]
    ```

+ **how to specify the symbolic input**: 

    Currently, ExpoSE+ does not support providing input for each undefined property. They all will start as a `pureSymbol` and determine their type and value based on the path constraints.

#### patching property option:

+ **goal** 

    This mode will also enqueue potential helper properties for testing while discovering the main property for the test file.

+ **how to specify the symbolic variable**: 

    In addition to the `--undefined-utq` argument, also include the `--patch` argument.

    ```
    ./expoSE --patch --undefined-utq /path/to/temp-ut.json test.js
    ```

+ **how to specify the symbolic input**:

    Similar to the main property only option, we don't think it is necessary to specify the input for the main undefined property under testing or the helper property.

#### chained property option:

+ **goal** 

    This mode will enqueue potential chained properties for testing while discovering the main property for the test file. This option is compatible with the patching property option. 

+ **how to specify the symbolic variable**: 

    Besides `--undefined-utq` argument, we will also add `--chain` argument. Also, `--undefined-file` argument is needed as we will add the newly discovered undefined properties that are not in the initial undefined pool to the test queue.

    ```
    ./expoSE --chain --undefined-file /path/to/undefined-props.json --undefined-utq /path/to/temp-ut.json test.js
    ```

    The `undefined-props.json` file should has the following format. The file is automatically generated by executing`find-undefined-node/extract-key.js`  script on the raw output of the instrumented nodejs.

    ```
    {
    	"itemAlias": "/home/ubuntu/ppaeg/expoSE+/tests-pp/templates-6-15/node-blade/node_modules/blade/lib/compiler.js",
    	"prependSpace": "/home/ubuntu/ppaeg/expoSE+/tests-pp/templates-6-15/node-blade/node_modules/blade/lib/compiler.js",
    	"line": "/home/ubuntu/ppaeg/expoSE+/tests-pp/templates-6-15/node-blade/node_modules/blade/lib/compiler.js"
    }
    ```

+ **how to specify the symbolic input**:

    Similar to the main property only option, we don't think it is necessary to specify the input for the main undefined property under testing or the helper property.

