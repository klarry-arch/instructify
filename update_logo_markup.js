const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Update header logo image styling for solid white background badge
  content = content.replace(
    /<img src="assets\/images\/logo\.png"[^>]*>/g,
    '<img src="assets/images/logo.png" alt="Instructify Kenya Logo" style="height: 48px; width: auto; object-fit: contain; margin-right: 12px; border-radius: 10px; background-color: #ffffff; padding: 4px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated logo markup in ${file}`);
});

console.log('Logo update completed across all pages.');
