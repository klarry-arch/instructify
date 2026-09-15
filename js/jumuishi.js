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
  /* ══════════════════════════════════════════════════════════════
     10. INCLUSIVE COURSE & LESSON STUDIO ENGINE (FULL WORKSPACE)
     ══════════════════════════════════════════════════════════════ */

  const COURSES_STORAGE_KEY = 'jumuishi_educator_courses_v3';
  const WORKSPACE_TEMPLATES_KEY = 'jumuishi_course_templates_v3';
  
  let activeCourses = [];
  let customTemplates = [];
  let wizardCourse = null;
  let wizardCurrentStep = 1;
  let wizardAutoSaveTimer = null;
  let hasUnsavedChanges = false;
  let currentViewingCourseId = null;
  let currentEditingLessonId = null;
  let currentLessonAttachments = [];
  let currentResourceCourseId = null;
  let confirmCallback = null;

  // ── 10.1 Default Reusable Templates ──
  function getDefaultCourseTemplates() {
    return [
      {
        id: 'tpl-blank',
        name: 'Blank Course',
        sub: 'Clean Slate & Custom Design',
        desc: 'Design your own inclusive curriculum from scratch with a flexible, hierarchical structure.',
        icon: '📄',
        badge: 'Flexible',
        theme: 'default',
        grade: 'All Grades',
        subject: 'General Inclusive',
        features: ['Clean blank structure', 'Add custom units & lessons', 'Configure UDL tiers from scratch'],
        curriculum: {
          framework: 'Custom Inclusive Framework',
          strands: 'Foundations & Inquiry',
          subStrands: 'Exploration & Practice',
          outcomes: 'Learners demonstrate mastery of foundational concepts through personalized multimodal pathways.',
          inquiryQuestions: 'How do our daily observations connect to our learning?',
          competencies: ['Critical Thinking', 'Communication & Collaboration', 'Self-Efficacy'],
          values: ['Respect', 'Unity', 'Responsibility'],
          pcis: ['Inclusion & Diversity', 'Life Skills'],
          learningExperiences: 'Multimodal hands-on inquiry, peer buddy collaboration, tactile exploration.',
          assessmentExpectations: 'Formative observation checklists, learner self-reflection, multimodal portfolios.'
        },
        units: [
          {
            id: 'unit-b-1',
            title: 'Unit 1: Foundations & Core Concepts',
            desc: 'Introduction to primary concepts through multisensory representations.',
            duration: '3 Weeks',
            topics: [
              {
                id: 'top-b-1-1',
                title: 'Topic 1.1: Sensory Exploration & Realia',
                lessons: [
                  {
                    id: 'les-b-1-1-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Introduction with Concrete Materials',
                    duration: '35 mins',
                    date: '',
                    outcome: 'Learners identify and categorize concrete items using touch, sight, and discussion.',
                    intro: 'Sensory hook: Teacher presents tactile objects and introduces lesson goals with visual schedule.',
                    guided: 'Paired collaboration: Learners explore materials in pairs with guided questions.',
                    activity: 'Tiered independent task: Sort and represent items using drawing, writing, or pointing.',
                    wrapup: 'Class reflection circle: Choral response and thumbs check-in.',
                    tier1: 'Visual schedule on board, oral directions paired with gestures.',
                    tier2: 'Color-coded cards, tactile counters, noise-reduction earmuffs.',
                    tier3: '1-on-1 peer buddy, PECS communication cards, physical object placement.',
                    materials: 'Local Kenyan counters (bottle tops, counting sticks), sorting trays',
                    reflection: '',
                    homework: 'Find 3 similar objects at home and share with family.',
                    contentHtml: '<h3>Lesson 1: Introduction with Concrete Materials</h3><p>Welcome to Lesson 1. In this session, learners engage with sensory realia to build intuitive understanding.</p><div class="jum-editor-callout note"><strong>📌 Teacher Note:</strong><p>Ensure tactile materials are clean and accessible on low tables for all learners.</p></div>',
                    teacherNotes: 'Ensure tactile materials are clean and accessible on low tables.',
                    learnerInstructions: 'Look at the items on your table. Group them by color and count each group.',
                    practicalActivities: 'Sorting bottle tops into cardboard compartments.',
                    accommodationsNotes: 'Allow pointing responses without penalizing oral speech.'
                  }
                ]
              }
            ]
          }
        ],
        resources: []
      },
      {
        id: 'tpl-inclusive',
        name: 'Inclusive Course Template',
        sub: 'UDL Tiers 1-3 & AAC Ready',
        desc: 'Pre-loaded with Universal Design for Learning accommodations, AAC pointing boards, sensory de-escalation, and zero speech penalty rubrics.',
        icon: '🤝',
        badge: '⭐ Recommended',
        theme: 'default',
        grade: 'Grade 3',
        subject: 'General Inclusive',
        features: ['Multi-Tiered UDL built-in', 'AAC board & pointing accommodations', 'Sensory regulation protocols'],
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Multisensory Numeracy & Literacy',
          subStrands: 'Concrete Operations, Expressive Communication',
          outcomes: 'Learners demonstrate concept mastery through concrete manipulatives, pointing boards, and multimodal expression without speech or motor penalties.',
          inquiryQuestions: 'How can everyone in our classroom participate fairly regardless of ability?',
          competencies: ['Communication & Collaboration', 'Critical Thinking', 'Self-Efficacy', 'Digital Literacy'],
          values: ['Respect', 'Unity', 'Love', 'Responsibility'],
          pcis: ['Inclusion & Diversity', 'Health & Hygiene', 'Life Skills'],
          learningExperiences: 'Tactile sorting, buddy reading with sign prompts, AAC choice board selections.',
          assessmentExpectations: 'Observation checklists with tiered rubrics, portfolio evidence, peer feedback.'
        },
        units: [
          {
            id: 'unit-inc-1',
            title: 'Unit 1: Multisensory Foundations & Communication',
            desc: 'Building foundational confidence through Universal Design for Learning.',
            duration: '4 Weeks',
            topics: [
              {
                id: 'top-inc-1-1',
                title: 'Topic 1.1: Concrete Manipulatives & Visual Supports',
                lessons: [
                  {
                    id: 'les-inc-1-1-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Multi-Modal Exploration with AAC Pointing Boards',
                    duration: '35 mins',
                    date: '',
                    outcome: 'Learners express understanding of quantities and categories by pointing to visual cards and sorting physical counters.',
                    intro: 'Visual timetable review. Teacher models target concept simultaneously with spoken words, visual PECS cards, and physical bottle tops.',
                    guided: 'Paired inquiry: Peer buddy presents choice card; learner points or places counters in sorting tray.',
                    activity: 'Station tasks: Station 1 concrete sorting; Station 2 AAC pointing board; Station 3 tactile sand tracing.',
                    wrapup: 'Feelings check-in board (Happy / Proud / Calm). Class clapping celebration.',
                    tier1: 'High contrast visual board, oral narration paired with visual symbols.',
                    tier2: 'Color-coded cards, textured manipulatives, noise-reduction earmuffs.',
                    tier3: '1-on-1 partner-assisted scanning, eye-gaze selection, sensory weighted lap pad.',
                    materials: 'AAC pointing boards, bottle tops, egg cartons, visual timetable strip',
                    reflection: '',
                    homework: 'Share your visual timetable with a family member.',
                    contentHtml: '<h3>Multi-Modal Exploration with AAC Pointing Boards</h3><p>Every learner participates equitably. Use visual symbols paired with spoken words.</p><div class="jum-editor-callout note"><strong>📌 Teacher Note:</strong><p>Remember FAQ #12: Zero penalty for oral speech. Pointing and physical placement are full marks.</p></div><div class="jum-editor-callout accommodation"><strong>🤝 Inclusive Accommodation:</strong><p>For non-verbal learners, utilize the 12-cell pointing choice board on desk.</p></div>',
                    teacherNotes: 'Remember FAQ #12: Zero penalty for speech. Pointing and physical placement count for full marks.',
                    learnerInstructions: 'Look at the cards on your desk. Point to the card that matches your teacher\'s counter.',
                    practicalActivities: 'Placing counters in 3 egg carton depressions.',
                    accommodationsNotes: '12-cell AAC pointing board on desk.'
                  }
                ]
              }
            ]
          }
        ],
        resources: [
          {
            id: 'res-inc-1',
            name: 'AAC_Communication_Board_12Cell.pdf',
            type: 'worksheet',
            fileFormat: 'PDF',
            size: '185 KB',
            dateUploaded: '2026-09-10',
            unitId: 'unit-inc-1',
            lessonId: 'les-inc-1-1-1',
            category: 'Worksheets & Rubrics',
            tags: ['AAC', 'Non-Verbal', 'UDL'],
            url: '#'
          }
        ]
      },
      {
        id: 'tpl-cbc',
        name: 'Competency-Based (CBC) Course Template',
        sub: 'KICD Framework Aligned',
        desc: 'Structured around Kenyan CBC core competencies (Critical Thinking, Communication, Self-Efficacy), values, and Pertinent & Contemporary Issues (PCIs).',
        icon: '🇰🇪',
        badge: 'CBC Aligned',
        theme: 'math',
        grade: 'Grade 3',
        subject: 'Mathematics',
        features: ['KICD CBC Strands & Sub-strands', '7 Core Competencies mapped', 'PCIs & Values integrated'],
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Numbers, Measurement, Geometry, Data Handling',
          subStrands: 'Number Concept, Addition, Subtraction, Multiplication, Fractions',
          outcomes: 'Learners apply mathematical concepts to solve real-world problems in their local community using concrete realia.',
          inquiryQuestions: 'How do numbers and patterns help us in everyday market and home life in Kenya?',
          competencies: ['Critical Thinking', 'Problem Solving', 'Communication & Collaboration', 'Self-Efficacy', 'Digital Literacy'],
          values: ['Respect', 'Responsibility', 'Integrity', 'Unity', 'Patriotism'],
          pcis: ['Financial Literacy', 'Health & Hygiene', 'Environmental Conservation', 'Child Safety'],
          learningExperiences: 'Simulated market stalls, grouping bottle tops, nature walks to identify shapes and patterns.',
          assessmentExpectations: 'CBC Rubrics (Exceeding, Meeting, Approaching, Below Expectations), observation schedules.'
        },
        units: [
          {
            id: 'unit-cbc-1',
            title: 'Strand 1: Numbers & Operations',
            desc: 'Foundational place value, addition, and repeated addition using concrete models.',
            duration: '5 Weeks',
            topics: [
              {
                id: 'top-cbc-1-1',
                title: 'Sub-strand 1.1: Multiplication as Repeated Addition',
                lessons: [
                  {
                    id: 'les-cbc-1-1-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Equal Groups with Bottle Tops & Number Tracks',
                    duration: '35 mins',
                    date: '',
                    outcome: 'Represent multiplication as equal groups of items using clean bottle tops.',
                    intro: 'Demonstrate 3 groups of 4 bottle tops using clear plastic cups. Count aloud: 4 + 4 + 4 = 12.',
                    guided: 'Paired inquiry: Learners create 2 groups of 5 and 4 groups of 3 with partner.',
                    activity: 'Multimodal task cards: Card A draws groups; Card B groups bottle tops; Card C matches visual cards.',
                    wrapup: 'Choral chant: "Equal groups make multiplication!" Deep breath transition.',
                    tier1: 'Clear number track on board, oral instructions paired with gestures.',
                    tier2: 'Color-coded number tracks, noise-muffling earmuffs for sensory regulation.',
                    tier3: '1-on-1 peer buddy, PECS cards for "More" and "Finished".',
                    materials: 'Plastic bottle tops, cardboard trays, visual number strips',
                    reflection: '',
                    homework: 'Count 3 groups of spoons at home with a parent.',
                    contentHtml: '<h3>Equal Groups with Bottle Tops</h3><p>In this lesson, learners discover multiplication through hands-on sensory exploration with everyday bottle tops.</p>',
                    teacherNotes: 'Keep sensory calming corner ready.',
                    learnerInstructions: 'Put 4 bottle tops into cup 1, 4 into cup 2, and 4 into cup 3.',
                    practicalActivities: 'Sorting bottle tops into 3 equal sets.',
                    accommodationsNotes: 'Offer non-speech pointing cards.'
                  }
                ]
              }
            ]
          }
        ],
        resources: []
      },
      {
        id: 'tpl-term',
        name: 'Term Course Template (10 Weeks)',
        sub: 'Termly Scope & Sequence',
        desc: 'A full 10-week instructional schedule with units, weekly lessons, mid-term formative review, and end-of-term summative project rubrics.',
        icon: '📅',
        badge: '10 Weeks',
        theme: 'sci',
        grade: 'Lower Primary (1-3)',
        subject: 'Science & Environment',
        features: ['10-week progressive structure', 'Mid-term formative check-in', 'End-term capstone project'],
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Termly Progressive Modules',
          subStrands: 'Weekly Practical Units',
          outcomes: 'Learners progressively build core competencies with scheduled formative milestones and self-assessment checks.',
          inquiryQuestions: 'How do our weekly discoveries connect into a complete termly picture?',
          competencies: ['Learning to Learn', 'Critical Thinking', 'Communication', 'Creativity'],
          values: ['Responsibility', 'Peace', 'Respect'],
          pcis: ['Environmental Care', 'Community Living'],
          learningExperiences: 'Weekly practical projects, reflective journals, term exhibition of learner work.',
          assessmentExpectations: 'Continuous Assessment Tests (CATs), weekly checklists, termly portfolio review.'
        },
        units: [
          {
            id: 'unit-t-1',
            title: 'Weeks 1-4: Introductory Discoveries',
            desc: 'Diagnostic check, foundational inquiry, and exploratory activities.',
            duration: '4 Weeks',
            topics: [
              {
                id: 'top-t-1-1',
                title: 'Week 1: Orientation & Baseline Diagnostic',
                lessons: [
                  {
                    id: 'les-t-1-1-1',
                    lessonNumber: '1',
                    title: 'Week 1 Lesson 1: Baseline Needs Assessment & Strengths Inventory',
                    duration: '35 mins',
                    date: '',
                    outcome: 'Identify learner learning styles, sensory preferences, and foundational readiness.',
                    intro: 'Welcome circle and strengths-based conversation with visual emotion cards.',
                    guided: 'Interactive game to observe motor, cognitive, and communicative preferences.',
                    activity: 'Learners draw or point to what they are excited to learn this term.',
                    wrapup: 'Group celebration of unique learner strengths.',
                    tier1: 'Clear visual agenda, multiple means of representation.',
                    tier2: 'Supportive peer pairing, flexible response format.',
                    tier3: 'Individualized assistance, sensory breaks as needed.',
                    materials: 'Visual preference cards, drawing paper, crayons',
                    reflection: '',
                    homework: 'Tell someone at home what your favorite school activity is.',
                    contentHtml: '<h3>Week 1: Baseline Needs Assessment</h3><p>Start the term by understanding each child\'s unique learning profile and strengths.</p>',
                    teacherNotes: 'Note any sensory triggers or special accommodations needed.',
                    learnerInstructions: 'Choose the picture card showing how you like to learn best.',
                    practicalActivities: 'Exploring classroom learning stations.',
                    accommodationsNotes: 'Allow non-verbal selection of preference cards.'
                  }
                ]
              }
            ]
          },
          {
            id: 'unit-t-2',
            title: 'Weeks 5-7: Deep Dive & Mid-Term Milestone',
            desc: 'Applied skills, collaborative inquiry, and formative milestone review.',
            duration: '3 Weeks',
            topics: []
          },
          {
            id: 'unit-t-3',
            title: 'Weeks 8-10: Synthesis & End-of-Term Showcase',
            desc: 'Capstone projects, learner portfolios, and community celebration.',
            duration: '3 Weeks',
            topics: []
          }
        ],
        resources: []
      },
      {
        id: 'tpl-iep',
        name: 'Individualized Learning (IEP) Template',
        sub: 'Stage-Based Special Needs',
        desc: 'Tailored for Special Needs Units and individualized education plans (IEPs) with task-analyzed step-by-step milestones and diagnostic tracking.',
        icon: '🎯',
        badge: 'Special Needs',
        theme: 'arts',
        grade: 'Special Needs Unit',
        subject: 'Life Skills',
        features: ['Granular task analysis', 'Baseline vs Target tracking', 'Assistive technology integration'],
        curriculum: {
          framework: 'Special Needs Education (SNE) Stage-Based',
          strands: 'Activities of Daily Living, Sensory Integration, Pre-Academic Skills',
          subStrands: 'Self-Care, Fine Motor Coordination, AAC Communication',
          outcomes: 'Learner achieves targeted individualized milestones broken down into measurable, task-analyzed steps.',
          inquiryQuestions: 'How can I accomplish this task independently step-by-step?',
          competencies: ['Self-Efficacy', 'Communication', 'Motor Coordination'],
          values: ['Responsibility', 'Integrity', 'Love'],
          pcis: ['Health & Hygiene', 'Personal Safety', 'Life Skills'],
          learningExperiences: 'Direct explicit modeling, forward and backward chaining, sensory regulation breaks.',
          assessmentExpectations: 'Task analysis checklists with prompt levels (Independent, Verbal, Gestural, Physical).'
        },
        units: [
          {
            id: 'unit-iep-1',
            title: 'Milestone 1: Sensory Integration & Motor Coordination',
            desc: 'Developing fine motor grasping, bilateral hand coordination, and sensory focus.',
            duration: '4 Weeks',
            topics: [
              {
                id: 'top-iep-1-1',
                title: 'Step 1: Pincer Grasp with Kenyan Beans & Tweezers',
                lessons: [
                  {
                    id: 'les-iep-1-1-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Fine Motor Transfer using Adapted Tweezers',
                    duration: '25 mins',
                    date: '',
                    outcome: 'Learner transfers 10 large beans from bowl A to bowl B using pincer grasp or adapted tweezer with minimal prompting.',
                    intro: 'Sensory warm-up: Hand squeezing soft dough or foam ball for 2 minutes.',
                    guided: 'Hand-over-hand modeling of tweezer grip; transfer 3 beans together.',
                    activity: 'Independent transfer attempts with gestural encouragement; progress tracking.',
                    wrapup: 'High-five celebration and sensory calming weighted blanket rest.',
                    tier1: 'Clear uncluttered high-contrast workspace.',
                    tier2: 'Wider grip tweezers with spring resistance; larger wooden beads.',
                    tier3: 'Hand-over-hand physical guidance fading to wrist prompt; verbal praise tokens.',
                    materials: 'Adapted plastic tweezers, large kidney beans, divided bowls',
                    reflection: '',
                    homework: 'Practice picking up small buttons with fingertips at home.',
                    contentHtml: '<h3>Fine Motor Transfer using Adapted Tweezers</h3><p>Task analysis breakdown: 1. Grasp tweezer; 2. Align over bean; 3. Squeeze; 4. Lift; 5. Release into bowl.</p>',
                    teacherNotes: 'Record prompt level for each trial (Full physical, partial, gestural, independent).',
                    learnerInstructions: 'Squeeze the tweezer, pick up the bean, and drop it in the green cup.',
                    practicalActivities: 'Bean transfer challenge.',
                    accommodationsNotes: 'Use spring-loaded tweezer for reduced hand fatigue.'
                  }
                ]
              }
            ]
          }
        ],
        resources: []
      }
    ];
  }

  function loadCustomTemplates() {
    try {
      const saved = localStorage.getItem(WORKSPACE_TEMPLATES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          customTemplates = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load custom templates', e);
    }
    customTemplates = [];
  }

  function saveCustomTemplates() {
    try {
      localStorage.setItem(WORKSPACE_TEMPLATES_KEY, JSON.stringify(customTemplates));
    } catch (e) {
      console.error('Failed to save custom templates', e);
    }
  }

  // ── 10.2 Exemplar Courses Generator ──
  function getDefaultExemplarCourses() {
    return [
      {
        id: 'course-cbc-g3-math',
        title: 'CBC Grade 3: Inclusive Mathematics & Numeracy',
        code: 'CBC-MATH-G3-T1',
        grade: 'Grade 3',
        subject: 'Mathematics',
        term: 'Term 1',
        academicYear: '2026',
        duration: '10 Weeks (35 periods)',
        educatorName: 'Tr. Faith Wambui',
        theme: 'math',
        icon: '🔢',
        status: 'Published',
        progress: 85,
        needs: ['Autism', 'Dyslexia', 'ADHD', 'Hearing'],
        desc: 'Foundational numeracy curriculum emphasizing concrete manipulatives, tactile number tracks, visual timetables, and multi-tiered UDL accommodations.',
        competencies: 'Critical Thinking, Problem Solving, Mathematical Communication & Collaboration',
        createdAt: '2026-09-01T08:00:00.000Z',
        updatedAt: '2026-09-15T07:00:00.000Z',
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Numbers & Operations, Measurement, Geometry',
          subStrands: 'Multiplication as Repeated Addition, Place Value, Fractions',
          outcomes: 'Represent multiplication as equal groups using concrete bottle tops without speech barriers.',
          inquiryQuestions: 'How can equal sharing help us solve everyday group problems?',
          competencies: ['Critical Thinking', 'Communication & Collaboration', 'Self-Efficacy'],
          values: ['Respect', 'Responsibility', 'Unity'],
          pcis: ['Health & Hygiene', 'Inclusive Community Living', 'Financial Literacy'],
          learningExperiences: 'Concrete manipulative exploration with bottle tops, small-group paired discussions.',
          assessmentExpectations: 'Observation checklists, multimodal expression (pointing, drawing, oral), rubrics.'
        },
        units: [
          {
            id: 'unit-g3-m-1',
            title: 'Unit 1: Numbers & Operations',
            desc: 'Concrete numeracy and place value foundations.',
            duration: '4 Weeks',
            topics: [
              {
                id: 'top-g3-m-1-1',
                title: 'Topic 1.1: Equal Grouping & Repeated Addition',
                lessons: [
                  {
                    id: 'les-g3-m-1',
                    lessonNumber: '1',
                    title: 'Multiplication as Repeated Addition with Bottle Tops & Number Tracks',
                    duration: '35 mins',
                    date: '2026-09-16',
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
                    reflection: 'Learners engaged with tactile bottle tops with high enthusiasm.',
                    homework: 'Count 3 groups of spoons at home with family.',
                    contentHtml: '<h3>Multiplication as Repeated Addition</h3><p>In this lesson, learners discover multiplication through hands-on sensory exploration with everyday Kenyan bottle tops.</p><div class="jum-editor-callout note"><strong>📌 Teacher Note:</strong><p>Keep sensory calming corner ready. Ensure counters are clean.</p></div><div class="jum-editor-callout instruction"><strong>📋 Learner Instructions:</strong><p>Take 4 bottle tops and place them into cup 1. Repeat for cups 2 and 3.</p></div>',
                    teacherNotes: 'Keep sensory calming corner ready. Ensure counters are clean.',
                    learnerInstructions: 'Take 4 bottle tops and place them into cup 1. Repeat for cups 2 and 3.',
                    practicalActivities: 'Sorting bottle tops into 3 egg carton depressions.',
                    accommodationsNotes: 'Offer non-speech pointing cards for learners with selective mutism.'
                  },
                  {
                    id: 'les-g3-m-2',
                    lessonNumber: '2',
                    title: 'Place Value Tens & Ones with Bundled Twigs & Elastic Bands',
                    duration: '40 mins',
                    date: '2026-09-18',
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
                    reflection: 'Bundling with thick rubber bands assisted motor grip.',
                    homework: 'Group 20 dry leaves into bundles of ten at home.',
                    contentHtml: '<h3>Place Value Tens & Ones</h3><p>Counting in concrete groups of ten demystifies two-digit numbers.</p>',
                    teacherNotes: 'Provide pre-cut rubber bands that stretch easily.',
                    learnerInstructions: 'Count 10 twigs and wrap an elastic band around them.',
                    practicalActivities: 'Making twig bundles.',
                    accommodationsNotes: 'Assisted grip bowls for twig sorting.'
                  }
                ]
              }
            ]
          },
          {
            id: 'unit-g3-m-2',
            title: 'Unit 2: Fractions & Spatial Reasoning',
            desc: 'Understanding equal parts with fruit models and paper folding.',
            duration: '3 Weeks',
            topics: [
              {
                id: 'top-g3-m-2-1',
                title: 'Topic 2.1: Halves and Quarters',
                lessons: [
                  {
                    id: 'les-g3-m-3',
                    lessonNumber: '1',
                    title: 'Fractions as Halves & Quarters using Kenyan Fruit Models & Paper Folding',
                    duration: '35 mins',
                    date: '2026-09-23',
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
                    reflection: 'Hands-on clay fruit models made halves intuitive.',
                    homework: 'Fold a paper square in half at home.',
                    contentHtml: '<h3>Fractions as Halves & Quarters</h3><p>Fair sharing is the natural gateway to fraction comprehension.</p>',
                    teacherNotes: 'Use safe scissors and textured fold guides.',
                    learnerInstructions: 'Fold your paper circle down the center line.',
                    practicalActivities: 'Segmenting clay oranges.',
                    accommodationsNotes: 'Pre-cut wooden fraction discs with velcro.'
                  }
                ]
              }
            ]
          }
        ],
        resources: [
          {
            id: 'res-g3-m-1',
            name: 'Grade3_Multiplication_Tactile_Worksheet.pdf',
            type: 'worksheet',
            fileFormat: 'PDF',
            size: '142 KB',
            dateUploaded: '2026-09-10',
            unitId: 'unit-g3-m-1',
            lessonId: 'les-g3-m-1',
            category: 'Worksheets & Rubrics',
            tags: ['Multiplication', 'Tactile', 'Grade 3'],
            url: '#'
          },
          {
            id: 'res-g3-m-2',
            name: 'Bottle_Top_Math_Picture_Cards.png',
            type: 'image',
            fileFormat: 'PNG',
            size: '280 KB',
            dateUploaded: '2026-09-10',
            unitId: 'unit-g3-m-1',
            lessonId: 'les-g3-m-1',
            category: 'Images & Diagrams',
            tags: ['Picture Cards', 'AAC'],
            url: '#'
          },
          {
            id: 'res-g3-m-3',
            name: 'Place_Value_Tens_Ones_Template.pdf',
            type: 'document',
            fileFormat: 'PDF',
            size: '95 KB',
            dateUploaded: '2026-09-11',
            unitId: 'unit-g3-m-1',
            lessonId: 'les-g3-m-2',
            category: 'Documents',
            tags: ['Place Value'],
            url: '#'
          }
        ],
        // Flat lessons array for backward compatibility with existing viewer
        lessons: []
      },
      {
        id: 'course-cbc-ey-lit',
        title: 'Early Years Inclusive Literacy: Sounds & Multisensory Storytelling',
        code: 'CBC-ENG-G1-T1',
        grade: 'Grade 1',
        subject: 'English Language',
        term: 'Term 1',
        academicYear: '2026',
        duration: '10 Weeks',
        educatorName: 'Tr. Anne Mutua',
        theme: 'lit',
        icon: '📖',
        status: 'Published',
        progress: 70,
        needs: ['Dyslexia', 'Speech', 'Hearing', 'Autism'],
        desc: 'Phonics, vocabulary, and expressive communication tailored for early learners using Kenya Sign Language (KSL) fingerspelling, sand tracing, and visual cues.',
        competencies: 'Communication, Self-Efficacy, Digital & Oral Literacy',
        createdAt: '2026-09-02T08:00:00.000Z',
        updatedAt: '2026-09-14T10:00:00.000Z',
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Listening & Speaking, Reading, Writing',
          subStrands: 'Phonics Sounds, Multisensory Storytelling, Action Words',
          outcomes: 'Learners recognize sounds and express ideas using speech, sign, or visual cards.',
          inquiryQuestions: 'How do sounds and signs help us understand stories in our community?',
          competencies: ['Communication', 'Self-Efficacy', 'Creativity'],
          values: ['Respect', 'Unity', 'Love'],
          pcis: ['Inclusion & Diversity', 'Life Skills'],
          learningExperiences: 'Sand tray tracing, puppet role-play, KSL finger spelling.',
          assessmentExpectations: 'Observation checklists, multimodal expression portfolios.'
        },
        units: [
          {
            id: 'unit-ey-1',
            title: 'Unit 1: Phonemic Awareness & Sounds',
            desc: 'Multisensory sound recognition and letter formation.',
            duration: '4 Weeks',
            topics: [
              {
                id: 'top-ey-1-1',
                title: 'Topic 1.1: Letter Sound /s/ and Blending',
                lessons: [
                  {
                    id: 'les-ey-lit-1',
                    lessonNumber: '1',
                    title: 'Letter Sound /s/ with Sensory Sand Tracing & Snake Movement',
                    duration: '30 mins',
                    date: '2026-09-17',
                    outcome: 'Pronounce, sign, and write the letter sound /s/ while associating it with familiar environmental objects.',
                    competencies: 'Phonemic awareness, motor imitation, KSL fingerspelling',
                    intro: 'Sound song: Sibilant /s/ sound accompanied by arm slithering motion and visual snake card.',
                    guided: 'Trace letter "s" in colored sand trays, feeling the curved path with two fingers.',
                    activity: 'Sort picture cards into "Starts with /s/" (sun, soup, soap) versus other sounds.',
                    wrapup: 'KSL fingerspelling demonstration of "S" by the class.',
                    tier1: 'Multisensory presentation: see it, hear it, trace it, sign it.',
                    tier2: 'Textured sandpaper letters, whisper phones for auditory feedback.',
                    tier3: 'Sign language flashcards, high-contrast black-on-yellow visual cards.',
                    materials: 'Fine sand trays, sandpaper letter cards, picture sort cards',
                    reflection: 'Tracing in colored sand engaged energetic learners.',
                    homework: 'Find 2 things at home starting with /s/.',
                    contentHtml: '<h3>Letter Sound /s/</h3><p>Engage multiple senses: see, hear, feel, and sign.</p>',
                    teacherNotes: 'Use soft background music during sand tracing.',
                    learnerInstructions: 'Trace the letter S in your sand tray while making the /s/ sound.',
                    practicalActivities: 'Sand tray letter tracing.',
                    accommodationsNotes: 'KSL hand sign for S.'
                  }
                ]
              }
            ]
          }
        ],
        resources: [
          {
            id: 'res-ey-1',
            name: 'Letter_S_Multisensory_Guide.pdf',
            type: 'document',
            fileFormat: 'PDF',
            size: '175 KB',
            dateUploaded: '2026-09-08',
            unitId: 'unit-ey-1',
            lessonId: 'les-ey-lit-1',
            category: 'Documents',
            tags: ['Phonics', 'Dyslexia'],
            url: '#'
          }
        ],
        lessons: []
      },
      {
        id: 'course-cbc-env-sci',
        title: 'CBC Grade 2: Integrated Environmental Activities & Living Things',
        code: 'CBC-ENV-G2-T1',
        grade: 'Grade 2',
        subject: 'Environmental Activities',
        term: 'Term 1',
        academicYear: '2026',
        duration: '10 Weeks',
        educatorName: 'Tr. David Kiprop',
        theme: 'sci',
        icon: '🌿',
        status: 'Published',
        progress: 60,
        needs: ['Visual', 'Physical', 'ADHD', 'Intellectual'],
        desc: 'Hands-on inquiry into schoolyard flora and fauna with sensory exploration, tactile leaf rubbing, accessible gardening, and sound walks.',
        competencies: 'Environmental Conservation, Observation, Collaboration',
        createdAt: '2026-09-03T08:00:00.000Z',
        updatedAt: '2026-09-13T11:00:00.000Z',
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Living Things & Environment',
          subStrands: 'Trees & Bark, Parts of a Plant, Water Conservation',
          outcomes: 'Learners investigate living plants and practice environmental stewardship through accessible sensory tasks.',
          inquiryQuestions: 'How do plants help us and how can we take care of them?',
          competencies: ['Environmental Conservation', 'Critical Thinking', 'Collaboration'],
          values: ['Responsibility', 'Respect', 'Love'],
          pcis: ['Environmental Care', 'Safety & Hygiene'],
          learningExperiences: 'Tree bark rubbing, potting bean seedlings, water guardian checklist.',
          assessmentExpectations: 'Observation checklists, tactile leaf collages.'
        },
        units: [
          {
            id: 'unit-env-1',
            title: 'Unit 1: Exploring Living Things',
            desc: 'Sensory outdoor observation and plant anatomy.',
            duration: '5 Weeks',
            topics: [
              {
                id: 'top-env-1-1',
                title: 'Topic 1.1: Trees and Plant Structures',
                lessons: [
                  {
                    id: 'les-env-sci-1',
                    lessonNumber: '1',
                    title: 'Sensory Tree Exploration: Bark Rubbing & Texture Mapping',
                    duration: '40 mins',
                    date: '2026-09-19',
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
                    reflection: 'Wheelchair access ramp allowed all learners to participate outdoors.',
                    homework: 'Touch 2 different tree barks on your way home.',
                    contentHtml: '<h3>Sensory Tree Exploration</h3><p>Connecting learners directly with living nature through touch, texture, and observation.</p>',
                    teacherNotes: 'Pre-check schoolyard path for safety and wheelchair accessibility.',
                    learnerInstructions: 'Hold your paper tight against the tree trunk and rub your crayon gently.',
                    practicalActivities: 'Outdoor bark rubbing.',
                    accommodationsNotes: 'Use clipboard clips to hold paper firmly.'
                  }
                ]
              }
            ]
          }
        ],
        resources: [
          {
            id: 'res-env-1',
            name: 'Tree_Bark_Rubbing_Activity_Sheet.pdf',
            type: 'worksheet',
            fileFormat: 'PDF',
            size: '105 KB',
            dateUploaded: '2026-09-07',
            unitId: 'unit-env-1',
            lessonId: 'les-env-sci-1',
            category: 'Worksheets & Rubrics',
            tags: ['Trees', 'Realia'],
            url: '#'
          }
        ],
        lessons: []
      }
    ];
  }

  // ── Sync flat lessons for any course ──
  function syncCourseFlatLessons(course) {
    if (!course) return;
    const flat = [];
    if (Array.isArray(course.units)) {
      course.units.forEach(unit => {
        if (Array.isArray(unit.topics)) {
          unit.topics.forEach(topic => {
            if (Array.isArray(topic.lessons)) {
              topic.lessons.forEach(lesson => {
                flat.push(lesson);
              });
            }
          });
        }
      });
    }
    // If flat has items, update course.lessons
    if (flat.length > 0) {
      course.lessons = flat;
    } else if (!Array.isArray(course.lessons)) {
      course.lessons = [];
    }
  }

  // ── 10.3 Load & Save Courses ──
  function loadCourses() {
    try {
      const savedV3 = localStorage.getItem(COURSES_STORAGE_KEY);
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeCourses = parsed;
          activeCourses.forEach(syncCourseFlatLessons);
          loadCustomTemplates();
          return;
        }
      }

      // Check migration from v1
      const savedV1 = localStorage.getItem('jumuishi_educator_courses_v1');
      if (savedV1) {
        const parsedV1 = JSON.parse(savedV1);
        if (Array.isArray(parsedV1) && parsedV1.length > 0) {
          activeCourses = parsedV1.map(c => {
            if (!c.units || c.units.length === 0) {
              c.units = [
                {
                  id: `unit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  title: 'Unit 1: Core Curriculum Strand',
                  desc: c.desc || 'Foundational units and inclusive lessons.',
                  duration: c.duration || '4 Weeks',
                  topics: [
                    {
                      id: `top_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                      title: 'Topic 1.1: Foundational Concepts',
                      lessons: c.lessons || []
                    }
                  ]
                }
              ];
            }
            if (!c.resources) c.resources = [];
            c.status = c.status || 'Published';
            c.progress = c.progress || 75;
            syncCourseFlatLessons(c);
            return c;
          });
          saveCourses(activeCourses);
          loadCustomTemplates();
          return;
        }
      }
    } catch (err) {
      console.warn('Could not parse courses from localStorage', err);
    }

    activeCourses = getDefaultExemplarCourses();
    activeCourses.forEach(syncCourseFlatLessons);
    saveCourses(activeCourses);
    loadCustomTemplates();
  }

  function saveCourses(courses) {
    try {
      courses.forEach(syncCourseFlatLessons);
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    } catch (err) {
      console.error('Failed to save courses to localStorage', err);
      showToast('Browser storage capacity reached. Consider exporting a backup.', 'warning');
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
      syncCourseFlatLessons(c);
      if (Array.isArray(c.lessons)) {
        totalLessons += c.lessons.length;
      }
      if (Array.isArray(c.resources)) {
        totalAttachments += c.resources.length;
      }
    });

    if (courseCountEl) courseCountEl.textContent = activeCourses.length;
    if (lessonCountEl) lessonCountEl.textContent = totalLessons;
    if (attachCountEl) attachCountEl.textContent = totalAttachments;
  }

  // ── 10.4 Dashboard Course Cards Grid Rendering ──
  function renderCoursesGrid(filterText = '', filterGrade = 'all', filterNeed = 'all') {
    const container = document.getElementById('jum-course-cards-container');
    const emptyState = document.getElementById('jum-course-empty-state');
    if (!container) return;

    const query = filterText.toLowerCase().trim();

    const filtered = activeCourses.filter(course => {
      if (filterGrade !== 'all' && !course.grade.toLowerCase().includes(filterGrade.toLowerCase())) {
        return false;
      }
      if (filterNeed !== 'all') {
        const hasNeed = course.needs && course.needs.some(n => n.toLowerCase().includes(filterNeed.toLowerCase()));
        if (!hasNeed) return false;
      }
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
      syncCourseFlatLessons(course);
      const unitsCount = course.units ? course.units.length : 1;
      const lessonsCount = course.lessons ? course.lessons.length : 0;
      const resourcesCount = course.resources ? course.resources.length : 0;
      const progress = course.progress || (course.status === 'Published' ? 100 : (lessonsCount > 0 ? 65 : 20));

      const tagsHtml = (course.needs || []).map(need =>
        `<span class="jum-course-tag">${escapeHtml(need)}</span>`
      ).join('');

      const bannerClass = course.theme ? `jum-course-card-banner ${course.theme}` : 'jum-course-card-banner';
      
      const status = course.status || 'Draft';
      const statusClass = status.toLowerCase().replace(/\s+/g, '-');

      const dateStr = course.updatedAt ? new Date(course.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently updated';

      return `
        <article class="jum-course-card" data-course-id="${course.id}">
          <div class="${bannerClass}">
            <div class="jum-course-badge-row">
              <span class="jum-course-grade-badge">${escapeHtml(course.grade || 'Grade 3')}</span>
              <span class="jum-course-subject-badge">${escapeHtml(course.subject || 'Curriculum')}</span>
            </div>
            <span class="jum-course-card-icon" aria-hidden="true">${course.icon || '📚'}</span>
          </div>
          <div class="jum-course-card-content">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <span class="jum-status-badge ${statusClass}">${escapeHtml(status)}</span>
              <span style="font-size:11.5px;color:var(--muted-text-color);">${escapeHtml(course.term || 'Term 1')}</span>
            </div>
            <h4 class="jum-course-card-title">${escapeHtml(course.title)}</h4>
            <p class="jum-course-card-desc">${escapeHtml(course.desc || 'Comprehensive inclusive learning curriculum aligned with Kenyan CBC.')}</p>
            
            <div class="jum-course-progress-wrap">
              <div class="jum-course-progress-label">
                <span>Progress</span>
                <span>${progress}%</span>
              </div>
              <div class="jum-course-progress-bar">
                <div class="jum-course-progress-fill" style="width:${progress}%;"></div>
              </div>
            </div>

            <div class="jum-course-tags" aria-label="Support focus areas">
              ${tagsHtml}
            </div>

            <div class="jum-course-card-meta">
              <span><span aria-hidden="true">🏛️</span> ${unitsCount} ${unitsCount === 1 ? 'Unit' : 'Units'}</span>
              <span><span aria-hidden="true">📝</span> ${lessonsCount} ${lessonsCount === 1 ? 'Lesson' : 'Lessons'}</span>
              <span><span aria-hidden="true">📎</span> ${resourcesCount} ${resourcesCount === 1 ? 'Resource' : 'Resources'}</span>
            </div>
            <div style="font-size:11px;color:var(--muted-text-color);margin-bottom:12px;text-align:right;">
              Updated: ${dateStr}
            </div>

            <div class="jum-course-card-footer">
              <div class="jum-card-actions-row">
                <button type="button" class="jum-course-btn primary" data-action="view-lessons" data-course-id="${course.id}">
                  <span aria-hidden="true">📂</span> Open Curriculum
                </button>
                <div class="jum-menu-wrap">
                  <button type="button" class="jum-btn-dots" data-action="toggle-menu" data-course-id="${course.id}" aria-label="More options for ${escapeHtml(course.title)}" title="More Actions">
                    &#8942;
                  </button>
                  <div class="jum-dropdown-menu" id="menu-${course.id}">
                    <button type="button" class="jum-dropdown-item" data-action="edit-course" data-course-id="${course.id}">
                      <span>✏️</span> Edit Course
                    </button>
                    <button type="button" class="jum-dropdown-item" data-action="preview-course" data-course-id="${course.id}">
                      <span>👁️</span> Preview as Learner
                    </button>
                    <button type="button" class="jum-dropdown-item" data-action="manage-resources" data-course-id="${course.id}">
                      <span>📎</span> Manage Resources
                    </button>
                    <button type="button" class="jum-dropdown-item" data-action="duplicate-course" data-course-id="${course.id}">
                      <span>📋</span> Duplicate Course
                    </button>
                    <button type="button" class="jum-dropdown-item" data-action="save-template" data-course-id="${course.id}">
                      <span>💾</span> Save as Template
                    </button>
                    <button type="button" class="jum-dropdown-item" data-action="archive-course" data-course-id="${course.id}">
                      <span>📦</span> ${course.status === 'Archived' ? 'Unarchive Course' : 'Archive Course'}
                    </button>
                    <button type="button" class="jum-dropdown-item danger" data-action="delete-course" data-course-id="${course.id}">
                      <span>🗑️</span> Delete Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners to course cards
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const courseId = btn.getAttribute('data-course-id');

        if (action === 'toggle-menu') {
          // Close other open menus
          document.querySelectorAll('.jum-dropdown-menu.active').forEach(m => {
            if (m.id !== `menu-${courseId}`) m.classList.remove('active');
          });
          const menu = document.getElementById(`menu-${courseId}`);
          if (menu) menu.classList.toggle('active');
        } else if (action === 'view-lessons') {
          openCourseLessonsViewer(courseId);
        } else if (action === 'edit-course') {
          closeAllDropdownMenus();
          openCourseWizard(courseId);
        } else if (action === 'preview-course') {
          closeAllDropdownMenus();
          openCoursePreviewModal(courseId);
        } else if (action === 'manage-resources') {
          closeAllDropdownMenus();
          openCourseResourcesModal(courseId);
        } else if (action === 'duplicate-course') {
          closeAllDropdownMenus();
          duplicateCourse(courseId);
        } else if (action === 'save-template') {
          closeAllDropdownMenus();
          openCreateTemplateModal(courseId);
        } else if (action === 'archive-course') {
          closeAllDropdownMenus();
          toggleArchiveCourse(courseId);
        } else if (action === 'delete-course') {
          closeAllDropdownMenus();
          confirmDeleteCourse(courseId);
        }
      });
    });
  }

  function closeAllDropdownMenus() {
    document.querySelectorAll('.jum-dropdown-menu.active').forEach(m => m.classList.remove('active'));
  }
  document.addEventListener('click', () => closeAllDropdownMenus());

  // ── 10.5 Template Chooser Modal ──
  function openChooseTemplateModal() {
    const modal = document.getElementById('jum-modal-choose-template');
    const defaultGrid = document.getElementById('jum-default-templates-grid');
    const userGrid = document.getElementById('jum-user-templates-grid');
    const userSection = document.getElementById('jum-user-templates-section');

    if (!modal || !defaultGrid) return;

    const templates = getDefaultCourseTemplates();
    defaultGrid.innerHTML = templates.map(tpl => {
      const featHtml = tpl.features.map(f => `<div>&bull; ${escapeHtml(f)}</div>`).join('');
      return `
        <div class="jum-picker-card ${tpl.id === 'tpl-inclusive' ? 'featured' : ''}">
          <div>
            <div class="jum-picker-card-header">
              <span class="jum-picker-icon">${tpl.icon}</span>
              <span class="jum-picker-badge">${tpl.badge}</span>
            </div>
            <h4 class="jum-picker-title">${escapeHtml(tpl.name)}</h4>
            <span class="jum-picker-sub">${escapeHtml(tpl.sub)}</span>
            <p class="jum-picker-desc">${escapeHtml(tpl.desc)}</p>
            <div class="jum-picker-features">
              ${featHtml}
            </div>
          </div>
          <button type="button" class="btn-jum-primary-sm" style="width:100%;justify-content:center;" data-action="use-template" data-tpl-id="${tpl.id}">
            ${tpl.id === 'tpl-blank' ? 'Start Blank Course &rarr;' : 'Use Template &rarr;'}
          </button>
        </div>
      `;
    }).join('');

    // User templates
    if (customTemplates.length > 0 && userGrid && userSection) {
      userSection.style.display = 'block';
      userGrid.innerHTML = customTemplates.map(tpl => `
        <div class="jum-picker-card">
          <div>
            <div class="jum-picker-card-header">
              <span class="jum-picker-icon">📋</span>
              <span class="jum-picker-badge" style="background:#4F46E5;">Saved Template</span>
            </div>
            <h4 class="jum-picker-title">${escapeHtml(tpl.name)}</h4>
            <span class="jum-picker-sub">${escapeHtml(tpl.subject || 'Curriculum')} &bull; ${escapeHtml(tpl.grade || 'All Grades')}</span>
            <p class="jum-picker-desc">${escapeHtml(tpl.desc || 'Custom reusable course structure.')}</p>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button type="button" class="btn-jum-primary-sm" style="flex:1;justify-content:center;" data-action="use-template" data-tpl-id="${tpl.id}">
              Use &rarr;
            </button>
            <button type="button" class="btn-jum-outline-sm" style="color:var(--error-color);border-color:#FECACA;" data-action="delete-custom-template" data-tpl-id="${tpl.id}" title="Delete template">
              🗑️
            </button>
          </div>
        </div>
      `).join('');
    } else if (userSection) {
      userSection.style.display = 'none';
    }

    // Attach listeners
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const tplId = btn.getAttribute('data-tpl-id');
        if (action === 'use-template') {
          closeChooseTemplateModal();
          startCourseFromTemplate(tplId);
        } else if (action === 'delete-custom-template') {
          deleteCustomTemplate(tplId);
        }
      });
    });

    modal.classList.add('active');
  }

  function closeChooseTemplateModal() {
    const modal = document.getElementById('jum-modal-choose-template');
    if (modal) modal.classList.remove('active');
  }

  function startCourseFromTemplate(tplId) {
    let tpl = getDefaultCourseTemplates().find(t => t.id === tplId);
    if (!tpl) {
      tpl = customTemplates.find(t => t.id === tplId);
    }
    if (!tpl) tpl = getDefaultCourseTemplates()[0]; // fallback to blank

    // Deep clone template into new course
    const newCourse = JSON.parse(JSON.stringify(tpl));
    newCourse.id = `course_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    newCourse.title = tpl.id === 'tpl-blank' ? 'My Inclusive Course' : `${tpl.name} Course`;
    newCourse.status = 'Draft';
    newCourse.progress = 25;
    newCourse.createdAt = new Date().toISOString();
    newCourse.updatedAt = new Date().toISOString();
    newCourse.needs = newCourse.needs || ['Autism', 'Dyslexia'];

    // Give unique IDs to units, topics, lessons
    if (Array.isArray(newCourse.units)) {
      newCourse.units.forEach((u, uIdx) => {
        u.id = `unit_${Date.now()}_${uIdx}`;
        if (Array.isArray(u.topics)) {
          u.topics.forEach((t, tIdx) => {
            t.id = `top_${Date.now()}_${uIdx}_${tIdx}`;
            if (Array.isArray(t.lessons)) {
              t.lessons.forEach((l, lIdx) => {
                l.id = `les_${Date.now()}_${uIdx}_${tIdx}_${lIdx}`;
              });
            }
          });
        }
      });
    }

    syncCourseFlatLessons(newCourse);
    activeCourses.unshift(newCourse);
    saveCourses(activeCourses);
    renderCoursesGrid();

    // Open directly in wizard
    openCourseWizard(newCourse.id);
    showToast(`Created course draft from ${tpl.name}!`, 'success');
  }

  // ── 10.6 Course Creation & Management 4-Step Wizard ──
  function openCourseWizard(courseOrId = null, startStep = 1) {
    let course = null;
    if (typeof courseOrId === 'string') {
      course = activeCourses.find(c => c.id === courseOrId);
    } else if (courseOrId && typeof courseOrId === 'object') {
      course = courseOrId;
    }

    if (!course) {
      // Default new blank course
      course = {
        id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: 'New Inclusive Course',
        code: '',
        grade: 'Grade 3',
        subject: 'Mathematics',
        term: 'Term 1',
        academicYear: '2026',
        duration: '10 Weeks',
        educatorName: 'Tr. Educator',
        status: 'Draft',
        theme: 'math',
        icon: '🔢',
        desc: '',
        needs: ['Autism', 'Dyslexia'],
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: '',
          subStrands: '',
          outcomes: '',
          inquiryQuestions: '',
          competencies: ['Critical Thinking', 'Communication & Collaboration'],
          values: ['Respect', 'Unity'],
          pcis: ['Inclusion & Diversity'],
          learningExperiences: '',
          assessmentExpectations: ''
        },
        units: [
          {
            id: `unit_${Date.now()}_1`,
            title: 'Unit 1: Foundations',
            desc: '',
            duration: '3 Weeks',
            topics: [
              {
                id: `top_${Date.now()}_1`,
                title: 'Topic 1.1: Core Concepts',
                lessons: [
                  {
                    id: `les_${Date.now()}_1`,
                    lessonNumber: '1',
                    title: 'Lesson 1: Introduction',
                    duration: '35 mins',
                    outcome: 'Learners engage with foundational concept.',
                    contentHtml: '<h3>Lesson 1</h3><p>Start with explicit modeling.</p>'
                  }
                ]
              }
            ]
          }
        ],
        resources: [],
        lessons: []
      };
      activeCourses.unshift(course);
      saveCourses(activeCourses);
    }

    wizardCourse = JSON.parse(JSON.stringify(course));
    syncCourseFlatLessons(wizardCourse);
    hasUnsavedChanges = false;

    const modal = document.getElementById('jum-modal-course-wizard');
    if (!modal) return;

    // Populate Wizard Header
    const titleText = document.getElementById('jum-wizard-title-text');
    const titleIcon = document.getElementById('jum-wizard-title-icon');
    const statusBadge = document.getElementById('jum-wizard-status-badge');
    if (titleText) titleText.textContent = wizardCourse.title || 'Course Studio';
    if (titleIcon) titleIcon.textContent = wizardCourse.icon || '📚';
    if (statusBadge) {
      statusBadge.textContent = wizardCourse.status || 'Draft';
      statusBadge.className = `jum-status-badge ${(wizardCourse.status || 'draft').toLowerCase().replace(/\s+/g, '-')}`;
    }

    updateAutoSaveStatus('saved');

    // Populate Step 1 Inputs
    populateWizardStep1();
    // Populate Step 2 Inputs
    populateWizardStep2();
    // Populate Step 3 Hierarchy Tree
    renderHierarchyTree();
    // Populate Step 4 Rich Editor
    populateWizardStep4();

    // Navigate to step
    goToWizardStep(startStep);

    modal.classList.add('active');
  }

  function closeCourseWizard() {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Do you want to save your changes before exiting?')) {
        const modal = document.getElementById('jum-modal-course-wizard');
        if (modal) modal.classList.remove('active');
        wizardCourse = null;
        hasUnsavedChanges = false;
        return;
      }
      saveWizardCourse(false);
    }
    const modal = document.getElementById('jum-modal-course-wizard');
    if (modal) modal.classList.remove('active');
    wizardCourse = null;
    hasUnsavedChanges = false;
  }

  function updateAutoSaveStatus(state, lastSavedTime = null) {
    const autosaveEl = document.getElementById('jum-wizard-autosave');
    const textEl = document.getElementById('jum-wizard-autosave-text');
    if (!autosaveEl || !textEl) return;

    const dot = autosaveEl.querySelector('.jum-autosave-dot');
    if (state === 'saving') {
      if (dot) { dot.className = 'jum-autosave-dot saving'; }
      textEl.textContent = 'Saving...';
    } else {
      if (dot) { dot.className = 'jum-autosave-dot saved'; }
      const time = lastSavedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      textEl.textContent = `All changes saved (Last: ${time})`;
    }
  }

  function triggerWizardAutoSave() {
    hasUnsavedChanges = true;
    updateAutoSaveStatus('saving');
    clearTimeout(wizardAutoSaveTimer);
    wizardAutoSaveTimer = setTimeout(() => {
      saveWizardCourse(false);
    }, 600);
  }

  function saveWizardCourse(showToastNotice = true) {
    if (!wizardCourse) return;

    readWizardStep1();
    readWizardStep2();
    readWizardStep4();

    wizardCourse.updatedAt = new Date().toISOString();
    syncCourseFlatLessons(wizardCourse);

    // Update in activeCourses
    const idx = activeCourses.findIndex(c => c.id === wizardCourse.id);
    if (idx !== -1) {
      activeCourses[idx] = JSON.parse(JSON.stringify(wizardCourse));
    } else {
      activeCourses.unshift(JSON.parse(JSON.stringify(wizardCourse)));
    }

    saveCourses(activeCourses);
    renderCoursesGrid();
    hasUnsavedChanges = false;
    updateAutoSaveStatus('saved');

    // Update status badge
    const statusBadge = document.getElementById('jum-wizard-status-badge');
    if (statusBadge) {
      statusBadge.textContent = wizardCourse.status || 'Draft';
      statusBadge.className = `jum-status-badge ${(wizardCourse.status || 'draft').toLowerCase().replace(/\s+/g, '-')}`;
    }

    if (showToastNotice) {
      showToast(`Course "${wizardCourse.title}" saved successfully!`, 'success');
    }
  }

  function publishWizardCourse() {
    if (!wizardCourse) return;

    readWizardStep1();
    readWizardStep2();
    readWizardStep4();

    // Validation
    if (!wizardCourse.title || wizardCourse.title.trim() === '') {
      showToast('Validation Error: Course Title is required before publishing.', 'error');
      goToWizardStep(1);
      return;
    }

    syncCourseFlatLessons(wizardCourse);
    if (!wizardCourse.lessons || wizardCourse.lessons.length === 0) {
      showToast('Validation Error: Please add at least 1 lesson before publishing.', 'warning');
      goToWizardStep(3);
      return;
    }

    wizardCourse.status = 'Published';
    wizardCourse.progress = 100;
    saveWizardCourse(false);
    renderCoursesGrid();

    showToast(`🎉 Course "${wizardCourse.title}" published! It is now active for learners.`, 'success', 5000);
  }

  // ── Stepper Navigation ──
  function goToWizardStep(stepNum) {
    wizardCurrentStep = Math.max(1, Math.min(4, stepNum));

    // Update panels
    for (let i = 1; i <= 4; i++) {
      const panel = document.getElementById(`jum-wizard-panel-${i}`);
      const stepBtn = document.getElementById(`jum-step-btn-${i}`);
      if (panel) panel.style.display = i === wizardCurrentStep ? 'block' : 'none';
      if (stepBtn) {
        if (i === wizardCurrentStep) {
          stepBtn.classList.add('active');
          stepBtn.setAttribute('aria-selected', 'true');
        } else {
          stepBtn.classList.remove('active');
          stepBtn.setAttribute('aria-selected', 'false');
        }
        if (i < wizardCurrentStep) {
          stepBtn.classList.add('completed');
        } else {
          stepBtn.classList.remove('completed');
        }
      }
    }

    // Counter & Prev/Next buttons
    const counter = document.getElementById('jum-wizard-step-counter');
    const prevBtn = document.getElementById('jum-btn-wizard-prev');
    const nextBtn = document.getElementById('jum-btn-wizard-next');

    if (counter) counter.textContent = `Step ${wizardCurrentStep} of 4`;
    if (prevBtn) prevBtn.style.display = wizardCurrentStep > 1 ? 'inline-flex' : 'none';
    if (nextBtn) {
      nextBtn.innerHTML = wizardCurrentStep === 4 ? 'Preview &amp; Publish &rarr;' : 'Next Step &rarr;';
    }

    // Sync views when entering steps
    if (wizardCurrentStep === 3) {
      renderHierarchyTree();
    } else if (wizardCurrentStep === 4) {
      populateWizardStep4();
    }
  }

  function nextWizardStep() {
    if (wizardCurrentStep === 1) {
      readWizardStep1();
      if (!wizardCourse.title || wizardCourse.title.trim() === '') {
        showToast('Please enter a course title to continue.', 'error');
        return;
      }
    } else if (wizardCurrentStep === 2) {
      readWizardStep2();
    } else if (wizardCurrentStep === 4) {
      readWizardStep4();
      openCoursePreviewModal(wizardCourse.id);
      return;
    }
    goToWizardStep(wizardCurrentStep + 1);
  }

  function prevWizardStep() {
    goToWizardStep(wizardCurrentStep - 1);
  }

  // ── Step 1 Read/Populate ──
  function populateWizardStep1() {
    if (!wizardCourse) return;
    const title = document.getElementById('jum-wiz-title');
    const code = document.getElementById('jum-wiz-code');
    const subject = document.getElementById('jum-wiz-subject');
    const grade = document.getElementById('jum-wiz-grade');
    const term = document.getElementById('jum-wiz-term');
    const year = document.getElementById('jum-wiz-year');
    const duration = document.getElementById('jum-wiz-duration');
    const educator = document.getElementById('jum-wiz-educator');
    const status = document.getElementById('jum-wiz-status');
    const desc = document.getElementById('jum-wiz-desc');
    const theme = document.getElementById('jum-wiz-theme');
    const icon = document.getElementById('jum-wiz-icon');

    if (title) title.value = wizardCourse.title || '';
    if (code) code.value = wizardCourse.code || '';
    if (subject) subject.value = wizardCourse.subject || 'Mathematics';
    if (grade) grade.value = wizardCourse.grade || 'Grade 3';
    if (term) term.value = wizardCourse.term || 'Term 1';
    if (year) year.value = wizardCourse.academicYear || '2026';
    if (duration) duration.value = wizardCourse.duration || '10 Weeks';
    if (educator) educator.value = wizardCourse.educatorName || 'Tr. Educator';
    if (status) status.value = wizardCourse.status || 'Draft';
    if (desc) desc.value = wizardCourse.desc || '';
    if (theme) theme.value = wizardCourse.theme || 'math';
    if (icon) icon.value = wizardCourse.icon || '🔢';

    const needsBoxes = document.querySelectorAll('#jum-wiz-needs-checkboxes input[type="checkbox"]');
    needsBoxes.forEach(cb => {
      cb.checked = wizardCourse.needs && wizardCourse.needs.includes(cb.value);
    });
  }

  function readWizardStep1() {
    if (!wizardCourse) return;
    const title = document.getElementById('jum-wiz-title')?.value.trim();
    if (title) {
      wizardCourse.title = title;
      const titleText = document.getElementById('jum-wizard-title-text');
      if (titleText) titleText.textContent = title;
    }
    wizardCourse.code = document.getElementById('jum-wiz-code')?.value.trim() || '';
    wizardCourse.subject = document.getElementById('jum-wiz-subject')?.value || 'Mathematics';
    wizardCourse.grade = document.getElementById('jum-wiz-grade')?.value || 'Grade 3';
    wizardCourse.term = document.getElementById('jum-wiz-term')?.value || 'Term 1';
    wizardCourse.academicYear = document.getElementById('jum-wiz-year')?.value || '2026';
    wizardCourse.duration = document.getElementById('jum-wiz-duration')?.value || '10 Weeks';
    wizardCourse.educatorName = document.getElementById('jum-wiz-educator')?.value || '';
    wizardCourse.status = document.getElementById('jum-wiz-status')?.value || 'Draft';
    wizardCourse.desc = document.getElementById('jum-wiz-desc')?.value.trim() || '';
    wizardCourse.theme = document.getElementById('jum-wiz-theme')?.value || 'math';
    wizardCourse.icon = document.getElementById('jum-wiz-icon')?.value || '🔢';

    const selectedNeeds = [];
    document.querySelectorAll('#jum-wiz-needs-checkboxes input[type="checkbox"]:checked').forEach(cb => {
      selectedNeeds.push(cb.value);
    });
    wizardCourse.needs = selectedNeeds;
  }

  // ── Step 2 Read/Populate ──
  function populateWizardStep2() {
    if (!wizardCourse) return;
    const cur = wizardCourse.curriculum || {};
    const fw = document.getElementById('jum-wiz-framework');
    const strands = document.getElementById('jum-wiz-strands');
    const substrands = document.getElementById('jum-wiz-substrands');
    const outcomes = document.getElementById('jum-wiz-outcomes');
    const inquiry = document.getElementById('jum-wiz-inquiry');
    const experiences = document.getElementById('jum-wiz-experiences');
    const assessments = document.getElementById('jum-wiz-assessments');

    if (fw) fw.value = cur.framework || 'Kenyan CBC (KICD Aligned)';
    if (strands) strands.value = cur.strands || '';
    if (substrands) substrands.value = cur.subStrands || '';
    if (outcomes) outcomes.value = cur.outcomes || '';
    if (inquiry) inquiry.value = cur.inquiryQuestions || '';
    if (experiences) experiences.value = cur.learningExperiences || '';
    if (assessments) assessments.value = cur.assessmentExpectations || '';

    // Competencies
    document.querySelectorAll('#jum-wiz-competencies-grid input[type="checkbox"]').forEach(cb => {
      cb.checked = cur.competencies && cur.competencies.includes(cb.value);
    });
    // Values
    document.querySelectorAll('#jum-wiz-values-grid input[type="checkbox"]').forEach(cb => {
      cb.checked = cur.values && cur.values.includes(cb.value);
    });
    // PCIs
    document.querySelectorAll('#jum-wiz-pcis-grid input[type="checkbox"]').forEach(cb => {
      cb.checked = cur.pcis && cur.pcis.includes(cb.value);
    });
  }

  function readWizardStep2() {
    if (!wizardCourse) return;
    if (!wizardCourse.curriculum) wizardCourse.curriculum = {};
    const cur = wizardCourse.curriculum;

    cur.framework = document.getElementById('jum-wiz-framework')?.value || 'Kenyan CBC (KICD Aligned)';
    cur.strands = document.getElementById('jum-wiz-strands')?.value.trim() || '';
    cur.subStrands = document.getElementById('jum-wiz-substrands')?.value.trim() || '';
    cur.outcomes = document.getElementById('jum-wiz-outcomes')?.value.trim() || '';
    cur.inquiryQuestions = document.getElementById('jum-wiz-inquiry')?.value.trim() || '';
    cur.learningExperiences = document.getElementById('jum-wiz-experiences')?.value.trim() || '';
    cur.assessmentExpectations = document.getElementById('jum-wiz-assessments')?.value.trim() || '';

    const comp = [];
    document.querySelectorAll('#jum-wiz-competencies-grid input[type="checkbox"]:checked').forEach(cb => comp.push(cb.value));
    cur.competencies = comp;

    const val = [];
    document.querySelectorAll('#jum-wiz-values-grid input[type="checkbox"]:checked').forEach(cb => val.push(cb.value));
    cur.values = val;

    const pcis = [];
    document.querySelectorAll('#jum-wiz-pcis-grid input[type="checkbox"]:checked').forEach(cb => pcis.push(cb.value));
    cur.pcis = pcis;
  }

  // ── Step 3: Hierarchy Tree Operations ──
  function renderHierarchyTree() {
    const container = document.getElementById('jum-hierarchy-tree-container');
    if (!container || !wizardCourse) return;

    if (!Array.isArray(wizardCourse.units) || wizardCourse.units.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:36px 20px;background:#F8FAFC;border:1.5px dashed var(--border-color);border-radius:12px;">
          <div style="font-size:32px;margin-bottom:8px;">🏛️</div>
          <h4 style="font-size:15px;color:var(--heading-color);margin-bottom:6px;">No Units in Course Hierarchy</h4>
          <p style="font-size:13px;color:var(--muted-text-color);margin-bottom:14px;">Add your first unit or strand to begin building the curriculum pathway.</p>
          <button type="button" class="btn-jum-primary-sm" id="jum-btn-empty-add-unit">
            ➕ Add First Unit
          </button>
        </div>
      `;
      const btn = document.getElementById('jum-btn-empty-add-unit');
      if (btn) btn.addEventListener('click', addWizardUnit);
      return;
    }

    container.innerHTML = wizardCourse.units.map((unit, uIdx) => {
      const topics = unit.topics || [];

      const topicsHtml = topics.map((topic, tIdx) => {
        const lessons = topic.lessons || [];

        const lessonsHtml = lessons.map((lesson, lIdx) => `
          <div class="jum-tree-lesson-card" data-lesson-id="${lesson.id}">
            <div class="jum-tree-lesson-info">
              <span style="font-size:14px;">📝</span>
              <input type="text" class="jum-form-input" style="padding:4px 8px;font-size:13px;font-weight:600;flex:1;" value="${escapeHtml(lesson.title)}" data-action="rename-lesson" data-lesson-id="${lesson.id}" placeholder="Lesson title">
              <input type="text" class="jum-form-input" style="width:75px;padding:4px 6px;font-size:11.5px;" value="${escapeHtml(lesson.duration || '35 mins')}" data-action="duration-lesson" data-lesson-id="${lesson.id}" placeholder="35 mins" title="Estimated duration">
            </div>
            <div class="jum-tree-actions">
              <button type="button" class="jum-tree-btn-icon" data-action="move-lesson-up" data-unit-idx="${uIdx}" data-topic-idx="${tIdx}" data-lesson-idx="${lIdx}" title="Move lesson up">▲</button>
              <button type="button" class="jum-tree-btn-icon" data-action="move-lesson-down" data-unit-idx="${uIdx}" data-topic-idx="${tIdx}" data-lesson-idx="${lIdx}" title="Move lesson down">▼</button>
              <button type="button" class="jum-tree-btn-icon" data-action="duplicate-lesson" data-lesson-id="${lesson.id}" title="Duplicate lesson">📋</button>
              <button type="button" class="btn-jum-outline-sm" style="padding:3px 8px;font-size:11.5px;" data-action="edit-lesson-content" data-lesson-id="${lesson.id}" title="Edit rich content in Step 4">
                ✏️ Edit Content
              </button>
              <button type="button" class="jum-tree-btn-icon" style="color:var(--error-color);" data-action="delete-lesson" data-lesson-id="${lesson.id}" title="Delete lesson">🗑️</button>
            </div>
          </div>
        `).join('');

        return `
          <div class="jum-tree-topic" data-topic-id="${topic.id}">
            <div class="jum-tree-topic-header">
              <span style="font-size:13px;font-weight:700;color:var(--jum-teal);">Topic ${uIdx + 1}.${tIdx + 1}</span>
              <input type="text" class="jum-tree-topic-title-input" value="${escapeHtml(topic.title)}" data-action="rename-topic" data-unit-idx="${uIdx}" data-topic-idx="${tIdx}" placeholder="Topic title">
              <div class="jum-tree-actions">
                <button type="button" class="btn-jum-outline-sm" style="padding:3px 8px;font-size:11.5px;background:#fff;" data-action="add-lesson-to-topic" data-unit-idx="${uIdx}" data-topic-idx="${tIdx}">
                  ➕ Add Lesson
                </button>
                <button type="button" class="jum-tree-btn-icon" data-action="move-topic-up" data-unit-idx="${uIdx}" data-topic-idx="${tIdx}" title="Move topic up">▲</button>
                <button type="button" class="jum-tree-btn-icon" data-action="move-topic-down" data-unit-idx="${uIdx}" data-topic-idx="${tIdx}" title="Move topic down">▼</button>
                <button type="button" class="jum-tree-btn-icon" style="color:var(--error-color);" data-action="delete-topic" data-unit-idx="${uIdx}" data-topic-idx="${tIdx}" title="Delete topic">🗑️</button>
              </div>
            </div>
            <div class="jum-tree-lessons-container">
              ${lessonsHtml || '<div style="font-size:12px;color:var(--muted-text-color);padding:6px;">No lessons in this topic yet.</div>'}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="jum-tree-unit" data-unit-id="${unit.id}">
          <div class="jum-tree-unit-header">
            <div class="jum-tree-unit-title-box">
              <button type="button" class="jum-tree-toggle-btn" data-action="toggle-unit" data-unit-idx="${uIdx}" title="Collapse / expand unit">▼</button>
              <span style="font-weight:800;color:var(--primary-color);font-size:13.5px;">Unit ${uIdx + 1}:</span>
              <input type="text" class="jum-tree-unit-title-input" value="${escapeHtml(unit.title)}" data-action="rename-unit" data-unit-idx="${uIdx}" placeholder="Unit title">
              <input type="text" class="jum-form-input" style="width:80px;padding:3px 6px;font-size:11.5px;" value="${escapeHtml(unit.duration || '3 Weeks')}" data-action="duration-unit" data-unit-idx="${uIdx}" placeholder="Duration">
            </div>
            <div class="jum-tree-actions">
              <button type="button" class="btn-jum-primary-sm" style="padding:4px 10px;font-size:12px;" data-action="add-topic-to-unit" data-unit-idx="${uIdx}">
                ➕ Add Topic
              </button>
              <button type="button" class="jum-tree-btn-icon" data-action="move-unit-up" data-unit-idx="${uIdx}" title="Move unit up">▲</button>
              <button type="button" class="jum-tree-btn-icon" data-action="move-unit-down" data-unit-idx="${uIdx}" title="Move unit down">▼</button>
              <button type="button" class="jum-tree-btn-icon" data-action="duplicate-unit" data-unit-idx="${uIdx}" title="Duplicate unit">📋</button>
              <button type="button" class="jum-tree-btn-icon" style="color:var(--error-color);" data-action="delete-unit" data-unit-idx="${uIdx}" title="Delete unit">🗑️</button>
            </div>
          </div>
          <div class="jum-tree-unit-body" id="unit-body-${uIdx}">
            ${topicsHtml || '<div style="font-size:13px;color:var(--muted-text-color);padding:8px;">No topics yet in this unit. Click "Add Topic" above.</div>'}
          </div>
        </div>
      `;
    }).join('');

    // Attach tree event listeners
    attachHierarchyTreeListeners(container);
  }

  function attachHierarchyTreeListeners(container) {
    container.querySelectorAll('[data-action]').forEach(el => {
      const action = el.getAttribute('data-action');

      if (['rename-unit', 'duration-unit', 'rename-topic', 'rename-lesson', 'duration-lesson'].includes(action)) {
        el.addEventListener('input', (e) => {
          handleTreeInputChange(action, el);
          triggerWizardAutoSave();
        });
        return;
      }

      el.addEventListener('click', () => {
        handleTreeActionClick(action, el);
      });
    });
  }

  function handleTreeInputChange(action, el) {
    if (!wizardCourse) return;
    const val = el.value;
    if (action === 'rename-unit') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      if (wizardCourse.units[uIdx]) wizardCourse.units[uIdx].title = val;
    } else if (action === 'duration-unit') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      if (wizardCourse.units[uIdx]) wizardCourse.units[uIdx].duration = val;
    } else if (action === 'rename-topic') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      const tIdx = parseInt(el.getAttribute('data-topic-idx'), 10);
      if (wizardCourse.units[uIdx]?.topics[tIdx]) wizardCourse.units[uIdx].topics[tIdx].title = val;
    } else if (action === 'rename-lesson') {
      const lessonId = el.getAttribute('data-lesson-id');
      findAndMutateLesson(lessonId, l => { l.title = val; });
    } else if (action === 'duration-lesson') {
      const lessonId = el.getAttribute('data-lesson-id');
      findAndMutateLesson(lessonId, l => { l.duration = val; });
    }
  }

  function handleTreeActionClick(action, el) {
    if (!wizardCourse) return;

    if (action === 'toggle-unit') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      const body = document.getElementById(`unit-body-${uIdx}`);
      if (body) {
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'flex' : 'none';
        el.textContent = isHidden ? '▼' : '▶';
      }
    } else if (action === 'add-topic-to-unit') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      if (wizardCourse.units[uIdx]) {
        if (!wizardCourse.units[uIdx].topics) wizardCourse.units[uIdx].topics = [];
        const tNum = wizardCourse.units[uIdx].topics.length + 1;
        wizardCourse.units[uIdx].topics.push({
          id: `top_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          title: `Topic ${uIdx + 1}.${tNum}: New Sub-strand`,
          lessons: []
        });
        renderHierarchyTree();
        triggerWizardAutoSave();
      }
    } else if (action === 'add-lesson-to-topic') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      const tIdx = parseInt(el.getAttribute('data-topic-idx'), 10);
      const topic = wizardCourse.units[uIdx]?.topics[tIdx];
      if (topic) {
        if (!topic.lessons) topic.lessons = [];
        const lNum = topic.lessons.length + 1;
        topic.lessons.push({
          id: `les_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          lessonNumber: String(lNum),
          title: `Lesson ${lNum}: New Differentiated Lesson`,
          duration: '35 mins',
          outcome: '',
          contentHtml: '<p>Enter lesson instructions here.</p>'
        });
        syncCourseFlatLessons(wizardCourse);
        renderHierarchyTree();
        triggerWizardAutoSave();
      }
    } else if (action === 'move-unit-up') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      if (uIdx > 0) {
        const temp = wizardCourse.units[uIdx];
        wizardCourse.units[uIdx] = wizardCourse.units[uIdx - 1];
        wizardCourse.units[uIdx - 1] = temp;
        renderHierarchyTree();
        triggerWizardAutoSave();
      }
    } else if (action === 'move-unit-down') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      if (uIdx < wizardCourse.units.length - 1) {
        const temp = wizardCourse.units[uIdx];
        wizardCourse.units[uIdx] = wizardCourse.units[uIdx + 1];
        wizardCourse.units[uIdx + 1] = temp;
        renderHierarchyTree();
        triggerWizardAutoSave();
      }
    } else if (action === 'duplicate-unit') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      const copy = JSON.parse(JSON.stringify(wizardCourse.units[uIdx]));
      copy.id = `unit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      copy.title = `${copy.title} (Copy)`;
      wizardCourse.units.splice(uIdx + 1, 0, copy);
      renderHierarchyTree();
      triggerWizardAutoSave();
      showToast('Unit duplicated!', 'info');
    } else if (action === 'delete-unit') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      showConfirmDialog('Delete Unit', `Are you sure you want to delete "${wizardCourse.units[uIdx]?.title}" and all its lessons?`, () => {
        wizardCourse.units.splice(uIdx, 1);
        syncCourseFlatLessons(wizardCourse);
        renderHierarchyTree();
        triggerWizardAutoSave();
        showToast('Unit deleted.', 'info');
      });
    } else if (action === 'move-topic-up') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      const tIdx = parseInt(el.getAttribute('data-topic-idx'), 10);
      const topics = wizardCourse.units[uIdx]?.topics;
      if (topics && tIdx > 0) {
        const temp = topics[tIdx];
        topics[tIdx] = topics[tIdx - 1];
        topics[tIdx - 1] = temp;
        renderHierarchyTree();
        triggerWizardAutoSave();
      }
    } else if (action === 'move-topic-down') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      const tIdx = parseInt(el.getAttribute('data-topic-idx'), 10);
      const topics = wizardCourse.units[uIdx]?.topics;
      if (topics && tIdx < topics.length - 1) {
        const temp = topics[tIdx];
        topics[tIdx] = topics[tIdx + 1];
        topics[tIdx + 1] = temp;
        renderHierarchyTree();
        triggerWizardAutoSave();
      }
    } else if (action === 'delete-topic') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      const tIdx = parseInt(el.getAttribute('data-topic-idx'), 10);
      showConfirmDialog('Delete Topic', 'Are you sure you want to delete this topic and all its lessons?', () => {
        wizardCourse.units[uIdx].topics.splice(tIdx, 1);
        syncCourseFlatLessons(wizardCourse);
        renderHierarchyTree();
        triggerWizardAutoSave();
        showToast('Topic deleted.', 'info');
      });
    } else if (action === 'move-lesson-up' || action === 'move-lesson-down') {
      const uIdx = parseInt(el.getAttribute('data-unit-idx'), 10);
      const tIdx = parseInt(el.getAttribute('data-topic-idx'), 10);
      const lIdx = parseInt(el.getAttribute('data-lesson-idx'), 10);
      const lessons = wizardCourse.units[uIdx]?.topics[tIdx]?.lessons;
      if (lessons) {
        const targetIdx = action === 'move-lesson-up' ? lIdx - 1 : lIdx + 1;
        if (targetIdx >= 0 && targetIdx < lessons.length) {
          const temp = lessons[lIdx];
          lessons[lIdx] = lessons[targetIdx];
          lessons[targetIdx] = temp;
          renderHierarchyTree();
          triggerWizardAutoSave();
        }
      }
    } else if (action === 'duplicate-lesson') {
      const lessonId = el.getAttribute('data-lesson-id');
      duplicateWizardLesson(lessonId);
    } else if (action === 'edit-lesson-content') {
      const lessonId = el.getAttribute('data-lesson-id');
      goToWizardStep(4);
      loadLessonIntoEditor(lessonId);
    } else if (action === 'delete-lesson') {
      const lessonId = el.getAttribute('data-lesson-id');
      showConfirmDialog('Delete Lesson', 'Are you sure you want to delete this lesson?', () => {
        removeLessonFromHierarchy(lessonId);
        syncCourseFlatLessons(wizardCourse);
        renderHierarchyTree();
        triggerWizardAutoSave();
        showToast('Lesson deleted.', 'info');
      });
    }
  }

  function addWizardUnit() {
    if (!wizardCourse) return;
    if (!wizardCourse.units) wizardCourse.units = [];
    const uNum = wizardCourse.units.length + 1;
    wizardCourse.units.push({
      id: `unit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `Unit ${uNum}: New Strand`,
      desc: '',
      duration: '3 Weeks',
      topics: [
        {
          id: `top_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          title: `Topic ${uNum}.1: New Sub-strand`,
          lessons: [
            {
              id: `les_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              lessonNumber: '1',
              title: 'Lesson 1: Introductory Activity',
              duration: '35 mins',
              outcome: '',
              contentHtml: '<p>Type lesson instructions here.</p>'
            }
          ]
        }
      ]
    });
    syncCourseFlatLessons(wizardCourse);
    renderHierarchyTree();
    triggerWizardAutoSave();
  }

  function addWizardLessonQuick() {
    if (!wizardCourse || !wizardCourse.units || wizardCourse.units.length === 0) {
      addWizardUnit();
      return;
    }
    const lastUnit = wizardCourse.units[wizardCourse.units.length - 1];
    if (!lastUnit.topics || lastUnit.topics.length === 0) {
      lastUnit.topics = [{ id: `top_${Date.now()}`, title: 'Topic 1.1: General Topics', lessons: [] }];
    }
    const lastTopic = lastUnit.topics[lastUnit.topics.length - 1];
    if (!lastTopic.lessons) lastTopic.lessons = [];

    const lNum = lastTopic.lessons.length + 1;
    lastTopic.lessons.push({
      id: `les_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      lessonNumber: String(lNum),
      title: `Lesson ${lNum}: New Lesson`,
      duration: '35 mins',
      outcome: '',
      contentHtml: '<p>Lesson contents...</p>'
    });
    syncCourseFlatLessons(wizardCourse);
    renderHierarchyTree();
    triggerWizardAutoSave();
  }

  function findAndMutateLesson(lessonId, mutateFn) {
    if (!wizardCourse || !wizardCourse.units) return;
    for (const u of wizardCourse.units) {
      if (u.topics) {
        for (const t of u.topics) {
          if (t.lessons) {
            const found = t.lessons.find(l => l.id === lessonId);
            if (found) {
              mutateFn(found);
              return;
            }
          }
        }
      }
    }
  }

  function removeLessonFromHierarchy(lessonId) {
    if (!wizardCourse || !wizardCourse.units) return;
    for (const u of wizardCourse.units) {
      if (u.topics) {
        for (const t of u.topics) {
          if (t.lessons) {
            const idx = t.lessons.findIndex(l => l.id === lessonId);
            if (idx !== -1) {
              t.lessons.splice(idx, 1);
              return;
            }
          }
        }
      }
    }
  }

  function duplicateWizardLesson(lessonId) {
    if (!wizardCourse || !wizardCourse.units) return;
    for (const u of wizardCourse.units) {
      if (u.topics) {
        for (const t of u.topics) {
          if (t.lessons) {
            const idx = t.lessons.findIndex(l => l.id === lessonId);
            if (idx !== -1) {
              const copy = JSON.parse(JSON.stringify(t.lessons[idx]));
              copy.id = `les_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
              copy.title = `${copy.title} (Copy)`;
              t.lessons.splice(idx + 1, 0, copy);
              syncCourseFlatLessons(wizardCourse);
              renderHierarchyTree();
              triggerWizardAutoSave();
              showToast('Lesson duplicated!', 'info');
              return;
            }
          }
        }
      }
    }
  }

  function toggleCollapseAllUnits(collapse) {
    document.querySelectorAll('.jum-tree-unit-body').forEach(body => {
      body.style.display = collapse ? 'none' : 'flex';
    });
    document.querySelectorAll('.jum-tree-toggle-btn').forEach(btn => {
      btn.textContent = collapse ? '▶' : '▼';
    });
  }

  // ── Step 4: Rich Content Editor & Structured Plan ──
  let activeEditorLessonId = null;

  function populateWizardStep4() {
    if (!wizardCourse) return;
    syncCourseFlatLessons(wizardCourse);
    const select = document.getElementById('jum-wiz-content-lesson-select');
    if (!select) return;

    const lessons = wizardCourse.lessons || [];
    if (lessons.length === 0) {
      select.innerHTML = '<option value="">No lessons created yet in Step 3</option>';
      activeEditorLessonId = null;
      return;
    }

    select.innerHTML = lessons.map(l => `
      <option value="${l.id}">${escapeHtml(l.title)} (${escapeHtml(l.duration || '35 mins')})</option>
    `).join('');

    // If previously selected lesson still exists, keep it; else load first
    if (!activeEditorLessonId || !lessons.some(l => l.id === activeEditorLessonId)) {
      activeEditorLessonId = lessons[0].id;
    }
    select.value = activeEditorLessonId;
    loadLessonIntoEditor(activeEditorLessonId);
  }

  function loadLessonIntoEditor(lessonId) {
    if (!wizardCourse) return;
    activeEditorLessonId = lessonId;
    syncCourseFlatLessons(wizardCourse);
    const lesson = (wizardCourse.lessons || []).find(l => l.id === lessonId);
    if (!lesson) return;

    const titleEl = document.getElementById('jum-wiz-cur-lesson-title');
    const durEl = document.getElementById('jum-wiz-cur-lesson-duration');
    const dateEl = document.getElementById('jum-wiz-cur-lesson-date');
    const outcomeEl = document.getElementById('jum-wiz-cur-outcome');
    const introEl = document.getElementById('jum-wiz-cur-intro');
    const guidedEl = document.getElementById('jum-wiz-cur-guided');
    const actEl = document.getElementById('jum-wiz-cur-activity');
    const wrapupEl = document.getElementById('jum-wiz-cur-wrapup');
    const t1El = document.getElementById('jum-wiz-cur-tier1');
    const t2El = document.getElementById('jum-wiz-cur-tier2');
    const t3El = document.getElementById('jum-wiz-cur-tier3');
    const matEl = document.getElementById('jum-wiz-cur-materials');
    const refEl = document.getElementById('jum-wiz-cur-reflection');
    const hwEl = document.getElementById('jum-wiz-cur-homework');
    const editor = document.getElementById('jum-rich-editor');

    if (titleEl) titleEl.value = lesson.title || '';
    if (durEl) durEl.value = lesson.duration || '35 mins';
    if (dateEl) dateEl.value = lesson.date || '';
    if (outcomeEl) outcomeEl.value = lesson.outcome || '';
    if (introEl) introEl.value = lesson.intro || '';
    if (guidedEl) guidedEl.value = lesson.guided || '';
    if (actEl) actEl.value = lesson.activity || '';
    if (wrapupEl) wrapupEl.value = lesson.wrapup || '';
    if (t1El) t1El.value = lesson.tier1 || '';
    if (t2El) t2El.value = lesson.tier2 || '';
    if (t3El) t3El.value = lesson.tier3 || '';
    if (matEl) matEl.value = lesson.materials || '';
    if (refEl) refEl.value = lesson.reflection || '';
    if (hwEl) hwEl.value = lesson.homework || '';

    if (editor) {
      editor.innerHTML = lesson.contentHtml || `<h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.outcome || 'Type differentiated lesson guidance here...')}</p>`;
    }
  }

  function readWizardStep4() {
    if (!wizardCourse || !activeEditorLessonId) return;
    const lesson = (wizardCourse.lessons || []).find(l => l.id === activeEditorLessonId);
    if (!lesson) return;

    lesson.title = document.getElementById('jum-wiz-cur-lesson-title')?.value.trim() || lesson.title;
    lesson.duration = document.getElementById('jum-wiz-cur-lesson-duration')?.value.trim() || '35 mins';
    lesson.date = document.getElementById('jum-wiz-cur-lesson-date')?.value || '';
    lesson.outcome = document.getElementById('jum-wiz-cur-outcome')?.value.trim() || '';
    lesson.intro = document.getElementById('jum-wiz-cur-intro')?.value.trim() || '';
    lesson.guided = document.getElementById('jum-wiz-cur-guided')?.value.trim() || '';
    lesson.activity = document.getElementById('jum-wiz-cur-activity')?.value.trim() || '';
    lesson.wrapup = document.getElementById('jum-wiz-cur-wrapup')?.value.trim() || '';
    lesson.tier1 = document.getElementById('jum-wiz-cur-tier1')?.value.trim() || '';
    lesson.tier2 = document.getElementById('jum-wiz-cur-tier2')?.value.trim() || '';
    lesson.tier3 = document.getElementById('jum-wiz-cur-tier3')?.value.trim() || '';
    lesson.materials = document.getElementById('jum-wiz-cur-materials')?.value.trim() || '';
    lesson.reflection = document.getElementById('jum-wiz-cur-reflection')?.value.trim() || '';
    lesson.homework = document.getElementById('jum-wiz-cur-homework')?.value.trim() || '';

    const editor = document.getElementById('jum-rich-editor');
    if (editor) {
      lesson.contentHtml = editor.innerHTML;
    }

    // Also update this lesson inside wizardCourse.units
    findAndMutateLesson(activeEditorLessonId, l => {
      Object.assign(l, lesson);
    });
  }

  // ── Rich Editor Toolbar Commands ──
  function execEditorCommand(cmd, val = null) {
    const editor = document.getElementById('jum-rich-editor');
    if (!editor) return;
    editor.focus();
    document.execCommand(cmd, false, val);
    triggerWizardAutoSave();
  }

  function insertCalloutIntoEditor(type, title, defaultText) {
    const editor = document.getElementById('jum-rich-editor');
    if (!editor) return;
    editor.focus();
    const html = `<div class="jum-editor-callout ${type}"><strong>${title}</strong><p>${defaultText}</p></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    triggerWizardAutoSave();
  }

  // ── 10.7 In-Course Resource Manager Modal ──
  function openCourseResourcesModal(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    currentResourceCourseId = courseId;
    syncCourseFlatLessons(course);

    const modal = document.getElementById('jum-modal-course-resources');
    const titleEl = document.getElementById('jum-res-modal-course-name');
    const unitFilter = document.getElementById('jum-res-unit-filter');

    if (!modal) return;
    if (titleEl) titleEl.textContent = course.title;

    // Populate unit/lesson filter
    if (unitFilter) {
      let optionsHtml = '<option value="all">All Units &amp; Lessons</option>';
      if (course.units) {
        course.units.forEach((u, uIdx) => {
          optionsHtml += `<option value="unit:${u.id}">Unit ${uIdx + 1}: ${escapeHtml(u.title)}</option>`;
          if (u.topics) {
            u.topics.forEach(t => {
              if (t.lessons) {
                t.lessons.forEach(l => {
                  optionsHtml += `<option value="lesson:${l.id}">&nbsp;&nbsp;&bull; Lesson: ${escapeHtml(l.title)}</option>`;
                });
              }
            });
          }
        });
      }
      unitFilter.innerHTML = optionsHtml;
    }

    renderCourseResourcesTable();
    modal.classList.add('active');
  }

  function renderCourseResourcesTable() {
    const course = activeCourses.find(c => c.id === currentResourceCourseId);
    if (!course) return;

    const tbody = document.getElementById('jum-res-table-body');
    const emptyState = document.getElementById('jum-res-empty-state');
    const countEl = document.getElementById('jum-res-total-count');
    const searchInput = document.getElementById('jum-res-search-input');
    const catFilter = document.getElementById('jum-res-category-filter');
    const unitFilter = document.getElementById('jum-res-unit-filter');

    if (!tbody) return;

    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const cat = catFilter ? catFilter.value : 'all';
    const unitVal = unitFilter ? unitFilter.value : 'all';

    const resources = course.resources || [];
    if (countEl) countEl.textContent = `${resources.length} ${resources.length === 1 ? 'Resource' : 'Resources'}`;

    const filtered = resources.filter(res => {
      if (cat !== 'all' && res.type !== cat && res.category?.toLowerCase() !== cat.toLowerCase()) {
        return false;
      }
      if (unitVal !== 'all') {
        if (unitVal.startsWith('unit:') && res.unitId !== unitVal.replace('unit:', '')) return false;
        if (unitVal.startsWith('lesson:') && res.lessonId !== unitVal.replace('lesson:', '')) return false;
      }
      if (q) {
        const inName = res.name.toLowerCase().includes(q);
        const inTags = res.tags && res.tags.some(t => t.toLowerCase().includes(q));
        if (!inName && !inTags) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(res => {
      const typeClass = res.fileFormat ? res.fileFormat.toLowerCase() : (res.type || 'file');
      
      // Find assigned lesson title
      let assignedName = 'General Course Material';
      if (res.lessonId) {
        const lesson = (course.lessons || []).find(l => l.id === res.lessonId);
        if (lesson) assignedName = `Lesson: ${lesson.title}`;
      } else if (res.unitId && course.units) {
        const unit = course.units.find(u => u.id === res.unitId);
        if (unit) assignedName = `Unit: ${unit.title}`;
      }

      return `
        <tr data-res-id="${res.id}">
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="jum-file-badge ${typeClass}">${escapeHtml(res.fileFormat || res.type || 'FILE')}</span>
              <strong>${escapeHtml(res.name)}</strong>
            </div>
          </td>
          <td>${escapeHtml(res.category || res.type || 'Material')}</td>
          <td>${escapeHtml(res.size || 'Web Link')}</td>
          <td>${escapeHtml(res.dateUploaded || 'Recently')}</td>
          <td style="font-size:12px;color:var(--muted-text-color);">${escapeHtml(assignedName)}</td>
          <td style="text-align:right;">
            <div style="display:flex;justify-content:flex-end;gap:6px;">
              <button type="button" class="jum-tree-btn-icon" data-action="download-res" data-res-id="${res.id}" title="Download or open">📥</button>
              <button type="button" class="jum-tree-btn-icon" data-action="rename-res" data-res-id="${res.id}" title="Rename resource">✏️</button>
              <button type="button" class="jum-tree-btn-icon" style="color:var(--error-color);" data-action="delete-res" data-res-id="${res.id}" title="Remove resource">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    tbody.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const resId = btn.getAttribute('data-res-id');
        if (action === 'download-res') {
          downloadResource(course, resId);
        } else if (action === 'rename-res') {
          renameResource(course, resId);
        } else if (action === 'delete-res') {
          deleteResource(course, resId);
        }
      });
    });
  }

  function downloadResource(course, resId) {
    const res = (course.resources || []).find(r => r.id === resId);
    if (!res) return;

    if (res.dataUrl) {
      const a = document.createElement('a');
      a.href = res.dataUrl;
      a.download = res.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded "${res.name}"`, 'success');
    } else if (res.url && res.url !== '#') {
      window.open(res.url, '_blank');
    } else {
      // Simulate file download for pre-loaded exemplar resources
      const blob = new Blob([`=== Instructify Kenya: Jumuishi Inclusive Resource ===\n\nCourse: ${course.title}\nResource Name: ${res.name}\nCategory: ${res.category || res.type}\n\nAll resources are stored securely and locally in your browser offline cache.\n`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported "${res.name}"`, 'success');
    }
  }

  function renameResource(course, resId) {
    const res = (course.resources || []).find(r => r.id === resId);
    if (!res) return;
    const newName = prompt('Enter new resource name:', res.name);
    if (newName && newName.trim()) {
      res.name = newName.trim();
      saveCourses(activeCourses);
      renderCourseResourcesTable();
      showToast('Resource renamed.', 'success');
    }
  }

  function deleteResource(course, resId) {
    showConfirmDialog('Remove Resource', 'Are you sure you want to remove this resource from the course?', () => {
      course.resources = (course.resources || []).filter(r => r.id !== resId);
      saveCourses(activeCourses);
      renderCourseResourcesTable();
      renderCoursesGrid();
      showToast('Resource removed.', 'info');
    });
  }

  function handleResourceFilesAdded(files) {
    const course = activeCourses.find(c => c.id === currentResourceCourseId);
    if (!course || !files || files.length === 0) return;

    if (!course.resources) course.resources = [];

    Array.from(files).forEach(file => {
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      let type = 'document';
      let fileFormat = 'DOC';
      const ext = file.name.split('.').pop().toUpperCase();
      if (['PDF'].includes(ext)) { type = 'document'; fileFormat = 'PDF'; }
      else if (['DOC', 'DOCX', 'TXT'].includes(ext)) { type = 'document'; fileFormat = 'DOC'; }
      else if (['PPT', 'PPTX'].includes(ext)) { type = 'presentation'; fileFormat = 'PPT'; }
      else if (['XLS', 'XLSX', 'CSV'].includes(ext)) { type = 'spreadsheet'; fileFormat = 'XLS'; }
      else if (['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(ext)) { type = 'image'; fileFormat = 'IMG'; }
      else if (['MP3', 'WAV', 'MP4', 'WEBM'].includes(ext)) { type = 'media'; fileFormat = 'MEDIA'; }

      const reader = new FileReader();
      reader.onload = function(e) {
        course.resources.unshift({
          id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          type: type,
          fileFormat: fileFormat,
          size: formattedSize,
          dateUploaded: new Date().toISOString().split('T')[0],
          category: fileFormat === 'PDF' ? 'Worksheets & Rubrics' : 'Learning Resources',
          tags: [fileFormat, 'Inclusive Material'],
          dataUrl: e.target.result,
          url: '#'
        });
        saveCourses(activeCourses);
        renderCourseResourcesTable();
        renderCoursesGrid();
        showToast(`Uploaded "${file.name}"`, 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // ── 10.8 Learner-Facing Course Preview Modal ──
  function openCoursePreviewModal(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    currentViewingCourseId = courseId;
    syncCourseFlatLessons(course);

    const modal = document.getElementById('jum-modal-course-preview');
    const titleEl = document.getElementById('jum-prev-course-title');
    const bodyEl = document.getElementById('jum-prev-modal-body');

    if (!modal || !bodyEl) return;
    if (titleEl) titleEl.textContent = course.title;

    const units = course.units || [];
    const resources = course.resources || [];

    const unitsHtml = units.map((u, uIdx) => {
      const topics = u.topics || [];
      const topicsHtml = topics.map(t => {
        const lessons = t.lessons || [];
        const lessonsHtml = lessons.map(l => `
          <div class="jum-prev-lesson-box">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
              <h5 style="font-family:var(--font-heading);font-size:15px;font-weight:700;color:var(--heading-color);margin:0;">
                📝 ${escapeHtml(l.title)}
              </h5>
              <span class="jum-duration-chip">⏱️ ${escapeHtml(l.duration || '35 mins')}</span>
            </div>
            <div style="font-size:13.5px;color:var(--text-color);margin-bottom:10px;">
              <strong>Specific Learning Outcome:</strong> ${escapeHtml(l.outcome || 'Apply foundational concept using concrete realia.')}
            </div>
            ${l.contentHtml ? `<div style="background:#fff;border:1px solid var(--border-color);border-radius:8px;padding:14px;font-size:13.5px;margin-bottom:12px;">${l.contentHtml}</div>` : ''}
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:8px;font-size:12px;background:#F1F5F9;padding:10px;border-radius:6px;">
              <div><strong>Tier 1 (Universal):</strong> ${escapeHtml(l.tier1 || 'Visual timetable & gestures')}</div>
              <div><strong>Tier 2 (Targeted):</strong> ${escapeHtml(l.tier2 || 'Color-coded cues & earmuffs')}</div>
              <div><strong>Tier 3 (Intensive):</strong> ${escapeHtml(l.tier3 || 'PECS cards & 1-on-1 buddy')}</div>
            </div>
          </div>
        `).join('');

        return `
          <div style="margin-top:14px;">
            <h6 style="font-size:13.5px;font-weight:700;color:var(--jum-teal);margin-bottom:6px;">${escapeHtml(t.title)}</h6>
            ${lessonsHtml || '<p style="font-size:12.5px;color:var(--muted-text-color);">No lessons in this topic yet.</p>'}
          </div>
        `;
      }).join('');

      return `
        <div class="jum-prev-unit">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1.5px solid var(--border-color);padding-bottom:10px;margin-bottom:12px;">
            <div>
              <span style="font-size:12px;font-weight:800;color:var(--primary-color);text-transform:uppercase;">Unit ${uIdx + 1}</span>
              <h4 style="font-family:var(--font-heading);font-size:17px;font-weight:800;color:var(--heading-color);margin:2px 0;">
                ${escapeHtml(u.title)}
              </h4>
            </div>
            <span style="font-size:12px;color:var(--muted-text-color);font-weight:600;">${escapeHtml(u.duration || '3 Weeks')}</span>
          </div>
          <p style="font-size:13.5px;color:var(--muted-text-color);margin-bottom:12px;">${escapeHtml(u.desc || 'Comprehensive syllabus unit.')}</p>
          ${topicsHtml}
        </div>
      `;
    }).join('');

    const resHtml = resources.length > 0 ? `
      <div style="margin-top:28px;">
        <h4 style="font-family:var(--font-heading);font-size:16px;font-weight:800;color:var(--heading-color);margin-bottom:12px;display:flex;align-items:center;gap:6px;">
          <span>📎</span> Course Learning Materials &amp; Resources (${resources.length})
        </h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:10px;">
          ${resources.map(r => `
            <div style="background:#FFFFFF;border:1px solid var(--border-color);border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;">
              <span class="jum-file-badge ${(r.fileFormat || 'doc').toLowerCase()}">${escapeHtml(r.fileFormat || 'FILE')}</span>
              <div style="overflow:hidden;flex:1;">
                <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(r.name)}</div>
                <div style="font-size:11.5px;color:var(--muted-text-color);">${escapeHtml(r.size || 'Web Link')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    bodyEl.innerHTML = `
      <div class="jum-prev-hero">
        <div class="jum-prev-meta">
          <span>📚 ${escapeHtml(course.subject)}</span>
          <span>🎓 ${escapeHtml(course.grade)}</span>
          <span>⏱️ ${escapeHtml(course.duration || '10 Weeks')}</span>
          <span>👨‍🏫 ${escapeHtml(course.educatorName || 'Educator')}</span>
          <span>🏷️ ${escapeHtml(course.term || 'Term 1')}</span>
        </div>
        <h2 class="jum-prev-title">${escapeHtml(course.title)}</h2>
        <p style="font-size:14.5px;color:rgba(255,255,255,0.92);line-height:1.6;margin:0;max-width:850px;">
          ${escapeHtml(course.desc || 'Inclusive Competency-Based curriculum.')}
        </p>
      </div>

      <div style="margin-bottom:24px;">
        <h4 style="font-family:var(--font-heading);font-size:16px;font-weight:800;color:var(--heading-color);margin-bottom:8px;">
          Curriculum Framework &amp; Competencies
        </h4>
        <div style="background:#F8FAFC;border:1px solid var(--border-color);border-radius:12px;padding:16px;font-size:13px;line-height:1.6;">
          <div><strong>Framework:</strong> ${escapeHtml(course.curriculum?.framework || 'Kenyan CBC (KICD Aligned)')}</div>
          <div><strong>Key Inquiry Question:</strong> ${escapeHtml(course.curriculum?.inquiryQuestions || 'How can equal sharing help us solve everyday group problems?')}</div>
          <div><strong>CBC Competencies:</strong> ${escapeHtml(course.competencies || (course.curriculum?.competencies ? course.curriculum.competencies.join(', ') : 'Critical Thinking, Communication'))}</div>
        </div>
      </div>

      <h3 style="font-family:var(--font-heading);font-size:18px;font-weight:800;color:var(--heading-color);margin-bottom:14px;">
        Course Syllabus &amp; Instructional Units
      </h3>
      ${unitsHtml || '<p>No units added yet.</p>'}
      ${resHtml}
    `;

    modal.classList.add('active');
  }

  // ── 10.9 Template Creator Modal Logic ──
  function openCreateTemplateModal(sourceCourseId = null) {
    const modal = document.getElementById('jum-modal-create-template');
    const inputName = document.getElementById('jum-input-tpl-name');
    const inputSubject = document.getElementById('jum-input-tpl-subject');
    const inputGrade = document.getElementById('jum-input-tpl-grade');
    const inputDesc = document.getElementById('jum-input-tpl-desc');
    const sourceInput = document.getElementById('jum-input-tpl-source-course-id');

    if (!modal) return;

    if (sourceCourseId) {
      const course = activeCourses.find(c => c.id === sourceCourseId);
      if (course) {
        if (sourceInput) sourceInput.value = course.id;
        if (inputName) inputName.value = `${course.title} Template`;
        if (inputSubject) inputSubject.value = course.subject || 'General Inclusive';
        if (inputGrade) inputGrade.value = course.grade || 'All Grades';
        if (inputDesc) inputDesc.value = course.desc || `Reusable template saved from ${course.title}.`;
      }
    } else {
      if (sourceInput) sourceInput.value = '';
      if (inputName) inputName.value = '';
      if (inputSubject) inputSubject.value = 'Mathematics';
      if (inputGrade) inputGrade.value = 'All Grades';
      if (inputDesc) inputDesc.value = '';
    }

    modal.classList.add('active');
    if (inputName) inputName.focus();
  }

  function handleCreateTemplateFormSubmit(e) {
    e.preventDefault();
    const sourceId = document.getElementById('jum-input-tpl-source-course-id')?.value;
    const name = document.getElementById('jum-input-tpl-name')?.value.trim();
    const subject = document.getElementById('jum-input-tpl-subject')?.value;
    const grade = document.getElementById('jum-input-tpl-grade')?.value;
    const desc = document.getElementById('jum-input-tpl-desc')?.value.trim();

    if (!name) {
      showToast('Please enter a template name.', 'error');
      return;
    }

    let baseUnits = [];
    if (sourceId) {
      const course = activeCourses.find(c => c.id === sourceId);
      if (course && course.units) {
        baseUnits = JSON.parse(JSON.stringify(course.units));
      }
    } else {
      baseUnits = [
        {
          id: `unit_${Date.now()}_1`,
          title: 'Unit 1: Core Competencies',
          desc: desc,
          duration: '4 Weeks',
          topics: [
            {
              id: `top_${Date.now()}_1`,
              title: 'Topic 1.1: Foundations',
              lessons: [
                {
                  id: `les_${Date.now()}_1`,
                  lessonNumber: '1',
                  title: 'Lesson 1: Introduction with UDL Accommodations',
                  duration: '35 mins',
                  outcome: 'Learners demonstrate foundational understanding.',
                  contentHtml: '<h3>Lesson 1</h3><p>Template lesson content.</p>'
                }
              ]
            }
          ]
        }
      ];
    }

    const newTpl = {
      id: `tpl_custom_${Date.now()}`,
      name: name,
      sub: `${subject} &bull; ${grade}`,
      desc: desc || 'Custom reusable course template.',
      subject: subject,
      grade: grade,
      icon: '📋',
      badge: 'Custom Template',
      theme: 'default',
      features: ['Custom structured units', 'Pre-configured UDL tiers', 'CBC competencies'],
      curriculum: {
        framework: 'Kenyan CBC (KICD Aligned)',
        strands: 'Custom Strand',
        outcomes: 'Differentiated learning mastery'
      },
      units: baseUnits,
      resources: []
    };

    customTemplates.unshift(newTpl);
    saveCustomTemplates();

    const modal = document.getElementById('jum-modal-create-template');
    if (modal) modal.classList.remove('active');

    showToast(`Template "${name}" created and saved! You can now use it in Create Course.`, 'success', 4500);
  }

  function deleteCustomTemplate(tplId) {
    showConfirmDialog('Delete Template', 'Are you sure you want to delete this custom template?', () => {
      customTemplates = customTemplates.filter(t => t.id !== tplId);
      saveCustomTemplates();
      openChooseTemplateModal();
      showToast('Template deleted.', 'info');
    });
  }

  // ── 10.10 Course Duplication & Archival ──
  function duplicateCourse(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    const copy = JSON.parse(JSON.stringify(course));
    copy.id = `course_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    copy.title = `${copy.title} (Copy)`;
    copy.status = 'Draft';
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();

    syncCourseFlatLessons(copy);
    activeCourses.unshift(copy);
    saveCourses(activeCourses);
    renderCoursesGrid();
    showToast(`Duplicated course as "${copy.title}"!`, 'success');
  }

  function toggleArchiveCourse(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    if (course.status === 'Archived') {
      course.status = 'Published';
      showToast(`Course "${course.title}" restored from archive.`, 'success');
    } else {
      course.status = 'Archived';
      showToast(`Course "${course.title}" archived.`, 'info');
    }

    course.updatedAt = new Date().toISOString();
    saveCourses(activeCourses);
    renderCoursesGrid();
  }

  function confirmDeleteCourse(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    showConfirmDialog('Delete Course', `Are you sure you want to permanently delete "${course.title}" and all its lessons and attached resources? This action cannot be undone.`, () => {
      activeCourses = activeCourses.filter(c => c.id !== courseId);
      saveCourses(activeCourses);
      renderCoursesGrid();
      if (currentViewingCourseId === courseId) {
        closeCourseLessonsViewer();
      }
      showToast('Course deleted permanently.', 'info');
    });
  }

  // ── 10.11 Confirmation Dialog Modal ──
  function showConfirmDialog(title, message, onConfirm) {
    const modal = document.getElementById('jum-modal-confirm');
    const titleEl = document.getElementById('jum-confirm-title');
    const msgEl = document.getElementById('jum-confirm-message');
    const acceptBtn = document.getElementById('jum-btn-confirm-accept');

    if (!modal) {
      if (confirm(`${title}\n\n${message}`)) onConfirm();
      return;
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    confirmCallback = onConfirm;

    modal.classList.add('active');
  }

  function closeConfirmDialog() {
    const modal = document.getElementById('jum-modal-confirm');
    if (modal) modal.classList.remove('active');
    confirmCallback = null;
  }

  // ── 10.12 Backup & Import Engine ──
  function exportAllCourses() {
    const backupData = {
      app: 'Jumuishi Learning Hub',
      version: '3.0',
      exportedAt: new Date().toISOString(),
      courses: activeCourses,
      templates: customTemplates
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jumuishi_curriculum_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('All inclusive courses & templates exported as JSON backup.', 'success');
  }

  function importBackupData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data && Array.isArray(data.courses)) {
          activeCourses = data.courses;
          activeCourses.forEach(syncCourseFlatLessons);
          if (Array.isArray(data.templates)) {
            customTemplates = data.templates;
            saveCustomTemplates();
          }
          saveCourses(activeCourses);
          renderCoursesGrid();
          showToast(`Backup successfully imported! Loaded ${activeCourses.length} courses.`, 'success', 4500);
        } else if (Array.isArray(data)) {
          // Direct array of courses
          activeCourses = data;
          activeCourses.forEach(syncCourseFlatLessons);
          saveCourses(activeCourses);
          renderCoursesGrid();
          showToast(`Imported ${activeCourses.length} courses!`, 'success', 4500);
        } else {
          showToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        console.error('Failed to parse backup JSON', err);
        showToast('Error reading backup file. Please ensure it is valid JSON.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function resetExemplars() {
    showConfirmDialog('Reset to Exemplars', 'Reset your Course Studio to the default Kenyan CBC exemplar courses? Any custom courses will be restored to defaults.', () => {
      activeCourses = getDefaultExemplarCourses();
      activeCourses.forEach(syncCourseFlatLessons);
      saveCourses(activeCourses);
      renderCoursesGrid();
      closeCourseLessonsViewer();
      showToast('Restored default CBC exemplar courses.', 'success');
    });
  }

  // ── 10.13 Lesson Viewer (Active when course opened from dashboard) ──
  function openCourseLessonsViewer(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    currentViewingCourseId = courseId;
    syncCourseFlatLessons(course);

    const viewer = document.getElementById('jum-course-lessons-viewer');
    const gradeEl = document.getElementById('jum-viewer-course-grade');
    const titleEl = document.getElementById('jum-viewer-course-title');
    const descEl = document.getElementById('jum-viewer-course-desc');
    const listEl = document.getElementById('jum-viewer-lessons-list');

    if (!viewer || !listEl) return;

    if (gradeEl) gradeEl.textContent = `${course.grade || 'Grade 3'} • ${course.subject || 'Curriculum'}`;
    if (titleEl) titleEl.textContent = course.title;
    if (descEl) descEl.textContent = course.desc || 'Manage and review lesson plans and adaptations for this course.';

    const lessons = course.lessons || [];

    if (lessons.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:36px 20px;background:var(--surface-color-soft);border-radius:var(--radius-lg);border:1.5px dashed var(--border-color);">
          <div style="font-size:36px;margin-bottom:8px;" aria-hidden="true">📝</div>
          <h4 style="font-family:var(--font-heading);font-size:16px;font-weight:700;color:var(--heading-color);margin-bottom:6px;">No Lessons Created Yet</h4>
          <p style="font-size:13.5px;color:var(--muted-text-color);margin-bottom:16px;">Add your first differentiated lesson or customize this course in the Studio Wizard.</p>
          <div style="display:flex;justify-content:center;gap:10px;">
            <button type="button" class="btn-jum-primary-sm" data-action="viewer-add-first-lesson">
              <span aria-hidden="true">➕</span> Add First Lesson
            </button>
            <button type="button" class="btn-jum-outline-sm" data-action="viewer-open-wizard">
              <span aria-hidden="true">✏️</span> Open Course Wizard
            </button>
          </div>
        </div>
      `;
      const addFirstBtn = listEl.querySelector('[data-action="viewer-add-first-lesson"]');
      if (addFirstBtn) {
        addFirstBtn.addEventListener('click', () => openLessonModal(courseId, null));
      }
      const openWizBtn = listEl.querySelector('[data-action="viewer-open-wizard"]');
      if (openWizBtn) {
        openWizBtn.addEventListener('click', () => openCourseWizard(courseId));
      }
    } else {
      listEl.innerHTML = lessons.map((lesson, idx) => {
        const fileCount = lesson.attachments ? lesson.attachments.length : 0;
        
        let filesHtml = '';
        if (fileCount > 0) {
          const chips = lesson.attachments.map(file => {
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
                  <div class="jum-lesson-title">${escapeHtml(lesson.title)}</div>
                  <div class="jum-lesson-meta">${escapeHtml(lesson.competencies || 'Kenyan CBC Core Competencies')}</div>
                </div>
              </div>
              <div class="jum-lesson-right">
                <span class="jum-lesson-duration-badge">⏱️ ${escapeHtml(lesson.duration || '35 mins')}</span>
                ${fileCount > 0 ? `<span class="jum-lesson-materials-badge">📎 ${fileCount} files</span>` : ''}
                <button type="button" class="jum-lesson-expand-btn" aria-label="Toggle lesson details">&#9662;</button>
              </div>
            </div>

            <div class="jum-lesson-body" id="lesson-body-${lesson.id}">
              <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;">
                <strong style="font-family:var(--font-heading);font-size:12.5px;color:var(--primary-color);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">
                  Specific Learning Outcome (CBC)
                </strong>
                <p style="margin:0;font-size:14px;color:var(--heading-color);font-weight:500;">${escapeHtml(lesson.outcome || 'Apply foundational concept using concrete realia.')}</p>
              </div>

              <!-- 4 Step Instruction Grid -->
              <div class="jum-lesson-steps-grid">
                <div class="jum-lesson-step-box">
                  <strong>1. Modeling (I Do)</strong>
                  <p style="margin:0;font-size:13px;">${escapeHtml(lesson.intro || 'Explicit teacher demonstration with concrete materials.')}</p>
                </div>
                <div class="jum-lesson-step-box">
                  <strong>2. Guided Inquiry (We Do)</strong>
                  <p style="margin:0;font-size:13px;">${escapeHtml(lesson.guided || 'Collaborative paired work with concrete manipulatives.')}</p>
                </div>
                <div class="jum-lesson-step-box">
                  <strong>3. Tiered Activity (You Do)</strong>
                  <p style="margin:0;font-size:13px;">${escapeHtml(lesson.activity || 'Differentiated independent activity suited to learner profile.')}</p>
                </div>
                <div class="jum-lesson-step-box">
                  <strong>4. Reflection &amp; Wrap-up</strong>
                  <p style="margin:0;font-size:13px;">${escapeHtml(lesson.wrapup || 'Sensory check, thumbs reflection, and smooth transition.')}</p>
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
                    <div>${escapeHtml(lesson.tier1 || 'Visual timetables, oral narration, high contrast.')}</div>
                  </div>
                  <div>
                    <span style="font-weight:700;color:var(--jum-gold);">Tier 2 (Targeted):</span>
                    <div>${escapeHtml(lesson.tier2 || 'Color-coded cues, tactile cards, quiet spaces.')}</div>
                  </div>
                  <div>
                    <span style="font-weight:700;color:var(--error-color);">Tier 3 (Intensive):</span>
                    <div>${escapeHtml(lesson.tier3 || '1-on-1 shadow teacher support, PECS cards, Braille.')}</div>
                  </div>
                </div>
              </div>

              ${lesson.materials ? `
                <div style="margin-top:12px;font-size:12.5px;color:var(--text-color);">
                  <strong>Materials &amp; Assistive Devices:</strong> ${escapeHtml(lesson.materials)}
                </div>
              ` : ''}

              ${filesHtml}

              <!-- Toolbar inside lesson -->
              <div class="jum-lesson-toolbar">
                <button type="button" class="btn-jum-outline-sm" data-action="preview-lesson" data-lesson-id="${lesson.id}">
                  <span aria-hidden="true">📖</span> Full View / Print
                </button>
                <button type="button" class="btn-jum-outline-sm" data-action="edit-lesson" data-lesson-id="${lesson.id}">
                  <span aria-hidden="true">✏️</span> Edit in Modal
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

  // ── Quick Add / Edit Lesson Modal ──
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
    const maxFileSize = 5 * 1024 * 1024; // 5MB limit

    Array.from(files).forEach(file => {
      if (file.size > maxFileSize) {
        showToast(`"${file.name}" exceeds 5MB limit. Please upload a smaller file.`, 'warning');
        return;
      }

      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = function(e) {
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
    if (!course) return;

    const lessonData = {
      id: lessonId || `les_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
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
      // Update in hierarchy
      let foundInTree = false;
      if (course.units) {
        course.units.forEach(u => {
          if (u.topics) {
            u.topics.forEach(t => {
              if (t.lessons) {
                const idx = t.lessons.findIndex(l => l.id === lessonId);
                if (idx !== -1) {
                  t.lessons[idx] = Object.assign(t.lessons[idx], lessonData);
                  foundInTree = true;
                }
              }
            });
          }
        });
      }
      if (!foundInTree && course.lessons) {
        const idx = course.lessons.findIndex(l => l.id === lessonId);
        if (idx !== -1) course.lessons[idx] = lessonData;
      }
      showToast(`Lesson "${title}" updated!`, 'success');
    } else {
      // Add to last topic of last unit, or create unit
      if (!course.units || course.units.length === 0) {
        course.units = [{ id: `unit_${Date.now()}`, title: 'Unit 1: Core Curriculum', topics: [{ id: `top_${Date.now()}`, title: 'Topic 1.1: General', lessons: [] }] }];
      }
      const unit = course.units[course.units.length - 1];
      if (!unit.topics || unit.topics.length === 0) {
        unit.topics = [{ id: `top_${Date.now()}`, title: 'Topic 1.1: General', lessons: [] }];
      }
      const topic = unit.topics[unit.topics.length - 1];
      if (!topic.lessons) topic.lessons = [];
      topic.lessons.push(lessonData);
      showToast(`Lesson "${title}" added to "${course.title}"!`, 'success');
    }

    syncCourseFlatLessons(course);
    saveCourses(activeCourses);
    renderCoursesGrid();
    openCourseLessonsViewer(courseId);
    closeLessonModal();
  }

  function deleteLesson(courseId, lessonId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    showConfirmDialog('Delete Lesson', 'Are you sure you want to delete this lesson?', () => {
      if (course.units) {
        course.units.forEach(u => {
          if (u.topics) {
            u.topics.forEach(t => {
              if (t.lessons) {
                t.lessons = t.lessons.filter(l => l.id !== lessonId);
              }
            });
          }
        });
      }
      syncCourseFlatLessons(course);
      saveCourses(activeCourses);
      renderCoursesGrid();
      openCourseLessonsViewer(courseId);
      showToast('Lesson deleted.', 'info');
    });
  }

  function openLessonPreviewModal(courseId, lessonId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    syncCourseFlatLessons(course);
    const lesson = (course.lessons || []).find(l => l.id === lessonId);
    if (!lesson) return;

    const modal = document.getElementById('jum-modal-lesson-preview');
    const content = document.getElementById('jum-preview-lesson-modal-content');
    const editBtn = document.getElementById('jum-btn-preview-modal-edit');
    const printBtn = document.getElementById('jum-btn-preview-modal-print');

    if (!modal || !content) return;

    content.innerHTML = `
      <div style="border-bottom:2px solid var(--primary-color);padding-bottom:16px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span class="jum-course-grade-badge" style="background:var(--primary-color);color:#fff;">${escapeHtml(course.grade || 'Grade 3')}</span>
          <span class="jum-course-subject-badge" style="background:var(--surface-color-soft);color:var(--text-color);border:1px solid var(--border-color);">${escapeHtml(course.subject || 'Curriculum')}</span>
          <span style="margin-left:auto;font-size:12.5px;font-weight:600;color:var(--muted-text-color);">⏱️ ${escapeHtml(lesson.duration || '35 mins')}</span>
        </div>
        <h2 style="font-family:var(--font-heading);font-size:20px;font-weight:800;color:var(--heading-color);margin:0 0 6px;">
          ${escapeHtml(lesson.title)}
        </h2>
        <div style="font-size:13px;color:var(--muted-text-color);">
          <strong>Course:</strong> ${escapeHtml(course.title)} &bull; <strong>CBC Competencies:</strong> ${escapeHtml(lesson.competencies || 'Problem Solving, Communication')}
        </div>
      </div>

      <div style="background:var(--primary-color-bg);border:1.5px solid var(--primary-color);border-radius:var(--radius-md);padding:14px 18px;margin-bottom:20px;">
        <strong style="font-family:var(--font-heading);font-size:12.5px;color:var(--primary-color);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">
          Specific Learning Outcome (CBC)
        </strong>
        <p style="margin:0;font-size:14px;color:var(--heading-color);font-weight:500;">
          ${escapeHtml(lesson.outcome || 'Apply foundational concept through multimodal tasks.')}
        </p>
      </div>

      <h3 style="font-family:var(--font-heading);font-size:15px;font-weight:700;color:var(--heading-color);margin-bottom:10px;">
        Step-by-Step Inclusive Instruction Flow
      </h3>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 16px;">
          <strong style="color:var(--primary-color);font-size:12px;text-transform:uppercase;">1. Introduction &amp; Teacher Modeling (I Do)</strong>
          <p style="margin:4px 0 0;font-size:13.5px;line-height:1.6;">${escapeHtml(lesson.intro || 'Explicit teacher demonstration with concrete realia.')}</p>
        </div>
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 16px;">
          <strong style="color:var(--primary-color);font-size:12px;text-transform:uppercase;">2. Guided Practice &amp; Collaborative Inquiry (We Do)</strong>
          <p style="margin:4px 0 0;font-size:13.5px;line-height:1.6;">${escapeHtml(lesson.guided || 'Paired tactile practice with sorting trays.')}</p>
        </div>
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 16px;">
          <strong style="color:var(--primary-color);font-size:12px;text-transform:uppercase;">3. Differentiated &amp; Independent Activity (You Do)</strong>
          <p style="margin:4px 0 0;font-size:13.5px;line-height:1.6;">${escapeHtml(lesson.activity || 'Multimodal task cards and hands-on exercises.')}</p>
        </div>
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 16px;">
          <strong style="color:var(--primary-color);font-size:12px;text-transform:uppercase;">4. Formative Reflection &amp; Sensory Transition</strong>
          <p style="margin:4px 0 0;font-size:13.5px;line-height:1.6;">${escapeHtml(lesson.wrapup || 'Exit check and calm transition.')}</p>
        </div>
      </div>

      <h3 style="font-family:var(--font-heading);font-size:15px;font-weight:700;color:var(--jum-teal-hover);margin-bottom:10px;">
        Universal Design for Learning (UDL) Accommodations
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;margin-bottom:20px;">
        <div style="background:var(--surface-color-soft);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 14px;">
          <strong style="color:var(--primary-color);font-size:12px;display:block;margin-bottom:4px;">Tier 1: Universal</strong>
          <div style="font-size:13px;line-height:1.5;">${escapeHtml(lesson.tier1 || 'Universal visual timetable and oral narration.')}</div>
        </div>
        <div style="background:var(--surface-color-soft);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 14px;">
          <strong style="color:var(--jum-gold);font-size:12px;display:block;margin-bottom:4px;">Tier 2: Targeted</strong>
          <div style="font-size:13px;line-height:1.5;">${escapeHtml(lesson.tier2 || 'Color-coded cues and sensory fidgets.')}</div>
        </div>
        <div style="background:var(--surface-color-soft);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 14px;">
          <strong style="color:var(--error-color);font-size:12px;display:block;margin-bottom:4px;">Tier 3: Intensive</strong>
          <div style="font-size:13px;line-height:1.5;">${escapeHtml(lesson.tier3 || 'PECS communication and 1-on-1 shadow support.')}</div>
        </div>
      </div>

      ${lesson.materials ? `
        <div style="background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px 14px;font-size:13px;">
          <strong>Low-Cost Materials &amp; Assistive Devices:</strong> ${escapeHtml(lesson.materials)}
        </div>
      ` : ''}
    `;

    if (editBtn) {
      editBtn.onclick = () => {
        closeLessonPreviewModal();
        openLessonModal(courseId, lessonId);
      };
    }
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }

    modal.classList.add('active');
  }

  function closeLessonPreviewModal() {
    const modal = document.getElementById('jum-modal-lesson-preview');
    if (modal) modal.classList.remove('active');
  }

  // ── Bridge Modal (Content Builder -> Course Studio) ──
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
      <option value="${c.id}">${escapeHtml(c.title)} (${escapeHtml(c.grade)})</option>
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
    if (!course) return;

    const newLesson = {
      id: `les_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: lessonTitle,
      duration: '35 mins',
      competencies: builderData.strengths?.join(', ') || 'Critical Thinking, Communication',
      outcome: `By the end of the lesson, the learner should be able to master ${builderData.topic || 'core concept'} using differentiated concrete representations.`,
      intro: `Sensory hook & explicit modeling aligned with learner profile (${builderData.strengths?.join(', ') || 'visual and hands-on'}).`,
      guided: 'Collaborative inquiry in pairs with concrete manipulatives and visual schedule checkpoints.',
      activity: `Differentiated learning activity: ${builderData.assessmentStyle || 'Practical demonstration and oral explanation'}.`,
      wrapup: 'Formative thumbs reflection, exit check, and calming 2-minute transition.',
      tier1: builderData.visualAdaptations?.join('; ') || 'High contrast visual boards and oral narration.',
      tier2: builderData.readingAdaptations?.join('; ') || 'Tactile flashcards and chunked learning intervals.',
      tier3: builderData.cognitiveAdaptations?.join('; ') || '1-on-1 peer buddy support and physical object prompts.',
      materials: builderData.assistiveTech?.join(', ') || 'Bottle tops, egg cartons, visual schedule strips',
      attachments: []
    };

    if (!course.units || course.units.length === 0) {
      course.units = [{ id: `unit_${Date.now()}`, title: 'Unit 1: Core Curriculum', topics: [{ id: `top_${Date.now()}`, title: 'Topic 1.1: General', lessons: [] }] }];
    }
    const unit = course.units[course.units.length - 1];
    if (!unit.topics || unit.topics.length === 0) {
      unit.topics = [{ id: `top_${Date.now()}`, title: 'Topic 1.1: General', lessons: [] }];
    }
    unit.topics[unit.topics.length - 1].lessons.push(newLesson);

    syncCourseFlatLessons(course);
    saveCourses(activeCourses);
    renderCoursesGrid();
    closeBridgeModal();

    showToast(`Lesson added to "${course.title}"! Opening in Course Studio...`, 'success', 4500);

    const studio = document.getElementById('course-studio');
    if (studio) studio.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      openCourseLessonsViewer(courseId);
    }, 600);
  }
  /* ══════════════════════════════════════════════════════════════
     10B. SPECIAL NEEDS ADAPTATION TEMPLATES ENGINE
     Evidence-based lesson templates for Special Needs Educators (SNE)
     integrating AAC pointing boards, physical sorting trays, and UDL
     ══════════════════════════════════════════════════════════════ */

  const TEMPLATES_STORAGE_KEY = 'jumuishi_special_needs_templates_v1';
  let activeTemplates = [];
  let currentEditingTemplateId = null;

  function getDefaultSpecialNeedsTemplates() {
    return [
      {
        id: 'tpl-nonverbal-aac',
        title: 'Non-Verbal & AAC Multi-Modal Communication Board Template',
        category: 'Non-Verbal & AAC',
        badge: 'AAC Non-Verbal (FAQ #12)',
        banner: 'aac',
        icon: '🗣️',
        target: 'Non-verbal learners, selective mutism, cerebral palsy, expressive language delay, autism',
        aacTools: 'Picture Exchange (PECS), 12-cell & 24-cell pointing communication boards, concrete sorting trays, peer partner response cards, yes/no paddles, zero speech penalty rubrics',
        outcome: 'By the end of the session, the non-verbal learner should be able to demonstrate understanding and mastery of the target CBC concept by pointing to symbol cards, placing concrete counters onto physical sorting trays, or selecting options on an AAC board without oral speech barriers.',
        competencies: 'Alternative Communication & Collaboration, Critical Thinking, Self-Efficacy',
        intro: 'Visual schedule orientation with symbol cards. Teacher models target concept simultaneously using spoken words, visual picture cards, and concrete realia (bottle tops/counters). Teacher demonstrates pointing board: "When I show this symbol, it means..."',
        guided: 'Paired exploration with a peer response buddy. Learners utilize physical cardboard sorting trays with 2 or 3 compartments. Peer partner points to card or presents physical choices; non-verbal learner places token counters or points to select the correct representation. Peer affirms with thumbs-up paddle.',
        activity: 'Tiered multi-modal communication stations: Station A uses concrete object placement (counters into labeled sorting bowls); Station B uses a 9-symbol pictorial pointing choice board; Station C matches printed tactile icons with partner validation. Zero penalty for oral speech or writing speed.',
        wrapup: 'Learner points to feelings board (Happy / Proud / Need Rest). Teacher celebrates collaborative success with choral class clapping and physical high-fives.',
        tier1: 'Every spoken prompt is paired with a clear visual card or concrete object. Clear visual timetable displayed at child eye-level.',
        tier2: 'Pre-cut 2-inch laminated symbol cards with raised border outlines; dual-option pointing choice board (Yes/No, More/Stop, Options A/B).',
        tier3: '1-on-1 partner-assisted scanning (teacher or peer holds pointing board and points sequentially until learner blinks, nods, or taps); eye-gaze board option; sensory calming weighted lap pad.',
        materials: 'Laminated AAC pointing boards, picture symbol cards (PECS), 3-compartment sorting trays, 40 plastic bottle tops/counters, yes/no handheld response paddles'
      },
      {
        id: 'tpl-autism-visual',
        title: 'Autism Spectrum: Structured Visual Routine & Low-Arousal Sensory Template',
        category: 'Autism Spectrum',
        badge: 'Autism & Sensory',
        banner: 'autism',
        icon: '🧩',
        target: 'Autism Spectrum Disorder (ASD), sensory processing sensitivity, executive transitions',
        aacTools: '4-step visual schedule strip, First-Then reward card, noise-reduction headphones, transition sand timer, non-verbal quiet cards',
        outcome: 'Learner navigates a 4-step CBC learning progression following a personal visual schedule, engaging in structured hands-on tasks with sensory self-regulation tools.',
        competencies: 'Self-Regulation, Critical Thinking, Digital & Visual Literacy',
        intro: 'Review personal First-Then schedule board ("First: Number sorting, Then: Sensory drawing"). Check-in with emotion thermometer. Provide 2-minute chime warning before instruction starts.',
        guided: 'Structured workstation task: clear left-to-right box system (In-Box -> Work Surface -> Finished Box). Teacher provides concise 1-step directions paired with visual icons.',
        activity: 'Independent task completion with structured boundaries. Visual timer displayed on desk. Sensory fidgets or noise-muffling earmuffs available.',
        wrapup: 'Move all task cards to the "Finished" pocket on the visual strip. Transition to designated quiet corner with deep pressure breathing.',
        tier1: 'Consistent predictable classroom routine, reduced visual background clutter, soft warm ambient lighting.',
        tier2: 'Personal desk dividers to reduce distractions, textured tactile squeeze balls, color-coded task containers.',
        tier3: 'Individual visual schedule strip with velcro symbols, choice board with 2 preferred sensory rewards, quiet sensory pod access.',
        materials: 'Velcro visual schedule strips, First-Then boards, noise-muffling earmuffs, 5-minute visual liquid timer, task finish bins'
      },
      {
        id: 'tpl-dyslexia-multi',
        title: 'Dyslexia & Phonological Awareness: Orton-Gillingham Multisensory Template',
        category: 'Dyslexia & Reading',
        badge: 'Multisensory Phonics',
        banner: 'dyslexia',
        icon: '📖',
        target: 'Dyslexia, dysgraphia, phonological processing difficulties, reading speed differences',
        aacTools: 'Color-coded syllabication tiles, tactile sand/salt tracing, whisper phones for auditory feedback, text-to-speech visual highlighting',
        outcome: 'Learner identifies, segments, and blends target phonemes and words through multi-sensory tracing and pictorial association without reading fatigue.',
        competencies: 'Communication, Creative Thinking, Self-Efficacy',
        intro: 'Multisensory phoneme introduction: "See it, Say it, Trace it, Feel it." Show target letter card with picture keyword. Trace letter shape in the air with full arm movements.',
        guided: 'Sensory sand tray tracing: learners repeat the phoneme sound while tracing in fine colored sand using two index fingers. Whisper phone auditory self-monitoring.',
        activity: 'Word building with textured wooden/plastic letter tiles. Color coding: Blue consonants, Red vowels. Partner word hunt with picture matching.',
        wrapup: 'Sky-writing chant of the sound. Stamp book reward for active participation.',
        tier1: 'Dyslexia-friendly high-legibility typeface, increased line and letter spacing, cream/buff background paper instead of harsh white.',
        tier2: 'Textured sandpaper letters, plastic reading tracking rulers with highlighted guide window.',
        tier3: 'Speech synthesis / audio narration accompaniment, oral responses accepted in place of written worksheets.',
        materials: 'Colored sand tracing trays, sandpaper letter cards, whisper phones (PVC elbow pipes), high-contrast reading tracking rulers'
      },
      {
        id: 'tpl-ksl-deaf',
        title: 'Deaf & Hard-of-Hearing: KSL Bilingual Concept Mapping Template',
        category: 'Hearing & Deaf',
        badge: 'KSL Bilingual',
        banner: 'deaf',
        icon: '🤟',
        target: 'Deaf learners, hard of hearing, KSL users, bilingual Kenyan classrooms',
        aacTools: 'Kenyan Sign Language (KSL) fingerspelling charts, visual video clips, pictorial concept maps, signing peer buddies, vibrating timers',
        outcome: 'Learner demonstrates and explains target CBC curriculum concepts bilingually using Kenyan Sign Language signs and visual pictorial organizers.',
        competencies: 'Communication (KSL & Written), Digital Literacy, Social Inclusion',
        intro: 'Horseshoe classroom seating ensuring unobstructed line of sight. Teacher gains visual attention via light flicker or gentle floor tap. Introduce concept in KSL with expressive facial grammar.',
        guided: 'Teacher signs concept alongside high-contrast photographic anchor charts. Paired signing practice with peer learning partner.',
        activity: 'Learners assemble pictorial concept maps with KSL sign diagrams and English/Kiswahili labels. Presentation in small signing groups.',
        wrapup: 'Signing celebration: class raises hands and twists wrists (KSL visual applause) for all participants.',
        tier1: 'Unobstructed sightlines, teacher faces class directly when communicating, captioned digital media.',
        tier2: 'Pre-printed KSL vocabulary guides with finger-spelling charts, bilingual glossaries with color pictures.',
        tier3: 'Dedicated KSL interpreter / shadow teacher, tactile vibrating cues for lesson transitions, individual visual flashcards.',
        materials: 'KSL fingerspelling flashcards, bilingual picture charts, printed graphic organizers, visual transition beacon/light'
      },
      {
        id: 'tpl-lowvision-tactile',
        title: 'Low Vision & Blindness: Raised Tactile Realia & Auditory Description Template',
        category: 'Visual Impairments',
        badge: 'Tactile & Auditory',
        banner: 'vision',
        icon: '👁️',
        target: 'Low vision, albinism, total blindness, cortical visual impairment (CVI)',
        aacTools: 'Tactile raised-line graphics, 3D Kenyan realia, Braille tiles, 24pt bold yellow-on-black cards, descriptive audio narration',
        outcome: 'Learner explores and masters key mathematical or scientific properties through tactile discrimination, auditory descriptions, and 3D concrete realia.',
        competencies: 'Spatial Reasoning, Critical Thinking, Tactile-Kinesthetic Literacy',
        intro: 'Detailed descriptive auditory orientation ("I am holding a real wooden block with 6 smooth square faces"). Allow learners to explore with both hands.',
        guided: 'Hands-on tactile exploration in pairs. Learners use raised-line mats or tactile number lines with distinct tactile notches every 5 units.',
        activity: 'Construct shapes or count sets using real Kenyan materials (beans, bottle tops, clay models, carved wooden blocks). Verbal description checks.',
        wrapup: 'Oral auditory summary and tactile puzzle completion celebration.',
        tier1: '24pt+ bold fonts, high-contrast yellow text on black background, uncluttered physical table layout.',
        tier2: 'Handheld illuminated magnifying glasses, tactile boundary trays preventing materials from rolling off tables.',
        tier3: 'Perkins Braille embossed worksheets, audio recorded instructions with pause buttons, 1-on-1 tactile guiding.',
        materials: 'Raised-line drawing boards, Braille counters, 24pt high-contrast flashcards, real Kenyan beans/seeds/sticks, hand magnifiers'
      },
      {
        id: 'tpl-adhd-movement',
        title: 'ADHD & Focus: Chunked 10-Minute Movement & Gamified Station Template',
        category: 'ADHD & Focus',
        badge: 'Movement & Focus',
        banner: 'adhd',
        icon: '⚡',
        target: 'ADHD, executive function delays, restlessness, working memory challenges',
        aacTools: 'Kinesthetic relay stations, tactile fidget grips, visual checklist cards, gamified point tokens, active standing workstations',
        outcome: 'Learner completes a targeted CBC inquiry through three 10-minute active learning sprints punctuated by brief physical reset intervals.',
        competencies: 'Self-Regulation, Critical Thinking, Physical Coordination',
        intro: 'High-energy sensory hook (action rhyme or quick clapping pattern). Reveal the "3-Mission Checklist" for today\'s lesson with clear token rewards.',
        guided: 'Active Station 1 (Sprint 1, 10 mins): Paired sorting relay where learners walk to select physical items and place them on the team board.',
        activity: 'Station 2 & 3 (10 mins each): Hands-on puzzle or building task. 2-minute "Brain Gym" cross-lateral stretch interval between sprints.',
        wrapup: 'Check off all 3 missions on the visual board; celebrate with high-five circle.',
        tier1: 'Allow standing while working; provide fidget bands on chair legs; clear visual checklist of 3 distinct tasks.',
        tier2: 'Frequent positive reinforcement every 5 minutes; tactile squeeze stress balls; timers showing countdown.',
        tier3: 'Designated movement buddy; alternate seating (exercise ball or balance wobble cushion); chunked single-item worksheets.',
        materials: '3-Mission visual checklists, chair leg resistance bands, wobble balance cushions, handheld tactile fidgets, mission completion stamp'
      },
      {
        id: 'tpl-down-syndrome',
        title: 'Down Syndrome: Step-by-Step Task Analysis & Multi-Sensory Reinforcement Template',
        category: 'Down Syndrome',
        badge: 'Task Analysis',
        banner: 'down',
        icon: '🌟',
        target: 'Down syndrome, intellectual differences, developmental delays, fine-motor challenges',
        aacTools: 'Bite-sized task analysis photo strips, errorless learning options, thick-grip adapted handles, verbal & gestural positive praise',
        outcome: 'Learner successfully executes a functional CBC learning task through step-by-step photographic scaffolding and concrete realia with high visual praise.',
        competencies: 'Self-Efficacy, Daily Living Skills, Collaboration',
        intro: 'Cheerful greeting with picture name tags. Teacher presents the single concrete outcome using a completed exemplar model that learners can touch.',
        guided: 'Step 1 demonstrated with "Watch me first." Learner mirrors step immediately with physical hand-over-hand or shadow teacher assist. Enthusiastic verbal praise.',
        activity: 'Learner completes Steps 2 & 3 using adapted tools (jumbo crayons, thick-knob puzzle pieces, sorting bowls with non-slip bases).',
        wrapup: 'Showcasing the completed work to peers; celebratory sticker placement on personal achievement chart.',
        tier1: 'Bite-sized instructions with maximum 1 directive at a time; generous processing wait time (10-15 seconds) before repeating prompts.',
        tier2: 'Adapted tools with thick silicone grips; photographic step-by-step cards showing each action.',
        tier3: '1-on-1 peer buddy assistance; errorless learning trays where only correct choices physically fit.',
        materials: 'Photo sequence cards, thick-grip adapted writing tools, non-slip sorting bowls, visual achievement sticker chart'
      }
    ];
  }

  function loadTemplates() {
    try {
      const saved = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeTemplates = parsed;
          updateTemplateBadges();
          return;
        }
      }
    } catch (err) {
      console.warn('Could not parse saved templates from localStorage', err);
    }
    activeTemplates = getDefaultSpecialNeedsTemplates();
    saveTemplates(activeTemplates);
  }

  function saveTemplates(templates) {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch (err) {
      console.error('Failed to save templates to localStorage', err);
    }
    updateTemplateBadges();
  }

  function updateTemplateBadges() {
    const countBadge = document.getElementById('jum-tab-count-templates');
    if (countBadge) countBadge.textContent = activeTemplates.length;

    // Also populate the template picker inside #jum-modal-lesson
    populateLessonTemplatePicker();
  }

  function populateLessonTemplatePicker() {
    const picker = document.getElementById('jum-lesson-template-picker');
    if (!picker) return;

    const currentVal = picker.value;
    picker.innerHTML = '<option value="">-- Choose a Special Needs Template to Auto-Fill --</option>';

    activeTemplates.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.icon || '📋'} ${t.title}`;
      picker.appendChild(opt);
    });

    if (currentVal) picker.value = currentVal;
  }

  function switchStudioView(view) {
    const tabCourses = document.getElementById('jum-tab-btn-courses');
    const tabTemplates = document.getElementById('jum-tab-btn-templates');
    const viewCourses = document.getElementById('jum-studio-courses-view');
    const viewTemplates = document.getElementById('jum-studio-templates-view');

    if (view === 'templates') {
      if (tabCourses) {
        tabCourses.classList.remove('active');
        tabCourses.setAttribute('aria-selected', 'false');
      }
      if (tabTemplates) {
        tabTemplates.classList.add('active-teal');
        tabTemplates.setAttribute('aria-selected', 'true');
      }
      if (viewCourses) viewCourses.style.display = 'none';
      if (viewTemplates) viewTemplates.style.display = 'block';
      renderTemplatesGrid();
      announceToScreenReader('Switched to Special Needs Adaptation Templates view.');
    } else {
      if (tabTemplates) {
        tabTemplates.classList.remove('active-teal');
        tabTemplates.setAttribute('aria-selected', 'false');
      }
      if (tabCourses) {
        tabCourses.classList.add('active');
        tabCourses.setAttribute('aria-selected', 'true');
      }
      if (viewTemplates) viewTemplates.style.display = 'none';
      if (viewCourses) viewCourses.style.display = 'block';
      announceToScreenReader('Switched to Courses & Lessons view.');
    }
  }

  function renderTemplatesGrid(filterText = '', filterNeed = 'all') {
    const container = document.getElementById('jum-template-cards-container');
    const emptyState = document.getElementById('jum-template-empty-state');
    if (!container) return;

    const query = filterText.toLowerCase().trim();

    const filtered = activeTemplates.filter(t => {
      // Need/Category filter
      if (filterNeed !== 'all') {
        const cat = (t.category || '').toLowerCase();
        const bdg = (t.badge || '').toLowerCase();
        const fn = filterNeed.toLowerCase();
        if (!cat.includes(fn) && !bdg.includes(fn)) return false;
      }
      // Text search query
      if (query) {
        const matchTitle = (t.title || '').toLowerCase().includes(query);
        const matchAac = (t.aacTools || '').toLowerCase().includes(query);
        const matchTarget = (t.target || '').toLowerCase().includes(query);
        const matchOutcome = (t.outcome || '').toLowerCase().includes(query);
        const matchCat = (t.category || '').toLowerCase().includes(query);
        if (!matchTitle && !matchAac && !matchTarget && !matchOutcome && !matchCat) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = filtered.map(t => {
      const bannerClass = t.banner || 'aac';
      const icon = t.icon || '📋';
      const isCustom = !t.id.startsWith('tpl-');

      return `
        <article class="jum-template-card" data-template-id="${escapeHtml(t.id)}">
          <div class="jum-template-banner ${escapeHtml(bannerClass)}">
            <span style="font-size:24px;" aria-hidden="true">${escapeHtml(icon)}</span>
            <span class="jum-template-badge" style="background:rgba(255,255,255,0.22);color:#fff;border-color:rgba(255,255,255,0.35);font-size:11.5px;">
              ${escapeHtml(t.badge || t.category || 'Special Needs')}
            </span>
          </div>

          <div class="jum-template-card-body">
            <h4 class="jum-template-title">${escapeHtml(t.title)}</h4>

            <!-- AAC Highlights Box (FAQ 12) -->
            <div class="jum-template-aac-box">
              <strong>🗣️ AAC &amp; Assistive Tools:</strong>
              ${escapeHtml(t.aacTools || 'Multi-modal pointing board, sorting trays, peer partner support.')}
            </div>

            <p style="font-size:13.5px;color:#475569;line-height:1.55;margin:0;">
              <strong>Target Learner:</strong> ${escapeHtml(t.target || 'Diverse educational needs')}
            </p>

            <div style="font-size:13px;color:#334155;background:#F8FAFC;padding:10px 12px;border-radius:10px;border:1px solid #E2E8F0;">
              <strong>CBC Goal:</strong> ${escapeHtml(t.outcome ? t.outcome.substring(0, 110) + '...' : 'CBC competency mastery through differentiated concrete realia.')}
            </div>

            <div class="jum-template-meta-row">
              <span class="jum-template-badge">📦 Realia: ${escapeHtml(t.materials ? t.materials.split(',')[0] : 'Kenyan Realia')}</span>
              <span class="jum-template-badge">🎯 4-Stage Pathway</span>
              <span class="jum-template-badge">🛡️ 3 UDL Tiers</span>
            </div>
          </div>

          <div class="jum-template-footer">
            <div style="display:flex;gap:6px;">
              <button type="button" class="jum-template-btn primary btn-use-template" data-template-id="${escapeHtml(t.id)}" title="Pre-fill a new lesson with this template">
                <span>➕</span> Use in Lesson
              </button>
              <button type="button" class="jum-template-btn outline-teal btn-preview-template" data-template-id="${escapeHtml(t.id)}" title="Preview full printable adaptation guide">
                <span>📖</span> Guide
              </button>
            </div>
            <div style="display:flex;gap:4px;">
              <button type="button" class="jum-template-btn secondary btn-edit-template" data-template-id="${escapeHtml(t.id)}" title="Edit and customize this template">
                <span>✏️</span>
              </button>
              ${isCustom ? `
                <button type="button" class="jum-template-btn secondary btn-delete-template" data-template-id="${escapeHtml(t.id)}" title="Delete this custom template" style="color:#DC2626;border-color:#FCA5A5;">
                  <span>🗑️</span>
                </button>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach button events
    container.querySelectorAll('.btn-use-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-template-id');
        useTemplateInLesson(id);
      });
    });

    container.querySelectorAll('.btn-preview-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-template-id');
        previewTemplateGuide(id);
      });
    });

    container.querySelectorAll('.btn-edit-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-template-id');
        openTemplateModal(id);
      });
    });

    container.querySelectorAll('.btn-delete-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-template-id');
        deleteTemplate(id);
      });
    });
  }

  function openTemplateModal(templateId = null) {
    currentEditingTemplateId = templateId;
    const modal = document.getElementById('jum-modal-template');
    const headingText = document.getElementById('jum-modal-template-heading-text');
    const inputId = document.getElementById('jum-input-template-id');
    const inputTitle = document.getElementById('jum-input-template-title');
    const inputCategory = document.getElementById('jum-input-template-category');
    const inputBanner = document.getElementById('jum-input-template-banner');
    const inputTarget = document.getElementById('jum-input-template-target');
    const inputAac = document.getElementById('jum-input-template-aac');
    const inputOutcome = document.getElementById('jum-input-template-outcome');
    const inputIntro = document.getElementById('jum-input-template-intro');
    const inputGuided = document.getElementById('jum-input-template-guided');
    const inputActivity = document.getElementById('jum-input-template-activity');
    const inputWrapup = document.getElementById('jum-input-template-wrapup');
    const inputTier1 = document.getElementById('jum-input-template-tier1');
    const inputTier2 = document.getElementById('jum-input-template-tier2');
    const inputTier3 = document.getElementById('jum-input-template-tier3');
    const inputMaterials = document.getElementById('jum-input-template-materials');

    if (!modal) return;

    if (templateId) {
      const t = activeTemplates.find(item => item.id === templateId);
      if (!t) return;

      if (headingText) headingText.textContent = `Edit Template (${t.title})`;
      if (inputId) inputId.value = t.id;
      if (inputTitle) inputTitle.value = t.title || '';
      if (inputCategory) inputCategory.value = t.category || 'Non-Verbal & AAC';
      if (inputBanner) inputBanner.value = t.banner || 'aac';
      if (inputTarget) inputTarget.value = t.target || '';
      if (inputAac) inputAac.value = t.aacTools || '';
      if (inputOutcome) inputOutcome.value = t.outcome || '';
      if (inputIntro) inputIntro.value = t.intro || '';
      if (inputGuided) inputGuided.value = t.guided || '';
      if (inputActivity) inputActivity.value = t.activity || '';
      if (inputWrapup) inputWrapup.value = t.wrapup || '';
      if (inputTier1) inputTier1.value = t.tier1 || '';
      if (inputTier2) inputTier2.value = t.tier2 || '';
      if (inputTier3) inputTier3.value = t.tier3 || '';
      if (inputMaterials) inputMaterials.value = t.materials || '';
    } else {
      if (headingText) headingText.textContent = 'Create Special Needs Adaptation Template';
      if (inputId) inputId.value = '';
      if (inputTitle) inputTitle.value = '';
      if (inputCategory) inputCategory.value = 'Non-Verbal & AAC';
      if (inputBanner) inputBanner.value = 'aac';
      if (inputTarget) inputTarget.value = '';
      if (inputAac) inputAac.value = 'Picture symbol cards (PECS), pointing communication boards, physical sorting trays, peer partner response';
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

    modal.classList.add('active');
  }

  function closeTemplateModal() {
    const modal = document.getElementById('jum-modal-template');
    if (modal) modal.classList.remove('active');
    currentEditingTemplateId = null;
  }

  function handleTemplateFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('jum-input-template-id')?.value;
    const title = document.getElementById('jum-input-template-title')?.value.trim();
    const category = document.getElementById('jum-input-template-category')?.value;
    const banner = document.getElementById('jum-input-template-banner')?.value;
    const target = document.getElementById('jum-input-template-target')?.value.trim();
    const aacTools = document.getElementById('jum-input-template-aac')?.value.trim();
    const outcome = document.getElementById('jum-input-template-outcome')?.value.trim();
    const intro = document.getElementById('jum-input-template-intro')?.value.trim();
    const guided = document.getElementById('jum-input-template-guided')?.value.trim();
    const activity = document.getElementById('jum-input-template-activity')?.value.trim();
    const wrapup = document.getElementById('jum-input-template-wrapup')?.value.trim();
    const tier1 = document.getElementById('jum-input-template-tier1')?.value.trim();
    const tier2 = document.getElementById('jum-input-template-tier2')?.value.trim();
    const tier3 = document.getElementById('jum-input-template-tier3')?.value.trim();
    const materials = document.getElementById('jum-input-template-materials')?.value.trim();

    if (!title) {
      showToast('Please enter a template title.', 'error');
      return;
    }

    const iconMap = {
      'Non-Verbal & AAC': '🗣️',
      'Autism Spectrum': '🧩',
      'Dyslexia & Reading': '📖',
      'Hearing & Deaf': '🤟',
      'Visual Impairments': '👁️',
      'ADHD & Focus': '⚡',
      'Down Syndrome': '🌟',
      'Physical & Motor': '♿'
    };

    if (id) {
      // Edit existing
      const t = activeTemplates.find(item => item.id === id);
      if (t) {
        t.title = title;
        t.category = category;
        t.badge = category;
        t.banner = banner;
        t.icon = iconMap[category] || '📋';
        t.target = target;
        t.aacTools = aacTools;
        t.outcome = outcome;
        t.intro = intro;
        t.guided = guided;
        t.activity = activity;
        t.wrapup = wrapup;
        t.tier1 = tier1;
        t.tier2 = tier2;
        t.tier3 = tier3;
        t.materials = materials;
        showToast(`Template "${title}" updated successfully!`, 'success');
      }
    } else {
      // Create new
      const newTemplate = {
        id: `template_${Date.now()}`,
        title: title,
        category: category,
        badge: category,
        banner: banner,
        icon: iconMap[category] || '📋',
        target: target,
        aacTools: aacTools,
        outcome: outcome,
        intro: intro,
        guided: guided,
        activity: activity,
        wrapup: wrapup,
        tier1: tier1,
        tier2: tier2,
        tier3: tier3,
        materials: materials
      };
      activeTemplates.unshift(newTemplate);
      showToast(`Template "${title}" created successfully!`, 'success');
    }

    saveTemplates(activeTemplates);
    renderTemplatesGrid();
    closeTemplateModal();
  }

  function deleteTemplate(templateId) {
    const t = activeTemplates.find(item => item.id === templateId);
    if (!t) return;

    if (confirm(`Are you sure you want to delete the template "${t.title}"?`)) {
      activeTemplates = activeTemplates.filter(item => item.id !== templateId);
      saveTemplates(activeTemplates);
      renderTemplatesGrid();
      showToast('Template deleted successfully.', 'info');
    }
  }

  function resetTemplatesToDefault() {
    if (confirm('Reset all adaptation templates back to default evidence-based SNE exemplars? Custom templates will be overwritten.')) {
      activeTemplates = getDefaultSpecialNeedsTemplates();
      saveTemplates(activeTemplates);
      renderTemplatesGrid();
      showToast('Restored default Special Needs Adaptation Templates!', 'success');
    }
  }

  function useTemplateInLesson(templateId) {
    const t = activeTemplates.find(item => item.id === templateId);
    if (!t) return;

    // Switch to courses view and open lesson modal
    switchStudioView('courses');

    // Ensure we have a course
    if (activeCourses.length === 0) {
      activeCourses = getDefaultExemplarCourses();
      saveCourses(activeCourses);
      renderCoursesGrid();
    }

    const targetCourseId = currentViewingCourseId || activeCourses[0].id;
    openLessonModal(targetCourseId, null);

    // Auto-fill all modal inputs from template
    const inputTitle = document.getElementById('jum-input-lesson-title');
    const inputOutcome = document.getElementById('jum-input-lesson-outcome');
    const inputIntro = document.getElementById('jum-input-lesson-intro');
    const inputGuided = document.getElementById('jum-input-lesson-guided');
    const inputActivity = document.getElementById('jum-input-lesson-activity');
    const inputWrapup = document.getElementById('jum-input-lesson-wrapup');
    const inputTier1 = document.getElementById('jum-input-lesson-tier1');
    const inputTier2 = document.getElementById('jum-input-lesson-tier2');
    const inputTier3 = document.getElementById('jum-input-lesson-tier3');
    const inputMaterials = document.getElementById('jum-input-lesson-materials');
    const picker = document.getElementById('jum-lesson-template-picker');

    if (picker) picker.value = t.id;
    if (inputTitle) inputTitle.value = `[Inclusive Lesson] ${t.title.replace(' Template', '')}`;
    if (inputOutcome) inputOutcome.value = t.outcome || '';
    if (inputIntro) inputIntro.value = t.intro || '';
    if (inputGuided) inputGuided.value = t.guided || '';
    if (inputActivity) inputActivity.value = t.activity || '';
    if (inputWrapup) inputWrapup.value = t.wrapup || '';
    if (inputTier1) inputTier1.value = t.tier1 || '';
    if (inputTier2) inputTier2.value = t.tier2 || '';
    if (inputTier3) inputTier3.value = t.tier3 || '';
    if (inputMaterials) inputMaterials.value = t.materials || '';

    showToast(`Loaded "${t.title}" into lesson editor!`, 'success');
    announceToScreenReader(`Template ${t.title} loaded into lesson editor.`);
  }

  function previewTemplateGuide(templateId) {
    const t = activeTemplates.find(item => item.id === templateId);
    if (!t) return;

    const modal = document.getElementById('jum-modal-template-view');
    const content = document.getElementById('jum-template-view-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="jum-guide-document" style="font-family:var(--font-body);color:#1E293B;line-height:1.65;">
        
        <!-- Header Strip -->
        <div style="border-bottom:2px solid #0D9488;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
          <div>
            <span style="font-size:12px;font-weight:800;color:#0D9488;text-transform:uppercase;letter-spacing:1px;background:#F0FDFA;padding:4px 10px;border-radius:6px;border:1px solid #99F6E4;">
              Jumuishi SNE Adaptation Guide &bull; Kenya CBC Aligned
            </span>
            <h2 style="font-family:var(--font-heading);font-size:24px;font-weight:800;color:#0F172A;margin:10px 0 4px;">
              ${escapeHtml(t.title)}
            </h2>
            <p style="font-size:14px;color:#475569;margin:0;">
              <strong>Special Need Category:</strong> ${escapeHtml(t.category)} &bull; 
              <strong>Target Profile:</strong> ${escapeHtml(t.target)}
            </p>
          </div>
          <div style="text-align:right;">
            <span style="font-size:28px;" aria-hidden="true">${escapeHtml(t.icon || '📋')}</span>
          </div>
        </div>

        <!-- AAC & Communication Highlight Box (FAQ 12) -->
        <div style="background:#F0FDFA;border:1.5px solid #99F6E4;border-radius:14px;padding:18px 22px;margin-bottom:24px;">
          <h4 style="font-family:var(--font-heading);font-size:16px;font-weight:800;color:#0F766E;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
            <span>🗣️</span> Augmentative &amp; Alternative Communication (AAC) Integration (FAQ #12)
          </h4>
          <p style="font-size:14px;color:#134E4A;margin:0;line-height:1.6;">
            ${escapeHtml(t.aacTools)}
          </p>
          <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #99F6E4;font-size:12.5px;color:#0F766E;">
            <strong>Pedagogical Principle:</strong> In accordance with Kenya Ministry of Education Special Needs Education Policy, learners with speech/language barriers demonstrate competency through pointing, placing physical counters, or picture selection with zero penalty for oral communication speed.
          </div>
        </div>

        <!-- CBC Learning Outcome -->
        <div class="jum-resource-section">
          <div class="jum-resource-section-title" style="font-size:16px;">
            <span>🎯</span> Differentiated Competency-Based Learning Outcome
          </div>
          <div class="jum-resource-section-body" style="font-size:14px;">
            <p>${escapeHtml(t.outcome)}</p>
          </div>
        </div>

        <!-- 4-Stage Pathway -->
        <div class="jum-resource-section">
          <div class="jum-resource-section-title" style="font-size:16px;">
            <span>🪜</span> 4-Stage Instructional Pathway
          </div>
          <div class="jum-resource-section-body" style="font-size:14px;">
            <div style="margin-bottom:12px;">
              <strong>Stage 1: Welcoming Sensory &amp; AAC Orientation:</strong><br>
              ${escapeHtml(t.intro)}
            </div>
            <div style="margin-bottom:12px;">
              <strong>Stage 2: Concrete Guided Exploration &amp; Peer Buddy Inquiry:</strong><br>
              ${escapeHtml(t.guided)}
            </div>
            <div style="margin-bottom:12px;">
              <strong>Stage 3: Differentiated &amp; Multimodal Independent Activity:</strong><br>
              ${escapeHtml(t.activity)}
            </div>
            <div>
              <strong>Stage 4: Formative Reflection &amp; De-escalation:</strong><br>
              ${escapeHtml(t.wrapup)}
            </div>
          </div>
        </div>

        <!-- UDL Multi-Tier Accommodations -->
        <div class="jum-resource-section">
          <div class="jum-resource-section-title" style="font-size:16px;">
            <span>🛡️</span> Multi-Tiered Universal Design for Learning (UDL)
          </div>
          <div class="jum-resource-section-body" style="font-size:14px;">
            <ul>
              <li><strong>Tier 1 (Universal for Whole Class):</strong> ${escapeHtml(t.tier1)}</li>
              <li><strong>Tier 2 (Targeted Scaffolding):</strong> ${escapeHtml(t.tier2)}</li>
              <li><strong>Tier 3 (Intensive Specialized AAC):</strong> ${escapeHtml(t.tier3)}</li>
            </ul>
          </div>
        </div>

        <!-- Realia & Materials -->
        <div class="jum-resource-section">
          <div class="jum-resource-section-title" style="font-size:16px;">
            <span>📦</span> Low-Cost Kenyan Realia &amp; Assistive Tools
          </div>
          <div class="jum-resource-section-body" style="font-size:14px;">
            <p>${escapeHtml(t.materials)}</p>
          </div>
        </div>

      </div>
    `;

    modal.classList.add('active');
  }


  function initCourseStudio() {
    loadCourses();
    renderCoursesGrid();
    loadTemplates();

    // ── Responsive Studio Header Actions & Option Menus ──
    const btnCreateCourse = document.getElementById('jum-btn-create-course');
    const toggleCreateCourse = document.getElementById('jum-btn-create-course-toggle');
    const menuCreateCourse = document.getElementById('jum-menu-create-course');

    const btnCreateTemplate = document.getElementById('jum-btn-create-template');
    const toggleTemplates = document.getElementById('jum-btn-templates-toggle');
    const menuTemplates = document.getElementById('jum-menu-templates');

    // Helper to close header dropdowns
    function closeHeaderDropdowns() {
      if (menuCreateCourse) menuCreateCourse.classList.remove('active');
      if (menuTemplates) menuTemplates.classList.remove('active');
      if (toggleCreateCourse) toggleCreateCourse.setAttribute('aria-expanded', 'false');
      if (toggleTemplates) toggleTemplates.setAttribute('aria-expanded', 'false');
    }

    // 1. Create Course Direct Click -> Launches Course Creation Environment directly
    if (btnCreateCourse) {
      btnCreateCourse.addEventListener('click', (e) => {
        e.stopPropagation();
        closeHeaderDropdowns();
        switchStudioView('courses');
        const studioEl = document.getElementById('course-studio') || document.querySelector('.jum-studio-wrapper');
        if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        openCourseWizard(null);
        showToast('🚀 Course Creation Environment opened.', 'info');
      });
    }

    // Toggle Create Course Options Dropdown
    if (toggleCreateCourse && menuCreateCourse) {
      toggleCreateCourse.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menuCreateCourse.classList.contains('active');
        closeHeaderDropdowns();
        if (!isOpen) {
          menuCreateCourse.classList.add('active');
          toggleCreateCourse.setAttribute('aria-expanded', 'true');
        }
      });
    }

    // Handle Create Course Options Clicks
    if (menuCreateCourse) {
      menuCreateCourse.querySelectorAll('.jum-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = item.getAttribute('data-action');
          closeHeaderDropdowns();
          switchStudioView('courses');
          
          if (action === 'create-blank') {
            startCourseFromTemplate('tpl-blank');
          } else if (action === 'create-template-inclusive') {
            startCourseFromTemplate('tpl-inclusive');
          } else if (action === 'create-template-cbc') {
            startCourseFromTemplate('tpl-cbc');
          } else if (action === 'create-template-term') {
            startCourseFromTemplate('tpl-term');
          } else if (action === 'create-template-iep') {
            startCourseFromTemplate('tpl-iep');
          } else if (action === 'browse-templates-modal') {
            openChooseTemplateModal();
          }
        });
      });
    }

    // 2. Templates Direct Click -> Links to Special Needs Adaptation Templates Environment
    if (btnCreateTemplate) {
      btnCreateTemplate.addEventListener('click', (e) => {
        e.stopPropagation();
        closeHeaderDropdowns();
        switchStudioView('templates');
        const tplSection = document.getElementById('jum-studio-templates-view') || document.getElementById('jum-tab-btn-templates');
        if (tplSection) {
          tplSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        showToast('📋 Special Needs Adaptation Templates opened.', 'success');
      });
    }

    // Toggle Templates Options Dropdown
    if (toggleTemplates && menuTemplates) {
      toggleTemplates.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menuTemplates.classList.contains('active');
        closeHeaderDropdowns();
        if (!isOpen) {
          menuTemplates.classList.add('active');
          toggleTemplates.setAttribute('aria-expanded', 'true');
        }
      });
    }

    // Handle Templates Options Clicks
    if (menuTemplates) {
      menuTemplates.querySelectorAll('.jum-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = item.getAttribute('data-action');
          closeHeaderDropdowns();

          if (action === 'view-sne-templates') {
            switchStudioView('templates');
            const tplCards = document.getElementById('jum-template-cards-container');
            if (tplCards) tplCards.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (action === 'create-new-template') {
            openTemplateModal(null);
          } else if (action === 'browse-course-blueprints') {
            switchStudioView('courses');
            openChooseTemplateModal();
          } else if (action === 'reset-sne-templates') {
            resetTemplatesToDefault();
          }
        });
      });
    }

    // Close header dropdowns on outside click & Escape
    document.addEventListener('click', () => {
      closeHeaderDropdowns();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeHeaderDropdowns();
      }
    });

    // Toolbar & empty state buttons
    const btnExportAll = document.getElementById('jum-btn-export-all');
    const btnImportTrigger = document.getElementById('jum-btn-import-backup-trigger');
    const inputImport = document.getElementById('jum-input-import-backup');
    const btnResetExemplars = document.getElementById('jum-btn-reset-exemplars');
    const btnEmptyCreate = document.getElementById('jum-btn-empty-create');
    const btnEmptyBrowse = document.getElementById('jum-btn-empty-browse-templates');
    const btnEmptyReset = document.getElementById('jum-btn-empty-reset');

    if (btnExportAll) btnExportAll.addEventListener('click', exportAllCourses);
    if (btnResetExemplars) btnResetExemplars.addEventListener('click', resetExemplars);
    if (btnEmptyCreate) btnEmptyCreate.addEventListener('click', () => openCourseWizard(null));
    if (btnEmptyBrowse) btnEmptyBrowse.addEventListener('click', openChooseTemplateModal);
    if (btnEmptyReset) btnEmptyReset.addEventListener('click', resetExemplars);

    // Import Backup Handler
    if (btnImportTrigger && inputImport) {
      btnImportTrigger.addEventListener('click', () => inputImport.click());
      inputImport.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBackupData(e.target.files[0]);
          inputImport.value = '';
        }
      });
    }

    // Template Chooser Modal
    const btnChooseTplClose = document.getElementById('jum-btn-choose-template-close');
    const btnChooseTplCancel = document.getElementById('jum-btn-choose-template-cancel');
    const btnChooseTplBlank = document.getElementById('jum-btn-choose-template-blank');
    if (btnChooseTplClose) btnChooseTplClose.addEventListener('click', closeChooseTemplateModal);
    if (btnChooseTplCancel) btnChooseTplCancel.addEventListener('click', closeChooseTemplateModal);
    if (btnChooseTplBlank) btnChooseTplBlank.addEventListener('click', () => {
      closeChooseTemplateModal();
      startCourseFromTemplate('tpl-blank');
    });

    // ── 4-Step Wizard Event Listeners ──
    const btnWizardClose = document.getElementById('jum-btn-wizard-close');
    const btnWizardCancel = document.getElementById('jum-btn-wizard-cancel');
    const btnWizardPrev = document.getElementById('jum-btn-wizard-prev');
    const btnWizardNext = document.getElementById('jum-btn-wizard-next');
    const btnWizardDraft = document.getElementById('jum-btn-wizard-save-draft');
    const btnWizardPublish = document.getElementById('jum-btn-wizard-publish');
    const btnWizardPreview = document.getElementById('jum-btn-wizard-preview');

    if (btnWizardClose) btnWizardClose.addEventListener('click', closeCourseWizard);
    if (btnWizardCancel) btnWizardCancel.addEventListener('click', closeCourseWizard);
    if (btnWizardPrev) btnWizardPrev.addEventListener('click', prevWizardStep);
    if (btnWizardNext) btnWizardNext.addEventListener('click', nextWizardStep);
    if (btnWizardDraft) btnWizardDraft.addEventListener('click', () => saveWizardCourse(true));
    if (btnWizardPublish) btnWizardPublish.addEventListener('click', publishWizardCourse);
    if (btnWizardPreview) btnWizardPreview.addEventListener('click', () => {
      if (wizardCourse) openCoursePreviewModal(wizardCourse.id);
    });

    // Stepper header items
    for (let i = 1; i <= 4; i++) {
      const stepBtn = document.getElementById(`jum-step-btn-${i}`);
      if (stepBtn) {
        stepBtn.addEventListener('click', () => goToWizardStep(i));
      }
    }

    // Step 1 Auto-save listeners
    ['jum-wiz-title', 'jum-wiz-code', 'jum-wiz-subject', 'jum-wiz-grade', 'jum-wiz-term', 'jum-wiz-year', 'jum-wiz-duration', 'jum-wiz-educator', 'jum-wiz-status', 'jum-wiz-desc', 'jum-wiz-theme', 'jum-wiz-icon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          readWizardStep1();
          triggerWizardAutoSave();
        });
        el.addEventListener('change', () => {
          readWizardStep1();
          triggerWizardAutoSave();
        });
      }
    });
    document.querySelectorAll('#jum-wiz-needs-checkboxes input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        readWizardStep1();
        triggerWizardAutoSave();
      });
    });

    // Step 2 Auto-save listeners
    ['jum-wiz-framework', 'jum-wiz-strands', 'jum-wiz-substrands', 'jum-wiz-outcomes', 'jum-wiz-inquiry', 'jum-wiz-experiences', 'jum-wiz-assessments'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          readWizardStep2();
          triggerWizardAutoSave();
        });
        el.addEventListener('change', () => {
          readWizardStep2();
          triggerWizardAutoSave();
        });
      }
    });
    document.querySelectorAll('#jum-wiz-competencies-grid input[type="checkbox"], #jum-wiz-values-grid input[type="checkbox"], #jum-wiz-pcis-grid input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        readWizardStep2();
        triggerWizardAutoSave();
      });
    });

    // Step 3 Hierarchy toolbar buttons
    const btnTreeAddUnit = document.getElementById('jum-btn-tree-add-unit');
    const btnTreeAddLesson = document.getElementById('jum-btn-tree-add-lesson-quick');
    const btnTreeCollapse = document.getElementById('jum-btn-tree-collapse-all');
    const btnTreeExpand = document.getElementById('jum-btn-tree-expand-all');

    if (btnTreeAddUnit) btnTreeAddUnit.addEventListener('click', addWizardUnit);
    if (btnTreeAddLesson) btnTreeAddLesson.addEventListener('click', addWizardLessonQuick);
    if (btnTreeCollapse) btnTreeCollapse.addEventListener('click', () => toggleCollapseAllUnits(true));
    if (btnTreeExpand) btnTreeExpand.addEventListener('click', () => toggleCollapseAllUnits(false));

    // Step 4 Rich Editor Toolbar & Actions
    const lessonSelect = document.getElementById('jum-wiz-content-lesson-select');
    if (lessonSelect) {
      lessonSelect.addEventListener('change', (e) => {
        readWizardStep4();
        loadLessonIntoEditor(e.target.value);
      });
    }

    // Rich editor content listener
    const richEditor = document.getElementById('jum-rich-editor');
    if (richEditor) {
      richEditor.addEventListener('input', () => {
        readWizardStep4();
        triggerWizardAutoSave();
      });
    }

    // Step 4 input listeners
    ['jum-wiz-cur-lesson-title', 'jum-wiz-cur-lesson-duration', 'jum-wiz-cur-lesson-date', 'jum-wiz-cur-outcome', 'jum-wiz-cur-intro', 'jum-wiz-cur-guided', 'jum-wiz-cur-activity', 'jum-wiz-cur-wrapup', 'jum-wiz-cur-tier1', 'jum-wiz-cur-tier2', 'jum-wiz-cur-tier3', 'jum-wiz-cur-materials', 'jum-wiz-cur-reflection', 'jum-wiz-cur-homework'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          readWizardStep4();
          triggerWizardAutoSave();
        });
      }
    });

    // Formatting Toolbar Buttons
    document.querySelectorAll('.jum-tb-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        execEditorCommand(cmd);
      });
    });

    const formatSelect = document.getElementById('jum-editor-format');
    if (formatSelect) {
      formatSelect.addEventListener('change', (e) => {
        execEditorCommand('formatBlock', `<${e.target.value}>`);
      });
    }

    // Insert Table
    const btnInsTable = document.getElementById('jum-btn-insert-table');
    if (btnInsTable) {
      btnInsTable.addEventListener('click', () => {
        const tableHtml = `
          <table class="jum-editor-table" border="1" cellpadding="8" style="width:100%;border-collapse:collapse;margin:14px 0;">
            <thead>
              <tr style="background:#F1F5F9;">
                <th>Learning Area / Focus</th>
                <th>Realia / Counters</th>
                <th>UDL Adaptation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Concrete Concept</td>
                <td>Bottle tops &amp; sorting tray</td>
                <td>Tier 1 Visual + Tier 2 Tactile</td>
              </tr>
              <tr>
                <td>Guided Practice</td>
                <td>Cardboard number tracks</td>
                <td>Peer Buddy response</td>
              </tr>
            </tbody>
          </table><p><br></p>
        `;
        execEditorCommand('insertHTML', tableHtml);
      });
    }

    // Insert Link
    const btnInsLink = document.getElementById('jum-btn-insert-link');
    if (btnInsLink) {
      btnInsLink.addEventListener('click', () => {
        const url = prompt('Enter website URL (e.g. https://kicd.ac.ke):');
        if (url) {
          const text = prompt('Enter link text:', url) || url;
          execEditorCommand('insertHTML', `<a href="${url}" target="_blank" rel="noopener" style="color:var(--primary-color);text-decoration:underline;">${text}</a>`);
        }
      });
    }

    // Insert Image
    const btnInsImage = document.getElementById('jum-btn-insert-image');
    if (btnInsImage) {
      btnInsImage.addEventListener('click', () => {
        const url = prompt('Enter image URL or path:');
        if (url) {
          const alt = prompt('Enter image description (for accessibility):') || 'Inclusive learning illustration';
          execEditorCommand('insertHTML', `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:10px;margin:12px 0;display:block;">`);
        }
      });
    }

    // Insert Media Embed
    const btnInsMedia = document.getElementById('jum-btn-insert-media');
    if (btnInsMedia) {
      btnInsMedia.addEventListener('click', () => {
        const url = prompt('Enter YouTube video URL or audio link:');
        if (url) {
          let embedHtml = '';
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const vidId = url.includes('youtu.be/') ? url.split('youtu.be/')[1] : url.split('v=')[1]?.split('&')[0];
            embedHtml = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:16px 0;border-radius:12px;"><iframe src="https://www.youtube.com/embed/${vidId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
          } else {
            embedHtml = `<div style="background:#F1F5F9;padding:14px;border-radius:10px;margin:14px 0;"><a href="${url}" target="_blank" rel="noopener" style="color:var(--primary-color);font-weight:700;">🎵 Listen / Open Media Resource &rarr;</a></div>`;
          }
          execEditorCommand('insertHTML', embedHtml);
        }
      });
    }

    // Callout Blocks
    const btnTeacherNote = document.getElementById('jum-btn-insert-teacher-note');
    if (btnTeacherNote) {
      btnTeacherNote.addEventListener('click', () => {
        insertCalloutIntoEditor('note', '📌 Teacher Guidance Note:', 'Keep sensory calming tools accessible and ensure high-contrast materials are ready.');
      });
    }
    const btnLearnerInst = document.getElementById('jum-btn-insert-learner-inst');
    if (btnLearnerInst) {
      btnLearnerInst.addEventListener('click', () => {
        insertCalloutIntoEditor('instruction', '📋 Accessible Learner Instructions:', '1. Take 4 counters. 2. Place them into group 1. 3. Show your partner with a thumbs-up.');
      });
    }
    const btnPracticalAct = document.getElementById('jum-btn-insert-practical-act');
    if (btnPracticalAct) {
      btnPracticalAct.addEventListener('click', () => {
        insertCalloutIntoEditor('activity', '🧪 Practical Concrete Activity:', 'Learners manipulate clean plastic bottle tops on cardboard sorting trays.');
      });
    }
    const btnTierBlock = document.getElementById('jum-btn-insert-tier-block');
    if (btnTierBlock) {
      btnTierBlock.addEventListener('click', () => {
        insertCalloutIntoEditor('tier', '🎯 Differentiated Learning Tier:', 'Tier 2 Scaffolding: Color-coded cards with texture prompts and noise-reduction earmuffs.');
      });
    }
    const btnAccomBlock = document.getElementById('jum-btn-insert-accom-block');
    if (btnAccomBlock) {
      btnAccomBlock.addEventListener('click', () => {
        insertCalloutIntoEditor('accommodation', '🤝 Inclusive Learning Accommodation:', 'Zero oral speech penalty: Non-verbal pointing and physical placement receive full marks.');
      });
    }

    // ── In-Course Resource Manager Listeners ──
    const btnResClose = document.getElementById('jum-btn-res-modal-close');
    const btnResDone = document.getElementById('jum-btn-res-modal-done');
    if (btnResClose) btnResClose.addEventListener('click', () => {
      const m = document.getElementById('jum-modal-course-resources');
      if (m) m.classList.remove('active');
    });
    if (btnResDone) btnResDone.addEventListener('click', () => {
      const m = document.getElementById('jum-modal-course-resources');
      if (m) m.classList.remove('active');
    });

    const resDropzone = document.getElementById('jum-res-dropzone');
    const resFileInput = document.getElementById('jum-res-file-input');
    if (resDropzone && resFileInput) {
      resDropzone.addEventListener('click', () => resFileInput.click());
      resDropzone.addEventListener('dragover', (e) => { e.preventDefault(); resDropzone.classList.add('dragover'); });
      resDropzone.addEventListener('dragleave', () => resDropzone.classList.remove('dragover'));
      resDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        resDropzone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files) {
          handleResourceFilesAdded(e.dataTransfer.files);
        }
      });
      resFileInput.addEventListener('change', (e) => {
        if (e.target.files) handleResourceFilesAdded(e.target.files);
      });
    }

    const btnAddResLink = document.getElementById('jum-btn-add-res-link');
    if (btnAddResLink) {
      btnAddResLink.addEventListener('click', () => {
        const urlInput = document.getElementById('jum-input-res-link-url');
        const titleInput = document.getElementById('jum-input-res-link-title');
        const catSelect = document.getElementById('jum-select-res-link-cat');
        const course = activeCourses.find(c => c.id === currentResourceCourseId);

        if (!course || !urlInput || !urlInput.value.trim()) {
          showToast('Please enter a valid website link URL.', 'error');
          return;
        }

        if (!course.resources) course.resources = [];
        course.resources.unshift({
          id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: titleInput?.value.trim() || urlInput.value.trim(),
          type: 'link',
          fileFormat: 'LINK',
          size: 'Web Link',
          dateUploaded: new Date().toISOString().split('T')[0],
          category: catSelect?.value || 'Online Material',
          tags: ['Web Resource'],
          url: urlInput.value.trim()
        });

        urlInput.value = '';
        if (titleInput) titleInput.value = '';

        saveCourses(activeCourses);
        renderCourseResourcesTable();
        renderCoursesGrid();
        showToast('Online learning resource added!', 'success');
      });
    }

    // Resource Filter Listeners
    ['jum-res-search-input', 'jum-res-category-filter', 'jum-res-unit-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', renderCourseResourcesTable);
        el.addEventListener('change', renderCourseResourcesTable);
      }
    });

    // ── Learner Preview Modal Listeners ──
    const btnPrevClose = document.getElementById('jum-btn-prev-modal-close');
    const btnPrevDone = document.getElementById('jum-btn-prev-modal-done');
    const btnPrevEdit = document.getElementById('jum-btn-prev-modal-edit');
    const btnPrevPrint = document.getElementById('jum-btn-prev-print');

    if (btnPrevClose) btnPrevClose.addEventListener('click', () => {
      const m = document.getElementById('jum-modal-course-preview');
      if (m) m.classList.remove('active');
    });
    if (btnPrevDone) btnPrevDone.addEventListener('click', () => {
      const m = document.getElementById('jum-modal-course-preview');
      if (m) m.classList.remove('active');
    });
    if (btnPrevEdit) btnPrevEdit.addEventListener('click', () => {
      const m = document.getElementById('jum-modal-course-preview');
      if (m) m.classList.remove('active');
      if (currentViewingCourseId) openCourseWizard(currentViewingCourseId);
    });
    if (btnPrevPrint) btnPrevPrint.addEventListener('click', () => window.print());

    // ── Create Template Modal Listeners ──
    const formCreateTpl = document.getElementById('jum-form-create-template');
    const btnCreateTplClose = document.getElementById('jum-btn-create-tpl-close');
    const btnCreateTplCancel = document.getElementById('jum-btn-create-tpl-cancel');

    if (formCreateTpl) formCreateTpl.addEventListener('submit', handleCreateTemplateFormSubmit);
    if (btnCreateTplClose) btnCreateTplClose.addEventListener('click', () => {
      const m = document.getElementById('jum-modal-create-template');
      if (m) m.classList.remove('active');
    });
    if (btnCreateTplCancel) btnCreateTplCancel.addEventListener('click', () => {
      const m = document.getElementById('jum-modal-create-template');
      if (m) m.classList.remove('active');
    });

    // ── Confirmation Dialog Listeners ──
    const btnConfirmClose = document.getElementById('jum-btn-confirm-close');
    const btnConfirmCancel = document.getElementById('jum-btn-confirm-cancel');
    const btnConfirmAccept = document.getElementById('jum-btn-confirm-accept');

    if (btnConfirmClose) btnConfirmClose.addEventListener('click', closeConfirmDialog);
    if (btnConfirmCancel) btnConfirmCancel.addEventListener('click', closeConfirmDialog);
    if (btnConfirmAccept) btnConfirmAccept.addEventListener('click', () => {
      if (typeof confirmCallback === 'function') {
        confirmCallback();
      }
      closeConfirmDialog();
    });

    // ── Special Needs Templates Tab Switcher ──
    const tabBtnCourses = document.getElementById('jum-tab-btn-courses');
    const tabBtnTemplates = document.getElementById('jum-tab-btn-templates');
    if (tabBtnCourses) tabBtnCourses.addEventListener('click', () => switchStudioView('courses'));
    if (tabBtnTemplates) tabBtnTemplates.addEventListener('click', () => switchStudioView('templates'));

    // Special Needs SNE tab controls
    const btnCreateTplBar = document.getElementById('jum-btn-create-template-bar');
    const btnEmptyTplCreate = document.getElementById('jum-btn-empty-template-create');
    if (btnCreateTplBar) btnCreateTplBar.addEventListener('click', () => openTemplateModal(null));
    if (btnEmptyTplCreate) btnEmptyTplCreate.addEventListener('click', () => openTemplateModal(null));

    const btnResetTpl = document.getElementById('jum-btn-reset-templates');
    const btnEmptyTplReset = document.getElementById('jum-btn-empty-template-reset');
    if (btnResetTpl) btnResetTpl.addEventListener('click', resetTemplatesToDefault);
    if (btnEmptyTplReset) btnEmptyTplReset.addEventListener('click', resetTemplatesToDefault);

    const inputTplSearch = document.getElementById('jum-template-search');
    const selectTplNeed = document.getElementById('jum-template-filter-need');
    function applyTemplateFilters() {
      renderTemplatesGrid(inputTplSearch ? inputTplSearch.value : '', selectTplNeed ? selectTplNeed.value : 'all');
    }
    if (inputTplSearch) inputTplSearch.addEventListener('input', applyTemplateFilters);
    if (selectTplNeed) selectTplNeed.addEventListener('change', applyTemplateFilters);

    // Search and filter listeners for courses
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
    const btnViewerPreviewCourse = document.getElementById('jum-btn-viewer-preview-course');
    const btnViewerManageRes = document.getElementById('jum-btn-viewer-manage-resources');
    const btnViewerClose = document.getElementById('jum-btn-viewer-close');

    if (btnViewerAddLesson) {
      btnViewerAddLesson.addEventListener('click', () => {
        if (currentViewingCourseId) openLessonModal(currentViewingCourseId, null);
      });
    }
    if (btnViewerEditCourse) {
      btnViewerEditCourse.addEventListener('click', () => {
        if (currentViewingCourseId) openCourseWizard(currentViewingCourseId);
      });
    }
    if (btnViewerPreviewCourse) {
      btnViewerPreviewCourse.addEventListener('click', () => {
        if (currentViewingCourseId) openCoursePreviewModal(currentViewingCourseId);
      });
    }
    if (btnViewerManageRes) {
      btnViewerManageRes.addEventListener('click', () => {
        if (currentViewingCourseId) openCourseResourcesModal(currentViewingCourseId);
      });
    }
    if (btnViewerClose) {
      btnViewerClose.addEventListener('click', closeCourseLessonsViewer);
    }

    // Quick Lesson Modal Form, Dropzone & Close
    const formLesson = document.getElementById('jum-form-lesson');
    const btnLessonClose = document.getElementById('jum-btn-lesson-modal-close');
    const btnLessonCancel = document.getElementById('jum-btn-lesson-modal-cancel');
    if (formLesson) formLesson.addEventListener('submit', handleLessonFormSubmit);
    if (btnLessonClose) btnLessonClose.addEventListener('click', closeLessonModal);
    if (btnLessonCancel) btnLessonCancel.addEventListener('click', closeLessonModal);

    const dropzone = document.getElementById('jum-dropzone');
    const fileInput = document.getElementById('jum-file-input');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files) handleFilesSelected(e.dataTransfer.files);
      });
      fileInput.addEventListener('change', (e) => {
        if (e.target && e.target.files) handleFilesSelected(e.target.files);
      });
    }

    // Template Creator Modal Form & Close (Section 10B SNE)
    const formTemplate = document.getElementById('jum-form-template');
    const btnTemplateClose = document.getElementById('jum-btn-template-modal-close');
    const btnTemplateCancel = document.getElementById('jum-btn-template-modal-cancel');
    if (formTemplate) formTemplate.addEventListener('submit', handleTemplateFormSubmit);
    if (btnTemplateClose) btnTemplateClose.addEventListener('click', closeTemplateModal);
    if (btnTemplateCancel) btnTemplateCancel.addEventListener('click', closeTemplateModal);

    const btnTplViewClose = document.getElementById('jum-btn-template-view-close');
    const btnTplViewPrint = document.getElementById('jum-btn-print-template-doc');
    if (btnTplViewClose) btnTplViewClose.addEventListener('click', () => {
      const m = document.getElementById('jum-modal-template-view');
      if (m) m.classList.remove('active');
    });
    if (btnTplViewPrint) btnTplViewPrint.addEventListener('click', () => window.print());

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

    // Unsaved changes window protection
    window.addEventListener('beforeunload', (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
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
