/**
 * ============================================================
 * INSTRUCTIFY KENYA — LMS CURRICULUM & STRAND STUDIO ENGINE
 * Dedicated authoring engine for Strands/Topics, Sub-strands/
 * Sub-topics, Pedagogical Explanations, and Tiered Assessments.
 * Aligned with Kenyan Competency Based Curriculum (CBC) &
 * International Modular Standards.
 * ============================================================
 */

(function(root) {
  'use strict';

  const STORAGE_KEY_CURRICULUM = 'instructify_curriculum_studio_v1';

  // ── Default Exemplar CBC Curricula for Immediate Productivity ──
  const DEFAULT_EXEMPLAR_STRANDS = [
    {
      id: 'strand_cbc_1',
      code: 'STR-01',
      title: 'Foundations of Competency-Based Learning & Digital Pedagogy',
      rationale: 'Equips educators with practical frameworks to transition from teacher-centric instruction to learner-centred competency facilitation.',
      competencies: ['Critical Thinking', 'Digital Literacy', 'Pedagogical Facilitation', 'Inquiry-Based Design'],
      assessment: {
        id: 'asm_strand_1',
        level: 'strand',
        type: 'rubric',
        title: 'Strand 1 Capstone: CBC Lesson Facilitation Portfolio & Rubric',
        instructions: 'Design and submit an end-of-strand comprehensive digital lesson plan with embedded 4-tier rubric criteria for a Grade 7–9 CBC class.',
        passMark: 75,
        rubricCriteria: [
          {
            criterion: 'Alignment of Learning Outcomes with CBC Strands',
            exceeding: 'Specific learning outcomes are impeccably mapped to KICD core competencies with clear evidence of learner agency.',
            meeting: 'Learning outcomes clearly identify measurable competencies and align with curriculum designs.',
            approaching: 'Outcomes are stated but lack measurable competency action verbs or clear alignment.',
            below: 'Outcomes are teacher-centred or missing competency alignment.'
          },
          {
            criterion: 'Digital Tool Integration & Accessibility',
            exceeding: 'Seamlessly incorporates multimodal tools (audio, simulations, offline fallbacks) catering to varied learning abilities.',
            meeting: 'Incorporates appropriate digital tools that actively support learner participation.',
            approaching: 'Digital tools are used primarily as passive presentation aids rather than active learning.',
            below: 'No digital integration or tools create significant cognitive overload.'
          },
          {
            criterion: 'Formative Assessment & Real-Time Feedback',
            exceeding: 'Embeds continuous self-assessment, peer feedback routines, and clear rubrics with student reflection prompts.',
            meeting: 'Includes structured formative check-ins and defined success criteria for learners.',
            approaching: 'Assessment is limited to a single end-of-lesson test with minimal real-time guidance.',
            below: 'No formative assessment mechanisms included in the lesson flow.'
          }
        ]
      },
      substrands: [
        {
          id: 'sub_cbc_1_1',
          code: 'SUB-1.1',
          title: 'Unpacking CBC Strands and Formulating Specific Learning Outcomes',
          duration: '35 mins',
          deliveryType: 'Interactive Practical',
          explanation: {
            overview: 'Learn how to deconstruct national curriculum designs into daily, measurable Specific Learning Outcomes (SLOs) focused on learner capability rather than rote memorization.',
            coreContentHtml: `
              <h3>1. The Anatomy of a High-Impact CBC Learning Outcome</h3>
              <p>In the Competency-Based Curriculum, learning outcomes must state what the learner <strong>does, creates, or solves</strong>, rather than what the teacher covers. A robust outcome includes:</p>
              <ul>
                <li><strong>Observable Action Verb:</strong> e.g., <em>construct, categorize, synthesize, demonstrate</em> (avoid vague verbs like <em>know, understand, learn</em>).</li>
                <li><strong>Context / Condition:</strong> e.g., <em>using collaborative digital worksheets, given local environmental datasets</em>.</li>
                <li><strong>Degree of Mastery / Performance Criterion:</strong> e.g., <em>achieving at least 80% accuracy, adhering to ethical cyber protocols</em>.</li>
              </ul>
              <div class="lms-callout lms-callout-tip">
                <strong>Pedagogical Golden Rule:</strong> If you cannot observe or measure the outcome through a student artifact, presentation, or performance, refine the verb!
              </div>
            `,
            teachingNotes: 'Encourage teachers to work in pairs during workshops. Have them convert 3 legacy 8-4-4 lesson objectives into learner-centred CBC outcomes with observable performance metrics.',
            keyTerms: [
              { term: 'Strand', definition: 'A broad thematic domain of learning within a subject curriculum (e.g. Digital Literacy).' },
              { term: 'Sub-strand', definition: 'A specific topic or modular sub-unit of study derived from a primary strand.' },
              { term: 'Specific Learning Outcome (SLO)', definition: 'A clear, observable statement of what a learner should be able to perform by the end of a lesson.' }
            ],
            misconceptions: [
              { misconception: 'CBC eliminates syllabus coverage.', correction: 'CBC shifts the focus from superficial content speed to demonstrable mastery of core concepts.' },
              { misconception: 'Every outcome must require a computer.', correction: 'Digital competencies can be nurtured unplugged through algorithmic thinking games and card sorting.' }
            ],
            media: {
              videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              slidesUrl: 'downloads/CBC_Lesson_Planning_and_Strand_Alignment_Toolkit.pdf'
            },
            downloads: [
              { name: 'KICD_Strand_Alignment_Planner_Template.docx', type: 'DOCX', size: '240 KB' },
              { name: 'Bloom_Taxonomy_Action_Verbs_Reference.pdf', type: 'PDF', size: '1.2 MB' }
            ]
          },
          assessment: {
            id: 'asm_sub_1_1',
            level: 'substrand',
            type: 'quiz',
            title: 'Sub-strand 1.1 Formative Check: Identifying Measurable CBC Outcomes',
            instructions: 'Test your understanding of CBC outcome construction and action verb precision.',
            passMark: 80,
            attemptsAllowed: 3,
            questions: [
              {
                id: 'q1',
                text: 'Which of the following represents a properly formulated CBC Specific Learning Outcome?',
                options: [
                  'Learners will understand the concept of digital citizenship.',
                  'By the end of the lesson, the learner should be able to classify 4 online risks and draft personal safety rules in their digital journal.',
                  'To teach students how to browse the internet safely.',
                  'Students will know all about cyberbullying.'
                ],
                correctAnswer: 1,
                explanation: 'Option B focuses on what the learner demonstrates (classifying 4 risks & drafting rules) using concrete observable action verbs.'
              },
              {
                id: 'q2',
                text: 'True or False: In a competency-based lesson plan, the Specific Learning Outcome must be directly tied to an assessable learner performance or product.',
                options: ['True', 'False'],
                correctAnswer: 0,
                explanation: 'True. In CBC, assessment is criterion-referenced; every outcome must produce observable evidence of learning.'
              }
            ]
          }
        },
        {
          id: 'sub_cbc_1_2',
          code: 'SUB-1.2',
          title: 'Facilitating Inquiry & Group Collaboration in CBC Classrooms',
          duration: '45 mins',
          deliveryType: 'Pedagogical Lab',
          explanation: {
            overview: 'Strategies for managing active, noisy, and productive collaborative learning groups even in high-enrolment classrooms.',
            coreContentHtml: `
              <h3>Facilitating Meaningful Peer Collaboration</h3>
              <p>True collaboration is not just sitting in groups of four while one child does all the writing. Effective CBC group work employs <strong>interdependent roles</strong>:</p>
              <ol>
                <li><strong>Facilitator / Team Leader:</strong> Ensures everyone contributes and keeps the group on time.</li>
                <li><strong>Recorder / Documenter:</strong> Synthesizes consensus points on chart paper or shared tablet.</li>
                <li><strong>Resource Manager:</strong> Collects and returns lab tools, tokens, or digital devices.</li>
                <li><strong>Presenter / Voice:</strong> Shares the team findings during whole-class consolidation.</li>
              </ol>
            `,
            teachingNotes: 'Introduce the "Ask 3 Before You Ask Me" routine to foster learner self-reliance and peer problem-solving before calling the teacher.',
            keyTerms: [
              { term: 'Station Rotation', definition: 'A blended learning strategy where students cycle through instructional stations on a fixed schedule.' },
              { term: 'Interdependence', definition: 'A structure where each student’s success depends on the collective contribution of teammates.' }
            ],
            misconceptions: [
              { misconception: 'Group work means less work for the teacher.', correction: 'Group work requires intense teacher mobility, formative eavesdropping, and targeted questioning.' }
            ],
            media: {
              videoUrl: '',
              slidesUrl: ''
            },
            downloads: [
              { name: 'Group_Roles_Lanyard_Cards_Printable.pdf', type: 'PDF', size: '540 KB' }
            ]
          },
          assessment: {
            id: 'asm_sub_1_2',
            level: 'substrand',
            type: 'assignment',
            title: 'Sub-strand 1.2 Reflection: Collaborative Group Protocol Design',
            instructions: 'Submit a 1-page classroom management plan detailing how you will allocate group roles and assess individual accountability during a 40-minute collaborative task.',
            passMark: 70
          }
        }
      ]
    },
    {
      id: 'strand_cbc_2',
      code: 'STR-02',
      title: 'Formative Assessment Routines & Criterion-Referenced Grading',
      rationale: 'Master the art of real-time diagnostic assessment and qualitative 4-level competency profiling without relying solely on pen-and-paper examinations.',
      competencies: ['Diagnostic Evaluation', 'Rubric Construction', 'Differentiated Feedback', 'Self-Assessment Guidance'],
      assessment: {
        id: 'asm_strand_2',
        level: 'strand',
        type: 'rubric',
        title: 'Strand 2 Summative: 4-Tier CBC Rubric Authoring & Evidence Matrix',
        instructions: 'Author a complete 4-tier rubric for your subject area with explicit behavioral descriptors for Exceeding, Meeting, Approaching, and Below Expectations.',
        passMark: 80,
        rubricCriteria: [
          {
            criterion: 'Clarity of Performance Descriptors',
            exceeding: 'Descriptors use vivid, qualitative milestones that allow learners to self-assess with zero teacher translation.',
            meeting: 'Descriptors clearly distinguish between adequate and emerging competency levels.',
            approaching: 'Descriptors rely heavily on quantitative counts rather than qualitative depth.',
            below: 'Descriptors are vague or use subjective adjectives like "good" or "poor".'
          }
        ]
      },
      substrands: [
        {
          id: 'sub_cbc_2_1',
          code: 'SUB-2.1',
          title: 'Constructing 4-Level Competency Rubrics (KICD Aligned)',
          duration: '40 mins',
          deliveryType: 'Rubric Workshop',
          explanation: {
            overview: 'Unpack the 4 standard CBC achievement levels: Exceeding Expectations (EE), Meeting Expectations (ME), Approaching Expectations (AE), and Below Expectations (BE).',
            coreContentHtml: `
              <h3>Demystifying the Four CBC Achievement Levels</h3>
              <p>In CBC, assessment is criterion-referenced rather than normative (curved). Learners are benchmarked against tangible capability descriptors:</p>
              <ul>
                <li><strong>🟢 Exceeding Expectations (Level 4):</strong> Demonstrates mastery beyond grade-level expectation, applies concepts innovatively in novel contexts, and assists peers.</li>
                <li><strong>🔵 Meeting Expectations (Level 3):</strong> Successfully fulfills all criteria of the learning outcome independently and accurately.</li>
                <li><strong>🟡 Approaching Expectations (Level 2):</strong> Demonstrates partial competency; can complete the task with intermittent guidance or scaffolding.</li>
                <li><strong>🔴 Below Expectations (Level 1):</strong> Requires substantial one-on-one intervention and foundational remediation.</li>
              </ul>
            `,
            teachingNotes: 'Remind participants that "Below Expectations" is not a badge of failure; it is an immediate call for differentiated remediation.',
            keyTerms: [
              { term: 'Criterion-Referenced Assessment', definition: 'Evaluation benchmarked against predetermined standard criteria rather than class rank.' }
            ],
            misconceptions: [
              { misconception: 'Meeting Expectations means the student only got a C.', correction: 'Meeting Expectations (ME) represents full mastery of the national curricular standard.' }
            ],
            media: { videoUrl: '', slidesUrl: '' },
            downloads: []
          },
          assessment: null
        }
      ]
    }
  ];

  // ── Main Curriculum Studio Controller ──
  const LMSCurriculumStudio = {
    currentCourseId: null,
    currentCourse: null,
    mode: 'cbc', // 'cbc' (Strand/Sub-strand) or 'standard' (Topic/Sub-topic)
    strands: [],
    activeStrandId: null,
    activeSubstrandId: null,

    // ── Labels helper ──
    getLabels: function() {
      if (this.mode === 'cbc') {
        return {
          mode: 'cbc',
          strand: 'Strand',
          strands: 'Strands',
          substrand: 'Sub-strand',
          substrands: 'Sub-strands',
          addStrand: '+ Add New Strand',
          addSubstrand: '+ Add Sub-strand',
          strandAssessment: 'Strand Summative Assessment',
          substrandAssessment: 'Sub-strand Formative Assessment',
          strandCodePlaceholder: 'e.g. STR-01',
          substrandCodePlaceholder: 'e.g. SUB-1.1'
        };
      }
      return {
        mode: 'standard',
        strand: 'Topic',
        strands: 'Topics',
        substrand: 'Sub-topic',
        substrands: 'Sub-topics',
        addStrand: '+ Add New Topic',
        addSubstrand: '+ Add Sub-topic',
        strandAssessment: 'Topic Summative Assessment',
        substrandAssessment: 'Sub-topic Formative Assessment',
        strandCodePlaceholder: 'e.g. TOPIC-01',
        substrandCodePlaceholder: 'e.g. SUB-01'
      };
    },

    setMode: function(newMode) {
      this.mode = newMode === 'standard' ? 'standard' : 'cbc';
      try {
        localStorage.setItem('instructify_curriculum_mode', this.mode);
      } catch (e) {}
      return this.mode;
    },

    // ── Initialization ──
    init: function(courseId) {
      try {
        const savedMode = localStorage.getItem('instructify_curriculum_mode');
        if (savedMode) this.mode = savedMode;
      } catch (e) {}

      // Find course from LMSEngine or courses
      let course = null;
      const lmsEngineObj = typeof LMSEngine !== 'undefined' ? LMSEngine : (typeof window !== 'undefined' ? window.LMSEngine : null);
      const coursesList = typeof courses !== 'undefined' ? courses : (typeof window !== 'undefined' ? window.courses : (root && root.courses ? root.courses : null));

      if (lmsEngineObj && typeof lmsEngineObj.getCourseById === 'function') {
        course = lmsEngineObj.getCourseById(courseId);
      }
      if (!course && coursesList && Array.isArray(coursesList)) {
        course = coursesList.find(c => c.id === courseId);
      }

      // If no valid course found, use first available course or create a mock
      if (!course) {
        if (coursesList && coursesList.length > 0) {
          course = coursesList[0];
          courseId = course.id;
        } else {
          course = {
            id: 'cbc-foundations',
            title: 'ICT Integration in CBC Education',
            category: 'CBC & Curriculum',
            level: 'Intermediate'
          };
          courseId = course.id;
        }
      }

      this.currentCourseId = courseId;
      this.currentCourse = course;

      // Check for stored curriculum in localStorage first
      let loadedStrands = null;
      try {
        const store = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULUM) || '{}');
        if (store[courseId] && Array.isArray(store[courseId]) && store[courseId].length > 0) {
          loadedStrands = store[courseId];
        }
      } catch (e) {}

      // If not stored, check if course has a curriculum object we can adapt
      if (!loadedStrands && course.curriculum && Array.isArray(course.curriculum) && course.curriculum.length > 0) {
        loadedStrands = this.adaptCurriculumToStrands(course.curriculum);
      }

      // If still empty, use default exemplars
      if (!loadedStrands || loadedStrands.length === 0) {
        loadedStrands = JSON.parse(JSON.stringify(DEFAULT_EXEMPLAR_STRANDS));
      }

      this.strands = loadedStrands;
      if (this.strands.length > 0) {
        this.activeStrandId = this.strands[0].id;
        if (this.strands[0].substrands && this.strands[0].substrands.length > 0) {
          this.activeSubstrandId = this.strands[0].substrands[0].id;
        }
      }

      return this;
    },

    // Adapter for legacy section/module/lesson curriculum
    adaptCurriculumToStrands: function(curriculum) {
      return curriculum.map((sec, secIdx) => {
        const strandId = sec.id || 'strand_' + (secIdx + 1);
        const strandCode = sec.strandCode || 'STR-0' + (secIdx + 1);
        const substrands = [];

        (sec.modules || []).forEach((mod, modIdx) => {
          const subId = mod.id || 'sub_' + (secIdx + 1) + '_' + (modIdx + 1);
          const subCode = mod.substrandCode || 'SUB-' + (secIdx + 1) + '.' + (modIdx + 1);

          let coreExplanation = '';
          let subAssessment = null;

          (mod.lessons || []).forEach(les => {
            if (les.type === 'quiz' || les.type === 'assignment') {
              if (!subAssessment) {
                subAssessment = {
                  id: les.id,
                  level: 'substrand',
                  type: les.type,
                  title: les.title,
                  instructions: les.instructions || '',
                  passMark: les.passMark || 80,
                  questions: les.questions || [],
                  rubricCriteria: les.rubric || []
                };
              }
            } else {
              coreExplanation += (les.contentHtml || les.description || '') + '\n';
            }
          });

          substrands.push({
            id: subId,
            code: subCode,
            title: mod.title || 'Sub-strand ' + (modIdx + 1),
            duration: mod.duration || '30 mins',
            deliveryType: mod.deliveryType || 'Standard',
            explanation: {
              overview: mod.description || '',
              coreContentHtml: coreExplanation || '<p>Comprehensive explanatory guide and learner notes.</p>',
              teachingNotes: mod.teachingNotes || '',
              keyTerms: mod.keyTerms || [],
              misconceptions: mod.misconceptions || [],
              media: mod.media || { videoUrl: '', slidesUrl: '' },
              downloads: mod.downloads || []
            },
            assessment: subAssessment
          });
        });

        return {
          id: strandId,
          code: strandCode,
          title: sec.title || 'Strand ' + (secIdx + 1),
          rationale: sec.description || '',
          competencies: sec.competencies || ['Core Pedagogy'],
          assessment: sec.assessment || null,
          substrands: substrands
        };
      });
    },

    // ── CRUD: Strands / Topics ──
    addStrand: function(data) {
      const idx = this.strands.length + 1;
      const strand = {
        id: 'strand_' + Date.now().toString(36),
        code: data.code || (this.mode === 'cbc' ? 'STR-0' + idx : 'TOPIC-0' + idx),
        title: data.title || (this.mode === 'cbc' ? 'New Strand ' + idx : 'New Topic ' + idx),
        rationale: data.rationale || '',
        competencies: Array.isArray(data.competencies) ? data.competencies : (data.competencies ? data.competencies.split(',').map(s=>s.trim()).filter(Boolean) : []),
        assessment: data.assessment || null,
        substrands: []
      };

      this.strands.push(strand);
      this.activeStrandId = strand.id;
      this.activeSubstrandId = null;
      this.persist();
      return strand;
    },

    updateStrand: function(strandId, data) {
      const strand = this.getStrand(strandId);
      if (!strand) return null;
      if (data.title !== undefined) strand.title = data.title;
      if (data.code !== undefined) strand.code = data.code;
      if (data.rationale !== undefined) strand.rationale = data.rationale;
      if (data.competencies !== undefined) {
        strand.competencies = Array.isArray(data.competencies) ? data.competencies : data.competencies.split(',').map(s=>s.trim()).filter(Boolean);
      }
      this.persist();
      return strand;
    },

    deleteStrand: function(strandId) {
      this.strands = this.strands.filter(s => s.id !== strandId);
      if (this.activeStrandId === strandId) {
        this.activeStrandId = this.strands[0] ? this.strands[0].id : null;
        this.activeSubstrandId = this.strands[0] && this.strands[0].substrands[0] ? this.strands[0].substrands[0].id : null;
      }
      this.persist();
    },

    reorderStrands: function(fromIndex, toIndex) {
      if (fromIndex < 0 || fromIndex >= this.strands.length || toIndex < 0 || toIndex >= this.strands.length) return;
      const item = this.strands.splice(fromIndex, 1)[0];
      this.strands.splice(toIndex, 0, item);
      this.persist();
    },

    // ── CRUD: Sub-strands / Sub-topics ──
    addSubstrand: function(strandId, data) {
      const strand = this.getStrand(strandId);
      if (!strand) return null;

      const subIdx = strand.substrands.length + 1;
      const sIdx = this.strands.indexOf(strand) + 1;
      const sub = {
        id: 'sub_' + Date.now().toString(36),
        code: data.code || (this.mode === 'cbc' ? 'SUB-' + sIdx + '.' + subIdx : 'SUB-' + subIdx),
        title: data.title || (this.mode === 'cbc' ? 'Sub-strand ' + sIdx + '.' + subIdx : 'Sub-topic ' + subIdx),
        duration: data.duration || '30 mins',
        deliveryType: data.deliveryType || 'Lecture & Inquiry',
        explanation: {
          overview: data.overview || '',
          coreContentHtml: data.coreContentHtml || '<p>Enter detailed lesson explanation, concept breakdown, and learning points here.</p>',
          teachingNotes: data.teachingNotes || '',
          keyTerms: data.keyTerms || [],
          misconceptions: data.misconceptions || [],
          media: data.media || { videoUrl: '', slidesUrl: '' },
          downloads: data.downloads || []
        },
        assessment: data.assessment || null
      };

      strand.substrands.push(sub);
      this.activeStrandId = strandId;
      this.activeSubstrandId = sub.id;
      this.persist();
      return sub;
    },

    updateSubstrand: function(strandId, substrandId, data) {
      const sub = this.getSubstrand(strandId, substrandId);
      if (!sub) return null;
      if (data.title !== undefined) sub.title = data.title;
      if (data.code !== undefined) sub.code = data.code;
      if (data.duration !== undefined) sub.duration = data.duration;
      if (data.deliveryType !== undefined) sub.deliveryType = data.deliveryType;
      this.persist();
      return sub;
    },

    deleteSubstrand: function(strandId, substrandId) {
      const strand = this.getStrand(strandId);
      if (!strand) return;
      strand.substrands = strand.substrands.filter(s => s.id !== substrandId);
      if (this.activeSubstrandId === substrandId) {
        this.activeSubstrandId = strand.substrands[0] ? strand.substrands[0].id : null;
      }
      this.persist();
    },

    // ── Explanation Authoring ──
    saveExplanation: function(strandId, substrandId, explanationData) {
      const sub = this.getSubstrand(strandId, substrandId);
      if (!sub) return null;
      sub.explanation = Object.assign(sub.explanation || {}, explanationData);
      this.persist();
      return sub.explanation;
    },

    // ── Assessments: Strand or Sub-strand Level ──
    saveAssessment: function(level, parentId, assessmentData) {
      let targetObj = null;

      if (level === 'strand') {
        const strand = this.getStrand(parentId);
        if (!strand) return null;
        strand.assessment = assessmentData ? Object.assign({ id: 'asm_strand_' + Date.now().toString(36), level: 'strand' }, assessmentData) : null;
        targetObj = strand.assessment;
      } else {
        // level === 'substrand'
        let foundSub = null;
        for (const s of this.strands) {
          const sub = (s.substrands || []).find(sub => sub.id === parentId);
          if (sub) { foundSub = sub; break; }
        }
        if (!foundSub) return null;
        foundSub.assessment = assessmentData ? Object.assign({ id: 'asm_sub_' + Date.now().toString(36), level: 'substrand' }, assessmentData) : null;
        targetObj = foundSub.assessment;
      }

      this.persist();
      return targetObj;
    },

    removeAssessment: function(level, parentId) {
      return this.saveAssessment(level, parentId, null);
    },

    // ── Finders & Accessors ──
    getStrand: function(strandId) {
      return this.strands.find(s => s.id === strandId) || null;
    },

    getSubstrand: function(strandId, substrandId) {
      const strand = this.getStrand(strandId);
      if (!strand) return null;
      return (strand.substrands || []).find(s => s.id === substrandId) || null;
    },

    getActiveStrand: function() {
      return this.getStrand(this.activeStrandId) || this.strands[0] || null;
    },

    getActiveSubstrand: function() {
      const strand = this.getActiveStrand();
      if (!strand) return null;
      return (strand.substrands || []).find(s => s.id === this.activeSubstrandId) || strand.substrands[0] || null;
    },

    // ── Persistence & Cross-System Synchronization ──
    persist: function() {
      if (!this.currentCourseId) return;

      // 1. Save to local storage for curriculum studio
      try {
        let store = {};
        try { store = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULUM) || '{}'); } catch(e){}
        store[this.currentCourseId] = this.strands;
        localStorage.setItem(STORAGE_KEY_CURRICULUM, JSON.stringify(store));
      } catch (e) {
        console.warn('[CurriculumStudio] LocalStorage write failed:', e);
      }

      // 2. Synchronize back into LMSEngine & Course objects for instant Player integration
      this.syncToLMSEngine();

      // 3. Dispatch global event for live reactive updates
      if (typeof window !== 'undefined') {
        const evt = new CustomEvent('lms:curriculum-updated', {
          detail: {
            courseId: this.currentCourseId,
            strands: this.strands
          }
        });
        window.dispatchEvent(evt);
      }
    },

    syncToLMSEngine: function() {
      // Transform our rich Strands/Sub-strands hierarchy into LMS course curriculum format
      const convertedCurriculum = this.strands.map((strand, sIdx) => {
        const secModules = (strand.substrands || []).map((sub, mIdx) => {
          const lessons = [];

          // 1. Main Lesson with Explanations
          lessons.push({
            id: 'les_' + sub.id,
            title: `${sub.code}: ${sub.title}`,
            type: 'text',
            duration: sub.duration || '25 mins',
            mandatory: true,
            freePreview: (sIdx === 0 && mIdx === 0),
            contentHtml: sub.explanation ? (
              `<div class="lms-strand-meta-badge" style="display:inline-block;padding:4px 10px;background:#EEF2FF;color:#2145E6;border-radius:6px;font-size:12px;font-weight:700;margin-bottom:12px;">` +
                `🇰🇪 ${strand.code} › ${sub.code}` +
              `</div>` +
              `<h2 style="font-size:22px;color:#0F172A;font-weight:800;margin-bottom:12px;">${sub.title}</h2>` +
              (sub.explanation.overview ? `<p style="font-size:15px;color:#475569;font-weight:500;line-height:1.6;margin-bottom:20px;">${sub.explanation.overview}</p>` : '') +
              (sub.explanation.coreContentHtml || '') +
              (sub.explanation.teachingNotes ? `
                <div class="lms-callout lms-callout-info" style="margin-top:24px;">
                  <strong style="color:#2145E6;">👨‍🏫 Teacher Facilitation Notes:</strong>
                  <p style="margin:4px 0 0;font-size:13.5px;color:#1E293B;">${sub.explanation.teachingNotes}</p>
                </div>
              ` : '')
            ) : '<p>Comprehensive explanatory guide and lesson notes.</p>',
            videoUrl: (sub.explanation && sub.explanation.media) ? sub.explanation.media.videoUrl : '',
            resources: (sub.explanation && sub.explanation.downloads) ? sub.explanation.downloads : []
          });

          // 2. Sub-strand Assessment (if configured)
          if (sub.assessment) {
            lessons.push({
              id: sub.assessment.id || ('asm_' + sub.id),
              title: `📝 ${sub.code} Assessment: ${sub.assessment.title}`,
              type: sub.assessment.type || 'quiz',
              duration: '15 mins',
              mandatory: true,
              passMark: sub.assessment.passMark || 80,
              attemptsAllowed: sub.assessment.attemptsAllowed || 3,
              timeLimit: sub.assessment.timeLimit || null,
              questions: sub.assessment.questions || [],
              rubric: sub.assessment.rubricCriteria || [],
              instructions: sub.assessment.instructions || ''
            });
          }

          return {
            id: sub.id,
            title: sub.title,
            substrandCode: sub.code,
            lessons: lessons
          };
        });

        // 3. Strand-Level Assessment (if configured)
        if (strand.assessment) {
          secModules.push({
            id: 'mod_' + strand.assessment.id,
            title: `🏆 End-of-Strand Capstone Assessment`,
            substrandCode: strand.code + '-CAPSTONE',
            lessons: [{
              id: strand.assessment.id,
              title: `🏆 ${strand.code} Summative Assessment: ${strand.assessment.title}`,
              type: strand.assessment.type || 'rubric',
              duration: '45 mins',
              mandatory: true,
              passMark: strand.assessment.passMark || 75,
              instructions: strand.assessment.instructions || '',
              rubric: strand.assessment.rubricCriteria || [],
              questions: strand.assessment.questions || []
            }]
          });
        }

        return {
          id: strand.id,
          strandCode: strand.code,
          title: strand.title,
          description: strand.rationale,
          competencies: strand.competencies,
          modules: secModules
        };
      });

      // Update in LMSEngine
      const lmsEngineObj = typeof LMSEngine !== 'undefined' ? LMSEngine : (typeof window !== 'undefined' ? window.LMSEngine : null);
      if (lmsEngineObj && typeof lmsEngineObj.updateCourse === 'function') {
        lmsEngineObj.updateCourse(this.currentCourseId, {
          curriculum: convertedCurriculum
        });
      }

      // Update in courses list if present
      const coursesList = typeof courses !== 'undefined' ? courses : (typeof window !== 'undefined' ? window.courses : (root && root.courses ? root.courses : null));
      if (coursesList && Array.isArray(coursesList)) {
        const c = coursesList.find(item => item.id === this.currentCourseId);
        if (c) c.curriculum = convertedCurriculum;
      }
    },

    // ── Metrics & Stats ──
    getStats: function() {
      let totalSubstrands = 0;
      let totalExplanations = 0;
      let totalAssessments = 0;
      let totalDurationMins = 0;

      this.strands.forEach(s => {
        if (s.assessment) totalAssessments++;
        (s.substrands || []).forEach(sub => {
          totalSubstrands++;
          if (sub.explanation && sub.explanation.coreContentHtml && sub.explanation.coreContentHtml.length > 30) {
            totalExplanations++;
          }
          if (sub.assessment) totalAssessments++;
          const mins = parseInt(sub.duration) || 25;
          totalDurationMins += mins;
        });
      });

      return {
        totalStrands: this.strands.length,
        totalSubstrands: totalSubstrands,
        totalExplanations: totalExplanations,
        totalAssessments: totalAssessments,
        totalHours: (totalDurationMins / 60).toFixed(1)
      };
    }
  };

  // Export to global scope
  root.LMSCurriculumStudio = LMSCurriculumStudio;

})(typeof window !== 'undefined' ? window : this);
