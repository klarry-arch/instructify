const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Replace border-bottom 1px white with 4px solid #F2542D (Coral Orange accent)
  if (content.includes('border-bottom:1px solid rgba(255,255,255,0.1)')) {
    content = content.replace(
      /border-bottom:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.1\);?/gi,
      'border-bottom: 4px solid #F2542D; border-radius: 2px;'
    );
    modified = true;
  }

  // Also replace any other 1px white footer borders if present
  if (content.includes('border-bottom: 1px solid rgba(255, 255, 255, 0.1)')) {
    content = content.replace(
      /border-bottom:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.15?\);?/gi,
      'border-bottom: 4px solid #F2542D; border-radius: 2px;'
    );
    modified = true;
  }

  // 2. Enhance copyright text link color to accent orange for high contrast & rhythm
  content = content.replace(
    /<a href="contact\.html" style="color:#FFF;">Contact Us<\/a>/g,
    '<a href="contact.html" style="color:#F2542D; font-weight:700; text-decoration:underline;">Contact Us</a>'
  );

  if (modified || file === 'index.html') {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated 4px orange footer border in: ${file}`);
  }
});

// Update components.css for top footer accent line
const componentsCssPath = path.join(rootDir, 'css', 'components.css');
let componentsCss = fs.readFileSync(componentsCssPath, 'utf8');

componentsCss = componentsCss.replace(
  /\.footer::before\s*\{[\s\S]*?height:\s*\d+px;[\s\S]*?\}/,
  `.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #F2542D 0%, #FF724D 50%, #D83E15 100%);
}`
);

fs.writeFileSync(componentsCssPath, componentsCss, 'utf8');
console.log('Updated css/components.css footer border line height to 4px with #F2542D gradient.');

console.log('Footer border updates complete.');
