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
console.log(`Processing ${htmlFiles.length} HTML files...`);

let updatedCount = 0;

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const isSubdir = relPath.includes('/') && !relPath.startsWith('public_html/') ? true : 
                   relPath.startsWith('public_html/') && relPath.split('/').length > 2 ? true : false;
  
  const logoPath = isSubdir ? '../assets/images/instructify-kenya-logo-dark.png' : 'assets/images/instructify-kenya-logo-dark.png';
  const homePath = isSubdir ? '../index.html' : 'index.html';

  const cleanFooterBrandHtml = 
`        <div class="footer-brand-lockup" style="margin-bottom:20px;">
          <a href="${homePath}" aria-label="Instructify Kenya Home" style="display:inline-block;text-decoration:none;">
            <img src="${logoPath}" alt="Instructify Kenya Logo" class="footer-brand-logo" style="height:44px;width:auto;max-width:220px;object-fit:contain;display:block;">
          </a>
        </div>`;

  let original = content;

  // Pattern 1: div with flex or footer-brand-lockup containing footer-brand-logo AND an h3 or div with Instructify
  // E.g.:
  // <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
  //   <img src="...logo-dark.png" ... class="footer-brand-logo" ...>
  //   <h3 ...>...Instructify...Kenya...</h3>
  // </div>
  content = content.replace(
    /<div[^>]*?(?:footer-brand-lockup|display:\s*flex)[^>]*?>\s*<img[^>]*?class=["'][^"']*footer-brand-logo[^"']*["'][^>]*?>\s*<h3[^>]*?>[\s\S]*?Instructify[\s\S]*?<\/h3>\s*<\/div>/gi,
    cleanFooterBrandHtml
  );

  // Pattern 2: div with footer-brand-logo and div with Instructify / KENYA (like index.html / jumuishi / episode / podcast)
  content = content.replace(
    /<div[^>]*?class=["'][^"']*footer-brand-lockup[^"']*["'][^>]*?>\s*<img[^>]*?class=["'][^"']*footer-brand-logo[^"']*["'][^>]*?>\s*<div>\s*<div[^>]*?>\s*Instructify\s*<\/div>\s*<div[^>]*?>\s*KENYA\s*<\/div>\s*<\/div>\s*<\/div>/gi,
    cleanFooterBrandHtml
  );

  // Pattern 2b: div with flex containing footer-brand-logo and div with font-heading Instructify
  content = content.replace(
    /<div[^>]*?(?:footer-brand-lockup|display:\s*flex)[^>]*?>\s*<img[^>]*?class=["'][^"']*footer-brand-logo[^"']*["'][^>]*?>\s*<div>[\s\S]*?Instructify[\s\S]*?KENYA[\s\S]*?<\/div>\s*<\/div>/gi,
    cleanFooterBrandHtml
  );

  // Pattern 3: Lone h3 in footer that says Instructify Kenya without logo (like blog.html / article.html / articles)
  content = content.replace(
    /<h3 style="font-family:\s*var\(--font-heading\)[^"]*">\s*<span style="color:\s*#FF4D00[^"]*">\s*Instructify\s*<\/span>\s*<span style="color:\s*#FFFFFF[^"]*">\s*Kenya\s*<\/span>\s*<\/h3>/gi,
    cleanFooterBrandHtml
  );

  // Pattern 3b: Any other h3 in footer with Instructify and Kenya
  content = content.replace(
    /<h3[^>]*font-family:\s*var\(--font-heading\)[^>]*>\s*<span[^>]*>\s*Instructify\s*<\/span>\s*<span[^>]*>\s*Kenya\s*<\/span>\s*<\/h3>/gi,
    cleanFooterBrandHtml
  );

  // Pattern 4: If any footer still has <h3 ...><span ...>Instructify</span> <span ...>Kenya</span></h3> inside footer
  // Replace within footer only
  content = content.replace(/(<footer[\s\S]*?>)([\s\S]*?)(<\/footer>)/gi, (match, openTag, body, closeTag) => {
    let cleanBody = body.replace(/<div[^>]*?>\s*<img[^>]*?class=["'][^"']*footer-brand-logo[^"']*["'][^>]*?>\s*<h3[^>]*?>[\s\S]*?<\/h3>\s*<\/div>/gi, cleanFooterBrandHtml);
    cleanBody = cleanBody.replace(/<h3[^>]*?>\s*<span[^>]*?>Instructify<\/span>\s*<span[^>]*?>Kenya<\/span>\s*<\/h3>/gi, cleanFooterBrandHtml);
    return openTag + cleanBody + closeTag;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`✅ Updated footer brand in: ${relPath}`);
  }
}

console.log(`\n🎉 Total files updated: ${updatedCount}`);
