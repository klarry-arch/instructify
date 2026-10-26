/* ============================================================
   INSTRUCTIFY KENYA — COURSE DATA & CATALOG MODULE
   ============================================================ */

'use strict';

// ── Course Database ─────────────────────────────────────────────
window.COURSES = [
  {
    id: 'crs_000', slug: 'digital-teaching-smart-classrooms',
    title: 'Digital Teaching & Smart Classrooms',
    subtitle: '“From Chalk to Click”',
    category: 'EdTech & Smart Learning', tag: 'badge-ict',
    description: 'Reimagine your classroom with smart boards, ClassVR, and interactive content that brings learning to life. Learn practical digital pedagogy, student engagement techniques, and modern classroom technologies.',
    instructor: 'Alex & Dr. Wanjiku', instructorTitle: 'EdTech & Virtual Learning Specialists', instructorAvatar: 'ED',
    duration: '6 weeks', level: 'All Levels', format: 'Online + Hands-On',
    targetAudience: 'Educators & School Innovators',
    accreditation: 'TSC & KICD Accredited CPD (35 Hours)',
    price: 16500, originalPrice: 24000,
    rating: 4.9, reviewCount: 410, enrollments: 2150,
    image: 'assets/images/course_smart_vr_classroom.jpg',
    badge: 'badge-ict', badgeText: 'SMART ED',
    cpd: true, cpdHours: 35,
    outcomes: ['From Chalk to Click classroom transition', 'ClassVR & Virtual Reality in teaching', 'Interactive smart board instruction', 'Engaging interactive digital content creation'],
    modules: 10, assignments: 5, quizzes: 4, certificate: true,
    schedule: '2026-09-05', tags: ['Smart Classrooms', 'ClassVR', 'Chalk to Click', 'Digital Teaching'],
    featured: true, popular: true
  },
  {
    id: 'crs_001', slug: 'ict-integration-education',
    title: 'ICT Integration in Education',
    category: 'ICT', tag: 'badge-ict',
    description: 'Master the art of integrating technology tools into Kenyan classrooms. Learn to use digital devices, educational software, and online resources to enhance teaching and learning outcomes aligned with the CBC framework.',
    instructor: 'Dr. Wanjiku Kamau', instructorTitle: 'ICT Education Specialist', instructorAvatar: 'WK',
    duration: '8 weeks', level: 'Intermediate', format: 'Online + Blended',
    targetAudience: 'Teachers & Curriculum Implementers',
    accreditation: 'TSC Accredited CPD (40 Hours)',
    price: 15000, originalPrice: 22000,
    rating: 4.8, reviewCount: 312, enrollments: 1847,
    image: 'assets/images/course_ict_integration.jpg',
    badge: 'badge-ict', badgeText: 'ICT',
    cpd: true, cpdHours: 40,
    outcomes: ['Integrate digital tools into lesson plans', 'Use LMS platforms effectively', 'Create interactive digital content', 'Apply CBC-aligned technology strategies'],
    modules: 12, assignments: 6, quizzes: 4, certificate: true,
    schedule: '2026-09-01', tags: ['ICT', 'CBC', 'Technology', 'Classroom'],
    featured: true, popular: true
  },
  {
    id: 'crs_002', slug: 'digital-literacy-certification',
    title: 'Digital Literacy Certification Program',
    category: 'Digital Skills', tag: 'badge-cpd',
    description: 'Comprehensive digital literacy program covering computer fundamentals, internet safety, digital communication, and productive use of modern digital tools for educators, students, and lifelong learners seeking certified foundational competencies.',
    instructor: 'Mr. Kamau Njoroge', instructorTitle: 'Digital Skills Trainer', instructorAvatar: 'KN',
    duration: '6 weeks', level: 'Beginner', format: 'Online',
    targetAudience: 'Educators, Students & Lifelong Learners',
    accreditation: 'National Digital Literacy Certification (30 CPD Hours)',
    price: 8500, originalPrice: 14000,
    rating: 4.9, reviewCount: 523, enrollments: 3204,
    image: 'assets/images/course-digital.png',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 30,
    outcomes: ['Navigate internet safely & securely', 'Use productivity software & tools', 'Manage digital communications', 'Create basic digital learning media'],
    modules: 8, assignments: 4, quizzes: 3, certificate: true,
    schedule: '2026-09-15', tags: ['Digital Literacy', 'ICT', 'Beginner', 'Certification'],
    featured: true, popular: true
  },
  {
    id: 'crs_003', slug: 'cbe-curriculum-implementation',
    title: 'CBE Curriculum Implementation',
    category: 'Curriculum', tag: 'badge-cbe',
    description: 'Deep dive into Kenya\'s Competency-Based Education framework. Master curriculum design principles, rubric creation, formative assessment strategies, and practical implementation techniques aligned with official KICD guidelines and CBC strands.',
    instructor: 'Prof. Achieng Ouma', instructorTitle: 'Curriculum Development Expert', instructorAvatar: 'AO',
    duration: '10 weeks', level: 'Advanced', format: 'Blended',
    targetAudience: 'School Leaders & Subject Heads',
    accreditation: 'KICD & TSC Accredited CPD (50 Hours)',
    price: 18500, originalPrice: 28000,
    rating: 4.7, reviewCount: 218, enrollments: 1124,
    image: 'assets/images/course-cbe.png',
    badge: 'badge-cbe', badgeText: 'CBE',
    cpd: true, cpdHours: 50,
    outcomes: ['Design competency-based lessons', 'Develop learner portfolios', 'Implement formative assessment rubrics', 'Align curriculum with CBC framework'],
    modules: 15, assignments: 8, quizzes: 5, certificate: true,
    schedule: '2026-10-01', tags: ['CBE', 'Curriculum', 'KICD', 'Assessment'],
    featured: true, popular: false
  },
  {
    id: 'crs_004', slug: 'ai-in-education',
    title: 'Artificial Intelligence in Education',
    category: 'AI & Tech', tag: 'badge-ai',
    description: 'Explore how AI is transforming education globally and in Africa. Learn to leverage AI tools for personalized learning, automated assessment, intelligent tutoring systems, and ethical classroom adoption.',
    instructor: 'Dr. Muthoni Kariuki', instructorTitle: 'AI in Education Researcher', instructorAvatar: 'MK',
    duration: '8 weeks', level: 'Intermediate', format: 'Online',
    targetAudience: 'Educators, Tech Leads & Administrators',
    accreditation: 'Advanced AI in Education Certificate (40 CPD Hours)',
    price: 22000, originalPrice: 35000,
    rating: 4.9, reviewCount: 178, enrollments: 896,
    image: 'assets/images/course-ai.png',
    badge: 'badge-ai', badgeText: 'AI',
    cpd: true, cpdHours: 40,
    outcomes: ['Understand AI fundamentals in education', 'Use AI tools for lesson planning', 'Design personalized learning activities', 'Evaluate AI educational tools critically'],
    modules: 10, assignments: 5, quizzes: 4, certificate: true,
    schedule: '2026-09-08', tags: ['AI', 'Technology', 'Innovation', 'Future'],
    featured: true, popular: true, new: true
  },
  {
    id: 'crs_005', slug: 'online-teaching-methodologies',
    title: 'Online Teaching Methodologies',
    category: 'Pedagogy', tag: 'badge-cpd',
    description: 'Master effective online teaching strategies, e-learning design principles, and virtual classroom management. Ideal for educators transitioning to digital teaching delivery, student engagement, and structured remote learning environments.',
    instructor: 'Ms. Grace Wahu', instructorTitle: 'E-Learning Design Specialist', instructorAvatar: 'GW',
    duration: '6 weeks', level: 'Intermediate', format: 'Online',
    targetAudience: 'Virtual Tutors, Lecturers & Teachers',
    accreditation: 'E-Learning Pedagogy Certificate (30 CPD Hours)',
    price: 12000, originalPrice: 18000,
    rating: 4.6, reviewCount: 445, enrollments: 2156,
    image: 'assets/images/home_interactive_teaching.jpg',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 30,
    outcomes: ['Design engaging online courses', 'Manage virtual classrooms effectively', 'Use video conferencing tools', 'Apply online assessment techniques'],
    modules: 9, assignments: 5, quizzes: 3, certificate: true,
    schedule: '2026-09-22', tags: ['Online Teaching', 'E-Learning', 'Virtual', 'Pedagogy'],
    featured: true, popular: false
  },
  {
    id: 'crs_006', slug: 'educational-leadership-management',
    title: 'Educational Leadership & Management',
    category: 'Leadership', tag: 'badge-cpd',
    description: 'Develop strategic leadership skills for education administrators. Covers modern school management, education policy development, stakeholder engagement, staff coaching, and institutional digital transformation strategies for forward-thinking school leaders.',
    instructor: 'Prof. Samuel Maina', instructorTitle: 'Educational Leadership Expert', instructorAvatar: 'SM',
    duration: '12 weeks', level: 'Advanced', format: 'Blended',
    targetAudience: 'Principals, Headteachers & Administrators',
    accreditation: 'Executive Educational Leadership Diploma (60 CPD Hours)',
    price: 25000, originalPrice: 40000,
    rating: 4.8, reviewCount: 134, enrollments: 678,
    image: 'assets/images/home_digital_leadership.jpg',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 60,
    outcomes: ['Lead educational institutions effectively', 'Develop strategic school plans', 'Manage education policy compliance', 'Build high-performing educator teams'],
    modules: 16, assignments: 10, quizzes: 6, certificate: true,
    schedule: '2026-10-15', tags: ['Leadership', 'Management', 'Administration', 'CPD'],
    featured: true, popular: false
  },
  {
    id: 'crs_007', slug: 'assessment-evaluation-strategies',
    title: 'Assessment & Evaluation Strategies',
    category: 'Assessment', tag: 'badge-cbe',
    description: 'Master modern assessment techniques aligned with CBE. Learn formative and summative assessment design, competency rubric creation, learner portfolio assessment, and data-driven evaluation to enhance classroom learning outcomes.',
    instructor: 'Dr. Fatuma Hassan', instructorTitle: 'Assessment & Evaluation Expert', instructorAvatar: 'FH',
    duration: '7 weeks', level: 'Intermediate', format: 'Online + Blended',
    targetAudience: 'Examiners, Assessors & Lead Teachers',
    accreditation: 'CBE Assessment Specialist Certification (35 CPD Hours)',
    price: 13500, originalPrice: 20000,
    rating: 4.7, reviewCount: 267, enrollments: 1456,
    image: 'assets/images/course_assessment_mastery.jpg',
    badge: 'badge-cbe', badgeText: 'CBE',
    cpd: true, cpdHours: 35,
    outcomes: ['Design effective formative assessments', 'Create competency grading rubrics', 'Analyze learner performance data', 'Implement portfolio assessment methods'],
    modules: 11, assignments: 7, quizzes: 4, certificate: true,
    schedule: '2026-09-29', tags: ['Assessment', 'CBE', 'Evaluation', 'Formative'],
    featured: true, popular: true
  },
  {
    id: 'crs_008', slug: 'teacher-professional-development',
    title: 'Continuous Professional Development for Teachers',
    category: 'CPD', tag: 'badge-cpd',
    description: 'A structured CPD program helping Kenyan teachers meet professional development requirements. Covers reflective practice, teaching standards, career growth, professional portfolio development, and classroom competency enhancement.',
    instructor: 'Mrs. Rahel Tesfaye', instructorTitle: 'CPD Facilitator', instructorAvatar: 'RT',
    duration: '4 weeks', level: 'Beginner', format: 'Online',
    targetAudience: 'Registered Teachers (TSC CPD Track)',
    accreditation: 'Official TSC CPD Compliance Certificate (20 Hours)',
    price: 6500, originalPrice: 10000,
    rating: 4.5, reviewCount: 612, enrollments: 4231,
    image: 'assets/images/about_educator_workshop.jpg',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 20,
    outcomes: ['Build professional teaching portfolio', 'Meet TSC CPD compliance requirements', 'Develop reflective teaching practice', 'Plan structured career growth pathway'],
    modules: 6, assignments: 3, quizzes: 2, certificate: true,
    schedule: '2026-09-08', tags: ['CPD', 'TSC', 'Professional', 'Teachers'],
    featured: false, popular: true
  },
  {
    id: 'crs_009', slug: 'digital-integration-cbc-curriculum',
    title: 'Digital Integration Across CBC/CBE: Practical Word, Excel & PowerPoint',
    subtitle: '“Infusing Productivity Tools into All Learning Areas”',
    category: 'EdTech & Smart Learning', tag: 'badge-ict',
    description: 'Master digital integration aligned with Kenya’s Competency-Based Curriculum (CBC/CBE) across all learning areas. Learn core concepts, key terminologies, and execute hands-on practical activities and authentic assessments using Microsoft Word, Excel, and PowerPoint.',
    instructor: 'Dr. Wanjiku Kamau & Alex Kipchirchir', instructorTitle: 'CBC Curriculum & EdTech Integration Specialists', instructorAvatar: 'WK',
    duration: '8 weeks', level: 'All Levels', format: 'Online + Hands-On',
    targetAudience: 'Pre-Primary, Primary, Junior & Senior Secondary Educators Across All Disciplines',
    accreditation: 'KICD & TSC Accredited CPD (45 Hours)',
    price: 0, originalPrice: 22000, isFree: true,
    rating: 4.95, reviewCount: 388, enrollments: 1940,
    image: 'assets/images/home_stem_collaboration.jpg',
    badge: 'badge-digital', badgeText: '100% FREE',
    cpd: true, cpdHours: 45,
    outcomes: [
      'Master CBC digital integration concepts & pedagogical frameworks (SAMR & TPACK)',
      'Design interactive CBC lesson plans, student worksheets & descriptive rubrics in Microsoft Word',
      'Build automated continuous assessment gradebooks & scientific data models in Microsoft Excel',
      'Create dynamic, non-linear multimedia learning presentations & formative quiz games in Microsoft PowerPoint',
      'Apply authentic cross-curricular digital integration across STEM, Languages, Humanities & Creative Arts'
    ],
    modules: 6, assignments: 5, quizzes: 5, certificate: true,
    schedule: '2026-09-12', tags: ['CBC', 'CBE', 'Digital Integration', 'Word', 'Excel', 'PowerPoint', 'Pedagogy', 'Assessment'],
    featured: true, popular: true, new: true
  },
];

