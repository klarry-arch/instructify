const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const logoHtml = `<img src="assets/images/logo.png" alt="Instructify Kenya Logo" class="nav-logo-img" style="height: 48px; width: auto; object-fit: contain; border-radius: 6px;">`;

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace content inside <a ... class="nav-brand ..."> ... </a>
  content = content.replace(/(<a[^>]*class="nav-brand[^"]*"[^>]*>)[\s\S]*?(<\/a>)/g, `$1\n      ${logoHtml}\n    $2`);

  fs.writeFileSync(filePath, content);
  console.log(`Applied new logo to ${file}`);
});

console.log('Successfully updated nav header with new logo across all HTML pages.');
