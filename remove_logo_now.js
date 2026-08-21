const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/<img src="assets\/images\/logo\.png"[^>]*>\s*/g, '');
  content = content.replace(/<img[^>]*alt="Instructify Kenya Logo"[^>]*>\s*/g, '');

  fs.writeFileSync(filePath, content);
  console.log(`Removed logo image from ${file}`);
});

console.log('Logo image removed completely from all HTML pages.');
