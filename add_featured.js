const fs = require('fs');
const path = require('path');

const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

const htmlPath = path.join('c:\\instructify', 'courses.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 1. ADD FEATURED SECTION TO HTML
const featuredHtml = `
<div style="margin-bottom: 4rem;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
    <h2 style="font-family: var(--font-heading); color: #111827; font-size: 2rem; font-weight: 800;">Featured Programmes</h2>
    <span style="background: #dbeafe; color: #1d4ed8; font-weight: 700; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">Highly Recommended</span>
  </div>
  <div id="featured-courses-grid" class="pro-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
    <!-- Rendered by JS -->
  </div>
</div>
`;

// Insert it right after the <div class="directory-layout"> or maybe above it.
// Wait, putting it inside the container but before the directory-layout makes it full width above the sidebar layout.
htmlContent = htmlContent.replace(
  /<div class="directory-layout">/,
  featuredHtml + '\n  <div class="directory-layout">'
);
fs.writeFileSync(htmlPath, htmlContent);

// 2. ADD FEATURED RENDER LOGIC TO JS
// The user wants: digital literacy, higher order thinking skills in technology, teaching with technology
const newLogic = `
function renderFeaturedCourses() {
  const featuredGrid = document.getElementById('featured-courses-grid');
  if (!featuredGrid) return;
  
  const keywords = ['digital literacy', 'higher order thinking', 'teaching with technology'];
  
  // Find courses that match these keywords
  const featuredCourses = [];
  
  keywords.forEach(kw => {
    const match = window.COURSES.find(c => c.title.toLowerCase().includes(kw) || c.intro.toLowerCase().includes(kw));
    if (match && !featuredCourses.includes(match)) {
      featuredCourses.push(match);
    }
  });
  
  if (featuredCourses.length > 0) {
    featuredGrid.innerHTML = featuredCourses.map(c => window.renderCourseCard(c)).join('');
  } else {
    // Fallback if exactly 0 matched, just take first 3
    featuredGrid.innerHTML = window.COURSES.slice(0, 3).map(c => window.renderCourseCard(c)).join('');
  }
}

// Ensure it runs on DOMContentLoaded alongside the main render
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderFeaturedCourses === 'function') renderFeaturedCourses();
  if (typeof renderCourses === 'function') renderCourses();
});
`;

// Replace the old DOMContentLoaded block
jsContent = jsContent.replace(
  /document\.addEventListener\('DOMContentLoaded'[\s\S]*?\}\);/,
  newLogic
);

fs.writeFileSync(jsPath, jsContent);
console.log('Successfully injected featured courses section and rendering logic.');
