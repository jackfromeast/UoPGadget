echo "[*]-----------Find Undefined Property in: $1-------------------------\n"

ppaeg_root_path=$(pwd)
fcase=$1
cd $(echo "${ppaeg_root_path}/work/$1/")

echo "\033[32m[+] create CodeQL database for this test case ...\033[0m"
export LGTM_INDEX_FILTERS=include:**/node_modules 
codeql database create fcase-db --language javascript --source-root ${ppaeg_root_path}/work/$fcase/test_unit/ 

echo "\033[32m[+] running analysis on undefined properties ...\033[0m"
codeql database analyze --download fcase-db ${ppaeg_root_path}/src/find-undefined/queries/getPropertyName.ql --format=csv --output=${ppaeg_root_path}/work/$fcase/accessed_properties.csv


bash ${ppaeg_root_path}/src/find-undefined/add_hook.sh accessed_properties.csv ./test_unit_tmp/test.js
