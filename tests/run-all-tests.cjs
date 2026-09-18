const { spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const testSuites = [
  'tests/responsive-audit.test.js',
  'tests/ui-ux-consistency-audit.test.js',
  'tests/payment.test.js',
  'tests/verify-article-pages.cjs',
  'tests/verify-workshop-email.cjs',
  'tests/image-audit.test.cjs'
];

console.log('══════════════════════════════════════════════════════════════');
console.log('   INSTRUCTIFY KENYA — AUTOMATED TEST SUITE RUNNER');
console.log('══════════════════════════════════════════════════════════════\n');

let allPassed = true;
const results = [];

for (const suite of testSuites) {
  console.log(`▶ Running ${suite}...`);
  const fullPath = path.join(rootDir, suite);
  const start = Date.now();
  const res = spawnSync(process.execPath, [fullPath], {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: 'inherit'
  });
  const duration = ((Date.now() - start) / 1000).toFixed(2);

  if (res.status === 0) {
    console.log(`✔ ${suite} PASSED (${duration}s)\n`);
    results.push({ suite, passed: true, duration });
  } else {
    console.error(`✖ ${suite} FAILED with exit code ${res.status} (${duration}s)\n`);
    results.push({ suite, passed: false, duration });
    allPassed = false;
  }
}

console.log('══════════════════════════════════════════════════════════════');
console.log('   TEST SUMMARY');
console.log('══════════════════════════════════════════════════════════════');
results.forEach(r => {
  console.log(` ${r.passed ? '✅' : '❌'} ${r.suite} (${r.duration}s)`);
});

if (allPassed) {
  console.log('\n🎉 ALL SUITES PASSED (100%)\n');
  process.exit(0);
} else {
  console.error('\n💥 SOME TEST SUITES FAILED!\n');
  process.exit(1);
}
