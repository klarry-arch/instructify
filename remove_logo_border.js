const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove border, background-color, border-radius, box-shadow, padding from logo img tag
  content = content.replace(
    /<img src="assets\/images\/logo\.png"[^>]*>/g,
    '<img src="assets/images/logo.png" alt="Instructify Kenya Logo" style="height: 48px; width: auto; object-fit: contain; margin-right: 12px;">'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Cleaned logo styles in ${file}`);
});

console.log('Logo border and inline background styles removed across all pages.');
