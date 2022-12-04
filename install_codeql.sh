wget https://github.com/github/codeql-cli-binaries/releases/download/v2.11.4/codeql-osx64.zip
unzip codeql-osx64.zip

path=$(pwd)
string='export PATH="'$path'/codeql:$PATH"'
echo $string >> ~/.bashrc
echo "appended $string to bash configurations"
source ~/.bashrc

echo "create CodeQL database for this repository"
codeql database create codeql-database --language javascript --source-root dataset 

echo "running analysis on undefined properties"
codeql database analyze --download codeql-database ../custom-js-queries/getPropertyName.ql --format=csv --output=undef-properties.csv --rerun
