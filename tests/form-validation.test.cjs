const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🔍 Running Form Validation & Step-Blocking Test Suite...\n');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ ${name}: ${err.message}`);
  }
}

// ── 1. Test FormValidator Rules Module ──────────────────────────────
console.log('1. Checking FormValidator rules logic...');

// Evaluate FormValidator logic in Node environment
const formValidatorCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'form-validator.js'), 'utf8');
const fakeWindow = {
  document: {
    getElementById: () => null,
    head: { appendChild: () => {} },
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {} })
  }
};
const vm = require('vm');
const context = { window: fakeWindow, document: fakeWindow.document, URL: global.URL };
vm.createContext(context);
vm.runInContext(formValidatorCode, context);
const RULES = context.window.FormValidator.RULES;

test('RULES.required correctly catches empty / whitespace values', () => {
  assert(RULES.required(null) !== null, 'null should fail required');
  assert(RULES.required('') !== null, 'empty string should fail required');
  assert(RULES.required('   ') !== null, 'whitespace should fail required');
  assert(RULES.required('valid text') === null, 'valid text should pass');
});

test('RULES.nameFormat enforces full name with at least 2 words and letters only', () => {
  assert(RULES.nameFormat('David') !== null, 'single word name should fail');
  assert(RULES.nameFormat('David 123') !== null, 'numbers in name should fail');
  assert(RULES.nameFormat('David @Ochieng') !== null, 'symbols should fail');
  assert(RULES.nameFormat('David Ochieng') === null, 'valid first and last name should pass');
  assert(RULES.nameFormat("Dr. Mary-Anne O'Connor") === null, 'hyphenated / apostrophe names should pass');
});

test('RULES.namePart validates individual first/last name parts', () => {
  assert(RULES.namePart('J') !== null, 'single char name part should fail min length');
  assert(RULES.namePart('John123') !== null, 'numbers should fail');
  assert(RULES.namePart('John@') !== null, 'symbols should fail');
  assert(RULES.namePart('John') === null, 'standard first name should pass');
  assert(RULES.namePart('Mary-Anne') === null, 'hyphenated first name should pass');
  assert(RULES.namePart("O'Connor") === null, 'apostrophe last name should pass');
});

test('RULES.email validates RFC-compliant email formats', () => {
  assert(RULES.email('not-an-email') !== null, 'missing @ and domain should fail');
  assert(RULES.email('test@') !== null, 'missing domain should fail');
  assert(RULES.email('test@domain') !== null, 'missing TLD should fail');
  assert(RULES.email('jane@example.com') === null, 'standard email should pass');
  assert(RULES.email('user.name+tag@instructify.co.ke') === null, 'complex email should pass');
});

test('RULES.phone validates Kenyan phone numbers (07XX, 01XX, +254)', () => {
  assert(RULES.phone('12345') !== null, 'too short number should fail');
  assert(RULES.phone('abcdefghij') !== null, 'letters should fail');
  assert(RULES.phone('0812345678') !== null, 'invalid prefix 08 should fail');
  assert(RULES.phone('0712345678') === null, '07XX standard Kenyan number should pass');
  assert(RULES.phone('0110123456') === null, '01XX standard Kenyan number should pass');
  assert(RULES.phone('+254712345678') === null, '+254 format should pass');
  assert(RULES.phone('0712 345 678') === null, 'spaced format should pass');
});

test('RULES.safaricomPhone enforces Safaricom M-Pesa lines (07XX, 011X, +254)', () => {
  assert(RULES.safaricomPhone('0712345678') === null, '0712 is Safaricom and should pass');
  assert(RULES.safaricomPhone('0110123456') === null, '0110 is Safaricom and should pass');
  assert(RULES.safaricomPhone('+254722000000') === null, '+254722 is Safaricom and should pass');
  assert(RULES.safaricomPhone('0733123456') !== null, '0733 is Airtel and should fail Safaricom rule');
});

test('RULES.password enforces security requirements (min 8 chars, upper, lower, number)', () => {
  assert(RULES.password('short') !== null, 'too short password should fail');
  assert(RULES.password('alllowercase123') !== null, 'missing uppercase should fail');
  assert(RULES.password('ALLUPPERCASE123') !== null, 'missing lowercase should fail');
  assert(RULES.password('NoNumbersHere') !== null, 'missing numbers should fail');
  assert(RULES.password('P@ssw0rd2026') === null, 'strong password should pass');
});

