const fs = require('fs');
const path = require('path');

function extractInfo(content) {
  const sections = content.split(/-{10,}Undefined Property Found-{10,}/);

  const result = {};
  sections.forEach(section => {
    const keyNameMatch = section.match(/KeyName:: .*#(.*)/);
    const sourceFileMatch = section.match(/Source File: : .*"(.*)"/);

    if (keyNameMatch && sourceFileMatch) {
      const keyName = keyNameMatch[1].trim();
      const sourceFile = sourceFileMatch[1].trim();
      result[keyName] = sourceFile;
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
        if (!extractedInfo[key].startsWith('node:')) {
            filtered[key] = extractedInfo[key];
        }}

  fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));
}

main();