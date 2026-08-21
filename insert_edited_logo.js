const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('<a href="index.html" class="nav-brand">') && !content.includes('src="assets/images/logo.png"')) {
    content = content.replace(
      '<a href="index.html" class="nav-brand">\n',
      '<a href="index.html" class="nav-brand">\n  <img src="assets/images/logo.png" alt="Brand Logo" style="height: 48px; width: auto; object-fit: contain; margin-right: 12px;">\n'
    );
    fs.writeFileSync(filePath, content);
    console.log(`Inserted edited logo into ${file}`);
  }
});

console.log('Edited logo placed across all pages.');
