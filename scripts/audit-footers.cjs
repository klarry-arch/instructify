const fs = require('fs');
const path = require('path');

function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (['node_modules', '.git', 'dist', 'backups', 'test', 'tests'].includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getAllHtmlFiles('.');
console.log(`Found ${files.length} HTML files.`);

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const footerMatch = content.match(/<footer[\s\S]*?<\/footer>/i);
  if (!footerMatch) continue;
  const footer = footerMatch[0];
  
  // Look for any text mentioning Instructify in the brand area
  const brandArea = footer.match(/<div class="footer-brand-lockup"[\s\S]*?<\/div>\s*<\/div>/i) ||
                    footer.match(/<a[^>]*class="footer-brand"[^>]*>[\s\S]*?<\/a>/i) ||
                    footer.match(/<img[^>]*class="footer-brand-logo"[^>]*>[\s\S]*?<\/div>/i);
                    
  if (brandArea) {
    const textOnly = brandArea[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (textOnly.length > 0) {
      console.log(`${f}: [EXTRA TEXT] -> "${textOnly}"`);
    }
  }
}
