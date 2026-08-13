/* ============================================================
   INSTRUCTIFY KENYA — COURSE DATA & CATALOG MODULE
   ============================================================ */

'use strict';

// ── Course Database ─────────────────────────────────────────────
window.COURSES = [
  {
    id: 'crs_001', slug: 'ict-integration-education',
    title: 'ICT Integration in Education',
    category: 'ICT', tag: 'badge-ict',
    description: 'Master the art of integrating technology tools into Kenyan classrooms. Learn to use digital devices, educational software, and online resources to enhance teaching and learning outcomes aligned with the CBC framework.',
    instructor: 'Dr. Wanjiku Kamau', instructorTitle: 'ICT Education Specialist', instructorAvatar: 'WK',
    duration: '8 weeks', level: 'Intermediate', format: 'Online + Blended',
    price: 15000, originalPrice: 22000,
    rating: 4.8, reviewCount: 312, enrollments: 1847,
    image: 'assets/images/course-ict.png',
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
    description: 'Comprehensive digital literacy program covering computer fundamentals, internet safety, digital communication, and productive use of digital tools for educators and lifelong learners.',
    instructor: 'Mr. Kamau Njoroge', instructorTitle: 'Digital Skills Trainer', instructorAvatar: 'KN',
    duration: '6 weeks', level: 'Beginner', format: 'Online',
    price: 8500, originalPrice: 14000,
    rating: 4.9, reviewCount: 523, enrollments: 3204,
    image: 'assets/images/course-digital.png',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 30,
    outcomes: ['Navigate internet safely', 'Use productivity tools', 'Manage digital communications', 'Create basic digital content'],
    modules: 8, assignments: 4, quizzes: 3, certificate: true,
    schedule: '2026-09-15', tags: ['Digital Literacy', 'ICT', 'Beginner', 'Certification'],
    featured: true, popular: true
  },
  {
    id: 'crs_003', slug: 'cbe-curriculum-implementation',
    title: 'CBE Curriculum Implementation',
    category: 'Curriculum', tag: 'badge-cbe',
    description: 'Deep dive into Kenya\'s Competency-Based Education framework. Understand curriculum design principles, assessment strategies, and implementation techniques aligned with KICD guidelines.',
    instructor: 'Prof. Achieng Ouma', instructorTitle: 'Curriculum Development Expert', instructorAvatar: 'AO',
    duration: '10 weeks', level: 'Advanced', format: 'Blended',
    price: 18500, originalPrice: 28000,
    rating: 4.7, reviewCount: 218, enrollments: 1124,
    image: 'assets/images/course-cbe.png',
    badge: 'badge-cbe', badgeText: 'CBE',
    cpd: true, cpdHours: 50,
    outcomes: ['Design competency-based lessons', 'Develop learner portfolios', 'Implement formative assessment', 'Align curriculum with CBC framework'],
    modules: 15, assignments: 8, quizzes: 5, certificate: true,
    schedule: '2026-10-01', tags: ['CBE', 'Curriculum', 'KICD', 'Assessment'],
    featured: true, popular: false
  },
  {
    id: 'crs_004', slug: 'ai-in-education',
    title: 'Artificial Intelligence in Education',
    category: 'AI & Tech', tag: 'badge-ai',
    description: 'Explore how AI is transforming education globally and in Africa. Learn to leverage AI tools for personalized learning, automated assessment, and intelligent tutoring systems.',
    instructor: 'Dr. Muthoni Kariuki', instructorTitle: 'AI in Education Researcher', instructorAvatar: 'MK',
    duration: '8 weeks', level: 'Intermediate', format: 'Online',
    price: 22000, originalPrice: 35000,
    rating: 4.9, reviewCount: 178, enrollments: 896,
    image: 'assets/images/course-ai.png',
    badge: 'badge-ai', badgeText: 'AI',
    cpd: true, cpdHours: 40,
    outcomes: ['Understand AI fundamentals in education', 'Use AI tools for teaching', 'Design AI-enhanced lesson plans', 'Evaluate AI tools critically'],
    modules: 10, assignments: 5, quizzes: 4, certificate: true,
    schedule: '2026-09-08', tags: ['AI', 'Technology', 'Innovation', 'Future'],
    featured: true, popular: true, new: true
  },
  {
    id: 'crs_005', slug: 'online-teaching-methodologies',
    title: 'Online Teaching Methodologies',
    category: 'Pedagogy', tag: 'badge-cpd',
    description: 'Master effective online teaching strategies, e-learning design principles, and virtual classroom management. Ideal for educators transitioning to or improving digital teaching delivery.',
    instructor: 'Ms. Grace Wahu', instructorTitle: 'E-Learning Design Specialist', instructorAvatar: 'GW',
    duration: '6 weeks', level: 'Intermediate', format: 'Online',
    price: 12000, originalPrice: 18000,
    rating: 4.6, reviewCount: 445, enrollments: 2156,
    image: 'assets/images/course-digital.png',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 30,
    outcomes: ['Design engaging online courses', 'Manage virtual classrooms', 'Use video conferencing tools', 'Apply online assessment techniques'],
    modules: 9, assignments: 5, quizzes: 3, certificate: true,
    schedule: '2026-09-22', tags: ['Online Teaching', 'E-Learning', 'Virtual', 'Pedagogy'],
    featured: true, popular: false
  },
  {
    id: 'crs_006', slug: 'educational-leadership-management',
    title: 'Educational Leadership & Management',
    category: 'Leadership', tag: 'badge-cpd',
    description: 'Develop strategic leadership skills for education administrators. Covers school management, policy development, stakeholder engagement, and educational innovation strategies.',
    instructor: 'Prof. Samuel Maina', instructorTitle: 'Educational Leadership Expert', instructorAvatar: 'SM',
    duration: '12 weeks', level: 'Advanced', format: 'Blended',
    price: 25000, originalPrice: 40000,
    rating: 4.8, reviewCount: 134, enrollments: 678,
    image: 'assets/images/about.png',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 60,
    outcomes: ['Lead educational institutions effectively', 'Develop strategic school plans', 'Manage education policy compliance', 'Build high-performing education teams'],
    modules: 16, assignments: 10, quizzes: 6, certificate: true,
    schedule: '2026-10-15', tags: ['Leadership', 'Management', 'Administration', 'CPD'],
    featured: true, popular: false
  },
  {
    id: 'crs_007', slug: 'assessment-evaluation-strategies',
    title: 'Assessment & Evaluation Strategies',
    category: 'Assessment', tag: 'badge-cbe',
    description: 'Master modern assessment techniques aligned with CBE. Learn formative and summative assessment design, rubric creation, portfolio assessment, and data-driven evaluation.',
    instructor: 'Dr. Fatuma Hassan', instructorTitle: 'Assessment & Evaluation Expert', instructorAvatar: 'FH',
    duration: '7 weeks', level: 'Intermediate', format: 'Online + Blended',
    price: 13500, originalPrice: 20000,
    rating: 4.7, reviewCount: 267, enrollments: 1456,
    image: 'assets/images/course-cbe.png',
    badge: 'badge-cbe', badgeText: 'CBE',
    cpd: true, cpdHours: 35,
    outcomes: ['Design effective assessments', 'Create competency rubrics', 'Analyze learner performance data', 'Implement portfolio assessment'],
    modules: 11, assignments: 7, quizzes: 4, certificate: true,
    schedule: '2026-09-29', tags: ['Assessment', 'CBE', 'Evaluation', 'Formative'],
    featured: true, popular: true
  },
  {
    id: 'crs_008', slug: 'teacher-professional-development',
    title: 'Continuous Professional Development for Teachers',
    category: 'CPD', tag: 'badge-cpd',
    description: 'A structured CPD program helping Kenyan teachers meet professional development requirements. Covers reflective practice, teaching standards, career growth, and professional portfolio development.',
    instructor: 'Mrs. Rahel Tesfaye', instructorTitle: 'CPD Facilitator', instructorAvatar: 'RT',
    duration: '4 weeks', level: 'Beginner', format: 'Online',
    price: 6500, originalPrice: 10000,
    rating: 4.5, reviewCount: 612, enrollments: 4231,
    image: 'assets/images/about.png',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 20,
    outcomes: ['Build professional teaching portfolio', 'Meet TSC CPD requirements', 'Develop reflective teaching practice', 'Plan career development pathway'],
    modules: 6, assignments: 3, quizzes: 2, certificate: true,
    schedule: '2026-09-08', tags: ['CPD', 'TSC', 'Professional', 'Teachers'],
    featured: false, popular: true
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
    window.showToast('Please log in to enroll in courses.', 'warning');
    setTimeout(() => window.location.href = 'register.html', 1200);
    return;
  }
  
  if (window.isEnrolled(courseId)) {
    window.showToast('You are already enrolled in this course!', 'info');
    return;
  }
  
  saveEnrollment(courseId);
  window.showToast('Successfully enrolled! Redirecting to your dashboard...', 'success');
  setTimeout(() => window.location.href = 'dashboard-learner.html', 1500);
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
window.renderCourseCard = function(course) {
  const enrolled = window.isEnrolled ? window.isEnrolled(course.id) : false;
  return `
    <div class="course-card reveal">
      <div class="course-card-image">
        <img src="${course.image}" alt="${course.title}" loading="lazy" 
             onerror="this.parentElement.style.background='linear-gradient(135deg,#0D6E4F,#00B4D8)';this.style.display='none'">
        <span class="course-card-badge ${course.badge}">${course.badgeText}</span>
        <button class="course-card-wishlist" onclick="toggleWishlist(this)" title="Add to wishlist">🤍</button>
      </div>
      <div class="course-card-body">
        <span class="course-card-category">${course.category}</span>
        <h3 class="course-card-title">${course.title}</h3>
        <div class="course-card-instructor">
          <div class="instructor-avatar">${course.instructorAvatar}</div>
          <span>${course.instructor}</span>
        </div>
        <div class="course-card-stats">
          <span class="rating">⭐ ${course.rating}</span>
          <span>(${course.reviewCount.toLocaleString()})</span>
          <span>• ${course.duration}</span>
          <span>• ${course.level}</span>
        </div>
        ${course.cpd ? `<div style="margin-top:4px"><span class="badge badge-green">✅ CPD Accredited · ${course.cpdHours} hrs</span></div>` : ''}
      </div>
      <div class="course-card-footer">
        <div class="course-price">
          <span class="price-current">KES ${course.price.toLocaleString()}</span>
          <span class="price-original">KES ${course.originalPrice.toLocaleString()}</span>
        </div>
        <a href="course-detail.html?id=${course.id}" class="btn btn-primary btn-sm">
          ${enrolled ? '📚 Continue' : 'View Course'}
        </a>
      </div>
    </div>
  `;
};

// ── Wishlist Toggle ────────────────────────────────────────
window.toggleWishlist = function(btn) {
  var card = btn.closest && (btn.closest("[data-course-id]") || btn.closest(".course-card"));
  var courseId = card ? card.getAttribute("data-course-id") : null;
  var wishlist = JSON.parse(localStorage.getItem("ik_wishlist") || "[]");
  var isWishlisted = btn.classList.contains("wishlisted");
  if (isWishlisted) {
    btn.classList.remove("wishlisted");
    btn.innerHTML = "🤍";
    btn.title = "Add to wishlist";
    if (courseId) { var idx = wishlist.indexOf(courseId); if (idx > -1) wishlist.splice(idx, 1); }
  } else {
    btn.classList.add("wishlisted");
    btn.innerHTML = "❤️";
    btn.title = "Remove from wishlist";
    if (courseId && !wishlist.includes(courseId)) wishlist.push(courseId);
  }
  localStorage.setItem("ik_wishlist", JSON.stringify(wishlist));
  if (window.showToast) { window.showToast(isWishlisted ? "Removed from wishlist" : "Added to wishlist! ❤️", "info", 2000); }
};
