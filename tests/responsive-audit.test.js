/* ============================================================
   INSTRUCTIFY KENYA — Responsive & Accessibility Test Suite
   Automated verification of responsive layout, navigation,
   touch targets, mobile forms, tables, and accessibility.
   ============================================================ */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const HTML_PAGES = [
  'index.html',
  'about.html',
  'courses.html',
  'course-detail.html',
  'courses/digital-literacy-ict-integration.html',
  'checkout.html',
  'payment-success.html',
  'dashboard-learner.html',
  'dashboard-trainer.html',
  'dashboard-admin.html',
  'register.html',
  'contact.html',
  'consultancy.html',
  'schools.html',
  'events.html',
  'workshop-registration.html',
  'training-registration.html',
  'certification.html',
  'verify.html',
  'resources.html',
  'podcast.html',
  'episode.html',
  'blog.html',
  'article.html',
  'news.html',
  'community.html'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAILED: ${message}`);
  }
}

console.log('🚀 Running Instructify Kenya Mobile & Responsive Audit Suite...\n');

// ── 1. Viewport Meta Tags ───────────────────────────────────────
console.log('📱 1. Responsive Viewport Meta Tags');
let allHaveViewport = true;
for (const page of HTML_PAGES) {
  const filePath = path.join(rootDir, page);
  const html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0">') &&
      !html.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0"')) {
    allHaveViewport = false;
    console.error(`     Missing viewport tag in: ${page}`);
  }
}
assert(allHaveViewport, 'All 26 HTML pages contain proper responsive viewport meta tag');

// ── 2. Navigation Header & Mobile Drawers ─────────────────────────
console.log('\n🍔 2. Navigation & Mobile Drawers');
let navAuditPassed = true;
for (const page of HTML_PAGES) {
  if (page === 'payment-success.html') continue; // standalone confirmation receipt card
  const filePath = path.join(rootDir, page);
  const html = fs.readFileSync(filePath, 'utf8');

  const hasNavbar = html.includes('id="navbar"') || html.includes('class="navbar"');
  if (hasNavbar) {
    const hasHamburger = html.includes('nav-hamburger');
    const hasMobileNav = html.includes('id="nav-mobile"');
    if (!hasHamburger || !hasMobileNav) {
      navAuditPassed = false;
      console.error(`     Navigation issue in ${page}: hamburger=${hasHamburger}, mobileNav=${hasMobileNav}`);
    }
  }
}
assert(navAuditPassed, 'All pages with navigation have functioning hamburger button and #nav-mobile drawer');

// ── 3. Dashboard Mobile Sidebar Controls ────────────────────────
console.log('\n📊 3. Dashboard Mobile Controls & Sidebars');
const dashboards = ['dashboard-learner.html', 'dashboard-trainer.html', 'dashboard-admin.html'];
let dashboardsValid = true;
for (const dash of dashboards) {
  const filePath = path.join(rootDir, dash);
  const html = fs.readFileSync(filePath, 'utf8');
  const hasOverlay = html.includes('id="sidebar-overlay"') || html.includes('class="sidebar-overlay"');
  const hasToggle = html.includes('id="sidebar-toggle"') || html.includes('class="sidebar-toggle-btn"');
  const hasMobileNav = html.includes('id="nav-mobile"');

  if (!hasOverlay || !hasToggle || !hasMobileNav) {
    dashboardsValid = false;
    console.error(`     ${dash} missing mobile controls: overlay=${hasOverlay}, toggle=${hasToggle}, mobileNav=${hasMobileNav}`);
  }
}
assert(dashboardsValid, 'Learner, Trainer, and Admin dashboards have mobile sidebar toggle, overlay, and nav drawer');

// ── 4. Table Responsiveness ─────────────────────────────────────
console.log('\n📋 4. Responsive Tables (Wrappers)');
let tablesValid = true;
for (const page of HTML_PAGES) {
  const filePath = path.join(rootDir, page);
  const html = fs.readFileSync(filePath, 'utf8');

  // Check if any raw <table> exists without table-wrapper or table-responsive
  const lines = html.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('<table') && !line.includes('table-wrapper') && !line.includes('table-responsive')) {
      const prev = lines.slice(Math.max(0, i - 2), i).join(' ');
      if (!prev.includes('table-wrapper') && !prev.includes('table-responsive')) {
        tablesValid = false;
        console.error(`     Unwrapped table in ${page} at line ${i + 1}`);
      }
    }
  }
}
assert(tablesValid, 'All wide data tables are enclosed in responsive scrollable wrappers');

// ── 5. Form Input Accessibility & Mobile Types ──────────────────
console.log('\n📝 5. Form Input Accessibility & Mobile Touch Formatting');
let formsValid = true;
for (const page of HTML_PAGES) {
  const filePath = path.join(rootDir, page);
  const html = fs.readFileSync(filePath, 'utf8');

  const inputs = html.match(/<input[^>]*>/gi) || [];
  for (const input of inputs) {
    if (input.includes('type="hidden"') || input.includes('type="radio"') || input.includes('type="checkbox"')) continue;
    const hasAria = input.includes('aria-label=') || input.includes('aria-labelledby=');
    const hasId = input.match(/id=["']([^"']+)["']/);
    let hasLabel = false;
    if (hasId) {
      const id = hasId[1];
      hasLabel = html.includes(`for="${id}"`) || html.includes(`for='${id}'`);
    }

    if (!hasAria && !hasLabel) {
      formsValid = false;
      console.error(`     Input in ${page} missing accessible label: ${input.slice(0, 70)}`);
    }
  }
}
assert(formsValid, 'All interactive form inputs have accessible labels or aria-labels');

// ── 6. M-Pesa & Checkout Optimizations ──────────────────────────
console.log('\n💳 6. M-Pesa Checkout & Transaction Flow');
const ckHtml = fs.readFileSync(path.join(rootDir, 'checkout.html'), 'utf8');
assert(ckHtml.includes('id="mpesa-phone-input"'), 'M-Pesa phone number input is present');
assert(ckHtml.includes('inputmode="numeric"'), 'M-Pesa input includes inputmode="numeric" for mobile keypad');
assert(ckHtml.includes('selectPayMethod(\'mpesa\')'), 'M-Pesa payment method toggle is interactive');
assert(ckHtml.includes('id="screen-processing"'), 'M-Pesa STK push processing screen is present');

// ── 7. Touch Target & Global CSS Rules ──────────────────────────
console.log('\n🎯 7. Touch Targets & Responsive CSS Rules');
const globalCss = fs.readFileSync(path.join(rootDir, 'css', 'global.css'), 'utf8');
const compCss = fs.readFileSync(path.join(rootDir, 'css', 'components.css'), 'utf8');

assert(globalCss.includes('overflow-wrap: break-word'), 'Universal word breaking prevents horizontal text blowout');
assert(globalCss.includes('min-height: 44px'), 'Minimum 44px touch targets enforced for mobile/touch');
assert(globalCss.includes('prefers-reduced-motion'), 'Reduced motion accessibility supported');
assert(globalCss.includes(':focus-visible'), 'High-contrast focus indicators defined');
assert(compCss.includes('.navbar .nav-actions { display: none; }'), 'Desktop nav actions hidden on mobile to prevent navbar crowding');
assert(compCss.includes('font-size: 16px !important'), '16px input font size configured to prevent iOS Safari auto-zooming');

// ── 8. Register / Auth Mobile Header ────────────────────────────
console.log('\n🔐 8. Authentication Portal Mobile Experience');
const regHtml = fs.readFileSync(path.join(rootDir, 'register.html'), 'utf8');
assert(regHtml.includes('auth-mobile-header'), 'Mobile brand header with Instructify Kenya logo present for mobile viewports');
assert(regHtml.includes('auth-back-link'), 'Back to Home navigation present on mobile auth screen');
assert(regHtml.includes('role-selector'), 'Role selector supports Learner, Trainer, and Institution roles');

// ── Final Summary ───────────────────────────────────────────────
console.log(`\n========================================`);
console.log(`Audit Summary: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests`);
console.log(`========================================`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL MOBILE RESPONSIVENESS & ACCESSIBILITY AUDITS PASSED 100%!');
  process.exit(0);
}
