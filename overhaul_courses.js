const fs = require('fs');
const path = require('path');

// --- 1. OVERHAUL COURSES.JS ---
const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

const newCoursesCode = `window.COURSES = [
  {
    id: 'crs_001', slug: 'digital-literacy-skills',
    title: 'Digital Literacy Skills',
    category: 'Beginner',
    intro: 'Learn essential computer, internet, productivity, and online safety skills for everyday teaching and learning.',
    audience: 'Teachers, learners, parents, and beginners',
    duration: '4 weeks',
    format: 'Online or In-person',
    price: 8500,
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_002', slug: 'ict-integration-teaching-learning',
    title: 'ICT Integration in Teaching and Learning',
    category: 'Teacher Training',
    intro: 'Discover how to use technology to plan lessons, create digital resources, assess learners, and improve classroom engagement.',
    audience: 'Teachers and school leaders',
    duration: '6 weeks',
    format: 'Blended or School-based',
    price: 15000,
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_003', slug: 'cpd-for-teachers',
    title: 'CPD for Teachers',
    category: 'Teacher Training',
    intro: 'Strengthen your professional teaching practice through practical digital skills, classroom innovation, assessment, and reflective learning.',
    audience: 'Teachers and educators',
    duration: '4 weeks',
    format: 'Online or In-person',
    price: 6500,
    ctaText: 'Learn More',
    image: 'assets/images/about.png'
  },
  {
    id: 'crs_004', slug: 'coding-and-ai-skills',
    title: 'Coding and AI Skills',
    category: 'Coding & AI',
    intro: 'Get started with coding, computational thinking, artificial intelligence, responsible AI use, and simple digital projects.',
    audience: 'Teachers, children, and beginners',
    duration: '6 weeks',
    format: 'Online or In-person',
    price: 22000,
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png'
  },
  {
    id: 'crs_005', slug: 'nurturing-creativity-children',
    title: 'Nurturing Creativity in Children',
    category: 'Creativity',
    intro: 'Learn how to use digital tools, games, storytelling, design, art, and creative projects to develop children’s imagination and problem-solving skills.',
    audience: 'Teachers, parents, and young learners',
    duration: '4 weeks',
    format: 'Online or School-based',
    price: 12000,
    ctaText: 'Learn More',
    image: 'assets/images/course-cbe.png'
  },
  {
    id: 'crs_006', slug: 'digital-storytelling-education',
    title: 'Digital Storytelling in Education',
    category: 'Creativity',
    intro: 'Use images, audio, video, animation, and presentations to create meaningful digital stories that support learning.',
    audience: 'Teachers and learners',
    duration: '3 weeks',
    format: 'Online or Blended',
    price: 14000,
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_007', slug: 'tech-higher-order-thinking',
    title: 'Using Technology to Promote Higher Order Thinking Skills',
    category: 'Teacher Training',
    intro: 'Design technology-supported activities that encourage critical thinking, creativity, collaboration, communication, analysis, and problem-solving.',
    audience: 'Teachers and school leaders',
    duration: '4 weeks',
    format: 'Online or In-person',
    price: 18500,
    ctaText: 'Learn More',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_008', slug: 'mentorship-coaching-teachers',
    title: 'Mentorship and Coaching for Teachers',
    category: 'Mentorship',
    intro: 'Receive practical guidance, coaching, classroom technology support, peer learning, and feedback to improve digital teaching confidence.',
    audience: 'Teachers and educators',
    duration: 'Flexible',
    format: 'Online, In-person, or School-based',
    price: 25000,
    ctaText: 'Book Mentorship',
    image: 'assets/images/about.png'
  },
  {
    id: 'crs_009', slug: 'teach-computers-young-children',
    title: 'How to Teach Computers to Young Children',
    category: 'Early Years',
    intro: 'Learn playful, safe, age-appropriate methods for introducing computers, mouse skills, keyboard use, digital safety, and unplugged computing to young children.',
    audience: 'Early years teachers, parents, and caregivers',
    duration: '4 weeks',
    format: 'Online or In-person',
    price: 9000,
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  }
];`;

jsContent = jsContent.replace(/window\.COURSES = \[[^]*?\];/, newCoursesCode);

