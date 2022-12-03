wget https://github.com/github/codeql-cli-binaries/releases/download/v2.11.4/codeql-osx64.zip
unzip codeql-osx64.zip

path=$(pwd)
string='export PATH="'$path'/codeql:$PATH"'
echo $string >> ~/.bashrc
echo "appended $string to bash configurations"
source ~/.bashrc


echo "create CodeQL database for this repository"
codeql database create codeql-database --language javascript --source-root case0
echo "running a test analysis"
codeql database analyze --download codeql-database codeql/javascript-queries:Declarations/UnusedVariable.ql --format=csv --output=unused-var.csv

echo "running analysis on undefined properties"
codeql database analyze --download codeql-database dataset/UnusedVariable.ql --format=csv --output=undef-properties.csv
