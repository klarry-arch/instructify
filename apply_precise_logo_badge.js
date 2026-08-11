const fs = require('fs');
const path = require('path');

const cssPath = 'c:\\instructify\\css\\components.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

const navBrandImgCSS = `
.nav-brand-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  background-color: #ffffff !important;
  border: 2px solid #cbd5e1 !important;   /* 2px soft gray border per spec */
  border-radius: 14px !important;          /* 12px–16px rounded corners per spec */
  padding: 4px !important;
  margin-right: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}
`;

if (!cssContent.includes('.nav-brand-img')) {
  cssContent += '\n' + navBrandImgCSS;
  fs.writeFileSync(cssPath, cssContent);
  console.log('Added .nav-brand-img CSS to components.css');
}

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /<img src="assets\/images\/logo\.png"[^>]*>/g,
    '<img src="assets/images/logo.png" class="nav-brand-img" alt="Instructify Kenya Logo">'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated logo tag in ${file}`);
});

console.log('Logo container update completed across all pages.');
