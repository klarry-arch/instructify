/* ============================================================
   INSTRUCTIFY KENYA — STUDENT DASHBOARD & PROFILE LOGIC
   Handles Carousel, Category Filtering, Tool Search, Tab Navigation,
   Student Profile Modal, Accessibility Drawer, and Live Quizzes/Tools.
   ============================================================ */

'use strict';

// ── 1. Learning Tools Data Catalog ──────────────────────────────
window.STUDENT_TOOLS = [
  {
    id: 'interactive-video',
    title: 'Interactive Video',
    desc: 'Video lessons with integrated checkpoints',
    category: 'lessons',
    badge: 'Popular',
    badgeType: 'popular',
    icon: '🎬',
    color: 'blue',
    actionText: 'Launch Lesson'
  },
  {
    id: 'cbc-practical',
    title: 'CBC Practical Tasks',
    desc: 'Hands-on projects & portfolio guides',
    category: 'practical',
    badge: 'CBC Aligned',
    badgeType: 'cbc',
    icon: '🛠️',
    color: 'amber',
    actionText: 'Open Project'
  },
  {
    id: 'virtual-lab',
    title: 'Virtual Science Lab',
    desc: 'Interactive 3D physics & chemistry experiments',
    category: 'practical',
    badge: 'New',
    badgeType: 'new',
    icon: '🧪',
    color: 'cyan',
    actionText: 'Enter Lab'
  },
  {
    id: 'live-quiz',
    title: 'Live Quiz Arena',
    desc: 'Speed challenges & leaderboard battles',
    category: 'quizzes',
    badge: 'Popular',
    badgeType: 'popular',
    icon: '⚡',
    color: 'purple',
    actionText: 'Start Quiz'
  },
  {
    id: 'ai-study-buddy',
    title: 'AI Study Buddy',
    desc: '24/7 instant homework helper & tutor',
    category: 'revision',
    badge: 'AI Powered',
    badgeType: 'ai',
    icon: '🤖',
    color: 'indigo',
    actionText: 'Ask Buddy'
  },
  {
    id: 'flashcards',
    title: 'Flashcard Decks',
    desc: 'Spaced repetition memorization drills',
    category: 'revision',
    badge: 'Popular',
    badgeType: 'popular',
    icon: '🎴',
    color: 'pink',
    actionText: 'Flip Cards'
  },
  {
    id: 'past-papers',
    title: 'Past Paper Bank',
    desc: 'KCSE & CBC national assessment drills',
    category: 'revision',
    badge: 'Popular',
    badgeType: 'popular',
    icon: '📝',
    color: 'orange',
    actionText: 'Practice Now'
  },
  {
    id: 'mind-maps',
    title: 'Visual Mind Maps',
    desc: 'Concept breakdowns & memory diagrams',
    category: 'resources',
    badge: 'New',
    badgeType: 'new',
    icon: '🧠',
    color: 'pink',
    actionText: 'Explore Map'
  },
  {
    id: 'topic-summary',
    title: 'Topic Summaries',
    desc: 'Quick revision sheets & formula cards',
    category: 'resources',
    badge: 'New',
    badgeType: 'new',
    icon: '📑',
    color: 'green',
    actionText: 'Read Summary'
  },
  {
    id: 'math-solver',
    title: 'Math Step Solver',
    desc: 'Step-by-step algebra & geometry walkthroughs',
    category: 'lessons',
    badge: 'Popular',
    badgeType: 'popular',
    icon: '📐',
    color: 'blue',
    actionText: 'Solve Problem'
  },
  {
    id: 'audio-podcasts',
    title: 'Audio Lessons',
    desc: 'Kenyan curriculum audio guides & stories',
    category: 'resources',
    badge: 'New',
    badgeType: 'new',
    icon: '🎧',
    color: 'orange',
    actionText: 'Listen Now'
  },
  {
    id: 'language-lab',
    title: 'Language Lab',
    desc: 'English & Kiswahili Insha / Composition master',
    category: 'lessons',
    badge: 'CBC Aligned',
    badgeType: 'cbc',
    icon: '🗣️',
    color: 'purple',
    actionText: 'Start Session'
  },
  {
    id: 'assignments-hub',
    title: 'Homework Tracker',
    desc: 'Manage deadlines & direct tutor feedback',
    category: 'assignments',
    badge: 'Active',
    badgeType: 'cbc',
    icon: '📋',
    color: 'cyan',
    actionText: 'View Tasks'
  },
  {
    id: 'subjects-portal',
    title: 'Subject Hub',
    desc: 'Curriculum syllabus & textbook chapters',
    category: 'subjects',
    badge: 'Core',
    badgeType: 'popular',
    icon: '📚',
    color: 'blue',
    actionText: 'View Subjects'
  },
  {
    id: 'tutor-qa',
    title: 'Ask a Teacher',
    desc: 'Direct Q&A with TSC verified educators',
    category: 'resources',
    badge: 'Support',
    badgeType: 'ai',
    icon: '👨‍🏫',
    color: 'amber',
    actionText: 'Ask Question'
  },
  {
    id: 'gamified-quests',
    title: 'XP Quests & Badges',
    desc: 'Earn rewards, unlock trophies & streaks',
    category: 'quizzes',
    badge: 'Reward',
    badgeType: 'new',
    icon: '🏆',
    color: 'green',
    actionText: 'View Quests'
  }
];

