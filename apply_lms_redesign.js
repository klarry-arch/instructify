import fs from 'fs';
import path from 'path';

const rootDir = 'c:\\instructify';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Update nav-brand SVG icon stroke from #FFFFFF to #4F46E5 in white navbar
  content = content.replace(
    /(<div class="nav-brand-icon"[^>]*>[\s\S]*?<svg[^>]*stroke=")#FFFFFF(")/g,
    '$1#4F46E5$2'
  );

  // Update nav-brand title color from #FFFFFF to #0F172A
  content = content.replace(
    /(class="nav-brand-title"[^>]*color:\s*)#FFFFFF/g,
    '$1#0F172A'
  );

  // Update nav-brand subtitle color from #FFAD00 or #F2542D to #4F46E5
  content = content.replace(
    /(class="nav-brand-subtitle"[^>]*color:\s*)(#FFAD00|#F2542D|#FF4D00)/g,
    '$1#4F46E5'
  );

  // Update navbar background if inline
  content = content.replace(
    /background:\s*#1E3A8A/gi,
    'background: #FFFFFF'
  );

  // Update footer border or inline orange accents
  content = content.replace(
    /border-bottom:\s*2px solid #FFAD00/gi,
    'border-bottom: 1px solid #E2E8F0'
  );

  // Replace legacy stat icon background inline styles in dashboards
  content = content.replace(
    /background:rgba\(72,\s*14,\s*116,0\.12\);color:var\(--color-primary\)/g,
    'background:#EEF2FF;color:#4F46E5'
  );
  content = content.replace(
    /background:rgba\(37,\s*99,\s*235,0\.12\);color:var\(--color-accent\)/g,
    'background:#ECFDF5;color:#10B981'
  );
  content = content.replace(
    /var\(--color-section-blue\)/g,
    '#EEF2FF'
  );
  content = content.replace(
    /var\(--color-section-orange\)/g,
    '#ECFDF5'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated LMS design elements in ${file}`);
});

console.log('Successfully updated all HTML files to LMS design system.');
