#!/bin/bash

# Check if directory path is provided
if [ -z "$1" ]
then
    echo "No directory supplied. Usage: ./script.sh /path/to/directory"
    exit 1
fi

# Get the directory path from the first argument
DIRECTORY=$1

# Use find command to locate the files and delete them
find "$DIRECTORY" -type f -name 'app-*-*-*-*-*-*-log.json' -exec echo "Deleting file {}" \; -exec rm {} \;