// ── 2. Carousel Controller ──────────────────────────────────────
class StudentBannerCarousel {
  constructor() {
    this.slides = document.querySelectorAll('.student-carousel-slide');
    this.dots = document.querySelectorAll('.student-carousel-dot');
    this.currentIndex = 0;
    this.timer = null;
    this.isPaused = false;
    this.init();
  }

  init() {
    if (!this.slides.length) return;

    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');
    const dismissBtn = document.getElementById('carousel-dismiss-btn');
    const carouselBox = document.getElementById('student-banner-carousel');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    if (dismissBtn && carouselBox) {
      dismissBtn.addEventListener('click', () => {
        carouselBox.style.display = 'none';
        sessionStorage.setItem('ik_student_banner_dismissed', 'true');
      });
      if (sessionStorage.getItem('ik_student_banner_dismissed') === 'true') {
        carouselBox.style.display = 'none';
      }
    }

    this.dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => this.goTo(idx));
    });

    if (carouselBox) {
      carouselBox.addEventListener('mouseenter', () => this.pause());
      carouselBox.addEventListener('mouseleave', () => this.resume());
    }

    this.startAutoPlay();
  }

  showSlide(index) {
    this.slides.forEach((s, i) => s.classList.toggle('active', i === index));
    this.dots.forEach((d, i) => d.classList.toggle('active', i === index));
    this.currentIndex = index;
  }

  next() {
    const nextIdx = (this.currentIndex + 1) % this.slides.length;
    this.showSlide(nextIdx);
  }

  prev() {
    const prevIdx = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prevIdx);
  }

  goTo(idx) {
    this.showSlide(idx);
    this.restartAutoPlay();
  }

  startAutoPlay() {
    this.timer = setInterval(() => {
      if (!this.isPaused) this.next();
    }, 6000);
  }

  pause() { this.isPaused = true; }
  resume() { this.isPaused = false; }

  restartAutoPlay() {
    clearInterval(this.timer);
    this.startAutoPlay();
  }
}

// ── 3. Tool Grid & Filter Controller ────────────────────────────
class StudentToolsEngine {
  constructor() {
    this.container = document.getElementById('student-tools-grid');
    this.pills = document.querySelectorAll('.student-pill-btn');
    this.searchInput = document.getElementById('tool-search-input');
    this.topSearchInput = document.getElementById('global-student-search');
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.init();
  }

