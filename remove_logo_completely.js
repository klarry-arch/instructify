const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const brandText = `<span class="nav-brand-text" style="font-weight: 800; font-size: 1.35rem; color: var(--color-deep-navy, #0f172a); letter-spacing: -0.5px;">Instructify <span style="color: var(--color-curiosity-orange, #fa5e1f); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1.5px; font-weight: 800;">Kenya</span></span>`;

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove any logo image tags
  content = content.replace(/<img[^>]*src="assets\/images\/(instructify-logo\.svg|logo\.png)"[^>]*>\s*/g, '');
  content = content.replace(/<img[^>]*class="(nav-logo-img|nav-brand-img)"[^>]*>\s*/g, '');

  // Insert text brand into nav-brand if empty inside
  content = content.replace(/(<a[^>]*class="nav-brand[^"]*"[^>]*>)\s*(<\/a>)/g, `$1\n      ${brandText}\n    $2`);

  fs.writeFileSync(filePath, content);
  console.log(`Removed logo image and set text brand in ${file}`);
});

console.log('Logo image removed completely across all HTML pages.');

