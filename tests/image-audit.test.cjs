const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('\n--- STARTING VISUAL ASSETS & DUPLICATION AUDIT ---\n');

const BASE_DIR = path.resolve(__dirname, '..');
let failures = 0;

function check(testName, fn) {
  try {
    fn();
    console.log(`PASS: ${testName}`);
  } catch (err) {
    console.error(`FAIL: ${testName} -> ${err.message}`);
    failures++;
  }
}

// 1. Check that all physical files exist
check('All newly referenced images exist in assets/images/', () => {
  const imagesToCheck = [
    'home_hero_classroom.jpg',
    'home_interactive_teaching.jpg',
    'home_stem_collaboration.jpg',
    'home_digital_leadership.jpg',
    'home_teacher_coaching.jpg',
    'about_strategy_session.jpg',
    'about_educator_workshop.jpg',
    'consultancy_smart_boards.jpg',
    'consultancy_ict_network.jpg',
    'course_assessment_mastery.jpg',
    'course_smart_vr_classroom.jpg',
    'course_ict_integration.jpg',
    'founder_alex.jpg'
  ];

  for (const img of imagesToCheck) {
    const fullPath = path.join(BASE_DIR, 'assets', 'images', img);
    assert(fs.existsSync(fullPath), `Expected ${fullPath} to exist on disk`);
    const stat = fs.statSync(fullPath);
    assert(stat.size > 10000, `Expected ${img} to have file size > 10KB, got ${stat.size}`);
  }
});

// 2. Check courses.js for zero duplicate course images
check('Zero duplicate course card images in js/courses.js', () => {
  const file = path.join(BASE_DIR, 'js', 'courses.js');
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/image:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  assert(matches.length === 9, `Expected 9 course image declarations, got ${matches.length}`);
  const uniqueSet = new Set(matches);
  assert.strictEqual(uniqueSet.size, matches.length, `Detected duplicate course images: ${matches.length - uniqueSet.size}`);
});

// 3. Check blog-data.js for zero duplicate article cover images
check('Zero duplicate cover images in js/blog-data.js articles', () => {
  const file = path.join(BASE_DIR, 'js', 'blog-data.js');
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/coverImage:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  assert(matches.length >= 7, `Expected at least 7 blog cover images, got ${matches.length}`);
  const uniqueSet = new Set(matches);
  assert.strictEqual(uniqueSet.size, matches.length, `Detected duplicate blog covers: ${matches.length - uniqueSet.size}`);
});

// 4. Check featured resources in js/resources-data.js for zero duplicates
check('Zero duplicate images in featured resources (js/resources-data.js)', () => {
  const file = path.join(BASE_DIR, 'js', 'resources-data.js');
  const content = fs.readFileSync(file, 'utf8');
  const featSectionMatch = content.match(/const featured = \[([\s\S]*?)\n  \];/);
  assert(featSectionMatch, 'Could not locate const featured array');
  const matches = [...featSectionMatch[1].matchAll(/image:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  assert.strictEqual(matches.length, 8, `Expected 8 featured resources, found ${matches.length}`);
  const uniqueSet = new Set(matches);
  assert.strictEqual(uniqueSet.size, matches.length, `Detected duplicate featured resource images: ${matches.length - uniqueSet.size}`);
});

// 5. Check index.html image uniqueness
check('index.html uses distinct images for hero, pathways, and consultation', () => {
  const file = path.join(BASE_DIR, 'index.html');
  const content = fs.readFileSync(file, 'utf8');
  
  assert(content.includes('assets/images/home_hero_classroom.jpg'), 'Hero missing home_hero_classroom.jpg');
  assert(content.includes('assets/images/home_teacher_coaching.jpg'), 'Pathway 1 missing home_teacher_coaching.jpg');
  assert(content.includes('assets/images/home_digital_leadership.jpg'), 'Pathway 2 missing home_digital_leadership.jpg');
  assert(content.includes('assets/images/home_stem_collaboration.jpg'), 'Pathway 3 missing home_stem_collaboration.jpg');
  assert(content.includes('assets/images/about_strategy_session.jpg'), 'Consultation missing about_strategy_session.jpg');
});

// 6. Check about.html image uniqueness
check('about.html uses distinct images for hero and story sections', () => {
  const file = path.join(BASE_DIR, 'about.html');
  const content = fs.readFileSync(file, 'utf8');
  
  assert(content.includes('assets/images/about_strategy_session.jpg'), 'About hero missing about_strategy_session.jpg');
  assert(content.includes('assets/images/about_educator_workshop.jpg'), 'About story missing about_educator_workshop.jpg');
  assert(!content.includes('assets/images/about.png'), 'about.png should not be used as content image');
});

// 7. Check courses.html featured card and banner
check('courses.html uses dedicated high quality images', () => {
  const file = path.join(BASE_DIR, 'courses.html');
  const content = fs.readFileSync(file, 'utf8');
  
  assert(content.includes('assets/images/course_smart_vr_classroom.jpg'), 'Courses featured masterclass missing smart VR image');
  assert(content.includes('assets/images/course_assessment_mastery.jpg'), 'Courses banner missing course assessment mastery image');
});

console.log('\n--- AUDIT SUMMARY ---');
if (failures === 0) {
  console.log('ALL VISUAL DIVERSITY AUDIT TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
} else {
  console.error(`VISUAL AUDIT FAILED WITH ${failures} ERRORS!\n`);
  process.exit(1);
}