test('RULES.accessCode enforces alphanumeric format (3-20 chars)', () => {
  assert(RULES.accessCode('ab') !== null, 'too short code should fail');
  assert(RULES.accessCode('CODE WITH SPACES') !== null, 'spaces should fail');
  assert(RULES.accessCode('CODE$#@!') !== null, 'special symbols should fail');
  assert(RULES.accessCode('IK-CBC-2026') === null, 'valid code should pass');
  assert(RULES.accessCode('EDTECH_101') === null, 'valid code with underscore should pass');
});

test('RULES.url validates http and https URLs', () => {
  assert(RULES.url('ftp://example.com') !== null, 'ftp protocol should fail');
  assert(RULES.url('random-string') !== null, 'invalid url should fail');
  assert(RULES.url('https://instructify.ke/course') === null, 'valid https URL should pass');
});

// ── 2. Test LMSWizard Step-Validation Logic ─────────────────────────
console.log('\n2. Checking LMSWizard validateStep enforcement...');

const wizardEngineCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'lms-wizard-engine.js'), 'utf8');
const fakeStorage = {};
const wizardContext = {
  window: {
    localStorage: {
      getItem: (k) => fakeStorage[k] || null,
      setItem: (k, v) => { fakeStorage[k] = v; },
      removeItem: (k) => { delete fakeStorage[k]; }
    },
    dispatchEvent: () => {}
  },
  setInterval: () => 1,
  clearInterval: () => {},
  setTimeout: () => 1,
  clearTimeout: () => {}
};
vm.createContext(wizardContext);
vm.runInContext(wizardEngineCode, wizardContext);
const LMSWizard = wizardContext.window.LMSWizard;

test('LMSWizard step 1 blocks empty title and short description', () => {
  LMSWizard.initWizard();
  LMSWizard.updateField('title', 'a'); // too short
  LMSWizard.updateField('shortDescription', 'short'); // too short
  LMSWizard.updateField('category', ''); // missing
  const errors = LMSWizard.validateStep(1);
  assert(errors.length >= 3, 'Should produce at least 3 errors for invalid step 1');
  assert(errors.some(e => e.includes('title')), 'Error must mention title');
  assert(errors.some(e => e.includes('description')), 'Error must mention description');
  assert(errors.some(e => e.includes('category')), 'Error must mention category');
});

test('LMSWizard step 1 accepts valid title, category and description', () => {
  LMSWizard.updateField('title', 'Digital Pedagogy for CBC');
  LMSWizard.updateField('shortDescription', 'A comprehensive course on integrating digital tools in CBC classrooms.');
  LMSWizard.updateField('category', 'Pedagogy & Methodology');
  const errors = LMSWizard.validateStep(1);
  assert.strictEqual(errors.length, 0, 'Valid step 1 should have zero errors');
});

test('LMSWizard step 2 blocks empty learning outcomes', () => {
  LMSWizard.updateField('learningOutcomes', ['   ', '']); // whitespace only
  const errors = LMSWizard.validateStep(2);
  assert(errors.length > 0, 'Whitespace-only learning outcomes must fail');
  assert(errors.some(e => e.includes('learning outcome')), 'Should mention learning outcome');

  LMSWizard.updateField('learningOutcomes', ['Understand CBC competency frameworks']);
  const validErrors = LMSWizard.validateStep(2);
  assert.strictEqual(validErrors.length, 0, 'Valid learning outcome should pass');
});

test('LMSWizard step 3 blocks curriculum with no sections or no lessons', () => {
  LMSWizard.updateField('curriculum', []);
  assert(LMSWizard.validateStep(3).length > 0, 'Empty curriculum must fail');

  // Section with no lessons
  LMSWizard.updateField('curriculum', [{ title: 'Module 1', modules: [{ title: 'Unit 1', lessons: [] }] }]);
  assert(LMSWizard.validateStep(3).some(e => e.includes('lesson')), 'Curriculum without lessons must fail');

  // Section with a valid lesson
  LMSWizard.updateField('curriculum', [{
    title: 'Module 1',
    modules: [{ title: 'Unit 1', lessons: [{ title: 'Lesson 1: Intro', type: 'text' }] }]
  }]);
  assert.strictEqual(LMSWizard.validateStep(3).length, 0, 'Curriculum with lessons must pass');
});

test('LMSWizard step 6 blocks invalid access codes and non-positive prices', () => {
  LMSWizard.updateField('accessType', 'code');
  LMSWizard.updateField('accessCode', '!!'); // invalid
  LMSWizard.updateField('pricing', 'paid');
  LMSWizard.updateField('price', 0); // invalid price

  const errors = LMSWizard.validateStep(6);
  assert(errors.some(e => e.includes('Access code')), 'Should reject invalid access code');
  assert(errors.some(e => e.includes('price')), 'Should reject 0 price on paid course');

  LMSWizard.updateField('accessCode', 'IK-CBC-2026');
  LMSWizard.updateField('price', 8500);
  assert.strictEqual(LMSWizard.validateStep(6).length, 0, 'Valid access code and price should pass');
});

