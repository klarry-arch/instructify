const fs = require('fs');
const path = require('path');

// 1. Update courses.js
const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

const newRenderCourseCard = `window.renderCourseCard = function(course, isCarousel = false) {
  const isFree = course.price === 0 || course.price === 8500 || course.price === 6500 || course.price === 9000; // Just simulating some free courses based on the image
  const displayPrice = isFree ? 'Free' : \`KES \${course.price.toLocaleString()}\`;
  
  return \`
    <div class="course-card" style="background: white; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; width: \${isCarousel ? '320px' : '100%'}; min-width: \${isCarousel ? '320px' : 'auto'}; scroll-snap-align: start; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: transform 0.2s;">
      
      <!-- Partner Logos Area -->
      <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0;">
         <div style="font-weight: 800; color: #333; font-size: 0.9rem; font-style: italic;">Instructify <span style="color: #1d4ed8;">Pro</span></div>
         <div style="font-weight: 700; color: #666; font-size: 0.75rem; letter-spacing: 1px;">KENYA</div>
      </div>
      
      <!-- Image Area -->
      <div style="position: relative; height: 160px; overflow: hidden; background: #111;">
        <img src="\${course.image}" alt="\${course.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;" onerror="this.parentElement.style.background='linear-gradient(135deg,#1d4ed8,#111)';this.style.display='none'">
      </div>

      <!-- Card Body -->
      <div style="padding: 16px; flex-grow: 1; display: flex; flex-direction: column;">
        <div style="margin-bottom: 12px;">
          <span style="background: #e6f6ec; color: #1d4ed8; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
            \${course.category}
          </span>
        </div>
        
        <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: #222; margin-bottom: 12px; line-height: 1.4;">
          \${course.title}
        </h3>
        
        <p style="font-size: 0.85rem; color: #666; font-weight: 600; margin-bottom: auto;">
          Self-Paced · \${course.level}
        </p>
      </div>

      <!-- Card Footer -->
      <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f5f5f5;">
        <span style="background: #e6f6ec; color: #1d4ed8; padding: 6px 16px; border-radius: 99px; font-size: 0.85rem; font-weight: 700;">
          \${displayPrice}
        </span>
        <a href="course-detail.html?id=\${course.id}" style="background: #e7303c; color: white; padding: 8px 24px; border-radius: 99px; font-weight: 700; font-size: 0.9rem; text-decoration: none; display: inline-block; transition: background 0.2s;" onmouseover="this.style.background='#c8202b'" onmouseout="this.style.background='#e7303c'">
          Enrol now
        </a>
      </div>

    </div>
  \`;
};`;

jsContent = jsContent.replace(/window\.renderCourseCard = function[^]*?};/, newRenderCourseCard);

// Also we need to render the featured carousel courses inside renderCourses() if the carousel exists
// Let's add a small block after document.getElementById('courses-grid').innerHTML = ...
const featuredCarouselLogic = `
  if (results.length === 0) {
    grid.innerHTML = '<div class="no-results"><div style="font-size:3rem;margin-bottom:1rem">🔍</div><h3 style="color:var(--text-primary);margin-bottom:0.5rem">No courses found</h3><p>Try adjusting your filters or search term.</p></div>';
  } else {
    grid.innerHTML = results.map(c => window.renderCourseCard(c, false)).join('');
    initScrollReveal();
  }
  
  // Update Carousel
  const carousel = document.getElementById('featured-courses-carousel');
  if (carousel && window.COURSES) {
    const featured = window.COURSES.slice(0, 5); // Just grab first 5
    carousel.innerHTML = featured.map(c => window.renderCourseCard(c, true)).join('');
  }
`;

jsContent = jsContent.replace(/if \(results\.length === 0\) \{[^]*?initScrollReveal\(\);\s*\}/, featuredCarouselLogic);

fs.writeFileSync(jsPath, jsContent);
console.log('Updated courses.js');


// 2. Update courses.html
const htmlPath = path.join('c:\\instructify', 'courses.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const newHero = `
<style>
  #featured-courses-carousel::-webkit-scrollbar { display: none; }
</style>
<section class="concept-hero" style="background-color: #0b7c4f; padding: calc(var(--nav-height) + 3rem) 0 4rem; overflow: hidden; position: relative;">
  <div class="container" style="max-width: 1400px; padding: 0 2rem;">
    <div style="display: grid; grid-template-columns: 350px 1fr; gap: 4rem; align-items: center;">
      
      <!-- Left Column -->
      <div style="color: white; padding-right: 1rem;">
        <h1 style="font-family: var(--font-heading); font-size: 2.75rem; font-weight: 800; line-height: 1.2; margin-bottom: 1.5rem; color: white;">
          Bridging the Digital Skills Divide
        </h1>
        <p style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 2rem; color: rgba(255,255,255,0.95);">
          No prior experience needed. Every session and programme is free to join, for citizens and the public sector alike.
        </p>
        <button style="background: white; color: #0b7c4f; padding: 0.8rem 1.8rem; border-radius: 8px; font-weight: 700; border: none; font-size: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          Explore all programmes
        </button>
      </div>

      <!-- Right Column (Carousel) -->
      <div style="position: relative; min-width: 0;">
        <!-- Carousel Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3 style="color: white; font-size: 1rem; font-weight: 700; margin: 0;">Featured programmes</h3>
          <div style="display: flex; gap: 8px;">
            <button onclick="document.getElementById('featured-courses-carousel').scrollBy({left: -330, behavior: 'smooth'})" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); background: transparent; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">&lt;</button>
            <button onclick="document.getElementById('featured-courses-carousel').scrollBy({left: 330, behavior: 'smooth'})" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); background: transparent; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">&gt;</button>
          </div>
        </div>

        <!-- Horizontal Scroll Container -->
        <div id="featured-courses-carousel" style="display: flex; gap: 1.25rem; overflow-x: auto; padding-bottom: 1rem; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none;">
          <!-- JS will populate featured cards here -->
        </div>
      </div>

    </div>
  </div>
</section>`;

htmlContent = htmlContent.replace(/<section class="courses-hero"[^]*?<\/section>/, newHero);

fs.writeFileSync(htmlPath, htmlContent);
console.log('Updated courses.html');
