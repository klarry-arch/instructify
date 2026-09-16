/* ============================================================
   Verification Audit: Individual Article Pages & Author Removal
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT_DIR, 'articles');

const EXPECTED_SLUGS = [
  'how-artificial-intelligence-is-transforming-education-in-africa',
  'rethinking-learning-for-the-digital-generation',
  'the-digital-skills-every-learner-needs-for-the-future-of-work',
  'making-competency-based-learning-practical-through-technology',
  'how-technology-can-transform-the-modern-classroom',
  'leading-schools-and-organisations-through-digital-transformation',
  'from-ideas-to-enterprise-nurturing-youth-innovation',
  'bridging-the-infrastructure-divide-offline-learning-solutions'
];

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failures++;
  } else {
    console.log(`  ✅ PASSED: ${message}`);
  }
}

console.log('🔍 Starting comprehensive verification audit...\n');

// 1. Audit each article page
EXPECTED_SLUGS.forEach(slug => {
  const filePath = path.join(ARTICLES_DIR, `${slug}.html`);
  console.log(`Auditing articles/${slug}.html...`);

  assert(fs.existsSync(filePath), `File exists`);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  // Single H1
  const h1Matches = content.match(/<h1[\s>]/gi) || [];
  assert(h1Matches.length === 1, `Contains exactly 1 <h1> heading (found ${h1Matches.length})`);

  // Multiple H2 headings
  const h2Matches = content.match(/<h2[\s>]/gi) || [];
  assert(h2Matches.length >= 3, `Contains structured <h2> headings (found ${h2Matches.length})`);

  // Concluding reflection
  assert(content.includes('Concluding Reflection'), `Contains a dedicated Concluding Reflection section`);

  // Breadcrumbs
  assert(content.includes('article-breadcrumbs') && content.includes('Knowledge Hub'), `Contains breadcrumb navigation`);

  // Return to blog link
  assert(content.includes('← Back to Knowledge Hub') && content.includes('Return to Knowledge Hub'), `Contains clear return-to-blog links`);

  // Related articles section with 3 cards
  assert(content.includes('related-articles-section'), `Contains related articles section`);
  const relatedCards = (content.match(/<article class="article-card"/g) || []).length;
  // 1 card is the main article or related cards
  assert(content.includes('You May Also Like'), `Contains 'You May Also Like' header`);

  // Social sharing
  assert(content.includes('shareArticle(\'whatsapp\')') && content.includes('shareArticle(\'linkedin\')') && content.includes('shareArticle(\'twitter\')') && content.includes('shareArticle(\'copy\')'), `Contains all social share options (WhatsApp, LinkedIn, X, Copy Link)`);

  // Semantic elements
  const semanticTags = ['<article', '<header', '<main', '<section', '<nav', '<p', '<ul', '<ol'];
  semanticTags.forEach(tag => {
    assert(content.includes(tag), `Uses semantic HTML element ${tag}>`);
  });

  // Zero author mentions
  const forbiddenAuthorPatterns = [
    'Written by',
    'written by',
    'WRITTEN BY',
    'author-avatar',
    'article-author-card',
    'art-author-card',
    'authorId',
    '"author":',
    '"author" :'
  ];

  forbiddenAuthorPatterns.forEach(pattern => {
    assert(!content.includes(pattern), `Contains NO "${pattern}"`);
  });

  // Schema structured data check
  assert(content.includes('"@type": "BlogPosting"'), `Includes BlogPosting Schema JSON-LD`);
  assert(content.includes('"@type": "BreadcrumbList"'), `Includes BreadcrumbList Schema JSON-LD`);

  console.log('');
});

// 2. Audit blog.html and js/blog.js for zero author info
console.log('Auditing blog.html and js/blog.js for zero author info...');
const blogHtml = fs.readFileSync(path.join(ROOT_DIR, 'blog.html'), 'utf8');
const blogJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'blog.js'), 'utf8');

assert(!blogHtml.includes('author-meta-row'), `blog.html contains NO author-meta-row`);
assert(!blogHtml.includes('Dr. Angela Mutua'), `blog.html contains NO author name`);
assert(!blogJs.includes('<div class="author-avatar"'), `js/blog.js contains NO author-avatar on cards`);
assert(!blogJs.includes('${author.name}'), `js/blog.js contains NO \${author.name} on cards`);

console.log('\n=============================================');
if (failures === 0) {
  console.log('🎉 ALL AUDITS PASSED WITH ZERO ERRORS!');
} else {
  console.error(`💥 AUDIT FINISHED WITH ${failures} FAILURE(S).`);
  process.exit(1);
}
