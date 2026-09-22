/* ============================================================
   INSTRUCTIFY KENYA — 8-STEP COURSE CREATION WIZARD ENGINE
   State machine for the guided course builder with step validation,
   autosave, curriculum tree builder, and draft management.
   ============================================================ */

(function(window) {
  'use strict';

  const WIZARD_DRAFT_KEY = 'ik_lms_wizard_draft';
  const AUTOSAVE_INTERVAL = 30000; // 30 seconds

  const STEPS = [
    { id: 1, key: 'basic',        label: 'Basic Info',      icon: '📋' },
    { id: 2, key: 'learning',     label: 'Learning Info',   icon: '🎯' },
    { id: 3, key: 'curriculum',   label: 'Curriculum',      icon: '📚' },
    { id: 4, key: 'content',      label: 'Lesson Content',  icon: '✏️' },
    { id: 5, key: 'assessments',  label: 'Assessments',     icon: '📝' },
    { id: 6, key: 'enrollment',   label: 'Enrolment',       icon: '👥' },
    { id: 7, key: 'completion',   label: 'Completion',      icon: '🏆' },
    { id: 8, key: 'review',       label: 'Review',          icon: '🚀' }
  ];

  // ── Course Categories ───────────────────────────────────────
  const CATEGORIES = [
    'EdTech & Smart Learning', 'ICT', 'Digital Skills', 'Curriculum',
    'AI & Tech', 'Pedagogy', 'Leadership', 'Assessment', 'CPD',
    'STEM', 'Language Arts', 'Special Education', 'Research Methods'
  ];

  const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const LANGUAGES = ['English', 'Kiswahili', 'English & Kiswahili', 'French'];
  const FORMATS = ['Online', 'Blended', 'Online + Hands-On', 'In-Person', 'Self-Paced'];

  // ── Default Empty Course ────────────────────────────────────
  function createEmptyCourse() {
    return {
      id: 'crs_' + Date.now().toString(36),
      // Step 1: Basic Info
      title: '',
      subtitle: '',
      shortDescription: '',
      description: '',
      category: '',
      tags: [],
      level: 'All Levels',
      language: 'English',
      duration: '',
      image: '',
      promoVideo: '',
      instructor: '',
      instructorTitle: '',
      instructorAvatar: '',
      instructorBio: '',
      // Step 2: Learning Info
      targetAudience: '',
      entryRequirements: '',
      priorKnowledge: '',
      learningOutcomes: [],
      coreCompetencies: [],
      objectives: [],
      deliveryMethod: 'Online',
      weeklyStudyTime: '',
      // Step 3: Curriculum
      curriculum: [],
      // Step 4: Content (per-lesson, stored in curriculum)
      // Step 5: Assessments (stored in curriculum)
      // Step 6: Enrolment
      accessType: 'open',
      accessCode: '',
      maxCapacity: '',
      enrollmentOpen: '',
      enrollmentClose: '',
      cohorts: [],
      pricing: 'free',
      price: 0,
      originalPrice: 0,
      // Step 7: Completion
      completionRules: {
        allLessonsCompleted: true,
        minQuizScore: 80,
        assignmentApproved: true,
        finalAssessmentPassed: false,
        requiredAttendance: false,
        minProgressPercent: 100
      },
      certificateEnabled: true,
      certificateTemplate: 'standard_cpd',
      certificateSignatures: [],
      // Meta
      status: 'draft',
      cpd: false,
      cpdHours: 0,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // ── Wizard State ────────────────────────────────────────────
  let currentStep = 1;
  let courseData = null;
  let autosaveTimer = null;
  let isDirty = false;
  let editingCourseId = null;

  // ── Init Wizard ─────────────────────────────────────────────
  function initWizard(existingCourseId) {
    editingCourseId = existingCourseId || null;

    if (editingCourseId && window.LMSEngine) {
      courseData = window.LMSEngine.getCourseById(editingCourseId);
      if (!courseData) {
        courseData = createEmptyCourse();
      }
    } else {
      // Check for saved draft
      const draft = loadDraft();
      if (draft && !existingCourseId) {
        courseData = draft;
      } else {
        courseData = createEmptyCourse();
      }
    }

    // Pre-fill instructor from session
    if (!courseData.instructor) {
      const session = window.getSession ? window.getSession() : null;
      if (session) {
        courseData.instructor = session.name || '';
        courseData.instructorAvatar = session.avatar || '';
      }
    }

    currentStep = 1;
    isDirty = false;
    startAutosave();
    return courseData;
  }

  // ── Step Navigation ─────────────────────────────────────────
  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > STEPS.length) return false;
    currentStep = stepNum;
    isDirty = true;
    return true;
  }

  function nextStep() {
    if (currentStep < STEPS.length) {
      currentStep++;
      isDirty = true;
      return true;
    }
    return false;
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      return true;
    }
    return false;
  }

  // ── Step Validation ─────────────────────────────────────────
  function validateStep(stepNum) {
    const errors = [];
    stepNum = stepNum || currentStep;

    switch (stepNum) {
      case 1: // Basic Info
        if (!courseData.title || courseData.title.trim().length < 3) errors.push('Course title is required (min 3 characters)');
        if (!courseData.shortDescription || courseData.shortDescription.trim().length < 10) errors.push('Short description is required (min 10 characters)');
        if (!courseData.category) errors.push('Please select a course category');
        break;

      case 2: // Learning Info
        if (courseData.learningOutcomes.length === 0) errors.push('Add at least one learning outcome');
        break;

      case 3: // Curriculum
        if (!courseData.curriculum || courseData.curriculum.length === 0) errors.push('Add at least one section to the curriculum');
        else {
          let hasLessons = false;
          courseData.curriculum.forEach(function(sec) {
            (sec.modules || []).forEach(function(mod) {
              if ((mod.lessons || []).length > 0) hasLessons = true;
            });
          });
          if (!hasLessons) errors.push('Add at least one lesson to the curriculum');
        }
        break;

      case 4: // Content - at least one lesson must have content
        break; // Optional for drafts

      case 5: // Assessments - optional
        break;

      case 6: // Enrolment
        if (courseData.accessType === 'code' && !courseData.accessCode) errors.push('Access code is required for code-based enrolment');
        break;

      case 7: // Completion - optional defaults are acceptable
        break;

      case 8: // Review - validates all steps
        for (let s = 1; s <= 7; s++) {
          const stepErrors = validateStep(s);
          errors.push(...stepErrors);
        }
        break;
    }

    return errors;
  }

  function isStepComplete(stepNum) {
    return validateStep(stepNum).length === 0;
  }

  // ── Curriculum Builder ──────────────────────────────────────
  function addSection(title) {
    if (!courseData.curriculum) courseData.curriculum = [];
    const section = {
      id: 'sec_' + Date.now().toString(36),
      title: title || 'New Section',
      description: '',
      modules: []
    };
    courseData.curriculum.push(section);
    isDirty = true;
    return section;
  }

  function addModule(sectionId, title) {
    const section = courseData.curriculum.find(function(s) { return s.id === sectionId; });
    if (!section) return null;
    const mod = {
      id: 'mod_' + Date.now().toString(36),
      title: title || 'New Module',
      lessons: []
    };
    section.modules.push(mod);
    isDirty = true;
    return mod;
  }

  function addLesson(sectionId, moduleId, lessonData) {
    const section = courseData.curriculum.find(function(s) { return s.id === sectionId; });
    if (!section) return null;
    const mod = section.modules.find(function(m) { return m.id === moduleId; });
    if (!mod) return null;

    const lesson = {
      id: 'les_' + Date.now().toString(36),
      title: lessonData.title || 'New Lesson',
      type: lessonData.type || 'text', // text, video, quiz, assignment, download, discussion
      duration: lessonData.duration || '15 mins',
      mandatory: lessonData.mandatory !== undefined ? lessonData.mandatory : true,
      freePreview: lessonData.freePreview || false,
      contentHtml: lessonData.contentHtml || '',
      videoUrl: lessonData.videoUrl || '',
      resources: lessonData.resources || [],
      status: 'draft',
      scheduledRelease: lessonData.scheduledRelease || null,
      prerequisites: lessonData.prerequisites || [],
      estimatedTime: lessonData.estimatedTime || '',
      // Assessment data (if type is quiz/assignment)
      passMark: lessonData.passMark || 80,
      attemptsAllowed: lessonData.attemptsAllowed || 3,
      timeLimit: lessonData.timeLimit || null,
      questions: lessonData.questions || [],
      rubric: lessonData.rubric || [],
      instructions: lessonData.instructions || ''
    };

    mod.lessons.push(lesson);
    isDirty = true;
    return lesson;
  }

  function removeItem(type, id) {
    if (type === 'section') {
      courseData.curriculum = courseData.curriculum.filter(function(s) { return s.id !== id; });
    } else if (type === 'module') {
      courseData.curriculum.forEach(function(sec) {
        sec.modules = sec.modules.filter(function(m) { return m.id !== id; });
      });
    } else if (type === 'lesson') {
      courseData.curriculum.forEach(function(sec) {
        sec.modules.forEach(function(mod) {
          mod.lessons = mod.lessons.filter(function(l) { return l.id !== id; });
        });
      });
    }
    isDirty = true;
  }

  function duplicateSection(sectionId) {
    const section = courseData.curriculum.find(function(s) { return s.id === sectionId; });
    if (!section) return null;

    const clone = JSON.parse(JSON.stringify(section));
    clone.id = 'sec_' + Date.now().toString(36);
    clone.title += ' (Copy)';
    // Assign new IDs to all children
    clone.modules.forEach(function(mod) {
      mod.id = 'mod_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      mod.lessons.forEach(function(les) {
        les.id = 'les_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      });
    });

    courseData.curriculum.push(clone);
    isDirty = true;
    return clone;
  }

  function moveItem(type, id, direction) {
    let arr;
    if (type === 'section') {
      arr = courseData.curriculum;
    } else if (type === 'module') {
      // Find parent section
      for (const sec of courseData.curriculum) {
        const idx = sec.modules.findIndex(function(m) { return m.id === id; });
        if (idx >= 0) { arr = sec.modules; break; }
      }
    } else if (type === 'lesson') {
      for (const sec of courseData.curriculum) {
        for (const mod of sec.modules) {
          const idx = mod.lessons.findIndex(function(l) { return l.id === id; });
          if (idx >= 0) { arr = mod.lessons; break; }
        }
        if (arr) break;
      }
    }

    if (!arr) return false;
    const idx = arr.findIndex(function(item) { return item.id === id; });
    if (idx < 0) return false;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= arr.length) return false;

    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    isDirty = true;
    return true;
  }

  // ── Course Stats ────────────────────────────────────────────
  function getCourseStats() {
    let totalSections = 0, totalModules = 0, totalLessons = 0;
    let totalQuizzes = 0, totalAssignments = 0, totalDuration = 0;
    let missingContent = 0;

    (courseData.curriculum || []).forEach(function(sec) {
      totalSections++;
      (sec.modules || []).forEach(function(mod) {
        totalModules++;
        (mod.lessons || []).forEach(function(les) {
          totalLessons++;
          if (les.type === 'quiz') totalQuizzes++;
          if (les.type === 'assignment') totalAssignments++;
          // Parse duration
          const durMatch = (les.duration || '').match(/(\d+)/);
          if (durMatch) totalDuration += parseInt(durMatch[1]);
          // Check content
          if (les.type === 'text' && !les.contentHtml) missingContent++;
          if (les.type === 'video' && !les.videoUrl) missingContent++;
        });
      });
    });

    return {
      sections: totalSections,
      modules: totalModules,
      lessons: totalLessons,
      quizzes: totalQuizzes,
      assignments: totalAssignments,
      estimatedDuration: totalDuration > 0 ? Math.ceil(totalDuration / 60) + ' hrs' : 'N/A',
      missingContent: missingContent,
      isComplete: validateStep(8).length === 0
    };
  }

  // ── Autosave ────────────────────────────────────────────────
  function saveDraft() {
    if (courseData) {
      courseData.updatedAt = new Date().toISOString();
      localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(courseData));
    }
  }

  function loadDraft() {
    try {
      const data = localStorage.getItem(WIZARD_DRAFT_KEY);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  function clearDraft() {
    localStorage.removeItem(WIZARD_DRAFT_KEY);
  }

  function startAutosave() {
    stopAutosave();
    autosaveTimer = setInterval(function() {
      if (isDirty && courseData) {
        saveDraft();
        isDirty = false;
        // Dispatch event for UI indicator
        window.dispatchEvent(new CustomEvent('lms:autosaved'));
      }
    }, AUTOSAVE_INTERVAL);
  }

  function stopAutosave() {
    if (autosaveTimer) {
      clearInterval(autosaveTimer);
      autosaveTimer = null;
    }
  }

  // ── Save & Publish ──────────────────────────────────────────
  function saveCourse(status) {
    if (!courseData) return null;

    courseData.status = status || courseData.status || 'draft';
    courseData.updatedAt = new Date().toISOString();

    // Generate access code if needed
    if (!courseData.accessCode) {
      courseData.accessCode = 'IK-' + courseData.id.toUpperCase().replace('_', '-');
    }

    // Calculate additional fields
    const stats = getCourseStats();
    courseData.modules = stats.modules;
    courseData.assignments = stats.assignments;
    courseData.quizzes = stats.quizzes;

    // Save via LMS engine
    if (window.LMSEngine) {
      window.LMSEngine.saveCourse(courseData);
    }

    // Clear draft
    clearDraft();

    // Log audit
    if (window.LMSAuth) {
      window.LMSAuth.logAuditEvent('COURSE_SAVED', courseData.title + ' (' + status + ')');
    }

    return courseData;
  }

  // ── Update Course Data ──────────────────────────────────────
  function updateField(key, value) {
    if (courseData) {
      courseData[key] = value;
      isDirty = true;
    }
  }

  function updateFields(fields) {
    if (courseData) {
      Object.assign(courseData, fields);
      isDirty = true;
    }
  }

  // ── Expose API ──────────────────────────────────────────────
  window.LMSWizard = {
    STEPS: STEPS,
    CATEGORIES: CATEGORIES,
    LEVELS: LEVELS,
    LANGUAGES: LANGUAGES,
    FORMATS: FORMATS,

    initWizard: initWizard,
    getCourseData: function() { return courseData; },
    getCurrentStep: function() { return currentStep; },
    goToStep: goToStep,
    nextStep: nextStep,
    prevStep: prevStep,
    validateStep: validateStep,
    isStepComplete: isStepComplete,

    // Curriculum builder
    addSection: addSection,
    addModule: addModule,
    addLesson: addLesson,
    removeItem: removeItem,
    duplicateSection: duplicateSection,
    moveItem: moveItem,

    // Course data
    updateField: updateField,
    updateFields: updateFields,
    getCourseStats: getCourseStats,
    createEmptyCourse: createEmptyCourse,

    // Persistence
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    clearDraft: clearDraft,
    saveCourse: saveCourse,
    startAutosave: startAutosave,
    stopAutosave: stopAutosave
  };

})(window);
