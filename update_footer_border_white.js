const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace 4px solid #F2542D with 4px solid #FFFFFF
  if (content.includes('border-bottom: 4px solid #F2542D;')) {
    content = content.replace(
      /border-bottom:\s*4px\s*solid\s*#F2542D;?/gi,
      'border-bottom: 4px solid #FFFFFF;'
    );
    modified = true;
  }

  // Also replace any lingering 1px or 4px footer border lines to 4px solid #FFFFFF
  if (content.includes('border-bottom: 1px solid rgba(255, 255, 255, 0.1)')) {
    content = content.replace(
      /border-bottom:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.1\);?/gi,
      'border-bottom: 4px solid #FFFFFF; border-radius: 2px;'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated 4px white footer border in: ${file}`);
  }
});

// Update components.css for top footer line to white if applicable
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
  background: #FFFFFF;
}`
);

fs.writeFileSync(componentsCssPath, componentsCss, 'utf8');
console.log('Updated css/components.css footer border line to 4px solid white.');

console.log('White footer border updates complete.');
