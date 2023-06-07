#!/bin/bash
: '
This script is used to automatically run the test units in the database(./template-engines/) on our instrumented nodejs and extract the undefined properties. The output is stored in the same directory with the app file.


Usage: 
    bash ./find-undef-work.sh <path> [specific_subdir]
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
find_undefined_node="${script_dir}/../find-undefined-node/node-find-undefined"
clean_script="${script_dir}/../find-undefined-node/extract-key.js"
convert_script="${script_dir}/../find-undefined-node/convert-ut.js"

# Iterate over each subdirectory and run node app-?.js
for dir in "${parent_dir}"/*; do
    if [ -d "${dir}" ]; then
        subdir_name=$(basename "${dir}")

        # Skip this iteration if specific directory is set and it doesn't match the current subdir
        if [ -n "$specific_dir" ] && [ "$specific_dir" != "all" ] && [ "$subdir_name" != "$specific_dir" ]; then
            continue
        fi

        # Iterate over each "app-*" directory
        for app_dir in "${dir}"/app-*; do
            if [ -d "${app_dir}" ]; then
                # Extract the directory number (app-0 -> 0)
                dir_num=$(basename "${app_dir}" | cut -d '-' -f 2)

                # Iterate over each app-?.js file inside "app-*" directory
                for app_file in "${app_dir}"/*.js; do
                    # Extract the file number (app-0.js -> 0)
                    file_num=$(basename "${app_file}" .js | cut -d '-' -f 2)
                    output_path="${app_dir}/undefined-props-raw-${file_num}.txt"
                    output_clean_path="${app_dir}/undefined-props-${file_num}.json"

                    echo "[+] Processing ${app_file}"
                    "${find_undefined_node}" --jitless "${app_file}" > "${output_path}" 2>&1
                    node "${clean_script}" "${output_path}" "${output_clean_path}"

                    # Convert the undefined properties to ut json
                    output_ut_path="${app_dir}/undefined-props-ut.json"
                    node "${convert_script}" "${output_clean_path}" "${output_ut_path}"
                done
            fi
        done
    fi
done

echo "Finished processing all subdirectories."

# Clean up the v8.log files
bash "${script_dir}/clean-v8-log.sh" "${script_dir}/../"
