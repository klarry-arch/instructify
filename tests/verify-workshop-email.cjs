const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failures++;
  } else {
    console.log(`  ✅ PASSED: ${message}`);
  }
}

console.log('🔍 Auditing Workshop Registration & Email Dispatch Architecture...\n');

// 1. Audit api/contact.php
console.log('1. Checking api/contact.php...');
const contactPhp = fs.readFileSync(path.join(ROOT_DIR, 'api', 'contact.php'), 'utf8');

assert(/\$isWorkshop\s*=\s*\(\$category === 'Workshop Registration'/.test(contactPhp), 'Detects Workshop Registration category');
assert(contactPhp.includes('$passId        = sanitizeSingleLine('), 'Extracts and sanitizes passId');
assert(contactPhp.includes('info@instructify.co.ke'), 'Routes workshop registrations to info@instructify.co.ke');
assert(contactPhp.includes('New Workshop Registration'), 'Generates specialized Team Notification email for workshops');
assert(contactPhp.includes('Your Workshop Entry Pass'), 'Generates specialized Workshop Entry Pass autoresponder email');
assert(contactPhp.includes('Official Entry Pass') || contactPhp.includes('Entry Pass'), 'Includes Workshop Entry Pass card in client email');
assert(contactPhp.includes('\'passId\'          => $isWorkshop ? $passId : null'), 'Logs passId and workshop fields in audit log');

// 2. Audit js/main.js
console.log('\n2. Checking js/main.js...');
const mainJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'main.js'), 'utf8');

assert(mainJs.includes('window.handleWorkshopSubmit = function(event)'), 'handleWorkshopSubmit exists');
assert(mainJs.includes('fetch(\'api/contact.php\''), 'Dispatches payload to api/contact.php');
assert(mainJs.includes('category: \'Workshop Registration\''), 'Specifies Workshop Registration category');
assert(mainJs.includes('passId: passId'), 'Includes official passId in payload');
assert(mainJs.includes('workshopTitle: workshopTitle'), 'Includes workshopTitle in payload');
assert(mainJs.includes('ticketModal.classList.add(\'active\')'), 'Immediately opens on-screen Ticket Modal for zero-lag UX');

// 3. Audit workshop-registration.html
console.log('\n3. Checking workshop-registration.html...');
const workshopHtml = fs.readFileSync(path.join(ROOT_DIR, 'workshop-registration.html'), 'utf8');

assert(workshopHtml.includes('id="workshop-registration-form"'), 'Contains workshop-registration-form');
assert(workshopHtml.includes('name="_hp_instructify"'), 'Contains anti-spam honeypot input');
assert(workshopHtml.includes('id="ticket-modal"'), 'Contains ticket modal');
assert(workshopHtml.includes('info@instructify.co.ke'), 'Informs attendee of email dispatch to info@instructify.co.ke');

// 4. Audit api/contact.js
console.log('\n4. Checking api/contact.js...');
const contactJs = fs.readFileSync(path.join(ROOT_DIR, 'api', 'contact.js'), 'utf8');

assert(contactJs.includes('Workshop Registration'), 'Supports Workshop Registration category in Node API');
assert(contactJs.includes('isWorkshop'), 'Identifies workshop registrations in Node API');

console.log('\n=============================================');
if (failures === 0) {
  console.log('🎉 ALL WORKSHOP EMAIL DISPATCH AUDITS PASSED!');
} else {
  console.error(`💥 ${failures} AUDIT(S) FAILED.`);
  process.exit(1);
}
