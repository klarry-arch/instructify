const fs = require('fs');
const path = require('path');

const cssPath = path.join('c:\\instructify', 'css', 'global.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('--glass-bg')) {
  cssContent = cssContent.replace(':root {', `:root {
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
  --glass-blur: blur(16px);
  --glass-card-hover: 0 16px 40px 0 rgba(31, 38, 135, 0.1);
`);
  fs.writeFileSync(cssPath, cssContent);
  console.log('Updated global.css');
}

const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

const newRenderCourseCard = `window.renderCourseCard = function(course) {
  const enrolled = window.isEnrolled ? window.isEnrolled(course.id) : false;
  return \`
    <div class="course-card reveal" style="background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); border-radius: var(--border-radius-xl); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;">
      <div class="course-card-image" style="position: relative; height: 200px; overflow: hidden;">
        <img src="\${course.image}" alt="\${course.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease;" onerror="this.parentElement.style.background='linear-gradient(135deg,#DC2E0A,#00B4D8)';this.style.display='none'">
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%); opacity: 0.8;"></div>
        <span class="course-card-badge \${course.badge}" style="position: absolute; top: 16px; left: 16px; padding: 6px 14px; border-radius: 99px; font-weight: 700; font-size: 0.75rem; box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 2; text-transform: uppercase; letter-spacing: 0.05em;">\${course.badgeText}</span>
        <button class="course-card-wishlist" onclick="toggleWishlist(this)" title="Add to wishlist" style="position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.25); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.5); color: white; display: flex; align-items: center; justify-content: center; z-index: 2; transition: all 0.2s; cursor: pointer;">🤍</button>
      </div>
      <div class="course-card-body" style="padding: 1.75rem; flex-grow: 1; display: flex; flex-direction: column;">
        <span class="course-card-category" style="font-size: 0.75rem; font-weight: 800; color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; display: block;">\${course.category}</span>
        <h3 class="course-card-title" style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1rem; line-height: 1.4; transition: color 0.2s;">\${course.title}</h3>
        <div class="course-card-instructor" style="display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem;">
          <div class="instructor-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-blue); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; box-shadow: 0 2px 8px rgba(29, 78, 216, 0.3);">\${course.instructorAvatar}</div>
          <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 500;">\${course.instructor}</span>
        </div>
        <div class="course-card-stats" style="display: flex; align-items: center; gap: 14px; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; flex-wrap: wrap;">
          <span class="rating" style="color: var(--color-gold); font-weight: 800;">⭐ \${course.rating} <span style="color: var(--text-muted); font-weight: 500;">(\${course.reviewCount.toLocaleString()})</span></span>
          <span style="font-weight: 500; display:flex; align-items:center; gap:4px;">⏱️ \${course.duration}</span>
          <span style="font-weight: 500; display:flex; align-items:center; gap:4px;">📈 \${course.level}</span>
        </div>
        \${course.cpd ? \`<div style="margin-top: auto; padding-top: 0.5rem;"><span class="badge badge-success" style="background: rgba(220, 46, 10, 0.1); color: #DC2E0A; border: 1px solid rgba(220,46,10,0.2); padding: 6px 12px; font-size: 0.75rem;">✅ CPD Accredited · \${course.cpdHours} hrs</span></div>\` : '<div style="margin-top: auto;"></div>'}
      </div>
      <div class="course-card-footer" style="padding: 1.5rem 1.75rem; border-top: 1px solid rgba(229, 231, 235, 0.6); display: flex; align-items: center; justify-content: space-between; background: rgba(248, 250, 252, 0.4);">
        <div class="course-price" style="display: flex; flex-direction: column;">
          <span class="price-current" style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 900; color: var(--text-primary); line-height: 1;">KES \${course.price.toLocaleString()}</span>
          <span class="price-original" style="font-size: 0.8rem; color: var(--text-muted); text-decoration: line-through; margin-top: 4px; font-weight: 500;">KES \${course.originalPrice.toLocaleString()}</span>
        </div>
        <a href="course-detail.html?id=\${course.id}" class="btn btn-primary btn-sm" style="padding: 0.75rem 1.5rem; border-radius: 99px; box-shadow: 0 4px 14px rgba(29, 78, 216, 0.3); font-size: 0.85rem; font-weight: 700;">
          \${enrolled ? '📚 Continue' : 'View Course'}
        </a>
      </div>
    </div>
  \`;
};`;

