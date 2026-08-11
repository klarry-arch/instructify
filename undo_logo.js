const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip all logo img tags
  content = content.replace(/<img src="assets\/images\/logo\.png"[^>]*>\s*/g, '');
  content = content.replace(/<img[^>]*alt="Instructify[^"]*"[^>]*>\s*/g, '');

  fs.writeFileSync(filePath, content);
  console.log(`Undid logo in ${file}`);
});

console.log('Logo image successfully undone and removed from all pages.');
