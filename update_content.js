const fs = require('fs');
const path = require('path');

// --- 1. Update courses.js ---
const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

const newCoursesCode = `window.COURSES = [
  {
    id: 'crs_001', slug: 'digital-literacy-skills',
    title: 'Digital Literacy Skills',
    category: 'Beginner Friendly', tag: 'badge-cpd',
    description: 'Build confidence in using computers, digital devices, internet tools, productivity software, online safety, and basic digital communication.',
    audience: 'Teachers, learners, parents, and schools',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png',
    featured: true, price: 8500, originalPrice: 14000
  },
  {
    id: 'crs_002', slug: 'ict-integration-teaching-learning',
    title: 'ICT Integration in Teaching and Learning',
    category: 'Teacher Training', tag: 'badge-ict',
    description: 'Learn how to use technology to plan lessons, deliver engaging instruction, create digital resources, assess learners, and improve classroom participation.',
    audience: 'Teachers and school leaders',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ict.png',
    featured: true, price: 15000, originalPrice: 22000
  },
  {
    id: 'crs_003', slug: 'cpd-for-teachers',
    title: 'CPD for Teachers',
    category: 'Professional Development', tag: 'badge-cpd',
    description: 'Upgrade teaching practice through continuous professional development focused on digital skills, classroom innovation, assessment strategies, and reflective teaching.',
    audience: 'Teachers and educators',
    ctaText: 'Learn More',
    image: 'assets/images/about.png',
    featured: true, price: 6500, originalPrice: 10000
  },
  {
    id: 'crs_004', slug: 'coding-and-ai-skills',
    title: 'Coding and AI Skills',
    category: 'Coding & AI', tag: 'badge-ai',
    description: 'Introduce coding, computational thinking, artificial intelligence, responsible AI use, and simple digital projects for classrooms and young learners.',
    audience: 'Teachers, children, and beginners',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png',
    featured: true, price: 22000, originalPrice: 35000
  },
  {
    id: 'crs_005', slug: 'nurturing-creativity-children',
    title: 'Nurturing Creativity in Children',
    category: 'Creativity', tag: 'badge-cbe',
    description: 'Discover how to use digital tools, storytelling, design, art, games, and creative projects to develop imagination, innovation, and problem-solving skills in children.',
    audience: 'Teachers, parents, and young learners',
    ctaText: 'Learn More',
    image: 'assets/images/course-cbe.png',
    featured: true, price: 12000, originalPrice: 18000
  },
  {
    id: 'crs_006', slug: 'digital-storytelling-education',
    title: 'Digital Storytelling in Education',
    category: 'Digital Creativity', tag: 'badge-cpd',
    description: 'Learn how to use images, audio, video, presentations, animation, and digital tools to create meaningful educational stories that support learning.',
    audience: 'Teachers and learners',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png',
    featured: true, price: 14000, originalPrice: 20000
  },
  {
    id: 'crs_007', slug: 'tech-higher-order-thinking',
    title: 'Using Technology to Promote Higher Order Thinking Skills',
    category: 'Advanced Teaching Skills', tag: 'badge-ict',
    description: 'Design technology-supported learning activities that promote critical thinking, creativity, collaboration, communication, analysis, evaluation, and problem-solving.',
    audience: 'Teachers and school leaders',
    ctaText: 'Learn More',
    image: 'assets/images/course-ict.png',
    featured: true, price: 18500, originalPrice: 28000
  },
  {
    id: 'crs_008', slug: 'mentorship-coaching-teachers',
    title: 'Mentorship and Coaching for Teachers',
    category: 'Mentorship', tag: 'badge-cpd',
    description: 'Receive practical guidance, coaching, peer support, classroom technology support, and feedback to improve digital teaching confidence and practice.',
    audience: 'Teachers and educators',
    ctaText: 'Book Mentorship',
    image: 'assets/images/about.png',
    featured: true, price: 25000, originalPrice: 40000
  },
  {
    id: 'crs_009', slug: 'teach-computers-young-children',
    title: 'How to Teach Computers to Young Children',
    category: 'Early Years Digital Learning', tag: 'badge-cbe',
    description: 'Learn playful, age-appropriate, safe, and hands-on methods for introducing computers to young children, including computer parts, mouse skills, keyboard use, digital safety, educational games, and unplugged computing activities.',
    audience: 'Early years teachers, parents, and caregivers',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png',
    featured: true, price: 9000, originalPrice: 15000
  }
];`;

jsContent = jsContent.replace(/window\.COURSES = \[[^]*?\];/, newCoursesCode);