const newRenderCourseCard = `window.renderCourseCard = function(course) {
  return \`
    <div class="course-card" style="background: white; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 16px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #e5e7eb; height: 100%;">
      
      <!-- Top Image/Icon Area -->
      <div style="position: relative; height: 180px; overflow: hidden; background: #f9fafb;">
        <img src="\${course.image}" alt="\${course.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.style.background='linear-gradient(135deg,#1d4ed8,#055c37)';this.style.display='none'">
        <div style="position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.9); padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; color: #1d4ed8; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-transform: uppercase;">
          \${course.category}
        </div>
      </div>

      <!-- Card Body -->
      <div style="padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column;">
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #111827; margin-bottom: 0.75rem; line-height: 1.3;">
          \${course.title}
        </h3>
        
        <p style="font-size: 0.9rem; color: #4b5563; line-height: 1.5; margin-bottom: 1.25rem; flex-grow: 1;">
          \${course.intro}
        </p>
        
        <!-- Metadata List -->
        <ul style="list-style: none; padding: 0; margin: 0 0 1.5rem 0; font-size: 0.85rem; color: #6b7280; display: flex; flex-direction: column; gap: 8px;">
          <li style="display: flex; gap: 8px; align-items: flex-start;">
            <span style="font-size: 1rem; line-height: 1.3;">🎯</span> 
            <span><strong style="color: #374151;">Audience:</strong> \${course.audience}</span>
          </li>
          <li style="display: flex; gap: 8px; align-items: flex-start;">
            <span style="font-size: 1rem; line-height: 1.3;">⏱️</span> 
            <span><strong style="color: #374151;">Duration:</strong> \${course.duration}</span>
          </li>
          <li style="display: flex; gap: 8px; align-items: flex-start;">
            <span style="font-size: 1rem; line-height: 1.3;">💻</span> 
            <span><strong style="color: #374151;">Format:</strong> \${course.format}</span>
          </li>
          <li style="display: flex; gap: 8px; align-items: flex-start;">
            <span style="font-size: 1rem; line-height: 1.3;">💰</span> 
            <span><strong style="color: #374151;">Price:</strong> KES \${course.price.toLocaleString()}</span>
          </li>
        </ul>
      </div>

      <!-- Card Footer -->
      <div style="padding: 1.25rem 1.5rem; border-top: 1px solid #f3f4f6; background: #f9fafb; text-align: center;">
        <a href="course-detail.html?id=\${course.id}" class="btn" style="background: #1d4ed8; color: white; width: 100%; border-radius: 8px; padding: 0.8rem; font-weight: 700; display: inline-block; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#0a6942'" onmouseout="this.style.background='#1d4ed8'">
          \${course.ctaText}
        </a>
      </div>

    </div>
  \`;
};`;

jsContent = jsContent.replace(/window\.renderCourseCard = function[^]*?};/, newRenderCourseCard);

// Remove the old carousel rendering code from courses.js and update filter logic
const newRenderCourses = `function renderCourses() {
  const grid = document.getElementById('courses-grid');
  
  // Custom filter logic for the new tabs
  let results = window.COURSES;
  const currentTab = window.currentFilterTab || 'all';
  
  if (currentTab !== 'all') {
    results = results.filter(course => {
      const c = course.category.toLowerCase();
      const a = course.audience.toLowerCase();
      const t = course.title.toLowerCase();
      
      switch(currentTab) {
        case 'teachers': return a.includes('teacher') || a.includes('educator');
        case 'children': return a.includes('child') || a.includes('learner') || a.includes('young');
        case 'parents': return a.includes('parent') || a.includes('caregiver');
        case 'schools': return a.includes('school');
        case 'coding-ai': return c.includes('coding') || c.includes('ai');
        case 'digital-literacy': return t.includes('digital literacy') || c.includes('beginner');
        default: return true;
      }
    });
  }
  
  // Also apply text search
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(c => c.title.toLowerCase().includes(q) || c.intro.toLowerCase().includes(q));
  }

  if (results.length === 0) {
    grid.innerHTML = '<div class="no-results" style="grid-column: 1/-1; text-align:center; padding: 4rem;"><div style="font-size:3rem;margin-bottom:1rem">🔍</div><h3 style="color:#111827;margin-bottom:0.5rem">No courses found</h3><p style="color:#6b7280;">Try adjusting your filters or search term.</p></div>';
  } else {
    grid.innerHTML = results.map(c => window.renderCourseCard(c)).join('');
  }
}`;

jsContent = jsContent.replace(/function renderCourses\(\) \{[^]*?\}/, newRenderCourses);

fs.writeFileSync(jsPath, jsContent);
console.log('Updated courses.js');


