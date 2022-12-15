#!/bin/bash

sed -n 's/^[^,]*,[^,]*,[^,]*,\([^,]*\),.*$/\1/p' $1 | grep -v "prototype" | sed -e 's/$/,/' -e '1s/^/{\n/' -e '$s/$/\n}/' -e '$s/,//' > properties.json
sed -E 's/^([^,]*,){3}"([^"]*)".*$/\2/; /^prototype$/d' $1 | sort | uniq -u > properties.txt

# Set the input and output file names
input_file="properties.txt"
output_file="test_undefined.js"

# Initialize the output string
output_str="// Generated code for handling undefined properties\n\n"

# Read the input file and extract the property names
while read -r prop_name; do
  # Add a property handler for the current property name
  output_str+="Object.defineProperty(\n"
  output_str+="    Object.prototype,\n"
  output_str+="    '$prop_name', {\n"
  output_str+="      get: function() {\n"
  output_str+="         if(this['$prop_name' + 'ppaeg']){\n"
  output_str+="           return this['$prop_name' + 'ppaeg'];}\n"
  output_str+="         else{\n"
  output_str+="           console.log('$prop_name property has been looked up!')\n"
  output_str+="           return undefined;}\n"
  output_str+="       },\n"
  output_str+="       set: function(val){\n"
  output_str+="        this['$prop_name' + 'ppaeg'] = val;\n"
  output_str+="       }\n"
  output_str+="     }\n"
  output_str+="   );\n"
done < "$input_file"

# test_unit_tmp
cp -r ./test_unit ./test_unit_tmp

# Save the output string to the output file
echo -e "$output_str" > "./test_unit_tmp/$output_file"
cat $2 >> "./test_unit_tmp/$output_file"
