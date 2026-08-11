const fs = require('fs');
const path = require('path');

const dir = 'c:\\instructify';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the image tag for the logo to include background-color: white; padding: 4px;
  // It handles both cases (with and without the background already added)
  
  // First, normalize it (remove the existing background-color if it exists to avoid duplicates)
  content = content.replace(/background-color:\s*(transparent|white);\s*padding:\s*\d+px;\s*/g, '');
  
  // Then, find the logo image and add it right before the closing quote of the style attribute
  content = content.replace(/(<img src="assets\/images\/logo\.png" alt="Instructify Kenya Logo" style="[^"]+)(")/g, '$1 background-color: white; padding: 4px;"');
  
  fs.writeFileSync(filePath, content);
});

console.log('Successfully updated logo background to white on all pages.');
