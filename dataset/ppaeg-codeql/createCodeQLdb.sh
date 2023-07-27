#!/bin/bash
#
# USAGE: cd dataset/ppaeg-codeql && ./createCodeQLdb.sh ./
 
# Prompt the user to enter a parent directory
read -p "Enter the path to the parent directory: " parent_dir

# Check if the parent directory exists
if [ ! -d "$parent_dir" ]; then
  echo "Error: '$parent_dir' is not a directory"
  exit 1
fi

# Loop through all child directories
for child_dir in "$parent_dir"/*; do
  if [ -d "$child_dir" ]; then
    # Check if a "-db" directory exists
    if [ ! -d "${child_dir}-db" ]; then
      # If not, create one using the "codeql database create" command in the child directory
      echo "Creating CodeQL database for ${child_dir}"
      (cd "$child_dir" && /home/ubuntu/codeql/codeql database create --language=javascript --source-root "./${child_dir}-code" "./${child_dir}-db")
    fi
  fi
done

echo "Done."