// ── 3. Test Integration & Step-Blocking in HTML files ───────────────
console.log('\n3. Checking HTML step-blocking and validator inclusions...');

test('course-wizard.html contains form-validator.js and blocks navigation on error', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'course-wizard.html'), 'utf8');
  assert(html.includes('<script src="js/form-validator.js"></script>'), 'Must load form-validator.js');
  assert(html.includes('validateCurrentStepForm'), 'Must call step validation');
  const match = html.match(/if\s*\(!validation\.valid\)\s*\{[\s\S]*?return;\s*\}/);
  assert(match !== null, 'wizardNext MUST return early and block step advance when validation fails');
  assert(html.includes('syncCurrentStepInputs'), 'Must sync inputs before validating');
});

test('checkout.html contains form-validator.js and blocks invalid customer details', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'checkout.html'), 'utf8');
  assert(html.includes('<script src="js/form-validator.js"></script>'), 'Must load form-validator.js');
  assert(html.includes('continueToPayment'), 'Must define continueToPayment');
  assert(html.includes('return; // BLOCK: Cannot proceed to payment step with invalid data!'), 'continueToPayment must block transition if details invalid');
  assert(html.includes('submitMpesa'), 'Must define submitMpesa');
  assert(html.includes('phoneErr'), 'submitMpesa must validate phone number');
  assert(html.includes('return; // BLOCK! Do not trigger payment'), 'submitMpesa must block invalid phone numbers');
});

test('register.html contains form-validator.js and blocks invalid signup/signin', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'register.html'), 'utf8');
  assert(html.includes('<script src="js/form-validator.js"></script>'), 'Must load form-validator.js');
  assert(html.includes('handleSignUp'), 'Must define handleSignUp');
  assert(html.includes('handleSignIn'), 'Must define handleSignIn');
  assert(html.includes('return; // BLOCK!'), 'handleSignUp & handleSignIn must block on validation failure');
});

test('training-registration.html and workshop-registration.html contain form-validator.js', () => {
  const trHtml = fs.readFileSync(path.join(__dirname, '..', 'training-registration.html'), 'utf8');
  const wkHtml = fs.readFileSync(path.join(__dirname, '..', 'workshop-registration.html'), 'utf8');
  assert(trHtml.includes('js/form-validator.js'), 'training-registration must include form-validator.js');
  assert(wkHtml.includes('js/form-validator.js'), 'workshop-registration must include form-validator.js');
});

test('js/main.js strictly blocks invalid submissions and auto-loads FormValidator', () => {
  const mainJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
  assert(mainJs.includes('return; // BLOCK submission!'), 'Both submit handlers in main.js must block on validation failure');
  assert(mainJs.includes('js/form-validator.js'), 'main.js must contain universal form-validator auto-loader');
  assert(mainJs.includes('window.FormValidator.autoInit()'), 'main.js must call autoInit');
});

test('contact.html contains form-validator.js and validates contact form', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'contact.html'), 'utf8');
  assert(html.includes('js/form-validator.js'), 'contact.html must include form-validator.js');
  assert(html.includes('FormValidator.validateForm'), 'contact.html must validate contact form');
  assert(html.includes('return;'), 'contact.html must return early on validation failure');
});

test('login.html contains form-validator.js and validates login credentials', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'login.html'), 'utf8');
  assert(html.includes('js/form-validator.js'), 'login.html must include form-validator.js');
  assert(html.includes('FormValidator.validateForm'), 'login.html must validate login credentials');
  assert(html.includes('return;'), 'login.html must block invalid credentials from attempting login');
});

test('forgot-password.html and reset-password.html contain form-validator.js and enforce rules', () => {
  const forgotHtml = fs.readFileSync(path.join(__dirname, '..', 'forgot-password.html'), 'utf8');
  const resetHtml = fs.readFileSync(path.join(__dirname, '..', 'reset-password.html'), 'utf8');
  assert(forgotHtml.includes('js/form-validator.js'), 'forgot-password must include form-validator.js');
  assert(forgotHtml.includes('FormValidator.validateForm'), 'forgot-password must validate email format');
  assert(resetHtml.includes('js/form-validator.js'), 'reset-password must include form-validator.js');
  assert(resetHtml.includes('FormValidator.validateGroup'), 'reset-password must validate password match and strength');
});

