import fs from 'fs';
import path from 'path';

console.log('🎨 Running Instructify Kenya UI/UX Consistency & Modernization Audit Suite...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

const globalCss = fs.readFileSync('css/global.css', 'utf8');
const componentsCss = fs.readFileSync('css/components.css', 'utf8');
const dashboardCss = fs.readFileSync('css/dashboard.css', 'utf8');

// ── 1. Typography & Font Hierarchy ─────────────────────────
console.log('🔤 1. Typography System & Font Family Consistency');
assert(
  globalCss.includes('family=Poppins') && globalCss.includes('family=Inter'),
  'Google Fonts Poppins & Inter font families imported'
);
assert(
  globalCss.includes('--font-heading:') && globalCss.includes("'Poppins'"),
  '--font-heading is standardized to Poppins & Inter'
);
assert(
  globalCss.includes('--font-size-hero:') && globalCss.includes('clamp('),
  'Fluid hero heading typography scale (--font-size-hero clamp) defined'
);
assert(
  globalCss.includes('--font-size-page:') && globalCss.includes('clamp('),
  'Fluid page title typography scale (--font-size-page clamp) defined'
);
assert(
  globalCss.includes('--font-size-h1:') && globalCss.includes('clamp('),
  'Fluid h1 typography scale (--font-size-h1 clamp) defined'
);
assert(
  globalCss.includes('--font-size-h2:') && globalCss.includes('clamp('),
  'Fluid h2 typography scale (--font-size-h2 clamp) defined'
);
assert(
  globalCss.includes('--font-size-h3:') && globalCss.includes('clamp('),
  'Fluid h3 typography scale (--font-size-h3 clamp) defined'
);

// ── 2. Card Modernization Across 9 Categories ───────────────
console.log('\n🃏 2. Card Architecture & Equal-Height Contracts');
const cardSelectors = [
  'course-card',
  'distinct-card',
  'pathway-card',
  'clientele-card',
  'learning-step-card',
  'testimonial-card',
  'stat-card'
];

cardSelectors.forEach(sel => {
  assert(
    globalCss.includes(`.${sel}`) || componentsCss.includes(`.${sel}`),
    `Card category .${sel} covered by standardized card architecture`
  );
});

assert(
  componentsCss.includes('display: flex !important') && componentsCss.includes('flex-direction: column !important'),
  'Equal height flex-direction: column enforced for all cards'
);
assert(
  globalCss.includes('border-radius: var(--radius-xl, 20px)') || componentsCss.includes('border-radius: var(--radius-xl, 20px) !important'),
  'Standardized 20px rounded corners enforced for cards'
);
assert(
  componentsCss.includes('transform: translateY(-4px) !important'),
  'Standardized smooth -4px elevation lift configured on card hover'
);

// ── 3. Alignment, Margins & Container Spacing ───────────────
console.log('\n📐 3. Layout Alignment, Margins & Padding Rhythm');
assert(
  globalCss.includes('--max-width:            1240px;'),
  'Container max-width standardized to 1240px'
);
assert(
  globalCss.includes('grid-template-columns: repeat(4, 1fr); gap: 24px;'),
  'Standardized 24px grid gap rhythm defined for desktop layouts'
);
assert(
  componentsCss.includes('padding: clamp(20px, 3vw, 26px) !important;'),
  'Standardized responsive internal card padding (clamp 20px to 26px) defined'
);

// ── 4. Brand Purpose & Refined Message Integration ───────────
console.log('\n🌟 4. Purpose-Driven Brand Message Integration');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const aboutHtml = fs.readFileSync('about.html', 'utf8');
const schoolsHtml = fs.readFileSync('schools.html', 'utf8');

const brandHeadline = 'We Don’t Just Deliver Content. We Transform. We Awaken. We Ignite Purpose.';
const brandSub = 'Empowering schools, ministries, and learning organizations through meaningful learning experiences';

assert(
  indexHtml.includes('brand-statement-headline') && indexHtml.includes('We Don’t Just Deliver Content.'),
  'Homepage includes purpose-driven brand statement banner'
);
assert(
  aboutHtml.includes('We Don’t Just Deliver Content.'),
  'About page Founder Welcome block features refined brand message'
);
assert(
  schoolsHtml.includes('We Don’t Just Deliver Content.'),
  'Institutions page header features refined brand headline'
);
assert(
  schoolsHtml.includes(brandSub),
  'Institutions page includes supporting transformation statement'
);

// Check footers
const footerFiles = [
  'index.html',
  'about.html',
  'schools.html',
  'courses.html',
  'contact.html',
  'consultancy.html',
  'community.html',
  'blog.html'
];
let footersCompliant = true;
footerFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (!content.includes('We Don’t Just Deliver Content. We Transform. We Awaken. We Ignite Purpose.')) {
    footersCompliant = false;
  }
});
assert(footersCompliant, 'Global footers across all main templates feature the refined brand message');

// ── 5. Button & Form UX Controls ─────────────────────────────
console.log('\n🎛️ 5. Standardized Buttons & Form Controls');
assert(
  componentsCss.includes('.btn-primary') && componentsCss.includes('var(--cta-color)'),
  'Primary action button uses Action Orange (--cta-color) with high visual prominence'
);
assert(
  componentsCss.includes('.btn-secondary') && componentsCss.includes('var(--secondary-color)'),
  'Secondary action button uses Royal Blue with clear visual contrast'
);
assert(
  componentsCss.includes('.form-input:focus') && componentsCss.includes('box-shadow: 0 0 0 3.5px'),
  'Form controls have standardized high-contrast focus rings'
);

// ── Summary ────────────────────────────────────────────────
console.log('\n========================================');
console.log(`UI/UX Audit Summary: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests`);
console.log('========================================');

if (failedTests > 0) {
  console.error(`❌ ${failedTests} AUDIT(S) FAILED!`);
  process.exit(1);
} else {
  console.log('🎉 ALL UI/UX CONSISTENCY & MODERNIZATION AUDITS PASSED 100%!');
  process.exit(0);
}
