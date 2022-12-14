# The shell script for pre-analysis

## Prerequisites
## Place the test files in the same way as shown in the example folder

## Generate the codeql database for the test unit
#### to extract node_modules
cd /home/PPAEG/src/pre-analysis/test/
LGTM_INDEX_FILTERS=include:**/node_modules 
codeql database create test_db --language=javascript --source-root /home/PPAEG/src/pre-analysis/test/test_unit

## Run the codeql queries
codeql database analyze ./test/test_db ../queries/getFullObject.ql --output ./ql-results.csv --format=csv
codeql database analyze ./test/test_db ../queries/findAllString.ql --output ./strings.csv --format=csv
codeql database analyze ./test/test_db ../queries/findProperty2Sink.ql --output ./flow_to_sinks.csv --format=csv

## To extracted 'real' object structure
cp -r ./test_unit ./test_unit_tmp
#### the source code inside test_unit_tmp should be added, might need manual check
node ../scripts/add_logger.js
#### run the test.js and generate logged_raw_objects.json file
node ./test_unit_tmp/test.js
#### process the logged stringlike objects
node ../scripts/get_objects.js
#### would generate parsed_objects.json file and send to the fuzzer