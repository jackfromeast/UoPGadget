#!/bin/bash

# Be careful! This script deletes files recursively without any confirmation.

pattern="isolate-*-v8.log"

find . -type f -name "$pattern" -exec rm -rf {} \;
