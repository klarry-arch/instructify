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

  content = content.replace(/(href="css\/[^"]+\.css)(?:\?v=[0-9.]+|)(?=")/g, '$1?v=17.0');
  content = content.replace(/src="(js\/[^"]+\.js)(?:\?v=[0-9.]+|)"/g, 'src="$1?v=17.0"');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    count++;
  }
}

console.log(`Bumped CSS/JS cache-busters to v=17.0 in ${count} HTML files.`);