// ── Enrollment State ────────────────────────────────────────────
function getEnrollments() {
  try { return JSON.parse(localStorage.getItem('ik_enrollments')) || []; }
  catch { return []; }
}

function saveEnrollment(courseId) {
  const enrollments = getEnrollments();
  const session = window.getSession ? window.getSession() : null;
  if (!session) return false;
  
  const exists = enrollments.find(e => e.courseId === courseId && e.userId === session.id);
  if (exists) return false;
  
  enrollments.push({
    id: 'enr_' + Date.now(),
    userId: session.id,
    courseId,
    enrolledAt: new Date().toISOString(),
    progress: 0,
    completed: false,
    lastAccessed: new Date().toISOString()
  });
  
  localStorage.setItem('ik_enrollments', JSON.stringify(enrollments));
  return true;
}

window.isEnrolled = function(courseId) {
  const session = window.getSession ? window.getSession() : null;
  if (!session) return false;
  return getEnrollments().some(e => e.courseId === courseId && e.userId === session.id);
};

window.enrollCourse = function(courseId) {
  const session = window.getSession ? window.getSession() : null;
  if (!session) {
    localStorage.setItem('ik_return_to', JSON.stringify({ action: 'enroll', courseId, url: `checkout.html?id=${courseId}` }));
    window.showToast('Please log in to enroll in courses.', 'warning');
    setTimeout(() => window.location.href = 'register.html', 1200);
    return;
  }
  if (window.isEnrolled(courseId)) {
    window.showToast('You are already enrolled in this course!', 'info');
    setTimeout(() => window.location.href = 'dashboard-learner.html', 1200);
    return;
  }
  // Route through payment flow — no free enrollment
  window.location.href = `checkout.html?id=${encodeURIComponent(courseId)}`;
};