  init() {
    if (!this.container) return;

    this.render();

    this.pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategory = pill.getAttribute('data-category') || 'all';
        this.render();
      });
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    if (this.topSearchInput) {
      this.topSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (this.searchInput) this.searchInput.value = this.searchQuery;
        this.render();
      });
    }
  }

  render() {
    if (!this.container) return;

    const filtered = window.STUDENT_TOOLS.filter(tool => {
      const matchCat = this.activeCategory === 'all' || 
                       tool.category === this.activeCategory ||
                       (this.activeCategory === 'subjects' && tool.category === 'subjects');
      const matchQuery = !this.searchQuery ||
                         tool.title.toLowerCase().includes(this.searchQuery) ||
                         tool.desc.toLowerCase().includes(this.searchQuery);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 32px; text-align: center; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 16px;">
          <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
          <div style="font-size: 15px; font-weight: 700; color: #0F172A;">No matching learning tools found</div>
          <div style="font-size: 13px; color: #64748B; margin-top: 4px;">Try searching for "Quiz", "Lab", "Video", or select "All".</div>
          <button onclick="window.studentToolsEngine.resetFilter()" class="btn btn-outline btn-sm mt-md">Reset Filters</button>
        </div>
      `;
      return;
    }

    this.container.innerHTML = filtered.map(tool => `
      <div class="student-tool-card" onclick="window.openStudentToolModal('${tool.id}')" role="button" tabindex="0">
        <span class="student-tool-badge ${tool.badgeType}">${tool.badge}</span>
        <div class="student-tool-icon-bubble ${tool.color}">${tool.icon}</div>
        <div class="student-tool-title">${tool.title}</div>
        <div class="student-tool-desc">${tool.desc}</div>
      </div>
    `).join('') + `
      <div class="student-tool-card student-all-tools-card" onclick="window.showToast('Showing all 24+ Kenyan CBC learning tools!','info')" role="button" tabindex="0">
        <div class="student-tool-icon-bubble indigo">✨</div>
        <div class="student-tool-title" style="color: var(--student-primary);">All 24+ Tools</div>
        <div class="student-tool-desc">Explore full repository</div>
      </div>
    `;
  }

  resetFilter() {
    this.activeCategory = 'all';
    this.searchQuery = '';
    if (this.searchInput) this.searchInput.value = '';
    if (this.topSearchInput) this.topSearchInput.value = '';
    this.pills.forEach((p, idx) => p.classList.toggle('active', idx === 0));
    this.render();
  }
}

// ── 4. Interactive Tool Simulator Modal ─────────────────────────
window.openStudentToolModal = function(toolId) {
  const tool = window.STUDENT_TOOLS.find(t => t.id === toolId);
  if (!tool) return;

  const modalBackdrop = document.getElementById('student-tool-modal');
  const titleElem = document.getElementById('modal-tool-title');
  const iconElem = document.getElementById('modal-tool-icon');
  const contentElem = document.getElementById('modal-tool-content');

  if (!modalBackdrop || !titleElem || !contentElem) {
    window.showToast(`Opening ${tool.title}...`, 'info');
    return;
  }

  titleElem.textContent = tool.title;
  if (iconElem) iconElem.textContent = tool.icon;

  if (toolId === 'flashcards') {
    contentElem.innerHTML = `
      <div style="text-align:center; padding:16px 0;">
        <div class="badge badge-primary" style="margin-bottom:12px;">Junior Secondary • Integrated Science</div>
        <div id="flashcard-box" onclick="this.classList.toggle('flipped')" style="background:linear-gradient(135deg,#EEF2FF,#F8FAFC); border:2px solid #CBD5E1; border-radius:18px; padding:36px 24px; min-height:160px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 6px 16px rgba(0,0,0,0.06); transition:transform 0.3s ease;">
          <div style="font-size:12px; font-weight:700; color:#64748B; margin-bottom:8px;">QUESTION (Click to flip)</div>
          <div style="font-size:17px; font-weight:800; color:#0F172A;" id="fc-q">What are the three main states of matter and how do particle arrangements differ?</div>
          <div style="font-size:14px; font-weight:600; color:#2145E6; display:none; margin-top:12px;" id="fc-a">Solid (tightly packed, fixed shape), Liquid (close, flows), Gas (widely spaced, high energy).</div>
        </div>
        <div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
          <button onclick="window.prevFlashcard()" class="btn btn-outline btn-sm">⬅ Previous</button>
          <button onclick="window.flipCardManual()" class="btn btn-blue btn-sm">🔄 Flip Card</button>
          <button onclick="window.nextFlashcard()" class="btn btn-primary btn-sm">Next ➡</button>
        </div>
      </div>
    `;
  } else if (toolId === 'live-quiz') {
    contentElem.innerHTML = `
      <div style="padding:10px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <span class="badge badge-success">CBC Mathematics • Grade 9</span>
          <span style="font-weight:800; color:#FF4D00; font-size:14px;">⏱ 00:45s</span>
        </div>
        <h4 style="font-size:16px; font-weight:800; color:#0F172A; margin-bottom:16px;">
          Question 1: If 2x + 6 = 18, what is the value of x?
        </h4>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          <button onclick="window.checkQuizAnswer(this, false)" class="student-quiz-option" style="padding:12px 16px; border:1.5px solid #CBD5E1; border-radius:12px; background:#F8FAFC; text-align:left; font-weight:600; cursor:pointer; transition:all 0.2s;">A) x = 4</button>
          <button onclick="window.checkQuizAnswer(this, true)" class="student-quiz-option" style="padding:12px 16px; border:1.5px solid #CBD5E1; border-radius:12px; background:#F8FAFC; text-align:left; font-weight:600; cursor:pointer; transition:all 0.2s;">B) x = 6</button>
          <button onclick="window.checkQuizAnswer(this, false)" class="student-quiz-option" style="padding:12px 16px; border:1.5px solid #CBD5E1; border-radius:12px; background:#F8FAFC; text-align:left; font-weight:600; cursor:pointer; transition:all 0.2s;">C) x = 8</button>
          <button onclick="window.checkQuizAnswer(this, false)" class="student-quiz-option" style="padding:12px 16px; border:1.5px solid #CBD5E1; border-radius:12px; background:#F8FAFC; text-align:left; font-weight:600; cursor:pointer; transition:all 0.2s;">D) x = 12</button>
        </div>
      </div>
    `;
  } else if (toolId === 'ai-study-buddy') {
    contentElem.innerHTML = `
      <div style="display:flex; flex-direction:column; height:340px;">
        <div style="flex:1; overflow-y:auto; padding:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:14px; margin-bottom:12px;" id="ai-chat-box">
          <div style="display:flex; gap:8px; margin-bottom:12px;">
            <div style="width:28px; height:28px; border-radius:50%; background:#2145E6; color:#FFF; display:flex; align-items:center; justify-content:center; font-size:14px;">🤖</div>
            <div style="background:#FFFFFF; border:1px solid #CBD5E1; padding:10px 14px; border-radius:14px; font-size:13px; color:#0F172A; max-width:80%;">
              Jambo James! I am your Instructify AI Study Buddy. Ask me any homework question, concept explanation, or revision quiz for CBC & KCSE!
            </div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" id="ai-study-input" placeholder="e.g. Explain photosynthesis or solve quadratic equations..." style="flex:1; height:42px; padding:0 14px; border:1.5px solid #CBD5E1; border-radius:999px; outline:none; font-size:13px;" onkeypress="if(event.key==='Enter') window.sendStudyBuddyMsg()">
          <button onclick="window.sendStudyBuddyMsg()" class="btn btn-primary btn-sm" style="border-radius:999px; padding:0 18px;">Send</button>
        </div>
      </div>
    `;
  } else if (toolId === 'virtual-lab') {
    contentElem.innerHTML = `
      <div style="text-align:center; padding:18px 0;">
        <div style="background:linear-gradient(135deg, #0F172A, #1E293B); border-radius:16px; padding:28px 20px; color:#FFFFFF; margin-bottom:18px;">
          <div style="font-size:36px; margin-bottom:10px;">🔬</div>
          <h4 style="font-size:17px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">Virtual Microscope & Chemical Reaction Simulator</h4>
          <p style="font-size:13px; color:#94A3B8; margin-bottom:16px;">Calibrate magnification and combine solutions in real-time safety simulation.</p>
          <div style="display:inline-flex; gap:10px;">
            <button onclick="window.showToast('Microscope calibrated to 400x magnification. Specimen: Plant Epidermal Cells.','success')" class="btn btn-blue btn-sm">🔬 Adjust Magnification</button>
            <button onclick="window.showToast('Testing Iodine Starch Reaction: Positive (Blue-Black Color).','info')" class="btn btn-outline btn-sm" style="color:#FFF !important; border-color:#FFF;">🧪 Add Iodine Solution</button>
          </div>
        </div>
      </div>
    `;
  } else {
    contentElem.innerHTML = `
      <div style="padding:16px 0; text-align:center;">
        <div style="font-size:40px; margin-bottom:12px;">${tool.icon}</div>
        <h4 style="font-size:17px; font-weight:800; color:#0F172A; margin-bottom:6px;">${tool.title}</h4>
        <p style="font-size:13.5px; color:#64748B; margin-bottom:20px;">${tool.desc}</p>
        <button onclick="window.showToast('${tool.title} module launched successfully!','success'); window.closeStudentModal('student-tool-modal');" class="btn btn-primary btn-md">Start Learning Activity</button>
      </div>
    `;
  }

  modalBackdrop.classList.add('active');
};

window.flipCardManual = function() {
  const q = document.getElementById('fc-q');
  const a = document.getElementById('fc-a');
  if (q && a) {
    const isShowingQ = q.style.display !== 'none';
    q.style.display = isShowingQ ? 'none' : 'block';
    a.style.display = isShowingQ ? 'block' : 'none';
  }
};

window.nextFlashcard = function() {
  const q = document.getElementById('fc-q');
  const a = document.getElementById('fc-a');
  if (q && a) {
    q.textContent = 'Define Osmosis and give one biological example in plants.';
    a.textContent = 'Movement of water molecules from low solute to high solute concentration across a semi-permeable membrane. Example: Root hair absorption.';
    q.style.display = 'block';
    a.style.display = 'none';
    window.showToast('Next card loaded!', 'info');
  }
};

window.prevFlashcard = function() {
  const q = document.getElementById('fc-q');
  const a = document.getElementById('fc-a');
  if (q && a) {
    q.textContent = 'What are the three main states of matter and how do particle arrangements differ?';
    a.textContent = 'Solid (tightly packed, fixed shape), Liquid (close, flows), Gas (widely spaced, high energy).';
    q.style.display = 'block';
    a.style.display = 'none';
  }
};

window.checkQuizAnswer = function(btn, isCorrect) {
  const allBtns = document.querySelectorAll('.student-quiz-option');
  allBtns.forEach(b => {
    b.disabled = true;
    b.style.opacity = '0.7';
  });
  if (isCorrect) {
    btn.style.background = '#DCFCE7';
    btn.style.borderColor = '#16A34A';
    btn.style.color = '#166534';
    window.showToast('🎉 Correct! 2x + 6 = 18 => 2x = 12 => x = 6. (+20 XP)', 'success');
  } else {
    btn.style.background = '#FEE2E2';
    btn.style.borderColor = '#DC2626';
    btn.style.color = '#991B1B';
    window.showToast('Not quite! 2x + 6 = 18 => 2x = 12 => x = 6. Try again!', 'error');
  }
};

window.sendStudyBuddyMsg = function() {
  const input = document.getElementById('ai-study-input');
  const chatBox = document.getElementById('ai-chat-box');
  if (!input || !chatBox || !input.value.trim()) return;

  const msg = input.value.trim();
  chatBox.innerHTML += `
    <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
      <div style="background:#2145E6; color:#FFF; padding:8px 14px; border-radius:14px; font-size:13px; max-width:80%;">
        ${msg}
      </div>
    </div>
  `;
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    chatBox.innerHTML += `
      <div style="display:flex; gap:8px; margin-bottom:10px;">
        <div style="width:28px; height:28px; border-radius:50%; background:#2145E6; color:#FFF; display:flex; align-items:center; justify-content:center; font-size:14px;">🤖</div>
        <div style="background:#FFFFFF; border:1px solid #CBD5E1; padding:10px 14px; border-radius:14px; font-size:13px; color:#0F172A; max-width:80%;">
          Great question! In the Kenyan CBC curriculum, focus on identifying key steps and real-world applications. Here is your targeted summary: Remember to practice with past paper drills!
        </div>
      </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 700);
};

