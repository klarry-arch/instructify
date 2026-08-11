const fs = require('fs');
const path = require('path');

const dir = 'c:\\instructify';

// Get standard head from courses.html
const coursesHtml = fs.readFileSync(path.join(dir, 'courses.html'), 'utf8');
const headEnd = coursesHtml.indexOf('</head>') + 7;
const headHtml = coursesHtml.substring(0, headEnd);

// --- 1. LOGIN.HTML ---
const loginHtml = `
${headHtml.replace('<title>Courses', '<title>Student Login')}
<body style="background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 2rem;">

  <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 3rem 2rem; width: 100%; max-width: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
    <img src="assets/images/logo.png" alt="Instructify Kenya Logo" style="height: 60px; margin-bottom: 2rem; display: block; margin-left: auto; margin-right: auto;">
    
    <h1 style="font-family: var(--font-heading); color: #111827; font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem;">Welcome Back</h1>
    <p style="color: #6b7280; font-size: 0.95rem; margin-bottom: 2rem;">Sign in to your Instructify Learning Portal</p>
    
    <form id="login-form" style="text-align: left;">
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">Email Address</label>
        <input type="email" required value="student@example.com" style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none; transition: border-color 0.2s;">
      </div>
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label style="font-weight: 600; color: #374151; font-size: 0.9rem;">Password</label>
          <a href="#" style="color: #1d4ed8; font-size: 0.8rem; text-decoration: none; font-weight: 600;">Forgot password?</a>
        </div>
        <input type="password" required value="password123" style="width: 100%; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 8px; outline: none; transition: border-color 0.2s;">
      </div>
      
      <button type="submit" style="width: 100%; padding: 0.9rem; background: #1d4ed8; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 6px rgba(29, 78, 216, 0.2); transition: 0.2s;">
        Sign In
      </button>
    </form>
    
    <p style="margin-top: 2rem; color: #6b7280; font-size: 0.9rem;">Don't have an account? <a href="courses.html" style="color: #ea580c; font-weight: 700; text-decoration: none;">Browse Courses</a></p>
  </div>

  <script>
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      // Simulate login
      localStorage.setItem('instructify_logged_in', 'true');
      window.location.href = 'student-dashboard.html';
    });
  </script>
</body>
`;
fs.writeFileSync(path.join(dir, 'login.html'), loginHtml);