window.getUserEnrolledCourses = function() {
  const session = window.getSession ? window.getSession() : null;
  if (!session) return [];
  const enrollments = getEnrollments().filter(e => e.userId === session.id);
  return enrollments.map(e => ({
    ...e,
    course: window.COURSES.find(c => c.id === e.courseId)
  })).filter(e => e.course);
};

// ── Search & Filter ─────────────────────────────────────────────
window.filterCourses = function(options = {}) {
  let results = [...window.COURSES];
  
  if (options.query) {
    const q = options.query.toLowerCase();
    results = results.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.category.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q)
    );
  }
  
  if (options.category && options.category !== 'all') {
    results = results.filter(c => c.category.toLowerCase() === options.category.toLowerCase());
  }
  
  if (options.level && options.level !== 'all') {
    results = results.filter(c => c.level.toLowerCase() === options.level.toLowerCase());
  }
  
  if (options.format && options.format !== 'all') {
    results = results.filter(c => c.format.toLowerCase().includes(options.format.toLowerCase()));
  }
  
  if (options.maxPrice) {
    results = results.filter(c => c.price <= parseInt(options.maxPrice));
  }
  
  if (options.featured) {
    results = results.filter(c => c.featured);
  }
  
  if (options.cpd) {
    results = results.filter(c => c.cpd);
  }
  
  // Sort
  if (options.sort === 'price-low')     results.sort((a, b) => a.price - b.price);
  if (options.sort === 'price-high')    results.sort((a, b) => b.price - a.price);
  if (options.sort === 'rating')        results.sort((a, b) => b.rating - a.rating);
  if (options.sort === 'popular')       results.sort((a, b) => b.enrollments - a.enrollments);
  if (options.sort === 'newest')        results.sort((a, b) => new Date(b.schedule) - new Date(a.schedule));
  
  return results;
};

