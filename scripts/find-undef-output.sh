#!/bin/bash
:'
This script is used to automatically run the test units in the database(./dataset/pptestunits/) on our instrumented nodejs and extract the undefined properties. The output is stored in ./output/undefined-props-node-new/codebase/


Usage: 
    bash ./find-undef-output.sh <path> [specific_subdir]
'

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
specific_dir="$2"
script_dir="$(dirname "$(realpath "$0")")"
output_base="${script_dir}/../output/undefined-props-node-new"
find_undefined_node="${script_dir}/../find-undefined-node/node-find-undefined"
clean_script="${script_dir}/../find-undefined-node/extract-key.js"

# Iterate over each subdirectory and run node app-?.js
for dir in "${parent_dir}"/*; do
    if [ -d "${dir}" ]; then
        subdir_name=$(basename "${dir}")

        # Skip this iteration if specific directory is set and it doesn't match the current subdir
        if [ -n "$specific_dir" ] && [ "$specific_dir" != "all" ] && [ "$subdir_name" != "$specific_dir" ]; then
            continue
        fi

        subdir_output_base="${output_base}/${subdir_name}"

        # Create the output subdirectory if it does not exist
        mkdir -p "${subdir_output_base}"

        # Iterate over each app-?.js file
        for app_file in "${dir}"/app-*.js; do
            # Extract the file number (app-0.js -> 0)
            file_num=$(basename "${app_file}" .js | cut -d '-' -f 2)
            output_path="${subdir_output_base}/undefined-props-raw-${file_num}.txt"
            output_clean_path="${subdir_output_base}/undefined-props-${file_num}.json"

            echo "[+] Processing ${app_file}"
            cd "${dir}"
            "${find_undefined_node}" --jitless "${app_file}" > "${output_path}" 2>&1
            node "${clean_script}" "${output_path}" "${output_clean_path}"
            cd ..
        done
    fi
done

echo "Finished processing all subdirectories."