jsContent = jsContent.replace(/window\.renderCourseCard = function[^]*?};/, newRenderCourseCard);
fs.writeFileSync(jsPath, jsContent);
console.log('Updated courses.js');

const htmlPath = path.join('c:\\instructify', 'courses.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const newHero = `<section class="courses-hero" style="background: var(--gradient-hero); position: relative; overflow: hidden; padding: calc(var(--nav-height) + 5rem) 0 5rem;">
  <div style="position: absolute; width: 400px; height: 400px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; filter: blur(80px); top: -100px; left: -100px; z-index: 0;"></div>
  <div style="position: absolute; width: 300px; height: 300px; background: rgba(245, 158, 11, 0.3); border-radius: 50%; filter: blur(60px); bottom: -50px; right: -50px; z-index: 0;"></div>
  
  <div class="container" style="position: relative; z-index: 1;">
    <div class="breadcrumb mb-md" style="color: rgba(255,255,255,0.7);">
      <a href="index.html" style="color: rgba(255,255,255,0.7);">Home</a><span class="breadcrumb-sep">›</span><span style="color: white;">Course Catalog</span>
    </div>
    <h1 class="section-title animate-fade-in-up" style="text-align:left; font-size: clamp(2.5rem, 5vw, 3.5rem); color: white; margin-bottom: 1rem; line-height: 1.1;">
      Explore Our <span style="color: var(--color-gold);">Premium Courses</span>
    </h1>
    <p class="section-subtitle animate-fade-in-up delay-100" style="text-align:left; margin:0; color: rgba(255,255,255,0.9); font-size: 1.15rem; max-width: 700px;">
      Unlock your potential with our CPD accredited programs, digital literacy training, AI in education, and more. Expert-led and designed for the future.
    </p>
    
    <div class="search-bar animate-fade-in-up delay-200" style="max-width: 650px; margin-top: 2.5rem; display: flex; background: rgba(255,255,255,0.15); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3); border-radius: 99px; padding: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
      <span class="search-icon" style="padding: 0 1rem; font-size: 1.25rem; display: flex; align-items: center; color: white;">🔍</span>
      <input type="text" id="course-search" placeholder="Search for skills, topics, or instructors..." style="flex-grow: 1; background: transparent; border: none; color: white; outline: none; font-size: 1rem; box-shadow: none; padding: 0;">
      <button class="btn btn-primary" style="border-radius: 99px; padding: 0.8rem 2rem; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4);">Search</button>
    </div>
    
    <!-- Quick filters -->
    <div style="display:flex; gap: 0.75rem; margin-top: 2rem; flex-wrap: wrap; align-items: center;">
      <span style="color: rgba(255,255,255,0.8); font-size: 0.85rem; font-weight: 600; margin-right: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Popular:</span>
      <button class="filter-chip active" data-quick="all" onclick="quickFilter(this,'all')" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white;">All Courses</button>
      <button class="filter-chip" data-quick="cpd" onclick="quickFilter(this,'cpd')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white;">✅ CPD</button>
      <button class="filter-chip" data-quick="ict" onclick="quickFilter(this,'ICT')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white;">💻 ICT</button>
      <button class="filter-chip" data-quick="ai" onclick="quickFilter(this,'AI & Tech')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white;">🤖 AI</button>
      <button class="filter-chip" data-quick="digital" onclick="quickFilter(this,'Digital Skills')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white;">📱 Digital Skills</button>
    </div>
  </div>
</section>`;

htmlContent = htmlContent.replace(/<section class="courses-hero">[^]*?<\/section>/, newHero);

// Sidebar glassmorphism update
const newSidebar = `<aside class="filter-sidebar" style="background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: var(--border-radius-2xl); padding: 1.5rem; box-shadow: var(--glass-shadow); position: sticky; top: calc(var(--nav-height) + 2rem);">`;
htmlContent = htmlContent.replace(/<aside class="filter-sidebar">/, newSidebar);

fs.writeFileSync(htmlPath, htmlContent);
console.log('Updated courses.html');