// ── Render Course Card ──────────────────────────────────────────
// ── Render Course Card (Formal, Colourful, Appealing LMS Card) ──
window.renderCourseCard = function(course) {
  const enrolled = window.isEnrolled ? window.isEnrolled(course.id) : false;
  const deliveryMode = course.format || 'Online Self-Paced';
  const durationText = course.duration || '6 weeks';
  const levelText = course.level || 'All Levels';
  const targetAudience = course.targetAudience || 'Educators & Lifelong Learners';
  const accreditation = course.accreditation || (course.cpd ? `TSC CPD Accredited (${course.cpdHours || 30} Hours)` : 'Accredited Certificate Included');
  const priceVal = typeof course.price === 'number' ? course.price : parseInt(String(course.price || '0').replace(/[^0-9]/g, ''), 10);
  const isFreeCourse = priceVal === 0 || !!course.isFree;
  const priceStr = isFreeCourse ? 'FREE ACCESS' : 'KES ' + (priceVal ? priceVal.toLocaleString() : '15,000');
  const origPriceStr = course.originalPrice ? `KES ${typeof course.originalPrice === 'number' ? course.originalPrice.toLocaleString() : course.originalPrice}` : '';

  const CATEGORY_MAP = {
    'EdTech & Smart Learning': { theme: 'edtech', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', icon: '🎒' },
    'ICT': { theme: 'ict', color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE', icon: '💻' },
    'Digital Skills': { theme: 'digital', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0', icon: '🎓' },
    'Curriculum': { theme: 'curriculum', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', icon: '📗' },
    'AI & Tech': { theme: 'ai', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE', icon: '🤖' },
    'Pedagogy': { theme: 'pedagogy', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', icon: '🌐' },
    'Leadership': { theme: 'leadership', color: '#0F4C81', bg: '#F0F7FF', border: '#BAE6FD', icon: '🏛️' },
    'Assessment': { theme: 'assessment', color: '#BE123C', bg: '#FFF1F2', border: '#FECDD3', icon: '🧠' },
    'CPD': { theme: 'cpd', color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4', icon: '🏆' }
  };

  const cat = CATEGORY_MAP[course.category] || { theme: 'default', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', icon: '📚' };
  const topics = Array.isArray(course.outcomes) && course.outcomes.length > 0
    ? course.outcomes.slice(0, 4)
    : ['Competency-based digital pedagogy', 'Practical classroom implementation', 'Reflective portfolio building'];

  const detailUrl = `course-detail.html?id=${encodeURIComponent(course.id)}`;
  const syllabusUrl = `course-detail.html?id=${encodeURIComponent(course.id)}#syllabus`;
  const playerUrl = `course-player.html?courseId=${encodeURIComponent(course.id)}`;
  const enrolUrl = isFreeCourse ? playerUrl : `checkout.html?id=${encodeURIComponent(course.id)}`;
  
  return `
    <article class="lms-course-card category-${cat.theme} reveal" data-course-id="${course.id}" aria-label="${course.title}">
      <!-- Top Category Accent Bar -->
      <div class="lms-card-top-accent" style="background:${cat.color};"></div>

      <!-- Thumbnail Area -->
      <div class="lms-course-thumb-box">
        <img src="${course.image}" alt="${course.title}" class="lms-course-thumb-img" loading="lazy" 
             onerror="this.parentElement.style.background='linear-gradient(135deg,#1E3A8A,#2563EB)';this.style.display='none'">
        <span class="lms-course-category-badge" style="color:${cat.color}; background:${cat.bg}; border:1px solid ${cat.border};">
          ${cat.icon} ${course.category}
        </span>
        <span class="lms-course-mode-badge">${deliveryMode}</span>
        ${course.cpd ? '<span class="lms-course-cpd-badge">✓ CPD Verified</span>' : ''}
        <button class="lms-bookmark-btn" onclick="toggleWishlist(this)" title="Save to wishlist" aria-label="Save ${course.title} to wishlist">🤍</button>
      </div>

      <!-- Card Body -->
      <div class="lms-course-body">
        <div class="lms-meta-chips-strip">
          <span class="lms-meta-badge">⏱️ ${durationText} ${course.cpdHours ? `(${course.cpdHours} Hrs)` : ''}</span>
          <span class="lms-meta-badge">🎯 ${levelText}</span>
          <span class="lms-rating-badge">★ ${course.rating || '4.8'} <span class="review-count">(${course.reviewCount ? course.reviewCount.toLocaleString() : '150'})</span></span>
        </div>

        <h3 class="lms-course-title">
          <a href="${detailUrl}">${course.title}</a>
        </h3>

        <div class="lms-audience-tag">
          <span class="audience-icon">👥</span>
          <span class="audience-label">Audience:</span>
          <span class="audience-value">${targetAudience}</span>
        </div>

        <p class="lms-course-desc">${course.description || ''}</p>

        <!-- What You Will Learn (Course Outline) -->
        <div class="lms-outline-block">
          <div class="lms-outline-header">
            <span class="outline-icon">📋</span>
            <span>What You Will Learn:</span>
          </div>
          <ul class="lms-outline-list">
            ${topics.map(t => `<li><span class="bullet-check">✓</span> <span>${t}</span></li>`).join('')}
          </ul>
          <a href="${syllabusUrl}" class="lms-outline-link" aria-label="View full course outline for ${course.title}">
            View Full Outline &rarr;
          </a>
        </div>

        <div class="lms-accreditation-row">
          <span class="lms-accreditation-badge">📜 ${accreditation}</span>
        </div>

        <div class="lms-instructor-row">
          <div class="lms-inst-avatar">${course.instructorAvatar || 'IK'}</div>
          <div class="lms-inst-info">
            <span class="inst-name">${course.instructor || 'Instructify Faculty'}</span>
            <span class="inst-role">${course.instructorTitle || 'Education Specialist'}</span>
          </div>
        </div>
      </div>

      <!-- Card Footer -->
      <div class="lms-course-footer">
        <div class="lms-course-price-box">
          <span class="price-label">Tuition / Investment</span>
          <div class="price-wrap">
            <span class="price-current ${isFreeCourse ? 'free' : ''}">${priceStr}</span>
            ${origPriceStr ? `<span class="price-original">${origPriceStr}</span>` : ''}
          </div>
        </div>
        <div class="lms-card-button-group">
          <a href="${detailUrl}" class="btn-lms-view" aria-label="View course details for ${course.title}">View Course</a>
          <a href="${enrolled ? playerUrl : enrolUrl}" class="btn-lms-enrol" aria-label="${enrolled ? `Continue learning ${course.title}` : (isFreeCourse ? `Start free learning in ${course.title}` : `Enrol now in ${course.title}`)}">
            ${enrolled ? '▶ Continue Learning' : (isFreeCourse ? '🎁 Start Free' : '⚡ Enrol Now')}
          </a>
        </div>
      </div>
    </article>
  `;
};

// ── Wishlist Toggle ────────────────────────────────────────
window.toggleWishlist = async function(btn) {
  // Require auth
  const session = window.getSession ? window.getSession() : null;
  if (!session) {
    window.showToast('Please log in to save courses to your wishlist.', 'warning');
    setTimeout(() => window.location.href = 'register.html', 1200);
    return;
  }

  const card = btn.closest('[data-course-id]') || btn.closest('.course-card');
  const courseId = card ? card.getAttribute('data-course-id') :
    (btn.dataset.courseId || null);
  if (!courseId) return;

  const isWishlisted = btn.classList.contains('wishlisted');

  // Optimistic UI update
  if (isWishlisted) {
    btn.classList.remove('wishlisted');
    btn.innerHTML = btn.textContent.includes('Save') ? '🤍 Save to Wishlist' : '🤍';
    if (btn.title !== undefined) btn.title = 'Add to wishlist';
  } else {
    btn.classList.add('wishlisted');
    btn.innerHTML = btn.textContent.includes('Save') ? '❤️ Saved to Wishlist' : '❤️';
    if (btn.title !== undefined) btn.title = 'Remove from wishlist';
  }

  // Sync localStorage
  const wishlist = JSON.parse(localStorage.getItem('ik_wishlist') || '[]');
  if (isWishlisted) {
    const idx = wishlist.indexOf(courseId);
    if (idx > -1) wishlist.splice(idx, 1);
  } else {
    if (!wishlist.includes(courseId)) wishlist.push(courseId);
  }
  localStorage.setItem('ik_wishlist', JSON.stringify(wishlist));

  // Sync server (non-blocking — UI already updated)
  try {
    await fetch('/api/wishlist', {
      method: isWishlisted ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.id, courseId }),
    });
  } catch { /* server sync is best-effort */ }

  if (window.showToast) {
    window.showToast(
      isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist ❤️',
      'info',
      2000
    );
  }
};

/**
 * Load wishlist state from server and sync to localStorage.
 * Call on page load to restore saved courses.
 */
window.loadServerWishlist = async function () {
  const session = window.getSession ? window.getSession() : null;
  if (!session) return;
  try {
    const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(session.id)}`);
    if (!res.ok) return;
    const { wishlist } = await res.json();
    localStorage.setItem('ik_wishlist', JSON.stringify(wishlist || []));
    // Update any visible wishlist buttons
    (wishlist || []).forEach(courseId => {
      const btn = document.querySelector(`[data-course-id="${courseId}"] .course-card-wishlist`);
      if (btn && !btn.classList.contains('wishlisted')) {
        btn.classList.add('wishlisted');
        btn.innerHTML = '❤️';
      }
    });
  } catch { /* non-critical */ }
};