const newRenderCourseCard = `window.renderCourseCard = function(course, isCarousel = false) {
  return \`
    <div class="course-card" style="background: white; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; width: \${isCarousel ? '340px' : '100%'}; min-width: \${isCarousel ? '340px' : 'auto'}; scroll-snap-align: start; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: transform 0.2s;">
      
      <!-- Partner Logos Area -->
      <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0;">
         <div style="font-weight: 800; color: #333; font-size: 0.9rem; font-style: italic;">Instructify <span style="color: #0b7c4f;">Pro</span></div>
         <div style="font-weight: 700; color: #666; font-size: 0.75rem; letter-spacing: 1px;">KENYA</div>
      </div>
      
      <!-- Image Area -->
      <div style="position: relative; height: 160px; overflow: hidden; background: #111;">
        <img src="\${course.image}" alt="\${course.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;" onerror="this.parentElement.style.background='linear-gradient(135deg,#0b7c4f,#111)';this.style.display='none'">
      </div>

      <!-- Card Body -->
      <div style="padding: 16px; flex-grow: 1; display: flex; flex-direction: column;">
        <div style="margin-bottom: 12px;">
          <span style="background: #e6f6ec; color: #0b7c4f; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
            \${course.category}
          </span>
        </div>
        
        <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #222; margin-bottom: 8px; line-height: 1.3;">
          \${course.title}
        </h3>
        
        <p style="font-size: 0.9rem; color: #555; line-height: 1.5; margin-bottom: 16px; flex-grow: 1;">
          \${course.description}
        </p>
        
        <div style="font-size: 0.8rem; color: #666; font-weight: 600; display: flex; align-items: flex-start; gap: 6px; padding-top: 12px; border-top: 1px solid #f0f0f0;">
          <span style="font-size: 1rem;">👥</span>
          <span style="line-height: 1.4;">\${course.audience}</span>
        </div>
      </div>

      <!-- Card Footer -->
      <div style="padding: 16px; display: flex; justify-content: flex-end; align-items: center; background: #fafafa;">
        <a href="course-detail.html?id=\${course.id}" style="background: #e7303c; color: white; padding: 10px 24px; border-radius: 99px; font-weight: 700; font-size: 0.9rem; text-decoration: none; display: inline-block; transition: background 0.2s;" onmouseover="this.style.background='#c8202b'" onmouseout="this.style.background='#e7303c'">
          \${course.ctaText}
        </a>
      </div>

    </div>
  \`;
};`;

jsContent = jsContent.replace(/window\.renderCourseCard = function[^]*?};/, newRenderCourseCard);

// Make sure carousel renders all 9 featured courses (which is all of them)
jsContent = jsContent.replace(/const featured = window\.COURSES\.slice\(0, 5\);/, 'const featured = window.COURSES;');

fs.writeFileSync(jsPath, jsContent);


// --- 2. Update courses.html ---
const htmlPath = path.join('c:\\instructify', 'courses.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Update Hero text
htmlContent = htmlContent.replace(
  /Bridging the Digital Skills Divide/,
  'Closing the Digital Skills Gap'
);

htmlContent = htmlContent.replace(
  /No prior experience needed\. Every session and programme is free to join, for citizens and the public sector alike\./,
  'No prior experience needed. Instructify offers practical courses that help teachers, schools, parents, and young learners build confidence in digital literacy, ICT integration, creativity, coding, AI, and technology-supported learning.'
);

htmlContent = htmlContent.replace(
  /Explore all programmes/,
  'Explore All Courses'
);

htmlContent = htmlContent.replace(
  /Featured programmes/,
  '9 Future-Ready Programmes'
);

// Add bottom CTA block above the footer
const ctaBlock = `
<section style="background: #0b7c4f; padding: var(--space-4xl) 0; text-align: center; margin-top: var(--space-4xl);">
  <div class="container" style="max-width: 800px;">
    <h2 style="color: white; font-size: 2rem; margin-bottom: 1rem;">Ready to build future-ready digital skills?</h2>
    <p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; margin-bottom: 2rem;">Explore our courses, enroll today, or book customized training for your school.</p>
    <a href="#courses-grid" class="btn" style="background: white; color: #0b7c4f; padding: 1rem 2rem; border-radius: 99px; font-weight: 700; font-size: 1.1rem; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">Explore All Courses</a>
  </div>
</section>
`;

// Insert right before <footer class="footer"
htmlContent = htmlContent.replace(/<footer class="footer"/, ctaBlock + '\n<footer class="footer"');

fs.writeFileSync(htmlPath, htmlContent);

console.log('Successfully updated content.');
