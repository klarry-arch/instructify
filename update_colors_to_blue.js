const fs = require('fs');
const path = require('path');

const dir = 'c:\\instructify';

// Function to recursively find all HTML and CSS files
function findFiles(dirPath, fileList) {
  const files = fs.readdirSync(dirPath);
  fileList = fileList || [];
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Don't go into node_modules or .git
      if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
        fileList = findFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

const allFiles = findFiles(dir);

// Replacements
// #1d4ed8 (Primary Green) -> #1d4ed8 (Blue)
// #dbeafe (Light Green) -> #dbeafe (Light Blue)
// rgb(29, 78, 216) -> rgb(29, 78, 216)

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace Hex Codes (case insensitive)
  content = content.replace(/#1d4ed8/gi, '#1d4ed8');
  content = content.replace(/#dbeafe/gi, '#dbeafe');
  
  // Also check for the rgba/rgb variants if any exist
  content = content.replace(/rgba?\(13,\s*138,\s*87/gi, 'rgb(29, 78, 216');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Updated colors in:', file);
  }
});

console.log('Successfully completed site-wide color replacement to Blue and Orange.');
