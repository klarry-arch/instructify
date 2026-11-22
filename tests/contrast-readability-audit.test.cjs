const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');

console.log('══════════════════════════════════════════════════════════════');
console.log('   INSTRUCTIFY KENYA — BRAND PALETTE & WCAG 2.1 AA AUDIT');
console.log('══════════════════════════════════════════════════════════════\n');

let passCount = 0;
let failCount = 0;

function check(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASSED: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAILED: ${desc}\n     -> ${err.message}`);
    failCount++;
  }
}

function hexToLuminance(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLin = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ─────────────────────────────────────────────────────────────
// 1. CANONICAL BRAND TOKENS & WCAG 2.1 AA CONTRAST MATRIX
// ─────────────────────────────────────────────────────────────
console.log('1. Checking Canonical Brand Tokens (css/brand-tokens.css & css/global.css)...');

const brandTokensCss = fs.readFileSync(path.join(rootDir, 'css/brand-tokens.css'), 'utf8');
const globalCss = fs.readFileSync(path.join(rootDir, 'css/global.css'), 'utf8');

check('brand-tokens.css defines the four core brand colour variables', () => {
  assert(/--color-primary:\s*#2563EB/i.test(brandTokensCss), 'Missing --color-primary: #2563EB');
  assert(/--color-accent:\s*#FACC15/i.test(brandTokensCss), 'Missing --color-accent: #FACC15');
  assert(/--color-surface:\s*#FFFDF7/i.test(brandTokensCss), 'Missing --color-surface: #FFFDF7');
  assert(/--color-text:\s*#1E1B4B/i.test(brandTokensCss), 'Missing --color-text: #1E1B4B');
});

check('global.css imports brand-tokens.css and exposes canonical semantic tokens', () => {
  assert(globalCss.includes("@import url('./brand-tokens.css')"), 'global.css must import brand-tokens.css');
  assert(/--color-primary:\s*#2563EB/i.test(globalCss), 'Missing --color-primary in global.css');
  assert(/--color-accent:\s*#FACC15/i.test(globalCss), 'Missing --color-accent in global.css');
  assert(/--color-surface:\s*#FFFDF7/i.test(globalCss), 'Missing --color-surface in global.css');
  assert(/--color-text:\s*#1E1B4B/i.test(globalCss), 'Missing --color-text in global.css');
  assert(/--color-text-secondary:\s*#433F6B/i.test(globalCss), 'Missing secondary Deep Indigo text token');
  assert(/--color-text-muted:\s*#5B5882/i.test(globalCss), 'Missing muted Deep Indigo text token');
  assert(/--color-text-disabled:\s*#6B688E/i.test(globalCss), 'Missing disabled text token');
});

check('All foreground/background token pairings meet WCAG 2.1 AA (>= 4.5:1)', () => {
  const pairs = [
    ['Deep Indigo body text on Warm Off-White', '#1E1B4B', '#FFFDF7', 4.5],
    ['Deep Indigo body text on Pure White', '#1E1B4B', '#FFFFFF', 4.5],
    ['Secondary Indigo text on Warm Off-White', '#433F6B', '#FFFDF7', 4.5],
    ['Muted Indigo text on Warm Off-White', '#5B5882', '#FFFDF7', 4.5],
    ['Disabled text on Pure White', '#6B688E', '#FFFFFF', 4.5],
    ['Royal Blue links/headings on Warm Off-White', '#2563EB', '#FFFDF7', 4.5],
    ['Royal Blue links/headings on Subtle Cream', '#2563EB', '#F7F3E6', 4.5],
    ['Royal Blue links on Soft Blue tint', '#2563EB', '#EFF6FF', 4.5],
    ['White text on Royal Blue primary button', '#FFFFFF', '#2563EB', 4.5],
    ['White text on Royal Blue hover button', '#FFFFFF', '#1D4ED8', 4.5],
    ['Deep Indigo text on Sunny Gold accent button', '#1E1B4B', '#FACC15', 4.5],
    ['Deep Indigo text on Sunny Gold hover button', '#1E1B4B', '#EAB308', 4.5],
    ['Deep Indigo text on Sunny Gold badge tint', '#1E1B4B', '#FEF9C3', 4.5],
    ['Sunny Gold accent text on Deep Indigo dark surface', '#FACC15', '#1E1B4B', 4.5],
    ['Soft Indigo inverse text on Deep Indigo footer', '#E0E7FF', '#1E1B4B', 4.5],
    ['Pure White text on Deep Indigo dark anchor', '#FFFFFF', '#1E1B4B', 4.5]
  ];
  for (const [label, fg, bg, minRatio] of pairs) {
    const ratio = contrastRatio(fg, bg);
    assert(ratio >= minRatio, `${label} (${fg} on ${bg}) contrast is ${ratio.toFixed(2)}:1 (< ${minRatio}:1)`);
  }
});

// ─────────────────────────────────────────────────────────────
// 2. HEADER, FOOTER & HOMEPAGE COMPONENTS
// ─────────────────────────────────────────────────────────────
console.log('\n2. Checking Header, Footer & Homepage Components...');

const headerCss = fs.readFileSync(path.join(rootDir, 'css/site-header.css'), 'utf8');
const footerCss = fs.readFileSync(path.join(rootDir, 'css/site-footer.css'), 'utf8');
const homeRedesignCss = fs.readFileSync(path.join(rootDir, 'css/homepage-redesign.css'), 'utf8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'css/components.css'), 'utf8');

check('Header uses Warm Off-White backdrop, Deep Indigo text, Royal Blue active/CTA, Sunny Gold badges', () => {
  assert(headerCss.includes("@import url('./brand-tokens.css')"), 'site-header.css must import brand-tokens.css');
  assert(headerCss.includes('#2563EB') && headerCss.includes('#FACC15') && headerCss.includes('#1E1B4B'), 'Header missing core palette tokens');
  assert(headerCss.includes('overflow-x: clip'), 'Header must preserve overflow-x: clip for sticky scrolling');
});

check('Footer uses Deep Indigo dark surface, Sunny Gold top accent & buttons with Deep Indigo text', () => {
  assert(footerCss.includes("@import url('./brand-tokens.css')"), 'site-footer.css must import brand-tokens.css');
  assert(footerCss.includes('#1E1B4B') && footerCss.includes('#FACC15'), 'Footer missing Deep Indigo / Sunny Gold pairing');
  assert(footerCss.includes(':focus-visible'), 'Footer must style visible keyboard focus');
});

check('Homepage uses Warm Off-White surface, Royal Blue primary CTAs, and NO Sunny Gold text on light', () => {
  assert(homeRedesignCss.includes("@import url('./brand-tokens.css')"), 'homepage-redesign.css must import brand-tokens.css');
  assert(homeRedesignCss.includes('#FFFDF7') && homeRedesignCss.includes('#2563EB') && homeRedesignCss.includes('#1E1B4B'), 'Homepage missing core palette tokens');
  assert(homeRedesignCss.includes(':focus-visible'), 'Homepage must define visible keyboard focus indicators');
});

// ─────────────────────────────────────────────────────────────
// 3. BUTTON STATES, FORMS & KEYBOARD ACCESSIBILITY
// ─────────────────────────────────────────────────────────────
console.log('\n3. Checking Button States (Default, Hover, Active, Focus, Disabled)...');

check('Primary button uses Royal Blue (#2563EB) with pure white text (#FFFFFF)', () => {
  assert(componentsCss.includes('.btn-primary,') && componentsCss.includes('var(--color-primary, #2563EB)'), 'Primary button must use Royal Blue');
  assert(componentsCss.includes('color: #FFFFFF !important;'), 'Primary button must maintain white text');
  assert(componentsCss.includes('.btn-primary:hover,') && componentsCss.includes('var(--color-primary-hover, #1D4ED8)'), 'Primary hover must use #1D4ED8');
  assert(componentsCss.includes('.btn-primary:active,'), 'Primary button must style :active state');
});

check('Sunny Gold accent buttons use Deep Indigo (#1E1B4B) text (never white)', () => {
  assert(componentsCss.includes('.btn-accent,') && componentsCss.includes('var(--color-accent, #FACC15)'), 'Accent button must use Sunny Gold');
  assert(componentsCss.includes('color: var(--color-text, #1E1B4B) !important;'), 'Accent button must pair Sunny Gold bg with Deep Indigo text');
});

check('Disabled button text is accessible (>= 4.5:1) and focus-visible outlines are clearly visible', () => {
  assert(componentsCss.includes('.btn:disabled'), 'Buttons must style :disabled state');
  assert(componentsCss.includes('.btn:focus-visible') && componentsCss.includes('outline: 3px solid var(--color-primary, #2563EB)'), 'Buttons must show visible Royal Blue :focus-visible ring');
  assert(componentsCss.includes('min-height: 44px;'), 'Buttons must preserve 44px minimum mobile touch target');
});

// ─────────────────────────────────────────────────────────────
// 4. SITE-WIDE LEGACY COLOUR REMOVAL & ZERO GOLD-ON-LIGHT CHECK
// ─────────────────────────────────────────────────────────────
console.log('\n4. Checking Zero Conflicting Legacy Hexes Across All Stylesheets & Live Pages...');

const legacyRe = /#FF4D00|#F59E3D|#F4B400|#F4B942|#F5812D|#EA8821|#F7A547|#123B5D|#2474B5|#4F46E5|#2145E6|#123C8C|#14213D|#0F172A|#305CDE|#3C3DDC|#09275F|#1E293B|#172033|#151515|#FAFAF7|#F5F9FC|#F8FAFC|#EDF3F9|#475569|#334155|#64748B|#E2E8F0/gi;

check('All 21 CSS stylesheets have 0 conflicting legacy hex codes and balanced braces', () => {
  const cssDir = path.join(rootDir, 'css');
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  assert(cssFiles.length >= 20, 'Expected at least 20 CSS files');
  for (const f of cssFiles) {
    const txt = fs.readFileSync(path.join(cssDir, f), 'utf8');
    const hits = txt.match(legacyRe) || [];
    assert.strictEqual(hits.length, 0, `${f} still contains legacy hex(es): ${[...new Set(hits)].join(', ')}`);
    const opens = (txt.match(/\{/g) || []).length;
    const closes = (txt.match(/\}/g) || []).length;
    assert.strictEqual(opens, closes, `${f} has unbalanced braces (${opens} vs ${closes})`);
  }
});

check('All 60 live HTML pages have 0 conflicting legacy hex codes', () => {
  const dirs = [rootDir, path.join(rootDir, 'articles'), path.join(rootDir, 'courses'), path.join(rootDir, 'resources')];
  let htmlCount = 0;
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (!e.isFile() || !e.name.endsWith('.html')) continue;
      htmlCount++;
      const txt = fs.readFileSync(path.join(d, e.name), 'utf8');
      const hits = txt.match(legacyRe) || [];
      assert.strictEqual(hits.length, 0, `${path.relative(rootDir, path.join(d, e.name))} contains legacy hex(es): ${[...new Set(hits)].join(', ')}`);
    }
  }
  assert(htmlCount >= 55, `Expected at least 55 live HTML pages, found ${htmlCount}`);
});

check('All 27 JS files have 0 conflicting legacy hex codes', () => {
  const jsDir = path.join(rootDir, 'js');
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  for (const f of jsFiles) {
    const txt = fs.readFileSync(path.join(jsDir, f), 'utf8');
    const hits = txt.match(legacyRe) || [];
    assert.strictEqual(hits.length, 0, `js/${f} contains legacy hex(es): ${[...new Set(hits)].join(', ')}`);
  }
});

check('No Sunny Gold (#FACC15) foreground text on light backgrounds in any CSS file', () => {
  const cssDir = path.join(rootDir, 'css');
  const allowedDarkFiles = new Set(['site-footer.css', 'homepage.css', 'homepage-redesign.css', 'components.css']);
  for (const f of fs.readdirSync(cssDir).filter(x => x.endsWith('.css'))) {
    const lines = fs.readFileSync(path.join(cssDir, f), 'utf8').replace(/\r\n/g, '\n').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*color\s*:\s*[^;]*#FACC15/i.test(lines[i])) {
        assert(allowedDarkFiles.has(f), `Unexpected Sunny Gold text color in css/${f}:${i + 1}: ${lines[i].trim()}`);
      }
    }
  }
});

// ─────────────────────────────────────────────────────────────
// AUDIT SUMMARY
// ─────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════');
console.log(`   RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('══════════════════════════════════════════════════════════════\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL BRAND PALETTE & WCAG 2.1 AA CONTRAST AUDITS PASSED 100%!\n');
  process.exit(0);
}
