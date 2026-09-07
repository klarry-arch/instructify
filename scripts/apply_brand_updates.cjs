const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// ==========================================================
// 1. UPDATE CSS (css/components.css)
// ==========================================================
const cssPath = path.join(rootDir, 'css', 'components.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Target the exact .nav-brand block
const targetNavBrandCss = `/* ── Brand Logo Text ── */
.nav-brand {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform 0.25s ease;
  line-height: 1;
}

.nav-brand:hover {
  transform: translateY(-1px);
}`;

const replacementNavBrandCss = `/* ── Brand Logo & Text Lockup ── */
.nav-brand {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform 0.25s ease;
  line-height: 1;
}

.nav-brand:hover {
  transform: translateY(-1px);
}

.nav-brand-logo {
  height: 48px;
  width: auto;
  max-width: 52px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
}

.nav-brand:hover .nav-brand-logo {
  transform: scale(1.08) rotate(-2deg);
  filter: drop-shadow(0 4px 12px rgba(245, 129, 45, 0.35));
}

.footer-brand-logo {
  height: 44px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
  transition: transform 0.25s ease;
}

.footer-brand-logo:hover {
  transform: scale(1.06);
}`;

if (cssContent.includes(targetNavBrandCss)) {
  cssContent = cssContent.replace(targetNavBrandCss, replacementNavBrandCss);
  console.log('Successfully updated .nav-brand styles in css/components.css');
} else {
  console.warn('targetNavBrandCss not matched directly in css/components.css');
}

// Update media query for mobile logo
const targetMediaQuery = `@media (max-width: 430px) {
  .nav-brand-title {
    font-size: 1.15rem !important;
  }
  .nav-brand-subtitle {
    font-size: 0.65rem !important;
    letter-spacing: 1.5px !important;
  }
}`;

const replacementMediaQuery = `@media (max-width: 430px) {
  .nav-brand-logo {
    height: 40px;
  }
  .nav-brand-title {
    font-size: 1.15rem !important;
  }
  .nav-brand-subtitle {
    font-size: 0.65rem !important;
    letter-spacing: 1.5px !important;
  }
}`;

if (cssContent.includes(targetMediaQuery)) {
  cssContent = cssContent.replace(targetMediaQuery, replacementMediaQuery);
  console.log('Successfully updated mobile media query in css/components.css');
}

fs.writeFileSync(cssPath, cssContent, 'utf8');

// ==========================================================
// 2. UPDATE HTML PAGES (Navbar & Footers)
// ==========================================================
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const standardNavBrand = `    <a href="index.html" class="nav-brand" aria-label="Instructify Kenya Home">
      <img src="assets/images/logo.png" alt="Instructify Kenya Logo" class="nav-brand-logo">
      <div class="nav-brand-text-box">
        <span class="nav-brand-title">Instruct<span class="brand-accent">ify</span></span>
        <span class="nav-brand-subtitle">KENYA</span>
      </div>
    </a>`;

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // A. Replace nav-brand in standard pages
  // Pattern 1: nav-brand without logo image (text only)
  const pattern1 = /<a href="index\.html" class="nav-brand"[^>]*>[\s\r\n]*<div class="nav-brand-text-box">[\s\S]*?<\/div>[\s\r\n]*<\/a>/;
  if (pattern1.test(html)) {
    html = html.replace(pattern1, standardNavBrand.trim());
    changed = true;
    console.log(`Updated nav-brand in ${file}`);
  }

  // Pattern 2: nav-brand with nav-brand-icon (dashboards / register)
  const pattern2 = /<a href="index\.html" class="nav-brand"[^>]*>[\s\r\n]*<div class="nav-brand-icon">[\s\S]*?<\/div>[\s\r\n]*<div class="nav-brand-text-box"[^>]*>[\s\S]*?<\/div>[\s\r\n]*<\/a>/;
  if (pattern2.test(html)) {
    if (file === 'register.html') {
      const registerBrand = `    <a href="index.html" class="nav-brand" aria-label="Instructify Kenya" style="display: inline-flex; flex-direction: row; align-items: center; gap: 12px; text-decoration: none; white-space: nowrap; margin-bottom: 32px; position: relative; z-index: 1;">
      <img src="assets/images/logo.png" alt="Instructify Kenya Logo" class="nav-brand-logo" style="height: 50px; width: auto; object-fit: contain;">
      <div class="nav-brand-text-box" style="display: inline-flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 1px; white-space: nowrap; margin: 0; padding: 0; line-height: 1;">
        <span class="nav-brand-title" style="font-family: var(--font-heading); font-weight: 800; font-size: 1.35rem; color: #FFFFFF !important; letter-spacing: -0.03em; margin: 0; line-height: 1; display: block;">Instructify</span>
        <span class="nav-brand-subtitle" style="font-family: var(--font-heading); font-size: 0.72rem; font-weight: 800; color: #FF4D00 !important; text-transform: uppercase; letter-spacing: 2px; margin: 0; line-height: 1; display: block;">KENYA</span>
      </div>
    </a>`;
      html = html.replace(pattern2, registerBrand.trim());
    } else {
      html = html.replace(pattern2, standardNavBrand.trim());
    }
    changed = true;
    console.log(`Updated icon nav-brand in ${file}`);
  }

  // B. Footer Brand Updates
  // 1. Index footer (graduation cap icon in hero-gradient box)
  const indexFooterPattern = /<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">[\s\S]*?<div class="footer-brand-title">Instructify<\/div>[\s\S]*?<div class="footer-brand-subtitle">KENYA<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/;
  if (indexFooterPattern.test(html)) {
    const indexFooterReplacement = `<div class="footer-brand-lockup" style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <img src="assets/images/logo.png" alt="Instructify Kenya Logo" class="footer-brand-logo">
          <div>
            <div class="footer-brand-title">Instructify</div>
            <div class="footer-brand-subtitle">KENYA</div>
          </div>
        </div>`;
    html = html.replace(indexFooterPattern, indexFooterReplacement);
    changed = true;
    console.log(`Updated footer brand in ${file}`);
  }

  // 2. Generic footer h3 brand heading (e.g. in about.html, courses.html, consultancy.html, etc.)
  // <h3 style="..."><span style="color: #FF4D00 !important;">Instructify</span> <span style="color: #FFFFFF !important;">Kenya</span></h3>
  const h3BrandPattern = /(<div[^>]*>[\s\r\n]*)<h3 style="([^"]*display:\s*flex;[^"]*)"><span[^>]*>Instructify<\/span>\s*<span[^>]*>Kenya<\/span><\/h3>/;
  if (h3BrandPattern.test(html) && !html.includes('footer-brand-logo')) {
    html = html.replace(h3BrandPattern, `$1<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <img src="assets/images/logo.png" alt="Instructify Kenya Logo" class="footer-brand-logo" style="height:42px;width:auto;object-fit:contain;">
          <h3 style="$2margin-bottom:0;"><span style="color: #FF4D00 !important;">Instructify</span> <span style="color: #FFFFFF !important;">Kenya</span></h3>
        </div>`);
    changed = true;
    console.log(`Updated h3 footer brand in ${file}`);
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
});

console.log('Site-wide brand updates completed!');
