const fs = require('fs');
const path = require('path');

// 1. Copy the image
const src = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\2f103423-e0e1-4076-88a3-f5d089f63290\\instructify_logo_orange_transparent_1786085333749.png';
const dest = 'c:\\instructify\\assets\\images\\logo.png';
fs.copyFileSync(src, dest);

// 2. Update the logo size in all HTML files
const dir = 'c:\\instructify';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the logo img tag and change the height from 44px to 56px
  // I will just use string replace for the style height
  content = content.replace(/height:\s*44px;/, 'height: 56px;');
  
  fs.writeFileSync(filePath, content);
});

console.log('Successfully copied new orange logo and increased size to 56px.');