// --- 2. OVERHAUL COURSES.HTML ---
const htmlPath = path.join('c:\\instructify', 'courses.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const newMainContent = `<!-- Hero Section -->
<section style="background: #e6f6ec; padding: calc(var(--nav-height) + 4rem) 0 4rem; text-align: center; border-bottom: 1px solid #d1eada;">
  <div class="container" style="max-width: 800px;">
    <h1 style="font-family: var(--font-heading); font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 800; color: #1d4ed8; margin-bottom: 1.5rem; line-height: 1.15;">
      Closing the Digital Skills Gap
    </h1>
    <p style="font-size: 1.15rem; line-height: 1.6; color: #374151; margin-bottom: 2.5rem;">
      At Instructify, we offer practical, future-ready courses designed to help teachers, schools, parents, and young learners build confidence in digital literacy, ICT integration, coding, AI, creativity, and technology-supported learning. Explore our courses and choose the right programme for your learning goals.
    </p>
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <a href="#catalog" class="btn" style="background: #1d4ed8; color: white; padding: 0.9rem 2rem; border-radius: 8px; font-weight: 700; font-size: 1.05rem; text-decoration: none; box-shadow: 0 4px 6px rgb(29, 78, 216, 0.2);">Explore Courses</a>
      <a href="contact.html" class="btn" style="background: white; color: #1d4ed8; border: 2px solid #1d4ed8; padding: 0.9rem 2rem; border-radius: 8px; font-weight: 700; font-size: 1.05rem; text-decoration: none;">Book School Training</a>
    </div>
  </div>
</section>

<!-- Course Listing Section -->
<div id="catalog" class="container" style="padding: 4rem 0;">
  
  <!-- Filter Tabs -->
  <div style="margin-bottom: 3rem; display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
    <button class="course-tab active" data-tab="all" style="background: #1d4ed8; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 99px; font-weight: 600; cursor: pointer; transition: 0.2s;">All Courses</button>
    <button class="course-tab" data-tab="teachers" style="background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; padding: 0.6rem 1.25rem; border-radius: 99px; font-weight: 600; cursor: pointer; transition: 0.2s;">For Teachers</button>
    <button class="course-tab" data-tab="children" style="background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; padding: 0.6rem 1.25rem; border-radius: 99px; font-weight: 600; cursor: pointer; transition: 0.2s;">For Children</button>
    <button class="course-tab" data-tab="parents" style="background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; padding: 0.6rem 1.25rem; border-radius: 99px; font-weight: 600; cursor: pointer; transition: 0.2s;">For Parents</button>
    <button class="course-tab" data-tab="schools" style="background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; padding: 0.6rem 1.25rem; border-radius: 99px; font-weight: 600; cursor: pointer; transition: 0.2s;">For Schools</button>
    <button class="course-tab" data-tab="coding-ai" style="background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; padding: 0.6rem 1.25rem; border-radius: 99px; font-weight: 600; cursor: pointer; transition: 0.2s;">Coding & AI</button>
    <button class="course-tab" data-tab="digital-literacy" style="background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; padding: 0.6rem 1.25rem; border-radius: 99px; font-weight: 600; cursor: pointer; transition: 0.2s;">Digital Literacy</button>
  </div>

  <!-- Search Bar for Utility -->
  <div style="max-width: 600px; margin: 0 auto 3rem; display: flex; position: relative;">
    <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.2rem;">🔍</span>
    <input type="text" id="course-search" placeholder="Search courses by title or description..." style="width: 100%; padding: 1rem 1rem 1rem 3rem; border-radius: 12px; border: 1px solid #d1d5db; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); outline: none;">
  </div>

  <!-- Responsive Grid -->
  <style>
    .responsive-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
    @media (max-width: 1024px) { .responsive-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .responsive-grid { grid-template-columns: 1fr; } }
    .course-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important; }
  </style>
  
  <div id="courses-grid" class="responsive-grid">
    <!-- Rendered by JS -->
  </div>

</div>

<!-- Page Ending Section -->
<section style="background: #f9fafb; padding: 5rem 0; text-align: center; border-top: 1px solid #e5e7eb;">
  <div class="container" style="max-width: 700px;">
    <h2 style="font-family: var(--font-heading); color: #111827; font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem;">
      Need a customized training package for your school?
    </h2>
    <p style="color: #4b5563; font-size: 1.15rem; margin-bottom: 2.5rem; line-height: 1.6;">
      Instructify can design practical digital skills training for your teachers, learners, or school community.
    </p>
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <a href="contact.html" class="btn" style="background: #1d4ed8; color: white; padding: 0.9rem 2.5rem; border-radius: 8px; font-weight: 700; font-size: 1.05rem; text-decoration: none; box-shadow: 0 4px 6px rgb(29, 78, 216, 0.2);">Book School Training</a>
      <a href="contact.html" class="btn" style="background: transparent; color: #111827; border: 1px solid #d1d5db; padding: 0.9rem 2.5rem; border-radius: 8px; font-weight: 700; font-size: 1.05rem; text-decoration: none; background: white;">Contact Us</a>
    </div>
  </div>
</section>`;

// Replace from <section class="concept-hero"> or <section class="courses-hero"> to the footer
// The most reliable way is to find the opening <section class="courses-hero" or <section class="concept-hero"
// and the footer, then replace everything in between.
let regex = /<section[^>]*class="concept-hero"[^]*?<\/section>[\s\S]*?(?=<footer)/;
if (!regex.test(htmlContent)) {
   regex = /<section[^>]*class="courses-hero"[^]*?<\/section>[\s\S]*?(?=<footer)/;
}
htmlContent = htmlContent.replace(regex, newMainContent + '\n\n');

// Update script tag at the bottom of courses.html to handle tabs
const tabLogic = `
window.currentFilterTab = 'all';
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('course-tab')) {
    document.querySelectorAll('.course-tab').forEach(b => {
      b.style.background = '#f3f4f6';
      b.style.color = '#4b5563';
      b.style.border = '1px solid #e5e7eb';
      b.classList.remove('active');
    });
    e.target.classList.add('active');
    e.target.style.background = '#1d4ed8';
    e.target.style.color = 'white';
    e.target.style.border = 'none';
    
    window.currentFilterTab = e.target.getAttribute('data-tab');
    if (typeof renderCourses === 'function') renderCourses();
  }
});
</script>
</body>`;

htmlContent = htmlContent.replace(/<\/script>\s*<\/body>/, tabLogic);

fs.writeFileSync(htmlPath, htmlContent);
console.log('Updated courses.html');
