const fs = require('fs');
const path = require('path');

// 1. UPDATE COURSES.HTML
const htmlPath = path.join('c:\\instructify', 'courses.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const proLayout = `
<style>
  .directory-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2.5rem;
    align-items: start;
  }
  .pro-sidebar {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    position: sticky;
    top: calc(var(--nav-height) + 1rem);
    max-height: calc(100vh - var(--nav-height) - 2rem);
    overflow-y: auto;
  }
  .pro-sidebar h4 { font-family: var(--font-heading); margin-bottom: 1rem; color: #111827; font-size: 1.1rem; }
  .filter-group { margin-bottom: 2rem; }
  .filter-label {
    display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: #4b5563; font-size: 0.95rem; cursor: pointer;
  }
  .filter-checkbox { accent-color: #FF4D00; width: 16px; height: 16px; cursor: pointer; }
  
  .pro-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    align-items: start; /* critical for staggered look */
  }

  .pro-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  
  /* The hidden content section */
  .pro-card-expanded-content {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  
  .pro-card:hover {
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    border-color: #FF4D00;
    transform: translateY(-4px);
    z-index: 10;
  }

  .pro-card:hover .pro-card-expanded-content {
    max-height: 500px;
    opacity: 1;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f3f4f6;
  }

  @media (max-width: 900px) {
    .directory-layout { grid-template-columns: 1fr; }
    .pro-sidebar { position: static; max-height: none; }
  }
</style>

<div id="catalog" class="container" style="padding: 4rem 0;">
  
  <div class="directory-layout">
    
    <!-- Left Sidebar -->
    <aside class="pro-sidebar">
      
      <div class="filter-group">
        <div style="position: relative; margin-bottom: 1.5rem;">
          <input type="text" id="course-search" placeholder="Search courses..." style="width: 100%; padding: 0.8rem 1rem 0.8rem 2.5rem; border-radius: 8px; border: 1px solid #d1d5db; outline: none; font-size: 0.95rem;">
          <span style="position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: #9ca3af;">🔍</span>
        </div>
      </div>

      <div class="filter-group">
        <h4>Category</h4>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="category" value="for teachers"> For Teachers</label>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="category" value="for children"> For Children</label>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="category" value="for parents"> For Parents</label>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="category" value="for schools"> For Schools</label>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="category" value="coding & ai"> Coding & AI</label>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="category" value="digital literacy"> Digital Literacy</label>
      </div>

      <div class="filter-group">
        <h4>Format</h4>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="format" value="online"> Online</label>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="format" value="in-person"> In-person</label>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="format" value="school-based"> School-based</label>
        <label class="filter-label"><input type="checkbox" class="filter-checkbox" data-type="format" value="blended"> Blended</label>
      </div>

    </aside>

    <!-- Right Grid -->
    <main>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2 style="font-family: var(--font-heading); color: #111827; font-size: 1.75rem;">Course Directory</h2>
        <span id="results-count" style="color: #6b7280; font-weight: 600; font-size: 0.95rem;">Loading...</span>
      </div>
      
      <div id="courses-grid" class="pro-grid">
        <!-- Rendered by JS -->
      </div>
    </main>

  </div>

</div>`;

// Replace everything between <div id="catalog" and <!-- Page Ending Section -->
htmlContent = htmlContent.replace(/<div id="catalog"[^]*?<!-- Page Ending Section -->/, proLayout + '\n\n<!-- Page Ending Section -->');

// Also, we need to remove the old tabLogic script at the bottom of courses.html and replace it with the new sidebar listener.
const newSidebarLogic = `
function updateFilters() {
  if (typeof renderCourses === 'function') renderCourses();
}
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('filter-checkbox')) updateFilters();
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'course-search') updateFilters();
});
</script>
</body>`;

htmlContent = htmlContent.replace(/window\.currentFilterTab[^]*?<\/body>/, newSidebarLogic);

fs.writeFileSync(htmlPath, htmlContent);


// 2. UPDATE COURSES.JS
const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

const newRenderCourseCard = `window.renderCourseCard = function(course) {
  return \`
    <div class="pro-card">
      <div style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <span style="background: #fff3ed; color: #FF4D00; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">\${course.category}</span>
          <span style="font-size: 1.2rem;">\${course.format.toLowerCase().includes('online') ? '🌐' : '🏫'}</span>
        </div>
        
        <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: #111827; line-height: 1.3; margin-bottom: 0.5rem;">
          \${course.title}
        </h3>
        <p style="color: #6b7280; font-size: 0.9rem; font-weight: 600;">\${course.price}</p>
        
        <!-- Hover Expanded Area -->
        <div class="pro-card-expanded-content">
          <p style="font-size: 0.9rem; color: #4b5563; line-height: 1.5; margin-bottom: 1rem;">
            \${course.intro}
          </p>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: #6b7280; margin-bottom: 1.25rem;">
            <div><strong style="color: #374151;">👥 Audience:</strong> \${course.audience}</div>
            <div><strong style="color: #374151;">⏱️ Duration:</strong> \${course.duration}</div>
            <div><strong style="color: #374151;">💻 Format:</strong> \${course.format}</div>
          </div>
          <a href="course-detail.html?id=\${course.id}" class="btn" style="background: #FF4D00; color: white; width: 100%; border-radius: 8px; padding: 0.75rem; font-weight: 700; display: inline-block; text-align: center; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#c2410a'" onmouseout="this.style.background='#FF4D00'">
            \${course.ctaText}
          </a>
        </div>
      </div>
    </div>
  \`;
};`;

jsContent = jsContent.replace(/window\.renderCourseCard = function[^]*?};/, newRenderCourseCard);

const newRenderCourses = `function renderCourses() {
  const grid = document.getElementById('courses-grid');
  const countEl = document.getElementById('results-count');
  
  let results = window.COURSES;
  
  // Get active filters
  const categoryBoxes = Array.from(document.querySelectorAll('.filter-checkbox[data-type="category"]:checked')).map(cb => cb.value);
  const formatBoxes = Array.from(document.querySelectorAll('.filter-checkbox[data-type="format"]:checked')).map(cb => cb.value);
  const searchInput = document.getElementById('course-search');
  const query = searchInput ? searchInput.value.toLowerCase() : '';

  if (categoryBoxes.length > 0) {
    results = results.filter(course => categoryBoxes.includes(course.category.toLowerCase()));
  }
  
  if (formatBoxes.length > 0) {
    results = results.filter(course => {
      const f = course.format.toLowerCase();
      return formatBoxes.some(val => f.includes(val));
    });
  }

  if (query) {
    results = results.filter(c => c.title.toLowerCase().includes(query) || c.intro.toLowerCase().includes(query));
  }

  if (countEl) countEl.textContent = \`\${results.length} courses found\`;

  if (results.length === 0) {
    grid.innerHTML = '<div class="no-results" style="grid-column: 1/-1; text-align:center; padding: 4rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db;"><div style="font-size:3rem;margin-bottom:1rem">🔍</div><h3 style="color:#111827;margin-bottom:0.5rem">No courses match your filters</h3><p style="color:#6b7280;">Try broadening your search criteria.</p></div>';
  } else {
    grid.innerHTML = results.map(c => window.renderCourseCard(c)).join('');
  }
}`;

jsContent = jsContent.replace(/function renderCourses\(\) \{[^]*?\}/, newRenderCourses);

fs.writeFileSync(jsPath, jsContent);
console.log('Successfully applied Pro Directory layout.');
