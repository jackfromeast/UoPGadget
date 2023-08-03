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
    # If the -time.txt file does not exist in the directory, perform the analysis
    if [ ! -f "${child_dir}/${child_dir##*/}-time.txt" ]; then
      # Time the query execution and save the time output
      echo "Analyzing ${child_dir}-db"
      ( cd "$child_dir" && time /home/ubuntu/codeql/codeql database analyze "./${child_dir}-db" --format sarif-latest --output "./${child_dir}-results.sarif" --rerun --no-save-cache --no-default-compilation-cache /home/ubuntu/UoPGadget/silent-spring/codeql/queries/exortedAPIFilter.ql) 2> "${child_dir}/${child_dir##*/}-time.txt"
    else
      echo "Skipping ${child_dir}, -time.txt file exists."
    fi
  fi
done

echo "Done."