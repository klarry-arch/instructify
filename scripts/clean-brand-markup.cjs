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

      // 1. Hide nav-brand-text-box inline
      const textPattern = /<div class=["']nav-brand-text-box["'][^>]*>/gi;
      if (textPattern.test(content)) {
        content = content.replace(textPattern, '<div class="nav-brand-text-box" style="display: none !important;">');
        changed = true;
      }

      // 2. Ensure nav-brand img points to clean logo
      const targetLogo = relPrefix ? `${relPrefix}assets/images/instructify-kenya-logo.png` : 'assets/images/instructify-kenya-logo.png';
      const logoPattern = /<img[^>]*class=["'][^"']*nav-brand-logo[^"']*["'][^>]*>/gi;
      content = content.replace(logoPattern, (m) => {
        let updated = m.replace(/src=["'][^"']*logo\.png["']/i, `src="${targetLogo}"`);
        if (updated !== m) {
          changed = true;
          return updated;
        }
        return m;
      });

      // 3. Bump components.css cache-buster to v=4.0
      if (content.includes('components.css?v=')) {
        content = content.replace(/components\.css\?v=[0-9.]+/g, 'components.css?v=4.0');
        changed = true;
      }

      // 4. Bump global.css cache-buster
      if (content.includes('global.css')) {
        content = content.replace(/global\.css(\?v=[0-9.]+)?/g, 'global.css?v=4.0');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${path.relative(ROOT_DIR, fullPath)}`);
      }
    }
  }
}

processDir(ROOT_DIR);
console.log('✅ Clean brand markup applied across all HTML pages!');
