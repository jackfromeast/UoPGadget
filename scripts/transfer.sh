#!/bin/bash
: '
This script is used to automatically transfer the codebases from the database to the working directory.

The codebase in the database has the following structure:
    pptestunits
    ├── codebase1
    │   ├── node_modules
    │   ├── views
    │   │   ├── template1
    │   │   ├── template2
    │   │   ├── ...
    │   ├── app-0.js
    │   ├── app-1.js
    │   ├── app-2.js
    │   ├── ...
    ├── codebase2
    ├── ...

The working dir has the following structure:
    template-engines
    ├── codebase1
    │   ├── node_modules
    │   │   ├── ...
    │   │
    │   ├── app-0
    │   │   ├── app-0.js
    │   │   ├── undefined-props-0.json
    │   │   ├── undefined-props-ut.json
    │   │   ├── views
    │   │   │   ├── template1
    │   │   │   ├── template2
    │   │   │   ├── ...
    │   │
    │   ├── app-1
    │   ├── ...
    │   
    ├── codebase2
    ├── ...

Usage:
    ./transfer.sh <source_path> <destination_path> [codebase1] [codebase2] [codebase3] ...

    if we want to transfer all codebases, we can use input nothing as the last argument.
'


# First argument is source path, second argument is destination path
src="$1"
dest="$2"

# Shift arguments to leave codebase names
shift 2

# Check if source and destination paths are provided
if [[ -z "$src" || -z "$dest" ]]; then
    echo "Please provide both source and destination paths"
    exit 1
fi

# Check if source and destination paths are valid
if [[ ! -d "$src" ]]; then
    echo "Source path is not a valid directory"
    exit 1
fi

# If the dest path isn't exist, create it
mkdir -p "$dest"

# Loop over all codebase directories in the source path
for codebase in "$src"/*; do
    # Check if it's a directory
    if [[ -d "$codebase" ]]; then
        # If specific codebases are provided, check if current one matches
        if (( $# > 0 )); then
            if ! [[ " $@ " =~ " $(basename "$codebase") " ]]; then
                continue
            fi
        fi

        # log
        echo "[+] Processing $(basename "$codebase")"
        
        mkdir -p "$dest/$(basename "$codebase")"

        # Check whether these exist before copying
        [[ -f "$codebase/package.json" ]] && cp "$codebase/package.json" "$dest/$(basename "$codebase")/package.json"
        [[ -f "$codebase/package-lock.json" ]] && cp "$codebase/package-lock.json" "$dest/$(basename "$codebase")/package-lock.json"
        [[ -d "$codebase/views" ]] && cp -R "$codebase/views" "$dest/$(basename "$codebase")/views"

        # Change directory to destination path and install the dependencies
        cd "$dest/$(basename "$codebase")"
        npm install

        # Loop over all app-*.js files in the codebase directory
        for app in "$codebase"/app-*.js; do
            # Check if it's a file
            if [[ -f "$app" ]]; then
                # Create a new directory for the app
                mkdir -p "$dest/$(basename "$codebase")/$(basename "$app" .js)"

                # Copy the app file
                cp "$app" "$dest/$(basename "$codebase")/$(basename "$app" .js)/$(basename "$app")"

                # Check whether views are already copied
                if [[ ! -L "$dest/$(basename "$codebase")/$(basename "$app" .js)/views" && -d "$dest/$(basename "$codebase")/views" ]]; then
                    # Create soft link to the shared views directory
                    ln -s "$dest/$(basename "$codebase")/views" "$dest/$(basename "$codebase")/$(basename "$app" .js)/views"
                fi
            fi
        done
    fi
done
