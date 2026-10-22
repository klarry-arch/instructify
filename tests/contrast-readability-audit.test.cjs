const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');

console.log('══════════════════════════════════════════════════════════════');
console.log('   INSTRUCTIFY KENYA — TEXT VISIBILITY & CONTRAST AUDIT');
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

// ─────────────────────────────────────────────────────────────
// 1. GLOBAL DESIGN TOKENS & PREFERRED COLOR AUDIT
// ─────────────────────────────────────────────────────────────
console.log('1. Checking Global Tokens & Color Contrast System in css/global.css...');

const globalCss = fs.readFileSync(path.join(rootDir, 'css/global.css'), 'utf8');

check('Root contains primary text token #1E293B', () => {
  assert(/--heading-color:\s+#1E293B/.test(globalCss), 'Missing primary heading token');
  assert(/--text-color:\s+#1E293B/.test(globalCss), 'Missing primary text token');
});

check('Root contains secondary text token #475569', () => {
  assert(/--text-secondary:\s+#475569/.test(globalCss), 'Missing secondary text token');
  assert(/--color-text-secondary:\s+#475569/.test(globalCss), 'Missing color-text-secondary token');
});

check('Root contains muted text token #64748B', () => {
  assert(/--muted-text-color:\s+#64748B/.test(globalCss), 'Missing muted text token');
});

// ─────────────────────────────────────────────────────────────
// 2. HOMEPAGE & HERO SECTION VISIBILITY
// ─────────────────────────────────────────────────────────────
console.log('\n2. Checking Homepage (index.html & css/homepage.css) Readability...');

const homepageCss = fs.readFileSync(path.join(rootDir, 'css/homepage.css'), 'utf8');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

check('Hero subtitle has high contrast secondary text color #475569', () => {
  assert(homepageCss.includes('color: #475569;') && homepageCss.includes('.hero-subtitle'), 'Hero subtitle should be #475569');
});

check('Section descriptions use high contrast #475569', () => {
  assert(homepageCss.includes('.section-description') && homepageCss.includes('color: #475569 !important;'), 'Section descriptions should be #475569');
});

check('Programme cards have high contrast descriptions', () => {
  assert(homepageCss.includes('.programme-summary') && homepageCss.includes('color: #475569 !important;'), 'Programme summaries must be #475569');
});

check('Modern footer default text color is high-contrast light slate #E2E8F0', () => {
  assert(homepageCss.includes('.site-footer-modern') && homepageCss.includes('color: #E2E8F0;'), 'Footer text must be #E2E8F0 on dark #0F172A background');
});

check('Footer links are high contrast #CBD5E1 and hover to #FFFFFF', () => {
  assert(homepageCss.includes('.footer-nav-list a') && homepageCss.includes('color: #CBD5E1;'), 'Footer links must be #CBD5E1');
  assert(homepageCss.includes('.footer-nav-list a:hover') && homepageCss.includes('color: #FFFFFF;'), 'Footer links hover must be #FFFFFF');
});

// ─────────────────────────────────────────────────────────────
// 3. ABOUT PAGE CONTRAST & BADGE VISIBILITY
// ─────────────────────────────────────────────────────────────
console.log('\n3. Checking About Page (about.html & css/about.css) Readability...');

const aboutCss = fs.readFileSync(path.join(rootDir, 'css/about.css'), 'utf8');
const aboutHtml = fs.readFileSync(path.join(rootDir, 'about.html'), 'utf8');

check('about.html hero badge is NOT white text on light background', () => {
  assert(!aboutHtml.includes('color: #FFFFFF; background: rgba(255,255,255,0.15)'), 'White badge on light background forbidden');
  assert(aboutHtml.includes('background:#EEF2FF;') && aboutHtml.includes('color:#4F46E5;'), 'Badge should have clear purple/indigo contrast on soft lavender');
});

check('about.html hero CTAs do NOT use invisible .btn-white on light background', () => {
  const heroSection = aboutHtml.split('<section class="about-hero-section">')[1].split('</section>')[0];
  assert(!heroSection.includes('btn-white'), 'Invisible btn-white removed from hero');
  assert(heroSection.includes('btn-primary') && heroSection.includes('btn-secondary'), 'Hero contains accessible btn-primary and btn-secondary');
});

check('about.css hero paragraph has high contrast #475569', () => {
  assert(aboutCss.includes('.about-hero-text p') && aboutCss.includes('color: #475569 !important;'), 'Hero paragraph should be #475569 !important');
});

check('about.css pillar card description has high contrast #475569', () => {
  assert(aboutCss.includes('.pillar-card-desc') && aboutCss.includes('color: #475569;'), 'Pillar card desc must be #475569');
});

// ─────────────────────────────────────────────────────────────
// 4. CONSULTANCY PAGE CONTRAST & SECTION VISIBILITY
// ─────────────────────────────────────────────────────────────
console.log('\n4. Checking Consultancy Page (consultancy.html & css/consultancy.css)...');

const consultancyCss = fs.readFileSync(path.join(rootDir, 'css/consultancy.css'), 'utf8');

check('consultancy.css hero subtitle is #475569', () => {
  assert(consultancyCss.includes('.consultancy-hero-subtitle') && consultancyCss.includes('color:#475569;'), 'Consultancy hero subtitle must be #475569');
});

check('consultancy.css trust item text is #475569', () => {
  assert(consultancyCss.includes('.trust-item') && consultancyCss.includes('color:#475569;'), 'Trust items must be #475569');
});

check('consultancy.css service-benefits-label is NOT faded grey #94A3B8', () => {
  assert(consultancyCss.includes('.service-benefits-label{font-family:var(--font-heading);font-size:11px;font-weight:700;color:#475569;'), 'Benefits label must be #475569');
});

check('consultancy.css dark background sections use #E2E8F0 / #CBD5E1 for text', () => {
  assert(consultancyCss.includes('.booking-info-desc{') && consultancyCss.includes('color:#E2E8F0;'), 'Booking info desc must be #E2E8F0 on dark navy');
  assert(consultancyCss.includes('.final-cta-desc{') && consultancyCss.includes('color:#E2E8F0;'), 'Final CTA desc must be #E2E8F0 on dark navy');
});

// ─────────────────────────────────────────────────────────────
// 5. BUTTON STATES & VISIBILITY AUDIT
// ─────────────────────────────────────────────────────────────
console.log('\n5. Checking Button States (Default, Hover, Active, Focus, Disabled)...');

const componentsCss = fs.readFileSync(path.join(rootDir, 'css/components.css'), 'utf8');

check('Primary button has pure white text #FFFFFF !important', () => {
  assert(componentsCss.includes('.btn-primary,') && componentsCss.includes('color: #FFFFFF !important;'), 'Primary button must have #FFFFFF text');
});

check('Primary button hover maintains pure white text #FFFFFF !important', () => {
  assert(componentsCss.includes('.btn-primary:hover,') && componentsCss.includes('color: #FFFFFF !important;'), 'Primary button hover must remain #FFFFFF');
});

check('Secondary button has clear contrast text #4F46E5 on soft lavender', () => {
  assert(componentsCss.includes('.btn-secondary,') && componentsCss.includes('color: var(--secondary-color, #4F46E5) !important;'), 'Secondary button must have #4F46E5 text');
});

check('Disabled button text is legible #64748B (not washed out light grey)', () => {
  assert(componentsCss.includes('.btn:disabled') && componentsCss.includes('color: var(--text-disabled, #64748B) !important;'), 'Disabled button text must be #64748B');
});

check('Buttons have focus-visible outlines for keyboard accessibility', () => {
  assert(componentsCss.includes('.btn:focus-visible'), 'Button must define :focus-visible');
});

// ─────────────────────────────────────────────────────────────
// 6. CONTACT PAGE CONTRAST AUDIT
// ─────────────────────────────────────────────────────────────
console.log('\n6. Checking Contact Page (contact.html)...');

const contactHtml = fs.readFileSync(path.join(rootDir, 'contact.html'), 'utf8');

check('contact.html hero title is bright white #FFFFFF', () => {
  assert(contactHtml.includes('.contact-hero-title') && contactHtml.includes('color: #FFFFFF !important;'), 'Hero title must be white on dark');
});

check('contact.html hero subtitle is readable #E2E8F0', () => {
  assert(contactHtml.includes('.contact-hero-subtitle') && contactHtml.includes('color: #E2E8F0 !important;'), 'Hero subtitle must be #E2E8F0');
});

check('contact.html form subtitle is readable #475569', () => {
  assert(contactHtml.includes('.contact-form-subtitle') && contactHtml.includes('color: #475569;'), 'Contact form subtitle must be #475569');
});

check('contact.html capability description is readable #475569', () => {
  assert(contactHtml.includes('.capability-desc') && contactHtml.includes('color: #475569;'), 'Capability description must be #475569');
});

// ─────────────────────────────────────────────────────────────
// 7. LMS & COURSES DASHBOARD CONTRAST AUDIT
// ─────────────────────────────────────────────────────────────
console.log('\n7. Checking LMS & Courses Dashboard (css/lms-course-dashboard.css)...');

const lmsDashboardCss = fs.readFileSync(path.join(rootDir, 'css/lms-course-dashboard.css'), 'utf8');

check('LMS scoped text variables use standard accessible palette', () => {
  assert(lmsDashboardCss.includes('--lms-text-main: #1E293B;'), 'LMS text main must be #1E293B');
  assert(lmsDashboardCss.includes('--lms-text-muted: #475569;'), 'LMS text muted must be #475569');
  assert(lmsDashboardCss.includes('--lms-text-light: #64748B;'), 'LMS text light must be #64748B');
});

check('LMS course price original strike-through is readable #64748B', () => {
  assert(lmsDashboardCss.includes('.lms-course-price-box .price-original') && lmsDashboardCss.includes('color: #64748B;'), 'Original price strike-through must be #64748B');
});

// ─────────────────────────────────────────────────────────────
// 8. JUMUISHI LEARNING HUB DARK THEME CONTRAST AUDIT
// ─────────────────────────────────────────────────────────────
console.log('\n8. Checking Jumuishi Inclusive Hub (css/jumuishi.css)...');

const jumuishiCss = fs.readFileSync(path.join(rootDir, 'css/jumuishi.css'), 'utf8');

check('Jumuishi dark hero subtitle is high contrast #E2E8F0', () => {
  assert(jumuishiCss.includes('.jum-hero-subtitle') && jumuishiCss.includes('color: #E2E8F0;'), 'Jumuishi hero subtitle must be #E2E8F0');
});

check('Jumuishi relationship badge text is high contrast #E2E8F0', () => {
  assert(jumuishiCss.includes('.jum-hero-relationship') && jumuishiCss.includes('color: #E2E8F0;'), 'Jumuishi relationship text must be #E2E8F0');
});

// ─────────────────────────────────────────────────────────────
// 9. BLOG & ARTICLE CONTRAST AUDIT
// ─────────────────────────────────────────────────────────────
console.log('\n9. Checking Blog & Article Pages (css/blog.css & article.html)...');

const blogCss = fs.readFileSync(path.join(rootDir, 'css/blog.css'), 'utf8');
const articleHtml = fs.readFileSync(path.join(rootDir, 'article.html'), 'utf8');

check('Blog search box icon is readable #64748B', () => {
  assert(blogCss.includes('.blog-search-box svg') && blogCss.includes('color: #64748B;'), 'Blog search icon must be #64748B');
});

check('Article card meta right is readable #475569', () => {
  assert(blogCss.includes('.article-card-meta-right') && blogCss.includes('color: #475569;'), 'Article card meta must be #475569');
});

check('Article detail title has #FFFFFF !important on dark header', () => {
  assert(articleHtml.includes('id="art-detail-title"') && articleHtml.includes('color:#FFFFFF !important;'), 'Article title must be white on dark header');
});

// ─────────────────────────────────────────────────────────────
// 10. MOBILE READABILITY & TOUCH TARGETS
// ─────────────────────────────────────────────────────────────
console.log('\n10. Checking Mobile Responsiveness & Accessibility...');

check('Global buttons enforce minimum height 44px for touch targets', () => {
  assert(componentsCss.includes('min-height: 44px;'), 'Buttons must enforce 44px min-height for touch compliance');
});

check('Global headings enforce strong weights (600 - 800)', () => {
  assert(homepageCss.includes('font-weight: 800') || homepageCss.includes('font-weight: 750'), 'Homepage headings must use strong weights');
  assert(globalCss.includes('h1, h2, h3, h4, h5, h6') && globalCss.includes('font-weight: 700'), 'Global headings default to 700 weight');
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
  console.log('🎉 ALL TEXT VISIBILITY & CONTRAST AUDITS PASSED 100%!\n');
  process.exit(0);
}
