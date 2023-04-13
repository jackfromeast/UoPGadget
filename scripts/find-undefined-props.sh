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
script_dir="$(dirname "$(realpath "$0")")"
output_base="${script_dir}/../output/undefined-props-node"
find_undefined_node="${script_dir}/../find-undefined-node/node-find-undefined"
clean_script="${script_dir}/../find-undefined-node/clean_undefined.py"

# Create the output directory if it does not exist
mkdir -p "${output_base}"

# Iterate over each subdirectory and run node app.js
for dir in "${parent_dir}"/*; do
    if [ -d "${dir}" ]; then
        subdir_name=$(basename "${dir}")
        output_path="${output_base}/${subdir_name}-undefined-props-raw.txt"
        output_clean_path="${output_base}/${subdir_name}-undefined-props.json"

        echo "[+] Processing ${dir}"
        # pushd "${dir}" > /dev/null
        cd "${dir}"
        "${find_undefined_node}" app.js > "${output_path}" 2>&1
        python3 "${clean_script}" "${output_path}" > "${output_clean_path}" 2>&1
        # popd > /dev/null
        cd ..
    fi
done

echo "Finished processing all subdirectories."