// --- 2. STUDENT-DASHBOARD.HTML ---
const dashboardHtml = `
${headHtml.replace('<title>Courses', '<title>My Dashboard')}
<body style="background: #f9fafb;">
  <!-- LMS Navbar -->
  <nav style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100;">
    <a href="index.html" style="display: flex; align-items: center; text-decoration: none;">
      <img src="assets/images/logo.png" style="height: 40px; margin-right: 12px;">
      <div style="line-height: 1.1;"><span style="font-weight: 800; font-size: 1.1rem; color: #111827;">Instructify</span><span style="display:block; font-size: 0.65rem; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 1px;">Kenya</span></div>
    </a>
    <div style="display: flex; align-items: center; gap: 1.5rem;">
      <a href="courses.html" style="color: #4b5563; font-weight: 600; text-decoration: none;">Explore Catalog</a>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <div style="width: 36px; height: 36px; background: #1d4ed8; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">JD</div>
        <span style="font-weight: 600; color: #111827;">Student</span>
      </div>
    </div>
  </nav>

  <div class="container" style="padding: 3rem 0; max-width: 1200px; margin: 0 auto;">
    <div style="margin-bottom: 2rem;">
      <h1 style="font-family: var(--font-heading); color: #111827; font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">My Learning</h1>
      <p style="color: #6b7280; font-size: 1.1rem;">Pick up right where you left off.</p>
    </div>

    <!-- Enrolled Courses Grid -->
    <div id="enrolled-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem;">
      <!-- Populated by JS -->
    </div>
  </div>

  <script src="js/courses.js"></script>
  <script>
    if (!localStorage.getItem('instructify_logged_in')) {
      window.location.href = 'login.html';
    }

    const data = JSON.parse(localStorage.getItem('instructify_enrollments') || '[]');
    // Filter for confirmed or just show all for demo purposes
    // We will show all so the user can see them immediately after checkout
    const enrolledGrid = document.getElementById('enrolled-grid');

    if (data.length === 0) {
      enrolledGrid.innerHTML = \`
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; background: white; border-radius: 12px; border: 1px dashed #d1d5db;">
          <h3 style="color:#111827;margin-bottom:0.5rem; font-size: 1.25rem;">You haven't enrolled in any courses yet.</h3>
          <p style="color:#6b7280; margin-bottom: 1.5rem;">Ready to start learning? Explore our catalog.</p>
          <a href="courses.html" class="btn" style="background: #ea580c; color: white; padding: 0.8rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700;">Browse Courses</a>
        </div>
      \`;
    } else {
      enrolledGrid.innerHTML = data.map(enr => {
        // Find full course data from window.COURSES to get image/details if needed
        const courseData = window.COURSES ? window.COURSES.find(c => c.title === enr.courseTitle) : null;
        
        return \`
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="height: 160px; background: #1d4ed8; position: relative; display: flex; align-items: center; justify-content: center; padding: 2rem; text-align: center;">
              <h3 style="color: white; font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">\${enr.courseTitle}</h3>
              <div style="position: absolute; bottom: 0; left: 0; height: 4px; background: #e5e7eb; width: 100%;">
                <div style="height: 100%; background: #ea580c; width: \${Math.floor(Math.random() * 40 + 10)}%;"></div>
              </div>
            </div>
            <div style="padding: 1.5rem; display: flex; flex-direction: column; flex: 1;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.85rem;">
                <span style="color: #6b7280;">Format: <strong>\${enr.format}</strong></span>
                <span style="color: \${enr.status.includes('Confirmed') ? '#0d8a57' : '#ea580c'}; font-weight: 700;">\${enr.status}</span>
              </div>
              <a href="course-player.html?course=\${encodeURIComponent(enr.courseTitle)}" style="margin-top: auto; width: 100%; padding: 0.75rem; background: #f3f4f6; color: #111827; border-radius: 8px; text-align: center; text-decoration: none; font-weight: 700; border: 1px solid #d1d5db; transition: 0.2s;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                Go to Course
              </a>
            </div>
          </div>
        \`;
      }).join('');
    }
  </script>
</body>
`;
fs.writeFileSync(path.join(dir, 'student-dashboard.html'), dashboardHtml);

