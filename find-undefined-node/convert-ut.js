/**
 * This script is used to convert undefined-props-*.json to undefined-ut.json
 * undefined-ut.json can be used as the undefined under test queue.
 * 
 * Usage: node convert-undef-ut.js <input-file> <output-file>
 * 
 * we can also use the strict mode, meaning we only select the undefined props that comes from the codebase it self.
 */
const fs = require('fs');

// Reading command-line arguments
const inputPath = process.argv[2];
const outputPath = process.argv[3];
const codebase = process.argv[4] || 'unknown';

function filterKeys(key, path) {
    if(codebase === 'unknown'){
        return true;
    }else{
        if (path.includes(`/node_modules/${codebase}`)){
            return true;
        }else{
            return false;
        }
    }
}

fs.readFile(inputPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Failed to read file', err);
    return;
  }

  const json = JSON.parse(data);

  // Extracting keys and wrapping them in arrays
  let selectedkeys = Object.keys(json).filter(key => filterKeys(key, json[key]));
  selectedkeys = selectedkeys.map(key => [key]);

  // Write to output file
  fs.writeFile(outputPath, JSON.stringify(selectedkeys, null, 2), (err) => {
    if (err) {
      console.error('Failed to write file', err);
      return;
    }
  });
});
