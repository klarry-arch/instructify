const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';

// 1. Color mapping dictionary
const replacements = [
  // Primary brand blues -> Rich Royal Purple (#480E74)
  { from: /#480E74/gi, to: '#480E74' },
  { from: /#2E0550/gi, to: '#2E0550' },
  { from: /#6A1B9A/gi, to: '#6A1B9A' },
  { from: /#7E22CE/gi, to: '#7E22CE' },
  { from: /rgba\(0,\s*0,\s*255,/gi, to: 'rgba(72, 14, 116,' },
  { from: /rgba\(18,\s*60,\s*140,/gi, to: 'rgba(106, 27, 154,' },
  
  // Orange accent -> Vibrant Coral Orange (#F2542D)
  { from: /#F2542D/gi, to: '#F2542D' },
  { from: /#D83E15/gi, to: '#D83E15' },
  { from: /#FF724D/gi, to: '#FF724D' },
  { from: /rgba\(242,\s*72,\s*34,/gi, to: 'rgba(242, 84, 45,' },
  
  // Soft backgrounds & surfaces -> Soft Purple & Soft Orange
  { from: /#F3E8FF/gi, to: '#F3E8FF' },
  { from: /#FFF1EE/gi, to: '#FFF1EE' },
  { from: /#F3E8FF/gi, to: '#F3E8FF' },
  { from: /#F8F6FC/gi, to: '#F8F6FC' },
];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== '.git' && entry.name !== 'node_modules') {
        processDir(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.css' || ext === '.html' || ext === '.js') {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        for (const { from, to } of replacements) {
          if (from.test(content)) {
            content = content.replace(from, to);
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated colors in: ${path.relative(rootDir, fullPath)}`);
        }
      }
    }
  }
}

console.log('Applying Pharmily brand colors (#480E74 Purple & #F2542D Orange)...');
processDir(rootDir);
console.log('Color updates complete across all CSS, HTML, and JS files.');
