const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

// Classy, catchy, brand-aligned HTML markup for Instructify Kenya
const catchyBrandHtml = `
      <div class="nav-brand-icon" style="width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #F2542D 0%, #D83E15 100%); display: flex; align-items: center; justify-content: center; margin-right: 12px; box-shadow: 0 4px 14px rgba(242, 84, 45, 0.45); border: 1px solid rgba(255, 255, 255, 0.3); flex-shrink: 0;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <div class="nav-brand-text-box" style="display: flex; flex-direction: column; justify-content: center; line-height: 1.05;">
        <span class="nav-brand-title" style="font-family: var(--font-heading); font-weight: 800; font-size: 1.4rem; color: #FFFFFF; letter-spacing: -0.03em;">Instructify</span>
        <span class="nav-brand-subtitle" style="font-family: var(--font-heading); font-size: 0.72rem; font-weight: 800; color: #F2542D; text-transform: uppercase; letter-spacing: 2px;">KENYA</span>
      </div>
`;

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace content inside <a ... class="nav-brand ..."> ... </a>
  content = content.replace(/(<a[^>]*class="nav-brand[^"]*"[^>]*>)[\s\S]*?(<\/a>)/g, `$1\n${catchyBrandHtml}    $2`);

  // Also enhance footer brand heading if present
  content = content.replace(/<h3[^>]*>Instructify Kenya<\/h3>/g, `<h3 style="font-family: var(--font-heading); font-size: 22px; font-weight: 800; color: #FFFFFF; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><span style="color:#F2542D;">Instructify</span> Kenya</h3>`);

  fs.writeFileSync(filePath, content);
  console.log(`Updated brand heading in ${file}`);
});

// Update components.css for hover effects on logo icon & title
const componentsCssPath = path.join(rootDir, 'css', 'components.css');
let componentsCss = fs.readFileSync(componentsCssPath, 'utf8');

if (!componentsCss.includes('.nav-brand-icon')) {
  componentsCss += `

/* ── Brand Logo Icon & Catchy Typography Enhancements ──────── */
.nav-brand-icon {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}

.nav-brand:hover .nav-brand-icon {
  transform: rotate(-6deg) scale(1.08);
  box-shadow: 0 6px 20px rgba(242, 84, 45, 0.65);
}

.nav-brand-title {
  transition: color 0.2s ease;
}

.nav-brand:hover .nav-brand-title {
  color: #F3E8FF;
}
`;
  fs.writeFileSync(componentsCssPath, componentsCss);
  console.log('Updated css/components.css with brand icon hover animations.');
}

console.log('Brand heading updates complete across all files.');