window.closeStudentModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

// ── 5. Sidebar Navigation & Tab Switcher ─────────────────────────
window.switchStudentTab = function(linkElem, tabKey) {
  // Update sidebar active link
  document.querySelectorAll('.student-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  if (linkElem) linkElem.classList.add('active');

  // Hide all panels
  document.querySelectorAll('.student-tab-panel').forEach(panel => {
    panel.style.display = 'none';
  });

  // Show target panel
  const target = document.getElementById(`tab-panel-${tabKey}`);
  if (target) {
    target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Close mobile sidebar if open
  window.toggleStudentMobileSidebar(false);
};

// Sidebar Collapse / Expand Toggle
window.toggleStudentSidebarCollapse = function() {
  const sidebar = document.getElementById('student-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('ik_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }
};

// Mobile Drawer Toggle
window.toggleStudentMobileSidebar = function(forceState) {
  const sidebar = document.getElementById('student-sidebar');
  const overlay = document.getElementById('student-sidebar-overlay');
  if (!sidebar || !overlay) return;

  const shouldOpen = forceState !== undefined ? forceState : !sidebar.classList.contains('mobile-open');
  if (shouldOpen) {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
  } else {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  }
};

// ── 6. Dropdowns & Popovers Controller ──────────────────────────
window.toggleStudentProfileDropdown = function() {
  const menu = document.getElementById('student-profile-dropdown');
  const notifMenu = document.getElementById('student-notif-popover');
  if (notifMenu) notifMenu.classList.remove('active');
  if (menu) menu.classList.toggle('active');
};

window.toggleStudentNotifPopover = function() {
  const notifMenu = document.getElementById('student-notif-popover');
  const profileMenu = document.getElementById('student-profile-dropdown');
  if (profileMenu) profileMenu.classList.remove('active');
  if (notifMenu) notifMenu.classList.toggle('active');
};

// Global click outside to close dropdowns
document.addEventListener('click', (e) => {
  const profileDropdown = document.getElementById('student-profile-dropdown');
  const profileTrigger = document.getElementById('student-profile-trigger');
  if (profileDropdown && profileDropdown.classList.contains('active')) {
    if (!profileDropdown.contains(e.target) && (!profileTrigger || !profileTrigger.contains(e.target))) {
      profileDropdown.classList.remove('active');
    }
  }

  const notifPopover = document.getElementById('student-notif-popover');
  const notifTrigger = document.getElementById('student-notif-trigger');
  if (notifPopover && notifPopover.classList.contains('active')) {
    if (!notifPopover.contains(e.target) && (!notifTrigger || !notifTrigger.contains(e.target))) {
      notifPopover.classList.remove('active');
    }
  }
});

// ── 7. Profile & Accessibility Modals ───────────────────────────
window.openStudentProfileModal = function() {
  const modal = document.getElementById('student-profile-modal');
  if (modal) modal.classList.add('active');
  const dropdown = document.getElementById('student-profile-dropdown');
  if (dropdown) dropdown.classList.remove('active');
};

window.openAccessibilityModal = function() {
  const modal = document.getElementById('student-a11y-modal');
  if (modal) modal.classList.add('active');
  const dropdown = document.getElementById('student-profile-dropdown');
  if (dropdown) dropdown.classList.remove('active');
};

window.toggleAccessibilitySetting = function(settingKey, isChecked) {
  if (settingKey === 'high-contrast') {
    document.body.classList.toggle('mode-high-contrast', isChecked);
    localStorage.setItem('ik_a11y_high_contrast', isChecked ? 'true' : 'false');
  } else if (settingKey === 'dyslexia-font') {
    document.body.classList.toggle('mode-dyslexic', isChecked);
    localStorage.setItem('ik_a11y_dyslexia', isChecked ? 'true' : 'false');
  } else if (settingKey === 'reduced-motion') {
    document.body.classList.toggle('reduce-motion', isChecked);
    localStorage.setItem('ik_a11y_motion', isChecked ? 'true' : 'false');
  }
  window.showToast('Accessibility preferences updated', 'success');
};

// ── 8. Initialization on DOM Load ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Load sidebar collapse preference
  if (localStorage.getItem('ik_sidebar_collapsed') === 'true') {
    const sidebar = document.getElementById('student-sidebar');
    if (sidebar && window.innerWidth > 768) sidebar.classList.add('collapsed');
  }

  // Load A11y settings
  if (localStorage.getItem('ik_a11y_high_contrast') === 'true') {
    document.body.classList.add('mode-high-contrast');
    const toggle = document.getElementById('toggle-high-contrast');
    if (toggle) toggle.checked = true;
  }
  if (localStorage.getItem('ik_a11y_dyslexia') === 'true') {
    document.body.classList.add('mode-dyslexic');
    const toggle = document.getElementById('toggle-dyslexia');
    if (toggle) toggle.checked = true;
  }

  // Init Carousel & Tools
  window.studentBannerCarousel = new StudentBannerCarousel();
  window.studentToolsEngine = new StudentToolsEngine();

  // Keyboard shortcut '/' for search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const search = document.getElementById('global-student-search');
      if (search) search.focus();
    }
  });

  // Sync user info from session if present
  const session = window.getSession ? window.getSession() : null;
  if (session && session.name) {
    const firstName = session.name.split(' ')[0];
    const initial = session.avatar || session.name.slice(0, 2).toUpperCase();
    
    document.querySelectorAll('.student-user-name-text').forEach(el => el.textContent = session.name);
    document.querySelectorAll('.student-user-first-name').forEach(el => el.textContent = firstName);
    document.querySelectorAll('.student-user-avatar-text').forEach(el => el.textContent = initial);
  }
});
