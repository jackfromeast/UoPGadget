#!/bin/bash

sed -E 's/^([^,]*,){3}"([^"]*)".*$/\2/; /^prototype$/d' $1 > undef-properties.txt

# Set the input and output file names
input_file="undef-properties.txt"
output_file="getters.js"

# Initialize the output string
output_str="// Generated code for handling undefined properties\n\n"

# Read the input file and extract the property names
while read -r prop_name; do
  # Add a property handler for the current property name
  output_str+="Object.prototype.__defineGetter__('$prop_name', ()=>{\n"
  output_str+=" console.log('$prop_name property has been looked up!');\n"
  output_str+=" return undefined;\n"
  output_str+="})\n"
done < "$input_file"

# Save the output string to the output file
echo -e "$output_str" > "$output_file"

