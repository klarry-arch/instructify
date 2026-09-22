/* ============================================================
   INSTRUCTIFY KENYA — CENTRAL LMS ENGINE & DATA STORE
   Comprehensive, modular LMS engine supporting:
   1. Course Management & 8-Step Wizard Data
   2. Multi-Level Curriculum (Sections, Modules, Lessons, Quizzes, Assignments)
   3. Assessment Engine (MCQ, True/False, Matching, Short Answer, File Rubrics)
   4. Student Enrolment, Linking, Cohorts & CSV Bulk Importer
   5. Distraction-Free Course Player State & Bookmark Persistence
   6. Comprehensive Reporting, Analytics & CSV Export
   7. In-App Announcements & Communication
   ============================================================ */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    COURSES: 'ik_lms_courses',
    ENROLLMENTS: 'ik_lms_enrollments',
    STUDENTS: 'ik_lms_students',
    SUBMISSIONS: 'ik_lms_submissions',
    ANNOUNCEMENTS: 'ik_lms_announcements',
    PROGRESS: 'ik_lms_progress',
    CERTIFICATES: 'ik_lms_certificates'
  };

  // ── Default Mock Students ───────────────────────────────────────
  const DEFAULT_STUDENTS = [
    {
      id: 'std_001',
      name: 'James Mwangi',
      email: 'james.mwangi@edu.ke',
      phone: '+254 712 345 678',
      role: 'learner',
      school: 'Nairobi Central Academy',
      cohort: 'Junior Secondary Grade 7-9',
      status: 'active',
      enrolledCourses: ['crs_000', 'crs_001'],
      joinedDate: '2026-08-10'
    },
    {
      id: 'std_002',
      name: 'Grace Wanjiku',
      email: 'grace.wanjiku@mku.ac.ke',
      phone: '+254 723 456 789',
      role: 'learner',
      school: 'Mt. Kenya Teacher Training College',
      cohort: 'Mathematics Faculty Trainees',
      status: 'active',
      enrolledCourses: ['crs_001', 'crs_007'],
      joinedDate: '2026-08-15'
    },
    {
      id: 'std_003',
      name: 'Kevin Omondi',
      email: 'k.omondi@kisumuhigh.sc.ke',
      phone: '+254 734 567 890',
      role: 'learner',
      school: 'Kisumu Senior School',
      cohort: 'Integrated Science Faculty',
      status: 'active',
      enrolledCourses: ['crs_001', 'crs_003'],
      joinedDate: '2026-08-20'
    },
    {
      id: 'std_004',
      name: 'Amina Abdi',
      email: 'amina.abdi@mombasagirls.edu.ke',
      phone: '+254 745 678 901',
      role: 'learner',
      school: 'Mombasa Girls National School',
      cohort: 'Digital Literacy Champions',
      status: 'active',
      enrolledCourses: ['crs_000', 'crs_002'],
      joinedDate: '2026-08-22'
    },
    {
      id: 'std_005',
      name: 'Brian Kipkorir',
      email: 'brian.kip@eldorethigh.sc.ke',
      phone: '+254 756 789 012',
      role: 'learner',
      school: 'Highland Secondary School, Eldoret',
      cohort: 'Junior Secondary Grade 7-9',
      status: 'inactive',
      enrolledCourses: ['crs_001'],
      joinedDate: '2026-08-25'
    },
    {
      id: 'std_006',
      name: 'Faith Chebet',
      email: 'faith.chebet@nakuruday.sc.ke',
      phone: '+254 767 890 123',
      role: 'learner',
      school: 'Nakuru Day Secondary School',
      cohort: 'CBC Curriculum Leaders',
      status: 'invited',
      enrolledCourses: ['crs_003'],
      joinedDate: '2026-09-01'
    }
  ];

  // ── Default Rich Curriculum for Flagship Courses ────────────────
  const DEFAULT_CURRICULUM = {
    'crs_001': [
      {
        id: 'sec_001',
        title: 'Section 1: Foundations of CBC & Digital Pedagogies',
        description: 'Understand the shift from rote content delivery to competency-based digital integration.',
        modules: [
          {
            id: 'mod_001',
            title: 'Module 1: The Competency-Based Classroom Paradigm',
            lessons: [
              {
                id: 'les_001_01',
                title: 'Lesson 1.1: Core Competencies in the 21st Century Classroom',
                type: 'video',
                duration: '18 mins',
                mandatory: true,
                freePreview: true,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                contentHtml: `
                  <h3>Embracing Learner-Centred Digital Integration</h3>
                  <p>In the Competency-Based Curriculum (CBC), technology serves as an accelerator of inquiry, critical thinking, and collaborative discovery. Educators transition from knowledge transmitters to pedagogical facilitators.</p>
                  <div class="lms-callout lms-callout-tip">
                    <strong>💡 Key Pedagogical Principle:</strong> Technology should empower learners to explore concepts through hands-on simulations and peer problem solving.
                  </div>
                  <h4>Core Competency Pillars:</h4>
                  <ul>
                    <li><strong>Communication & Collaboration:</strong> Shared digital documents and peer critique.</li>
                    <li><strong>Critical Thinking:</strong> Data analysis and real-world scenario evaluation.</li>
                    <li><strong>Digital Literacy:</strong> Ethical research and creative content synthesis.</li>
                  </ul>
                `,
                resources: [
                  { name: 'KICD_CBC_Digital_Framework_Summary.pdf', size: '2.4 MB', type: 'pdf' },
                  { name: 'Lesson_Starter_Prompts.docx', size: '480 KB', type: 'doc' }
                ]
              },
              {
                id: 'les_001_02',
                title: 'Lesson 1.2: Digital Tools Mapping for Junior & Senior School',
                type: 'text',
                duration: '25 mins',
                mandatory: true,
                freePreview: false,
                contentHtml: `
                  <h3>Curriculum Strand & Tool Alignment Matrix</h3>
                  <p>Selecting appropriate digital software depends on strand learning outcomes and available school infrastructure.</p>
                  <table class="data-table" style="margin: 16px 0;">
                    <thead>
                      <tr><th>CBC Strand</th><th>Digital Tool</th><th>Pedagogical Application</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Integrated Science</td><td>PhET Interactive Simulations</td><td>Virtual lab experiments & variables testing</td></tr>
                      <tr><td>Mathematics</td><td>GeoGebra</td><td>Dynamic geometry and algebraic proofs</td></tr>
                      <tr><td>Social Studies</td><td>Google Earth & GIS</td><td>Geographic spatial analysis</td></tr>
                    </tbody>
                  </table>
                `,
                resources: [
                  { name: 'Strand_Tool_Matrix_Template.xlsx', size: '1.1 MB', type: 'sheet' }
                ]
              },
              {
                id: 'qiz_001_01',
                title: 'Quiz 1.1: Foundations of CBC Digital Literacy',
                type: 'quiz',
                duration: '15 mins',
                mandatory: true,
                passMark: 80,
                attemptsAllowed: 3,
                questions: [
                  {
                    id: 'q1',
                    type: 'mcq',
                    text: 'What is the primary role of the educator in a CBC technology-rich classroom?',
                    options: [
                      'Sole lecturer delivering textbook facts',
                      'Facilitator guiding inquiry and active competency development',
                      'Technical troubleshooter only',
                      'Passive observer of computer games'
                    ],
                    correctAnswer: 1,
                    explanation: 'CBC positions the teacher as an active facilitator of learner discovery rather than an authoritarian dispenser of knowledge.'
                  },
                  {
                    id: 'q2',
                    type: 'true_false',
                    text: 'True or False: Digital tools in CBC should only be used during dedicated computer studies lessons.',
                    options: ['True', 'False'],
                    correctAnswer: 1,
                    explanation: 'Digital literacy is a cross-cutting core competency integrated across science, mathematics, language, and humanities.'
                  },
                  {
                    id: 'q3',
                    type: 'mcq',
                    text: 'Which KICD core competency emphasizes collaborative problem solving with peers?',
                    options: [
                      'Self-efficacy',
                      'Communication and Collaboration',
                      'Citizenship',
                      'Imagination and Creativity'
                    ],
                    correctAnswer: 1,
                    explanation: 'Communication and Collaboration explicitly addresses collective problem-solving and mutual articulation of ideas.'
                  }
                ]
              }
            ]
          },
          {
            id: 'mod_002',
            title: 'Module 2: Inquiry-Driven Lesson Planning',
            lessons: [
              {
                id: 'les_001_03',
                title: 'Lesson 2.1: Structuring 40-Minute Competency Lesson Plans',
                type: 'text',
                duration: '30 mins',
                mandatory: true,
                freePreview: false,
                contentHtml: `
                  <h3>The 3-Phase Inquiry Structure</h3>
                  <p>A successful CBC lesson allocates 70% of time to active student experimentation and peer synthesis.</p>
                  <ol>
                    <li><strong>Introduction & Provocation (5-8 mins):</strong> Essential question or puzzling phenomenon.</li>
                    <li><strong>Collaborative Investigation (25 mins):</strong> Hands-on activity using worksheets or digital devices.</li>
                    <li><strong>Plenary Reflection & Synthesis (7 mins):</strong> Learner presentations and formative self-assessment.</li>
                  </ol>
                `,
                resources: [
                  { name: '40Min_CBC_LessonPlan_Template.pdf', size: '1.8 MB', type: 'pdf' }
                ]
              },
              {
                id: 'asg_001_01',
                title: 'Assignment 2.1: Design a CBC Technology-Enhanced Lesson Plan',
                type: 'assignment',
                duration: '60 mins',
                mandatory: true,
                rubric: [
                  { criterion: 'CBC Competency Alignment', maxPoints: 25 },
                  { criterion: 'Pedagogical Depth & Inquiry Structure', maxPoints: 25 },
                  { criterion: 'Appropriate Digital Tool Integration', maxPoints: 25 },
                  { criterion: 'Formative Assessment Rubrics', maxPoints: 25 }
                ],
                instructions: 'Upload your finalized 40-minute CBC lesson plan demonstrating clear alignment with KICD curriculum designs and targeted core competencies.'
              }
            ]
          }
        ]
      },
      {
        id: 'sec_002',
        title: 'Section 2: Formative Assessment & Competency Portfolios',
        description: 'Design descriptive rubrics, track continuous assessment (CBE), and assemble learner portfolios.',
        modules: [
          {
            id: 'mod_003',
            title: 'Module 3: Rubric Design & Performance Evidence',
            lessons: [
              {
                id: 'les_001_04',
                title: 'Lesson 3.1: Constructing 4-Level Descriptive Rubrics',
                type: 'video',
                duration: '22 mins',
                mandatory: true,
                freePreview: false,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                contentHtml: `
                  <h3>Exceeding vs. Meeting Expectations</h3>
                  <p>In CBC, grades are replaced by qualitative performance indicators: Exceeding Expectations (EE), Meeting Expectations (ME), Approaching Expectations (AE), and Below Expectations (BE).</p>
                `
              },
              {
                id: 'asg_001_02',
                title: 'Assignment 3.1: Formative Assessment Rubric Portfolio',
                type: 'assignment',
                duration: '45 mins',
                mandatory: true,
                rubric: [
                  { criterion: 'Descriptor Precision', maxPoints: 25 },
                  { criterion: 'Constructive Feedback Provisions', maxPoints: 25 },
                  { criterion: 'Alignment with KICD Rubric Standards', maxPoints: 25 },
                  { criterion: 'Inclusivity & Differentiation Support', maxPoints: 25 }
                ],
                instructions: 'Design an end-of-strand assessment rubric for Grade 7 or 8 with distinct performance indicators for all four levels.'
              }
            ]
          }
        ]
      }
    ]
  };

  // ── Helper: Safe Storage Access ─────────────────────────────────
  function getItem(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn('LMS Engine getItem error:', e);
      return fallback;
    }
  }

  function setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LMS Engine setItem error:', e);
    }
  }

  // ── Initialize Engine Store ──────────────────────────────────────
  function initEngine() {
    // 1. Initialize Courses
    let storedCourses = getItem(STORAGE_KEYS.COURSES, null);
    if (!storedCourses || !Array.isArray(storedCourses) || storedCourses.length === 0) {
      const baseCourses = (window.COURSES && Array.isArray(window.COURSES)) ? window.COURSES : [];
      storedCourses = baseCourses.map(c => ({
        ...c,
        status: c.status || 'published', // 'published', 'draft', 'pending_approval', 'archived'
        accessType: c.accessType || 'open', // 'open', 'private', 'invite_only', 'code'
        accessCode: c.accessCode || ('IK-' + c.id.toUpperCase().replace('_', '-')),
        curriculum: DEFAULT_CURRICULUM[c.id] || generateDefaultCurriculum(c),
        totalEnrollments: c.enrollments || 120,
        activeStudents: Math.round((c.enrollments || 120) * 0.78),
        completionRate: 84,
        cohorts: ['Junior Secondary Grade 7-9', 'Upper Primary Educators', 'Mathematics Faculty Trainees'],
        certificateTemplate: 'standard_cpd',
        createdAt: '2026-08-01T08:00:00.000Z',
        updatedAt: '2026-09-20T12:00:00.000Z'
      }));
      setItem(STORAGE_KEYS.COURSES, storedCourses);
    }

    // 2. Initialize Students
    let storedStudents = getItem(STORAGE_KEYS.STUDENTS, null);
    if (!storedStudents || !Array.isArray(storedStudents) || storedStudents.length === 0) {
      setItem(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    }

    // 3. Initialize Enrollments
    let storedEnrollments = getItem(STORAGE_KEYS.ENROLLMENTS, null);
    if (!storedEnrollments || !Array.isArray(storedEnrollments)) {
      const initialEnrollments = [
        {
          id: 'enr_001',
          studentId: 'std_001',
          courseId: 'crs_001',
          enrolledAt: '2026-08-10T10:00:00.000Z',
          status: 'active',
          progressPercent: 65,
          completedLessons: ['les_001_01', 'les_001_02', 'qiz_001_01'],
          activeLessonId: 'les_001_03',
          quizScores: { qiz_001_01: 100 },
          timeSpentMinutes: 185,
          lastActiveAt: new Date().toISOString()
        },
        {
          id: 'enr_002',
          studentId: 'std_002',
          courseId: 'crs_001',
          enrolledAt: '2026-08-15T09:30:00.000Z',
          status: 'active',
          progressPercent: 88,
          completedLessons: ['les_001_01', 'les_001_02', 'qiz_001_01', 'les_001_03', 'asg_001_01'],
          activeLessonId: 'les_001_04',
          quizScores: { qiz_001_01: 90 },
          timeSpentMinutes: 240,
          lastActiveAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'enr_003',
          studentId: 'std_003',
          courseId: 'crs_001',
          enrolledAt: '2026-08-20T14:15:00.000Z',
          status: 'active',
          progressPercent: 42,
          completedLessons: ['les_001_01', 'les_001_02'],
          activeLessonId: 'qiz_001_01',
          quizScores: {},
          timeSpentMinutes: 95,
          lastActiveAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 'enr_004',
          studentId: 'std_004',
          courseId: 'crs_001',
          enrolledAt: '2026-08-22T11:00:00.000Z',
          status: 'active',
          progressPercent: 50,
          completedLessons: ['les_001_01', 'les_001_02'],
          activeLessonId: 'les_001_03',
          quizScores: { qiz_001_01: 85 },
          timeSpentMinutes: 120,
          lastActiveAt: new Date().toISOString()
        },
        {
          id: 'enr_005',
          studentId: 'std_005',
          courseId: 'crs_001',
          enrolledAt: '2026-08-25T16:00:00.000Z',
          status: 'inactive',
          progressPercent: 15,
          completedLessons: ['les_001_01'],
          activeLessonId: 'les_001_02',
          quizScores: {},
          timeSpentMinutes: 30,
          lastActiveAt: new Date(Date.now() - 864000000).toISOString() // 10 days ago (at-risk)
        }
      ];
      setItem(STORAGE_KEYS.ENROLLMENTS, initialEnrollments);
    }

    // 4. Initialize Announcements
    let storedAnnouncements = getItem(STORAGE_KEYS.ANNOUNCEMENTS, null);
    if (!storedAnnouncements || !Array.isArray(storedAnnouncements)) {
      setItem(STORAGE_KEYS.ANNOUNCEMENTS, [
        {
          id: 'anc_001',
          courseId: 'crs_001',
          title: 'Upcoming Live Q&A: Formative Assessment Best Practices',
          content: 'Join Dr. Wanjiku this Thursday at 4:00 PM EAT for an interactive walkthrough on designing CBE rubric portfolios. Bring your draft lesson plans!',
          author: 'Dr. Wanjiku Kamau',
          date: 'Yesterday, 3:00 PM',
          priority: 'high',
          cohort: 'All Cohorts'
        },
        {
          id: 'anc_002',
          courseId: 'crs_001',
          title: 'Assignment 2.1 Submissions Now Open',
          content: 'Please upload your 40-minute CBC Technology-Enhanced Lesson Plan by Sunday midnight. Ensure KICD strand outcomes are clearly articulated.',
          author: 'Dr. Wanjiku Kamau',
          date: 'Sep 18, 2026',
          priority: 'normal',
          cohort: 'Junior Secondary Grade 7-9'
        }
      ]);
    }
  }

  // ── Generate Default Curriculum Fallback ─────────────────────────
  function generateDefaultCurriculum(course) {
    return [
      {
        id: 'sec_001',
        title: 'Section 1: Foundations & Core Concepts',
        description: `Introductory overview of ${course.title}`,
        modules: [
          {
            id: 'mod_001',
            title: 'Module 1: Orientation & Frameworks',
            lessons: [
              {
                id: `les_${course.id}_01`,
                title: 'Lesson 1.1: Course Welcome & Learning Objectives',
                type: 'video',
                duration: '15 mins',
                mandatory: true,
                freePreview: true,
                contentHtml: `<p>Welcome to <strong>${course.title}</strong>. This module equips you with foundational frameworks and practical skills.</p>`
              },
              {
                id: `les_${course.id}_02`,
                title: 'Lesson 1.2: Essential Competency Standards',
                type: 'text',
                duration: '20 mins',
                mandatory: true,
                freePreview: false,
                contentHtml: `<p>Review the essential KICD competency indicators and practical expectations.</p>`
              },
              {
                id: `qiz_${course.id}_01`,
                title: 'Quiz 1: Knowledge Check',
                type: 'quiz',
                duration: '15 mins',
                mandatory: true,
                passMark: 80,
                questions: [
                  {
                    id: 'q1',
                    type: 'true_false',
                    text: 'Active participation in peer activities is mandatory for certification.',
                    options: ['True', 'False'],
                    correctAnswer: 0,
                    explanation: 'Active completion of all core deliverables is required.'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // ── Public Engine API ───────────────────────────────────────────
  const LMSEngine = {
    init: initEngine,

    // ── Courses CRUD ──────────────────────────────────────────────
    getAllCourses: function () {
      initEngine();
      return getItem(STORAGE_KEYS.COURSES, []);
    },

    getCourseById: function (courseId) {
      const courses = this.getAllCourses();
      return courses.find(c => c.id === courseId) || null;
    },

    saveCourse: function (courseData) {
      const courses = this.getAllCourses();
      const existingIdx = courses.findIndex(c => c.id === courseData.id);

      const courseRecord = {
        ...courseData,
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        courses[existingIdx] = { ...courses[existingIdx], ...courseRecord };
      } else {
        courseRecord.id = courseRecord.id || ('crs_' + Date.now().toString(36));
        courseRecord.createdAt = new Date().toISOString();
        courseRecord.totalEnrollments = 0;
        courseRecord.activeStudents = 0;
        courseRecord.completionRate = 0;
        courses.unshift(courseRecord);
      }

      setItem(STORAGE_KEYS.COURSES, courses);
      return courseRecord;
    },

    deleteCourse: function (courseId) {
      let courses = this.getAllCourses();
      courses = courses.filter(c => c.id !== courseId);
      setItem(STORAGE_KEYS.COURSES, courses);
      return true;
    },

    updateCourseStatus: function (courseId, status) {
      const courses = this.getAllCourses();
      const course = courses.find(c => c.id === courseId);
      if (course) {
        course.status = status;
        course.updatedAt = new Date().toISOString();
        setItem(STORAGE_KEYS.COURSES, courses);
        return true;
      }
      return false;
    },

    // ── Student Management ────────────────────────────────────────
    getAllStudents: function () {
      initEngine();
      return getItem(STORAGE_KEYS.STUDENTS, []);
    },

    getStudentById: function (studentId) {
      const students = this.getAllStudents();
      return students.find(s => s.id === studentId) || null;
    },

    addStudent: function (studentData) {
      const students = this.getAllStudents();
      const existing = students.find(s => s.email.toLowerCase() === studentData.email.toLowerCase());
      if (existing) {
        return { success: false, message: 'A student with this email address already exists.' };
      }

      const newStudent = {
        id: studentData.id || ('std_' + Date.now().toString(36)),
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone || '',
        school: studentData.school || 'General Cohort',
        cohort: studentData.cohort || 'Junior Secondary Grade 7-9',
        status: studentData.status || 'active',
        enrolledCourses: studentData.enrolledCourses || [],
        joinedDate: new Date().toISOString().split('T')[0]
      };

      students.unshift(newStudent);
      setItem(STORAGE_KEYS.STUDENTS, students);
      return { success: true, student: newStudent };
    },

    updateStudentStatus: function (studentId, newStatus) {
      const students = this.getAllStudents();
      const student = students.find(s => s.id === studentId);
      if (student) {
        student.status = newStatus;
        setItem(STORAGE_KEYS.STUDENTS, students);
        return true;
      }
      return false;
    },

    // ── Bulk CSV Student Importer ─────────────────────────────────
    parseAndImportCSV: function (csvText, targetCourseId, targetCohort) {
      const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        return { success: false, message: 'CSV file is empty or missing headers.' };
      }

      const headerLine = lines[0].toLowerCase();
      const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
      const schoolIdx = headers.findIndex(h => h.includes('school') || h.includes('institution'));
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));

      if (emailIdx === -1) {
        return { success: false, message: 'CSV must contain an "email" column.' };
      }

      let importedCount = 0;
      let skippedCount = 0;
      const importedStudents = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
        const email = row[emailIdx];
        if (!email || !email.includes('@')) {
          skippedCount++;
          continue;
        }

        const name = (nameIdx !== -1 && row[nameIdx]) ? row[nameIdx] : email.split('@')[0];
        const school = (schoolIdx !== -1 && row[schoolIdx]) ? row[schoolIdx] : 'Imported Cohort';
        const phone = (phoneIdx !== -1 && row[phoneIdx]) ? row[phoneIdx] : '';

        const res = this.addStudent({
          name,
          email,
          phone,
          school,
          cohort: targetCohort || 'Imported Cohort',
          status: 'invited',
          enrolledCourses: targetCourseId ? [targetCourseId] : []
        });

        if (res.success) {
          importedCount++;
          importedStudents.push(res.student);
          if (targetCourseId) {
            this.enrollStudentInCourse(res.student.id, targetCourseId);
          }
        } else {
          skippedCount++;
        }
      }

      return {
        success: true,
        importedCount,
        skippedCount,
        students: importedStudents
      };
    },

    // ── Enrolment & Linking ───────────────────────────────────────
    getAllEnrollments: function () {
      initEngine();
      return getItem(STORAGE_KEYS.ENROLLMENTS, []);
    },

    getEnrollmentsForCourse: function (courseId) {
      const enrollments = this.getAllEnrollments();
      const students = this.getAllStudents();

      return enrollments
        .filter(e => e.courseId === courseId)
        .map(e => {
          const student = students.find(s => s.id === e.studentId) || {
            name: 'Unknown Student',
            email: 'unlinked@edu.ke',
            school: 'Unspecified',
            cohort: 'General'
          };
          return {
            ...e,
            student
          };
        });
    },

    enrollStudentInCourse: function (studentId, courseId) {
      const enrollments = this.getAllEnrollments();
      const existing = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
      if (existing) {
        return { success: false, message: 'Learner is already enrolled in this course.' };
      }

      const newEnrollment = {
        id: 'enr_' + Date.now().toString(36),
        studentId,
        courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progressPercent: 0,
        completedLessons: [],
        activeLessonId: null,
        quizScores: {},
        timeSpentMinutes: 0,
        lastActiveAt: new Date().toISOString()
      };

      enrollments.push(newEnrollment);
      setItem(STORAGE_KEYS.ENROLLMENTS, enrollments);

      // Also ensure student record references this course
      const students = this.getAllStudents();
      const student = students.find(s => s.id === studentId);
      if (student && !student.enrolledCourses.includes(courseId)) {
        student.enrolledCourses.push(courseId);
        setItem(STORAGE_KEYS.STUDENTS, students);
      }

      return { success: true, enrollment: newEnrollment };
    },

    enrollByAccessCode: function (studentId, accessCode) {
      const courses = this.getAllCourses();
      const codeClean = (accessCode || '').trim().toUpperCase();
      const course = courses.find(c => (c.accessCode || '').toUpperCase() === codeClean);

      if (!course) {
        return { success: false, message: 'Invalid or expired course access code.' };
      }

      return this.enrollStudentInCourse(studentId, course.id);
    },

    // ── Distraction-Free Player Progress Tracking ─────────────────
    getStudentProgress: function (studentId, courseId) {
      const enrollments = this.getAllEnrollments();
      return enrollments.find(e => e.studentId === studentId && e.courseId === courseId) || null;
    },

    markLessonComplete: function (studentId, courseId, lessonId) {
      const enrollments = this.getAllEnrollments();
      const enrollment = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
      if (!enrollment) return false;

      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
      }

      enrollment.lastActiveAt = new Date().toISOString();

      // Calculate total lessons in course
      const course = this.getCourseById(courseId);
      let totalLessons = 0;
      if (course && Array.isArray(course.curriculum)) {
        course.curriculum.forEach(sec => {
          (sec.modules || []).forEach(mod => {
            totalLessons += (mod.lessons || []).length;
          });
        });
      }

      if (totalLessons > 0) {
        enrollment.progressPercent = Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100));
      }

      if (enrollment.progressPercent >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date().toISOString();
      }

      setItem(STORAGE_KEYS.ENROLLMENTS, enrollments);
      return enrollment;
    },

    recordQuizScore: function (studentId, courseId, quizId, scorePercentage) {
      const enrollments = this.getAllEnrollments();
      const enrollment = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
      if (!enrollment) return false;

      enrollment.quizScores = enrollment.quizScores || {};
      enrollment.quizScores[quizId] = scorePercentage;
      enrollment.lastActiveAt = new Date().toISOString();

      if (scorePercentage >= 80) {
        if (!enrollment.completedLessons.includes(quizId)) {
          enrollment.completedLessons.push(quizId);
        }
      }

      setItem(STORAGE_KEYS.ENROLLMENTS, enrollments);
      return enrollment;
    },

    saveActiveLessonBookmark: function (studentId, courseId, lessonId) {
      const enrollments = this.getAllEnrollments();
      const enrollment = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
      if (enrollment) {
        enrollment.activeLessonId = lessonId;
        enrollment.lastActiveAt = new Date().toISOString();
        setItem(STORAGE_KEYS.ENROLLMENTS, enrollments);
      }
    },

    // ── Announcements & Communication ─────────────────────────────
    getAnnouncements: function (courseId) {
      initEngine();
      const all = getItem(STORAGE_KEYS.ANNOUNCEMENTS, []);
      if (!courseId || courseId === 'all') return all;
      return all.filter(a => a.courseId === courseId);
    },

    publishAnnouncement: function (announcementData) {
      const announcements = this.getAnnouncements('all');
      const newAnnouncement = {
        id: 'anc_' + Date.now().toString(36),
        courseId: announcementData.courseId || 'crs_001',
        title: announcementData.title,
        content: announcementData.content,
        author: announcementData.author || 'Dr. Wanjiku Kamau',
        date: 'Just now',
        priority: announcementData.priority || 'normal',
        cohort: announcementData.cohort || 'All Cohorts',
        createdAt: new Date().toISOString()
      };

      announcements.unshift(newAnnouncement);
      setItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
      return newAnnouncement;
    },

    // ── Analytics & CSV Export ─────────────────────────────────────
    generateCourseReportData: function (courseId) {
      const enrollments = this.getEnrollmentsForCourse(courseId || 'crs_001');
      return enrollments.map(e => {
        const daysSinceActive = Math.round((Date.now() - new Date(e.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24));
        const isAtRisk = daysSinceActive >= 7 && e.progressPercent < 50;

        return {
          id: e.student.id,
          name: e.student.name,
          email: e.student.email,
          school: e.student.school,
          cohort: e.student.cohort,
          progress: e.progressPercent + '%',
          completedLessons: e.completedLessons.length,
          lastActive: daysSinceActive === 0 ? 'Today' : `${daysSinceActive} days ago`,
          status: e.status.toUpperCase(),
          atRisk: isAtRisk ? 'YES (At-Risk)' : 'NO'
        };
      });
    },

    exportReportToCSV: function (courseId) {
      const data = this.generateCourseReportData(courseId);
      if (!data || data.length === 0) {
        return null;
      }

      const headers = ['Student ID', 'Full Name', 'Email', 'School/Institution', 'Cohort', 'Course Progress', 'Lessons Completed', 'Last Active', 'Status', 'At-Risk Alert'];
      const csvRows = [headers.join(',')];

      data.forEach(row => {
        const values = [
          row.id,
          `"${row.name}"`,
          `"${row.email}"`,
          `"${row.school}"`,
          `"${row.cohort}"`,
          `"${row.progress}"`,
          row.completedLessons,
          `"${row.lastActive}"`,
          row.status,
          `"${row.atRisk}"`
        ];
        csvRows.push(values.join(','));
      });

      return csvRows.join('\r\n');
    }
  };

  // Expose to global window
  window.LMSEngine = LMSEngine;

  // Initialize on script load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => LMSEngine.init());
    } else {
      LMSEngine.init();
    }
  }

})(window);
