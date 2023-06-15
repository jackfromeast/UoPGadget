const fs = require('fs');
const path = require('path');

function extractInfo(content) {
  const sections = content.split(/-{10,}Undefined Property Found-{10,}/);

  const result = {};
  sections.forEach(section => {
    const keyNameMatch = section.match(/KeyName:[^#>\n]*(#|>)(.*)/);
    const sourceFileMatch = section.match(/Source File:.*(\#|uc"|")([^"\n]+)\"?/);

    if (keyNameMatch && sourceFileMatch) {
      const keyName = keyNameMatch[2].trim();
      const sourceFile = sourceFileMatch[2].trim();
      if (keyName && sourceFile){
        result[keyName] = sourceFile;
      }
    }
  });

  return result;
}

function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const outputPath = args[1] || 'output.json';

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const extractedInfo = extractInfo(fileContent);

  // detelte the properties whose source file starts with 'node:'
  filtered = {};
  for (const key in extractedInfo) {
        if (!extractedInfo[key].startsWith('node:')
            && extractedInfo[key].search('babel')==-1
            && extractedInfo[key].search('acorn')==-1) {
            filtered[key] = extractedInfo[key];
        }}

  fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));
}

main();
