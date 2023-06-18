#!/bin/bash
# Usage:
# ./script.sh [template_name1] [template_name2] ... [template_nameN]
# - template_nameX: If specified, the script will only run tests for the templates with these names.
#                  The template_nameX should be the names of directories inside the project_root_path/expoSE+/tests-pp/templates directory.
# - all: If "all" is specified, or if no arguments are provided, the script will run tests for all templates.
#
# The script first changes to the project_root_path/expoSE+/test/template_engines directory.
# It then loops over each template engine directory (or just the specified template directory, if a template_name was provided).
# For each template directory, it does the following:
# - Changes to the template directory and installs npm packages.
# - Loops over app-*.js files inside each "app-*" subdirectory.
# - For each test case, defines the path for the undefined-file and the testcase, and runs a command with expoSE+.

# Define the project root path
project_root_path="/home/ubuntu/ppaeg"
working_dir="${project_root_path}/expoSE+/tests-pp/templates-6-15"
# timeout_per_testunit="30m"
timeout_per_undefined="6m"
timeout_per_worker="1m"

# If no arguments are passed, run tests for all templates
if [ $# -eq 0 ]; then
    templates="*"
else
    # If arguments are passed, run tests for specified templates
    templates="$@"
fi


# Change to the template_engines directory
cd "$working_dir"


# Loop over each template engine directory
for template_name in $templates ; do
  if [ -d "$template_name" ]; then
    # Go into the template directory
    cd $template_name

    # If node_modules does not exist, install npm packages
    if [ ! -d "node_modules" ]; then
      npm install
    fi
    
    # Loop over each "app-*" subdirectory
    for app_dir in app-* ; do
      if [ -d "$app_dir" ]; then
        # Loop over app js files
        for test_case in "$app_dir"/*.js ; do
          # Extract the file number (app-0.js -> 0)
          file_num=$(basename "${test_case}" .js | cut -d '-' -f 2)
          
          echo "[+] Processing ${working_dir}/${template_name}/${test_case}"

          current_dir="${working_dir}/${template_name}/$(basename ${test_case} .js)"
          
          # Define the path for undefined-file
          undefined_pool_path="${current_dir}/undefined-props-${file_num}.json"
          undefined_ut_path="${current_dir}/undefined-props-ut.json"

          # Define the path for the testcase
          test_case_path="${working_dir}/${template_name}/$test_case"
          
          # Run the command with expoSE+
          bash $project_root_path/expoSE+/expoSE+ --per-timeout $timeout_per_worker --undef-per-timeout $timeout_per_undefined --undefined-file $undefined_pool_path --undefined-utq $undefined_ut_path $test_case_path
        done
      fi
    done
    
    # Go back to the template_engines directory
    cd ..
  else
    echo "Directory $template_name does not exist. Skipping."
  fi
done
