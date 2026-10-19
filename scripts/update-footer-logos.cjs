const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function processDir(dir, relPrefix = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (['node_modules', '.git', 'backups', 'dist', 'scratch'].includes(file)) continue;
      processDir(fullPath, relPrefix ? relPrefix + '../' : '../');
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // 1. Update footer brand logo to dark variant
      const targetDarkImg = relPrefix ? `${relPrefix}assets/images/instructify-kenya-logo-dark.png` : 'assets/images/instructify-kenya-logo-dark.png';
      
      const footerRegex = /<img[^>]*class=["'][^"']*footer-brand-logo[^"']*["'][^>]*>/gi;
      const newContent = content.replace(footerRegex, (match) => {
        let updated = match.replace(/src=["'][^"']*logo\.png["']/i, `src="${targetDarkImg}"`);
        updated = updated.replace(/src=["'][^"']*instructify-kenya-logo\.png["']/i, `src="${targetDarkImg}"`);
        if (updated !== match) {
          changed = true;
          return updated;
        }
        return match;
      });

      if (changed) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated footer logo in: ${path.relative(ROOT_DIR, fullPath)}`);
      }
    }
  }
}

processDir(ROOT_DIR);
console.log('✅ Footer logos updated to dark brand variant!');
