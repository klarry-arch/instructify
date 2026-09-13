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
     10. INITIALIZATION
     ══════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initAccessibilityToolbar();
    initContentBuilder();
    initSampleResource();
    initResourceLibrary();
    initFaqAccordion();
    initForms();
    initExploreSupportButtons();
  });

})();
