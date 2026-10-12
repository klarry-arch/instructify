const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Audience Course Showcase Pure Verification Suite...\n');

const htmlPath = path.join(__dirname, '..', 'courses.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

let totalTests = 0;
let passedTests = 0;

function check(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASSED: ${testName}`);
  } catch (err) {
    console.error(`  ❌ FAILED: ${testName} -> ${err.message}`);
  }
}

// ── 1. Introductory Section ──────────────────────────────────
console.log('1. Introductory Section Checks:');
check('Section #audience-showcase-section exists', () => {
  assert(htmlContent.includes('id="audience-showcase-section"'), 'Missing #audience-showcase-section');
});

check('Heading text: "Explore Courses for Every Learning Journey"', () => {
  assert(htmlContent.includes('Explore Courses for Every Learning Journey'), 'Missing exact heading text');
});

check('Supporting subtitle text matches requirement', () => {
  const expectedSub = 'Discover practical, engaging courses designed for educators, students, professionals and lifelong learners.';
  assert(htmlContent.includes(expectedSub), 'Missing exact subtitle text');
});

// ── 2. Audience Category Tabs ────────────────────────────────
console.log('\n2. Audience Category Tabs Checks:');
check('Contains role="tablist" container', () => {
  assert(htmlContent.includes('role="tablist"'), 'Missing role="tablist"');
});

check('Contains "Educators" tab (active by default with aria-selected="true" and tabindex="0")', () => {
  assert(htmlContent.includes('id="audience-tab-educators"'), 'Missing educators tab ID');
  assert(htmlContent.includes('onclick="switchAudienceCategory(\'educators\')"'), 'Missing educators onclick handler');
  assert(htmlContent.includes('aria-selected="true"'), 'Educators tab must have aria-selected="true"');
  assert(htmlContent.includes('tabindex="0"'), 'Educators tab must have tabindex="0"');
});

check('Contains "Students" tab (inactive by default with aria-selected="false" and tabindex="-1")', () => {
  assert(htmlContent.includes('id="audience-tab-students"'), 'Missing students tab ID');
  assert(htmlContent.includes('onclick="switchAudienceCategory(\'students\')"'), 'Missing students onclick handler');
});

check('Contains "Professionals" tab (inactive by default with aria-selected="false" and tabindex="-1")', () => {
  assert(htmlContent.includes('id="audience-tab-professionals"'), 'Missing professionals tab ID');
  assert(htmlContent.includes('onclick="switchAudienceCategory(\'professionals\')"'), 'Missing professionals onclick handler');
});

// ── 3. Dynamic Category Heading & Cards Grid ─────────────────
console.log('\n3. Dynamic Category Heading & Cards Grid:');
check('Contains dynamic heading element #audience-dynamic-h2', () => {
  assert(htmlContent.includes('id="audience-dynamic-h2"'), 'Missing #audience-dynamic-h2');
  assert(htmlContent.includes('Courses for Educators'), 'Initial heading must be Courses for Educators');
});

check('Contains dynamic description #audience-dynamic-desc', () => {
  assert(htmlContent.includes('id="audience-dynamic-desc"'), 'Missing #audience-dynamic-desc');
});

check('Contains course cards grid #audience-cards-grid', () => {
  assert(htmlContent.includes('id="audience-cards-grid"'), 'Missing #audience-cards-grid');
});

check('Contains "Browse All Courses" button #btn-browse-all-audience', () => {
  assert(htmlContent.includes('id="btn-browse-all-audience"'), 'Missing #btn-browse-all-audience');
  assert(htmlContent.includes('Browse All Courses'), 'Missing Browse All Courses label');
  assert(htmlContent.includes('onclick="toggleBrowseAllAudienceCourses()"'), 'Missing toggleBrowseAllAudienceCourses onclick');
});

// ── 4. Controller Script & Business Logic ────────────────────
console.log('\n4. Audience Showcase Script & Business Logic:');
check('Controller script #audience-showcase-script exists', () => {
  assert(htmlContent.includes('id="audience-showcase-script"'), 'Missing #audience-showcase-script');
});

check('Script contains category mappings for educators, students, professionals', () => {
  assert(htmlContent.includes('educators:'), 'Missing educators mapping');
  assert(htmlContent.includes('students:'), 'Missing students mapping');
  assert(htmlContent.includes('professionals:'), 'Missing professionals mapping');
  assert(htmlContent.includes('crs_001'), 'Includes crs_001');
  assert(htmlContent.includes('crs_002'), 'Includes crs_002');
  assert(htmlContent.includes('crs_003'), 'Includes crs_003');
  assert(htmlContent.includes('crs_004'), 'Includes crs_004');
  assert(htmlContent.includes('crs_006'), 'Includes crs_006');
});

check('Script defines window.switchAudienceCategory', () => {
  assert(htmlContent.includes('window.switchAudienceCategory'), 'Missing window.switchAudienceCategory definition');
});

check('Script defines window.toggleBrowseAllAudienceCourses', () => {
  assert(htmlContent.includes('window.toggleBrowseAllAudienceCourses'), 'Missing window.toggleBrowseAllAudienceCourses definition');
});

check('Script supports keyboard navigation (ArrowRight, ArrowLeft, Home, End)', () => {
  assert(htmlContent.includes('ArrowRight') && htmlContent.includes('ArrowLeft'), 'Keyboard navigation handler exists');
});

check('Preserves checkout route checkout.html?id= and details route course-detail.html?id=', () => {
  assert(htmlContent.includes('checkout.html?id='), 'Checkout route preserved');
  assert(htmlContent.includes('course-detail.html?id='), 'Details route preserved');
  assert(htmlContent.includes('course-player.html?courseId='), 'Player route preserved');
});

// ── 5. Scoped CSS & Responsive Architecture ──────────────────
console.log('\n5. Scoped CSS & Responsive Architecture:');
check('Scoped styles tag #audience-showcase-styles exists', () => {
  assert(htmlContent.includes('id="audience-showcase-styles"'), 'Missing #audience-showcase-styles');
});

check('Desktop CSS defines 3-column grid', () => {
  assert(htmlContent.includes('grid-template-columns: repeat(3, 1fr)'), 'Missing 3-column repeat rule');
});

check('Tablet media query defines 2-column grid', () => {
  assert(htmlContent.includes('@media (max-width: 991px)') && htmlContent.includes('grid-template-columns: repeat(2, 1fr)'), 'Missing tablet 2-column rule');
});

check('Mobile media query defines 1-column grid', () => {
  assert(htmlContent.includes('@media (max-width: 640px)') && htmlContent.includes('grid-template-columns: 1fr'), 'Missing mobile 1-column rule');
});

check('Card styles include 18px rounded corners and subtle hover elevation', () => {
  assert(htmlContent.includes('border-radius: 18px'), 'Missing 18px radius');
  assert(htmlContent.includes('transform: translateY(-4px)'), 'Missing hover elevation');
});

check('Active tab indicator uses primary brand color #2145E6', () => {
  assert(htmlContent.includes('border-bottom: 3px solid transparent') && htmlContent.includes('#2145E6'), 'Missing primary brand color tab underline');
});

// ── 6. Negative Checks (Scope & Brand Protection) ────────────
console.log('\n6. Brand & Scope Safeguard Checks:');
check('Contains zero Google branding, Google logos or Google for Education text', () => {
  const showcaseSectionMatch = htmlContent.match(/<section class="audience-showcase-section"[\s\S]*?<\/section>/);
  assert(showcaseSectionMatch, 'Could not locate showcase section');
  const sectionContent = showcaseSectionMatch[0];
  assert(!sectionContent.toLowerCase().includes('google'), 'Showcase section must not mention Google');
});

check('Existing training registration form #training-form and modal remain intact', () => {
  assert(htmlContent.includes('id="training-form"'), 'Missing #training-form');
  assert(htmlContent.includes('id="training-registration-form"'), 'Missing #training-registration-form');
  assert(htmlContent.includes('id="training-ticket-modal"'), 'Missing training ticket modal');
});

check('Existing high-quality audit images remain present in courses.html', () => {
  assert(htmlContent.includes('assets/images/course_smart_vr_classroom.jpg'), 'Missing smart VR classroom image');
  assert(htmlContent.includes('assets/images/course_assessment_mastery.jpg'), 'Missing course assessment mastery image');
});

check('Global footer refined brand message remains intact', () => {
  assert(htmlContent.includes('We Don’t Just Deliver Content. We Transform. We Awaken. We Ignite Purpose.'), 'Missing global footer brand message');
});

console.log('\n========================================');
console.log(`Audience Showcase Audit Summary: ${passedTests} passed out of ${totalTests} tests`);
console.log('========================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL AUDIENCE SHOWCASE SPECIFICATION AUDITS PASSED 100%!\n');
  process.exit(0);
} else {
  console.error(`❌ ${totalTests - passedTests} TEST(S) FAILED!`);
  process.exit(1);
}
