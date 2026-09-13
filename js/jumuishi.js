/**
 * JUMUISHI LEARNING HUB — JAVASCRIPT
 * An Inclusive Learning Initiative by Instructify Kenya
 * 
 * Capabilities:
 * 1. Accessibility Toolbar & Preference Persistence
 * 2. Inclusive Content Builder (7-Step Wizard, Validation, Template Engine, Drafts)
 * 3. Sample Resource Interactive Adaptations
 * 4. Searchable & Filterable Resource Library
 * 5. Accessible Keyboard FAQ Accordion
 * 6. Feedback & Consultancy Form Handlers
 * 7. Screen Reader Announcements & Toast Notifications
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     1. GLOBAL NOTIFICATION & SCREEN READER UTILITIES
     ══════════════════════════════════════════════════════════════ */
  
  function announceToScreenReader(message) {
    const liveRegion = document.getElementById('jum-live-region');
    if (liveRegion) {
      liveRegion.textContent = '';
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 50);
    }
  }

  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('jum-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'jum-toast-container';
      container.className = 'jum-toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `jum-toast jum-toast-${type}`;
    toast.setAttribute('role', 'status');

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
      <span class="jum-toast-icon" aria-hidden="true">${icon}</span>
      <span class="jum-toast-msg">${message}</span>
      <button type="button" class="jum-toast-close" aria-label="Dismiss notification">&times;</button>
    `;

    container.appendChild(toast);
    announceToScreenReader(message);

    const closeBtn = toast.querySelector('.jum-toast-close');
    const dismiss = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);
    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  window.jumShowToast = showToast;
  window.jumAnnounce = announceToScreenReader;

  /* ══════════════════════════════════════════════════════════════
     2. ACCESSIBILITY TOOLBAR & PREFERENCES
     ══════════════════════════════════════════════════════════════ */

  const A11Y_STORAGE_KEY = 'jumuishi_a11y_prefs_v1';

  const defaultA11yState = {
    fontSizeStep: 0, // -1: sm, 0: md, 1: lg, 2: xl, 3: 2xl
    dyslexia: false,
    highContrast: false,
    simpleLang: false,
    reduceMotion: false,
    hideImages: false,
    speechActive: false
  };

  let a11yState = Object.assign({}, defaultA11yState);

  function loadA11yPreferences() {
    try {
      const saved = localStorage.getItem(A11Y_STORAGE_KEY);
      if (saved) {
        a11yState = Object.assign({}, defaultA11yState, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read accessibility preferences from storage:', e);
    }
  }

  function saveA11yPreferences() {
    try {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(a11yState));
    } catch (e) {
      console.warn('Could not save accessibility preferences:', e);
    }
  }

  function applyA11yPreferences() {
    const html = document.documentElement;
    const body = document.body;

    // Font size steps: -1 (sm), 0 (norm), 1 (lg), 2 (xl), 3 (2xl)
    html.classList.remove('jum-text-sm', 'jum-text-lg', 'jum-text-xl', 'jum-text-2xl');
    if (a11yState.fontSizeStep === -1) html.classList.add('jum-text-sm');
    else if (a11yState.fontSizeStep === 1) html.classList.add('jum-text-lg');
    else if (a11yState.fontSizeStep === 2) html.classList.add('jum-text-xl');
    else if (a11yState.fontSizeStep >= 3) html.classList.add('jum-text-2xl');

    // Toggles on body
    body.classList.toggle('jum-dyslexia', !!a11yState.dyslexia);
    body.classList.toggle('jum-high-contrast', !!a11yState.highContrast);
    body.classList.toggle('jum-simple-lang', !!a11yState.simpleLang);
    body.classList.toggle('jum-reduce-motion', !!a11yState.reduceMotion);
    body.classList.toggle('jum-hide-decorative', !!a11yState.hideImages);

    // Update buttons aria-pressed & active class
    updateA11yButtonUI('btn-a11y-dyslexia', a11yState.dyslexia);
    updateA11yButtonUI('btn-a11y-contrast', a11yState.highContrast);
    updateA11yButtonUI('btn-a11y-simple', a11yState.simpleLang);
    updateA11yButtonUI('btn-a11y-motion', a11yState.reduceMotion);
    updateA11yButtonUI('btn-a11y-images', a11yState.hideImages);
    updateA11yButtonUI('btn-a11y-tts', a11yState.speechActive);

    saveA11yPreferences();
  }

  function updateA11yButtonUI(id, isActive) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.classList.toggle('active', !!isActive);
  }

  // Text-To-Speech handler
  let speechUtterance = null;
  function toggleTextToSpeech() {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported in this browser.', 'warning');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      a11yState.speechActive = false;
      updateA11yButtonUI('btn-a11y-tts', false);
      announceToScreenReader('Read aloud stopped.');
      showToast('Read aloud stopped.', 'info');
      return;
    }

    // Get selected text or visible main content
    let textToRead = '';
    const selection = window.getSelection().toString().trim();
    if (selection) {
      textToRead = selection;
    } else {
      const activePanel = document.querySelector('.jum-builder-panel.active');
      const mainContent = activePanel || document.querySelector('#main-content') || document.body;
      const headingsAndParas = mainContent.querySelectorAll('h1, h2, h3, p');
      const textArr = [];
      headingsAndParas.forEach((node, idx) => {
        if (idx < 25 && node.offsetParent !== null) { // only visible elements
          const t = node.innerText.trim();
          if (t) textArr.push(t);
        }
      });
      textToRead = textArr.join('. ');
    }

    if (!textToRead) {
      showToast('No text selected or found to read aloud.', 'info');
      return;
    }

    window.speechSynthesis.cancel();
    speechUtterance = new SpeechSynthesisUtterance(textToRead);
    speechUtterance.lang = 'en-US';
    speechUtterance.rate = 0.95;

    speechUtterance.onstart = function () {
      a11yState.speechActive = true;
      updateA11yButtonUI('btn-a11y-tts', true);
      showToast('Reading content aloud. Click the speaker icon to pause.', 'info');
      announceToScreenReader('Reading aloud started.');
    };

    speechUtterance.onend = function () {
      a11yState.speechActive = false;
      updateA11yButtonUI('btn-a11y-tts', false);
      announceToScreenReader('Read aloud completed.');
    };

    speechUtterance.onerror = function () {
      a11yState.speechActive = false;
      updateA11yButtonUI('btn-a11y-tts', false);
    };

    window.speechSynthesis.speak(speechUtterance);
  }

  function initAccessibilityToolbar() {
    loadA11yPreferences();
    applyA11yPreferences();

    // Font size buttons
    const btnFontInc = document.getElementById('btn-a11y-font-inc');
    if (btnFontInc) {
      btnFontInc.addEventListener('click', () => {
        if (a11yState.fontSizeStep < 3) {
          a11yState.fontSizeStep++;
          applyA11yPreferences();
          announceToScreenReader(`Font size increased to level ${a11yState.fontSizeStep}`);
          showToast(`Text size increased (${a11yState.fontSizeStep > 0 ? '+' + a11yState.fontSizeStep : a11yState.fontSizeStep})`, 'info');
        } else {
          showToast('Maximum text size reached.', 'info');
        }
      });
    }

    const btnFontDec = document.getElementById('btn-a11y-font-dec');
    if (btnFontDec) {
      btnFontDec.addEventListener('click', () => {
        if (a11yState.fontSizeStep > -1) {
          a11yState.fontSizeStep--;
          applyA11yPreferences();
          announceToScreenReader(`Font size decreased to level ${a11yState.fontSizeStep}`);
          showToast(`Text size decreased (${a11yState.fontSizeStep})`, 'info');
        } else {
          showToast('Minimum text size reached.', 'info');
        }
      });
    }

    // Dyslexia friendly font
    const btnDyslexia = document.getElementById('btn-a11y-dyslexia');
    if (btnDyslexia) {
      btnDyslexia.addEventListener('click', () => {
        a11yState.dyslexia = !a11yState.dyslexia;
        applyA11yPreferences();
        const msg = a11yState.dyslexia ? 'Dyslexia-friendly font enabled.' : 'Dyslexia-friendly font disabled.';
        announceToScreenReader(msg);
        showToast(msg, 'info');
      });
    }

    // High Contrast
    const btnContrast = document.getElementById('btn-a11y-contrast');
    if (btnContrast) {
      btnContrast.addEventListener('click', () => {
        a11yState.highContrast = !a11yState.highContrast;
        applyA11yPreferences();
        const msg = a11yState.highContrast ? 'High contrast mode enabled.' : 'High contrast mode disabled.';
        announceToScreenReader(msg);
        showToast(msg, 'info');
      });
    }

    // Simple Language Mode
    const btnSimple = document.getElementById('btn-a11y-simple');
    if (btnSimple) {
      btnSimple.addEventListener('click', () => {
        a11yState.simpleLang = !a11yState.simpleLang;
        applyA11yPreferences();
        const msg = a11yState.simpleLang ? 'Simple language mode enabled.' : 'Standard text view restored.';
        announceToScreenReader(msg);
        showToast(msg, 'info');
      });
    }

    // Reduced Motion
    const btnMotion = document.getElementById('btn-a11y-motion');
    if (btnMotion) {
      btnMotion.addEventListener('click', () => {
        a11yState.reduceMotion = !a11yState.reduceMotion;
        applyA11yPreferences();
        const msg = a11yState.reduceMotion ? 'Animations reduced.' : 'Animations restored.';
        announceToScreenReader(msg);
        showToast(msg, 'info');
      });
    }

    // Hide Decorative Images
    const btnImages = document.getElementById('btn-a11y-images');
    if (btnImages) {
      btnImages.addEventListener('click', () => {
        a11yState.hideImages = !a11yState.hideImages;
        applyA11yPreferences();
        const msg = a11yState.hideImages ? 'Decorative images hidden.' : 'Decorative images visible.';
        announceToScreenReader(msg);
        showToast(msg, 'info');
      });
    }

    // Text to speech
    const btnTTS = document.getElementById('btn-a11y-tts');
    if (btnTTS) {
      btnTTS.addEventListener('click', toggleTextToSpeech);
    }

    // Reset All
    const btnReset = document.getElementById('btn-a11y-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        a11yState = Object.assign({}, defaultA11yState);
        applyA11yPreferences();
        announceToScreenReader('Accessibility settings reset to default.');
        showToast('Accessibility settings reset to default.', 'success');
      });
    }

    // Mobile a11y bar toggle header
    const a11yHeader = document.querySelector('.jum-a11y-bar-header');
    const a11yBar = document.getElementById('jum-a11y-bar');
    if (a11yHeader && a11yBar) {
      a11yHeader.addEventListener('click', () => {
        if (window.innerWidth <= 767) {
          a11yBar.classList.toggle('collapsed');
          const isCollapsed = a11yBar.classList.contains('collapsed');
          announceToScreenReader(isCollapsed ? 'Accessibility panel minimized' : 'Accessibility panel expanded');
        }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════
     3. CONTENT BUILDER — 7-STEP WIZARD ENGINE
     ══════════════════════════════════════════════════════════════ */

  const BUILDER_DRAFT_KEY = 'jumuishi_builder_draft_v1';
  let currentStep = 1;
  const TOTAL_STEPS = 7;

  // Builder form data model
  let builderData = {
    // Step 1: Learning Context
    learnerName: '',
    gradeLevel: 'Grade 3',
    subject: 'Mathematics',
    topic: 'Number Concept: Multiplication as Repeated Addition',
    curriculum: 'CBC (Competency-Based Curriculum)',
    language: 'English with Kiswahili Scaffolding',
    setting: 'Inclusive Regular Classroom (Mixed Ability)',

    // Step 2: Strengths & Preferences
    strengths: ['Hands-on Manipulation', 'Visual Thinking'],
    interests: 'Animals, local market activities, storytelling, music',
    modalities: ['Tactile/Kinesthetic', 'Visual'],
    communication: 'Verbal with visual prompts & picture cards',
    motivation: 'Peer collaboration, practical tasks, positive immediate praise',

    // Step 3: Support Needs
    supportAreas: ['Dyslexia & Reading Difficulties'],
    specificBarriers: 'Struggles with dense text, word problems, and sequencing without concrete materials.',
    sensoryConsiderations: ['Prefers quiet workspace', 'Calm visual presentation'],
    motorConsiderations: ['Needs larger text / writing space'],
    attentionConsiderations: ['Short, structured activity chunks'],

    // Step 4: Content Type
    contentType: 'Multisensory Lesson Plan & Activity Guide',

    // Step 5: Adaptations
    visualAdaptations: ['Large high-contrast font', 'Step-by-step visual icon cues', 'Concrete counters (bottle tops)'],
    readingAdaptations: ['Plain language phrasing', 'Key words in bold with picture cues', 'Audio/oral prompt option'],
    cognitiveAdaptations: ['Chunked learning stages', 'Worked concrete examples before abstract tasks', 'Flexible completion time'],
    assistiveTech: ['Low-tech tactile counters', 'Peer buddy support'],
    assessmentStyle: 'Practical demonstration and oral explanation (No timed written tests)',

    // Generation metadata
    generatedAt: null,
    generatedContent: null
  };

  function updateStepperUI() {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const stepEl = document.getElementById(`jum-step-ind-${i}`);
      if (!stepEl) continue;

      stepEl.classList.remove('active', 'done');
      if (i < currentStep) {
        stepEl.classList.add('done');
        stepEl.setAttribute('aria-current', 'false');
      } else if (i === currentStep) {
        stepEl.classList.add('active');
        stepEl.setAttribute('aria-current', 'step');
      } else {
        stepEl.setAttribute('aria-current', 'false');
      }
    }

    // Update Panels
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const panel = document.getElementById(`jum-panel-step-${i}`);
      if (panel) {
        panel.classList.toggle('active', i === currentStep);
      }
    }

    // Update Nav Buttons
    const btnBack = document.getElementById('jum-builder-btn-back');
    const btnNext = document.getElementById('jum-builder-btn-next');

    if (btnBack) {
      btnBack.disabled = (currentStep === 1 || currentStep === 6);
      btnBack.style.visibility = (currentStep === 1) ? 'hidden' : 'visible';
    }

    if (btnNext) {
      if (currentStep === 5) {
        btnNext.innerHTML = `<span>Generate Inclusive Content</span> <span aria-hidden="true">✨</span>`;
        btnNext.className = 'btn-jum-primary jum-btn-next';
      } else if (currentStep === 6) {
        btnNext.style.display = 'none';
      } else if (currentStep === 7) {
        btnNext.style.display = 'none';
      } else {
        btnNext.style.display = 'inline-flex';
        btnNext.innerHTML = `<span>Continue to Step ${currentStep + 1}</span> <span aria-hidden="true">&rarr;</span>`;
        btnNext.className = 'jum-btn-next';
      }
    }

    // Scroll builder into comfortable view if user is advancing
    if (currentStep > 1) {
      const builderElem = document.getElementById('content-builder');
      if (builderElem) {
        const rect = builderElem.getBoundingClientRect();
        if (rect.top < 0 || rect.top > 250) {
          builderElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    announceToScreenReader(`Step ${currentStep} of ${TOTAL_STEPS}: ${getStepTitle(currentStep)}`);
  }

  function getStepTitle(step) {
    switch (step) {
      case 1: return 'Learning Context';
      case 2: return 'Learner Strengths & Preferences';
      case 3: return 'Support Needs & Accommodations';
      case 4: return 'Content Type & Format';
      case 5: return 'Accessibility Adaptations';
      case 6: return 'Generating Inclusive Content';
      case 7: return 'Review, Customise & Export';
      default: return '';
    }
  }

  // Form Validation per step
  function validateStep(step) {
    clearStepErrors(step);
    let isValid = true;

    if (step === 1) {
      const grade = document.getElementById('jum-field-grade');
      const subject = document.getElementById('jum-field-subject');
      const topic = document.getElementById('jum-field-topic');

      if (!grade || !grade.value.trim()) {
        showFieldError('jum-field-grade', 'Please select or specify a grade level.');
        isValid = false;
      }
      if (!subject || !subject.value.trim()) {
        showFieldError('jum-field-subject', 'Please enter or select a learning area / subject.');
        isValid = false;
      }
      if (!topic || !topic.value.trim()) {
        showFieldError('jum-field-topic', 'Please enter a learning topic or concept.');
        isValid = false;
      }
    } else if (step === 3) {
      // Check at least one support category or barrier description
      const checkedSupport = document.querySelectorAll('input[name="jum-support-cat"]:checked');
      const barrierText = document.getElementById('jum-field-barriers');
      if (checkedSupport.length === 0 && (!barrierText || !barrierText.value.trim())) {
        showFieldError('jum-support-cat-group', 'Please select at least one primary support category or describe the learning barrier.');
        isValid = false;
      }
    } else if (step === 4) {
      const selectedType = document.querySelector('input[name="jum-content-type"]:checked');
      if (!selectedType) {
        showFieldError('jum-content-type-group', 'Please select the type of content you want to generate.');
        isValid = false;
      }
    }

    return isValid;
  }

  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      const errorElem = document.getElementById(`${fieldId}-error`);
      if (errorElem) {
        errorElem.textContent = message;
        errorElem.classList.add('visible');
      }
      field.focus();
    }
  }

  function clearStepErrors(step) {
    const panel = document.getElementById(`jum-panel-step-${step}`);
    if (!panel) return;
    panel.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
    panel.querySelectorAll('.jum-error-text').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  // Harvest data from input fields
  function collectFormData() {
    // Step 1
    const nameEl = document.getElementById('jum-field-name');
    if (nameEl) builderData.learnerName = nameEl.value.trim();

    const gradeEl = document.getElementById('jum-field-grade');
    if (gradeEl) builderData.gradeLevel = gradeEl.value.trim();

    const subjEl = document.getElementById('jum-field-subject');
    if (subjEl) builderData.subject = subjEl.value.trim();

    const topicEl = document.getElementById('jum-field-topic');
    if (topicEl) builderData.topic = topicEl.value.trim();

    const currEl = document.getElementById('jum-field-curriculum');
    if (currEl) builderData.curriculum = currEl.value.trim();

    const langEl = document.getElementById('jum-field-language');
    if (langEl) builderData.language = langEl.value.trim();

    const setEl = document.getElementById('jum-field-setting');
    if (setEl) builderData.setting = setEl.value.trim();

    // Step 2
    const strengths = [];
    document.querySelectorAll('input[name="jum-strength"]:checked').forEach(c => strengths.push(c.value));
    builderData.strengths = strengths;

    const interestEl = document.getElementById('jum-field-interests');
    if (interestEl) builderData.interests = interestEl.value.trim();

    const modalities = [];
    document.querySelectorAll('input[name="jum-modality"]:checked').forEach(c => modalities.push(c.value));
    builderData.modalities = modalities;

    const commEl = document.getElementById('jum-field-comm');
    if (commEl) builderData.communication = commEl.value.trim();

    const motivEl = document.getElementById('jum-field-motivation');
    if (motivEl) builderData.motivation = motivEl.value.trim();

    // Step 3
    const supportCats = [];
    document.querySelectorAll('input[name="jum-support-cat"]:checked').forEach(c => supportCats.push(c.value));
    builderData.supportAreas = supportCats;

    const barEl = document.getElementById('jum-field-barriers');
    if (barEl) builderData.specificBarriers = barEl.value.trim();

    const sensory = [];
    document.querySelectorAll('input[name="jum-sensory"]:checked').forEach(c => sensory.push(c.value));
    builderData.sensoryConsiderations = sensory;

    const motor = [];
    document.querySelectorAll('input[name="jum-motor"]:checked').forEach(c => motor.push(c.value));
    builderData.motorConsiderations = motor;

    // Step 4
    const typeSelected = document.querySelector('input[name="jum-content-type"]:checked');
    if (typeSelected) builderData.contentType = typeSelected.value;

    // Step 5
    const vis = [];
    document.querySelectorAll('input[name="jum-adapt-visual"]:checked').forEach(c => vis.push(c.value));
    builderData.visualAdaptations = vis;

    const read = [];
    document.querySelectorAll('input[name="jum-adapt-reading"]:checked').forEach(c => read.push(c.value));
    builderData.readingAdaptations = read;

    const cog = [];
    document.querySelectorAll('input[name="jum-adapt-cognitive"]:checked').forEach(c => cog.push(c.value));
    builderData.cognitiveAdaptations = cog;

    const assessEl = document.getElementById('jum-field-assessment');
    if (assessEl) builderData.assessmentStyle = assessEl.value.trim();
  }

  // Populate form fields from data model (for draft restore)
  function populateFormFields() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };

    setVal('jum-field-name', builderData.learnerName || '');
    setVal('jum-field-grade', builderData.gradeLevel || 'Grade 3');
    setVal('jum-field-subject', builderData.subject || 'Mathematics');
    setVal('jum-field-topic', builderData.topic || '');
    setVal('jum-field-curriculum', builderData.curriculum || 'CBC (Competency-Based Curriculum)');
    setVal('jum-field-language', builderData.language || 'English with Kiswahili Scaffolding');
    setVal('jum-field-setting', builderData.setting || 'Inclusive Regular Classroom (Mixed Ability)');
    setVal('jum-field-interests', builderData.interests || '');
    setVal('jum-field-comm', builderData.communication || '');
    setVal('jum-field-motivation', builderData.motivation || '');
    setVal('jum-field-barriers', builderData.specificBarriers || '');
    setVal('jum-field-assessment', builderData.assessmentStyle || '');

    // Checkboxes
    const checkBoxes = (name, arr) => {
      if (!Array.isArray(arr)) return;
      document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
        cb.checked = arr.includes(cb.value);
      });
    };

    checkBoxes('jum-strength', builderData.strengths);
    checkBoxes('jum-modality', builderData.modalities);
    checkBoxes('jum-support-cat', builderData.supportAreas);
    checkBoxes('jum-sensory', builderData.sensoryConsiderations);
    checkBoxes('jum-motor', builderData.motorConsiderations);
    checkBoxes('jum-adapt-visual', builderData.visualAdaptations);
    checkBoxes('jum-adapt-reading', builderData.readingAdaptations);
    checkBoxes('jum-adapt-cognitive', builderData.cognitiveAdaptations);

    // Radio content type
    if (builderData.contentType) {
      const rb = document.querySelector(`input[name="jum-content-type"][value="${builderData.contentType}"]`);
      if (rb) {
        rb.checked = true;
        // highlight parent card
        document.querySelectorAll('.jum-content-type-card').forEach(c => c.classList.remove('selected'));
        const parentCard = rb.closest('.jum-content-type-card');
        if (parentCard) parentCard.classList.add('selected');
      }
    }
  }

  function saveBuilderDraft() {
    collectFormData();
    try {
      localStorage.setItem(BUILDER_DRAFT_KEY, JSON.stringify({
        data: builderData,
        step: currentStep,
        timestamp: new Date().toISOString()
      }));
      showToast('Draft successfully saved to this browser!', 'success');
      announceToScreenReader('Draft saved.');
    } catch (e) {
      showToast('Could not save draft locally.', 'error');
    }
  }

  function restoreBuilderDraft() {
    try {
      const raw = localStorage.getItem(BUILDER_DRAFT_KEY);
      if (!raw) {
        showToast('No saved draft found in this browser.', 'info');
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data) {
        builderData = Object.assign({}, builderData, parsed.data);
        populateFormFields();
        if (parsed.step && parsed.step >= 1 && parsed.step <= 5) {
          currentStep = parsed.step;
        }
        updateStepperUI();
        showToast('Draft restored from your last session!', 'success');
        announceToScreenReader('Draft restored.');
      }
    } catch (e) {
      showToast('Failed to load saved draft.', 'error');
    }
  }

  // Move forward in wizard
  function nextStep() {
    if (!validateStep(currentStep)) return;
    collectFormData();

    if (currentStep < 5) {
      currentStep++;
      updateStepperUI();
    } else if (currentStep === 5) {
      // Advance to Step 6 (Generating)
      currentStep = 6;
      updateStepperUI();
      triggerGeneration();
    }
  }

  // Move backward in wizard
  function prevStep() {
    if (currentStep > 1 && currentStep !== 6) {
      collectFormData();
      if (currentStep === 7) {
        currentStep = 5; // allow returning from Step 7 back to Step 5 adaptations
      } else {
        currentStep--;
      }
      updateStepperUI();
    }
  }

  /* ══════════════════════════════════════════════════════════════
     4. TEMPLATE ENGINE & MOCK CONTENT SYNTHESIS
     ══════════════════════════════════════════════════════════════ */

  function triggerGeneration() {
    announceToScreenReader('Synthesizing inclusive learning content based on your learner profile and selections. Please wait a moment.');

    const statusText = document.getElementById('jum-generating-status');
    const steps = [
      'Analyzing learner strengths and communication preferences...',
      'Mapping Competency-Based Curriculum (CBC) outcomes...',
      'Structuring Universal Design for Learning (UDL) multiple tiers...',
      'Synthesizing multisensory local adaptations & participation rubrics...',
      'Finalizing tailored inclusive resource...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (statusText && stepIdx < steps.length) {
        statusText.textContent = steps[stepIdx];
        announceToScreenReader(steps[stepIdx]);
      }
    }, 600);

    setTimeout(() => {
      clearInterval(interval);
      builderData.generatedContent = synthesizeInclusiveContent(builderData);
      builderData.generatedAt = new Date().toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
      renderGeneratedOutput(builderData);

      currentStep = 7;
      updateStepperUI();
      showToast('Inclusive content generated successfully!', 'success');
      announceToScreenReader('Inclusive content generated and ready for review.');
    }, 3200);
  }

  function synthesizeInclusiveContent(d) {
    const learnerLabel = d.learnerName ? `for ${d.learnerName}` : 'for Mixed-Ability Learners';
    const grade = d.gradeLevel || 'Grade 3';
    const subject = d.subject || 'Mathematics';
    const topic = d.topic || 'Number Concepts & Operations';
    const curriculum = d.curriculum || 'Kenyan Competency-Based Curriculum (CBC)';
    const contentType = d.contentType || 'Inclusive Lesson Plan & Activity Guide';

    const strengthsStr = (d.strengths && d.strengths.length) ? d.strengths.join(', ') : 'Practical engagement, peer interaction';
    const supportStr = (d.supportAreas && d.supportAreas.length) ? d.supportAreas.join(', ') : 'Diverse learning styles, reading/text barriers';
    const modalitiesStr = (d.modalities && d.modalities.length) ? d.modalities.join(', ') : 'Visual, Kinesthetic / Tactile';
    const visAdaptStr = (d.visualAdaptations && d.visualAdaptations.length) ? d.visualAdaptations.join('; ') : 'High contrast, visual icon cues';
    const cogAdaptStr = (d.cognitiveAdaptations && d.cognitiveAdaptations.length) ? d.cognitiveAdaptations.join('; ') : 'Chunked stages, worked concrete examples';

    return {
      title: `${topic} — ${contentType}`,
      meta: {
        target: `${grade} · ${subject} ${learnerLabel}`,
        curriculum: curriculum,
        setting: d.setting || 'Inclusive Classroom',
        primaryFocus: supportStr,
        strengthsCapitalized: strengthsStr
      },
      standardView: `
        <div class="jum-resource-section">
          <div class="jum-resource-section-title">
            <span aria-hidden="true">🎯</span> 1. Learning Objectives (CBC Aligned & Differentiated)
          </div>
          <div class="jum-resource-section-body">
            <p>By the end of this session, learners should be able to:</p>
            <ul>
              <li><strong>Core Competency (All Learners):</strong> Demonstrate understanding of <em>${topic}</em> using concrete physical items (e.g., bottle tops, beans, number cards).</li>
              <li><strong>Differentiated Skill Goal:</strong> Express mathematical reasoning through their preferred modality (${modalitiesStr}), with zero penalty for handwriting speed or reading barriers.</li>
              <li><strong>Values & Pertinent Issues:</strong> Promote social inclusion, collaboration, self-advocacy, and mutual respect among mixed-ability peers.</li>
            </ul>
          </div>
        </div>

        <div class="jum-resource-section">
          <div class="jum-resource-section-title">
            <span aria-hidden="true">📦</span> 2. Universal Materials & Low-Cost Kenyan Realia
          </div>
          <div class="jum-resource-section-body">
            <p>Easily sourceable classroom and home materials:</p>
            <ul>
              <li>50 clean plastic bottle tops / counters per pair (different colours: red, blue, green).</li>
              <li>Laminated pictorial number cards with large 24pt numerals and raised dot patterns.</li>
              <li>Visual schedule card strips showing the 4 lesson steps with simple icon cues.</li>
              <li>Peer communication fan or emotion & confidence check-in card (Thumbs Up / Thinking / Need Assistance).</li>
            </ul>
          </div>
        </div>

        <div class="jum-resource-section">
          <div class="jum-resource-section-title">
            <span aria-hidden="true">🪜</span> 3. Inclusive 4-Stage Instructional Pathway
          </div>
          <div class="jum-resource-section-body">
            <p><strong>Stage A: Welcoming Warm-up & Sensory Orientation (8 mins)</strong><br>
            Teacher presents the visual schedule. Introduce the theme through a familiar cultural context (e.g., sharing mangoes or bundles of sukuma wiki at the local soko). Give tactile objects immediately to spark curiosity.</p>
            
            <p><strong>Stage B: Concrete Guided Exploration (12 mins)</strong><br>
            Model the concept: "Here are 3 groups of 4 bottle tops." Guide learners to arrange objects on their desks. For learners with text barriers, provide colour-coded trays so grouping is physical and intuitive before any numbers are written.</p>
            
            <p><strong>Stage C: Peer Buddy Guided Practice (15 mins)</strong><br>
            Learners collaborate in pairs. Assign reciprocal roles (one learner builds the physical array, the peer checks or draws it). Provide pre-printed prompt cards with high-contrast text and picture labels.</p>
            
            <p><strong>Stage D: Multi-Option Reflection & Celebration (5 mins)</strong><br>
            Learners share findings using their preferred method: pointing to number cards, holding up concrete groups, explaining orally, or drawing on mini slates.</p>
          </div>
        </div>

        <div class="jum-resource-section">
          <div class="jum-resource-section-title">
            <span aria-hidden="true">🛡️</span> 4. Tailored Accommodations for Identified Support Needs
          </div>
          <div class="jum-resource-section-body">
            <p><strong>Primary Accommodation Focus:</strong> ${supportStr}</p>
            <ul>
              <li><strong>Visual & Sensory Adaptations:</strong> ${visAdaptStr}. Ensure minimal visual clutter on worksheets.</li>
              <li><strong>Cognitive & Executive Support:</strong> ${cogAdaptStr}. Provide predictable transitions and a clear 2-minute warning before changing tasks.</li>
              <li><strong>Language & Communication:</strong> ${d.language || 'English with Kiswahili bridging'}. Praise in learner's familiar vocabulary (e.g., <em>"Hongera!", "Kazi nzuri!"</em>).</li>
            </ul>
          </div>
        </div>

        <div class="jum-resource-section">
          <div class="jum-resource-section-title">
            <span aria-hidden="true">📊</span> 5. Equitable Participation & Assessment Rubric
          </div>
          <div class="jum-resource-section-body">
            <p>Evaluate conceptual grasp without penalizing motor, speed, or text reading differences:</p>
            <ul>
              <li><strong>Exceeding Expectations (4):</strong> Independently models concept with materials, explains to peer, creates a new problem variation.</li>
              <li><strong>Meeting Expectations (3):</strong> Accurately groups concrete counters or points to correct picture card with minimal prompts.</li>
              <li><strong>Approaching Expectations (2):</strong> Successfully completes task with physical guidance or peer buddy scaffolding.</li>
              <li><strong>Below Expectations (1):</strong> Engages with tactile materials; requires simplified 2-item sets with direct teacher modeling.</li>
            </ul>
          </div>
        </div>

        <div class="jum-resource-section">
          <div class="jum-resource-section-title">
            <span aria-hidden="true">🏡</span> 6. Home & Caregiver Bridge (English & Kiswahili)
          </div>
          <div class="jum-resource-section-body">
            <p><strong>Activity for Home:</strong> Encourage parent/guardian to use everyday household items (e.g., clothespins, spoons, maize seeds) for counting games.</p>
            <p><em>"Mzazi / Mlezi: Msaidie mwanafunzi kuhesabu vitu vidogo nyumbani kama vile vifuniko vya chupa au mbegu za mahindi kwa makundi ya viwili viwili. Mpe pongezi tele kwa kila hatua!"</em></p>
          </div>
        </div>
      `,

      simplifiedView: `
        <div class="jum-resource-section" style="background:#F0FDF4;padding:24px;border-radius:12px;border:2px solid #86EFAC;">
          <h3 style="font-size:20px;color:#16A34A;margin-bottom:12px;">🌟 Quick Visual Summary for Learners</h3>
          <p style="font-size:16px;line-height:1.8;"><strong>Today's Goal:</strong> We are learning <strong>${topic}</strong> with bottle tops and fun pictures!</p>
          
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;margin:20px 0;">
            <div style="background:#fff;padding:16px;border-radius:8px;border:1px solid #CBD5E1;text-align:center;">
              <div style="font-size:32px;">👀</div>
              <strong>1. Look & Listen</strong>
              <p style="font-size:13px;color:#64748B;margin-top:4px;">Watch teacher show how groups work.</p>
            </div>
            <div style="background:#fff;padding:16px;border-radius:8px;border:1px solid #CBD5E1;text-align:center;">
              <div style="font-size:32px;">🖐️</div>
              <strong>2. Touch & Move</strong>
              <p style="font-size:13px;color:#64748B;margin-top:4px;">Count counters with your buddy.</p>
            </div>
            <div style="background:#fff;padding:16px;border-radius:8px;border:1px solid #CBD5E1;text-align:center;">
              <div style="font-size:32px;">🗣️</div>
              <strong>3. Show Your Way</strong>
              <p style="font-size:13px;color:#64748B;margin-top:4px;">Point, speak, or draw your answer!</p>
            </div>
          </div>
          
          <p style="font-size:15px;color:#1E293B;"><strong>Remember:</strong> Take your time. Everyone learns differently and everyone can do this! ✨</p>
        </div>
      `,

      teacherGuide: `
        <div class="jum-resource-section" style="background:#F0F9FF;padding:24px;border-radius:12px;border:2px solid #BAE6FD;">
          <h3 style="font-size:18px;color:#0284C7;margin-bottom:12px;">👩‍🏫 Teacher / Facilitator Implementation Checklist</h3>
          <ul style="font-size:14.5px;line-height:1.75;">
            <li>✅ <strong>Before Class:</strong> Pre-sort bottle tops into containers so learners do not get overwhelmed by clutter.</li>
            <li>✅ <strong>Seating Arrangement:</strong> Position learners requiring support near the front or adjacent to a supportive peer buddy, avoiding glare from windows.</li>
            <li>✅ <strong>Instruction Delivery:</strong> Break every instruction into single actionable steps. Pair spoken words with visual gestures.</li>
            <li>✅ <strong>Alternative Evidence:</strong> Take photo evidence or jot an observation note in the CBC portfolio instead of requiring a written test script.</li>
            <li>✅ <strong>Sensory Check:</strong> If learner shows signs of overwhelm, allow a 2-minute sensory reset with tactile squishy balls or deep breathing.</li>
          </ul>
        </div>
      `,

      parentGuide: `
        <div class="jum-resource-section" style="background:#FFFBEB;padding:24px;border-radius:12px;border:2px solid #FCD34D;">
          <h3 style="font-size:18px;color:#B45309;margin-bottom:12px;">👨‍👩‍👧 Parent & Caregiver Home Practice Guide</h3>
          <p style="font-size:14.5px;line-height:1.65;color:#92400E;">
            This guide is designed for home reinforcement without expensive toys or stress.
          </p>
          <ul style="font-size:14.5px;line-height:1.75;color:#92400E;">
            <li><strong>Daily Routine Link:</strong> While setting the table, ask: <em>"We have 3 people. Each person gets 2 bananas. How many bananas in total?"</em> Count them together.</li>
            <li><strong>Praise Effort:</strong> Praise patience and problem-solving: <em>"I love how carefully you grouped those stones!"</em></li>
            <li><strong>Keep It Short:</strong> Practice in playful 5 to 10-minute bursts rather than long sit-down drills.</li>
            <li><strong>Communication with School:</strong> Share with the teacher what tools work best at home so techniques remain consistent.</li>
          </ul>
        </div>
      `
    };
  }

  function renderGeneratedOutput(d) {
    const titleEl = document.getElementById('jum-output-title');
    const metaEl = document.getElementById('jum-output-meta');
    const bodyEl = document.getElementById('jum-output-body');

    if (titleEl) titleEl.textContent = d.generatedContent.title;
    if (metaEl) {
      metaEl.innerHTML = `
        <span><strong>Grade / Subject:</strong> ${d.generatedContent.meta.target}</span> &bull;
        <span><strong>Curriculum:</strong> ${d.generatedContent.meta.curriculum}</span> &bull;
        <span><strong>Generated:</strong> ${d.generatedAt}</span>
      `;
    }

    if (bodyEl) {
      bodyEl.innerHTML = d.generatedContent.standardView;
    }

    // Set View tabs to standard
    document.querySelectorAll('.jum-view-tab').forEach(t => t.classList.remove('active'));
    const defaultTab = document.querySelector('.jum-view-tab[data-view="standard"]');
    if (defaultTab) defaultTab.classList.add('active');
  }

  function setupOutputViewTabs() {
    document.querySelectorAll('.jum-view-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.jum-view-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        const viewType = this.getAttribute('data-view');
        const bodyEl = document.getElementById('jum-output-body');
        if (!bodyEl || !builderData.generatedContent) return;

        if (viewType === 'standard') {
          bodyEl.innerHTML = builderData.generatedContent.standardView;
        } else if (viewType === 'simplified') {
          bodyEl.innerHTML = builderData.generatedContent.simplifiedView;
        } else if (viewType === 'teacher') {
          bodyEl.innerHTML = builderData.generatedContent.teacherGuide;
        } else if (viewType === 'parent') {
          bodyEl.innerHTML = builderData.generatedContent.parentGuide;
        }

        announceToScreenReader(`Switched to ${this.textContent.trim()} mode.`);
      });
    });

    // Copy Content
    const btnCopy = document.getElementById('jum-btn-copy-output');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const bodyEl = document.getElementById('jum-output-body');
        if (!bodyEl) return;
        const textToCopy = `${builderData.generatedContent?.title || 'Jumuishi Learning Resource'}\n\n` + bodyEl.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Resource copied to clipboard!', 'success');
          announceToScreenReader('Resource content copied to clipboard.');
        }).catch(() => {
          showToast('Could not copy to clipboard. Please select and copy manually.', 'warning');
        });
      });
    }

    // Print / PDF
    const btnPrint = document.getElementById('jum-btn-print-output');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Download Text File
    const btnDownload = document.getElementById('jum-btn-download-output');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        const bodyEl = document.getElementById('jum-output-body');
        if (!bodyEl) return;
        const content = `${builderData.generatedContent?.title || 'Jumuishi Inclusive Resource'}\n` +
          `Generated: ${builderData.generatedAt}\n` +
          `An Inclusive Learning Initiative by Instructify Kenya\n` +
          `=======================================================\n\n` +
          bodyEl.innerText;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = (builderData.topic || 'jumuishi-resource').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.txt';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Resource downloaded as text file.', 'success');
      });
    }

    // Start New / Reset
    const btnNew = document.getElementById('jum-btn-new-output');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        if (confirm('Start a new inclusive resource? Your current generated content will be cleared.')) {
          builderData.generatedContent = null;
          currentStep = 1;
          updateStepperUI();
          showToast('Ready to create a new resource!', 'info');
        }
      });
    }

    // Save to Course Studio Bridge
    const btnSaveToCourse = document.getElementById('jum-btn-save-to-course');
    if (btnSaveToCourse) {
      btnSaveToCourse.addEventListener('click', () => {
        if (typeof openBridgeModal === 'function') {
          openBridgeModal();
        }
      });
    }
  }

  function initContentBuilder() {
    // Stepper buttons
    const btnNext = document.getElementById('jum-builder-btn-next');
    const btnBack = document.getElementById('jum-builder-btn-back');
    const btnDraftSave = document.getElementById('jum-btn-save-draft');
    const btnDraftRestore = document.getElementById('jum-btn-restore-draft');

    if (btnNext) btnNext.addEventListener('click', nextStep);
    if (btnBack) btnBack.addEventListener('click', prevStep);
    if (btnDraftSave) btnDraftSave.addEventListener('click', saveBuilderDraft);
    if (btnDraftRestore) btnDraftRestore.addEventListener('click', restoreBuilderDraft);

    // Content Type Card Selection
    document.querySelectorAll('.jum-content-type-card').forEach(card => {
      card.addEventListener('click', function () {
        const rb = this.querySelector('input[type="radio"]');
        if (rb) {
          rb.checked = true;
          document.querySelectorAll('.jum-content-type-card').forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
        }
      });
      // Keyboard support for cards
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Checkbox items keyboard accessibility
    document.querySelectorAll('.jum-check-item').forEach(item => {
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const cb = this.querySelector('input[type="checkbox"], input[type="radio"]');
          if (cb) {
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change'));
          }
        }
      });
    });

    setupOutputViewTabs();
    updateStepperUI();
  }

  /* ══════════════════════════════════════════════════════════════
     5. SAMPLE RESOURCE INTERACTIVE DEMO
     ══════════════════════════════════════════════════════════════ */

  function initSampleResource() {
    const tabs = document.querySelectorAll('.jum-sample-tab');
    const panels = document.querySelectorAll('.jum-sample-tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        const target = this.getAttribute('data-sample-target');
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => {
          p.classList.remove('active');
          p.hidden = true;
        });

        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        const activePanel = document.getElementById(target);
        if (activePanel) {
          activePanel.classList.add('active');
          activePanel.hidden = false;
        }

        announceToScreenReader(`Showing sample adaptation for: ${this.textContent.trim()}`);
      });
    });

    // "Adapt this in Builder" CTA
    const btnAdapt = document.getElementById('jum-btn-adapt-sample');
    if (btnAdapt) {
      btnAdapt.addEventListener('click', (e) => {
        e.preventDefault();
        builderData.gradeLevel = 'Grade 3';
        builderData.subject = 'Mathematics';
        builderData.topic = 'Multiplication as Equal Groups (Repeated Addition)';
        builderData.curriculum = 'CBC (Competency-Based Curriculum)';
        builderData.strengths = ['Hands-on Manipulation', 'Visual Thinking'];
        builderData.supportAreas = ['Dyslexia & Reading Difficulties', 'ADHD & Focus Support'];
        populateFormFields();
        currentStep = 1;
        updateStepperUI();

        const builder = document.getElementById('content-builder');
        if (builder) {
          builder.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        showToast('Sample pre-filled into Jumuishi Content Builder!', 'success');
        announceToScreenReader('Sample pre-filled into Content Builder.');
      });
    }

    // Print sample
    const btnPrintSample = document.getElementById('jum-btn-print-sample');
    if (btnPrintSample) {
      btnPrintSample.addEventListener('click', () => {
        window.print();
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════
     6. RESOURCE LIBRARY SEARCH & MULTI-FILTER
     ══════════════════════════════════════════════════════════════ */

  function initResourceLibrary() {
    const searchInput = document.getElementById('jum-library-search-input');
    const sortSelect = document.getElementById('jum-library-sort');
    const filterCheckboxes = document.querySelectorAll('.jum-filter-chip input');
    const clearBtn = document.getElementById('jum-filter-clear-btn');
    const counterEl = document.getElementById('jum-library-count');
    const cards = document.querySelectorAll('.jum-resource-card');

    function filterResources() {
      const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

      // Collect checked filters
      const checkedNeeds = [];
      document.querySelectorAll('input[name="lib-need"]:checked').forEach(c => checkedNeeds.push(c.value));

      const checkedGrades = [];
      document.querySelectorAll('input[name="lib-grade"]:checked').forEach(c => checkedGrades.push(c.value));

      const checkedSubjects = [];
      document.querySelectorAll('input[name="lib-subject"]:checked').forEach(c => checkedSubjects.push(c.value));

      const checkedFormats = [];
      document.querySelectorAll('input[name="lib-format"]:checked').forEach(c => checkedFormats.push(c.value));

      let visibleCount = 0;

      cards.forEach(card => {
        const title = (card.querySelector('.jum-res-title')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.jum-res-desc')?.textContent || '').toLowerCase();
        const need = card.getAttribute('data-need') || '';
        const grade = card.getAttribute('data-grade') || '';
        const subject = card.getAttribute('data-subject') || '';
        const format = card.getAttribute('data-format') || '';

        // Search match
        const matchesSearch = !searchTerm || title.includes(searchTerm) || desc.includes(searchTerm);

        // Filter matches
        const matchesNeed = checkedNeeds.length === 0 || checkedNeeds.includes(need) || checkedNeeds.includes('all');
        const matchesGrade = checkedGrades.length === 0 || checkedGrades.includes(grade);
        const matchesSubject = checkedSubjects.length === 0 || checkedSubjects.includes(subject);
        const matchesFormat = checkedFormats.length === 0 || checkedFormats.includes(format);

        if (matchesSearch && matchesNeed && matchesGrade && matchesSubject && matchesFormat) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (counterEl) {
        counterEl.textContent = `Showing ${visibleCount} prototype resource${visibleCount === 1 ? '' : 's'}`;
      }

      announceToScreenReader(`Library filtered. ${visibleCount} resources found.`);
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterResources);
    }

    if (filterCheckboxes.length) {
      filterCheckboxes.forEach(cb => cb.addEventListener('change', filterResources));
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        const grid = document.querySelector('.jum-resource-grid');
        if (!grid) return;
        const cardArr = Array.from(cards);
        const val = this.value;

        cardArr.sort((a, b) => {
          const titleA = a.querySelector('.jum-res-title')?.textContent || '';
          const titleB = b.querySelector('.jum-res-title')?.textContent || '';
          if (val === 'az') return titleA.localeCompare(titleB);
          if (val === 'za') return titleB.localeCompare(titleA);
          return 0; // default order
        });

        cardArr.forEach(c => grid.appendChild(c));
        announceToScreenReader('Resources sorted.');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        filterCheckboxes.forEach(cb => cb.checked = false);
        if (sortSelect) sortSelect.selectedIndex = 0;
        filterResources();
        showToast('Resource filters cleared.', 'info');
      });
    }

    // Resource action buttons
    document.querySelectorAll('.jum-res-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const action = this.getAttribute('data-action');
        const card = this.closest('.jum-resource-card');
        const resTitle = card?.querySelector('.jum-res-title')?.textContent || 'Resource';

        if (action === 'preview') {
          e.preventDefault();
          showToast(`Opening preview for: "${resTitle}" (Prototype Resource)`, 'info');
        } else if (action === 'adapt') {
          e.preventDefault();
          const need = card?.getAttribute('data-need') || '';
          const grade = card?.getAttribute('data-grade') || 'Grade 3';
          const subject = card?.getAttribute('data-subject') || 'General';

          builderData.gradeLevel = grade.toUpperCase();
          builderData.subject = subject.charAt(0).toUpperCase() + subject.slice(1);
          builderData.topic = resTitle;
          if (need) builderData.supportAreas = [need];

          populateFormFields();
          currentStep = 1;
          updateStepperUI();

          const builder = document.getElementById('content-builder');
          if (builder) {
            builder.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          showToast(`"${resTitle}" loaded into Content Builder!`, 'success');
        } else if (action === 'download') {
          e.preventDefault();
          showToast(`Prototype download started for: "${resTitle}"`, 'info');
          setTimeout(() => window.print(), 300);
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     7. ACCESSIBLE FAQ ACCORDION (KEYBOARD & ARIA COMPLIANT)
     ══════════════════════════════════════════════════════════════ */

  function initFaqAccordion() {
    const questions = document.querySelectorAll('.jum-faq-question');

    questions.forEach((btn, idx) => {
      btn.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        const answerId = this.getAttribute('aria-controls');
        const answer = document.getElementById(answerId);

        // Close other accordions for cleaner view
        questions.forEach(otherBtn => {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            const otherAnsId = otherBtn.getAttribute('aria-controls');
            const otherAns = document.getElementById(otherAnsId);
            if (otherAns) otherAns.classList.remove('open');
          }
        });

        // Toggle current
        this.setAttribute('aria-expanded', (!expanded).toString());
        if (answer) {
          answer.classList.toggle('open', !expanded);
        }

        if (!expanded) {
          announceToScreenReader(`Expanded FAQ item: ${this.textContent.trim()}`);
        }
      });

      // Accessible Keyboard Navigation (Arrow Keys, Home, End)
      btn.addEventListener('keydown', function (e) {
        let targetIndex = -1;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          targetIndex = (idx + 1) % questions.length;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          targetIndex = (idx - 1 + questions.length) % questions.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          targetIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          targetIndex = questions.length - 1;
        }

        if (targetIndex !== -1 && questions[targetIndex]) {
          questions[targetIndex].focus();
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     8. FORMS (FEEDBACK & CONSULTANCY)
     ══════════════════════════════════════════════════════════════ */

  function initForms() {
    // Feedback form
    const feedbackForm = document.getElementById('jum-feedback-form');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const btnSubmit = feedbackForm.querySelector('button[type="submit"]');
        const role = document.getElementById('jum-fb-role')?.value || 'Educator';
        const notes = document.getElementById('jum-fb-notes')?.value || '';

        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.textContent = 'Submitting...';
        }

        setTimeout(() => {
          feedbackForm.reset();
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = '✓ Feedback Submitted. Asante Sana!';
            btnSubmit.style.background = 'var(--jum-teal)';
            setTimeout(() => {
              btnSubmit.textContent = 'Submit Prototype Feedback';
              btnSubmit.style.background = '';
            }, 4000);
          }
          showToast('Thank you! Your feedback helps us build a more inclusive Kenya.', 'success', 5000);
          announceToScreenReader('Feedback submitted successfully.');
        }, 1200);
      });
    }

    // Consultancy request form
    const consultForm = document.getElementById('jum-consultation-form');
    if (consultForm) {
      consultForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const btnSubmit = consultForm.querySelector('button[type="submit"]');

        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.textContent = 'Sending Request...';
        }

        setTimeout(() => {
          consultForm.reset();
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = '✓ Request Received! Our Team Will Contact You';
            btnSubmit.style.background = 'var(--secondary)';
            setTimeout(() => {
              btnSubmit.textContent = 'Schedule Inclusive Assessment & Consultation';
              btnSubmit.style.background = '';
            }, 5000);
          }
          showToast('Consultation request received! An Instructify Kenya inclusion specialist will follow up shortly.', 'success', 6000);
          announceToScreenReader('Consultation request received.');
        }, 1400);
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════
     9. EXPLORE SUPPORT BUTTONS (CROSS-LINK TO BUILDER)
     ══════════════════════════════════════════════════════════════ */

  function initExploreSupportButtons() {
    document.querySelectorAll('.jum-btn-explore-support').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const category = this.getAttribute('data-support-cat');
        if (category) {
          // Check the category in the builder
          document.querySelectorAll('input[name="jum-support-cat"]').forEach(cb => {
            if (cb.value.toLowerCase().includes(category.toLowerCase())) {
              cb.checked = true;
            }
          });
        }
        const builder = document.getElementById('content-builder');
        if (builder) {
          builder.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        currentStep = 3; // jump to support step
        updateStepperUI();
        showToast(`Loaded "${category}" support into Content Builder!`, 'info');
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     10. INCLUSIVE COURSE & LESSON STUDIO ENGINE
     ══════════════════════════════════════════════════════════════ */

  const COURSES_STORAGE_KEY = 'jumuishi_educator_courses_v1';
  let activeCourses = [];
  let currentViewingCourseId = null;
  let currentEditingCourseId = null;
  let currentEditingLessonId = null;
  let currentLessonAttachments = [];

  function getDefaultExemplarCourses() {
    return [
      {
        id: 'course-cbc-g3-math',
        title: 'CBC Grade 3: Inclusive Mathematics & Numeracy',
        grade: 'Grade 3',
        subject: 'Mathematics',
        theme: 'math',
        icon: '🔢',
        needs: ['Autism', 'Dyslexia', 'ADHD', 'Hearing'],
        desc: 'Foundational numeracy curriculum emphasizing concrete manipulatives, tactile number tracks, visual timetables, and multi-tiered UDL accommodations.',
        competencies: 'Critical Thinking, Problem Solving, Mathematical Communication & Collaboration',
        lessons: [
          {
            id: 'les-g3-m-1',
            title: 'Multiplication as Repeated Addition with Bottle Tops & Number Tracks',
            duration: '35 mins',
            outcome: 'By the end of the lesson, the learner should be able to represent multiplication as repeated equal groups of items using concrete bottle tops.',
            competencies: 'Critical thinking, peer collaboration, mathematical communication',
            intro: 'Sensory hook: Teacher displays 3 clear plastic cups containing 4 colorful bottle tops each. Explicit teacher modeling: "3 groups of 4 bottle tops is 4 + 4 + 4 = 12 total tops."',
            guided: 'Paired inquiry: Learners work in peer pairs with cardboard sorting trays to construct 2 groups of 5 and 4 groups of 3 using clean bottle tops.',
            activity: 'Tiered task cards: Tier 1 constructs repeated addition on number grids; Tier 2 counts with textured tactile dots; Tier 3 matches visual photo cards to physical quantities.',
            wrapup: 'Learner thumbs check, choral verbal chant ("Equal groups make multiplication!"), 2-minute calming deep breath transition.',
            tier1: 'Clear visual sequence on board, high-contrast numerals, oral instructions paired with physical gestures.',
            tier2: 'Color-coded number tracks, noise-muffling earmuffs for sensory regulation, tactile finger counters.',
            tier3: '1-on-1 peer buddy support, PECS cards for "More" and "Finished", physical guidance with adapted gripping bowls.',
            materials: 'Plastic bottle tops, egg carton sorting trays, visual schedule strips',
            attachments: [
              { name: 'Grade3_Multiplication_Tactile_Worksheet.pdf', size: '142 KB', type: 'application/pdf', date: '2026-09-10', dataUrl: '' },
              { name: 'Bottle_Top_Math_Picture_Cards.png', size: '280 KB', type: 'image/png', date: '2026-09-10', dataUrl: '' }
            ]
          },
          {
            id: 'les-g3-m-2',
            title: 'Place Value Tens & Ones with Bundled Twigs & Elastic Bands',
            duration: '40 mins',
            outcome: 'Learners bundle 10 single twigs into 1 ten and count two-digit quantities accurately with concrete understanding.',
            competencies: 'Numeracy, fine motor coordination, self-efficacy',
            intro: 'Demonstrate bundles of ten twigs tied with colored rubber bands versus single loose twigs. Count aloud with rhythmic clapping.',
            guided: 'Small group table activity: Each student receives 25 twigs and creates 2 bundles of ten and 5 singles with peer assistance.',
            activity: 'Represent two-digit numbers on tactile place value mats using sand trays, raised numeral cards, or drawing.',
            wrapup: 'Place value show-and-tell: learners hold up bundles for the whole class to see and cheer.',
            tier1: 'Color coding: Blue for Tens, Orange for Ones across all boards and handouts.',
            tier2: 'Pre-bundled sticks with thick elastic bands for learners with fine motor challenges.',
            tier3: 'Braille number tiles, large foam counter rods, verbal description of bundle textures.',
            materials: 'Smooth twigs, colored rubber bands, sand tracing trays',
            attachments: [
              { name: 'Place_Value_Tens_Ones_Template.pdf', size: '95 KB', type: 'application/pdf', date: '2026-09-11', dataUrl: '' }
            ]
          },
          {
            id: 'les-g3-m-3',
            title: 'Fractions as Halves & Quarters using Kenyan Fruit Models & Paper Folding',
            duration: '35 mins',
            outcome: 'Identify and demonstrate 1/2 and 1/4 using folded paper strips and clay fruit models.',
            competencies: 'Spatial reasoning, sharing and fairness, communication',
            intro: 'Story hook: Sharing a ripe orange equally between two friends. Folding paper circles into equal halves.',
            guided: 'Fold circular paper into 2 and 4 equal parts; color 1 part and label with large tactile print.',
            activity: 'Learners match fraction cards (1/2, 1/4) to concrete segmented discs.',
            wrapup: 'Group reflection on fair sharing at home, in the market, and in school.',
            tier1: 'Clear fold crease guidelines, bright contrasting colors.',
            tier2: 'Thick cardboard fraction puzzle pieces with grip knobs.',
            tier3: 'Raised line tactile fraction plates, partner assisted fold guidance.',
            materials: 'Cardboard circles, safe child scissors, clay fruit models',
            attachments: [
              { name: 'Fractions_Half_Quarter_Visual_Cards.pdf', size: '118 KB', type: 'application/pdf', date: '2026-09-12', dataUrl: '' }
            ]
          }
        ]
      },
      {
        id: 'course-cbc-ey-lit',
        title: 'Early Years Inclusive Literacy: Sounds & Multisensory Storytelling',
        grade: 'Grade 1',
        subject: 'English Language',
        theme: 'lit',
        icon: '📖',
        needs: ['Dyslexia', 'Speech', 'Hearing', 'Autism'],
        desc: 'Phonics, vocabulary, and expressive communication tailored for early learners using Kenya Sign Language (KSL) fingerspelling, sand tracing, and visual cues.',
        competencies: 'Communication, Self-Efficacy, Digital & Oral Literacy',
        lessons: [
          {
            id: 'les-ey-lit-1',
            title: 'Letter Sound /s/ with Sensory Sand Tracing & Snake Movement',
            duration: '30 mins',
            outcome: 'Pronounce, sign, and write the letter sound /s/ while associating it with familiar environmental objects.',
            competencies: 'Phonemic awareness, motor imitation, KSL fingerspelling',
            intro: 'Sound song: Sibilant /s/ sound accompanied by arm slithering motion and visual snake card.',
            guided: 'Trace letter "s" in colored sand trays, feeling the curved path with two fingers.',
            activity: 'Sort picture cards into "Starts with /s/" (sun, soup, soap) versus other sounds.',
            wrapup: 'KSL fingerspelling demonstration of "S" by the class.',
            tier1: 'Multisensory presentation: see it, hear it, trace it, sign it.',
            tier2: 'Textured sandpaper letters, whisper phones for auditory feedback.',
            tier3: 'Sign language flashcards, high-contrast black-on-yellow visual cards, non-verbal affirmation stamps.',
            materials: 'Fine sand trays, sandpaper letter cards, picture sort cards',
            attachments: [
              { name: 'Letter_S_Multisensory_Guide.pdf', size: '175 KB', type: 'application/pdf', date: '2026-09-08', dataUrl: '' }
            ]
          },
          {
            id: 'les-ey-lit-2',
            title: 'Inclusive Story Circle: "The Brave Hare" with Tactile Story Props',
            duration: '35 mins',
            outcome: 'Sequence 3 main events of the story using visual puppets and sensory props.',
            competencies: 'Listening and comprehension, emotional expression, sequencing',
            intro: 'Introduce story puppets (Hare, Tortoise, Tree) with expressive voices and sign gestures.',
            guided: 'Read story with repetitive refrain where all children chime in with sounds or claps.',
            activity: 'Sequence story cards: Beginning, Middle, End using velcro timeline board.',
            wrapup: 'Learners choose their favorite character puppet and share how the character felt.',
            tier1: 'Visual schedule cards, exaggerated facial expressions, rhythm sticks.',
            tier2: 'Simplified 3-card sequence with color borders (Green=Start, Yellow=Middle, Red=End).',
            tier3: 'Tactile fabric puppets with distinct textures (furry hare, rough tortoise shell), PECS emotion cards.',
            materials: 'Sock puppets, velcro story strip, sensory props',
            attachments: [
              { name: 'Brave_Hare_Story_Props_Printables.pdf', size: '210 KB', type: 'application/pdf', date: '2026-09-09', dataUrl: '' }
            ]
          },
          {
            id: 'les-ey-lit-3',
            title: 'Action Words (Verbs) with Total Physical Response (TPR) & Sign Language',
            duration: '30 mins',
            outcome: 'Demonstrate and express 5 everyday action words: Run, Jump, Eat, Read, Sleep.',
            competencies: 'Body coordination, expressive language, interactive gameplay',
            intro: 'Simon Says game adapted with bilingual KSL signing and picture prompts.',
            guided: 'Teacher signs and says action; class acts out the action together.',
            activity: 'Action Charades: Learners pull an action card and act it out or point to picture.',
            wrapup: 'Calming slow-motion stretch mimicking "Sleep".',
            tier1: 'Visual action cards shown alongside every spoken or signed word.',
            tier2: 'Option to point to picture rather than speak for non-verbal or shy learners.',
            tier3: 'Wheelchair/seated movement adaptations for physical differences, high contrast borders.',
            materials: 'Laminated action flashcards, soft foam dice',
            attachments: [
              { name: 'Action_Verbs_KSL_Chart.pdf', size: '130 KB', type: 'application/pdf', date: '2026-09-10', dataUrl: '' }
            ]
          }
        ]
      },
      {
        id: 'course-cbc-env-sci',
        title: 'CBC Grade 2: Integrated Environmental Activities & Living Things',
        grade: 'Grade 2',
        subject: 'Environmental Activities',
        theme: 'sci',
        icon: '🌿',
        needs: ['Visual', 'Physical', 'ADHD', 'Intellectual'],
        desc: 'Hands-on inquiry into schoolyard flora and fauna with sensory exploration, tactile leaf rubbing, accessible gardening, and sound walks.',
        competencies: 'Environmental Conservation, Observation, Collaboration',
        lessons: [
          {
            id: 'les-env-sci-1',
            title: 'Sensory Tree Exploration: Bark Rubbing & Texture Mapping',
            duration: '40 mins',
            outcome: 'Compare rough and smooth tree bark and identify two common Kenyan tree types.',
            competencies: 'Observation, sensory discrimination, fine motor control',
            intro: 'Sensory mystery box: Learners touch rough bark and smooth leaves without looking and describe what they feel.',
            guided: 'Outdoor compound walk: Pair work where learners select a tree and place paper on the trunk.',
            activity: 'Crayon rubbing on sturdy paper to capture bark textures; share with partner.',
            wrapup: 'Handwashing and collective gallery display of bark rubbings on the class line.',
            tier1: 'Paved outdoor paths ensuring accessibility for wheelchair and mobility aid users.',
            tier2: 'Thick triangular crayons easy to grip; clipboard with secure clips.',
            tier3: 'Descriptive auditory narration of textures, tactile guidance from teacher assistant.',
            materials: 'Recycled newsprint paper, jumbo wax crayons, outdoor clipboards',
            attachments: [
              { name: 'Tree_Bark_Rubbing_Activity_Sheet.pdf', size: '105 KB', type: 'application/pdf', date: '2026-09-07', dataUrl: '' }
            ]
          },
          {
            id: 'les-env-sci-2',
            title: 'Parts of a Plant: Roots, Stem, Leaves, Flower with Living Specimens',
            duration: '35 mins',
            outcome: 'Identify and name the 4 core parts of a flowering plant using potted bean seedlings.',
            competencies: 'Scientific curiosity, care for living things, tactile examination',
            intro: 'Observe real bean seedlings in transparent plastic cups showing roots in soil.',
            guided: 'Guided plant dissection: gently touching roots, tracing the stem, examining leaf veins.',
            activity: 'Learners assemble a 3D plant collage using real fallen leaves, yarn for roots, and paper stems.',
            wrapup: 'Watering seedlings and placing them on the sunny window sill.',
            tier1: 'Real living specimens instead of 2D blackboard drawings.',
            tier2: 'Magnifying glasses with LED lights, textured labels for each part.',
            tier3: 'Braille/embossed plant diagrams, tactile scent exploration of aromatic leaves.',
            materials: 'Potted bean plants, hand magnifiers, glue sticks, craft paper',
            attachments: [
              { name: 'Parts_of_a_Plant_Tactile_Diagram.pdf', size: '160 KB', type: 'application/pdf', date: '2026-09-08', dataUrl: '' }
            ]
          },
          {
            id: 'les-env-sci-3',
            title: 'Water Conservation at School & Home: Daily Saving Habits',
            duration: '35 mins',
            outcome: 'Demonstrate 3 practical ways to save water during handwashing and school chores.',
            competencies: 'Citizenship, personal responsibility, practical hygiene',
            intro: 'Demonstration of a dripping tap vs a tightly closed tap; listening to the drip rate.',
            guided: 'Tippy-tap handwashing demonstration in the school compound with soap on a string.',
            activity: 'Create visual reminder stickers ("Turn Off Tap!", "Okoa Maji!") to place near sinks.',
            wrapup: 'Pledge to be a "Jumuishi Water Guardian".',
            tier1: 'Picture instructions mounted at child eye-level near washing points.',
            tier2: 'Adapted push-taps or lever faucets that require minimal hand strength.',
            tier3: 'Social stories explaining why water conservation matters with symbol cards.',
            materials: 'Tippy-tap setup, colored stickers, markers, visual cards',
            attachments: [
              { name: 'Water_Guardian_Checklist.pdf', size: '90 KB', type: 'application/pdf', date: '2026-09-09', dataUrl: '' }
            ]
          }
        ]
      }
    ];
  }

  function loadCourses() {
    try {
      const saved = localStorage.getItem(COURSES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeCourses = parsed;
          return;
        }
      }
    } catch (err) {
      console.warn('Could not parse saved courses from localStorage', err);
    }
    activeCourses = getDefaultExemplarCourses();
    saveCourses(activeCourses);
  }

  function saveCourses(courses) {
    try {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    } catch (err) {
      console.error('Failed to save courses to localStorage', err);
      showToast('Storage limit reached. Try removing some attached files.', 'warning');
    }
    updateStudioStats();
  }

  function updateStudioStats() {
    const courseCountEl = document.getElementById('jum-stat-courses-count');
    const lessonCountEl = document.getElementById('jum-stat-lessons-count');
    const attachCountEl = document.getElementById('jum-stat-attachments-count');

    let totalLessons = 0;
    let totalAttachments = 0;

    activeCourses.forEach(c => {
      if (Array.isArray(c.lessons)) {
        totalLessons += c.lessons.length;
        c.lessons.forEach(l => {
          if (Array.isArray(l.attachments)) {
            totalAttachments += l.attachments.length;
          }
        });
      }
    });

    if (courseCountEl) courseCountEl.textContent = activeCourses.length;
    if (lessonCountEl) lessonCountEl.textContent = totalLessons;
    if (attachCountEl) attachCountEl.textContent = totalAttachments;
  }

  function renderCoursesGrid(filterText = '', filterGrade = 'all', filterNeed = 'all') {
    const container = document.getElementById('jum-course-cards-container');
    const emptyState = document.getElementById('jum-course-empty-state');
    if (!container) return;

    const query = filterText.toLowerCase().trim();

    const filtered = activeCourses.filter(course => {
      // Grade filter
      if (filterGrade !== 'all' && !course.grade.toLowerCase().includes(filterGrade.toLowerCase())) {
        return false;
      }
      // Need filter
      if (filterNeed !== 'all') {
        const hasNeed = course.needs && course.needs.some(n => n.toLowerCase().includes(filterNeed.toLowerCase()));
        if (!hasNeed) return false;
      }
      // Search query
      if (query) {
        const inTitle = course.title && course.title.toLowerCase().includes(query);
        const inDesc = course.desc && course.desc.toLowerCase().includes(query);
        const inSub = course.subject && course.subject.toLowerCase().includes(query);
        const inLessons = course.lessons && course.lessons.some(l => 
          (l.title && l.title.toLowerCase().includes(query)) ||
          (l.outcome && l.outcome.toLowerCase().includes(query))
        );
        if (!inTitle && !inDesc && !inSub && !inLessons) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = filtered.map(course => {
      const lessonsCount = course.lessons ? course.lessons.length : 0;
      let totalFiles = 0;
      if (course.lessons) {
        course.lessons.forEach(l => {
          if (l.attachments) totalFiles += l.attachments.length;
        });
      }

      const tagsHtml = (course.needs || []).map(need => 
        `<span class="jum-course-tag">${need}</span>`
      ).join('');

      const bannerClass = course.theme ? `jum-course-card-banner ${course.theme}` : 'jum-course-card-banner';

      return `
        <article class="jum-course-card" data-course-id="${course.id}">
          <div class="${bannerClass}">
            <div class="jum-course-badge-row">
              <span class="jum-course-grade-badge">${course.grade}</span>
              <span class="jum-course-subject-badge">${course.subject}</span>
            </div>
            <span class="jum-course-card-icon" aria-hidden="true">${course.icon || '📚'}</span>
          </div>
          <div class="jum-course-card-content">
            <h4 class="jum-course-card-title">${course.title}</h4>
            <p class="jum-course-card-desc">${course.desc || 'Comprehensive inclusive learning curriculum aligned with the Kenyan CBC.'}</p>
            <div class="jum-course-tags" aria-label="Support focus areas">
              ${tagsHtml}
            </div>
            <div class="jum-course-card-meta">
              <span><span aria-hidden="true">📝</span> ${lessonsCount} ${lessonsCount === 1 ? 'Lesson' : 'Lessons'}</span>
              <span><span aria-hidden="true">📎</span> ${totalFiles} ${totalFiles === 1 ? 'Resource' : 'Resources'}</span>
            </div>
            <div class="jum-course-card-footer">
              <button type="button" class="jum-course-btn primary" data-action="view-lessons" data-course-id="${course.id}">
                <span aria-hidden="true">📂</span> View Lessons
              </button>
              <button type="button" class="jum-course-btn" data-action="add-lesson" data-course-id="${course.id}">
                <span aria-hidden="true">➕</span> Add Lesson
              </button>
              <button type="button" class="jum-course-btn" data-action="edit-course" data-course-id="${course.id}" title="Edit Course Details">
                <span aria-hidden="true">✏️</span>
              </button>
              <button type="button" class="jum-course-btn" data-action="delete-course" data-course-id="${course.id}" title="Delete Course" style="color:var(--error-color);">
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners to course cards
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-action');
        const courseId = btn.getAttribute('data-course-id');
        if (action === 'view-lessons') {
          openCourseLessonsViewer(courseId);
        } else if (action === 'add-lesson') {
          openLessonModal(courseId, null);
        } else if (action === 'edit-course') {
          openCourseModal(courseId);
        } else if (action === 'delete-course') {
          deleteCourse(courseId);
        }
      });
    });
  }

  function openCourseLessonsViewer(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    currentViewingCourseId = courseId;

    const viewer = document.getElementById('jum-course-lessons-viewer');
    const gradeEl = document.getElementById('jum-viewer-course-grade');
    const titleEl = document.getElementById('jum-viewer-course-title');
    const descEl = document.getElementById('jum-viewer-course-desc');
    const listEl = document.getElementById('jum-viewer-lessons-list');

    if (!viewer || !listEl) return;

    if (gradeEl) gradeEl.textContent = `${course.grade} • ${course.subject}`;
    if (titleEl) titleEl.textContent = course.title;
    if (descEl) descEl.textContent = course.desc || 'Manage and review lesson plans and adaptations for this course.';

    const lessons = course.lessons || [];

    if (lessons.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:36px 20px;background:var(--surface-color-soft);border-radius:var(--radius-lg);border:1.5px dashed var(--border-color);">
          <div style="font-size:36px;margin-bottom:8px;" aria-hidden="true">📝</div>
          <h4 style="font-family:var(--font-heading);font-size:16px;font-weight:700;color:var(--heading-color);margin-bottom:6px;">No Lessons Created Yet</h4>
          <p style="font-size:13.5px;color:var(--muted-text-color);margin-bottom:16px;">Add your first differentiated lesson or import one from the Content Builder.</p>
          <button type="button" class="btn-jum-primary-sm" data-action="viewer-add-first-lesson">
            <span aria-hidden="true">➕</span> Add First Lesson
          </button>
        </div>
      `;
      const addFirstBtn = listEl.querySelector('[data-action="viewer-add-first-lesson"]');
      if (addFirstBtn) {
        addFirstBtn.addEventListener('click', () => openLessonModal(courseId, null));
      }
    } else {
      listEl.innerHTML = lessons.map((lesson, idx) => {
        const fileCount = lesson.attachments ? lesson.attachments.length : 0;
        
        let filesHtml = '';
        if (fileCount > 0) {
          const chips = lesson.attachments.map((file, fIdx) => {
            let icon = '📄';
            if (file.type && file.type.includes('image')) icon = '🖼️';
            if (file.type && file.type.includes('audio')) icon = '🎵';
            if (file.type && file.type.includes('pdf')) icon = '📕';

            if (file.dataUrl) {
              return `<a href="${file.dataUrl}" download="${file.name}" class="jum-file-chip" title="Download ${file.name}">
                <span aria-hidden="true">${icon}</span> <span>${file.name}</span> <small style="color:var(--muted-text-color);">(${file.size})</small>
              </a>`;
            } else {
              return `<span class="jum-file-chip">
                <span aria-hidden="true">${icon}</span> <span>${file.name}</span> <small style="color:var(--muted-text-color);">(${file.size})</small>
              </span>`;
            }
          }).join('');

          filesHtml = `
            <div class="jum-lesson-attached-files">
              <div class="jum-attached-files-title">
                <span aria-hidden="true">📎</span> Attached Materials (${fileCount})
              </div>
              <div class="jum-file-chips">
                ${chips}
              </div>
            </div>
          `;
        }

        return `
          <div class="jum-lesson-item" data-lesson-id="${lesson.id}">
            <div class="jum-lesson-summary" tabindex="0" role="button" aria-expanded="false" aria-controls="lesson-body-${lesson.id}">
              <div class="jum-lesson-left">
                <div class="jum-lesson-num">${idx + 1}</div>
                <div>
                  <div class="jum-lesson-title">${lesson.title}</div>
                  <div class="jum-lesson-meta">${lesson.competencies || 'Kenyan CBC Core Competencies'}</div>
                </div>
              </div>
              <div class="jum-lesson-right">
                <span class="jum-lesson-duration-badge">⏱️ ${lesson.duration || '35 mins'}</span>
                ${fileCount > 0 ? `<span class="jum-lesson-materials-badge">📎 ${fileCount} files</span>` : ''}
                <button type="button" class="jum-lesson-expand-btn" aria-label="Toggle lesson details">▼</button>
              </div>
            </div>

            <div class="jum-lesson-body" id="lesson-body-${lesson.id}">
              <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;">
                <strong style="font-family:var(--font-heading);font-size:12.5px;color:var(--primary-color);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">
                  Specific Learning Outcome (CBC)
                </strong>
                <p style="margin:0;font-size:14px;color:var(--heading-color);">${lesson.outcome || 'Not specified.'}</p>
              </div>

              <!-- 4 Step Instruction Grid -->
              <div class="jum-lesson-steps-grid">
                <div class="jum-lesson-step-box">
                  <strong>1. Modeling (I Do)</strong>
                  <p style="margin:0;font-size:13px;">${lesson.intro || 'Explicit teacher demonstration with concrete materials.'}</p>
                </div>
                <div class="jum-lesson-step-box">
                  <strong>2. Guided Inquiry (We Do)</strong>
                  <p style="margin:0;font-size:13px;">${lesson.guided || 'Collaborative paired work with concrete manipulatives.'}</p>
                </div>
                <div class="jum-lesson-step-box">
                  <strong>3. Tiered Activity (You Do)</strong>
                  <p style="margin:0;font-size:13px;">${lesson.activity || 'Differentiated independent activity suited to learner profile.'}</p>
                </div>
                <div class="jum-lesson-step-box">
                  <strong>4. Reflection & Wrap-up</strong>
                  <p style="margin:0;font-size:13px;">${lesson.wrapup || 'Sensory check, thumbs reflection, and smooth transition.'}</p>
                </div>
              </div>

              <!-- Multi-Tier UDL Accommodations -->
              <div style="background:var(--surface-color-soft);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:14px;margin-top:14px;">
                <strong style="font-family:var(--font-heading);font-size:12px;color:var(--jum-teal-hover);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:8px;">
                  Multi-Tiered UDL Accommodations
                </strong>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:10px;font-size:12.5px;">
                  <div>
                    <span style="font-weight:700;color:var(--primary-color);">Tier 1 (Universal):</span>
                    <div>${lesson.tier1 || 'Visual timetables, oral narration, high contrast.'}</div>
                  </div>
                  <div>
                    <span style="font-weight:700;color:var(--jum-gold);">Tier 2 (Targeted):</span>
                    <div>${lesson.tier2 || 'Color-coded cues, tactile cards, quiet spaces.'}</div>
                  </div>
                  <div>
                    <span style="font-weight:700;color:var(--error-color);">Tier 3 (Intensive):</span>
                    <div>${lesson.tier3 || '1-on-1 shadow teacher support, PECS cards, Braille.'}</div>
                  </div>
                </div>
              </div>

              ${lesson.materials ? `
                <div style="margin-top:12px;font-size:12.5px;color:var(--text-color);">
                  <strong>Materials &amp; Assistive Devices:</strong> ${lesson.materials}
                </div>
              ` : ''}

              ${filesHtml}

              <!-- Toolbar inside lesson -->
              <div class="jum-lesson-toolbar">
                <button type="button" class="btn-jum-outline-sm" data-action="preview-lesson" data-lesson-id="${lesson.id}">
                  <span aria-hidden="true">📖</span> Full View / Print
                </button>
                <button type="button" class="btn-jum-outline-sm" data-action="edit-lesson" data-lesson-id="${lesson.id}">
                  <span aria-hidden="true">✏️</span> Edit Lesson
                </button>
                <button type="button" class="btn-jum-danger-sm" data-action="delete-lesson" data-lesson-id="${lesson.id}">
                  <span aria-hidden="true">🗑️</span> Delete
                </button>
              </div>

            </div>
          </div>
        `;
      }).join('');

      // Accordion toggles
      listEl.querySelectorAll('.jum-lesson-summary').forEach(summary => {
        summary.addEventListener('click', () => {
          const item = summary.closest('.jum-lesson-item');
          const wasOpen = item.classList.contains('open');
          item.classList.toggle('open');
          summary.setAttribute('aria-expanded', !wasOpen);
        });
        summary.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            summary.click();
          }
        });
      });

      // Toolbar buttons
      listEl.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          const lessonId = btn.getAttribute('data-lesson-id');
          if (action === 'preview-lesson') {
            openLessonPreviewModal(courseId, lessonId);
          } else if (action === 'edit-lesson') {
            openLessonModal(courseId, lessonId);
          } else if (action === 'delete-lesson') {
            deleteLesson(courseId, lessonId);
          }
        });
      });
    }

    viewer.classList.add('active');
    viewer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    announceToScreenReader(`Opened lesson list for ${course.title}`);
  }

  function closeCourseLessonsViewer() {
    const viewer = document.getElementById('jum-course-lessons-viewer');
    if (viewer) viewer.classList.remove('active');
    currentViewingCourseId = null;
  }

  function openCourseModal(courseId = null) {
    currentEditingCourseId = courseId;
    const modal = document.getElementById('jum-modal-course');
    const headingText = document.getElementById('jum-modal-course-heading-text');
    const inputId = document.getElementById('jum-input-course-id');
    const inputTitle = document.getElementById('jum-input-course-title');
    const inputGrade = document.getElementById('jum-input-course-grade');
    const inputSubject = document.getElementById('jum-input-course-subject');
    const inputTheme = document.getElementById('jum-input-course-theme');
    const inputIcon = document.getElementById('jum-input-course-icon');
    const inputDesc = document.getElementById('jum-input-course-desc');
    const inputComp = document.getElementById('jum-input-course-competencies');
    const needsBoxes = document.querySelectorAll('#jum-course-needs-checkboxes input[type="checkbox"]');

    if (!modal) return;

    if (courseId) {
      const course = activeCourses.find(c => c.id === courseId);
      if (!course) return;
      if (headingText) headingText.textContent = 'Edit Inclusive Course';
      if (inputId) inputId.value = course.id;
      if (inputTitle) inputTitle.value = course.title || '';
      if (inputGrade) inputGrade.value = course.grade || 'Grade 3';
      if (inputSubject) inputSubject.value = course.subject || 'Mathematics';
      if (inputTheme) inputTheme.value = course.theme || 'default';
      if (inputIcon) inputIcon.value = course.icon || '📚';
      if (inputDesc) inputDesc.value = course.desc || '';
      if (inputComp) inputComp.value = course.competencies || '';

      needsBoxes.forEach(cb => {
        cb.checked = course.needs && course.needs.includes(cb.value);
      });
    } else {
      if (headingText) headingText.textContent = 'Create Inclusive Course';
      if (inputId) inputId.value = '';
      if (inputTitle) inputTitle.value = '';
      if (inputGrade) inputGrade.value = 'Grade 3';
      if (inputSubject) inputSubject.value = 'Mathematics';
      if (inputTheme) inputTheme.value = 'math';
      if (inputIcon) inputIcon.value = '🔢';
      if (inputDesc) inputDesc.value = '';
      if (inputComp) inputComp.value = '';
      needsBoxes.forEach(cb => { cb.checked = ['Autism', 'Dyslexia'].includes(cb.value); });
    }

    modal.classList.add('active');
    if (inputTitle) inputTitle.focus();
  }

  function closeCourseModal() {
    const modal = document.getElementById('jum-modal-course');
    if (modal) modal.classList.remove('active');
    currentEditingCourseId = null;
  }

  function handleCourseFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('jum-input-course-id')?.value;
    const title = document.getElementById('jum-input-course-title')?.value.trim();
    const grade = document.getElementById('jum-input-course-grade')?.value;
    const subject = document.getElementById('jum-input-course-subject')?.value;
    const theme = document.getElementById('jum-input-course-theme')?.value;
    const icon = document.getElementById('jum-input-course-icon')?.value;
    const desc = document.getElementById('jum-input-course-desc')?.value.trim();
    const comp = document.getElementById('jum-input-course-competencies')?.value.trim();

    if (!title) {
      showToast('Please enter a course title.', 'error');
      return;
    }

    const selectedNeeds = [];
    document.querySelectorAll('#jum-course-needs-checkboxes input[type="checkbox"]:checked').forEach(cb => {
      selectedNeeds.push(cb.value);
    });

    if (id) {
      // Edit existing
      const course = activeCourses.find(c => c.id === id);
      if (course) {
        course.title = title;
        course.grade = grade;
        course.subject = subject;
        course.theme = theme;
        course.icon = icon;
        course.desc = desc;
        course.competencies = comp;
        course.needs = selectedNeeds;
        showToast(`Course "${title}" updated successfully!`, 'success');
      }
    } else {
      // Create new
      const newCourse = {
        id: `course_${Date.now()}`,
        title: title,
        grade: grade,
        subject: subject,
        theme: theme,
        icon: icon,
        desc: desc,
        competencies: comp,
        needs: selectedNeeds,
        lessons: []
      };
      activeCourses.unshift(newCourse);
      showToast(`Course "${title}" created successfully!`, 'success');
    }

    saveCourses(activeCourses);
    renderCoursesGrid();
    closeCourseModal();

    if (currentViewingCourseId && id === currentViewingCourseId) {
      openCourseLessonsViewer(id);
    }
  }

  function deleteCourse(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    if (confirm(`Are you sure you want to delete "${course.title}" and all its lessons? This action cannot be undone.`)) {
      activeCourses = activeCourses.filter(c => c.id !== courseId);
      saveCourses(activeCourses);
      renderCoursesGrid();
      if (currentViewingCourseId === courseId) {
        closeCourseLessonsViewer();
      }
      showToast('Course deleted successfully.', 'info');
    }
  }

  function openLessonModal(courseId, lessonId = null) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    currentViewingCourseId = courseId;
    currentEditingLessonId = lessonId;
    currentLessonAttachments = [];

    const modal = document.getElementById('jum-modal-lesson');
    const headingText = document.getElementById('jum-modal-lesson-heading-text');
    const inputCourseId = document.getElementById('jum-input-lesson-course-id');
    const inputLessonId = document.getElementById('jum-input-lesson-id');
    const inputTitle = document.getElementById('jum-input-lesson-title');
    const inputDuration = document.getElementById('jum-input-lesson-duration');
    const inputComp = document.getElementById('jum-input-lesson-competencies');
    const inputOutcome = document.getElementById('jum-input-lesson-outcome');
    const inputIntro = document.getElementById('jum-input-lesson-intro');
    const inputGuided = document.getElementById('jum-input-lesson-guided');
    const inputActivity = document.getElementById('jum-input-lesson-activity');
    const inputWrapup = document.getElementById('jum-input-lesson-wrapup');
    const inputTier1 = document.getElementById('jum-input-lesson-tier1');
    const inputTier2 = document.getElementById('jum-input-lesson-tier2');
    const inputTier3 = document.getElementById('jum-input-lesson-tier3');
    const inputMaterials = document.getElementById('jum-input-lesson-materials');

    if (!modal) return;

    if (inputCourseId) inputCourseId.value = courseId;

    if (lessonId) {
      const lesson = (course.lessons || []).find(l => l.id === lessonId);
      if (!lesson) return;

      if (headingText) headingText.textContent = `Edit Lesson (${course.title})`;
      if (inputLessonId) inputLessonId.value = lesson.id;
      if (inputTitle) inputTitle.value = lesson.title || '';
      if (inputDuration) inputDuration.value = lesson.duration || '35 mins';
      if (inputComp) inputComp.value = lesson.competencies || '';
      if (inputOutcome) inputOutcome.value = lesson.outcome || '';
      if (inputIntro) inputIntro.value = lesson.intro || '';
      if (inputGuided) inputGuided.value = lesson.guided || '';
      if (inputActivity) inputActivity.value = lesson.activity || '';
      if (inputWrapup) inputWrapup.value = lesson.wrapup || '';
      if (inputTier1) inputTier1.value = lesson.tier1 || '';
      if (inputTier2) inputTier2.value = lesson.tier2 || '';
      if (inputTier3) inputTier3.value = lesson.tier3 || '';
      if (inputMaterials) inputMaterials.value = lesson.materials || '';

      if (lesson.attachments && Array.isArray(lesson.attachments)) {
        currentLessonAttachments = JSON.parse(JSON.stringify(lesson.attachments));
      }
    } else {
      if (headingText) headingText.textContent = `Add Lesson to ${course.title}`;
      if (inputLessonId) inputLessonId.value = '';
      if (inputTitle) inputTitle.value = '';
      if (inputDuration) inputDuration.value = '35 mins';
      if (inputComp) inputComp.value = course.competencies || 'Critical Thinking, Communication';
      if (inputOutcome) inputOutcome.value = '';
      if (inputIntro) inputIntro.value = '';
      if (inputGuided) inputGuided.value = '';
      if (inputActivity) inputActivity.value = '';
      if (inputWrapup) inputWrapup.value = '';
      if (inputTier1) inputTier1.value = '';
      if (inputTier2) inputTier2.value = '';
      if (inputTier3) inputTier3.value = '';
      if (inputMaterials) inputMaterials.value = '';
    }

    renderLessonAttachmentsPreview();
    modal.classList.add('active');
    if (inputTitle) inputTitle.focus();
  }

  function closeLessonModal() {
    const modal = document.getElementById('jum-modal-lesson');
    if (modal) modal.classList.remove('active');
    currentEditingLessonId = null;
    currentLessonAttachments = [];
  }

  function renderLessonAttachmentsPreview() {
    const list = document.getElementById('jum-uploaded-preview-list');
    if (!list) return;

    if (currentLessonAttachments.length === 0) {
      list.innerHTML = '';
      return;
    }

    list.innerHTML = currentLessonAttachments.map((file, idx) => {
      let icon = '📄';
      if (file.type && file.type.includes('image')) icon = '🖼️';
      if (file.type && file.type.includes('audio')) icon = '🎵';
      if (file.type && file.type.includes('pdf')) icon = '📕';

      return `
        <div class="jum-uploaded-file-row">
          <div class="jum-uploaded-file-info">
            <span aria-hidden="true">${icon}</span>
            <span style="font-weight:600;">${file.name}</span>
            <span style="color:var(--muted-text-color);font-size:11.5px;">(${file.size})</span>
          </div>
          <button type="button" class="jum-file-delete-btn" data-file-index="${idx}" aria-label="Remove attachment">&times;</button>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.jum-file-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-file-index'), 10);
        currentLessonAttachments.splice(idx, 1);
        renderLessonAttachmentsPreview();
      });
    });
  }

  function handleFilesSelected(files) {
    if (!files || files.length === 0) return;

    const maxFileSize = 5 * 1024 * 1024; // 5MB per file

    Array.from(files).forEach(file => {
      if (file.size > maxFileSize) {
        showToast(`"${file.name}" exceeds 5MB limit. Please upload a smaller file.`, 'warning');
        return;
      }

      const formattedSize = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = function (e) {
        currentLessonAttachments.push({
          name: file.name,
          size: formattedSize,
          type: file.type || 'application/octet-stream',
          date: new Date().toISOString().split('T')[0],
          dataUrl: e.target.result
        });
        renderLessonAttachmentsPreview();
        showToast(`Attached "${file.name}"`, 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  function handleLessonFormSubmit(e) {
    e.preventDefault();
    const courseId = document.getElementById('jum-input-lesson-course-id')?.value;
    const lessonId = document.getElementById('jum-input-lesson-id')?.value;
    const title = document.getElementById('jum-input-lesson-title')?.value.trim();
    const duration = document.getElementById('jum-input-lesson-duration')?.value.trim() || '35 mins';
    const comp = document.getElementById('jum-input-lesson-competencies')?.value.trim();
    const outcome = document.getElementById('jum-input-lesson-outcome')?.value.trim();
    const intro = document.getElementById('jum-input-lesson-intro')?.value.trim();
    const guided = document.getElementById('jum-input-lesson-guided')?.value.trim();
    const activity = document.getElementById('jum-input-lesson-activity')?.value.trim();
    const wrapup = document.getElementById('jum-input-lesson-wrapup')?.value.trim();
    const tier1 = document.getElementById('jum-input-lesson-tier1')?.value.trim();
    const tier2 = document.getElementById('jum-input-lesson-tier2')?.value.trim();
    const tier3 = document.getElementById('jum-input-lesson-tier3')?.value.trim();
    const materials = document.getElementById('jum-input-lesson-materials')?.value.trim();

    if (!title || !outcome) {
      showToast('Please fill in Lesson Title and Specific Learning Outcome.', 'error');
      return;
    }

    const course = activeCourses.find(c => c.id === courseId);
    if (!course) {
      showToast('Error: Target course not found.', 'error');
      return;
    }

    if (!course.lessons) course.lessons = [];

    const lessonData = {
      id: lessonId || `les_${Date.now()}`,
      title,
      duration,
      competencies: comp,
      outcome,
      intro,
      guided,
      activity,
      wrapup,
      tier1,
      tier2,
      tier3,
      materials,
      attachments: [...currentLessonAttachments]
    };

    if (lessonId) {
      const idx = course.lessons.findIndex(l => l.id === lessonId);
      if (idx !== -1) {
        course.lessons[idx] = lessonData;
        showToast(`Lesson "${title}" updated!`, 'success');
      }
    } else {
      course.lessons.push(lessonData);
      showToast(`Lesson "${title}" added to "${course.title}"!`, 'success');
    }

    saveCourses(activeCourses);
    renderCoursesGrid();
    openCourseLessonsViewer(courseId);
    closeLessonModal();
  }

  function deleteLesson(courseId, lessonId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course || !course.lessons) return;

    const lesson = course.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (confirm(`Are you sure you want to delete lesson "${lesson.title}"?`)) {
      course.lessons = course.lessons.filter(l => l.id !== lessonId);
      saveCourses(activeCourses);
      renderCoursesGrid();
      openCourseLessonsViewer(courseId);
      showToast('Lesson deleted.', 'info');
    }
  }

  function openLessonPreviewModal(courseId, lessonId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course || !course.lessons) return;

    const lesson = course.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const modal = document.getElementById('jum-modal-lesson-preview');
    const content = document.getElementById('jum-preview-lesson-modal-content');
    const editBtn = document.getElementById('jum-btn-preview-modal-edit');
    const printBtn = document.getElementById('jum-btn-preview-modal-print');

    if (!modal || !content) return;

    let attachmentsHtml = '';
    if (lesson.attachments && lesson.attachments.length > 0) {
      attachmentsHtml = `
        <div style="margin-top:20px;padding-top:16px;border-top:1.5px solid var(--border-color);">
          <h4 style="font-family:var(--font-heading);font-size:13.5px;font-weight:700;color:var(--heading-color);margin-bottom:10px;">
            Attached Teaching Materials (${lesson.attachments.length})
          </h4>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${lesson.attachments.map(file => {
              if (file.dataUrl) {
                return `<a href="${file.dataUrl}" download="${file.name}" class="jum-file-chip">
                  <span>📥 Download: <strong>${file.name}</strong></span> <small>(${file.size})</small>
                </a>`;
              } else {
                return `<span class="jum-file-chip">📄 ${file.name} <small>(${file.size})</small></span>`;
              }
            }).join('')}
          </div>
        </div>
      `;
    }

    content.innerHTML = `
      <div style="border-bottom:2px solid var(--primary-color);padding-bottom:16px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span class="jum-course-grade-badge" style="background:var(--primary-color);color:#fff;">${course.grade}</span>
          <span class="jum-course-subject-badge" style="background:var(--surface-color-soft);color:var(--text-color);border:1px solid var(--border-color);">${course.subject}</span>
          <span style="margin-left:auto;font-size:12.5px;font-weight:600;color:var(--muted-text-color);">⏱️ ${lesson.duration || '35 mins'}</span>
        </div>
        <h2 style="font-family:var(--font-heading);font-size:20px;font-weight:800;color:var(--heading-color);margin:0 0 6px;">
          ${lesson.title}
        </h2>
        <div style="font-size:13px;color:var(--muted-text-color);">
          <strong>Course:</strong> ${course.title} &bull; <strong>CBC Competencies:</strong> ${lesson.competencies || 'Problem Solving, Communication'}
        </div>
      </div>

      <div style="background:var(--primary-color-bg);border:1.5px solid var(--primary-color);border-radius:var(--radius-md);padding:14px 18px;margin-bottom:20px;">
        <strong style="font-family:var(--font-heading);font-size:12.5px;color:var(--primary-color);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">
          Specific Learning Outcome (CBC)
        </strong>
        <p style="margin:0;font-size:14px;color:var(--heading-color);font-weight:500;">
          ${lesson.outcome}
        </p>
      </div>

      <h3 style="font-family:var(--font-heading);font-size:15px;font-weight:700;color:var(--heading-color);margin-bottom:10px;">
        Step-by-Step Inclusive Instruction Flow
      </h3>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 16px;">
          <strong style="color:var(--primary-color);font-size:12px;text-transform:uppercase;">1. Introduction & Teacher Modeling (I Do)</strong>
          <p style="margin:4px 0 0;font-size:13.5px;line-height:1.6;">${lesson.intro || 'Explicit demonstration.'}</p>
        </div>
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 16px;">
          <strong style="color:var(--primary-color);font-size:12px;text-transform:uppercase;">2. Guided Practice & Collaborative Inquiry (We Do)</strong>
          <p style="margin:4px 0 0;font-size:13.5px;line-height:1.6;">${lesson.guided || 'Paired tactile practice.'}</p>
        </div>
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 16px;">
          <strong style="color:var(--primary-color);font-size:12px;text-transform:uppercase;">3. Differentiated & Independent Activity (You Do)</strong>
          <p style="margin:4px 0 0;font-size:13.5px;line-height:1.6;">${lesson.activity || 'Multimodal task cards.'}</p>
        </div>
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 16px;">
          <strong style="color:var(--primary-color);font-size:12px;text-transform:uppercase;">4. Formative Reflection & Sensory Transition</strong>
          <p style="margin:4px 0 0;font-size:13.5px;line-height:1.6;">${lesson.wrapup || 'Exit check and calm transition.'}</p>
        </div>
      </div>

      <h3 style="font-family:var(--font-heading);font-size:15px;font-weight:700;color:var(--jum-teal-hover);margin-bottom:10px;">
        Universal Design for Learning (UDL) Accommodations
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;margin-bottom:20px;">
        <div style="background:var(--surface-color-soft);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 14px;">
          <strong style="color:var(--primary-color);font-size:12px;display:block;margin-bottom:4px;">Tier 1: Universal</strong>
          <div style="font-size:13px;line-height:1.5;">${lesson.tier1 || 'Universal visual timetable and oral narration.'}</div>
        </div>
        <div style="background:var(--surface-color-soft);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 14px;">
          <strong style="color:var(--jum-gold);font-size:12px;display:block;margin-bottom:4px;">Tier 2: Targeted</strong>
          <div style="font-size:13px;line-height:1.5;">${lesson.tier2 || 'Color-coded cues and sensory fidgets.'}</div>
        </div>
        <div style="background:var(--surface-color-soft);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 14px;">
          <strong style="color:var(--error-color);font-size:12px;display:block;margin-bottom:4px;">Tier 3: Intensive</strong>
          <div style="font-size:13px;line-height:1.5;">${lesson.tier3 || 'PECS communication and 1-on-1 shadow support.'}</div>
        </div>
      </div>

      ${lesson.materials ? `
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 14px;font-size:13px;">
          <strong>Low-Cost Materials & Assistive Devices:</strong> ${lesson.materials}
        </div>
      ` : ''}

      ${attachmentsHtml}
    `;

    if (editBtn) {
      editBtn.onclick = () => {
        closeLessonPreviewModal();
        openLessonModal(courseId, lessonId);
      };
    }

    if (printBtn) {
      printBtn.onclick = () => {
        window.print();
      };
    }

    modal.classList.add('active');
  }

  function closeLessonPreviewModal() {
    const modal = document.getElementById('jum-modal-lesson-preview');
    if (modal) modal.classList.remove('active');
  }

  /* Bridge: Content Builder to Course Studio */
  function openBridgeModal() {
    if (activeCourses.length === 0) {
      showToast('Please create at least one course first in the Course Studio.', 'warning');
      const studio = document.getElementById('course-studio');
      if (studio) studio.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const modal = document.getElementById('jum-modal-save-to-course');
    const selectCourse = document.getElementById('jum-bridge-select-course');
    const inputTitle = document.getElementById('jum-bridge-lesson-title');
    const previewTitle = document.getElementById('jum-bridge-preview-title');
    const previewDetails = document.getElementById('jum-bridge-preview-details');

    if (!modal || !selectCourse) return;

    selectCourse.innerHTML = activeCourses.map(c => `
      <option value="${c.id}">${c.title} (${c.grade})</option>
    `).join('');

    const defaultTitle = builderData.topic || 'Multiplication as Repeated Addition';
    if (inputTitle) inputTitle.value = defaultTitle;
    if (previewTitle) previewTitle.textContent = defaultTitle;
    if (previewDetails) {
      previewDetails.textContent = `${builderData.gradeLevel || 'Grade 3'} • ${builderData.subject || 'Mathematics'} • ${builderData.supportAreas?.join(', ') || 'Inclusive UDL'}`;
    }

    modal.classList.add('active');
    if (inputTitle) inputTitle.focus();
  }

  function closeBridgeModal() {
    const modal = document.getElementById('jum-modal-save-to-course');
    if (modal) modal.classList.remove('active');
  }

  function handleBridgeFormSubmit(e) {
    e.preventDefault();
    const selectCourse = document.getElementById('jum-bridge-select-course');
    const inputTitle = document.getElementById('jum-bridge-lesson-title');

    const courseId = selectCourse?.value;
    const lessonTitle = inputTitle?.value.trim() || 'Inclusive Lesson Plan';

    const course = activeCourses.find(c => c.id === courseId);
    if (!course) {
      showToast('Selected course not found.', 'error');
      return;
    }

    if (!course.lessons) course.lessons = [];

    const newLesson = {
      id: `les_${Date.now()}`,
      title: lessonTitle,
      duration: '35 mins',
      competencies: builderData.strengths?.join(', ') || 'Critical Thinking, Communication',
      outcome: `By the end of the lesson, the learner should be able to master ${builderData.topic || 'core concept'} using differentiated concrete representations.`,
      intro: `Sensory hook & explicit teacher modeling aligned with learner profile (${builderData.strengths?.join(', ') || 'visual and hands-on'}).`,
      guided: `Collaborative inquiry in pairs with concrete manipulatives and visual schedule checkpoints.`,
      activity: `Differentiated learning activity: ${builderData.assessmentStyle || 'Practical demonstration and oral explanation'}.`,
      wrapup: `Formative thumbs reflection, exit check, and calming 2-minute transition.`,
      tier1: builderData.visualAdaptations?.join('; ') || 'High contrast visual boards and oral narration.',
      tier2: builderData.readingAdaptations?.join('; ') || 'Tactile flashcards and chunked learning intervals.',
      tier3: builderData.cognitiveAdaptations?.join('; ') || '1-on-1 peer buddy support and physical object prompts.',
      materials: builderData.assistiveTech?.join(', ') || 'Bottle tops, egg cartons, visual schedule strips',
      attachments: []
    };

    course.lessons.push(newLesson);
    saveCourses(activeCourses);
    renderCoursesGrid();
    closeBridgeModal();

    showToast(`Lesson added to "${course.title}"! Opening in Course Studio...`, 'success', 4500);

    const studio = document.getElementById('course-studio');
    if (studio) {
      studio.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
      openCourseLessonsViewer(courseId);
    }, 600);
  }

  function exportAllCourses() {
    const dataStr = JSON.stringify(activeCourses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jumuishi_inclusive_courses_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('All inclusive courses exported as JSON backup.', 'success');
  }

  function resetExemplars() {
    if (confirm('Reset your Course Studio to the default Kenyan CBC exemplar courses? Any custom courses you created will be restored to defaults.')) {
      activeCourses = getDefaultExemplarCourses();
      saveCourses(activeCourses);
      renderCoursesGrid();
      closeCourseLessonsViewer();
      showToast('Restored default CBC exemplar courses.', 'success');
    }
  }

  function initCourseStudio() {
    loadCourses();
    renderCoursesGrid();

    // Studio Toolbar buttons
    const btnCreateCourse = document.getElementById('jum-btn-create-course');
    const btnExportAll = document.getElementById('jum-btn-export-all');
    const btnResetExemplars = document.getElementById('jum-btn-reset-exemplars');
    const btnEmptyCreate = document.getElementById('jum-btn-empty-create');
    const btnEmptyReset = document.getElementById('jum-btn-empty-reset');

    if (btnCreateCourse) btnCreateCourse.addEventListener('click', () => openCourseModal(null));
    if (btnExportAll) btnExportAll.addEventListener('click', exportAllCourses);
    if (btnResetExemplars) btnResetExemplars.addEventListener('click', resetExemplars);
    if (btnEmptyCreate) btnEmptyCreate.addEventListener('click', () => openCourseModal(null));
    if (btnEmptyReset) btnEmptyReset.addEventListener('click', resetExemplars);

    // Search and filter listeners
    const searchInput = document.getElementById('jum-course-search');
    const gradeSelect = document.getElementById('jum-course-filter-grade');
    const needSelect = document.getElementById('jum-course-filter-need');

    function applyCourseFilters() {
      const q = searchInput ? searchInput.value : '';
      const g = gradeSelect ? gradeSelect.value : 'all';
      const n = needSelect ? needSelect.value : 'all';
      renderCoursesGrid(q, g, n);
    }

    if (searchInput) searchInput.addEventListener('input', applyCourseFilters);
    if (gradeSelect) gradeSelect.addEventListener('change', applyCourseFilters);
    if (needSelect) needSelect.addEventListener('change', applyCourseFilters);

    // Course Viewer Header buttons
    const btnViewerAddLesson = document.getElementById('jum-btn-viewer-add-lesson');
    const btnViewerEditCourse = document.getElementById('jum-btn-viewer-edit-course');
    const btnViewerClose = document.getElementById('jum-btn-viewer-close');

    if (btnViewerAddLesson) {
      btnViewerAddLesson.addEventListener('click', () => {
        if (currentViewingCourseId) openLessonModal(currentViewingCourseId, null);
      });
    }
    if (btnViewerEditCourse) {
      btnViewerEditCourse.addEventListener('click', () => {
        if (currentViewingCourseId) openCourseModal(currentViewingCourseId);
      });
    }
    if (btnViewerClose) {
      btnViewerClose.addEventListener('click', closeCourseLessonsViewer);
    }

    // Course Modal Form & Close
    const formCourse = document.getElementById('jum-form-course');
    const btnCourseClose = document.getElementById('jum-btn-course-modal-close');
    const btnCourseCancel = document.getElementById('jum-btn-course-modal-cancel');
    if (formCourse) formCourse.addEventListener('submit', handleCourseFormSubmit);
    if (btnCourseClose) btnCourseClose.addEventListener('click', closeCourseModal);
    if (btnCourseCancel) btnCourseCancel.addEventListener('click', closeCourseModal);

    // Lesson Modal Form, File Upload & Close
    const formLesson = document.getElementById('jum-form-lesson');
    const btnLessonClose = document.getElementById('jum-btn-lesson-modal-close');
    const btnLessonCancel = document.getElementById('jum-btn-lesson-modal-cancel');
    if (formLesson) formLesson.addEventListener('submit', handleLessonFormSubmit);
    if (btnLessonClose) btnLessonClose.addEventListener('click', closeLessonModal);
    if (btnLessonCancel) btnLessonCancel.addEventListener('click', closeLessonModal);

    // Dropzone events
    const dropzone = document.getElementById('jum-dropzone');
    const fileInput = document.getElementById('jum-file-input');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInput.click();
        }
      });
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files) {
          handleFilesSelected(e.dataTransfer.files);
        }
      });
      fileInput.addEventListener('change', (e) => {
        if (e.target && e.target.files) {
          handleFilesSelected(e.target.files);
        }
      });
    }

    // Bridge Modal Form & Close
    const formBridge = document.getElementById('jum-form-bridge');
    const btnBridgeClose = document.getElementById('jum-btn-bridge-modal-close');
    const btnBridgeCancel = document.getElementById('jum-btn-bridge-cancel');
    if (formBridge) formBridge.addEventListener('submit', handleBridgeFormSubmit);
    if (btnBridgeClose) btnBridgeClose.addEventListener('click', closeBridgeModal);
    if (btnBridgeCancel) btnBridgeCancel.addEventListener('click', closeBridgeModal);

    // Preview Modal Close
    const btnPreviewClose = document.getElementById('jum-btn-preview-modal-close');
    const btnPreviewDone = document.getElementById('jum-btn-preview-modal-done');
    if (btnPreviewClose) btnPreviewClose.addEventListener('click', closeLessonPreviewModal);
    if (btnPreviewDone) btnPreviewDone.addEventListener('click', closeLessonPreviewModal);

    // Close Modals on Overlay Click or Escape Key
    document.querySelectorAll('.jum-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.jum-modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     11. INITIALIZATION
     ══════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initAccessibilityToolbar();
    initContentBuilder();
    initSampleResource();
    initResourceLibrary();
    initFaqAccordion();
    initForms();
    initExploreSupportButtons();
    initCourseStudio();
  });

})();
