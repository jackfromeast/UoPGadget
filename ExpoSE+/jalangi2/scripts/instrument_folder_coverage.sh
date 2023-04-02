#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for f in $(find $1 -name '*.js');
do
    name=$(echo $f | rev | cut -f 2- -d '.' | rev)
    echo $name
    if [ -f "$name.org" ]
    then
        mv $name.org $name.js
    fi
    node $DIR/../src/js/commands/loadjalangi.js --inlineIID --inlineSource --analysis $DIR/../src/js/sample_analyses/coverage/AddCoverage.js --analysis $DIR/../src/js/sample_analyses/coverage/SpecialCoverage.js "$name".js
    mv "$name".js "$name".org
    mv "$name"_jalangi_.js "$name".js
done
