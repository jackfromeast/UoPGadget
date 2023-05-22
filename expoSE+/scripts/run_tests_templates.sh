#!/bin/bash
# Usage:
# ./script.sh [template_name|all]
# - template_name: If specified, the script will only run tests for the template with this name.
#                  The template_name should be the name of a directory inside the project_root_path/expoSE+/test/template_engines directory.
# - all: If "all" is specified, or if no arguments are provided, the script will run tests for all templates.
#
# The script first changes to the project_root_path/expoSE+/test/template_engines directory.
# It then loops over each template engine directory (or just the specified template directory, if a template_name was provided).
# For each template directory, it does the following:
# - Changes to the template directory and installs npm packages.
# - Loops over app js files matching the pattern "app{-,[0-9]}.js" (such as "app.js", "app-1.js", etc.)
# - For each test case, defines the path for the undefined-file and the testcase, and runs a command with expoSE+.

# Define the project root path
project_root_path="/home/ubuntu/PPAEG"
timeout_per_testcase="5m"

# If an argument is passed
if [ $# -gt 0 ]; then
    templates=$1
else
    templates="*"
fi

# If the argument is "all", run tests for all templates
if [ "$templates" = "all" ]; then
    templates="*"
fi

# Change to the template_engines directory
cd $project_root_path/expoSE+/tests/template_engines

# Loop over each template engine directory
for template_dir in $templates/ ; do
  # Remove trailing slash from directory name
  template_name=${template_dir%?}
  
  # Go into the template directory
  cd $template_name
  
  # If node_modules does not exist, install npm packages
  if [ ! -d "node_modules" ]; then
    npm install
  fi
  
  # Loop over app js files
  for test_case in app-?.js ; do
    # Define the path for undefined-file
    undefined_file_path="$project_root_path/output/undefined-props-node/$template_name-undefined-props.json"
    
    # Define the path for the testcase
    test_case_path="$project_root_path/expoSE+/tests/template_engines/$template_name/$test_case"
    
    # Run the command with expoSE+
    bash $project_root_path/expoSE+/expoSE+ --timeout $timeout_per_testcase --undefined-file $undefined_file_path $test_case_path
  done
  
  # Go back to the template_engines directory
  cd ..
done