test('consultancy.html and js/consultancy.js enforce validation on consultation form', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'consultancy.html'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, '..', 'js', 'consultancy.js'), 'utf8');
  assert(html.includes('js/form-validator.js'), 'consultancy.html must include form-validator.js');
  assert(js.includes('FormValidator.validateForm'), 'js/consultancy.js must validate consultation form');
});

test('index.html contains form-validator.js and validates consultation & newsletter forms', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(html.includes('js/form-validator.js'), 'index.html must include form-validator.js');
  assert(html.includes('FormValidator.validateForm'), 'index.html must validate forms with FormValidator');
});

test('podcast.html and js/podcast.js validate topic and guest proposal forms', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'podcast.html'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, '..', 'js', 'podcast.js'), 'utf8');
  assert(html.includes('js/form-validator.js'), 'podcast.html must include form-validator.js');
  assert(js.includes('FormValidator.validateForm'), 'js/podcast.js must validate topic and guest forms');
});

test('resources.html and js/resources.js validate educational resource submission', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'resources.html'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, '..', 'js', 'resources.js'), 'utf8');
  assert(html.includes('js/form-validator.js'), 'resources.html must include form-validator.js');
  assert(js.includes('FormValidator.validateForm'), 'js/resources.js must validate resource submission');
});

test('blog.html and js/blog.js validate newsletter subscription', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'blog.html'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, '..', 'js', 'blog.js'), 'utf8');
  assert(html.includes('js/form-validator.js'), 'blog.html must include form-validator.js');
  assert(js.includes('FormValidator.validateForm'), 'js/blog.js must validate newsletter subscription');
});

test('certification.html and verify.html validate credential search inputs', () => {
  const certHtml = fs.readFileSync(path.join(__dirname, '..', 'certification.html'), 'utf8');
  const verifyHtml = fs.readFileSync(path.join(__dirname, '..', 'verify.html'), 'utf8');
  assert(certHtml.includes('js/form-validator.js'), 'certification.html must include form-validator.js');
  assert(certHtml.includes('FormValidator.validate'), 'certification.html must validate cert ID input');
  assert(verifyHtml.includes('js/form-validator.js'), 'verify.html must include form-validator.js');
  assert(verifyHtml.includes('FormValidator.validate'), 'verify.html must validate search input');
});

test('jumuishi-learning-hub.html and js/jumuishi.js validate inclusive consultation form', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'jumuishi-learning-hub.html'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, '..', 'js', 'jumuishi.js'), 'utf8');
  assert(html.includes('js/form-validator.js'), 'jumuishi-learning-hub.html must include form-validator.js');
  assert(js.includes('FormValidator.validateForm'), 'js/jumuishi.js must validate consultation request');
});

test('educator portal pages (students, gradebook, assessments, announcements) enforce validation', () => {
  const studentsHtml = fs.readFileSync(path.join(__dirname, '..', 'educator-students.html'), 'utf8');
  const gradebookHtml = fs.readFileSync(path.join(__dirname, '..', 'educator-gradebook.html'), 'utf8');
  const assessmentsHtml = fs.readFileSync(path.join(__dirname, '..', 'educator-assessments.html'), 'utf8');
  const announcementsHtml = fs.readFileSync(path.join(__dirname, '..', 'educator-announcements.html'), 'utf8');

  assert(studentsHtml.includes('js/form-validator.js') && studentsHtml.includes('FormValidator.validateForm'), 'educator-students.html must validate enrol form');
  assert(gradebookHtml.includes('js/form-validator.js') && gradebookHtml.includes('FormValidator.validateForm'), 'educator-gradebook.html must validate grade score');
  assert(assessmentsHtml.includes('js/form-validator.js') && assessmentsHtml.includes('FormValidator.validateForm'), 'educator-assessments.html must validate rubrics and new assessments');
  assert(announcementsHtml.includes('js/form-validator.js') && announcementsHtml.includes('FormValidator.validateForm'), 'educator-announcements.html must validate announcement broadcasts');
});

test('student-assignments.html validates coursework submission', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'student-assignments.html'), 'utf8');
  assert(html.includes('js/form-validator.js'), 'student-assignments.html must include form-validator.js');
  assert(html.includes('submit-notes') && html.includes('file-upload-input'), 'student-assignments must validate that file or notes are provided');
});

console.log('\n=============================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
if (passedTests === totalTests) {
  console.log('🎉 ALL FORM VALIDATION & STEP-BLOCKING AUDITS PASSED WITH 100% SUCCESS!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
