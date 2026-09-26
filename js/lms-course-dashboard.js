/* ============================================================
   INSTRUCTIFY KENYA — COURSE / LMS DASHBOARD ENGINE (courses.html)
   Central reactive controller for:
   - LMS Horizontal Sub-Navigation
   - Dynamic Personalised Welcome Area
   - Course Search & Multi-Dimensional Filters
   - Learner Quick-Action Panel
   - Main Featured Learning Banner (Admin Manageable)
   - Browse Courses Catalog (Grid & List View)
   - My Learning Hub (In Progress, Enrolled, Bookmarked, Completed, Certificates)
   - Academies & Learning Areas Filtering
   - Role-Based Access & Admin Controls
   ============================================================ */

(function (window) {
  'use strict';

  // ── Storage Keys ─────────────────────────────────────────────
  const STORAGE_KEYS = {
    BOOKMARKS: 'ik_lms_bookmarks',
    FEATURED_BANNER: 'ik_lms_featured_banner',
    ACTIVE_ROLE_OVERRIDE: 'ik_lms_demo_role',
    VIEW_MODE: 'ik_lms_view_mode'
  };

  // ── State Management ─────────────────────────────────────────
  const state = {
    currentTab: 'home', // 'home' | 'my-learning' | 'academies' | 'admin'
    myLearningSubtab: 'in-progress', // 'in-progress' | 'enrolled' | 'bookmarked' | 'completed' | 'certificates'
    viewMode: localStorage.getItem(STORAGE_KEYS.VIEW_MODE) || 'grid',
    filters: {
      query: '',
      category: 'all',
      academy: 'all',
      level: 'all',
      duration: 'all',
      pricing: 'all',
      cpd: false,
      sort: 'popular'
    },
    user: null,
    bookmarks: [],
    courses: [],
    enrollments: []
  };

  // ── Academies Definition (Aligned with CBC & EdTech tracks) ──
  const ACADEMIES = [
    {
      id: 'digital-literacy',
      title: 'Digital Literacy & ICT Integration',
      desc: 'Smart boards, LMS, digital devices, and safe internet delivery for 21st-century teaching.',
      icon: '💻',
      bg: '#EEF2FF',
      color: '#2145E6',
      filterKeyword: 'Digital'
    },
    {
      id: 'cbc-curriculum',
      title: 'Teaching & Learning (CBC Pedagogy)',
      desc: 'Competency-based lesson plans, portfolio design, rubrics, and strand integration.',
      icon: '📐',
      bg: '#FFF1EB',
      color: '#FF4D00',
      filterKeyword: 'Curriculum'
    },
    {
      id: 'edtech-vr',
      title: 'Educational Technology & VR',
      desc: 'Immersive ClassVR experiences, interactive simulations, and robotics kits in school.',
      icon: '🥽',
      bg: '#F5F3FF',
      color: '#7C3AED',
      filterKeyword: 'Smart'
    },
    {
      id: 'early-years',
      title: 'Early Years Education (PP1-Grade 3)',
      desc: 'Foundational literacy, numeracy, creative expression, and inclusive early childhood learning.',
      icon: '🌱',
      bg: '#ECFDF5',
      color: '#059669',
      filterKeyword: 'Early'
    },
    {
      id: 'assessment-eval',
      title: 'Assessment & Evaluation',
      desc: 'Formative CBC assessment rubrics, learner progress tracking, and authentic evaluation.',
      icon: '📊',
      bg: '#FEF3C7',
      color: '#D97706',
      filterKeyword: 'Assessment'
    },
    {
      id: 'pro-development',
      title: 'Professional Development & Coaching',
      desc: 'Teacher mentorship, CPD credit compliance, instructional leadership, and growth.',
      icon: '🏆',
      bg: '#F1F5F9',
      color: '#475569',
      filterKeyword: 'Pedagogy'
    },
    {
      id: 'school-leadership',
      title: 'School Leadership & Management',
      desc: 'Strategic management, education policy, teacher appraisal, and school digitization.',
      icon: '🏛️',
      bg: '#F0FDF4',
      color: '#16A34A',
      filterKeyword: 'Leadership'
    },
    {
      id: 'ai-education',
      title: 'Artificial Intelligence in Education',
      desc: 'GenAI lesson design, automated grading, intelligent tutoring, and ethical AI in school.',
      icon: '🤖',
      bg: '#F5F3FF',
      color: '#6366F1',
      filterKeyword: 'AI'
    }
  ];

  // ── Default Mock Certificates for Demo ───────────────────────
  const DEFAULT_CERTIFICATES = [
    {
      id: 'CERT-IK-2026-0881',
      courseId: 'crs_002',
      courseTitle: 'Digital Literacy Certification Program',
      issueDate: 'August 24, 2026',
      grade: 'Distinction (94%)',
      accreditation: 'TSC & KICD Accredited CPD (30 Hours)',
      downloadUrl: 'student-certificates.html'
    }
  ];

  // ── Helper to Get All Unique Catalog Courses ─────────────────
  function getAllCourses() {
    const lmsCourses = (window.LMSEngine && typeof window.LMSEngine.getCourses === 'function')
      ? window.LMSEngine.getCourses()
      : [];
    const baseCourses = window.COURSES || [];

    const map = new Map();
    baseCourses.forEach(c => map.set(c.id, c));
    lmsCourses.forEach(c => {
      // Merge or prefer custom LMS fields
      if (map.has(c.id)) {
        map.set(c.id, { ...map.get(c.id), ...c });
      } else {
        map.set(c.id, c);
      }
    });

    return Array.from(map.values());
  }

  // ── Initialize Active User Session & Role ────────────────────
  function initUserSession() {
    let session = null;
    if (window.getSession && typeof window.getSession === 'function') {
      session = window.getSession();
    }
    if (!session) {
      try {
        session = JSON.parse(sessionStorage.getItem('ik_session') || localStorage.getItem('ik_session'));
      } catch (e) {
        session = null;
      }
    }

    // Check if demo role override is active
    const demoRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE_OVERRIDE);

    if (demoRole === 'guest') {
      state.user = null;
    } else if (demoRole === 'trainer') {
      state.user = {
        id: 'usr_002',
        name: 'Dr. Wanjiku Kamau',
        email: 'trainer@instructify.ke',
        role: 'trainer',
        title: 'Lead EdTech Specialist',
        avatar: 'WK'
      };
    } else if (demoRole === 'admin') {
      state.user = {
        id: 'usr_003',
        name: 'Prof. Ochieng Otieno',
        email: 'admin@instructify.ke',
        role: 'admin',
        title: 'Platform Administrator',
        avatar: 'OO'
      };
    } else if (session) {
      state.user = session;
    } else {
      // Default initial learner persona for rich, live demo data
      state.user = {
        id: 'std_001',
        name: 'James Mwangi',
        email: 'james.mwangi@edu.ke',
        role: 'learner',
        title: 'Junior Secondary Teacher',
        avatar: 'JM'
      };
    }
  }

  // ── Load Bookmarks ───────────────────────────────────────────
  function loadBookmarks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      state.bookmarks = stored ? JSON.parse(stored) : ['crs_000', 'crs_004']; // default saved sample
    } catch {
      state.bookmarks = ['crs_000'];
    }
  }

  function saveBookmarks() {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(state.bookmarks));
    } catch (e) {
      console.warn('Could not save bookmarks to localStorage', e);
    }
  }

  // ── Bookmark Toggle Action ───────────────────────────────────
  window.toggleLmsBookmark = function (courseId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const idx = state.bookmarks.indexOf(courseId);
    if (idx >= 0) {
      state.bookmarks.splice(idx, 1);
    } else {
      state.bookmarks.push(courseId);
    }
    saveBookmarks();

    // Update buttons in DOM
    document.querySelectorAll(`.lms-bookmark-btn[data-course-id="${courseId}"]`).forEach(btn => {
      const isSaved = state.bookmarks.includes(courseId);
      btn.classList.toggle('active', isSaved);
      btn.setAttribute('aria-label', isSaved ? 'Remove bookmark' : 'Bookmark course');
      btn.setAttribute('title', isSaved ? 'Remove bookmark' : 'Bookmark course');
    });

    updateCounters();

    // If currently on Bookmarked subtab, re-render
    if (state.currentTab === 'my-learning' && state.myLearningSubtab === 'bookmarked') {
      renderMyLearning();
    }
  };

  // ── Enrollments & Progress Extraction ────────────────────────
  function getEnrollmentsForActiveUser() {
    if (!state.user) return [];
    if (window.LMSEngine && typeof window.LMSEngine.getAllEnrollments === 'function') {
      const allEnr = window.LMSEngine.getAllEnrollments();
      const userEnr = allEnr.filter(e => e.studentId === state.user.id || e.studentId === 'std_001');
      if (userEnr.length > 0) return userEnr;
    }

    // Default mock enrollments for demo experience
    return [
      {
        id: 'enr_001',
        courseId: 'crs_001',
        studentId: state.user.id || 'std_001',
        progressPercent: 45,
        completedLessons: ['les_001_01'],
        activeLessonId: 'les_001_02',
        currentLessonTitle: 'Lesson 1.2: Digital Tools Mapping for Schools',
        lastActiveAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'active'
      },
      {
        id: 'enr_002',
        courseId: 'crs_000',
        studentId: state.user.id || 'std_001',
        progressPercent: 15,
        completedLessons: ['les_000_01'],
        activeLessonId: 'les_000_02',
        currentLessonTitle: 'Module 1: Smart Boards & Interactive Displays',
        lastActiveAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        status: 'active'
      },
      {
        id: 'enr_003',
        courseId: 'crs_002',
        studentId: state.user.id || 'std_001',
        progressPercent: 100,
        completedLessons: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8'],
        completedAt: '2026-08-24T10:00:00Z',
        lastActiveAt: '2026-08-24T10:00:00Z',
        status: 'completed'
      }
    ];
  }

  // ── Render Personalised Welcome Section ───────────────────────
  function renderWelcomeArea() {
    const welcomeHeading = document.getElementById('lms-welcome-heading');
    const welcomeSub = document.getElementById('lms-welcome-sub');
    const userRoleBadge = document.getElementById('lms-user-role-badge');
    const userAvatarEl = document.getElementById('lms-user-avatar');
    const userNameEl = document.getElementById('lms-user-display-name');

    if (state.user && state.user.name) {
      const firstName = state.user.name.split(' ')[0] || 'Learner';
      if (welcomeHeading) {
        welcomeHeading.innerHTML = `Welcome back, <span style="color:var(--lms-primary); font-weight:800;">${firstName}</span> 👋`;
      }
      if (welcomeSub) {
        welcomeSub.textContent = 'Continue learning, explore new courses, and track your progress.';
      }
      if (userRoleBadge) {
        const roleLabel = state.user.role === 'admin'
          ? 'Administrator'
          : (state.user.role === 'trainer' ? 'Educator / Trainer' : 'Verified Learner');
        userRoleBadge.textContent = roleLabel;
      }
      if (userAvatarEl) {
        userAvatarEl.textContent = state.user.avatar || firstName.slice(0, 2).toUpperCase();
      }
      if (userNameEl) {
        userNameEl.textContent = state.user.name;
      }
    } else {
      if (welcomeHeading) {
        welcomeHeading.innerHTML = `Welcome to <span style="color:var(--lms-primary);">Instructify Learning</span> 🎓`;
      }
      if (welcomeSub) {
        welcomeSub.textContent = 'Build practical skills, access educator-created courses, and learn at your own pace.';
      }
      if (userRoleBadge) {
        userRoleBadge.textContent = 'Guest Learner';
      }
      if (userAvatarEl) {
        userAvatarEl.textContent = 'IK';
      }
      if (userNameEl) {
        userNameEl.textContent = 'Sign In to Track Progress';
      }
    }

    updateCounters();
  }

  // ── Update Counters Across the Page ──────────────────────────
  function updateCounters() {
    const enrollments = getEnrollmentsForActiveUser();
    const inProgressCount = enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100).length;
    const completedCount = enrollments.filter(e => e.progressPercent === 100).length;
    const bookmarkedCount = state.bookmarks.length;
    const totalCourses = state.courses.length || 9;
    const certCount = DEFAULT_CERTIFICATES.length;

    // Welcome strip pills
    const welEnrolled = document.getElementById('welcome-enrolled-count');
    if (welEnrolled) welEnrolled.textContent = enrollments.length;

    const welProgress = document.getElementById('welcome-progress-count');
    if (welProgress) welProgress.textContent = inProgressCount;

    const welBookmarked = document.getElementById('welcome-bookmarks-count');
    if (welBookmarked) welBookmarked.textContent = bookmarkedCount;

    const welCert = document.getElementById('welcome-cert-count');
    if (welCert) welCert.textContent = completedCount;

    // Quick Actions Panel
    const qaProgress = document.getElementById('qa-count-inprogress');
    if (qaProgress) qaProgress.textContent = inProgressCount;

    const qaTotal = document.getElementById('qa-count-total');
    if (qaTotal) qaTotal.textContent = totalCourses;

    const qaBookmarked = document.getElementById('qa-count-bookmarked');
    if (qaBookmarked) qaBookmarked.textContent = bookmarkedCount;

    const qaCompleted = document.getElementById('qa-count-completed');
    if (qaCompleted) qaCompleted.textContent = completedCount;

    // Subtabs counters in My Learning
    const tabCountProg = document.getElementById('tab-count-inprogress');
    if (tabCountProg) tabCountProg.textContent = inProgressCount;

    const tabCountEnr = document.getElementById('tab-count-enrolled');
    if (tabCountEnr) tabCountEnr.textContent = enrollments.length;

    const tabCountBkm = document.getElementById('tab-count-bookmarked');
    if (tabCountBkm) tabCountBkm.textContent = bookmarkedCount;

    const tabCountCmp = document.getElementById('tab-count-completed');
    if (tabCountCmp) tabCountCmp.textContent = completedCount;

    const tabCountCrt = document.getElementById('tab-count-certificates');
    if (tabCountCrt) tabCountCrt.textContent = certCount;

    // Update Quick Resume box in Left Panel
    renderQuickResumeBox(enrollments);
  }

  // ── Render Quick Resume Card inside Quick Action Panel ────────
  function renderQuickResumeBox(enrollments) {
    const resumeContainer = document.getElementById('lms-quick-resume-box');
    if (!resumeContainer) return;

    const activeEnr = enrollments.find(e => e.progressPercent > 0 && e.progressPercent < 100);
    if (!activeEnr) {
      resumeContainer.innerHTML = `
        <div class="lms-qr-header">Ready to Learn?</div>
        <div class="lms-qr-course-title">Explore CBC Accredited Tracks</div>
        <p style="font-size:11.5px; color:#94A3B8; margin:0 0 10px; line-height:1.4;">Pick a course from our catalog to begin earning CPD credit hours.</p>
        <button onclick="scrollToLmsCatalog()" class="lms-qr-btn" style="background:#2145E6;">Browse Catalog &rarr;</button>
      `;
      return;
    }

    const course = state.courses.find(c => c.id === activeEnr.courseId) || {
      title: 'ICT Integration in Education',
      id: activeEnr.courseId
    };

    resumeContainer.innerHTML = `
      <div class="lms-qr-header">⚡ Continue Learning</div>
      <div class="lms-qr-course-title" title="${course.title}">${course.title}</div>
      <div class="lms-qr-bar-bg" aria-label="Lesson Progress">
        <div class="lms-qr-bar-fill" style="width: ${activeEnr.progressPercent}%;"></div>
      </div>
      <div class="lms-qr-footer">
        <span class="lms-qr-percent">${activeEnr.progressPercent}% Completed</span>
        <a href="course-player.html?courseId=${course.id}" class="lms-qr-btn">Resume Lesson &rarr;</a>
      </div>
    `;
  }

  // ── Render Academies Grid ────────────────────────────────────
  function renderAcademies() {
    const container = document.getElementById('lms-academies-grid');
    if (!container) return;

    container.innerHTML = ACADEMIES.map(acad => {
      const isSelected = state.filters.academy === acad.id;
      return `
        <div class="lms-academy-card ${isSelected ? 'active' : ''}" onclick="selectAcademy('${acad.id}', '${acad.filterKeyword}')" role="button" tabindex="0" aria-label="Browse ${acad.title}">
          <div>
            <div class="lms-academy-icon-box" style="background: ${acad.bg}; color: ${acad.color};">
              ${acad.icon}
            </div>
            <h3 class="lms-academy-h3">${acad.title}</h3>
            <p class="lms-academy-desc">${acad.desc}</p>
          </div>
          <div class="lms-academy-footer">
            <span>Explore Courses &rarr;</span>
            <span style="font-size:11px; color:#94A3B8;">Accredited</span>
          </div>
        </div>
      `;
    }).join('');
  }

  window.selectAcademy = function (academyId, keyword) {
    if (state.filters.academy === academyId) {
      state.filters.academy = 'all';
      state.filters.category = 'all';
    } else {
      state.filters.academy = academyId;
      state.filters.category = keyword;
    }
    renderAcademies();
    renderCatalog();

    // Scroll smoothly to catalog
    scrollToLmsCatalog();
  };

  // ── Render Course Card (Grid View) ───────────────────────────
  function createCourseCardHtml(c, isListView = false) {
    const isSaved = state.bookmarks.includes(c.id);
    const thumb = c.image || c.thumbnail || 'assets/images/course_assessment_mastery.jpg';
    const rating = c.rating || '4.8';
    const reviews = c.reviewCount || c.reviewsCount || 120;
    const duration = c.duration || '6 Weeks';
    const level = c.level || 'All Levels';
    const priceVal = typeof c.price === 'number' ? c.price : parseInt(String(c.price || '0').replace(/[^0-9]/g, ''), 10);
    const priceStr = priceVal === 0 ? 'FREE' : 'KES ' + (priceVal ? priceVal.toLocaleString() : '15,000');

    // Check if enrolled
    const enrollments = getEnrollmentsForActiveUser();
    const enr = enrollments.find(e => e.courseId === c.id);
    const isEnrolled = !!enr;
    const progressPercent = isEnrolled ? (enr.progressPercent || 0) : 0;

    const actionBtnHtml = isEnrolled
      ? `<a href="course-player.html?courseId=${c.id}" class="btn btn-primary btn-sm" style="white-space:nowrap; font-weight:700;">Continue &rarr;</a>`
      : `<a href="course-detail.html?id=${c.id}" class="btn btn-primary btn-sm" style="white-space:nowrap; font-weight:700;">Explore &rarr;</a>`;

    if (isListView) {
      return `
        <div class="lms-course-card lms-course-card-list" style="display:flex; flex-direction:row; flex-wrap:wrap; width:100%;">
          <div style="width:280px; min-height:180px; position:relative; background:#0F172A; flex-shrink:0;">
            <img src="${thumb}" alt="${c.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/course_assessment_mastery.jpg'" loading="lazy">
            <span class="lms-course-category-badge">${c.category || 'Education'}</span>
            ${c.cpd ? '<span class="lms-course-cpd-badge">CPD Verified</span>' : ''}
          </div>
          <div class="lms-course-body" style="padding:22px 26px; justify-content:space-between; flex:1; min-width:280px;">
            <div>
              <div class="lms-course-meta-top">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="lms-rating-stars">★ ${rating}</span>
                  <span class="lms-rating-count">(${reviews} reviews)</span>
                </div>
                <span class="lms-duration-tag">⏱️ ${duration}</span>
              </div>
              <h3 class="lms-course-title" style="font-size:19px;">${c.title}</h3>
              <p class="lms-course-desc" style="-webkit-line-clamp:3;">${c.description || ''}</p>
              <div class="lms-course-chips-row">
                <span class="lms-course-chip">🎯 ${level}</span>
                <span class="lms-course-chip instructor">👨‍🏫 ${c.instructor || 'Instructify Faculty'}</span>
                ${isEnrolled ? `<span class="lms-course-chip" style="background:#ECFDF5; color:#059669; font-weight:700;">✓ Enrolled (${progressPercent}%)</span>` : ''}
              </div>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid #F1F5F9; padding-top:14px; margin-top:12px;">
              <div class="lms-course-price-box">
                <span class="lms-course-price-label">Tuition / Access</span>
                <span class="lms-course-price-value ${priceVal === 0 ? 'free' : ''}">${priceStr}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" class="lms-bookmark-btn ${isSaved ? 'active' : ''}" data-course-id="${c.id}" onclick="toggleLmsBookmark('${c.id}', event)" aria-label="${isSaved ? 'Remove bookmark' : 'Bookmark course'}" title="${isSaved ? 'Remove bookmark' : 'Bookmark course'}" style="position:static;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
                ${actionBtnHtml}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="lms-course-card" data-course-id="${c.id}">
        <div class="lms-course-thumb-box">
          <img src="${thumb}" alt="${c.title}" class="lms-course-thumb-img" onerror="this.src='assets/images/course_assessment_mastery.jpg'" loading="lazy">
          <span class="lms-course-category-badge">${c.category || 'Education'}</span>
          ${c.cpd ? '<span class="lms-course-cpd-badge">CPD Verified</span>' : ''}
          <button type="button" class="lms-bookmark-btn ${isSaved ? 'active' : ''}" data-course-id="${c.id}" onclick="toggleLmsBookmark('${c.id}', event)" aria-label="${isSaved ? 'Remove bookmark' : 'Bookmark course'}" title="${isSaved ? 'Remove bookmark' : 'Bookmark course'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          </button>
        </div>

        <div class="lms-course-body">
          <div class="lms-course-meta-top">
            <div>
              <span class="lms-rating-stars">★ ${rating}</span>
              <span class="lms-rating-count">(${reviews})</span>
            </div>
            <span class="lms-duration-tag">⏱️ ${duration}</span>
          </div>

          <h3 class="lms-course-title">${c.title}</h3>
          <p class="lms-course-desc">${c.description || ''}</p>

          ${isEnrolled ? `
            <div class="lms-card-progress-wrap">
              <div class="lms-card-progress-labels">
                <span>Progress</span>
                <span>${progressPercent}%</span>
              </div>
              <div class="lms-card-progress-bar-bg">
                <div class="lms-card-progress-bar-fill" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          ` : ''}

          <div class="lms-course-chips-row">
            <span class="lms-course-chip">🎯 ${level}</span>
            <span class="lms-course-chip instructor">👨‍🏫 ${c.instructor ? c.instructor.split(' ')[0] + ' ' + (c.instructor.split(' ')[1] || '') : 'Educator'}</span>
          </div>
        </div>

        <div class="lms-course-footer">
          <div class="lms-course-price-box">
            <span class="lms-course-price-label">Fee</span>
            <span class="lms-course-price-value ${priceVal === 0 ? 'free' : ''}">${priceStr}</span>
          </div>
          <div style="display:flex; gap:6px;">
            ${actionBtnHtml}
          </div>
        </div>
      </div>
    `;
  }

  // ── Render Filtered Catalog ──────────────────────────────────
  function renderCatalog() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    let results = state.courses.filter(c => {
      // Search query
      if (state.filters.query) {
        const q = state.filters.query.toLowerCase().trim();
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const descMatch = (c.description || '').toLowerCase().includes(q);
        const instMatch = (c.instructor || '').toLowerCase().includes(q);
        const catMatch = (c.category || '').toLowerCase().includes(q);
        const tagsMatch = Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !instMatch && !catMatch && !tagsMatch) return false;
      }

      // Category filter
      if (state.filters.category !== 'all') {
        const cat = (c.category || '').toLowerCase();
        const target = state.filters.category.toLowerCase();
        if (!cat.includes(target) && !(target === 'curriculum' && cat.includes('cbe'))) {
          // Check tags as well
          const tagMatches = Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(target));
          if (!tagMatches) return false;
        }
      }

      // Skill level filter
      if (state.filters.level !== 'all') {
        const lvl = (c.level || '').toLowerCase();
        if (!lvl.includes(state.filters.level.toLowerCase())) return false;
      }

      // Duration filter
      if (state.filters.duration !== 'all') {
        const dur = (c.duration || '').toLowerCase();
        const weeks = parseInt(dur.replace(/[^0-9]/g, ''), 10) || 6;
        if (state.filters.duration === 'short' && weeks > 4) return false;
        if (state.filters.duration === 'medium' && (weeks <= 4 || weeks > 8)) return false;
        if (state.filters.duration === 'long' && weeks <= 8) return false;
      }

      // Pricing filter
      if (state.filters.pricing !== 'all') {
        const priceVal = typeof c.price === 'number' ? c.price : parseInt(String(c.price || '0').replace(/[^0-9]/g, ''), 10);
        if (state.filters.pricing === 'free' && priceVal > 0) return false;
        if (state.filters.pricing === 'paid' && priceVal === 0) return false;
      }

      // CPD filter
      if (state.filters.cpd && !c.cpd) return false;

      return true;
    });

    // Sorting
    if (state.filters.sort === 'rating') {
      results.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (state.filters.sort === 'price-low') {
      results.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (state.filters.sort === 'price-high') {
      results.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (state.filters.sort === 'newest') {
      results.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
    } else {
      // Popular (default)
      results.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    // Update count indicator
    const countEl = document.getElementById('catalog-count');
    if (countEl) {
      countEl.textContent = `Showing ${results.length} Course${results.length !== 1 ? 's' : ''}`;
    }

    if (results.length === 0) {
      grid.innerHTML = `
        <div class="lms-empty-state-box">
          <div class="lms-empty-icon">🔍</div>
          <h4 class="lms-empty-title">No courses match your filter criteria</h4>
          <p class="lms-empty-desc">Try clearing search terms or selecting "All Categories" to view available learning programs.</p>
          <button onclick="resetLmsFilters()" class="btn btn-outline btn-sm">Reset All Filters</button>
        </div>
      `;
      return;
    }

    const isList = state.viewMode === 'list';
    grid.innerHTML = results.map(c => createCourseCardHtml(c, isList)).join('');
  }

  // ── Render My Learning Tab Panels ────────────────────────────
  function renderMyLearning() {
    const container = document.getElementById('lms-mylearning-cards');
    if (!container) return;

    const enrollments = getEnrollmentsForActiveUser();
    let displayItems = [];

    if (state.myLearningSubtab === 'in-progress') {
      displayItems = enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100);
      if (displayItems.length === 0) {
        container.innerHTML = `
          <div class="lms-empty-state-box">
            <div class="lms-empty-icon">📖</div>
            <h4 class="lms-empty-title">No courses currently in progress</h4>
            <p class="lms-empty-desc">You are not actively taking any course right now. Browse our catalog to enroll in accredited CPD programs.</p>
            <button onclick="scrollToLmsCatalog()" class="btn btn-primary btn-sm">Browse Course Catalog &rarr;</button>
          </div>
        `;
        return;
      }
    } else if (state.myLearningSubtab === 'enrolled') {
      displayItems = enrollments;
      if (displayItems.length === 0) {
        container.innerHTML = `
          <div class="lms-empty-state-box">
            <div class="lms-empty-icon">🎓</div>
            <h4 class="lms-empty-title">You are not enrolled in any courses yet</h4>
            <p class="lms-empty-desc">Explore our CBC and digital pedagogy curriculum to enroll today.</p>
            <button onclick="scrollToLmsCatalog()" class="btn btn-primary btn-sm">Explore Courses &rarr;</button>
          </div>
        `;
        return;
      }
    } else if (state.myLearningSubtab === 'bookmarked') {
      const bookmarkedCourses = state.courses.filter(c => state.bookmarks.includes(c.id));
      if (bookmarkedCourses.length === 0) {
        container.innerHTML = `
          <div class="lms-empty-state-box">
            <div class="lms-empty-icon">🔖</div>
            <h4 class="lms-empty-title">No courses saved to bookmarks</h4>
            <p class="lms-empty-desc">Click the bookmark icon on any course card in the catalog to save it for quick access later.</p>
            <button onclick="scrollToLmsCatalog()" class="btn btn-outline btn-sm">Browse Catalog &rarr;</button>
          </div>
        `;
        return;
      }
      container.innerHTML = bookmarkedCourses.map(c => createCourseCardHtml(c, false)).join('');
      return;
    } else if (state.myLearningSubtab === 'completed') {
      displayItems = enrollments.filter(e => e.progressPercent === 100);
      if (displayItems.length === 0) {
        container.innerHTML = `
          <div class="lms-empty-state-box">
            <div class="lms-empty-icon">🏆</div>
            <h4 class="lms-empty-title">No completed courses yet</h4>
            <p class="lms-empty-desc">Complete all lessons, quizzes, and modules in an active course to earn your verified accreditation certificate.</p>
            <button onclick="switchMyLearningSubtab('in-progress')" class="btn btn-outline btn-sm">View Ongoing Courses &rarr;</button>
          </div>
        `;
        return;
      }
    } else if (state.myLearningSubtab === 'certificates') {
      renderCertificates(container);
      return;
    }

    // Render ongoing or enrolled cards with full resume actions
    container.innerHTML = displayItems.map(enr => {
      const course = state.courses.find(c => c.id === enr.courseId) || {
        title: 'Accredited Curriculum Program',
        description: 'Competency-based professional development.',
        instructor: 'Dr. Wanjiku Kamau',
        image: 'assets/images/course_assessment_mastery.jpg'
      };

      const percent = enr.progressPercent || 0;
      const lessonTitle = enr.currentLessonTitle || 'Module 1: Getting Started';
      const isComplete = percent >= 100;

      return `
        <div class="lms-ml-card">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span class="lms-badge ${isComplete ? 'badge-green' : 'badge-blue'}">${isComplete ? 'Completed' : 'In Progress'}</span>
              <span style="font-size:12px; color:var(--lms-text-muted);">Last active: ${enr.lastActiveAt ? 'Recent' : 'Today'}</span>
            </div>
            <h3 class="lms-course-title" style="font-size:17.5px; margin-bottom:6px;">${course.title}</h3>
            <div style="font-size:12.5px; color:#2145E6; font-weight:600; margin-bottom:14px;">
              📖 ${lessonTitle}
            </div>

            <div class="lms-card-progress-wrap" style="margin-bottom:16px;">
              <div class="lms-card-progress-labels">
                <span>Course Completion</span>
                <span style="color:#2145E6;">${percent}%</span>
              </div>
              <div class="lms-card-progress-bar-bg">
                <div class="lms-card-progress-bar-fill" style="width: ${percent}%;"></div>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:10px; align-items:center; justify-content:space-between; border-top:1px solid #F1F5F9; padding-top:14px;">
            <a href="course-player.html?courseId=${enr.courseId}" class="btn ${isComplete ? 'btn-outline' : 'btn-primary'} btn-sm" style="flex:1; text-align:center;">
              ${isComplete ? 'Review Course ↻' : 'Continue Lesson →'}
            </a>
            ${isComplete ? `
              <a href="student-certificates.html" class="btn btn-outline btn-sm" title="View Certificate" style="color:#059669; border-color:#059669;">
                🏆 Certificate
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Render Certificates ──────────────────────────────────────
  function renderCertificates(container) {
    container.innerHTML = DEFAULT_CERTIFICATES.map(cert => `
      <div class="lms-ml-card" style="border-left: 4px solid #10B981;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <span class="lms-badge badge-green">✓ Verified TSC &amp; KICD CPD</span>
            <span style="font-family:monospace; font-size:11px; color:#64748B;">${cert.id}</span>
          </div>
          <h3 class="lms-course-title" style="font-size:18px; margin-bottom:6px;">${cert.courseTitle}</h3>
          <p style="font-size:13px; color:#475569; margin-bottom:12px;">Issued on <strong>${cert.issueDate}</strong> with grade <strong>${cert.grade}</strong>.</p>
          <div style="font-size:12px; color:#059669; font-weight:600; margin-bottom:16px;">
            🏅 ${cert.accreditation}
          </div>
        </div>
        <div style="display:flex; gap:10px; border-top:1px solid #F1F5F9; padding-top:14px;">
          <a href="student-certificates.html" class="btn btn-primary btn-sm" style="flex:1; text-align:center;">View Certificate &rarr;</a>
          <button onclick="window.print()" class="btn btn-outline btn-sm">Print</button>
        </div>
      </div>
    `).join('');
  }

  // ── Subtab Switcher in My Learning ───────────────────────────
  window.switchMyLearningSubtab = function (subtab) {
    state.myLearningSubtab = subtab;
    document.querySelectorAll('.lms-ml-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtab);
    });
    renderMyLearning();
  };

  // ── LMS Top Navigation Tab Switcher ──────────────────────────
  window.switchLmsNavTab = function (tabName, optionalSubtab) {
    state.currentTab = tabName;

    // Update active nav links
    document.querySelectorAll('.lms-subnav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-tab') === tabName);
    });

    const homeOverview = document.getElementById('lms-overview-section');
    const myLearningSection = document.getElementById('lms-mylearning-section');
    const academiesSection = document.getElementById('academies-section');
    const catalogSection = document.getElementById('catalog-section');
    const adminSection = document.getElementById('lms-admin-studio-section');

    if (tabName === 'home') {
      if (homeOverview) homeOverview.style.display = 'block';
      if (myLearningSection) myLearningSection.style.display = 'none';
      if (academiesSection) academiesSection.style.display = 'block';
      if (catalogSection) catalogSection.style.display = 'block';
      if (adminSection) adminSection.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabName === 'my-learning') {
      if (homeOverview) homeOverview.style.display = 'none';
      if (myLearningSection) myLearningSection.style.display = 'block';
      if (academiesSection) academiesSection.style.display = 'none';
      if (catalogSection) catalogSection.style.display = 'none';
      if (adminSection) adminSection.style.display = 'none';
      if (optionalSubtab) {
        switchMyLearningSubtab(optionalSubtab);
      } else {
        renderMyLearning();
      }
      myLearningSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tabName === 'academies') {
      if (homeOverview) homeOverview.style.display = 'block';
      if (myLearningSection) myLearningSection.style.display = 'none';
      if (academiesSection) academiesSection.style.display = 'block';
      if (catalogSection) catalogSection.style.display = 'block';
      if (adminSection) adminSection.style.display = 'none';
      academiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tabName === 'admin') {
      if (adminSection) {
        adminSection.style.display = 'block';
        adminSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Quick Action Switcher Proxy
  window.switchLmsTab = function (tabName, subtab) {
    window.switchLmsNavTab(tabName, subtab);
  };

  window.scrollToLmsCatalog = function () {
    // Make sure catalog is visible
    const homeOverview = document.getElementById('lms-overview-section');
    const myLearningSection = document.getElementById('lms-mylearning-section');
    const catalogSection = document.getElementById('catalog-section');
    if (homeOverview) homeOverview.style.display = 'block';
    if (myLearningSection) myLearningSection.style.display = 'none';
    if (catalogSection) {
      catalogSection.style.display = 'block';
      catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ── Filter Controls API ──────────────────────────────────────
  window.setLmsFilter = function (key, value) {
    state.filters[key] = value;

    // Update active filter chip UI if applicable
    if (key === 'category') {
      document.querySelectorAll('.lms-filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-category') === value);
      });
    }

    renderCatalog();
  };

  window.toggleLmsCPD = function (chk) {
    state.filters.cpd = chk.checked;
    renderCatalog();
  };

  window.setLmsViewMode = function (mode) {
    state.viewMode = mode;
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);

    const btnGrid = document.getElementById('btn-view-grid');
    const btnList = document.getElementById('btn-view-list');
    const grid = document.getElementById('courses-grid');

    if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');
    if (btnList) btnList.classList.toggle('active', mode === 'list');

    if (grid) {
      if (mode === 'grid') {
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))';
        grid.style.gap = '24px';
      } else {
        grid.style.display = 'flex';
        grid.style.flexDirection = 'column';
        grid.style.gap = '18px';
      }
    }

    renderCatalog();
  };

  window.resetLmsFilters = function () {
    state.filters = {
      query: '',
      category: 'all',
      academy: 'all',
      level: 'all',
      duration: 'all',
      pricing: 'all',
      cpd: false,
      sort: 'popular'
    };

    const searchInput = document.getElementById('course-search');
    if (searchInput) searchInput.value = '';

    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    const cpdChk = document.getElementById('cpd-filter-chk');
    if (cpdChk) cpdChk.checked = false;

    const levelSelect = document.getElementById('lms-level-select');
    if (levelSelect) levelSelect.value = 'all';

    const durSelect = document.getElementById('lms-duration-select');
    if (durSelect) durSelect.value = 'all';

    const priceSelect = document.getElementById('lms-price-select');
    if (priceSelect) priceSelect.value = 'all';

    const sortSelect = document.getElementById('course-sort-select');
    if (sortSelect) sortSelect.value = 'popular';

    document.querySelectorAll('.lms-filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-category') === 'all');
    });

    renderAcademies();
    renderCatalog();
  };

  window.clearLmsSearch = function () {
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
    state.filters.query = '';
    renderCatalog();
  };

  window.executeSearch = function () {
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
      state.filters.query = searchInput.value.trim();
    }
    renderCatalog();
    scrollToLmsCatalog();
  };

  // ── Role Switcher for Evaluation / Admin Access ──────────────
  window.changeDemoRole = function (role) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE_OVERRIDE, role);
    initUserSession();
    renderWelcomeArea();
    updateRoleBasedNav();
    updateCounters();
    renderCatalog();
    if (state.currentTab === 'my-learning') renderMyLearning();
  };

  function updateRoleBasedNav() {
    const adminLink = document.getElementById('lms-nav-admin');
    const adminStudioSection = document.getElementById('lms-admin-studio-section');
    const roleSelect = document.getElementById('lms-role-select-box');

    const isEducatorOrAdmin = state.user && (state.user.role === 'admin' || state.user.role === 'trainer');

    if (adminLink) {
      adminLink.style.display = isEducatorOrAdmin ? 'inline-flex' : 'none';
    }
    if (adminStudioSection) {
      if (!isEducatorOrAdmin) adminStudioSection.style.display = 'none';
    }
    if (roleSelect && state.user) {
      roleSelect.value = state.user.role;
    }
  }

  // ── Featured Banner Manageability ────────────────────────────
  function loadFeaturedBanner() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FEATURED_BANNER);
      if (stored) {
        const data = JSON.parse(stored);
        const titleEl = document.getElementById('featured-banner-title');
        const descEl = document.getElementById('featured-banner-desc');
        if (titleEl && data.title) titleEl.textContent = data.title;
        if (descEl && data.desc) descEl.textContent = data.desc;
      }
    } catch (e) {
      console.warn('Could not load custom featured banner', e);
    }
  }

  window.editFeaturedBanner = function () {
    const newTitle = prompt('Enter Featured Program Title:', 'Digital Literacy for Educators Masterclass');
    if (!newTitle) return;
    const newDesc = prompt('Enter Featured Supporting Message:', 'Build practical skills, access educator-created courses, and learn at your own pace.');
    if (!newDesc) return;

    const data = { title: newTitle, desc: newDesc };
    localStorage.setItem(STORAGE_KEYS.FEATURED_BANNER, JSON.stringify(data));
    loadFeaturedBanner();
  };

  // ── Setup Real-Time Search Listeners ─────────────────────────
  function setupSearchListeners() {
    const searchInput = document.getElementById('course-search');
    const clearBtn = document.getElementById('search-clear-btn');
    let debounceTimer;

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (clearBtn) {
          clearBtn.style.display = val.length > 0 ? 'inline-flex' : 'none';
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.filters.query = val;
          renderCatalog();
        }, 200);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          executeSearch();
        }
      });
    }
  }

  // ── Public Initialization ────────────────────────────────────
  function init() {
    state.courses = getAllCourses();
    loadBookmarks();
    initUserSession();
    renderWelcomeArea();
    updateRoleBasedNav();
    loadFeaturedBanner();
    renderAcademies();
    renderCatalog();
    setupSearchListeners();

    // Check URL parameters (e.g. courses.html?category=Digital or courses.html?tab=my-learning)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    if (catParam) {
      state.filters.category = catParam;
      document.querySelectorAll('.lms-filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-category')?.toLowerCase() === catParam.toLowerCase());
      });
      renderCatalog();
    }

    const tabParam = urlParams.get('tab');
    if (tabParam) {
      switchLmsNavTab(tabParam);
    }
  }

  // Expose engine to global window
  window.LmsDashboard = {
    init,
    state,
    renderCatalog,
    renderMyLearning,
    updateCounters
  };

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
