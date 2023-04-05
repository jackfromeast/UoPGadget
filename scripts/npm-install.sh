#!/bin/bash

# Check if the user provided a path
if [ -z "$1" ]; then
    echo "Please provide a path as the first argument."
    exit 1
fi

# Ensure the path exists
if [ ! -d "$1" ]; then
    echo "The path \"$1\" does not exist or is not a directory."
    exit 1
fi

parent_dir="$(realpath "$1")"

# Iterate over each subdirectory and run npm install
for dir in "${parent_dir}"/*; do
    if [ -d "${dir}" ]; then
        echo "Entering ${dir}"
        pushd "${dir}" > /dev/null
        npm install
        popd > /dev/null
    fi
done

echo "Finished processing all subdirectories."
