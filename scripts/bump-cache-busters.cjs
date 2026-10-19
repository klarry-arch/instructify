const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (['node_modules', '.git', 'dist', 'backups'].includes(item)) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (item.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(ROOT_DIR);
let count = 0;

for (const f of htmlFiles) {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  content = content.replace(/components\.css\?v=[0-9.]+/g, 'components.css?v=4.1');
  content = content.replace(/global\.css\?v=[0-9.]+/g, 'global.css?v=4.1');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    count++;
  }
}

console.log(`Bumped CSS cache-busters to v=4.1 in ${count} HTML files.`);
