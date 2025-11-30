const fs = require('fs');
const path = require('path');

// Recursively find all JSON files
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Process a single JSON file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (!data.sections || !Array.isArray(data.sections)) {
      return { modified: false, count: 0 };
    }
    
    let modified = false;
    let count = 0;
    const newSections = [];
    
    for (let i = 0; i < data.sections.length; i++) {
      const current = data.sections[i];
      const next = data.sections[i + 1];
      
      // Check if current is "text" and next is "code" with same title
      if (
        current.type === 'text' &&
        current.title &&
        next &&
        next.type === 'code' &&
        next.title === current.title
      ) {
        // Combine them
        newSections.push({
          type: 'code',
          title: current.title,
          description: current.content,
          content: next.content
        });
        modified = true;
        count++;
        i++; // Skip the next section since we've combined it
      } else {
        newSections.push(current);
      }
    }
    
    if (modified) {
      data.sections = newSections;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
    
    return { modified, count };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { modified: false, count: 0, error: error.message };
  }
}

// Main execution
const dataDir = path.join(__dirname, 'data');
const outputFile = path.join(__dirname, 'combine-results.txt');

if (!fs.existsSync(dataDir)) {
  const error = `Data directory not found: ${dataDir}`;
  fs.writeFileSync(outputFile, error + '\n', 'utf8');
  process.exit(1);
}

const jsonFiles = findJsonFiles(dataDir);
const output = [];

output.push(`Found ${jsonFiles.length} JSON files to process...\n`);

if (jsonFiles.length === 0) {
  output.push('No JSON files found. Exiting.');
  fs.writeFileSync(outputFile, output.join('\n'), 'utf8');
  process.exit(0);
}

let totalModified = 0;
let totalCombined = 0;

jsonFiles.forEach(file => {
  const result = processFile(file);
  if (result.modified) {
    totalModified++;
    totalCombined += result.count;
    const relativePath = path.relative(__dirname, file);
    output.push(`✓ ${relativePath} - Combined ${result.count} pair(s)`);
  }
});

output.push(`\nSummary:`);
output.push(`  Files modified: ${totalModified}`);
output.push(`  Total pairs combined: ${totalCombined}`);

fs.writeFileSync(outputFile, output.join('\n'), 'utf8');
console.log(output.join('\n'));

