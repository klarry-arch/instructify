const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix hardcoded 1280 viewport
  if (content.includes('<meta name="viewport" content="width=1280">')) {
    content = content.replace(
      '<meta name="viewport" content="width=1280">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    );
    fs.writeFileSync(filePath, content);
    console.log(`Updated viewport in ${file}`);
  }
});

// Enhance about.html hero grid & padding
const aboutPath = path.join(rootDir, 'about.html');
if (fs.existsSync(aboutPath)) {
  let content = fs.readFileSync(aboutPath, 'utf8');
  content = content.replace(
    /grid-template-columns:\s*1\.1fr\s+0\.9fr;/,
    'grid-template-columns: 55fr 45fr;'
  );
  content = content.replace(
    /padding:\s*calc\(var\(--nav-height\)\s*\+\s*4\.5rem\)\s+0\s+4\.5rem;/,
    'padding: calc(var(--nav-height) + 5.5rem) 0 5.5rem;'
  );
  fs.writeFileSync(aboutPath, content);
  console.log('Updated about.html hero');
}

// Enhance consultancy.html hero grid & padding
const consultPath = path.join(rootDir, 'consultancy.html');
if (fs.existsSync(consultPath)) {
  let content = fs.readFileSync(consultPath, 'utf8');
  content = content.replace(
    /grid-template-columns:\s*1\.1fr\s+0\.9fr;/,
    'grid-template-columns: 55fr 45fr;'
  );
  content = content.replace(
    /padding:\s*calc\(var\(--nav-height\)\s*\+\s*4\.5rem\)\s+0\s+4\.5rem;/,
    'padding: calc(var(--nav-height) + 5.5rem) 0 5.5rem;'
  );
  fs.writeFileSync(consultPath, content);
  console.log('Updated consultancy.html hero');
}

console.log('Site-wide updates applied.');
