const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove any inserted logo image tags from brand header
  content = content.replace(/<img src="assets\/images\/logo\.png"[^>]*>\s*/g, '');
  content = content.replace(/<img[^>]*alt="Brand Logo"[^>]*>\s*/g, '');

  fs.writeFileSync(filePath, content);
  console.log(`Reverted logo insertion in ${file}`);
});

console.log('Website brand markup restored to clean text layout.');
