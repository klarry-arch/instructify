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
    ],
    'crs_009': [
      {
        id: 'sec_009_01',
        title: 'Section 1: CBC/CBE Pedagogical Foundations & Digital Integration Frameworks',
        description: 'Master the shift to Competency-Based Education (CBE) and understand how digital tools act as cognitive catalysts across all 8 KICD learning areas.',
        modules: [
          {
            id: 'mod_009_01',
            title: 'Module 1: The Competency-Based Digital Paradigm',
            lessons: [
              {
                id: 'les_009_01',
                title: 'Lesson 1.1: CBC Core Pedagogies, 7 Competencies & Technological Catalysts',
                type: 'video',
                duration: '22 mins',
                mandatory: true,
                freePreview: true,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                contentHtml: `
                  <h3>The Pedagogical Paradigm Shift: From Rote to Competency</h3>
                  <p>In Kenya's Competency-Based Curriculum (CBC) and Competency-Based Education (CBE), learning is defined by what the learner can do, critically evaluate, and create—not merely what they can memorize. Digital integration transforms productivity software (Word, Excel, PowerPoint) from clerical tools into instruments of inquiry, collaboration, and high-order cognition.</p>
                  
                  <div class="lms-callout lms-callout-tip">
                    <strong>💡 Core Guiding Principle:</strong> Technology must not merely substitute paper; it must amplify learner agency, inquiry, and authentic demonstration of competencies.
                  </div>

                  <h4>The 7 Core Competencies in Action:</h4>
                  <ul>
                    <li><strong>1. Communication & Collaboration:</strong> Shared document authoring, peer editing in Word, and collaborative slide presentations.</li>
                    <li><strong>2. Critical Thinking & Problem Solving:</strong> Designing spreadsheet formulas in Excel to model real-world community budgets and scientific data.</li>
                    <li><strong>3. Creativity & Imagination:</strong> Authoring multimedia stories, non-linear interactive decks in PowerPoint, and creative worksheets.</li>
                    <li><strong>4. Citizenship:</strong> Exploring regional historical data, environmental stewardship datasets, and civic presentations.</li>
                    <li><strong>5. Learning to Learn:</strong> Self-paced interactive slide decks with automated diagnostic quizzes.</li>
                    <li><strong>6. Self-Efficacy:</strong> Personal learner digital portfolios evidencing skill progression.</li>
                    <li><strong>7. Digital Literacy:</strong> Ethical, productive, and safe navigation of standard workplace application software.</li>
                  </ul>

                  <h4>The SAMR & TPACK Integration Models:</h4>
                  <p>Educators use the <strong>SAMR Model</strong> (Substitution, Augmentation, Modification, Redefinition) and <strong>TPACK</strong> (Technological Pedagogical Content Knowledge) to deliberately plan how digital applications transform learning across all grades.</p>
                `,
                resources: [
                  { name: 'KICD_CBC_Digital_Integration_Framework_Guide.pdf', size: '2.8 MB', type: 'pdf' },
                  { name: 'SAMR_TPACK_Kenyan_Classroom_Crosswalk.pdf', size: '1.2 MB', type: 'pdf' }
                ]
              },
              {
                id: 'les_009_02',
                title: 'Lesson 1.2: Cross-Curricular Application Matrix for All Learning Areas',
                type: 'text',
                duration: '25 mins',
                mandatory: true,
                freePreview: true,
                contentHtml: `
                  <h3>Universal Digital Integration Across All 8 Learning Areas</h3>
                  <p>Every learning area in Pre-Primary, Primary, Junior School, and Senior School benefits directly from Microsoft Office Suite applications:</p>
                  
                  <table class="data-table" style="margin: 16px 0; width: 100%;">
                    <thead>
                      <tr>
                        <th style="width: 25%;">Learning Area</th>
                        <th style="width: 25%;">Microsoft Word</th>
                        <th style="width: 25%;">Microsoft Excel</th>
                        <th style="width: 25%;">Microsoft PowerPoint</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Languages (English, Kiswahili, Indigenous)</strong></td>
                        <td>Creative writing, dialogue scripts, vocabulary flashcard tables, grammar editing.</td>
                        <td>Vocabulary frequency logs, reading speed trackers, spelling mastery charts.</td>
                        <td>Digital storytelling, oral poetry recitals with audio narration, branching dialogues.</td>
                      </tr>
                      <tr>
                        <td><strong>Mathematics</strong></td>
                        <td>Mathematical problem-solving worksheets, geometry term sheets with equation editor.</td>
                        <td>Dynamic multiplication tables, geometry coordinate graphing, statistical calculations.</td>
                        <td>Animated step-by-step geometric proofs, angle property demonstrations.</td>
                      </tr>
                      <tr>
                        <td><strong>Integrated Science & Health</strong></td>
                        <td>Laboratory investigation reports, scientific observation logs, hygiene guidelines.</td>
                        <td>Experiment data tables, temperature/heart-rate logging, line graph generation.</td>
                        <td>Animated simulations of the water cycle, human digestive system, and cell structures.</td>
                      </tr>
                      <tr>
                        <td><strong>Social Studies & Humanities</strong></td>
                        <td>Historical source analysis worksheets, constitution summary guides, case studies.</td>
                        <td>Census data analysis, climatic weather logging, county resource budget models.</td>
                        <td>Interactive county maps, virtual museum walkthroughs with hyperlinked triggers.</td>
                      </tr>
                      <tr>
                        <td><strong>Agriculture & Nutrition</strong></td>
                        <td>Farm enterprise records, poultry care guides, balanced diet recipe cards.</td>
                        <td>Crop yield records, rainfall pattern logs, livestock feed conversion calculators.</td>
                        <td>Crop disease identification presentations, food preservation step-by-step slideshows.</td>
                      </tr>
                      <tr>
                        <td><strong>Creative Arts & Sports</strong></td>
                        <td>Art analysis rubrics, music lyric composition documents, sports rulebooks.</td>
                        <td>Tournament bracket trackers, fitness benchmark scoring sheets, dance tempo logs.</td>
                        <td>Visual art portfolios, cultural dance photo-essays, rhythm timing presentations.</td>
                      </tr>
                      <tr>
                        <td><strong>Pre-Technical Studies & Business</strong></td>
                        <td>Business plan templates, workshop safety manuals, formal inquiry letters.</td>
                        <td>Simple balance sheets, cashflow forecasts, material cost estimation spreadsheets.</td>
                        <td>Product marketing pitches, workshop safety hazard interactive presentations.</td>
                      </tr>
                      <tr>
                        <td><strong>Religious Education (CRE, IRE, HRE)</strong></td>
                        <td>Moral dilemma reflective journals, scriptural study worksheets, ethical essays.</td>
                        <td>Community charity contribution trackers, religious calendar milestone logs.</td>
                        <td>Illustrated parables and historical religious journeys with audio voiceover.</td>
                      </tr>
                    </tbody>
                  </table>
                `,
                resources: [
                  { name: 'Universal_CBC_Application_Matrix.xlsx', size: '1.4 MB', type: 'sheet' }
                ]
              },
              {
                id: 'qiz_009_01',
                title: 'Quiz 1.1: CBC Digital Integration & Pedagogy Check',
                type: 'quiz',
                duration: '15 mins',
                mandatory: true,
                passMark: 80,
                attemptsAllowed: 3,
                questions: [
                  {
                    id: 'q1',
                    type: 'mcq',
                    text: 'Under the SAMR model, when a teacher uses Excel so learners can formulate "what-if" models and graph live data that was previously impossible on paper, what level is being achieved?',
                    options: [
                      'Substitution',
                      'Augmentation',
                      'Modification / Redefinition',
                      'Elimination'
                    ],
                    correctAnswer: 2,
                    explanation: 'Modification/Redefinition transforms the learning experience by allowing dynamic modeling and computational investigation that cannot be achieved with physical paper.'
                  },
                  {
                    id: 'q2',
                    type: 'true_false',
                    text: 'True or False: Microsoft Office tools are only intended for computer science lessons in senior school.',
                    options: ['True', 'False'],
                    correctAnswer: 1,
                    explanation: 'False: Digital literacy is a cross-cutting CBC core competency intended for universal infusion across Languages, Sciences, Humanities, Agriculture, and the Arts.'
                  },
                  {
                    id: 'q3',
                    type: 'mcq',
                    text: 'Which CBC core competency is primarily developed when students co-author a Word document using tracked changes and collaborative comments?',
                    options: [
                      'Self-efficacy',
                      'Communication and Collaboration',
                      'Citizenship',
                      'Financial Literacy'
                    ],
                    correctAnswer: 1,
                    explanation: 'Collaborative document authoring directly nurtures active communication, peer critique, and cooperative problem-solving.'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec_009_02',
        title: 'Section 2: Complete Definition of Terms (CBC/CBE & Productivity Tools)',
        description: 'Clear, authoritative definitions of curriculum terms and application program concepts essential for professional implementation.',
        modules: [
          {
            id: 'mod_009_02',
            title: 'Module 2: Complete Curriculum & ICT Glossaries',
            lessons: [
              {
                id: 'les_009_03',
                title: 'Lesson 2.1: Authoritative Glossary of CBC & CBE Terminology',
                type: 'text',
                duration: '20 mins',
                mandatory: true,
                freePreview: true,
                contentHtml: `
                  <h3>Authoritative CBC / CBE Glossary</h3>
                  <p>To teach and assess effectively, educators must have a precise, standardized understanding of CBC terminology:</p>

                  <div style="display: flex; flex-direction: column; gap: 14px; margin: 18px 0;">
                    <div class="lms-callout" style="border-left: 4px solid #1D4ED8; background: #F8FAFC; padding: 14px 18px;">
                      <h4 style="margin: 0 0 6px 0; color: #1D4ED8;">Strand & Sub-strand</h4>
                      <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Strand:</strong> A broad conceptual thematic area within a learning area curriculum design (e.g., <em>Numbers</em> in Mathematics or <em>Living Things</em> in Integrated Science).<br>
                      <strong>Sub-strand:</strong> A specific sub-topic or modular focus within a strand (e.g., <em>Fractions</em> or <em>The Human Digestive System</em>).</p>
                    </div>

                    <div class="lms-callout" style="border-left: 4px solid #047857; background: #F8FAFC; padding: 14px 18px;">
                      <h4 style="margin: 0 0 6px 0; color: #047857;">Specific Learning Outcomes (SLOs)</h4>
                      <p style="margin: 0; font-size: 14px; color: #334155;">Observable, measurable statements that describe what the learner should know, understand, and demonstrate by the end of a lesson or sub-strand. Formatted using actionable Bloom's taxonomy verbs (e.g., <em>"By the end of the lesson, the learner should be able to create a 3-column table in Word to classify vertebrates"</em>).</p>
                    </div>

                    <div class="lms-callout" style="border-left: 4px solid #B45309; background: #F8FAFC; padding: 14px 18px;">
                      <h4 style="margin: 0 0 6px 0; color: #B45309;">Core Competencies</h4>
                      <p style="margin: 0; font-size: 14px; color: #334155;">The 7 foundational cognitive, social, and practical capabilities that every Kenyan learner must develop: Communication & Collaboration, Critical Thinking & Problem Solving, Imagination & Creativity, Citizenship, Learning to Learn, Self-Efficacy, and Digital Literacy.</p>
                    </div>

                    <div class="lms-callout" style="border-left: 4px solid #6D28D9; background: #F8FAFC; padding: 14px 18px;">
                      <h4 style="margin: 0 0 6px 0; color: #6D28D9;">Formative Assessment vs. Summative Assessment</h4>
                      <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Formative Assessment (Assessment FOR Learning):</strong> Ongoing diagnostic checks, observations, worksheets, and quizzes conducted during instruction to guide remediation and feedback.<br>
                      <strong>Summative Assessment (Assessment OF Learning):</strong> Evaluation conducted at the culmination of a strand, term, or level to measure overall achievement standards.</p>
                    </div>

                    <div class="lms-callout" style="border-left: 4px solid #BE123C; background: #F8FAFC; padding: 14px 18px;">
                      <h4 style="margin: 0 0 6px 0; color: #BE123C;">Competency Assessment Rubric</h4>
                      <p style="margin: 0; font-size: 14px; color: #334155;">A scoring tool with explicit qualitative performance criteria across four standardized KICD performance levels:
                        <ul style="margin: 6px 0 0 16px;">
                          <li><strong>Exceeding Expectations (EE):</strong> Consistently demonstrates mastery beyond required criteria with high autonomy, originality, and depth.</li>
                          <li><strong>Meeting Expectations (ME):</strong> Accurately and completely demonstrates all required criteria for the outcome.</li>
                          <li><strong>Approaching Expectations (AE):</strong> Demonstrates fundamental criteria but requires occasional guidance or exhibits minor inconsistencies.</li>
                          <li><strong>Below Expectations (BE):</strong> Struggles to meet basic criteria and requires intensive, scaffolded remediation.</li>
                        </ul>
                      </p>
                    </div>

                    <div class="lms-callout" style="border-left: 4px solid #0F766E; background: #F8FAFC; padding: 14px 18px;">
                      <h4 style="margin: 0 0 6px 0; color: #0F766E;">Digital Learning Artefact & Learner Portfolio</h4>
                      <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Digital Artefact:</strong> Any digital deliverable produced by a student (e.g., an Excel chart, a Word lab report, a PowerPoint presentation).<br>
                      <strong>Learner Portfolio:</strong> A structured, cumulative digital folder where student artefacts and reflections are archived to demonstrate competency growth over time.</p>
                    </div>
                  </div>
                `,
                resources: [
                  { name: 'Official_CBC_Curriculum_Glossary.pdf', size: '1.9 MB', type: 'pdf' }
                ]
              },
              {
                id: 'les_009_04',
                title: 'Lesson 2.2: Essential Glossary of Word, Excel & PowerPoint Applications',
                type: 'text',
                duration: '22 mins',
                mandatory: true,
                freePreview: false,
                contentHtml: `
                  <h3>Application Software Glossary for Educators</h3>
                  <p>Comprehensive definitions of the technical concepts and features used in practical classroom delivery:</p>

                  <h4>1. Microsoft Word Terms:</h4>
                  <ul>
                    <li><strong>Document Hierarchy & Styles:</strong> Structuring documents using Heading 1, Heading 2, and Normal styles for navigation and accessibility.</li>
                    <li><strong>Table Grid & Cell Properties:</strong> Structuring data into rows, columns, and merged header cells for worksheets and rubrics.</li>
                    <li><strong>Section Breaks:</strong> Splitting documents to allow different headers, footers, or page orientations (Portrait vs. Landscape).</li>
                    <li><strong>Review & Track Changes:</strong> Digital feedback tools allowing teachers to highlight learner text, add side comments, and suggest edits.</li>
                  </ul>

                  <h4>2. Microsoft Excel Terms:</h4>
                  <ul>
                    <li><strong>Cell Reference (Relative vs. Absolute):</strong> Relative (<code>A1</code>) shifts when copied; Absolute (<code>$A$1</code>) locks coordinates, critical for grading weighting.</li>
                    <li><strong>Formulas vs. Functions:</strong> A formula is an expression (e.g. <code>=A1+B1</code>); a function is a built-in algorithmic routine (e.g. <code>=SUM(A1:A20)</code>, <code>=AVERAGE(B2:B40)</code>, <code>=IF(C2>=80, "EE", "ME")</code>).</li>
                    <li><strong>Conditional Formatting:</strong> Automated styling rules that color-code cells based on values (e.g., green for EE, blue for ME, yellow for AE, red for BE).</li>
                    <li><strong>Data Validation:</strong> Constraining cell input to valid options (e.g., dropdown list for Male/Female or EE/ME/AE/BE).</li>
                  </ul>

                  <h4>3. Microsoft PowerPoint Terms:</h4>
                  <ul>
                    <li><strong>Slide Master:</strong> The universal template blueprint controlling background, fonts, and layouts across all slides simultaneously.</li>
                    <li><strong>Non-Linear Navigation:</strong> Using hyperlinked action buttons to jump between specific content slides based on learner choices rather than advancing sequentially.</li>
                    <li><strong>Trigger Animations:</strong> Interactive effects that only execute when a learner clicks a specific designated object (essential for interactive quizzes).</li>
                    <li><strong>Morph Transition:</strong> An advanced transition that smoothly animates objects moving between adjacent slides for simulation of scientific processes.</li>
                  </ul>
                `,
                resources: [
                  { name: 'Office_Software_Terminology_CheatSheet.pdf', size: '1.1 MB', type: 'pdf' }
                ]
              },
              {
                id: 'qiz_009_02',
                title: 'Quiz 2.1: Key Terms & Definitions Mastery Check',
                type: 'quiz',
                duration: '15 mins',
                mandatory: true,
                passMark: 80,
                attemptsAllowed: 3,
                questions: [
                  {
                    id: 'q1',
                    type: 'mcq',
                    text: 'In CBC grading descriptors, what does the performance rating "AE" represent?',
                    options: [
                      'Above Average',
                      'Approaching Expectations',
                      'Adequate Execution',
                      'Advanced Evaluation'
                    ],
                    correctAnswer: 1,
                    explanation: 'In the KICD CBC assessment framework, AE stands for Approaching Expectations.'
                  },
                  {
                    id: 'q2',
                    type: 'mcq',
                    text: 'In Microsoft Excel, what symbol is used to create an absolute cell reference that locks coordinates when copied?',
                    options: [
                      'Percent symbol (%)',
                      'Dollar sign ($)',
                      'Ampersand (&)',
                      'Hashtag (#)'
                    ],
                    correctAnswer: 1,
                    explanation: 'The dollar sign ($) locks the column letter and row number (e.g., $B$4).'
                  },
                  {
                    id: 'q3',
                    type: 'mcq',
                    text: 'In PowerPoint, what feature allows a slide object to animate only when the learner actively clicks on it?',
                    options: [
                      'Timing Loop',
                      'Trigger Animation',
                      'Slide Sorter',
                      'Auto-Advance'
                    ],
                    correctAnswer: 1,
                    explanation: 'Trigger animations bind an effect to the user clicking a designated shape or button, enabling interactive formative quizzes.'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec_009_03',
        title: 'Section 3: Microsoft Word — Universal CBC Lesson Planning, Worksheets & Rubrics',
        description: 'Hands-on creation of structured 40-minute CBC lesson plans, differentiated learner worksheets, and descriptive 4-level competency rubrics.',
        modules: [
          {
            id: 'mod_009_03',
            title: 'Module 3: Professional Word Processing in CBC Classrooms',
            lessons: [
              {
                id: 'les_009_05',
                title: 'Lesson 3.1: Practical Activity 1 — Building a Standard 40-Minute CBC Lesson Plan',
                type: 'video',
                duration: '28 mins',
                mandatory: true,
                freePreview: true,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                contentHtml: `
                  <h3>Step-by-Step Practical: Designing the Universal Lesson Plan</h3>
                  <p>In this activity, educators build an adaptable, professional 40-minute CBC lesson plan in Microsoft Word.</p>
                  
                  <h4>Step-by-Step Implementation Steps:</h4>
                  <ol>
                    <li><strong>Page Setup & Heading Hierarchy:</strong> Open Word, set 1-inch margins, and apply Heading 1 for the School Name and Learning Area.</li>
                    <li><strong>Administrative Header Grid:</strong> Insert a 4-column × 4-row table with borders for Grade, Learning Area, Strand, Sub-strand, Date, and Allocated Time (40 mins).</li>
                    <li><strong>Specific Learning Outcomes (SLOs):</strong> Create a bulleted list addressing Knowledge, Skills, and Values using Bloom's action verbs.</li>
                    <li><strong>Competency & PCI Mapping Strip:</strong> Insert a highlighted callout box specifying targeted Core Competencies and Pertinent & Contemporary Issues (PCIs).</li>
                    <li><strong>3-Stage Instructional Sequence Table:</strong>
                      <ul>
                        <li><strong>Introduction (5-8 mins):</strong> Puzzling question / digital provocation.</li>
                        <li><strong>Lesson Development (25 mins):</strong> Step-by-step collaborative learner inquiry.</li>
                        <li><strong>Conclusion & Reflection (7 mins):</strong> Plenary summary and self-assessment.</li>
                      </ul>
                    </li>
                    <li><strong>Extended Activities & Differentiated Support:</strong> Structured notes for advanced learners and remedial scaffolds.</li>
                  </ol>
                `,
                resources: [
                  { name: 'CBC_40Min_LessonPlan_Master_Template.docx', size: '820 KB', type: 'doc' },
                  { name: 'KICD_Lesson_Plan_Formatting_Guide.pdf', size: '1.5 MB', type: 'pdf' }
                ]
              },
              {
                id: 'les_009_06',
                title: 'Lesson 3.2: Practical Activity 2 — Designing Differentiated Learner Worksheets',
                type: 'text',
                duration: '24 mins',
                mandatory: true,
                freePreview: false,
                contentHtml: `
                  <h3>Practical Activity: Creating Cross-Disciplinary Student Worksheets</h3>
                  <p>A well-formatted worksheet guides independent inquiry and peer problem-solving without overwhelming learners.</p>

                  <h4>Key Techniques Applied:</h4>
                  <ul>
                    <li><strong>Form Fields & Shaded Response Areas:</strong> Inserting bordered 1-cell tables with light shading (<code>#F8FAFC</code>) where learners write explanations or record observations.</li>
                    <li><strong>Equation Editor & Special Formatting:</strong> Inserting mathematical fractions, chemical formulas (subscripts/superscripts), and scientific diagrams.</li>
                    <li><strong>Multi-Column Comparison Tables:</strong> Constructing 3-column analysis grids (e.g. <em>Term | Definition in Own Words | Real-World Application Example</em>).</li>
                    <li><strong>Peer Feedback Comment Blocks:</strong> Reserving a footer section for peer review and teacher constructive feedback.</li>
                  </ul>
                `,
                resources: [
                  { name: 'Differentiated_Inquiry_Worksheet_Sample.docx', size: '640 KB', type: 'doc' }
                ]
              },
              {
                id: 'les_009_07',
                title: 'Lesson 3.3: Practical Activity 3 — Constructing 4-Level CBC Assessment Rubrics',
                type: 'text',
                duration: '26 mins',
                mandatory: true,
                freePreview: false,
                contentHtml: `
                  <h3>Practical Activity: Authoring Descriptive Assessment Rubrics</h3>
                  <p>In CBC, a rubric must provide clear qualitative descriptors for all 4 performance levels instead of arbitrary numerical deductions.</p>

                  <h4>Rubric Architecture in Word:</h4>
                  <table class="data-table" style="width: 100%; margin: 16px 0;">
                    <thead>
                      <tr>
                        <th>Criteria</th>
                        <th>Exceeding Expectations (4)</th>
                        <th>Meeting Expectations (3)</th>
                        <th>Approaching Expectations (2)</th>
                        <th>Below Expectations (1)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Inquiry Execution & Investigation</strong></td>
                        <td>Autonomously formulates original hypotheses, executes steps flawlessly, and evaluates experimental anomalies.</td>
                        <td>Accurately conducts all steps of the inquiry and records valid empirical observations.</td>
                        <td>Follows basic steps with occasional guidance; observations lack complete consistency.</td>
                        <td>Unable to follow inquiry protocol without continuous one-on-one intervention.</td>
                      </tr>
                      <tr>
                        <td><strong>Use of Digital Tools</strong></td>
                        <td>Selects and applies advanced features (formulas, styles, animations) creatively and efficiently.</td>
                        <td>Correctly uses all required digital tools to format and present findings.</td>
                        <td>Uses basic features with minor formatting errors or omissions.</td>
                        <td>Struggles to operate software; requires frequent technical assistance.</td>
                      </tr>
                    </tbody>
                  </table>
                `,
                resources: [
                  { name: 'Universal_CBC_4Level_Rubric_Template.docx', size: '520 KB', type: 'doc' }
                ]
              },
              {
                id: 'asg_009_01',
                title: 'Assignment 3.1: Author a Complete CBC Lesson Plan & Descriptive Rubric in Word',
                type: 'assignment',
                duration: '60 mins',
                mandatory: true,
                rubric: [
                  { criterion: 'KICD Strand & SLO Alignment', maxPoints: 25 },
                  { criterion: 'Professional Word Typography & Table Layout', maxPoints: 25 },
                  { criterion: 'Inquiry-Based Learner Activities & Differentiation', maxPoints: 25 },
                  { criterion: '4-Level Descriptive Competency Rubric', maxPoints: 25 }
                ],
                instructions: 'Using Microsoft Word, create a 40-minute CBC lesson plan for your subject area complete with targeted SLOs, 3-stage instructional sequence, and a 4-level descriptive assessment rubric. Save and upload as a .docx or .pdf file.'
              }
            ]
          }
        ]
      },
      {
        id: 'sec_009_04',
        title: 'Section 4: Microsoft Excel — Continuous Assessment Trackers & Visual Data Analysis',
        description: 'Hands-on construction of automated CBC formative gradebooks, computational formula modeling, and dynamic charting for STEM, Agriculture, and Social Studies.',
        modules: [
          {
            id: 'mod_009_04',
            title: 'Module 4: Spreadsheets for Continuous Assessment & Data Modeling',
            lessons: [
              {
                id: 'les_009_08',
                title: 'Lesson 4.1: Practical Activity 1 — Building an Automated CBC Formative Gradebook',
                type: 'video',
                duration: '32 mins',
                mandatory: true,
                freePreview: true,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                contentHtml: `
                  <h3>Step-by-Step Practical: Building the CBC Assessment Tracker</h3>
                  <p>In this activity, educators build an intelligent spreadsheet that tracks continuous formative assessment across sub-strands, automatically computes competency averages, and highlights learners requiring remediation.</p>

                  <h4>Core Functions Mastered:</h4>
                  <ul>
                    <li><code>=AVERAGE(C5:F5)</code>: Calculating learner strand performance averages.</li>
                    <li><code>=IF(G5>=3.5, "EE", IF(G5>=2.5, "ME", IF(G5>=1.5, "AE", "BE")))</code>: Converting numeric scores to official KICD qualitative descriptors.</li>
                    <li><code>=COUNTIF(H$5:H$45, "EE")</code>: Generating classroom-wide performance distributions.</li>
                  </ul>

                  <h4>Conditional Formatting Rules:</h4>
                  <p>Apply automated color-coding: Green for <strong>EE</strong>, Blue for <strong>ME</strong>, Yellow for <strong>AE</strong>, and Soft Red for <strong>BE</strong>, giving immediate visual feedback on learner needs.</p>
                `,
                resources: [
                  { name: 'Automated_CBC_Formative_Gradebook_Master.xlsx', size: '1.6 MB', type: 'sheet' },
                  { name: 'Excel_Formulas_QuickReference_Kenyan_Teachers.pdf', size: '920 KB', type: 'pdf' }
                ]
              },
              {
                id: 'les_009_09',
                title: 'Lesson 4.2: Practical Activity 2 — Scientific & Agricultural Data Collection & Charting',
                type: 'text',
                duration: '28 mins',
                mandatory: true,
                freePreview: false,
                contentHtml: `
                  <h3>Practical Activity: Graphing Real-World Data in STEM & Agriculture</h3>
                  <p>Spreadsheets empower learners to visualize trends, formulate hypotheses, and communicate findings through professional charts.</p>

                  <h4>Classroom Projects:</h4>
                  <ol>
                    <li><strong>Integrated Science:</strong> Logging 14-day plant growth under varied light conditions with dynamic multi-line growth curves.</li>
                    <li><strong>Agriculture:</strong> Recording weekly broiler feed conversion ratios with clustered column charts.</li>
                    <li><strong>Social Studies:</strong> Analyzing county rainfall trends across months using combined column-and-line graphs.</li>
                  </ol>
                `,
                resources: [
                  { name: 'Science_Agriculture_Data_Model_Templates.xlsx', size: '1.2 MB', type: 'sheet' }
                ]
              },
              {
                id: 'qiz_009_03',
                title: 'Quiz 4.1: Excel Formulas, Competency Logic & Charts',
                type: 'quiz',
                duration: '15 mins',
                mandatory: true,
                passMark: 80,
                attemptsAllowed: 3,
                questions: [
                  {
                    id: 'q1',
                    type: 'mcq',
                    text: 'Which Excel formula correctly counts how many learners in column H achieved "ME" (Meeting Expectations)?',
                    options: [
                      '=SUM(H2:H40, "ME")',
                      '=COUNTIF(H2:H40, "ME")',
                      '=VLOOKUP("ME", H2:H40, 1)',
                      '=AVERAGE(H2:H40, "ME")'
                    ],
                    correctAnswer: 1,
                    explanation: '=COUNTIF(range, criteria) counts the number of cells matching the specified text string.'
                  },
                  {
                    id: 'q2',
                    type: 'mcq',
                    text: 'What Excel feature automatically highlights a cell in red whenever a learner scores "BE"?',
                    options: [
                      'AutoFormat',
                      'Conditional Formatting',
                      'Data Validation',
                      'Pivot Table'
                    ],
                    correctAnswer: 1,
                    explanation: 'Conditional Formatting dynamically alters fill and font colors based on cell value conditions.'
                  },
                  {
                    id: 'q3',
                    type: 'true_false',
                    text: 'True or False: A line chart is the ideal chart type for showing changes in plant height over continuous time.',
                    options: ['True', 'False'],
                    correctAnswer: 0,
                    explanation: 'True: Line charts show trends and continuous progression over time effectively.'
                  }
                ]
              },
              {
                id: 'asg_009_02',
                title: 'Assignment 4.1: Construct an Automated 40-Student CBC Gradebook & Summary Chart',
                type: 'assignment',
                duration: '60 mins',
                mandatory: true,
                rubric: [
                  { criterion: 'Clean Spreadsheet Architecture & Formatting', maxPoints: 25 },
                  { criterion: 'Accurate Formula & Function Implementation (AVERAGE, IF, COUNTIF)', maxPoints: 25 },
                  { criterion: 'Conditional Formatting for 4 Competency Levels', maxPoints: 25 },
                  { criterion: 'Dynamic Class Distribution Chart', maxPoints: 25 }
                ],
                instructions: 'Build a 40-student continuous assessment spreadsheet with at least 5 assessment tasks. Implement formulas to calculate student averages, convert numeric scores to EE/ME/AE/BE, apply color coding, and create a summary column chart showing the class distribution.'
              }
            ]
          }
        ]
      },
      {
        id: 'sec_009_05',
        title: 'Section 5: Microsoft PowerPoint — Interactive Multimedia Presentations & Formative Games',
        description: 'Design cognitive multimedia slide decks, non-linear branching learning experiences, and gamified classroom quizzes for all subject areas.',
        modules: [
          {
            id: 'mod_009_05',
            title: 'Module 5: Dynamic Slide Decks & Interactive Formative Tools',
            lessons: [
              {
                id: 'les_009_10',
                title: 'Lesson 5.1: Practical Activity 1 — Non-Linear Interactive Lesson Authoring',
                type: 'video',
                duration: '30 mins',
                mandatory: true,
                freePreview: true,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                contentHtml: `
                  <h3>Step-by-Step Practical: Designing Branching Interactive Decks</h3>
                  <p>Non-linear presentations transform passive viewing into active self-paced exploration where students control their own learning pathway.</p>

                  <h4>Key Techniques Mastered:</h4>
                  <ul>
                    <li><strong>Slide Master Layouts:</strong> Creating uniform navigation bars with "Home", "Strand Index", and "Glossary" buttons that persist across all slides.</li>
                    <li><strong>Action Buttons & Hyperlinks:</strong> Linking buttons to specific slide anchors, external educational simulations, and downloadable materials.</li>
                    <li><strong>Branching Learning Pathways:</strong> Presenting an essential question where choosing Option A directs the learner to a remediation slide, while Option B unlocks the extension challenge.</li>
                  </ul>
                `,
                resources: [
                  { name: 'NonLinear_Interactive_CBC_Template.pptx', size: '3.4 MB', type: 'slide' },
                  { name: 'Mayer_Multimedia_Principles_Educators.pdf', size: '1.3 MB', type: 'pdf' }
                ]
              },
              {
                id: 'les_009_11',
                title: 'Lesson 5.2: Practical Activity 2 — Building Gamified Classroom Quiz Decks',
                type: 'text',
                duration: '26 mins',
                mandatory: true,
                freePreview: false,
                contentHtml: `
                  <h3>Practical Activity: Creating Trigger-Based Gamified Quizzes</h3>
                  <p>Turn standard formative checks into exciting interactive games using PowerPoint animation triggers.</p>

                  <h4>Step-by-Step Construction Guide:</h4>
                  <ol>
                    <li>Create a Question Slide with 4 response shapes (Option A, B, C, D).</li>
                    <li>Insert two feedback panels: Green for "Correct!" and Red for "Try Again".</li>
                    <li>Open the <strong>Animation Pane</strong> and add entrance/exit animations to the feedback panels.</li>
                    <li>Click <strong>Timing &rarr; Trigger &rarr; Start effect on click of...</strong> and select the corresponding button.</li>
                    <li>Test in Slide Show mode: Clicking wrong answers reveals immediate scaffolding, while clicking the correct answer plays fanfare audio and reveals the progression button!</li>
                  </ol>
                `,
                resources: [
                  { name: 'Gamified_Quiz_Trigger_Master_Template.pptx', size: '2.8 MB', type: 'slide' }
                ]
              },
              {
                id: 'asg_009_03',
                title: 'Assignment 5.1: Author a 10-Slide Interactive CBC Learning Deck with Formative Quiz',
                type: 'assignment',
                duration: '60 mins',
                mandatory: true,
                rubric: [
                  { criterion: 'Cognitive Multimedia Design (Mayer’s Principles)', maxPoints: 25 },
                  { criterion: 'Non-Linear Navigation & Action Buttons', maxPoints: 25 },
                  { criterion: 'Interactive Trigger-Based Formative Quiz Slide', maxPoints: 25 },
                  { criterion: 'Direct Curriculum & Strand Relevance', maxPoints: 25 }
                ],
                instructions: 'Design a 10-slide interactive PowerPoint deck for a specific CBC sub-strand. Include a main menu, structured content with visuals, hyperlinked navigation buttons, and at least one interactive quiz slide with trigger-based instant feedback.'
              }
            ]
          }
        ]
      },
      {
        id: 'sec_009_06',
        title: 'Section 6: Capstone Project — Integrated Cross-Curricular Digital Portfolio',
        description: 'Synthesize Word, Excel, and PowerPoint into an authentic cross-curricular teaching portfolio ready for immediate classroom implementation.',
        modules: [
          {
            id: 'mod_009_06',
            title: 'Module 6: Cross-Curricular Project Synthesis & Capstone',
            lessons: [
              {
                id: 'les_009_12',
                title: 'Lesson 6.1: Designing Cross-Disciplinary CBC Projects',
                type: 'text',
                duration: '25 mins',
                mandatory: true,
                freePreview: true,
                contentHtml: `
                  <h3>The Multi-Tool Synthesis: An Authentic Community Project</h3>
                  <p>In authentic CBC practice, digital tools do not operate in silos. A real-world learner investigation brings all three applications together:</p>

                  <h4>Exemplary Project: "Community Clean Water & Health Initiative"</h4>
                  <ul>
                    <li><strong>Phase 1 (Word):</strong> Learners author an investigation proposal and inquiry questionnaire with structured interview tables.</li>
                    <li><strong>Phase 2 (Excel):</strong> Learners log water sample testing data, household water access figures, and calculate averages and trend charts.</li>
                    <li><strong>Phase 3 (PowerPoint):</strong> Learners assemble an advocacy presentation incorporating their Word findings, Excel charts, and photographs to present to the school assembly and local community leaders.</li>
                  </ul>
                `,
                resources: [
                  { name: 'Cross_Curricular_Project_Blueprint.docx', size: '1.1 MB', type: 'doc' }
                ]
              },
              {
                id: 'asg_009_04',
                title: 'Final Capstone Project: Comprehensive Digital Integration Teaching Portfolio',
                type: 'assignment',
                duration: '90 mins',
                mandatory: true,
                rubric: [
                  { criterion: 'Syllabus & Cross-Strand Alignment', maxPoints: 25 },
                  { criterion: 'Word Instructional Design Artefact', maxPoints: 25 },
                  { criterion: 'Excel Computational Model & Gradebook Artefact', maxPoints: 25 },
                  { criterion: 'PowerPoint Interactive Multi-Media Artefact', maxPoints: 25 }
                ],
                instructions: 'Submit your completed Capstone Digital Teaching Portfolio combining your finalized Word Lesson Plan & Rubric, your Excel Continuous Assessment Model, and your interactive PowerPoint Deck for a cohesive sub-strand unit.'
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
    const baseCourses = (window.COURSES && Array.isArray(window.COURSES)) ? window.COURSES : [];

    if (!storedCourses || !Array.isArray(storedCourses) || storedCourses.length === 0) {
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
    } else {
      // Synchronize any courses from window.COURSES missing in storedCourses
      let syncUpdated = false;
      baseCourses.forEach(c => {
        const existingIdx = storedCourses.findIndex(sc => sc.id === c.id);
        if (existingIdx === -1) {
          storedCourses.push({
            ...c,
            status: c.status || 'published',
            accessType: c.accessType || 'open',
            accessCode: c.accessCode || ('IK-' + c.id.toUpperCase().replace('_', '-')),
            curriculum: DEFAULT_CURRICULUM[c.id] || generateDefaultCurriculum(c),
            totalEnrollments: c.enrollments || 120,
            activeStudents: Math.round((c.enrollments || 120) * 0.78),
            completionRate: 84,
            cohorts: ['Junior Secondary Grade 7-9', 'Upper Primary Educators', 'Mathematics Faculty Trainees'],
            certificateTemplate: 'standard_cpd',
            createdAt: '2026-08-01T08:00:00.000Z',
            updatedAt: '2026-09-20T12:00:00.000Z'
          });
          syncUpdated = true;
        } else if (DEFAULT_CURRICULUM[c.id] && (!storedCourses[existingIdx].curriculum || storedCourses[existingIdx].curriculum.length === 0)) {
          storedCourses[existingIdx].curriculum = DEFAULT_CURRICULUM[c.id];
          syncUpdated = true;
        }
      });
      if (syncUpdated) {
        setItem(STORAGE_KEYS.COURSES, storedCourses);
      }
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

    getCourses: function () {
      return this.getAllCourses();
    },

    getCourseById: function (courseId) {
      const courses = this.getAllCourses();
      return courses.find(c => c.id === courseId) || null;
    },

    getCourse: function (courseId) {
      return this.getCourseById(courseId);
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