// --- 3. COURSE-PLAYER.HTML ---
const playerHtml = `
${headHtml.replace('<title>Courses', '<title>Course Player')}
<style>
  .player-layout { display: grid; grid-template-columns: 320px 1fr; height: 100vh; overflow: hidden; }
  .player-sidebar { background: white; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; }
  .player-main { background: #f9fafb; overflow-y: auto; display: flex; flex-direction: column; }
  .module-header { padding: 1rem; border-bottom: 1px solid #e5e7eb; cursor: pointer; background: #f9fafb; font-weight: 700; color: #374151; display: flex; justify-content: space-between; align-items: center; }
  .lesson-item { padding: 0.75rem 1rem 0.75rem 2rem; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-size: 0.9rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
  .lesson-item:hover { background: #dbeafe; color: #1d4ed8; }
  .lesson-item.active { background: #e5f6ed; color: #0d8a57; font-weight: 600; border-left: 4px solid #0d8a57; padding-left: calc(2rem - 4px); }
</style>
<body style="margin: 0;">
  
  <div class="player-layout">
    
    <!-- Sidebar -->
    <aside class="player-sidebar">
      <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb; background: #111827;">
        <a href="student-dashboard.html" style="color: #9ca3af; text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 4px; margin-bottom: 0.5rem;">← Back to Dashboard</a>
        <h2 id="player-course-title" style="color: white; font-size: 1.1rem; font-family: var(--font-heading); margin: 0; line-height: 1.3;">Loading Course...</h2>
      </div>
      
      <div style="flex: 1; overflow-y: auto;">
        
        <div class="module">
          <div class="module-header">Module 1: Introduction <span>▼</span></div>
          <div class="lesson-item active">🎥 Welcome & Overview</div>
          <div class="lesson-item">📄 Course Syllabus</div>
        </div>

        <div class="module">
          <div class="module-header">Module 2: Core Concepts <span>▼</span></div>
          <div class="lesson-item">🎥 Foundation Principles</div>
          <div class="lesson-item">🎥 Practical Examples</div>
          <div class="lesson-item">📝 Module 2 Quiz</div>
        </div>

        <div class="module">
          <div class="module-header">Module 3: Advanced Application <span>▼</span></div>
          <div class="lesson-item">🎥 Integrating into Practice</div>
          <div class="lesson-item">📄 Assignment Brief</div>
        </div>

      </div>
    </aside>

    <!-- Main Content -->
    <main class="player-main">
      <div style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center;">
        <h1 style="font-family: var(--font-heading); color: #111827; font-size: 1.25rem; margin: 0;">Welcome & Overview</h1>
        <button style="background: #ea580c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 700; cursor: pointer;">Next Lesson →</button>
      </div>

      <div style="padding: 2rem; max-width: 900px; margin: 0 auto; width: 100%;">
        
        <!-- Mock Video Player -->
        <div style="width: 100%; aspect-ratio: 16/9; background: black; border-radius: 12px; overflow: hidden; position: relative; margin-bottom: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="width: 0; height: 0; border-top: 15px solid transparent; border-bottom: 15px solid transparent; border-left: 25px solid white; margin-left: 5px;"></div>
          </div>
          <div style="position: absolute; bottom: 0; width: 100%; height: 50px; background: linear-gradient(transparent, rgba(0,0,0,0.7)); display: flex; align-items: center; padding: 0 1rem; box-sizing: border-box;">
            <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px;">
              <div style="width: 30%; height: 100%; background: #ea580c; border-radius: 2px;"></div>
            </div>
          </div>
        </div>

        <div style="background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; font-size: 1.5rem; margin-bottom: 1rem;">Lesson Overview</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 1rem;">In this introductory lesson, we will cover the core objectives of the program and establish a foundational understanding of what you will achieve by the end of the course.</p>
          <ul style="color: #4b5563; line-height: 1.6; padding-left: 1.5rem;">
            <li>Understand the platform navigation.</li>
            <li>Identify key learning outcomes.</li>
            <li>Prepare your local environment for practical exercises.</li>
          </ul>
        </div>
        
      </div>
    </main>

  </div>

  <script>
    if (!localStorage.getItem('instructify_logged_in')) {
      window.location.href = 'login.html';
    }
    const params = new URLSearchParams(window.location.search);
    const title = params.get('course');
    if (title) {
      document.getElementById('player-course-title').textContent = title;
    }
  </script>
</body>
`;
fs.writeFileSync(path.join(dir, 'course-player.html'), playerHtml);


// --- 4. ADD LOGIN BUTTON TO MAIN HTML NAVS ---
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !['login.html', 'student-dashboard.html', 'course-player.html'].includes(f));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the end of the .nav-links div and insert the Login button
  if (!content.includes('login.html" class="nav-link" style="color: #1d4ed8')) {
    content = content.replace(
      /(<div class="nav-links">[\s\S]*?)<\/div>/,
      `$1  <a href="login.html" class="nav-link" style="color: #1d4ed8 !important; font-weight: 800 !important; margin-left: 1rem; border: 2px solid #1d4ed8; padding: 6px 16px; border-radius: 8px;">Student Login</a>\n</div>`
    );
    fs.writeFileSync(filePath, content);
  }
});

console.log('Successfully built Custom Frontend LMS (login, dashboard, player) and updated navbars.');
