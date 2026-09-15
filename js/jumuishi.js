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
     10. INCLUSIVE COURSE & LESSON STUDIO ENGINE (LMS MODEL)
     Comprehensive Course Architecture with Lesson Notes, Learning
     Materials, Multi-Modal Assignments & Interactive Quizzes
     ══════════════════════════════════════════════════════════════ */

  const COURSES_STORAGE_KEY = 'jumuishi_educator_courses_v3';
  const COURSE_TEMPLATES_STORAGE_KEY = 'jumuishi_custom_templates_v3';

  let activeCourses = [];
  let customTemplates = [];
  let wizardCourse = null;
  let wizardCurrentStep = 1;
  let wizardAutoSaveTimer = null;
  let hasUnsavedChanges = false;
  let currentViewingCourseId = null;
  let currentEditingLessonId = null;
  let activeEditorLessonId = null;
  let activeLmsModuleTab = 'notes';
  let currentResourceCourseId = null;
  let confirmCallback = null;

  // Track interactive quiz & assignment submission states in player
  const quizPlayerStates = {};
  const assignmentSubmissionStates = {};

  // ── 10.1 Default Reusable LMS Course Model Templates ──
  function getDefaultCourseTemplates() {
    return [
      {
        id: 'tpl-blank',
        name: 'Blank Course LMS Model',
        sub: 'Clean Slate & Custom Modules',
        desc: 'Design your own inclusive curriculum from scratch with complete LMS modules: Lesson Notes, Materials, Assignment, and Quiz.',
        icon: '📄',
        badge: 'Flexible LMS',
        theme: 'default',
        grade: 'All Grades',
        subject: 'General Inclusive',
        features: ['Clean blank structure', 'Full 4-component LMS model', 'Customizable UDL tiers & quizzes'],
        curriculum: {
          framework: 'Custom Inclusive Framework',
          strands: 'Foundations & Inquiry',
          subStrands: 'Exploration & Practice',
          outcomes: 'Learners demonstrate concept mastery through personalized multimodal LMS pathways.',
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
                    contentHtml: '<h3>Lesson 1: Introduction with Concrete Materials</h3><p>Welcome to Lesson 1. In this session, learners engage with sensory realia to build intuitive understanding.</p><div class=\"jum-editor-callout note\"><strong>📌 Teacher Note:</strong><p>Ensure tactile materials are clean and accessible on low tables for all learners.</p></div>',
                    teacherNotes: 'Ensure tactile materials are clean and accessible on low tables.',
                    learnerInstructions: 'Look at the items on your table. Group them by color and count each group.',
                    practicalActivities: 'Sorting bottle tops into cardboard compartments.',
                    accommodationsNotes: 'Allow pointing responses without penalizing oral speech.',
                    // LMS Module 2: Learning Materials
                    resources: [
                      {
                        id: 'mat-b-1',
                        name: 'Sensory_Sorting_Worksheet.pdf',
                        fileFormat: 'PDF',
                        url: 'assets/docs/Sensory_Sorting_Worksheet.pdf',
                        size: '145 KB',
                        description: 'High-contrast large print sorting guide for concrete manipulatives.'
                      }
                    ],
                    // LMS Module 3: Activity Assignment
                    assignment: {
                      id: 'asg-b-1',
                      title: 'Tactile Sorting & Classification Task',
                      learnerInstructions: 'Gather 6 household or classroom objects. Sort them into 2 groups and explain your rule by photo, voice note, or pointing.',
                      submissionTypes: ['photo', 'audio', 'text', 'observation'],
                      dueDate: '',
                      maxPoints: 10,
                      rubric: [
                        { criterion: 'Sorting Accuracy', points: 5, description: 'Clearly separated items according to one shared feature.' },
                        { criterion: 'Multimodal Explanation', points: 5, description: 'Expressed rationale via photo, voice, drawing, or pointing.' }
                      ],
                      accommodations: 'Zero speech penalty. Physical demonstration or photo of physical items earns full credit.'
                    },
                    // LMS Module 4: Assessment Quiz
                    quiz: {
                      id: 'quiz-b-1',
                      title: 'Sensory Grouping Quick Check',
                      description: 'Test your understanding of sorting! Choose the best answer or point to your card.',
                      passScorePercentage: 70,
                      questions: [
                        {
                          id: 'q-b-1',
                          type: 'multiple-choice',
                          questionText: 'When we sort bottle tops by color, which group do blue bottle tops belong to?',
                          options: ['The Blue Group', 'The Red Group', 'The Green Group', 'The Yellow Group'],
                          correctIndex: 0,
                          hint: 'Look for colors that match exactly.',
                          explanation: 'Items with the same color always belong together in that color group.'
                        },
                        {
                          id: 'q-b-2',
                          type: 'self-check',
                          questionText: 'How comfortable do you feel sorting objects today?',
                          options: ['😊 I can sort anything!', '🙂 I understand well', '🤔 I need some help', '😟 I am confused'],
                          correctIndex: -1,
                          hint: 'Select the emoji that matches how you feel right now.',
                          explanation: 'Thank you for reflecting! Your teacher will support your pace.'
                        }
                      ]
                    }
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
        name: 'Inclusive LMS Course Model',
        sub: 'UDL Tiers 1-3, AAC Boards & Multi-Modal Assessments',
        desc: 'Comprehensive LMS course model featuring Lesson Notes, Attached AAC PDFs, Video Guides, Hands-on Activity Assignment, and a 3-Question Pointing Quiz.',
        icon: '🤝',
        badge: '⭐ Recommended LMS',
        theme: 'default',
        grade: 'Grade 3',
        subject: 'General Inclusive',
        features: ['Full 4-Component LMS Model', 'AAC board & pointing accommodations', 'Interactive quiz & photo assignment'],
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
                    contentHtml: '<h3>Multi-Modal Exploration with AAC Pointing Boards</h3><p>Every learner participates equitably. Use visual symbols paired with spoken words.</p><div class=\"jum-editor-callout note\"><strong>📌 Teacher Note:</strong><p>Remember FAQ #12: Zero penalty for oral speech. Pointing and physical placement are full marks.</p></div><div class=\"jum-editor-callout accommodation\"><strong>🤝 Inclusive Accommodation:</strong><p>For non-verbal learners, utilize the 12-cell pointing choice board on desk.</p></div>',
                    teacherNotes: 'Remember FAQ #12: Zero penalty for speech. Pointing and physical placement count for full marks.',
                    learnerInstructions: 'Look at the cards on your desk. Point to the card that matches your teacher\'s counter.',
                    practicalActivities: 'Placing counters in 3 egg carton depressions.',
                    accommodationsNotes: '12-cell AAC pointing board on desk.',
                    // LMS Module 2: Learning Materials
                    resources: [
                      {
                        id: 'mat-inc-1',
                        title: 'AAC_Communication_Board_12Cell.pdf',
                        fileFormat: 'PDF',
                        url: 'assets/docs/AAC_Communication_Board_12Cell.pdf',
                        size: '185 KB',
                        description: 'Official 12-cell Kenyan AAC pointing board with symbols for numerals, calm breaks, and yes/no.'
                      },
                      {
                        id: 'mat-inc-2',
                        title: 'Inclusive Classroom Demonstration Video',
                        fileFormat: 'Video',
                        url: 'https://www.youtube.com/watch?v=sample_inclusive',
                        size: 'Video Stream',
                        description: 'Video showing Kenyan teacher modeling multi-tiered bottle top sorting in an integrated classroom.'
                      },
                      {
                        id: 'mat-inc-3',
                        title: 'Calming_Sensory_Audio_Chime.mp3',
                        type: 'Audio',
                        url: 'assets/audio/calm_chime.mp3',
                        size: '1.2 MB',
                        description: 'Gentle auditory chime to signal transition without triggering sensory distress.'
                      }
                    ],
                    // LMS Module 3: Activity Assignment
                    assignment: {
                      id: 'asg-inc-1',
                      title: 'Hands-on Concrete Grouping & Multi-Modal Expression',
                      instructions: 'Use bottle tops and egg cartons to build 3 equal groups of 4. Submit a photo of your completed tray, record a short voice note, or request your teacher sign off on your demonstration.',
                      submissionTypes: ['photo', 'audio', 'text', 'observation'],
                      dueDate: '2026-09-30',
                      maxPoints: 10,
                      rubric: [
                        { criterion: 'Equal Grouping Accuracy', points: 4, note: 'Formed 3 sets of 4 bottle tops in carton cups.' },
                        { criterion: 'Multi-Modal Representation', points: 4, note: 'Communicated result via AAC pointing, speech, or drawing.' },
                        { criterion: 'Care of Learning Tools', points: 2, note: 'Cleaned up materials cooperatively.' }
                      ],
                      accommodations: 'Zero oral speech penalty. Photo of physical egg carton or peer sign-off receives full marks.'
                    },
                    // LMS Module 4: Assessment Quiz
                    quiz: {
                      id: 'quiz-inc-1',
                      title: 'Multi-Modal Grouping & AAC Check',
                      description: 'Check your understanding! You can click, point, or ask your buddy to read aloud.',
                      passScorePercentage: 70,
                      questions: [
                        {
                          id: 'q-inc-1',
                          type: 'multiple-choice',
                          questionText: 'If you have 12 bottle tops and share them equally into 3 egg carton cups, how many are in each cup?',
                          options: ['2 bottle tops', '4 bottle tops', '6 bottle tops', '3 bottle tops'],
                          correctIndex: 1,
                          hint: 'Try placing one top into each cup until all 12 are shared!',
                          explanation: '12 shared equally into 3 groups gives 4 in each group (3 × 4 = 12).'
                        },
                        {
                          id: 'q-inc-2',
                          type: 'pointing-match',
                          questionText: 'Which tool can you point to if you need a quiet sensory break?',
                          options: ['AAC Calm Card 🛑', 'Math Textbook 📘', 'Football ⚽', 'Pencil ✏️'],
                          correctIndex: 0,
                          hint: 'Look for the red calm symbol on your pointing board.',
                          explanation: 'Pointing to the AAC Calm Card tells your teacher you need a 2-minute quiet break.'
                        },
                        {
                          id: 'q-inc-3',
                          type: 'self-check',
                          questionText: 'How confident do you feel about equal grouping today?',
                          options: ['😊 I can teach a friend!', '🙂 I understand well', '🤔 I need a bit more practice', '😟 I need teacher help'],
                          correctIndex: -1,
                          hint: 'Be honest about how you feel! All answers are helpful.',
                          explanation: 'Great reflection! Your teacher will support your pace.'
                        }
                      ]
                    }
                  }
                ]
              }
            ],
            resources: []
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
            category: 'Worksheets & Rubrics',
            tags: ['AAC', 'Non-Verbal', 'UDL']
          }
        ]
      },
      {
        id: 'tpl-cbc',
        name: 'Kenyan CBC Competency LMS Model',
        sub: 'KICD Framework, Formative Tasks & Competency Quizzes',
        desc: 'LMS course model fully aligned with KICD curriculum designs, featuring Strand Lesson Notes, Textbook PDFs, Authentic Realia Assignment, and CBC Rubric Quiz.',
        icon: '🇰🇪',
        badge: 'CBC Aligned LMS',
        theme: 'default',
        grade: 'Grade 3',
        subject: 'Mathematics',
        features: ['KICD strand & sub-strand structure', 'Core competencies integration', 'Formative CBC assessment quizzes'],
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Numbers: Multiplication as Repeated Addition',
          subStrands: 'Equal Grouping, Concrete Manipulatives, Market Realia',
          outcomes: 'By the end of the sub-strand, the learner should be able to represent multiplication as repeated addition using authentic local Kenyan realia.',
          inquiryQuestions: 'How can equal sharing help us solve everyday trade problems at the local market?',
          competencies: ['Critical Thinking & Problem Solving', 'Communication & Collaboration', 'Digital Literacy', 'Self-Efficacy'],
          values: ['Respect', 'Unity', 'Integrity', 'Responsibility'],
          pcis: ['Financial Literacy', 'Inclusion & Diversity', 'Life Skills'],
          learningExperiences: 'Learners work in diverse pairs to group bottle tops, count mangoes in market baskets, and record tallies.',
          assessmentExpectations: 'Formative observation grids, digital photo portfolios of grouping, peer reflection.'
        },
        units: [
          {
            id: 'unit-cbc-1',
            title: 'Strand 1.0: Numbers & Operations',
            desc: 'Developing foundational operational fluency through authentic Kenyan contexts.',
            duration: '3 Weeks',
            topics: [
              {
                id: 'top-cbc-1-1',
                title: 'Sub-strand 1.1: Multiplication as Repeated Addition',
                lessons: [
                  {
                    id: 'les-cbc-1-1-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Equal Grouping with Local Market Counters',
                    duration: '35 mins',
                    date: '',
                    outcome: 'Learner creates equal groups using bottle tops and relates equal sets to repeated addition.',
                    intro: 'Market stall story: Mama Mboga is packaging sukuma wiki and bananas in equal bundles of 5.',
                    guided: 'Teacher and learners count 3 bundles of 5 bananas together using rhythmic clapping: 5, 10, 15.',
                    activity: 'In pairs, learners place bottle tops into egg carton cups to represent repeated addition equations.',
                    wrapup: 'Quick check: Show thumbs up if 5 + 5 + 5 is equal to 3 × 5.',
                    tier1: 'Large bold numbers on blackboard, oral counting chants.',
                    tier2: 'Color-coded bundle cards with tactile rubber bands.',
                    tier3: '1-on-1 buddy assistance, pre-grouped counters, zero speech pressure.',
                    materials: 'Plastic bottle tops, egg cartons, rubber bands, mini market cards',
                    reflection: '',
                    homework: 'Count pairs of shoes or socks at home with a guardian.',
                    contentHtml: '<h3>Equal Grouping with Local Market Counters</h3><p>Relate multiplication to practical market trading in Kenya.</p><div class=\"jum-editor-callout note\"><strong>📌 CBC Lesson Guidance:</strong><p>Emphasize financial literacy and fair trade while grouping items.</p></div>',
                    teacherNotes: 'Observe how learners help each other bundle items.',
                    learnerInstructions: 'Take 15 counters. Make 3 equal groups of 5.',
                    practicalActivities: 'Bundling counters with rubber bands.',
                    accommodationsNotes: 'Allow finger tracing and pointing choice.',
                    // LMS Module 2: Learning Materials
                    resources: [
                      {
                        id: 'mat-cbc-1',
                        title: 'KICD_Grade3_Math_Repeated_Addition.pdf',
                        fileFormat: 'PDF',
                        url: 'assets/docs/KICD_Grade3_Math.pdf',
                        size: '320 KB',
                        description: 'Official KICD curriculum excerpt with visual illustrations of market bunches.'
                      },
                      {
                        id: 'mat-cbc-2',
                        title: 'Kenyan_Currency_Market_Realia_Worksheet.pdf',
                        fileFormat: 'PDF',
                        url: 'assets/docs/Market_Worksheet.pdf',
                        size: '210 KB',
                        description: 'Hands-on trading worksheet with toy Kenyan currency.'
                      }
                    ],
                    // LMS Module 3: Activity Assignment
                    assignment: {
                      id: 'asg-cbc-1',
                      title: 'Local Market Realia Grouping Challenge',
                      instructions: 'Set up a mini market stall. Group 15 counters into 3 equal sets for customers. Explain your equation: 5 + 5 + 5 = 15 (3 × 5).',
                      submissionTypes: ['photo', 'audio', 'text', 'observation'],
                      dueDate: '2026-10-05',
                      maxPoints: 10,
                      rubric: [
                        { criterion: 'CBC Concept Mastery', points: 5, note: 'Formed equal groups representing 3 × 5 accurately.' },
                        { criterion: 'Communication & Collaboration', points: 3, note: 'Worked cooperatively with market partner.' },
                        { criterion: 'Self-Efficacy & Organization', points: 2, note: 'Kept stall tidy and counted with confidence.' }
                      ],
                      accommodations: 'Verbal narration or pointing to number card accepted equally.'
                    },
                    // LMS Module 4: Assessment Quiz
                    quiz: {
                      id: 'quiz-cbc-1',
                      title: 'CBC Multiplication as Repeated Addition Quiz',
                      description: 'Demonstrate your CBC competency! Answer these 3 practical questions.',
                      passScorePercentage: 70,
                      questions: [
                        {
                          id: 'q-cbc-1',
                          type: 'multiple-choice',
                          questionText: 'Mama Mboga has 3 bundles with 5 bananas each. How many bananas does she have in total?',
                          options: ['10 bananas', '15 bananas', '20 bananas', '8 bananas'],
                          correctIndex: 1,
                          hint: 'Count by 5s three times: 5, 10, 15!',
                          explanation: '3 groups of 5 equals 5 + 5 + 5 = 15 bananas.'
                        },
                        {
                          id: 'q-cbc-2',
                          type: 'multiple-choice',
                          questionText: 'Which core CBC competency did you use when sharing bottle tops fairly with your partner?',
                          options: ['Communication & Collaboration 🤝', 'Solo Sprinting 🏃', 'Sleeping 😴', 'Skipping School 🚫'],
                          correctIndex: 0,
                          hint: 'Think about working together and speaking politely.',
                          explanation: 'Collaborating fairly with peers builds the Communication and Collaboration competency.'
                        },
                        {
                          id: 'q-cbc-3',
                          type: 'self-check',
                          questionText: 'How ready do you feel to use repeated addition at home or at the shop?',
                          options: ['🌟 Very ready! I can help my family count', '👍 I feel good about it', '🤔 I want to practice more with bottle tops', '🙋 I would like teacher guidance'],
                          correctIndex: -1,
                          hint: 'Choose how you truly feel.',
                          explanation: 'Wonderful reflection! Every practice session makes you stronger.'
                        }
                      ]
                    }
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
        name: 'Thematic 12-Week Syllabus LMS Model',
        sub: 'Weekly Progression, Milestone Reviews & Portfolio Quizzes',
        desc: 'Termly course blueprint organizing 12 weeks of inquiry with project materials, multi-modal milestones, and mid-term / final self-check quizzes.',
        icon: '📅',
        badge: 'Termly LMS',
        theme: 'default',
        grade: 'Grade 3',
        subject: 'Integrated Learning Areas',
        features: ['Full 12-week thematic arc', 'Baseline & summative portfolio checkpoints', 'Interactive self-reflection quizzes'],
        curriculum: {
          framework: 'Kenyan CBC Term Syllabus',
          strands: 'Environmental, Literacy, Numeracy Integration',
          subStrands: 'Community Resources, Living Together, Nature Exploration',
          outcomes: 'Learners explore holistic themes across 12 structured weeks with multimodal evidence collection.',
          inquiryQuestions: 'How do plants, animals, and people support each other in our Kenyan community?',
          competencies: ['Citizenship', 'Critical Thinking', 'Environmental Care'],
          values: ['Unity', 'Responsibility', 'Love'],
          pcis: ['Environmental Conservation', 'Community Cohesion'],
          learningExperiences: 'School nature walks, seed planting in recycled cartons, peer interviews.',
          assessmentExpectations: 'Weekly portfolio evidence, interactive quizzes, student exhibitions.'
        },
        units: [
          {
            id: 'unit-term-1',
            title: 'Unit 1: Environmental Awareness & Living Things',
            desc: 'Weeks 1 to 4: Exploring local Kenyan biodiversity and plant growth.',
            duration: '4 Weeks',
            topics: [
              {
                id: 'top-term-1-1',
                title: 'Topic 1.1: Seeds, Soils & Growth',
                lessons: [
                  {
                    id: 'les-term-1-1-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Seed Germination in Recycled Containers',
                    duration: '35 mins',
                    date: '',
                    outcome: 'Learners plant bean seeds in milk cartons and record daily observations with drawings or photos.',
                    intro: 'Nature walk: Collect fallen leaves and examine bean seeds with magnifying glasses.',
                    guided: 'Demonstrate soil preparation in recycled milk packets with drainage holes.',
                    activity: 'Each learner plants 2 bean seeds, waters gently, and places them near the sunlight window.',
                    wrapup: 'Washing hands and charting day 1 on the class visual growth calendar.',
                    tier1: 'Visual planting poster with numbered steps.',
                    tier2: 'Pre-moistened soil, ergonomic spoons for scooping.',
                    tier3: '1-on-1 shadow teacher support, tactile seed comparison tray.',
                    materials: 'Bean seeds, empty milk packets, rich potting soil, water sprayers',
                    reflection: '',
                    homework: 'Check on your seed with a family member and place it in the sun.',
                    contentHtml: '<h3>Seed Germination in Recycled Containers</h3><p>Connecting environmental science to everyday recycled materials.</p>',
                    teacherNotes: 'Ensure all recycled packets have drainage holes poked in bottom.',
                    learnerInstructions: 'Fill your carton halfway with soil. Place two seeds inside and cover gently.',
                    practicalActivities: 'Planting seeds and gentle misting.',
                    accommodationsNotes: 'Allow spoon scooping for motor ease.',
                    // LMS Module 2: Learning Materials
                    resources: [
                      {
                        id: 'mat-term-1',
                        title: 'Bean_Seed_Growth_Tracker.pdf',
                        fileFormat: 'PDF',
                        url: 'assets/docs/Growth_Tracker.pdf',
                        size: '190 KB',
                        description: '7-day visual observation sheet with space for drawings or photo stickers.'
                      }
                    ],
                    // LMS Module 3: Activity Assignment
                    assignment: {
                      id: 'asg-term-1',
                      title: 'My Seed Germination Journal (Day 1)',
                      instructions: 'Plant your seeds and take a photo of your labeled milk carton or draw what you did today.',
                      submissionTypes: ['photo', 'audio', 'text', 'observation'],
                      dueDate: '2026-10-10',
                      maxPoints: 10,
                      rubric: [
                        { criterion: 'Planting Process', points: 5, note: 'Planted seeds with adequate soil and moisture.' },
                        { criterion: 'Observation Journal', points: 5, note: 'Submitted photo or drawing of Day 1 setup.' }
                      ],
                      accommodations: 'Teacher observation or voice recording of what was done counts for full credit.'
                    },
                    // LMS Module 4: Assessment Quiz
                    quiz: {
                      id: 'quiz-term-1',
                      title: 'What Do Seeds Need to Grow?',
                      description: 'Check what you learned about plant needs today!',
                      passScorePercentage: 70,
                      questions: [
                        {
                          id: 'q-term-1',
                          type: 'multiple-choice',
                          questionText: 'What two things did we give our bean seeds today so they can sprout?',
                          options: ['Soil & Water 💧', 'Soda & Candy 🍬', 'Dark Plastic Box 📦', 'Ice cubes 🧊'],
                          correctIndex: 0,
                          hint: 'Think about what we scooped and sprayed!',
                          explanation: 'Seeds need nutrient-rich soil, moisture from water, and warmth from sunlight.'
                        },
                        {
                          id: 'q-term-2',
                          type: 'self-check',
                          questionText: 'Did you enjoy getting your hands in the soil today?',
                          options: ['🌱 Loved it! Excited to see it grow', '👍 It was fun', '🤲 A bit messy but okay', '🧤 I prefer wearing gloves'],
                          correctIndex: -1,
                          hint: 'Share your honest sensory experience.',
                          explanation: 'Thank you! We have sensory gloves available anytime you need them.'
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ],
        resources: []
      },
      {
        id: 'tpl-iep',
        name: 'Individualized IEP Mastery LMS Model',
        sub: 'Specialist Protocols, Milestone Tracking & Micro-Mastery',
        desc: 'Specialized LMS blueprint for occupational therapists, speech therapists, and SNE teachers to track micro-milestones with tailored assistive materials and anxiety-free quizzes.',
        icon: '🎯',
        badge: 'Specialist IEP',
        theme: 'default',
        grade: 'Special Unit / Stage-Based',
        subject: 'Individualized Skills',
        features: ['Therapist-aligned milestones', 'AAC & sensory break tracking', 'Micro-mastery checks with zero pressure'],
        curriculum: {
          framework: 'Kenya SNE Stage-Based Pathway',
          strands: 'Self-Help, AAC Communication, Sensory Regulation',
          subStrands: 'Pointing Selection, Emotional Co-Regulation',
          outcomes: 'Learner achieves targeted IEP goals at their individual pace using specialized accommodations.',
          inquiryQuestions: 'How can I express what I need and feel calm in my learning environment?',
          competencies: ['Self-Efficacy', 'Communication & Collaboration'],
          values: ['Respect', 'Love', 'Peace'],
          pcis: ['Special Needs Health', 'Inclusive Living'],
          learningExperiences: 'Visual schedule transitions, tactile stimulation, partner-assisted AAC scanning.',
          assessmentExpectations: 'IEP milestone tracking logs, therapist observational notes.'
        },
        units: [
          {
            id: 'unit-iep-1',
            title: 'IEP Milestone Goal 1: AAC Expressive Communication',
            desc: 'Focus on independent choice-making and request signaling.',
            duration: '6 Weeks',
            topics: [
              {
                id: 'top-iep-1-1',
                title: 'Topic 1.1: Expressing Basic Needs via Choice Cards',
                lessons: [
                  {
                    id: 'les-iep-1-1-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Choice Making (Water, Rest, Snack, Game)',
                    duration: '25 mins',
                    date: '',
                    outcome: 'Learner independently selects target preference by pointing to or handing 1 of 4 PECS cards.',
                    intro: 'Present 4 high-contrast laminated choice cards with clear symbol and bold text.',
                    guided: 'Educator models: Hold up Water card when reaching for water bottle.',
                    activity: 'Provide natural opportunity: Learner selects preferred item during morning break.',
                    wrapup: 'Positive reinforcement with favorite calming sensory toy or gentle praise.',
                    tier1: 'High contrast visual card array on desk.',
                    tier2: 'Reduced field to 2 choices (Water vs Snack).',
                    tier3: 'Hand-under-hand guidance fading to independent pointing.',
                    materials: '4 laminated PECS choice cards (Water, Rest, Snack, Game), card stand',
                    reflection: '',
                    homework: 'Practice choice board during evening family dinner.',
                    contentHtml: '<h3>Choice Making with 4-Card PECS Array</h3><p>Building self-advocacy and functional communication.</p>',
                    teacherNotes: 'Do not anticipate needs prematurely; allow 8-10 seconds processing time.',
                    learnerInstructions: 'Look at the cards. Point to or touch what you want.',
                    practicalActivities: 'Selecting card before item is handed over.',
                    accommodationsNotes: 'Accept eye-gaze or hand point as equal completion.',
                    // LMS Module 2: Learning Materials
                    resources: [
                      {
                        id: 'mat-iep-1',
                        title: 'PECS_Basic_Needs_4Card_Printable.pdf',
                        fileFormat: 'PDF',
                        url: 'assets/docs/PECS_4Card.pdf',
                        size: '120 KB',
                        description: 'Laminated printable card templates for Water, Rest, Snack, and Game.'
                      }
                    ],
                    // LMS Module 3: Activity Assignment
                    assignment: {
                      id: 'asg-iep-1',
                      title: 'Daily Choice Card Expression Log',
                      instructions: 'Record 3 independent choice selections throughout the school day or at home with a guardian.',
                      submissionTypes: ['photo', 'audio', 'observation'],
                      dueDate: '',
                      maxPoints: 5,
                      rubric: [
                        { criterion: 'Choice Initiation', points: 3, note: 'Initiated pointing or handing card without verbal prompt.' },
                        { criterion: 'Calm Transition', points: 2, note: 'Remained regulated while waiting for requested item.' }
                      ],
                      accommodations: 'Parent or shadow teacher observation sign-off.'
                    },
                    // LMS Module 4: Assessment Quiz
                    quiz: {
                      id: 'quiz-iep-1',
                      title: 'Visual Choice Matching Check',
                      description: 'Point to or tap the card that shows what to do when thirsty.',
                      passScorePercentage: 60,
                      questions: [
                        {
                          id: 'q-iep-1',
                          type: 'pointing-match',
                          questionText: 'When you are thirsty, point to the card you need:',
                          options: ['💧 Water Card', '😴 Sleep Card', '⚽ Play Card', '✏️ Pencil Card'],
                          correctIndex: 0,
                          hint: 'Look for the blue water drop.',
                          explanation: 'Pointing to the water card tells everyone you would like a drink of water!'
                        },
                        {
                          id: 'q-iep-2',
                          type: 'self-check',
                          questionText: 'How did pointing to cards make you feel today?',
                          options: ['😊 Proud & Happy', '🙂 Calm', '😐 Neutral', '😟 Tired'],
                          correctIndex: -1,
                          hint: 'Point to your feeling emoji.',
                          explanation: 'Thank you for expressing how you feel!'
                        }
                      ]
                    }
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


  // ── 10.2 Custom Templates Storage & Retrieval ──
  function loadCustomTemplates() {
    try {
      const stored = localStorage.getItem(COURSE_TEMPLATES_STORAGE_KEY);
      if (stored) {
        customTemplates = JSON.parse(stored);
      } else {
        customTemplates = [];
      }
    } catch (e) {
      console.warn('Could not load custom course templates:', e);
      customTemplates = [];
    }
    return customTemplates;
  }

  function saveCustomTemplates(templates) {
    customTemplates = templates || [];
    try {
      localStorage.setItem(COURSE_TEMPLATES_STORAGE_KEY, JSON.stringify(customTemplates));
    } catch (e) {
      console.warn('Could not save custom course templates:', e);
    }
  }


  // ── 10.3 Default Inclusive Courses with LMS Model Architecture ──
  function getDefaultExemplarCourses() {
    return [
      {
        id: 'crs-grade2-math',
        title: 'Grade 2: Inclusive Everyday Mathematics & Numeracy',
        code: 'MATH-G2-INCL',
        subject: 'Mathematics',
        grade: 'Grade 2',
        term: 'Term 1',
        year: '2026',
        duration: '10 Weeks',
        educatorName: 'Mwalimu Faith Kiprono',
        status: 'published',
        desc: 'Foundational numeracy structured with KICD CBC standards, UDL multi-tiered tactile scaffolds, concrete realia manipulatives, and zero speech-penalty formative assessments.',
        theme: 'emerald',
        icon: '🧮',
        specialNeeds: ['autism', 'dyscalculia', 'adhd', 'low-vision'],
        competencies: ['Critical Thinking & Problem Solving', 'Communication & Collaboration', 'Self-Efficacy'],
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Numbers & Measurement',
          subStrands: 'Whole Numbers (1-100) & Fractions',
          outcomes: 'Learners demonstrate concept mastery in grouping, equal sharing, and place value through multimodal concrete representations.',
          inquiryQuestions: 'How can equal sharing help us solve everyday group problems fairly?',
          competencies: ['Critical Thinking', 'Communication', 'Digital Literacy'],
          values: ['Integrity', 'Social Justice', 'Respect'],
          pcis: ['Financial Literacy', 'Inclusion of Special Needs'],
          learningExperiences: 'Manipulating bottle tops and counters, paired realia sharing, tactile counting walks.',
          assessmentExpectations: 'Formative observation rubrics, tactile manipulative demonstrations, self-reflection check.'
        },
        units: [
          {
            id: 'unit-math-1',
            title: 'Unit 1: Number Concept & Concrete Representation',
            desc: 'Multi-sensory counting, 1-to-1 correspondence, and place value using locally available concrete materials.',
            duration: '3 Weeks',
            topics: [
              {
                id: 'top-math-1-1',
                title: 'Topic 1.1: Counting & Grouping with Realia',
                lessons: [
                  {
                    id: 'les-math-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Grouping with Counters & Tactile Beads',
                    duration: '35 mins',
                    date: '2026-09-18',
                    outcome: 'Learners group objects in sets of 2s, 5s, and 10s using concrete bottle tops and sensory beads.',
                    intro: 'Sing counting rhyme with tactile clapping rhythm. Display tactile number line on mat.',
                    guided: 'Educator models grouping 10 bottle tops into 2 equal piles of 5 with verbal and gesture cues.',
                    activity: 'In pairs, learners sort beans, bottle tops, and beads into designated egg-carton compartments.',
                    wrapup: 'Learners point to their grouped egg cartons. Peer buddy validates with high-five checklist.',
                    tier1: 'Universal visual countdown timer and colorful large-print flashcards.',
                    tier2: 'Targeted high-contrast counting mats with tactile raised borders for motor stability.',
                    tier3: 'Intensive 1-on-1 hand-over-hand tactile guidance and PECS card pointing prompts.',
                    materials: 'Egg cartons, bottle tops, tactile beads, visual timer, number cards.',
                    reflection: '3 learners mastered grouping of 5s immediately; 2 learners needed egg-carton borders for orientation.',
                    homework: 'Find 10 small pebbles or seeds at home and group them into 2 equal sets.',
                    contentHtml: '<h3>Lesson 1: Grouping with Counters & Tactile Beads</h3><p>This foundational numeracy lesson utilizes Kenyan CBC stage modeling and Universal Design for Learning (UDL) to build intuitive whole-number concepts.</p><div class="jum-editor-callout cbc"><strong>CBC Competency:</strong> Critical Thinking & Problem Solving through concrete grouping and tactile classification.</div>',
                    notesHtml: '<p>Ensure tactile counters are within arm reach. Remind peer buddies to give 5 seconds processing time before offering verbal prompts.</p>',
                    resources: [
                      { id: 'res-m-1', name: 'Tactile Number Line 1-20 (Printable).pdf', fileFormat: 'PDF', size: '1.2 MB', url: '#' },
                      { id: 'res-m-2', name: 'Bottle Top Grouping Activity Guide.docx', fileFormat: 'DOC', size: '480 KB', url: '#' }
                    ],
                    assignment: {
                      id: 'asg-math-1',
                      title: 'Concrete Grouping & Sharing Demonstration',
                      maxPoints: 20,
                      dueDate: '2026-09-22',
                      learnerInstructions: 'Take 12 counters (bottle tops or pebbles). Group them into 3 equal sets. Show your groups to your educator, peer buddy, or record a short audio/photo explaining how many are in each set.',
                      submissionTypes: ['photo', 'voice', 'observation'],
                      rubric: [
                        { id: 'rc-1', criterion: 'Concrete Accuracy', points: 8, description: 'Correctly divides 12 items into 3 equal groups of 4.' },
                        { id: 'rc-2', criterion: 'Explaining Method', points: 6, description: 'Expresses result verbally, via pointing, or using AAC cards.' },
                        { id: 'rc-3', criterion: 'Engagement & Independence', points: 6, description: 'Demonstrates active effort with self-regulation strategies.' }
                      ],
                      accommodations: 'Zero speech penalty. Pointing, gesture confirmation, or photo upload by caregiver fully accepted.'
                    },
                    quiz: {
                      id: 'quiz-math-1',
                      title: 'Counting & Grouping Check for Understanding',
                      description: 'Test your understanding of equal groups and tactile counting.',
                      passScorePercentage: 70,
                      questions: [
                        {
                          id: 'q-m-1',
                          type: 'multiple-choice',
                          questionText: 'If you have 10 bottle tops and put them into 2 equal piles, how many bottle tops are in each pile?',
                          options: ['2 bottle tops', '5 bottle tops', '8 bottle tops', '10 bottle tops'],
                          correctIndex: 1,
                          hint: 'Think of 5 fingers on one hand and 5 fingers on the other hand.',
                          explanation: 'Correct! 10 divided equally into 2 groups equals 5 bottle tops in each group (5 + 5 = 10).'
                        },
                        {
                          id: 'q-m-2',
                          type: 'pointing-match',
                          questionText: 'Point to the picture card that shows 3 equal groups of 2 bottle tops:',
                          options: ['Card A: [●●] [●●] [●●]', 'Card B: [●●●] [●]', 'Card C: [●●●●●●]', 'Card D: [●] [●] [●]'],
                          correctIndex: 0,
                          hint: 'Count three separate boxes with two dots inside each.',
                          explanation: 'Spot on! Three pairs of dots equals 6 bottle tops grouped in twos.'
                        },
                        {
                          id: 'q-m-3',
                          type: 'self-check',
                          questionText: 'How comfortable did you feel grouping the concrete counters today?',
                          options: ['🌟 Super confident!', '👍 I understand with a little help', '🤔 I need more practice with counters'],
                          correctIndex: -1,
                          hint: 'Pick the card that describes your feeling today.',
                          explanation: 'Great reflection! Practice makes our numeracy muscles grow stronger every day.'
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ],
        resources: [
          { id: 'crs-res-1', name: 'KICD Grade 2 Mathematics Teachers Guide.pdf', fileFormat: 'PDF', size: '3.4 MB', url: '#' },
          { id: 'crs-res-2', name: 'Low-Vision Tactile Flashcards Kit.zip', fileFormat: 'ZIP', size: '14.2 MB', url: '#' }
        ]
      },
      {
        id: 'crs-grade4-science',
        title: 'Grade 4: Integrated Science, Agriculture & Environment',
        code: 'SCI-G4-ENV',
        subject: 'Science & Technology',
        grade: 'Grade 4',
        term: 'Term 2',
        year: '2026',
        duration: '12 Weeks',
        educatorName: 'Teacher Brian Omondi',
        status: 'published',
        desc: 'Hands-on experiential environmental science designed around indigenous Kenyan plants, water conservation, sensory garden exploration, and multisensory observation notebooks.',
        theme: 'blue',
        icon: '🌱',
        specialNeeds: ['adhd', 'hearing-impairment', 'physical-disability'],
        competencies: ['Learning to Learn', 'Digital Literacy', 'Citizenship'],
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Living Things & Their Environment',
          subStrands: 'Plants, Soils & Water Conservation',
          outcomes: 'Learners investigate germination, classify local leaf types, and practice water conservation in the school sensory garden.',
          inquiryQuestions: 'How do plants adapt to conserve water during dry seasons in Kenya?',
          competencies: ['Learning to Learn', 'Critical Thinking', 'Collaboration'],
          values: ['Respect for Environment', 'Responsibility', 'Patriotism'],
          pcis: ['Environmental Education', 'Disaster Risk Reduction'],
          learningExperiences: 'Touching diverse leaf textures, measuring plant heights with tactile rulers, drip irrigation experiments.',
          assessmentExpectations: 'Sensory journal records, tactile plant classification portfolios, observation checklists.'
        },
        units: [
          {
            id: 'unit-sci-1',
            title: 'Unit 1: Plant Anatomy & Water Conservation',
            desc: 'Investigating stem structures, leaf textures, and indigenous soil types.',
            duration: '4 Weeks',
            topics: [
              {
                id: 'top-sci-1-1',
                title: 'Topic 1.1: Leaf Structures & Transpiration',
                lessons: [
                  {
                    id: 'les-sci-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Sensory Leaf Rubbings & Texture Classification',
                    duration: '40 mins',
                    date: '2026-09-20',
                    outcome: 'Learners observe, feel, and classify waxy vs. hairy leaves from the school compound using crayon rubbings.',
                    intro: 'Sensory mystery box with 3 distinct leaf textures. Learners feel without looking and describe.',
                    guided: 'Teacher demonstrates crayon leaf rubbing on textured cardstock with step-by-step pictorial cards.',
                    activity: 'Learners collect 2 leaves from garden and create crayon rubbings highlighting vein structures.',
                    wrapup: 'Display rubbings on the sensory classroom wall gallery. Peer review with sticker ratings.',
                    tier1: 'Pictorial step-by-step instructions displayed on front board with large graphics.',
                    tier2: 'Thick chunky triangle crayons and clipboard clamps for learners with fine motor challenges.',
                    tier3: 'Kenyan Sign Language (KSL) interpreter for leaf terminology; sensory partner assisting with rubbing pressure.',
                    materials: 'Fresh leaves, chunky crayons, paper clamps, sensory mystery box, KSL cards.',
                    reflection: 'Learners were deeply engaged by the sensory mystery box. Waxy leaves gave clearest rubbings.',
                    homework: 'Observe one plant at home and note whether its leaves feel smooth, rough, or waxy.',
                    contentHtml: '<h3>Sensory Leaf Rubbings & Texture Classification</h3><p>In this lesson, learners bridge tactile sensory exploration with CBC scientific observation methodologies.</p>',
                    notesHtml: '<p>Provide textured cardstock for low-vision learners to enhance crayon rubbing tactile relief.</p>',
                    resources: [
                      { id: 'res-s-1', name: 'Indigenous Kenyan Leaf Identification Chart.pdf', fileFormat: 'PDF', size: '2.1 MB', url: '#' },
                      { id: 'res-s-2', name: 'Sensory Garden Observation Sheet.pdf', fileFormat: 'PDF', size: '850 KB', url: '#' }
                    ],
                    assignment: {
                      id: 'asg-sci-1',
                      title: 'Sensory Leaf Rubbing & Adaptation Journal',
                      maxPoints: 20,
                      dueDate: '2026-09-25',
                      learnerInstructions: 'Create two leaf rubbings from plants in your environment. Label which leaf feels waxy/smooth and which feels hairy/rough. Submit a photo of your rubbings or bring your rubbing paper to class.',
                      submissionTypes: ['photo', 'document', 'observation'],
                      rubric: [
                        { id: 'rc-s1', criterion: 'Tactile Texture Identification', points: 8, description: 'Correctly distinguishes between smooth/waxy and rough/hairy leaf textures.' },
                        { id: 'rc-s2', criterion: 'Rubbing Detail & Vein Clarity', points: 6, description: 'Produces recognizable leaf vein impression demonstrating fine motor effort.' },
                        { id: 'rc-s3', criterion: 'Environmental Reflection', points: 6, description: 'Explains in words, signs, or drawing how waxy leaves save water.' }
                      ],
                      accommodations: 'Learners may dictate their reflection to a peer buddy or use KSL signs.'
                    },
                    quiz: {
                      id: 'quiz-sci-1',
                      title: 'Plant Leaf Adaptations Check',
                      description: 'Quick check on how leaves help plants survive and save water.',
                      passScorePercentage: 70,
                      questions: [
                        {
                          id: 'q-s-1',
                          type: 'multiple-choice',
                          questionText: 'Why do some desert and dryland plants like succulents have thick waxy leaves?',
                          options: ['To attract birds', 'To prevent water loss in hot weather', 'To make the leaves heavy', 'To change leaf color'],
                          correctIndex: 1,
                          hint: 'Think about how wax keeps water droplets from escaping.',
                          explanation: 'Correct! The waxy coating traps moisture inside the leaf, allowing the plant to survive dry spells.'
                        },
                        {
                          id: 'q-s-2',
                          type: 'pointing-match',
                          questionText: 'Point to the plant part that absorbs water from the soil:',
                          options: ['Flower 🌸', 'Roots 🌿 (Underground)', 'Stem 🎋', 'Leaf 🍃'],
                          correctIndex: 1,
                          hint: 'This part grows down deep inside the ground.',
                          explanation: 'Roots act like tiny straws that soak up water and nutrients from the soil for the whole plant.'
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ],
        resources: [
          { id: 'crs-res-3', name: 'Water Conservation in Primary Schools (KICD).pdf', fileFormat: 'PDF', size: '4.8 MB', url: '#' }
        ]
      },
      {
        id: 'crs-grade1-art',
        title: 'Grade 1: Expressive Arts, Movement & Multi-Sensory Play',
        code: 'ART-G1-EXPR',
        subject: 'Creative Arts',
        grade: 'Grade 1',
        term: 'Term 3',
        year: '2026',
        duration: '8 Weeks',
        educatorName: 'Teacher Grace Mwende',
        status: 'published',
        desc: 'Creative self-expression using natural dyes, safe tactile play-dough, rhythm sticks, and AAC feeling communication cards.',
        theme: 'amber',
        icon: '🎨',
        specialNeeds: ['speech-impairment', 'autism', 'down-syndrome', 'intellectual-disability'],
        competencies: ['Communication & Collaboration', 'Self-Efficacy', 'Imagination & Creativity'],
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: 'Creative Arts & Movement',
          subStrands: 'Picture Making & Rhythmic Play',
          outcomes: 'Learners express emotions and everyday experiences through clay modeling, natural vegetable stamping, and rhythm walks.',
          inquiryQuestions: 'How can we show our joy and excitement without using spoken words?',
          competencies: ['Imagination & Creativity', 'Communication', 'Self-Efficacy'],
          values: ['Unity', 'Love', 'Peace'],
          pcis: ['Mental Health & Well-being', 'Creative Expression'],
          learningExperiences: 'Potato and leaf stamping with beetroot and turmeric colors, percussion stick tapping.',
          assessmentExpectations: 'Process-oriented observation, learner pride reflection cards, photo documentation.'
        },
        units: [
          {
            id: 'unit-art-1',
            title: 'Unit 1: Natural Textures & Stamping',
            desc: 'Creating prints using indigenous non-toxic materials and tactile clay.',
            duration: '3 Weeks',
            topics: [
              {
                id: 'top-art-1-1',
                title: 'Topic 1.1: Stamping Patterns with Plant Stems',
                lessons: [
                  {
                    id: 'les-art-1',
                    lessonNumber: '1',
                    title: 'Lesson 1: Stamping Patterns with Banana Stems & Beetroot Dye',
                    duration: '35 mins',
                    date: '2026-09-24',
                    outcome: 'Learners create a repeating 2-color pattern on paper using banana stem cross-sections and natural plant dyes.',
                    intro: 'Rhythm song with body percussion (pat thighs, clap hands). Introduce color dye pots.',
                    guided: 'Teacher stamps a star pattern on large easel with positive encouragement cues.',
                    activity: 'Learners dip banana stem stamps into beetroot and turmeric dyes to create pattern borders.',
                    wrapup: 'Clean-up song. Learners place their artwork on the drying line with wooden pegs.',
                    tier1: 'Visual sequencing strip showing (Dip -> Press -> Lift -> Repeat).',
                    tier2: 'Easy-grip sponge handles attached to stamps for learners with motor grip challenges.',
                    tier3: '1-to-1 tactile modeling with shadow teacher; AAC visual choice board for color selection.',
                    materials: 'Banana stems, beetroot juice, turmeric water, heavy paper, visual strips, drying pegs.',
                    reflection: 'The natural dyes washed off hands easily and smelled pleasant. High joy engagement across all tiers.',
                    homework: 'Show your stamped pattern to family and tell them which plant made the circle shapes.',
                    contentHtml: '<h3>Stamping Patterns with Banana Stems & Beetroot Dye</h3><p>Inclusive creative expression that removes fine motor frustration while celebrating Kenyan indigenous materials.</p>',
                    notesHtml: '<p>Prepare dye bowls with wide bases to prevent spills. Ensure wet wipes are available nearby.</p>',
                    resources: [
                      { id: 'res-a-1', name: 'Safe Indigenous Dyes Recipe Guide.pdf', fileFormat: 'PDF', size: '750 KB', url: '#' }
                    ],
                    assignment: {
                      id: 'asg-art-1',
                      title: 'Repeating Pattern Stamping Artwork',
                      maxPoints: 15,
                      dueDate: '2026-09-28',
                      learnerInstructions: 'Create a repeating pattern with 2 different shapes or colors using natural stamps. Hang it up to dry and show your educator your favorite stamp imprint.',
                      submissionTypes: ['photo', 'observation'],
                      rubric: [
                        { id: 'rc-a1', criterion: 'Pattern Exploration', points: 6, description: 'Demonstrates repetition of colors or stamp shapes across paper.' },
                        { id: 'rc-a2', criterion: 'Sensory Participation', points: 5, description: 'Actively engages with tactile stamping materials and clean-up routine.' },
                        { id: 'rc-a3', criterion: 'Personal Expression', points: 4, description: 'Indicates pride in creation via smile, gesture, or AAC card.' }
                      ],
                      accommodations: 'Zero speech penalty. Observation rubric scored during class session.'
                    },
                    quiz: {
                      id: 'quiz-art-1',
                      title: 'Fun with Colors & Patterns Check',
                      description: 'Point or tap to choose the right answer about our stamping activity.',
                      passScorePercentage: 60,
                      questions: [
                        {
                          id: 'q-a-1',
                          type: 'pointing-match',
                          questionText: 'Which natural vegetable made the bright red dye for our stamps?',
                          options: ['Beetroot 🍠', 'Cucumber 🥒', 'Potato 🥔', 'Banana leaf 🌿'],
                          correctIndex: 0,
                          hint: 'It is a deep purple-red root vegetable.',
                          explanation: 'Beetroot produces the vibrant purple-red natural dye!'
                        },
                        {
                          id: 'q-a-2',
                          type: 'pointing-match',
                          questionText: 'What comes next in this pattern: Red Stamp, Yellow Stamp, Red Stamp, ______?',
                          options: ['Yellow Stamp 🟡', 'Blue Star 🔷', 'Green Circle 🟢', 'Black Line ⚫'],
                          correctIndex: 0,
                          hint: 'Notice the pattern: Red, Yellow, Red...',
                          explanation: 'Awesome pattern recognition! The Yellow stamp completes the ABAB pattern.'
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ],
        resources: [
          { id: 'crs-res-4', name: 'Creative Arts & Crafts for Special Needs (KICD).pdf', fileFormat: 'PDF', size: '5.2 MB', url: '#' }
        ]
      }
    ];
  }



  // ── 10.4 Course Normalization & Synchronization ──
  function syncCourseFlatLessons(course) {
    if (!course) return;
    const flat = [];
    if (Array.isArray(course.units)) {
      course.units.forEach(u => {
        if (Array.isArray(u.topics)) {
          u.topics.forEach(t => {
            if (Array.isArray(t.lessons)) {
              t.lessons.forEach(l => {
                flat.push({
                  ...l,
                  unitTitle: u.title,
                  topicTitle: t.title
                });
              });
            }
          });
        }
      });
    }
    course.lessons = flat;
  }

  function loadCourses() {
    try {
      const stored = localStorage.getItem(COURSES_STORAGE_KEY);
      if (stored) {
        activeCourses = JSON.parse(stored);
      } else {
        activeCourses = getDefaultExemplarCourses();
        saveCourses(activeCourses);
      }
    } catch (e) {
      console.warn('Could not load courses from localStorage:', e);
      activeCourses = getDefaultExemplarCourses();
    }
    activeCourses.forEach(c => syncCourseFlatLessons(c));
    return activeCourses;
  }

  function saveCourses(courses) {
    activeCourses = courses || [];
    activeCourses.forEach(c => syncCourseFlatLessons(c));
    try {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(activeCourses));
    } catch (e) {
      console.warn('Could not save courses to localStorage:', e);
    }
  }

  function updateStudioStats() {
    let totalCourses = activeCourses.length;
    let totalLessons = 0;
    let totalAttachments = 0;

    activeCourses.forEach(c => {
      syncCourseFlatLessons(c);
      totalLessons += (c.lessons || []).length;
      totalAttachments += (c.resources || []).length;
      if (Array.isArray(c.units)) {
        c.units.forEach(u => {
          if (Array.isArray(u.topics)) {
            u.topics.forEach(t => {
              if (Array.isArray(t.lessons)) {
                t.lessons.forEach(l => {
                  if (Array.isArray(l.resources)) totalAttachments += l.resources.length;
                });
              }
            });
          }
        });
      }
    });

    const coursesEl = document.getElementById('jum-stat-courses-count');
    const lessonsEl = document.getElementById('jum-stat-lessons-count');
    const attachEl = document.getElementById('jum-stat-attachments-count');
    const tabCoursesEl = document.getElementById('jum-tab-count-courses');
    const tabTplEl = document.getElementById('jum-tab-count-templates');

    if (coursesEl) coursesEl.textContent = totalCourses;
    if (lessonsEl) lessonsEl.textContent = totalLessons;
    if (attachEl) attachEl.textContent = totalAttachments;
    if (tabCoursesEl) tabCoursesEl.textContent = totalCourses;
    if (tabTplEl) tabTplEl.textContent = getDefaultCourseTemplates().length + customTemplates.length;
  }

  function renderCoursesGrid() {
    const container = document.getElementById('jum-course-cards-container');
    const emptyState = document.getElementById('jum-course-empty-state');
    if (!container) return;

    const searchInput = document.getElementById('jum-course-search');
    const gradeFilter = document.getElementById('jum-course-filter-grade');
    const needFilter = document.getElementById('jum-course-filter-need');

    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const gradeVal = gradeFilter ? gradeFilter.value : 'all';
    const needVal = needFilter ? needFilter.value : 'all';

    const filtered = activeCourses.filter(c => {
      if (searchVal) {
        const matchTitle = (c.title || '').toLowerCase().includes(searchVal);
        const matchDesc = (c.desc || '').toLowerCase().includes(searchVal);
        const matchSubj = (c.subject || '').toLowerCase().includes(searchVal);
        const matchCode = (c.code || '').toLowerCase().includes(searchVal);
        if (!matchTitle && !matchDesc && !matchSubj && !matchCode) return false;
      }
      if (gradeVal !== 'all' && c.grade !== gradeVal) return false;
      if (needVal !== 'all' && Array.isArray(c.specialNeeds) && !c.specialNeeds.includes(needVal)) return false;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = filtered.map(course => {
      syncCourseFlatLessons(course);
      const lessonCount = (course.lessons || []).length;
      const resCount = (course.resources || []).length;
      const themeClass = course.theme ? 'theme-' + course.theme : 'theme-default';
      const isArchived = course.status === 'archived';

      const needsTags = (course.specialNeeds || []).map(n => `
        <span class="jum-course-need-tag">${escapeHtml(n.replace('-', ' '))}</span>
      `).join('');

      return `
        <div class="jum-course-card ${themeClass} ${isArchived ? 'archived' : ''}" data-course-id="${escapeHtml(course.id)}">
          <div class="jum-card-top-bar">
            <div class="jum-card-identity">
              <span class="jum-card-icon">${course.icon || '📚'}</span>
              <div>
                <span class="jum-card-code">${escapeHtml(course.code || 'CRS')}</span>
                <span class="jum-card-status ${course.status || 'draft'}">${course.status === 'published' ? 'Published' : (isArchived ? 'Archived' : 'Draft')}</span>
              </div>
            </div>
            <div class="jum-card-actions-menu">
              <button class="jum-btn-card-menu" aria-label="Course Options for ${escapeHtml(course.title)}" data-action="toggle-card-menu">⋮</button>
              <div class="jum-card-dropdown" style="display:none;">
                <button data-action="edit-course" data-course-id="${course.id}">✏️ Edit Course</button>
                <button data-action="view-lessons" data-course-id="${course.id}">📖 Course Lessons (${lessonCount})</button>
                <button data-action="preview-course" data-course-id="${course.id}">👁️ Learner Preview</button>
                <button data-action="manage-resources" data-course-id="${course.id}">📎 Course Materials (${resCount})</button>
                <button data-action="duplicate-course" data-course-id="${course.id}">📋 Duplicate Course</button>
                <button data-action="save-template" data-course-id="${course.id}">💾 Save as Template</button>
                <button data-action="toggle-archive" data-course-id="${course.id}">${isArchived ? '📂 Unarchive' : '📦 Archive'}</button>
                <div class="jum-dropdown-divider"></div>
                <button data-action="delete-course" data-course-id="${course.id}" class="jum-dropdown-danger">🗑️ Delete Course</button>
              </div>
            </div>
          </div>

          <h3 class="jum-course-card-title">${escapeHtml(course.title)}</h3>
          <p class="jum-course-card-desc">${escapeHtml(course.desc || 'Inclusive curriculum course.')}</p>

          <div class="jum-course-card-meta">
            <span>📚 ${escapeHtml(course.subject || 'General')}</span>
            <span>🎓 ${escapeHtml(course.grade || 'All')}</span>
            <span>⏱️ ${escapeHtml(course.duration || 'Term 1')}</span>
          </div>

          <div class="jum-course-card-needs">
            ${needsTags}
          </div>

          <div class="jum-card-footer">
            <div class="jum-card-quick-stats">
              <span>📖 ${lessonCount} Lessons</span>
              <span>📎 ${resCount} Materials</span>
            </div>
            <div class="jum-card-primary-btns">
              <button class="jum-btn-card-secondary" data-action="view-lessons" data-course-id="${course.id}">Lessons</button>
              <button class="jum-btn-card-primary" data-action="edit-course" data-course-id="${course.id}">Open Studio</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach card event listeners
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const courseId = btn.getAttribute('data-course-id');

        if (action === 'toggle-card-menu') {
          const menu = btn.nextElementSibling;
          const isShown = menu && menu.style.display === 'block';
          closeAllDropdownMenus();
          if (menu && !isShown) menu.style.display = 'block';
        } else if (action === 'edit-course') {
          closeAllDropdownMenus();
          openCourseWizard('edit', courseId);
        } else if (action === 'view-lessons') {
          closeAllDropdownMenus();
          openCourseLessonsViewer(courseId);
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
        } else if (action === 'toggle-archive') {
          closeAllDropdownMenus();
          toggleArchiveCourse(courseId);
        } else if (action === 'delete-course') {
          closeAllDropdownMenus();
          confirmDeleteCourse(courseId);
        }
      });
    });

    updateStudioStats();
  }

  function closeAllDropdownMenus() {
    document.querySelectorAll('.jum-card-dropdown').forEach(d => d.style.display = 'none');
    const createMenu = document.getElementById('jum-menu-create-course');
    const tplMenu = document.getElementById('jum-menu-templates');
    if (createMenu) createMenu.style.display = 'none';
    if (tplMenu) tplMenu.style.display = 'none';
  }

  // ── 10.5 Choose Template Modal ──
  function openChooseTemplateModal() {
    const modal = document.getElementById('jum-modal-choose-template');
    if (!modal) return;
    const defGrid = document.getElementById('jum-default-templates-grid');
    const usrSection = document.getElementById('jum-user-templates-section');
    const usrGrid = document.getElementById('jum-user-templates-grid');

    const defaultTemplates = getDefaultCourseTemplates();
    loadCustomTemplates();

    if (defGrid) {
      defGrid.innerHTML = defaultTemplates.map(t => `
        <div class="jum-tpl-card ${t.theme ? 'theme-' + t.theme : ''}">
          <div class="jum-tpl-icon">${t.icon || '📋'}</div>
          <div class="jum-tpl-badge">${escapeHtml(t.badge || 'Template')}</div>
          <h4 class="jum-tpl-title">${escapeHtml(t.name)}</h4>
          <p class="jum-tpl-sub">${escapeHtml(t.sub || '')}</p>
          <p class="jum-tpl-desc">${escapeHtml(t.desc)}</p>
          <ul class="jum-tpl-features">
            ${(t.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}
          </ul>
          <button class="jum-btn-use-tpl" data-action="use-template" data-template-id="${t.id}">Use LMS Model &rarr;</button>
        </div>
      `).join('');
    }

    if (usrSection && usrGrid) {
      if (customTemplates.length > 0) {
        usrSection.style.display = 'block';
        usrGrid.innerHTML = customTemplates.map(t => `
          <div class="jum-tpl-card theme-default">
            <div class="jum-tpl-icon">📋</div>
            <div class="jum-tpl-badge">Custom Template</div>
            <h4 class="jum-tpl-title">${escapeHtml(t.name)}</h4>
            <p class="jum-tpl-sub">${escapeHtml(t.grade || '')} ${escapeHtml(t.subject ? '• ' + t.subject : '')}</p>
            <p class="jum-tpl-desc">${escapeHtml(t.desc || 'Custom educator template.')}</p>
            <div style="display:flex;gap:8px;margin-top:12px;">
              <button class="jum-btn-use-tpl" style="flex:1;" data-action="use-template" data-template-id="${t.id}">Use Template &rarr;</button>
              <button class="jum-btn-card-menu" style="padding:6px 10px;border-radius:8px;" data-action="delete-custom-tpl" data-template-id="${t.id}" title="Delete Template">🗑️</button>
            </div>
          </div>
        `).join('');
      } else {
        usrSection.style.display = 'none';
      }
    }

    // Attach listeners
    modal.querySelectorAll('[data-action="use-template"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-template-id');
        closeChooseTemplateModal();
        startCourseFromTemplate(tId);
      });
    });
    modal.querySelectorAll('[data-action="delete-custom-tpl"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-template-id');
        deleteCustomTemplate(tId);
        openChooseTemplateModal();
      });
    });

    modal.classList.add('active');
    announceToScreenReader('Choose course template modal opened');
  }

  function closeChooseTemplateModal() {
    const modal = document.getElementById('jum-modal-choose-template');
    if (modal) modal.classList.remove('active');
  }

  function startCourseFromTemplate(templateId) {
    let tpl = getDefaultCourseTemplates().find(t => t.id === templateId);
    if (!tpl) {
      tpl = customTemplates.find(t => t.id === templateId);
    }
    if (!tpl) {
      openCourseWizard('create');
      return;
    }

    const newCourse = JSON.parse(JSON.stringify(tpl));
    newCourse.id = 'crs-' + Date.now();
    newCourse.title = (tpl.name || 'New Course') + ' (Copy)';
    newCourse.code = (tpl.subject ? tpl.subject.substring(0, 4).toUpperCase() : 'CRS') + '-' + Math.floor(100 + Math.random() * 900);
    newCourse.status = 'draft';
    newCourse.educatorName = 'Educator';
    newCourse.createdAt = new Date().toISOString();

    openCourseWizard('template', newCourse);
  }

  // ── 10.6 Course Creation & Edit Wizard Engine ──
  function openCourseWizard(mode, courseOrId, templateId) {
    wizardCurrentStep = 1;
    hasUnsavedChanges = false;

    if (mode === 'create') {
      wizardCourse = {
        id: 'crs-' + Date.now(),
        title: '',
        code: 'INCL-' + Math.floor(100 + Math.random() * 900),
        subject: 'Mathematics',
        grade: 'Grade 2',
        term: 'Term 1',
        year: '2026',
        duration: '10 Weeks',
        educatorName: 'Educator',
        status: 'draft',
        desc: '',
        theme: 'default',
        icon: '📚',
        specialNeeds: ['autism', 'dyscalculia'],
        curriculum: {
          framework: 'Kenyan CBC (KICD Aligned)',
          strands: '',
          subStrands: '',
          outcomes: '',
          inquiryQuestions: '',
          competencies: ['Critical Thinking', 'Communication'],
          values: ['Respect', 'Unity'],
          pcis: ['Inclusion of Special Needs'],
          learningExperiences: '',
          assessmentExpectations: ''
        },
        units: [
          {
            id: 'unit-' + Date.now(),
            title: 'Unit 1: Introduction & Foundations',
            desc: 'Initial unit exploring core concepts.',
            duration: '3 Weeks',
            topics: [
              {
                id: 'top-' + Date.now(),
                title: 'Topic 1.1: Core Concepts & Concrete Exploration',
                lessons: [
                  {
                    id: 'les-' + Date.now(),
                    lessonNumber: '1',
                    title: 'Lesson 1: Foundational Concrete Activity',
                    duration: '35 mins',
                    date: '',
                    outcome: 'Learners demonstrate initial concept mastery through concrete manipulatives.',
                    intro: 'Welcome and multisensory warm-up.',
                    guided: 'Teacher modeling with concrete realia.',
                    activity: 'Tiered practical activity in small groups.',
                    wrapup: 'Positive learner reflection and clean-up.',
                    tier1: 'Visual timer and clear visual supports.',
                    tier2: 'Tactile guides and peer buddy collaboration.',
                    tier3: '1-to-1 support and communication cards.',
                    materials: 'Concrete counters, flashcards, visual timetable.',
                    reflection: '',
                    homework: '',
                    contentHtml: '<p>Compose rich lesson notes and instructions here.</p>',
                    notesHtml: '<p>Teacher reflection and preparation notes.</p>',
                    resources: [],
                    assignment: {
                      id: 'asg-' + Date.now(),
                      title: 'Practical Hands-on Demonstration',
                      maxPoints: 10,
                      dueDate: '',
                      learnerInstructions: 'Complete the hands-on activity using concrete materials and submit a photo or observation record.',
                      submissionTypes: ['photo', 'observation'],
                      rubric: [
                        { id: 'rc-1', criterion: 'Concrete Accuracy', points: 6, description: 'Demonstrates accurate execution using manipulatives.' },
                        { id: 'rc-2', criterion: 'Effort & Participation', points: 4, description: 'Actively participates with positive attitude.' }
                      ],
                      accommodations: 'Zero speech penalty.'
                    },
                    quiz: {
                      id: 'quiz-' + Date.now(),
                      title: 'Check for Understanding',
                      description: 'Test your understanding of Lesson 1.',
                      passScorePercentage: 70,
                      questions: [
                        {
                          id: 'q-1',
                          type: 'multiple-choice',
                          questionText: 'What is the main idea of this lesson?',
                          options: ['Learning through practice', 'Skipping steps', 'Doing nothing', 'Memorizing blindly'],
                          correctIndex: 0,
                          hint: 'Think about our hands-on activity.',
                          explanation: 'Correct! Learning through hands-on practice helps us build confidence.'
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ],
        resources: []
      };
    } else if (mode === 'template' && typeof courseOrId === 'object') {
      wizardCourse = JSON.parse(JSON.stringify(courseOrId));
    } else if (mode === 'edit') {
      const found = activeCourses.find(c => c.id === courseOrId);
      if (found) {
        wizardCourse = JSON.parse(JSON.stringify(found));
      } else {
        openCourseWizard('create');
        return;
      }
    }

    syncCourseFlatLessons(wizardCourse);

    const modal = document.getElementById('jum-modal-course-wizard');
    const titleText = document.getElementById('jum-wizard-title-text');
    const titleIcon = document.getElementById('jum-wizard-title-icon');
    const statusBadge = document.getElementById('jum-wizard-status-badge');

    if (titleText) titleText.textContent = wizardCourse.title || (mode === 'edit' ? 'Edit Course' : 'Create New Course');
    if (titleIcon) titleIcon.textContent = wizardCourse.icon || '📚';
    if (statusBadge) {
      statusBadge.textContent = wizardCourse.status === 'published' ? 'Published' : 'Draft';
      statusBadge.className = 'jum-wizard-status ' + (wizardCourse.status || 'draft');
    }

    goToWizardStep(1);
    if (modal) modal.classList.add('active');
    announceToScreenReader('Course creation wizard opened');
  }

  function closeCourseWizard() {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes in this course. Do you want to save your draft before exiting?')) {
        const modal = document.getElementById('jum-modal-course-wizard');
        if (modal) modal.classList.remove('active');
        clearInterval(wizardAutoSaveTimer);
        return;
      }
      saveWizardCourse(false);
    }
    const modal = document.getElementById('jum-modal-course-wizard');
    if (modal) modal.classList.remove('active');
    clearInterval(wizardAutoSaveTimer);
  }

  function updateAutoSaveStatus(status) {
    const textEl = document.getElementById('jum-wizard-autosave-text');
    if (!textEl) return;
    if (status === 'saving') {
      textEl.textContent = 'Saving draft...';
      textEl.style.color = '#F59E0B';
    } else if (status === 'saved') {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      textEl.textContent = 'Draft auto-saved at ' + timeStr;
      textEl.style.color = '#10B981';
      hasUnsavedChanges = false;
    } else if (status === 'modified') {
      textEl.textContent = 'Unsaved changes';
      textEl.style.color = '#EF4444';
      hasUnsavedChanges = true;
    }
  }

  function triggerWizardAutoSave() {
    updateAutoSaveStatus('saving');
    readWizardStep1();
    readWizardStep2();
    if (wizardCurrentStep === 4) {
      readWizardStep4();
    }
    syncCourseFlatLessons(wizardCourse);

    const idx = activeCourses.findIndex(c => c.id === wizardCourse.id);
    if (idx !== -1) {
      activeCourses[idx] = JSON.parse(JSON.stringify(wizardCourse));
    } else {
      activeCourses.unshift(JSON.parse(JSON.stringify(wizardCourse)));
    }
    saveCourses(activeCourses);

    setTimeout(() => {
      updateAutoSaveStatus('saved');
      renderCoursesGrid();
    }, 400);
  }

  function saveWizardCourse(markPublished) {
    readWizardStep1();
    readWizardStep2();
    readWizardStep4();
    syncCourseFlatLessons(wizardCourse);

    if (markPublished) {
      wizardCourse.status = 'published';
    }

    const idx = activeCourses.findIndex(c => c.id === wizardCourse.id);
    if (idx !== -1) {
      activeCourses[idx] = JSON.parse(JSON.stringify(wizardCourse));
    } else {
      activeCourses.unshift(JSON.parse(JSON.stringify(wizardCourse)));
    }
    saveCourses(activeCourses);
    renderCoursesGrid();
    updateStudioStats();

    hasUnsavedChanges = false;
    announceToScreenReader('Course saved successfully as ' + (wizardCourse.status || 'draft'));
  }

  function publishWizardCourse() {
    if (!wizardCourse.title || !wizardCourse.title.trim()) {
      alert('Please provide a course title in Step 1 before publishing.');
      goToWizardStep(1);
      return;
    }
    saveWizardCourse(true);
    closeCourseWizard();
    alert('🎉 Course published successfully! It is now live in your Inclusive Teaching Curriculum.');
  }

  function goToWizardStep(stepNum) {
    if (wizardCurrentStep === 1) readWizardStep1();
    if (wizardCurrentStep === 2) readWizardStep2();
    if (wizardCurrentStep === 4) readWizardStep4();

    wizardCurrentStep = stepNum;

    // Update Step Indicators
    for (let i = 1; i <= 4; i++) {
      const btn = document.getElementById('jum-step-btn-' + i);
      const panel = document.getElementById('jum-wizard-panel-' + i);
      if (btn) {
        if (i === stepNum) {
          btn.classList.add('active');
          btn.classList.remove('completed');
          btn.setAttribute('aria-selected', 'true');
        } else if (i < stepNum) {
          btn.classList.remove('active');
          btn.classList.add('completed');
          btn.setAttribute('aria-selected', 'false');
        } else {
          btn.classList.remove('active', 'completed');
          btn.setAttribute('aria-selected', 'false');
        }
      }
      if (panel) {
        panel.style.display = i === stepNum ? 'block' : 'none';
      }
    }

    // Populate current step
    if (stepNum === 1) populateWizardStep1();
    if (stepNum === 2) populateWizardStep2();
    if (stepNum === 3) renderHierarchyTree();
    if (stepNum === 4) populateWizardStep4();

    const prevBtn = document.getElementById('jum-btn-wizard-prev');
    const nextBtn = document.getElementById('jum-btn-wizard-next');
    if (prevBtn) prevBtn.disabled = stepNum === 1;
    if (nextBtn) {
      if (stepNum === 4) {
        nextBtn.textContent = 'Save & Finish';
        nextBtn.className = 'jum-btn-wizard-primary';
      } else {
        nextBtn.textContent = 'Next Step &rarr;';
        nextBtn.className = 'jum-btn-wizard-primary';
      }
    }
  }

  function nextWizardStep() {
    if (wizardCurrentStep < 4) {
      goToWizardStep(wizardCurrentStep + 1);
    } else {
      saveWizardCourse(false);
      closeCourseWizard();
    }
  }

  function prevWizardStep() {
    if (wizardCurrentStep > 1) {
      goToWizardStep(wizardCurrentStep - 1);
    }
  }

  // ── Step 1 Helpers ──
  function populateWizardStep1() {
    if (!wizardCourse) return;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('jum-wiz-title', wizardCourse.title);
    setVal('jum-wiz-code', wizardCourse.code);
    setVal('jum-wiz-subject', wizardCourse.subject);
    setVal('jum-wiz-grade', wizardCourse.grade);
    setVal('jum-wiz-term', wizardCourse.term);
    setVal('jum-wiz-year', wizardCourse.year);
    setVal('jum-wiz-duration', wizardCourse.duration);
    setVal('jum-wiz-educator', wizardCourse.educatorName);
    setVal('jum-wiz-status', wizardCourse.status);
    setVal('jum-wiz-desc', wizardCourse.desc);
    setVal('jum-wiz-theme', wizardCourse.theme);
    setVal('jum-wiz-icon', wizardCourse.icon);

    const checkboxes = document.querySelectorAll('#jum-wiz-needs-checkboxes input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = Array.isArray(wizardCourse.specialNeeds) && wizardCourse.specialNeeds.includes(cb.value);
    });
  }

  function readWizardStep1() {
    if (!wizardCourse) return;
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

    wizardCourse.title = getVal('jum-wiz-title') || 'Untitled Course';
    wizardCourse.code = getVal('jum-wiz-code');
    wizardCourse.subject = getVal('jum-wiz-subject');
    wizardCourse.grade = getVal('jum-wiz-grade');
    wizardCourse.term = getVal('jum-wiz-term');
    wizardCourse.year = getVal('jum-wiz-year');
    wizardCourse.duration = getVal('jum-wiz-duration');
    wizardCourse.educatorName = getVal('jum-wiz-educator');
    wizardCourse.status = getVal('jum-wiz-status') || 'draft';
    wizardCourse.desc = getVal('jum-wiz-desc');
    wizardCourse.theme = getVal('jum-wiz-theme') || 'default';
    wizardCourse.icon = getVal('jum-wiz-icon') || '📚';

    const selectedNeeds = [];
    document.querySelectorAll('#jum-wiz-needs-checkboxes input[type="checkbox"]:checked').forEach(cb => {
      selectedNeeds.push(cb.value);
    });
    wizardCourse.specialNeeds = selectedNeeds;

    const modalTitle = document.getElementById('jum-wizard-title-text');
    if (modalTitle) modalTitle.textContent = wizardCourse.title;
  }

  // ── Step 2 Helpers ──
  function populateWizardStep2() {
    if (!wizardCourse) return;
    const cur = wizardCourse.curriculum || {};
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('jum-wiz-framework', cur.framework || 'Kenyan CBC (KICD Aligned)');
    setVal('jum-wiz-strands', cur.strands);
    setVal('jum-wiz-substrands', cur.subStrands);
    setVal('jum-wiz-outcomes', cur.outcomes);
    setVal('jum-wiz-inquiry', cur.inquiryQuestions);
    setVal('jum-wiz-experiences', cur.learningExperiences);
    setVal('jum-wiz-assessments', cur.assessmentExpectations);

    const compBoxes = document.querySelectorAll('#jum-wiz-competencies-grid input[type="checkbox"]');
    compBoxes.forEach(cb => {
      cb.checked = Array.isArray(cur.competencies) && cur.competencies.includes(cb.value);
    });
    const valBoxes = document.querySelectorAll('#jum-wiz-values-grid input[type="checkbox"]');
    valBoxes.forEach(cb => {
      cb.checked = Array.isArray(cur.values) && cur.values.includes(cb.value);
    });
    const pciBoxes = document.querySelectorAll('#jum-wiz-pcis-grid input[type="checkbox"]');
    pciBoxes.forEach(cb => {
      cb.checked = Array.isArray(cur.pcis) && cur.pcis.includes(cb.value);
    });
  }

  function readWizardStep2() {
    if (!wizardCourse) return;
    if (!wizardCourse.curriculum) wizardCourse.curriculum = {};
    const cur = wizardCourse.curriculum;
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

    cur.framework = getVal('jum-wiz-framework');
    cur.strands = getVal('jum-wiz-strands');
    cur.subStrands = getVal('jum-wiz-substrands');
    cur.outcomes = getVal('jum-wiz-outcomes');
    cur.inquiryQuestions = getVal('jum-wiz-inquiry');
    cur.learningExperiences = getVal('jum-wiz-experiences');
    cur.assessmentExpectations = getVal('jum-wiz-assessments');

    const comps = [];
    document.querySelectorAll('#jum-wiz-competencies-grid input[type="checkbox"]:checked').forEach(cb => comps.push(cb.value));
    cur.competencies = comps;

    const vals = [];
    document.querySelectorAll('#jum-wiz-values-grid input[type="checkbox"]:checked').forEach(cb => vals.push(cb.value));
    cur.values = vals;

    const pcis = [];
    document.querySelectorAll('#jum-wiz-pcis-grid input[type="checkbox"]:checked').forEach(cb => pcis.push(cb.value));
    cur.pcis = pcis;
  }

  // ── Step 3: Hierarchy Tree Helpers ──
  function renderHierarchyTree() {
    const container = document.getElementById('jum-hierarchy-tree-container');
    if (!container || !wizardCourse) return;

    if (!Array.isArray(wizardCourse.units) || wizardCourse.units.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:30px;background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:12px;">
          <p style="font-size:14px;color:#64748B;margin-bottom:12px;">No curriculum units yet. Click below to add your first syllabus unit!</p>
          <button type="button" class="jum-btn-wizard-primary" id="jum-btn-tree-add-unit-empty">+ Add Unit 1</button>
        </div>
      `;
      const btn = document.getElementById('jum-btn-tree-add-unit-empty');
      if (btn) btn.addEventListener('click', addWizardUnit);
      return;
    }

    container.innerHTML = wizardCourse.units.map((unit, uIdx) => {
      const topics = unit.topics || [];
      const topicsHtml = topics.map((topic, tIdx) => {
        const lessons = topic.lessons || [];
        const lessonsHtml = lessons.map((lesson, lIdx) => `
          <div class="jum-tree-lesson-node" data-lesson-id="${lesson.id}">
            <div class="jum-tree-node-header">
              <span class="jum-tree-drag-handle">⠿</span>
              <span class="jum-tree-badge lesson">L${lesson.lessonNumber || (lIdx + 1)}</span>
              <input type="text" class="jum-tree-input lesson" value="${escapeHtml(lesson.title)}" data-node="lesson-title" data-unit="${uIdx}" data-topic="${tIdx}" data-lesson="${lIdx}" placeholder="Lesson title...">
              <input type="text" class="jum-tree-input-small" value="${escapeHtml(lesson.duration || '35 mins')}" data-node="lesson-duration" data-unit="${uIdx}" data-topic="${tIdx}" data-lesson="${lIdx}" placeholder="Duration" style="max-width:80px;">
              <div class="jum-tree-actions">
                <button type="button" class="jum-btn-tree-act" data-action="edit-lesson-p4" data-lesson-id="${lesson.id}" title="Edit LMS Notes, Materials & Quiz">📝 LMS Modules</button>
                <button type="button" class="jum-btn-tree-act" data-action="dup-lesson" data-unit="${uIdx}" data-topic="${tIdx}" data-lesson="${lIdx}" title="Duplicate Lesson">📋</button>
                <button type="button" class="jum-btn-tree-act danger" data-action="del-lesson" data-unit="${uIdx}" data-topic="${tIdx}" data-lesson="${lIdx}" title="Delete Lesson">🗑️</button>
              </div>
            </div>
          </div>
        `).join('');

        return `
          <div class="jum-tree-topic-node" data-topic-id="${topic.id}">
            <div class="jum-tree-node-header">
              <span class="jum-tree-drag-handle">⠿</span>
              <span class="jum-tree-badge topic">Topic ${uIdx + 1}.${tIdx + 1}</span>
              <input type="text" class="jum-tree-input topic" value="${escapeHtml(topic.title)}" data-node="topic-title" data-unit="${uIdx}" data-topic="${tIdx}" placeholder="Topic title...">
              <div class="jum-tree-actions">
                <button type="button" class="jum-btn-tree-act" data-action="add-lesson" data-unit="${uIdx}" data-topic="${tIdx}">+ Add Lesson</button>
                <button type="button" class="jum-btn-tree-act danger" data-action="del-topic" data-unit="${uIdx}" data-topic="${tIdx}" title="Delete Topic">🗑️</button>
              </div>
            </div>
            <div class="jum-tree-lessons-group">
              ${lessonsHtml}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="jum-tree-unit-node" data-unit-id="${unit.id}">
          <div class="jum-tree-node-header unit">
            <span class="jum-tree-drag-handle">⠿</span>
            <span class="jum-tree-badge unit">Unit ${uIdx + 1}</span>
            <input type="text" class="jum-tree-input unit" value="${escapeHtml(unit.title)}" data-node="unit-title" data-unit="${uIdx}" placeholder="Unit title...">
            <input type="text" class="jum-tree-input-small" value="${escapeHtml(unit.duration || '3 Weeks')}" data-node="unit-duration" data-unit="${uIdx}" placeholder="Duration" style="max-width:100px;">
            <div class="jum-tree-actions">
              <button type="button" class="jum-btn-tree-act" data-action="add-topic" data-unit="${uIdx}">+ Add Topic</button>
              <button type="button" class="jum-btn-tree-act danger" data-action="del-unit" data-unit="${uIdx}" title="Delete Unit">🗑️</button>
            </div>
          </div>
          <div class="jum-tree-topics-group">
            ${topicsHtml}
          </div>
        </div>
      `;
    }).join('');

    attachHierarchyTreeListeners();
  }

  function attachHierarchyTreeListeners() {
    const container = document.getElementById('jum-hierarchy-tree-container');
    if (!container) return;

    container.querySelectorAll('input[data-node]').forEach(input => {
      input.addEventListener('input', () => {
        handleTreeInputChange(input);
      });
    });

    container.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleTreeActionClick(btn);
      });
    });
  }

  function handleTreeInputChange(input) {
    const nodeType = input.getAttribute('data-node');
    const uIdx = parseInt(input.getAttribute('data-unit'), 10);
    const tIdx = parseInt(input.getAttribute('data-topic'), 10);
    const lIdx = parseInt(input.getAttribute('data-lesson'), 10);
    const val = input.value;

    if (!wizardCourse || !wizardCourse.units) return;

    if (nodeType === 'unit-title' && wizardCourse.units[uIdx]) {
      wizardCourse.units[uIdx].title = val;
    } else if (nodeType === 'unit-duration' && wizardCourse.units[uIdx]) {
      wizardCourse.units[uIdx].duration = val;
    } else if (nodeType === 'topic-title' && wizardCourse.units[uIdx]?.topics[tIdx]) {
      wizardCourse.units[uIdx].topics[tIdx].title = val;
    } else if (nodeType === 'lesson-title' && wizardCourse.units[uIdx]?.topics[tIdx]?.lessons[lIdx]) {
      wizardCourse.units[uIdx].topics[tIdx].lessons[lIdx].title = val;
    } else if (nodeType === 'lesson-duration' && wizardCourse.units[uIdx]?.topics[tIdx]?.lessons[lIdx]) {
      wizardCourse.units[uIdx].topics[tIdx].lessons[lIdx].duration = val;
    }

    updateAutoSaveStatus('modified');
  }

  function handleTreeActionClick(btn) {
    const action = btn.getAttribute('data-action');
    const uIdx = parseInt(btn.getAttribute('data-unit'), 10);
    const tIdx = parseInt(btn.getAttribute('data-topic'), 10);
    const lIdx = parseInt(btn.getAttribute('data-lesson'), 10);

    if (action === 'add-topic') {
      if (wizardCourse.units[uIdx]) {
        if (!wizardCourse.units[uIdx].topics) wizardCourse.units[uIdx].topics = [];
        const topNum = wizardCourse.units[uIdx].topics.length + 1;
        wizardCourse.units[uIdx].topics.push({
          id: 'top-' + Date.now(),
          title: `Topic ${uIdx + 1}.${topNum}: New Inquiry Focus`,
          lessons: []
        });
        renderHierarchyTree();
        updateAutoSaveStatus('modified');
      }
    } else if (action === 'del-unit') {
      if (confirm('Delete this Unit and all its topics and lessons?')) {
        wizardCourse.units.splice(uIdx, 1);
        renderHierarchyTree();
        updateAutoSaveStatus('modified');
      }
    } else if (action === 'del-topic') {
      if (confirm('Delete this topic and its lessons?')) {
        wizardCourse.units[uIdx].topics.splice(tIdx, 1);
        renderHierarchyTree();
        updateAutoSaveStatus('modified');
      }
    } else if (action === 'add-lesson') {
      const top = wizardCourse.units[uIdx]?.topics[tIdx];
      if (top) {
        if (!top.lessons) top.lessons = [];
        const lesNum = top.lessons.length + 1;
        top.lessons.push({
          id: 'les-' + Date.now(),
          lessonNumber: String(lesNum),
          title: `Lesson ${lesNum}: New Inclusive Activity`,
          duration: '35 mins',
          outcome: 'Learners demonstrate mastery of topic learning outcomes.',
          contentHtml: '<p>Compose formatted lesson notes here.</p>',
          notesHtml: '<p>Teacher preparation notes.</p>',
          tier1: 'Universal visual aids.',
          tier2: 'Targeted tactile supports.',
          tier3: '1-to-1 guided practice.',
          resources: [],
          assignment: {
            id: 'asg-' + Date.now(),
            title: 'Activity Assignment',
            maxPoints: 10,
            dueDate: '',
            learnerInstructions: 'Complete the activity and submit evidence of learning.',
            submissionTypes: ['photo', 'observation'],
            rubric: [
              { id: 'rc-1', criterion: 'Activity Execution', points: 6, description: 'Completes activity steps accurately.' },
              { id: 'rc-2', criterion: 'Participation', points: 4, description: 'Shows active effort.' }
            ],
            accommodations: 'Zero speech penalty.'
          },
          quiz: {
            id: 'quiz-' + Date.now(),
            title: 'Lesson Check Quiz',
            description: 'Check understanding of lesson concepts.',
            passScorePercentage: 70,
            questions: [
              {
                id: 'q-1',
                type: 'multiple-choice',
                questionText: 'What did we learn in this lesson?',
                options: ['Practical skill concept', 'Nothing', 'Unrelated topic', 'Random guessing'],
                correctIndex: 0,
                hint: 'Reflect on today’s hands-on work.',
                explanation: 'Correct! Hands-on practice reinforces core competencies.'
              }
            ]
          }
        });
        renderHierarchyTree();
        updateAutoSaveStatus('modified');
      }
    } else if (action === 'del-lesson') {
      if (confirm('Delete this lesson?')) {
        wizardCourse.units[uIdx].topics[tIdx].lessons.splice(lIdx, 1);
        renderHierarchyTree();
        updateAutoSaveStatus('modified');
      }
    } else if (action === 'dup-lesson') {
      const orig = wizardCourse.units[uIdx]?.topics[tIdx]?.lessons[lIdx];
      if (orig) {
        const copy = JSON.parse(JSON.stringify(orig));
        copy.id = 'les-' + Date.now();
        copy.title = orig.title + ' (Copy)';
        wizardCourse.units[uIdx].topics[tIdx].lessons.splice(lIdx + 1, 0, copy);
        renderHierarchyTree();
        updateAutoSaveStatus('modified');
      }
    } else if (action === 'edit-lesson-p4') {
      const lId = btn.getAttribute('data-lesson-id');
      activeEditorLessonId = lId;
      goToWizardStep(4);
    }
  }

  function addWizardUnit() {
    if (!wizardCourse) return;
    if (!Array.isArray(wizardCourse.units)) wizardCourse.units = [];
    const uNum = wizardCourse.units.length + 1;
    wizardCourse.units.push({
      id: 'unit-' + Date.now(),
      title: `Unit ${uNum}: New Syllabus Unit`,
      desc: 'Unit focusing on curriculum outcomes.',
      duration: '3 Weeks',
      topics: [
        {
          id: 'top-' + Date.now(),
          title: `Topic ${uNum}.1: Core Concept Exploration`,
          lessons: [
            {
              id: 'les-' + Date.now(),
              lessonNumber: '1',
              title: 'Lesson 1: Intro Activity',
              duration: '35 mins',
              outcome: 'Learners explore core concepts.',
              contentHtml: '<p>Lesson notes.</p>',
              notesHtml: '<p>Teacher guidance.</p>',
              resources: [],
              assignment: {
                id: 'asg-' + Date.now(),
                title: 'Practical Activity',
                maxPoints: 10,
                submissionTypes: ['photo', 'observation'],
                rubric: [{ id: 'rc-1', criterion: 'Execution', points: 10, description: 'Completes activity' }],
                accommodations: 'Zero speech penalty.'
              },
              quiz: {
                id: 'quiz-' + Date.now(),
                title: 'Check for Understanding',
                questions: []
              }
            }
          ]
        }
      ]
    });
    renderHierarchyTree();
    updateAutoSaveStatus('modified');
  }

  function addWizardLessonQuick() {
    if (!wizardCourse || !wizardCourse.units || wizardCourse.units.length === 0) {
      addWizardUnit();
      return;
    }
    const lastUnit = wizardCourse.units[wizardCourse.units.length - 1];
    if (!lastUnit.topics || lastUnit.topics.length === 0) {
      lastUnit.topics = [{ id: 'top-' + Date.now(), title: 'Topic 1.1: General Inquiry', lessons: [] }];
    }
    const lastTopic = lastUnit.topics[lastUnit.topics.length - 1];
    if (!lastTopic.lessons) lastTopic.lessons = [];
    const lNum = lastTopic.lessons.length + 1;
    lastTopic.lessons.push({
      id: 'les-' + Date.now(),
      lessonNumber: String(lNum),
      title: `Lesson ${lNum}: Inquiry Session`,
      duration: '35 mins',
      outcome: 'Learner mastery.',
      contentHtml: '<p>Content</p>',
      notesHtml: '<p>Guidance</p>',
      resources: [],
      assignment: { id: 'asg-' + Date.now(), title: 'Task', maxPoints: 10, submissionTypes: ['photo'], rubric: [] },
      quiz: { id: 'quiz-' + Date.now(), title: 'Quiz', questions: [] }
    });
    renderHierarchyTree();
    updateAutoSaveStatus('modified');
  }



  // ── 10.7 Step 4: Full LMS Course Model Editor Engine ──
  function populateWizardStep4() {
    if (!wizardCourse) return;
    syncCourseFlatLessons(wizardCourse);

    const selector = document.getElementById('jum-wiz-content-lesson-select');
    if (!selector) return;

    const allLessons = wizardCourse.lessons || [];

    if (allLessons.length === 0) {
      selector.innerHTML = '<option value="">No lessons available. Go back to Step 3 to add a lesson.</option>';
      return;
    }

    selector.innerHTML = allLessons.map(l => `
      <option value="${l.id}">${escapeHtml(l.unitTitle || '')} &gt; ${escapeHtml(l.title)} (${escapeHtml(l.duration || '35 mins')})</option>
    `).join('');

    if (!activeEditorLessonId || !allLessons.find(l => l.id === activeEditorLessonId)) {
      activeEditorLessonId = allLessons[0].id;
    }

    selector.value = activeEditorLessonId;
    loadLessonIntoEditor(activeEditorLessonId);
  }

  function switchLmsModuleTab(tabName) {
    activeLmsModuleTab = tabName;
    const tabs = ['notes', 'materials', 'assignment', 'quiz'];

    tabs.forEach(t => {
      const btn = document.getElementById('jum-lms-btn-' + t);
      const panel = document.getElementById('jum-lms-panel-' + t);
      if (btn) {
        if (t === tabName) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        }
      }
      if (panel) {
        panel.style.display = t === tabName ? 'block' : 'none';
      }
    });
  }

  function findLessonByIdInWizard(lessonId) {
    if (!wizardCourse || !Array.isArray(wizardCourse.units)) return null;
    for (const u of wizardCourse.units) {
      if (Array.isArray(u.topics)) {
        for (const t of u.topics) {
          if (Array.isArray(t.lessons)) {
            const l = t.lessons.find(les => les.id === lessonId);
            if (l) return l;
          }
        }
      }
    }
    return null;
  }

  function loadLessonIntoEditor(lessonId) {
    activeEditorLessonId = lessonId;
    const lesson = findLessonByIdInWizard(lessonId);
    if (!lesson) return;

    // Lesson Header Info
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('jum-wiz-cur-lesson-title', lesson.title);
    setVal('jum-wiz-cur-lesson-duration', lesson.duration);
    setVal('jum-wiz-cur-lesson-date', lesson.date);

    // Module 1: Notes & CBC / UDL Guidance
    const richEditor = document.getElementById('jum-rich-editor');
    if (richEditor) {
      richEditor.innerHTML = lesson.contentHtml || lesson.notesHtml || '<p>Enter lesson notes and instructional guidance here...</p>';
    }
    setVal('jum-wiz-cur-outcome', lesson.outcome);
    setVal('jum-wiz-cur-intro', lesson.intro);
    setVal('jum-wiz-cur-guided', lesson.guided);
    setVal('jum-wiz-cur-activity', lesson.activity);
    setVal('jum-wiz-cur-wrapup', lesson.wrapup);
    setVal('jum-wiz-cur-tier1', lesson.tier1);
    setVal('jum-wiz-cur-tier2', lesson.tier2);
    setVal('jum-wiz-cur-tier3', lesson.tier3);
    setVal('jum-wiz-cur-materials', lesson.materials);
    setVal('jum-wiz-cur-reflection', lesson.reflection);
    setVal('jum-wiz-cur-homework', lesson.homework);

    // Module 2: Learning Materials & Resources
    if (!Array.isArray(lesson.resources)) lesson.resources = [];
    const matCountBadge = document.getElementById('jum-lms-mat-count');
    if (matCountBadge) matCountBadge.textContent = lesson.resources.length;
    renderLmsMaterialsList(lesson.resources);
    toggleLmsMaterialAdder(false);

    // Module 3: Activity Assignment
    if (!lesson.assignment) {
      lesson.assignment = {
        id: 'asg-' + Date.now(),
        title: 'Activity Assignment: ' + lesson.title,
        maxPoints: 20,
        dueDate: '',
        learnerInstructions: 'Complete the hands-on assignment and submit evidence of learning.',
        submissionTypes: ['photo', 'observation'],
        rubric: [
          { id: 'rc-1', criterion: 'Task Accuracy', points: 10, description: 'Demonstrates clear understanding of the task.' },
          { id: 'rc-2', criterion: 'Effort & Participation', points: 10, description: 'Engages with focus and persistence.' }
        ],
        accommodations: 'Zero speech penalty. Pointing or peer assistance supported.'
      };
    }
    const asg = lesson.assignment;
    setVal('jum-asg-title', asg.title);
    setVal('jum-asg-points', asg.maxPoints || 20);
    setVal('jum-asg-due', asg.dueDate);
    setVal('jum-asg-instructions', asg.learnerInstructions);
    setVal('jum-asg-accommodations', asg.accommodations);

    const asgStatusPill = document.getElementById('jum-lms-asg-status');
    if (asgStatusPill) {
      asgStatusPill.textContent = asg.title ? 'Configured' : 'Optional';
    }

    const subCheckboxes = document.querySelectorAll('#jum-asg-submission-grid input[type="checkbox"]');
    subCheckboxes.forEach(cb => {
      cb.checked = Array.isArray(asg.submissionTypes) && asg.submissionTypes.includes(cb.value);
    });
    renderLmsRubricTable(asg.rubric || []);

    // Module 4: Assessment Quiz
    if (!lesson.quiz) {
      lesson.quiz = {
        id: 'quiz-' + Date.now(),
        title: 'Check for Understanding: ' + lesson.title,
        description: 'Demonstrate your understanding with these interactive questions.',
        passScorePercentage: 70,
        questions: []
      };
    }
    const quiz = lesson.quiz;
    setVal('jum-quiz-title', quiz.title);
    setVal('jum-quiz-pass-score', quiz.passScorePercentage || 70);
    setVal('jum-quiz-desc', quiz.description);

    const quizCountBadge = document.getElementById('jum-lms-quiz-count');
    if (quizCountBadge) quizCountBadge.textContent = (quiz.questions || []).length;
    renderLmsQuizQuestions(quiz.questions || []);

    // Keep active module tab
    switchLmsModuleTab(activeLmsModuleTab || 'notes');
  }

  function readWizardStep4() {
    if (!wizardCourse || !activeEditorLessonId) return;
    const lesson = findLessonByIdInWizard(activeEditorLessonId);
    if (!lesson) return;

    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

    lesson.title = getVal('jum-wiz-cur-lesson-title') || lesson.title;
    lesson.duration = getVal('jum-wiz-cur-lesson-duration');
    lesson.date = getVal('jum-wiz-cur-lesson-date');

    // Notes
    const richEditor = document.getElementById('jum-rich-editor');
    if (richEditor) {
      lesson.contentHtml = richEditor.innerHTML;
      lesson.notesHtml = richEditor.innerHTML;
    }
    lesson.outcome = getVal('jum-wiz-cur-outcome');
    lesson.intro = getVal('jum-wiz-cur-intro');
    lesson.guided = getVal('jum-wiz-cur-guided');
    lesson.activity = getVal('jum-wiz-cur-activity');
    lesson.wrapup = getVal('jum-wiz-cur-wrapup');
    lesson.tier1 = getVal('jum-wiz-cur-tier1');
    lesson.tier2 = getVal('jum-wiz-cur-tier2');
    lesson.tier3 = getVal('jum-wiz-cur-tier3');
    lesson.materials = getVal('jum-wiz-cur-materials');
    lesson.reflection = getVal('jum-wiz-cur-reflection');
    lesson.homework = getVal('jum-wiz-cur-homework');

    // Assignment
    if (!lesson.assignment) lesson.assignment = {};
    lesson.assignment.title = getVal('jum-asg-title');
    lesson.assignment.maxPoints = parseInt(getVal('jum-asg-points'), 10) || 20;
    lesson.assignment.dueDate = getVal('jum-asg-due');
    lesson.assignment.learnerInstructions = getVal('jum-asg-instructions');
    lesson.assignment.accommodations = getVal('jum-asg-accommodations');

    const subTypes = [];
    document.querySelectorAll('#jum-asg-submission-grid input[type="checkbox"]:checked').forEach(cb => {
      subTypes.push(cb.value);
    });
    lesson.assignment.submissionTypes = subTypes;
    readLmsRubricTable();

    // Quiz
    if (!lesson.quiz) lesson.quiz = {};
    lesson.quiz.title = getVal('jum-quiz-title');
    lesson.quiz.passScorePercentage = parseInt(getVal('jum-quiz-pass-score'), 10) || 70;
    lesson.quiz.description = getVal('jum-quiz-desc');
    readLmsQuizQuestions();
  }

  // ── Step 4: LMS Material Management ──
  function toggleLmsMaterialAdder(forceState) {
    const box = document.getElementById('jum-lms-mat-adder');
    if (!box) return;
    const isVisible = box.style.display === 'block';
    const nextState = typeof forceState === 'boolean' ? forceState : !isVisible;
    box.style.display = nextState ? 'block' : 'none';
    if (nextState) {
      const titleInput = document.getElementById('jum-mat-title-input');
      if (titleInput) titleInput.focus();
    }
  }

  function renderLmsMaterialsList(materials) {
    const container = document.getElementById('jum-lms-materials-list-container');
    if (!container) return;

    if (!Array.isArray(materials) || materials.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:24px;background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:10px;">
          <p style="font-size:13.5px;color:#64748B;margin-bottom:8px;">No learning materials or sensory resources attached to this lesson yet.</p>
          <button type="button" class="jum-btn-use-tpl" style="font-size:12px;" id="jum-btn-quick-add-mat">+ Attach First Resource</button>
        </div>
      `;
      const quickBtn = document.getElementById('jum-btn-quick-add-mat');
      if (quickBtn) quickBtn.addEventListener('click', () => toggleLmsMaterialAdder(true));
      return;
    }

    container.innerHTML = `
      <table class="jum-lms-mat-table">
        <thead>
          <tr>
            <th style="width:80px;">Type</th>
            <th>Title &amp; Description</th>
            <th style="width:100px;">Size / Source</th>
            <th style="width:120px;text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${materials.map((m, idx) => `
            <tr>
              <td>
                <span class="jum-file-badge ${(m.fileFormat || 'doc').toLowerCase()}">${escapeHtml(m.fileFormat || 'FILE')}</span>
              </td>
              <td>
                <div style="font-weight:700;font-size:13.5px;color:#1E293B;">${escapeHtml(m.name || 'Untitled Resource')}</div>
                <div style="font-size:12px;color:#64748B;">${escapeHtml(m.description || 'Lesson learning material')}</div>
              </td>
              <td style="font-size:12px;color:#64748B;">${escapeHtml(m.size || 'Web Link')}</td>
              <td style="text-align:right;">
                <button type="button" class="jum-btn-tree-act" data-action="download-lesson-mat" data-mat-idx="${idx}" title="Open / View Resource">👁️</button>
                <button type="button" class="jum-btn-tree-act danger" data-action="del-lesson-mat" data-mat-idx="${idx}" title="Remove Material">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Attach listeners
    container.querySelectorAll('[data-action="download-lesson-mat"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-mat-idx'), 10);
        const mat = materials[idx];
        if (mat) {
          alert('Opening resource: ' + mat.name + (mat.url ? ' (' + mat.url + ')' : ''));
        }
      });
    });

    container.querySelectorAll('[data-action="del-lesson-mat"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-mat-idx'), 10);
        if (confirm('Remove this learning material from the lesson?')) {
          materials.splice(idx, 1);
          const badge = document.getElementById('jum-lms-mat-count');
          if (badge) badge.textContent = materials.length;
          renderLmsMaterialsList(materials);
          updateAutoSaveStatus('modified');
        }
      });
    });
  }

  function addLmsMaterialToActiveLesson() {
    const lesson = findLessonByIdInWizard(activeEditorLessonId);
    if (!lesson) return;
    if (!Array.isArray(lesson.resources)) lesson.resources = [];

    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const title = getVal('jum-mat-title-input');
    const type = getVal('jum-mat-type-select') || 'PDF';
    const url = getVal('jum-mat-url-input') || '#';
    const desc = getVal('jum-mat-desc-input');

    if (!title) {
      alert('Please enter a title for the learning material.');
      return;
    }

    lesson.resources.push({
      id: 'res-' + Date.now(),
      name: title,
      fileFormat: type,
      url: url,
      size: type === 'Video' ? 'Stream' : '1.4 MB',
      description: desc || 'Instructional resource for lesson.'
    });

    // Clear inputs
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('jum-mat-title-input', '');
    setVal('jum-mat-url-input', '');
    setVal('jum-mat-desc-input', '');

    toggleLmsMaterialAdder(false);
    const badge = document.getElementById('jum-lms-mat-count');
    if (badge) badge.textContent = lesson.resources.length;
    renderLmsMaterialsList(lesson.resources);
    updateAutoSaveStatus('modified');
  }

  // ── Step 4: LMS Activity Rubric Builder ──
  function renderLmsRubricTable(rubric) {
    const wrap = document.getElementById('jum-asg-rubric-table-wrap');
    if (!wrap) return;

    if (!Array.isArray(rubric) || rubric.length === 0) {
      wrap.innerHTML = `
        <div style="padding:14px;background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:8px;font-size:12.5px;color:#64748B;">
          No criteria rows added yet. Click "+ Add Criterion" above to build an inclusive multi-modal rubric!
        </div>
      `;
      return;
    }

    wrap.innerHTML = `
      <table class="jum-rubric-table">
        <thead>
          <tr>
            <th style="width:35%;">Criterion / Target</th>
            <th style="width:15%;">Points</th>
            <th style="width:40%;">Descriptor / Inclusive Expectation</th>
            <th style="width:10%;text-align:right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rubric.map((r, idx) => `
            <tr data-rubric-idx="${idx}">
              <td>
                <input type="text" class="jum-form-input rubric-crit" value="${escapeHtml(r.criterion)}" placeholder="e.g. Concrete Execution" style="font-size:12.5px;padding:6px 10px;">
              </td>
              <td>
                <input type="number" class="jum-form-input rubric-pts" value="${r.points || 5}" min="1" max="100" style="font-size:12.5px;padding:6px 10px;">
              </td>
              <td>
                <input type="text" class="jum-form-input rubric-desc" value="${escapeHtml(r.description || '')}" placeholder="Observable indicators..." style="font-size:12.5px;padding:6px 10px;">
              </td>
              <td style="text-align:right;">
                <button type="button" class="jum-btn-tree-act danger" data-action="del-rubric-row" data-rubric-idx="${idx}" title="Remove Criterion">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    wrap.querySelectorAll('[data-action="del-rubric-row"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-rubric-idx'), 10);
        readLmsRubricTable();
        const lesson = findLessonByIdInWizard(activeEditorLessonId);
        if (lesson && lesson.assignment && Array.isArray(lesson.assignment.rubric)) {
          lesson.assignment.rubric.splice(idx, 1);
          renderLmsRubricTable(lesson.assignment.rubric);
          updateAutoSaveStatus('modified');
        }
      });
    });

    wrap.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        readLmsRubricTable();
        updateAutoSaveStatus('modified');
      });
    });
  }

  function readLmsRubricTable() {
    const lesson = findLessonByIdInWizard(activeEditorLessonId);
    if (!lesson || !lesson.assignment) return;

    const wrap = document.getElementById('jum-asg-rubric-table-wrap');
    if (!wrap) return;

    const rows = wrap.querySelectorAll('tbody tr');
    const newRubric = [];

    rows.forEach((row, idx) => {
      const critEl = row.querySelector('.rubric-crit');
      const ptsEl = row.querySelector('.rubric-pts');
      const descEl = row.querySelector('.rubric-desc');

      newRubric.push({
        id: 'rc-' + (idx + 1),
        criterion: critEl ? critEl.value : 'Criterion ' + (idx + 1),
        points: ptsEl ? parseInt(ptsEl.value, 10) || 5 : 5,
        description: descEl ? descEl.value : ''
      });
    });

    lesson.assignment.rubric = newRubric;
  }

  function addLmsRubricCriterion() {
    const lesson = findLessonByIdInWizard(activeEditorLessonId);
    if (!lesson) return;
    if (!lesson.assignment) lesson.assignment = { rubric: [] };
    if (!Array.isArray(lesson.assignment.rubric)) lesson.assignment.rubric = [];

    readLmsRubricTable();
    lesson.assignment.rubric.push({
      id: 'rc-' + (lesson.assignment.rubric.length + 1),
      criterion: 'Criterion ' + (lesson.assignment.rubric.length + 1),
      points: 5,
      description: 'Observable evidence of concept mastery.'
    });

    renderLmsRubricTable(lesson.assignment.rubric);
    updateAutoSaveStatus('modified');
  }

  // ── Step 4: LMS Assessment Quiz Builder ──
  function renderLmsQuizQuestions(questions) {
    const container = document.getElementById('jum-quiz-questions-builder');
    if (!container) return;

    if (!Array.isArray(questions) || questions.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:26px;background:#F8FAFC;border:1.5px dashed #CBD5E1;border-radius:12px;">
          <p style="font-size:14px;color:#64748B;margin-bottom:12px;">No quiz questions added yet. Click "+ Add Question" above to create multiple-choice, visual pointing, or self-check reflection cards!</p>
          <button type="button" class="jum-btn-use-tpl" id="jum-btn-quick-add-q">+ Add First Question</button>
        </div>
      `;
      const quickBtn = document.getElementById('jum-btn-quick-add-q');
      if (quickBtn) quickBtn.addEventListener('click', addLmsQuizQuestion);
      return;
    }

    container.innerHTML = questions.map((q, qIdx) => {
      const opts = q.options || ['Option A', 'Option B'];
      const optsHtml = opts.map((opt, oIdx) => `
        <div class="jum-quiz-opt-row">
          <input type="radio" name="quiz-q-correct-${qIdx}" ${q.correctIndex === oIdx ? 'checked' : ''} data-q-idx="${qIdx}" data-opt-idx="${oIdx}" title="Mark this option as correct answer">
          <input type="text" class="jum-form-input quiz-opt-text" value="${escapeHtml(opt)}" data-q-idx="${qIdx}" data-opt-idx="${oIdx}" placeholder="Option text / emoji...">
          ${opts.length > 2 ? `<button type="button" class="jum-btn-tree-act danger" data-action="del-quiz-opt" data-q-idx="${qIdx}" data-opt-idx="${oIdx}" title="Delete option">✕</button>` : ''}
        </div>
      `).join('');

      return `
        <div class="jum-quiz-q-card" data-q-idx="${qIdx}">
          <div class="jum-quiz-q-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="jum-quiz-q-badge">Question ${qIdx + 1}</span>
              <select class="jum-form-select quiz-type-select" data-q-idx="${qIdx}" style="padding:4px 8px;font-size:12px;width:auto;">
                <option value="multiple-choice" ${q.type === 'multiple-choice' ? 'selected' : ''}>Multiple Choice</option>
                <option value="pointing-match" ${q.type === 'pointing-match' ? 'selected' : ''}>Visual Pointing / Choice Cards</option>
                <option value="self-check" ${q.type === 'self-check' ? 'selected' : ''}>Self-Reflection Emoji Check</option>
              </select>
            </div>
            <button type="button" class="jum-btn-tree-act danger" data-action="del-quiz-q" data-q-idx="${qIdx}" title="Delete Question">🗑️ Delete</button>
          </div>

          <div style="margin-bottom:12px;">
            <label style="font-size:12px;font-weight:700;color:#334155;margin-bottom:4px;display:block;">Question Prompt:</label>
            <input type="text" class="jum-form-input quiz-prompt-input" data-q-idx="${qIdx}" value="${escapeHtml(q.questionText || '')}" placeholder="Enter question prompt...">
          </div>

          <div style="margin-bottom:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <label style="font-size:12px;font-weight:700;color:#334155;">Answer Choices (select the radio button for the correct answer):</label>
              <button type="button" class="jum-btn-tree-act" data-action="add-quiz-opt" data-q-idx="${qIdx}" style="font-size:11px;">+ Add Option</button>
            </div>
            ${optsHtml}
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="font-size:11.5px;font-weight:700;color:#64748B;display:block;margin-bottom:4px;">Sensory Hint (Optional):</label>
              <input type="text" class="jum-form-input quiz-hint-input" data-q-idx="${qIdx}" value="${escapeHtml(q.hint || '')}" placeholder="e.g. Count the dots on the blue card">
            </div>
            <div>
              <label style="font-size:11.5px;font-weight:700;color:#64748B;display:block;margin-bottom:4px;">Affirmative Feedback &amp; Explanation:</label>
              <input type="text" class="jum-form-input quiz-feedback-input" data-q-idx="${qIdx}" value="${escapeHtml(q.explanation || '')}" placeholder="e.g. Great job! 5 + 5 makes 10.">
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach quiz questions listeners
    container.querySelectorAll('[data-action="del-quiz-q"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = parseInt(btn.getAttribute('data-q-idx'), 10);
        readLmsQuizQuestions();
        const lesson = findLessonByIdInWizard(activeEditorLessonId);
        if (lesson && lesson.quiz && Array.isArray(lesson.quiz.questions)) {
          lesson.quiz.questions.splice(qIdx, 1);
          const badge = document.getElementById('jum-lms-quiz-count');
          if (badge) badge.textContent = lesson.quiz.questions.length;
          renderLmsQuizQuestions(lesson.quiz.questions);
          updateAutoSaveStatus('modified');
        }
      });
    });

    container.querySelectorAll('[data-action="add-quiz-opt"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = parseInt(btn.getAttribute('data-q-idx'), 10);
        readLmsQuizQuestions();
        const lesson = findLessonByIdInWizard(activeEditorLessonId);
        if (lesson && lesson.quiz?.questions[qIdx]) {
          if (!lesson.quiz.questions[qIdx].options) lesson.quiz.questions[qIdx].options = [];
          lesson.quiz.questions[qIdx].options.push('Option ' + (lesson.quiz.questions[qIdx].options.length + 1));
          renderLmsQuizQuestions(lesson.quiz.questions);
          updateAutoSaveStatus('modified');
        }
      });
    });

    container.querySelectorAll('[data-action="del-quiz-opt"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = parseInt(btn.getAttribute('data-q-idx'), 10);
        const optIdx = parseInt(btn.getAttribute('data-opt-idx'), 10);
        readLmsQuizQuestions();
        const lesson = findLessonByIdInWizard(activeEditorLessonId);
        if (lesson && lesson.quiz?.questions[qIdx]?.options) {
          lesson.quiz.questions[qIdx].options.splice(optIdx, 1);
          if (lesson.quiz.questions[qIdx].correctIndex >= lesson.quiz.questions[qIdx].options.length) {
            lesson.quiz.questions[qIdx].correctIndex = 0;
          }
          renderLmsQuizQuestions(lesson.quiz.questions);
          updateAutoSaveStatus('modified');
        }
      });
    });

    container.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const qIdx = parseInt(radio.getAttribute('data-q-idx'), 10);
        const optIdx = parseInt(radio.getAttribute('data-opt-idx'), 10);
        const lesson = findLessonByIdInWizard(activeEditorLessonId);
        if (lesson && lesson.quiz?.questions[qIdx]) {
          lesson.quiz.questions[qIdx].correctIndex = optIdx;
          updateAutoSaveStatus('modified');
        }
      });
    });

    container.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', () => {
        readLmsQuizQuestions();
        updateAutoSaveStatus('modified');
      });
    });
  }

  function readLmsQuizQuestions() {
    const lesson = findLessonByIdInWizard(activeEditorLessonId);
    if (!lesson || !lesson.quiz) return;

    const container = document.getElementById('jum-quiz-questions-builder');
    if (!container) return;

    const cards = container.querySelectorAll('.jum-quiz-q-card');
    const newQuestions = [];

    cards.forEach((card, qIdx) => {
      const typeSelect = card.querySelector('.quiz-type-select');
      const promptInput = card.querySelector('.quiz-prompt-input');
      const hintInput = card.querySelector('.quiz-hint-input');
      const fbInput = card.querySelector('.quiz-feedback-input');

      const optInputs = card.querySelectorAll('.quiz-opt-text');
      const options = [];
      optInputs.forEach(oi => options.push(oi.value));

      let correctIndex = 0;
      card.querySelectorAll('input[type="radio"]').forEach((r, rIdx) => {
        if (r.checked) correctIndex = rIdx;
      });

      newQuestions.push({
        id: 'q-' + (qIdx + 1),
        type: typeSelect ? typeSelect.value : 'multiple-choice',
        questionText: promptInput ? promptInput.value : 'Question ' + (qIdx + 1),
        options: options.length > 0 ? options : ['Yes', 'No'],
        correctIndex: typeSelect && typeSelect.value === 'self-check' ? -1 : correctIndex,
        hint: hintInput ? hintInput.value : '',
        explanation: fbInput ? fbInput.value : ''
      });
    });

    lesson.quiz.questions = newQuestions;
  }

  function addLmsQuizQuestion() {
    const lesson = findLessonByIdInWizard(activeEditorLessonId);
    if (!lesson) return;
    if (!lesson.quiz) lesson.quiz = { questions: [] };
    if (!Array.isArray(lesson.quiz.questions)) lesson.quiz.questions = [];

    readLmsQuizQuestions();
    const qNum = lesson.quiz.questions.length + 1;
    lesson.quiz.questions.push({
      id: 'q-' + Date.now(),
      type: 'multiple-choice',
      questionText: 'Question ' + qNum + ': Check for understanding',
      options: ['Correct choice', 'Alternative option', 'Distractor choice'],
      correctIndex: 0,
      hint: 'Recall our guided practice activity.',
      explanation: 'Great job! This directly applies today’s lesson competency.'
    });

    const badge = document.getElementById('jum-lms-quiz-count');
    if (badge) badge.textContent = lesson.quiz.questions.length;
    renderLmsQuizQuestions(lesson.quiz.questions);
    updateAutoSaveStatus('modified');
  }

  // ── Step 4: Rich Text Editor Execution Commands ──
  function execEditorCommand(command, value) {
    document.execCommand(command, false, value || null);
    const richEditor = document.getElementById('jum-rich-editor');
    if (richEditor) richEditor.focus();
    updateAutoSaveStatus('modified');
  }

  function insertCalloutIntoEditor(type) {
    const richEditor = document.getElementById('jum-rich-editor');
    if (!richEditor) return;

    let calloutHtml = '';
    if (type === 'teacher') {
      calloutHtml = '<div class="jum-editor-callout teacher"><strong>👨‍🏫 Teacher Reflection & Guidance:</strong> <em>Enter specialized instructional tip or pacing note here.</em></div><p></p>';
    } else if (type === 'learner') {
      calloutHtml = '<div class="jum-editor-callout learner"><strong>🎯 Learner Goal:</strong> Today, I can actively explore and share my ideas!</div><p></p>';
    } else if (type === 'practical') {
      calloutHtml = '<div class="jum-editor-callout practical"><strong>🧪 Practical Activity:</strong> Step 1: Gather realia materials. Step 2: Sort into sets. Step 3: Check with peer buddy.</div><p></p>';
    } else if (type === 'tier') {
      calloutHtml = '<div class="jum-editor-callout cbc"><strong>🌟 Multi-Tier Scaffolding:</strong> Tier 1: Visual timers • Tier 2: Tactile guides • Tier 3: Communication cards.</div><p></p>';
    } else if (type === 'accom') {
      calloutHtml = '<div class="jum-editor-callout cbc"><strong>♿ Inclusive Accommodation:</strong> High contrast text, sensory breaks permitted, zero speech penalty.</div><p></p>';
    }

    document.execCommand('insertHTML', false, calloutHtml);
    richEditor.focus();
    updateAutoSaveStatus('modified');
  }



  // ── 10.8 Course Resources Manager ──
  function openCourseResourcesModal(courseId) {
    currentResourceCourseId = courseId;
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    const modal = document.getElementById('jum-modal-course-resources');
    const titleEl = document.getElementById('jum-res-modal-course-name');
    if (titleEl) titleEl.textContent = course.title;

    renderCourseResourcesTable(course);
    if (modal) modal.classList.add('active');
    announceToScreenReader('Course resources manager opened');
  }

  function closeCourseResourcesModal() {
    const modal = document.getElementById('jum-modal-course-resources');
    if (modal) modal.classList.remove('active');
  }

  function renderCourseResourcesTable(course) {
    const tbody = document.getElementById('jum-res-table-body');
    const emptyState = document.getElementById('jum-res-empty-state');
    if (!tbody) return;

    if (!Array.isArray(course.resources) || course.resources.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = course.resources.map((res, idx) => `
      <tr>
        <td>
          <span class="jum-file-badge ${(res.fileFormat || 'doc').toLowerCase()}">${escapeHtml(res.fileFormat || 'DOC')}</span>
        </td>
        <td>
          <div style="font-weight:700;font-size:13.5px;color:#0F172A;">${escapeHtml(res.name)}</div>
          <div style="font-size:12px;color:#64748B;">${escapeHtml(res.description || 'Curriculum resource')}</div>
        </td>
        <td style="font-size:12.5px;color:#64748B;">${escapeHtml(res.size || '1.5 MB')}</td>
        <td style="font-size:12.5px;color:#64748B;">${escapeHtml(res.uploadedAt || 'Recently')}</td>
        <td style="text-align:right;">
          <button type="button" class="jum-btn-tree-act" data-action="dl-res" data-res-idx="${idx}" title="Download">⬇️</button>
          <button type="button" class="jum-btn-tree-act" data-action="ren-res" data-res-idx="${idx}" title="Rename">✏️</button>
          <button type="button" class="jum-btn-tree-act danger" data-action="del-res" data-res-idx="${idx}" title="Delete">🗑️</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="dl-res"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-res-idx'), 10);
        const res = course.resources[idx];
        if (res) alert('Downloading resource: ' + res.name);
      });
    });

    tbody.querySelectorAll('[data-action="ren-res"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-res-idx'), 10);
        const res = course.resources[idx];
        if (res) {
          const newName = prompt('Enter new resource name:', res.name);
          if (newName && newName.trim()) {
            res.name = newName.trim();
            saveCourses(activeCourses);
            renderCourseResourcesTable(course);
          }
        }
      });
    });

    tbody.querySelectorAll('[data-action="del-res"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-res-idx'), 10);
        if (confirm('Delete this resource from the course?')) {
          course.resources.splice(idx, 1);
          saveCourses(activeCourses);
          renderCourseResourcesTable(course);
          renderCoursesGrid();
        }
      });
    });
  }

  function handleResourceFilesAdded(files) {
    const course = activeCourses.find(c => c.id === currentResourceCourseId);
    if (!course || !files || files.length === 0) return;
    if (!Array.isArray(course.resources)) course.resources = [];

    Array.from(files).forEach(f => {
      const ext = f.name.split('.').pop().toUpperCase();
      course.resources.push({
        id: 'res-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: f.name,
        fileFormat: ext || 'DOC',
        size: Math.round(f.size / 1024) + ' KB',
        uploadedAt: new Date().toLocaleDateString(),
        url: '#'
      });
    });

    saveCourses(activeCourses);
    renderCourseResourcesTable(course);
    renderCoursesGrid();
    alert('Attached ' + files.length + ' new file(s) to ' + course.title);
  }

  // ── 10.9 Interactive LMS Lesson Player Engine (Viewer & Preview) ──
  function renderLmsLessonPlayer(lesson, playerKey, options) {
    if (!lesson) return '';
    const mats = lesson.resources || [];
    const asg = lesson.assignment || {
      title: 'Activity Assignment: ' + lesson.title,
      maxPoints: 20,
      learnerInstructions: 'Participate actively and share observations.',
      submissionTypes: ['photo', 'observation'],
      rubric: [
        { criterion: 'Concrete Accuracy', points: 10, description: 'Demonstrates clear understanding' },
        { criterion: 'Effort & Independence', points: 10, description: 'Shows focus and persistence' }
      ]
    };
    const quiz = lesson.quiz || {
      title: 'Check for Understanding',
      passScorePercentage: 70,
      questions: []
    };
    const quizQuestions = quiz.questions || [];

    const activeTab = (options && options.initialTab) || 'notes';
    const playerContainerId = 'jum-lms-player-' + playerKey;

    // Materials HTML
    const matsHtml = mats.length > 0 ? `
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-top:10px;">
        ${mats.map(m => `
          <div style="background:#F8FAFC;border:1.5px solid #CBD5E1;border-radius:10px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <div style="display:flex;align-items:center;gap:10px;overflow:hidden;">
              <span class="jum-file-badge ${(m.fileFormat || 'doc').toLowerCase()}">${escapeHtml(m.fileFormat || 'DOC')}</span>
              <div style="overflow:hidden;">
                <div style="font-weight:700;font-size:13px;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(m.name)}</div>
                <div style="font-size:11.5px;color:#64748B;">${escapeHtml(m.size || 'Web Link')} ${m.description ? '• ' + escapeHtml(m.description) : ''}</div>
              </div>
            </div>
            <button type="button" class="jum-btn-card-secondary" style="padding:5px 10px;font-size:11.5px;white-space:nowrap;" onclick="alert('Opening resource: ' + '${escapeHtml(m.name)}')">Open ↗</button>
          </div>
        `).join('')}
      </div>
    ` : '<p style="font-size:13px;color:#64748B;padding:12px 0;">No attached downloadable materials for this lesson.</p>';

    // Assignment Rubric Rows
    const rubricRows = (asg.rubric || []).map(r => `
      <tr>
        <td style="font-weight:700;color:#1E293B;">${escapeHtml(r.criterion)}</td>
        <td style="font-weight:700;color:#2145E6;">${r.points || 5} pts</td>
        <td style="color:#64748B;">${escapeHtml(r.description || '')}</td>
      </tr>
    `).join('');

    // Submission Types Tags
    const subTypesHtml = (asg.submissionTypes || ['photo', 'observation']).map(st => {
      let icon = '📄';
      let lbl = 'Document / Drawing';
      if (st === 'photo') { icon = '📸'; lbl = 'Concrete Manipulatives Photo'; }
      if (st === 'voice') { icon = '🎙️'; lbl = 'Voice Audio Recording'; }
      if (st === 'observation') { icon = '🤝'; lbl = 'Teacher / Peer Observation'; }
      return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:#E2E8F0;font-size:12px;font-weight:600;color:#334155;">${icon} ${lbl}</span>`;
    }).join(' ');

    // Submission Simulation status
    const subStatus = assignmentSubmissionStates[lesson.id];
    const subBoxHtml = `
      <div class="jum-submission-sim-box" id="jum-sub-box-${playerKey}">
        <h5 style="font-size:14px;font-weight:800;color:#0F172A;margin-bottom:6px;">Interactive Learner Submission Portal</h5>
        <p style="font-size:12.5px;color:#64748B;margin-bottom:12px;">
          Learners or shadow teachers can submit evidence of learning using any supported inclusive modality:
        </p>
        <div class="jum-submission-buttons">
          <button type="button" class="jum-btn-card-secondary" style="font-size:12.5px;" onclick="window.handleLmsAssignmentSubmit('${lesson.id}', '${playerKey}', 'photo')">📸 Take / Upload Photo of Work</button>
          <button type="button" class="jum-btn-card-secondary" style="font-size:12.5px;" onclick="window.handleLmsAssignmentSubmit('${lesson.id}', '${playerKey}', 'voice')">🎙️ Record Voice Audio</button>
          <button type="button" class="jum-btn-card-secondary" style="font-size:12.5px;" onclick="window.handleLmsAssignmentSubmit('${lesson.id}', '${playerKey}', 'observation')">🤝 Peer / Teacher Sign-Off</button>
        </div>
        ${subStatus ? `
          <div style="margin-top:12px;padding:10px 14px;background:#D1FAE5;border:1px solid #10B981;border-radius:8px;color:#065F46;font-size:13px;font-weight:700;">
            ✅ ${escapeHtml(subStatus.message)} (Submitted at ${escapeHtml(subStatus.time)})
          </div>
        ` : ''}
      </div>
    `;

    // Quiz Questions HTML
    const playerQuizState = quizPlayerStates[lesson.id] || { answers: {}, submitted: false };
    const quizQuestionsHtml = quizQuestions.length > 0 ? quizQuestions.map((q, qIdx) => {
      const selectedOpt = playerQuizState.answers[qIdx];
      const isSubmitted = playerQuizState.submitted;
      const isCorrect = selectedOpt !== undefined && selectedOpt === q.correctIndex;
      const isSelfCheck = q.type === 'self-check';

      const optionsHtml = (q.options || []).map((opt, oIdx) => {
        let optClasses = 'jum-player-quiz-opt';
        if (selectedOpt === oIdx) optClasses += ' selected';
        if (isSubmitted) {
          if (oIdx === q.correctIndex) {
            optClasses += ' correct';
          } else if (selectedOpt === oIdx && !isCorrect && !isSelfCheck) {
            optClasses += ' incorrect';
          }
        }

        return `
          <button type="button" class="${optClasses}" onclick="window.handleLmsQuizSelect('${lesson.id}', '${playerKey}', ${qIdx}, ${oIdx})" ${isSubmitted ? 'disabled' : ''}>
            <span style="font-weight:800;font-size:13px;color:#2145E6;">${String.fromCharCode(65 + oIdx)}.</span>
            <span>${escapeHtml(opt)}</span>
          </button>
        `;
      }).join('');

      let feedbackBoxHtml = '';
      if (isSubmitted) {
        if (isSelfCheck) {
          feedbackBoxHtml = `
            <div class="jum-quiz-feedback-box correct">
              <strong>🌟 Reflection Acknowledged:</strong> ${escapeHtml(q.explanation || 'Thank you for sharing your reflection!')}
            </div>
          `;
        } else if (isCorrect) {
          feedbackBoxHtml = `
            <div class="jum-quiz-feedback-box correct">
              <strong>🎉 Correct!</strong> ${escapeHtml(q.explanation || 'Well done on identifying the right answer.')}
            </div>
          `;
        } else {
          feedbackBoxHtml = `
            <div class="jum-quiz-feedback-box incorrect">
              <strong>💡 Let\'s Review:</strong> ${escapeHtml(q.hint ? 'Hint: ' + q.hint + ' • ' : '')} ${escapeHtml(q.explanation || 'Review the guided practice section for another try.')}
            </div>
          `;
        }
      }

      return `
        <div class="jum-player-quiz-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <span style="font-size:12px;font-weight:800;color:#2145E6;text-transform:uppercase;">Question ${qIdx + 1} of ${quizQuestions.length}</span>
            ${q.hint && !isSubmitted ? `<button type="button" class="jum-btn-tree-act" onclick="alert('💡 Hint: ' + '${escapeHtml(q.hint)}')" style="font-size:11.5px;">💡 Need a Hint?</button>` : ''}
          </div>
          <h5 style="font-size:15px;font-weight:700;color:#0F172A;margin-bottom:12px;">${escapeHtml(q.questionText)}</h5>
          <div class="jum-player-quiz-options">
            ${optionsHtml}
          </div>
          ${feedbackBoxHtml}
        </div>
      `;
    }).join('') : '<p style="font-size:13px;color:#64748B;padding:12px 0;">No quiz questions configured for this lesson yet.</p>';

    // Calculate score summary if submitted
    let scoreSummaryHtml = '';
    if (playerQuizState.submitted && quizQuestions.length > 0) {
      let correctCount = 0;
      let gradableCount = 0;
      quizQuestions.forEach((q, qIdx) => {
        if (q.type !== 'self-check') {
          gradableCount++;
          if (playerQuizState.answers[qIdx] === q.correctIndex) correctCount++;
        }
      });
      const scorePct = gradableCount > 0 ? Math.round((correctCount / gradableCount) * 100) : 100;
      const passPct = quiz.passScorePercentage || 70;
      const isPassed = scorePct >= passPct;

      scoreSummaryHtml = `
        <div class="jum-quiz-score-summary">
          <div style="font-size:36px;margin-bottom:6px;">${isPassed ? '🏆' : '🌱'}</div>
          <h4 style="font-family:var(--font-heading);font-size:20px;font-weight:800;color:#0F172A;margin-bottom:4px;">
            ${isPassed ? 'Congratulations! Quiz Completed!' : 'Good Effort! Keep Growing!'}
          </h4>
          <p style="font-size:14px;color:#475569;margin-bottom:14px;">
            You scored <strong>${scorePct}%</strong> (${correctCount} of ${gradableCount} correct). Passing threshold is ${passPct}%.
          </p>
          <button type="button" class="jum-btn-wizard-primary" onclick="window.handleLmsQuizRetake('${lesson.id}', '${playerKey}')">🔄 Retake Quiz</button>
        </div>
      `;
    }

    return `
      <div class="jum-lms-player" id="${playerContainerId}">
        <!-- Player Tab Bar -->
        <div class="jum-lms-player-header">
          <button type="button" class="jum-lms-player-tab ${activeTab === 'notes' ? 'active' : ''}" onclick="window.switchPlayerTab('${playerContainerId}', 'notes')">
            <span>📝</span> Lesson Notes &amp; Guidance
          </button>
          <button type="button" class="jum-lms-player-tab ${activeTab === 'materials' ? 'active' : ''}" onclick="window.switchPlayerTab('${playerContainerId}', 'materials')">
            <span>📂</span> Learning Materials (${mats.length})
          </button>
          <button type="button" class="jum-lms-player-tab ${activeTab === 'assignment' ? 'active' : ''}" onclick="window.switchPlayerTab('${playerContainerId}', 'assignment')">
            <span>✍️</span> Activity Assignment (${asg.maxPoints || 20} pts)
          </button>
          <button type="button" class="jum-lms-player-tab ${activeTab === 'quiz' ? 'active' : ''}" onclick="window.switchPlayerTab('${playerContainerId}', 'quiz')">
            <span>❓</span> Assessment Quiz (${quizQuestions.length})
          </button>
        </div>

        <!-- Body 1: Notes -->
        <div class="jum-lms-player-body" data-panel="notes" style="display:${activeTab === 'notes' ? 'block' : 'none'};">
          <div style="font-size:13.5px;color:#1E293B;margin-bottom:14px;">
            <strong>Specific Learning Outcome:</strong> ${escapeHtml(lesson.outcome || 'Apply foundational concept using concrete realia.')}
          </div>
          <div style="background:#FFFFFF;border:1px solid var(--border-color);border-radius:10px;padding:16px;font-size:13.5px;line-height:1.6;margin-bottom:16px;">
            ${lesson.contentHtml || lesson.notesHtml || '<p>Detailed instructional guidance for this lesson.</p>'}
          </div>

          <!-- CBC Stages Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;background:#F8FAFC;padding:14px;border-radius:10px;border:1px solid #E2E8F0;margin-bottom:14px;font-size:12.5px;">
            <div><strong style="color:#2145E6;">1. Introduction:</strong> ${escapeHtml(lesson.intro || 'Multisensory warm-up.')}</div>
            <div><strong style="color:#0F766E;">2. Guided Practice:</strong> ${escapeHtml(lesson.guided || 'Teacher modeling with realia.')}</div>
            <div><strong style="color:#B45309;">3. Tiered Activity:</strong> ${escapeHtml(lesson.activity || 'Hands-on practical exploration.')}</div>
            <div><strong style="color:#475569;">4. Wrap-up:</strong> ${escapeHtml(lesson.wrapup || 'Learner reflection and peer review.')}</div>
          </div>

          <!-- UDL Tiers Breakdown -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;font-size:12px;background:#EFF6FF;padding:12px;border-radius:10px;">
            <div><strong>Tier 1 (Universal):</strong> ${escapeHtml(lesson.tier1 || 'Visual schedules & timers')}</div>
            <div><strong>Tier 2 (Targeted):</strong> ${escapeHtml(lesson.tier2 || 'Tactile guides & peer partner')}</div>
            <div><strong>Tier 3 (Intensive):</strong> ${escapeHtml(lesson.tier3 || '1-to-1 support & PECS cards')}</div>
          </div>
        </div>

        <!-- Body 2: Materials -->
        <div class="jum-lms-player-body" data-panel="materials" style="display:${activeTab === 'materials' ? 'block' : 'none'};">
          <h4 style="font-size:15px;font-weight:800;color:#0F172A;margin-bottom:6px;">Lesson Learning Materials &amp; Media</h4>
          <p style="font-size:13px;color:#64748B;margin-bottom:14px;">Multisensory resources, worksheets, audio narrations, and reference documents:</p>
          ${matsHtml}
        </div>

        <!-- Body 3: Assignment -->
        <div class="jum-lms-player-body" data-panel="assignment" style="display:${activeTab === 'assignment' ? 'block' : 'none'};">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
            <h4 style="font-size:16px;font-weight:800;color:#0F172A;margin:0;">${escapeHtml(asg.title)}</h4>
            <span style="font-size:12px;font-weight:800;color:#2145E6;background:#DBEAFE;padding:4px 10px;border-radius:6px;">Max Points: ${asg.maxPoints || 20} pts</span>
          </div>

          <p style="font-size:14px;color:#334155;line-height:1.6;background:#F8FAFC;border-left:4px solid #2145E6;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
            ${escapeHtml(asg.learnerInstructions || 'Complete the hands-on activity using concrete materials and submit evidence.')}
          </p>

          <div style="margin-bottom:16px;">
            <div style="font-size:12px;font-weight:700;color:#64748B;margin-bottom:6px;">Accepted Inclusive Submission Modalities:</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">${subTypesHtml}</div>
          </div>

          <div style="margin-bottom:16px;">
            <h5 style="font-size:13px;font-weight:700;color:#334155;margin-bottom:6px;">Evaluation Rubric:</h5>
            <table class="jum-rubric-table" style="background:#FFFFFF;border:1px solid #CBD5E1;border-radius:8px;">
              <thead>
                <tr>
                  <th style="width:35%;">Criterion</th>
                  <th style="width:15%;">Points</th>
                  <th style="width:50%;">Inclusive Expectation</th>
                </tr>
              </thead>
              <tbody>
                ${rubricRows}
              </tbody>
            </table>
          </div>

          ${subBoxHtml}
        </div>

        <!-- Body 4: Quiz -->
        <div class="jum-lms-player-body" data-panel="quiz" style="display:${activeTab === 'quiz' ? 'block' : 'none'};">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
            <div>
              <h4 style="font-size:16px;font-weight:800;color:#0F172A;margin:0;">${escapeHtml(quiz.title)}</h4>
              <p style="font-size:12.5px;color:#64748B;margin:2px 0 0;">${escapeHtml(quiz.description || 'Interactive check for understanding')}</p>
            </div>
            <span style="font-size:12px;font-weight:800;color:#059669;background:#D1FAE5;padding:4px 10px;border-radius:6px;">Passing Score: ${quiz.passScorePercentage || 70}%</span>
          </div>

          ${scoreSummaryHtml}
          ${!playerQuizState.submitted ? `
            <div style="margin-top:16px;">
              ${quizQuestionsHtml}
              ${quizQuestions.length > 0 ? `
                <div style="text-align:center;margin-top:20px;">
                  <button type="button" class="jum-btn-wizard-primary" style="font-size:14px;padding:12px 28px;" onclick="window.handleLmsQuizSubmit('${lesson.id}', '${playerKey}')">Submit Quiz for Instant Feedback &rarr;</button>
                </div>
              ` : ''}
            </div>
          ` : `
            <div style="margin-top:20px;">
              <h5 style="font-size:14px;font-weight:800;color:#0F172A;margin-bottom:12px;">Review Your Answers:</h5>
              ${quizQuestionsHtml}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // Global handlers for LMS player interactions (attached to window for inline onclicks)
  window.switchPlayerTab = function(playerContainerId, tabName) {
    const container = document.getElementById(playerContainerId);
    if (!container) return;

    container.querySelectorAll('.jum-lms-player-tab').forEach(t => {
      const isMatch = t.getAttribute('onclick').includes(`'${tabName}'`);
      t.classList.toggle('active', isMatch);
    });

    container.querySelectorAll('.jum-lms-player-body').forEach(p => {
      p.style.display = p.getAttribute('data-panel') === tabName ? 'block' : 'none';
    });
  };

  window.handleLmsQuizSelect = function(lessonId, playerKey, qIdx, optIdx) {
    if (!quizPlayerStates[lessonId]) {
      quizPlayerStates[lessonId] = { answers: {}, submitted: false };
    }
    quizPlayerStates[lessonId].answers[qIdx] = optIdx;

    // Re-render this player container
    refreshPlayerInstance(lessonId, playerKey, 'quiz');
  };

  window.handleLmsQuizSubmit = function(lessonId, playerKey) {
    if (!quizPlayerStates[lessonId]) {
      quizPlayerStates[lessonId] = { answers: {}, submitted: false };
    }
    quizPlayerStates[lessonId].submitted = true;
    refreshPlayerInstance(lessonId, playerKey, 'quiz');
  };

  window.handleLmsQuizRetake = function(lessonId, playerKey) {
    quizPlayerStates[lessonId] = { answers: {}, submitted: false };
    refreshPlayerInstance(lessonId, playerKey, 'quiz');
  };

  window.handleLmsAssignmentSubmit = function(lessonId, playerKey, subType) {
    let msg = 'Concrete Manipulatives Photo submitted successfully!';
    if (subType === 'voice') msg = 'Voice Audio Recording submitted successfully!';
    if (subType === 'observation') msg = 'Teacher / Peer Observation sign-off confirmed!';

    assignmentSubmissionStates[lessonId] = {
      type: subType,
      message: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    refreshPlayerInstance(lessonId, playerKey, 'assignment');
  };

  function findLessonByIdAcrossAllCourses(lessonId) {
    for (const c of activeCourses) {
      if (Array.isArray(c.units)) {
        for (const u of c.units) {
          if (Array.isArray(u.topics)) {
            for (const t of u.topics) {
              if (Array.isArray(t.lessons)) {
                const l = t.lessons.find(les => les.id === lessonId);
                if (l) return l;
              }
            }
          }
        }
      }
    }
    return null;
  }

  function refreshPlayerInstance(lessonId, playerKey, activeTab) {
    const playerEl = document.getElementById('jum-lms-player-' + playerKey);
    if (!playerEl) return;

    const lesson = findLessonByIdAcrossAllCourses(lessonId);
    if (!lesson) return;

    const parent = playerEl.parentElement;
    if (parent) {
      parent.innerHTML = renderLmsLessonPlayer(lesson, playerKey, { initialTab: activeTab });
    }
  }

  // ── 10.10 Course Lessons Viewer ──
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

    if (gradeEl) gradeEl.textContent = (course.grade || 'All Grades') + ' • ' + (course.subject || 'General');
    if (titleEl) titleEl.textContent = course.title;
    if (descEl) descEl.textContent = course.desc || 'Inclusive curriculum course.';

    const allLessons = course.lessons || [];

    if (allLessons.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:32px;background:#F8FAFC;border:1.5px dashed #CBD5E1;border-radius:12px;">
          <p style="font-size:14px;color:#64748B;margin-bottom:12px;">No lessons added to this course yet.</p>
          <button type="button" class="jum-btn-wizard-primary" id="jum-btn-viewer-add-first-lesson">+ Add First Lesson</button>
        </div>
      `;
      const btn = document.getElementById('jum-btn-viewer-add-first-lesson');
      if (btn) btn.addEventListener('click', () => {
        closeCourseLessonsViewer();
        openCourseWizard('edit', courseId);
        goToWizardStep(3);
      });
    } else {
      listEl.innerHTML = allLessons.map((l, idx) => {
        const matsCount = (l.resources || []).length;
        const asgPts = l.assignment?.maxPoints || 20;
        const qCount = (l.quiz?.questions || []).length;

        return `
          <div class="jum-lesson-item" data-lesson-id="${l.id}">
            <div class="jum-lesson-item-summary" role="button" tabindex="0" aria-expanded="false">
              <div class="jum-lesson-item-left">
                <span class="jum-lesson-num">#${idx + 1}</span>
                <div>
                  <h4 class="jum-lesson-title-text">${escapeHtml(l.title)}</h4>
                  <div class="jum-lesson-badges">
                    <span class="jum-duration-chip">⏱️ ${escapeHtml(l.duration || '35 mins')}</span>
                    <span class="jum-lms-count-pill">📂 ${matsCount} Materials</span>
                    <span class="jum-lms-count-pill teal">✍️ ${asgPts} pts Task</span>
                    <span class="jum-lms-count-pill">❓ ${qCount} Quiz Qs</span>
                  </div>
                </div>
              </div>
              <div class="jum-lesson-item-actions">
                <button type="button" class="jum-btn-tree-act" data-action="edit-lesson-in-wiz" data-course-id="${courseId}" data-lesson-id="${l.id}">✏️ Edit</button>
                <span class="jum-lesson-chevron">▼</span>
              </div>
            </div>
            <div class="jum-lesson-item-content">
              <div id="jum-viewer-player-wrap-${l.id}">
                ${renderLmsLessonPlayer(l, 'viewer-' + l.id, { initialTab: 'notes' })}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Accordion toggle
      listEl.querySelectorAll('.jum-lesson-item-summary').forEach(summary => {
        summary.addEventListener('click', (e) => {
          if (e.target.closest('[data-action]')) return;
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

      // Edit in wizard button
      listEl.querySelectorAll('[data-action="edit-lesson-in-wiz"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const lId = btn.getAttribute('data-lesson-id');
          closeCourseLessonsViewer();
          activeEditorLessonId = lId;
          openCourseWizard('edit', courseId);
          goToWizardStep(4);
        });
      });
    }

    viewer.classList.add('active');
    viewer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    announceToScreenReader('Opened lesson list for ' + course.title);
  }

  function closeCourseLessonsViewer() {
    const viewer = document.getElementById('jum-course-lessons-viewer');
    if (viewer) viewer.classList.remove('active');
  }

  // ── 10.11 Learner Course Preview Modal ──
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
      const topicsHtml = topics.map((t, tIdx) => {
        const lessons = t.lessons || [];
        const lessonsHtml = lessons.map((l, lIdx) => `
          <div class="jum-prev-lesson-box">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
              <h5 style="font-family:var(--font-heading);font-size:16px;font-weight:700;color:var(--heading-color);margin:0;">
                📝 ${escapeHtml(l.title)}
              </h5>
              <span class="jum-duration-chip">⏱️ ${escapeHtml(l.duration || '35 mins')}</span>
            </div>
            
            <div style="margin-top:12px;" id="jum-preview-player-wrap-${l.id}">
              ${renderLmsLessonPlayer(l, 'prev-' + l.id, { initialTab: 'notes' })}
            </div>
          </div>
        `).join('');

        return `
          <div style="margin-top:16px;">
            <h6 style="font-size:14px;font-weight:700;color:var(--jum-teal);margin-bottom:8px;">${escapeHtml(t.title)}</h6>
            ${lessonsHtml || '<p style="font-size:12.5px;color:var(--muted-text-color);">No lessons in this topic yet.</p>'}
          </div>
        `;
      }).join('');

      return `
        <div class="jum-prev-unit">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1.5px solid var(--border-color);padding-bottom:10px;margin-bottom:12px;">
            <div>
              <span style="font-size:12px;font-weight:800;color:var(--primary-color);text-transform:uppercase;">Unit ${uIdx + 1}</span>
              <h4 style="font-family:var(--font-heading);font-size:18px;font-weight:800;color:var(--heading-color);margin:2px 0;">
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
              <button type="button" class="jum-btn-card-secondary" style="padding:4px 8px;font-size:11px;" onclick="alert('Opening ' + '${escapeHtml(r.name)}')">Open</button>
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
        Course Syllabus &amp; Interactive LMS Modules
      </h3>
      ${unitsHtml || '<p>No units added yet.</p>'}
      ${resHtml}
    `;

    modal.classList.add('active');
  }

  function closeCoursePreviewModal() {
    const modal = document.getElementById('jum-modal-course-preview');
    if (modal) modal.classList.remove('active');
  }

  // ── 10.12 Template Creator Modal Logic ──
  function openCreateTemplateModal(sourceCourseId) {
    const modal = document.getElementById('jum-modal-create-template');
    if (!modal) return;

    let prefill = null;
    if (sourceCourseId) {
      prefill = activeCourses.find(c => c.id === sourceCourseId);
    }

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('jum-input-tpl-name', prefill ? prefill.title + ' (Template)' : '');
    setVal('jum-input-tpl-subject', prefill ? prefill.subject : 'General Inclusive');
    setVal('jum-input-tpl-grade', prefill ? prefill.grade : 'All Grades');
    setVal('jum-tpl-desc', prefill ? prefill.desc : '');
    setVal('jum-input-tpl-source-course-id', sourceCourseId || '');

    modal.classList.add('active');
  }

  function closeCreateTemplateModal() {
    const modal = document.getElementById('jum-modal-create-template');
    if (modal) modal.classList.remove('active');
  }

  function handleCreateTemplateFormSubmit(e) {
    if (e) e.preventDefault();
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

    const name = getVal('jum-input-tpl-name');
    if (!name) {
      alert('Please enter a template name.');
      return;
    }

    const category = getVal('jum-input-tpl-subject');
    const grade = getVal('jum-input-tpl-grade');
    const desc = getVal('jum-tpl-desc');
    const sourceId = getVal('jum-input-tpl-source-course-id');

    let templateUnits = [];
    let templateCurriculum = {};

    if (sourceId) {
      const src = activeCourses.find(c => c.id === sourceId);
      if (src) {
        templateUnits = JSON.parse(JSON.stringify(src.units || []));
        templateCurriculum = JSON.parse(JSON.stringify(src.curriculum || {}));
      }
    }

    loadCustomTemplates();
    customTemplates.push({
      id: 'tpl-custom-' + Date.now(),
      name: name,
      subject: category,
      grade: grade,
      desc: desc || 'Custom educator template.',
      curriculum: templateCurriculum,
      units: templateUnits
    });
    saveCustomTemplates(customTemplates);

    closeCreateTemplateModal();
    updateStudioStats();
    alert('🎉 Custom template "' + name + '" created successfully!');
  }

  function deleteCustomTemplate(templateId) {
    if (confirm('Delete this custom template?')) {
      loadCustomTemplates();
      customTemplates = customTemplates.filter(t => t.id !== templateId);
      saveCustomTemplates(customTemplates);
      updateStudioStats();
    }
  }

  // ── 10.13 Course Actions: Duplicate, Archive, Delete ──
  function duplicateCourse(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    const copy = JSON.parse(JSON.stringify(course));
    copy.id = 'crs-' + Date.now();
    copy.title = course.title + ' (Copy)';
    copy.code = (course.code || 'CRS') + '-CPY';
    copy.status = 'draft';
    copy.createdAt = new Date().toISOString();

    activeCourses.unshift(copy);
    saveCourses(activeCourses);
    renderCoursesGrid();
    alert('Course duplicated as draft: ' + copy.title);
  }

  function toggleArchiveCourse(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    if (course.status === 'archived') {
      course.status = 'draft';
      alert('Course unarchived.');
    } else {
      course.status = 'archived';
      alert('Course archived.');
    }

    saveCourses(activeCourses);
    renderCoursesGrid();
  }

  function confirmDeleteCourse(courseId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    showConfirmDialog(
      'Delete Course',
      'Are you sure you want to permanently delete "' + course.title + '"? All associated lessons, notes, materials, assignments, and quizzes will be removed.',
      () => {
        activeCourses = activeCourses.filter(c => c.id !== courseId);
        saveCourses(activeCourses);
        renderCoursesGrid();
        if (currentViewingCourseId === courseId) {
          closeCourseLessonsViewer();
        }
      }
    );
  }

  function showConfirmDialog(title, message, onConfirm) {
    const modal = document.getElementById('jum-modal-confirm');
    const titleEl = document.getElementById('jum-confirm-title');
    const msgEl = document.getElementById('jum-confirm-message');
    const okBtn = document.getElementById('jum-btn-confirm-accept');

    if (!modal) {
      if (confirm(message)) onConfirm();
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

  // ── 10.14 Export, Import, Reset ──
  function exportAllCourses() {
    const data = {
      version: 'jumuishi-lms-v3',
      exportDate: new Date().toISOString(),
      courses: activeCourses,
      customTemplates: customTemplates
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jumuishi-courses-backup-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importBackupData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data.courses)) {
          activeCourses = data.courses;
          saveCourses(activeCourses);
        }
        if (Array.isArray(data.customTemplates)) {
          customTemplates = data.customTemplates;
          saveCustomTemplates(customTemplates);
        }
        renderCoursesGrid();
        updateStudioStats();
        alert('Data successfully imported from backup file!');
      } catch (err) {
        alert('Invalid JSON file. Please provide a valid Jumuishi backup file.');
      }
    };
    reader.readAsText(file);
  }

  function resetExemplars() {
    if (confirm('Reset to default exemplar courses? Any custom courses you created will be preserved unless you overwrite them.')) {
      const exemplars = getDefaultExemplarCourses();
      exemplars.forEach(ex => {
        const existingIdx = activeCourses.findIndex(c => c.id === ex.id);
        if (existingIdx !== -1) {
          activeCourses[existingIdx] = ex;
        } else {
          activeCourses.push(ex);
        }
      });
      saveCourses(activeCourses);
      renderCoursesGrid();
      updateStudioStats();
      alert('Exemplar courses have been restored!');
    }
  }

  // ── 10.15 Single Lesson Modal (Quick Add / Edit) ──
  function openLessonModal(courseId, lessonId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    currentViewingCourseId = courseId;
    currentEditingLessonId = lessonId;

    const modal = document.getElementById('jum-modal-lesson');
    const titleText = document.getElementById('jum-modal-lesson-heading-text');
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    let lesson = null;
    if (lessonId) {
      syncCourseFlatLessons(course);
      lesson = (course.lessons || []).find(l => l.id === lessonId);
    }

    if (titleText) titleText.textContent = lesson ? 'Edit Lesson: ' + lesson.title : 'Add New Lesson to ' + course.title;

    setVal('jum-input-lesson-title', lesson ? lesson.title : '');
    setVal('jum-input-lesson-number', lesson ? lesson.lessonNumber : '1');
    setVal('jum-input-lesson-duration', lesson ? lesson.duration : '35 mins');
    setVal('jum-input-lesson-date', lesson ? lesson.date : '');
    setVal('jum-input-lesson-outcome', lesson ? lesson.outcome : '');
    setVal('jum-input-lesson-intro', lesson ? lesson.intro : '');
    setVal('jum-input-lesson-guided', lesson ? lesson.guided : '');
    setVal('jum-input-lesson-activity', lesson ? lesson.activity : '');
    setVal('jum-input-lesson-wrapup', lesson ? lesson.wrapup : '');
    setVal('jum-input-lesson-tier1', lesson ? lesson.tier1 : '');
    setVal('jum-input-lesson-tier2', lesson ? lesson.tier2 : '');
    setVal('jum-input-lesson-tier3', lesson ? lesson.tier3 : '');
    setVal('jum-input-lesson-materials', lesson ? lesson.materials : '');
    setVal('jum-input-lesson-reflection', lesson ? lesson.reflection : '');
    setVal('jum-input-lesson-homework', lesson ? lesson.homework : '');

    if (modal) modal.classList.add('active');
  }

  function closeLessonModal() {
    const modal = document.getElementById('jum-modal-lesson');
    if (modal) modal.classList.remove('active');
    currentEditingLessonId = null;
  }

  function handleLessonFormSubmit(e) {
    if (e) e.preventDefault();
    const course = activeCourses.find(c => c.id === currentViewingCourseId);
    if (!course) return;

    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const title = getVal('jum-input-lesson-title');
    if (!title) {
      alert('Please enter a lesson title.');
      return;
    }

    let lesson = null;
    if (currentEditingLessonId) {
      lesson = findLessonByIdAcrossAllCourses(currentEditingLessonId);
    }

    if (!lesson) {
      lesson = {
        id: 'les-' + Date.now(),
        resources: [],
        assignment: { id: 'asg-' + Date.now(), title: 'Assignment: ' + title, maxPoints: 20, submissionTypes: ['photo'], rubric: [] },
        quiz: { id: 'quiz-' + Date.now(), title: 'Quiz: ' + title, questions: [] }
      };
      if (!Array.isArray(course.units) || course.units.length === 0) {
        course.units = [{ id: 'unit-' + Date.now(), title: 'Unit 1', topics: [{ id: 'top-' + Date.now(), title: 'Topic 1', lessons: [] }] }];
      }
      if (!course.units[0].topics || course.units[0].topics.length === 0) {
        course.units[0].topics = [{ id: 'top-' + Date.now(), title: 'Topic 1', lessons: [] }];
      }
      course.units[0].topics[0].lessons.push(lesson);
    }

    lesson.title = title;
    lesson.lessonNumber = getVal('jum-input-lesson-number') || '1';
    lesson.duration = getVal('jum-input-lesson-duration') || '35 mins';
    lesson.date = getVal('jum-input-lesson-date');
    lesson.outcome = getVal('jum-input-lesson-outcome');
    lesson.intro = getVal('jum-input-lesson-intro');
    lesson.guided = getVal('jum-input-lesson-guided');
    lesson.activity = getVal('jum-input-lesson-activity');
    lesson.wrapup = getVal('jum-input-lesson-wrapup');
    lesson.tier1 = getVal('jum-input-lesson-tier1');
    lesson.tier2 = getVal('jum-input-lesson-tier2');
    lesson.tier3 = getVal('jum-input-lesson-tier3');
    lesson.materials = getVal('jum-input-lesson-materials');
    lesson.reflection = getVal('jum-input-lesson-reflection');
    lesson.homework = getVal('jum-input-lesson-homework');

    saveCourses(activeCourses);
    closeLessonModal();
    openCourseLessonsViewer(course.id);
  }

  function deleteLesson(courseId, lessonId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;

    if (confirm('Are you sure you want to delete this lesson?')) {
      if (Array.isArray(course.units)) {
        course.units.forEach(u => {
          if (Array.isArray(u.topics)) {
            u.topics.forEach(t => {
              if (Array.isArray(t.lessons)) {
                t.lessons = t.lessons.filter(l => l.id !== lessonId);
              }
            });
          }
        });
      }
      saveCourses(activeCourses);
      openCourseLessonsViewer(courseId);
    }
  }

  function openLessonPreviewModal(courseId, lessonId) {
    const course = activeCourses.find(c => c.id === courseId);
    if (!course) return;
    syncCourseFlatLessons(course);
    const lesson = (course.lessons || []).find(l => l.id === lessonId);
    if (!lesson) return;

    const modal = document.getElementById('jum-modal-lesson-preview');
    const titleEl = document.getElementById('jum-preview-lesson-modal-title');
    const bodyEl = document.getElementById('jum-preview-lesson-modal-content');

    if (titleEl) titleEl.textContent = lesson.title;
    if (bodyEl) {
      bodyEl.innerHTML = renderLmsLessonPlayer(lesson, 'single-prev-' + lesson.id, { initialTab: 'notes' });
    }
    if (modal) modal.classList.add('active');
  }

  function closeLessonPreviewModal() {
    const modal = document.getElementById('jum-modal-lesson-preview');
    if (modal) modal.classList.remove('active');
  }

  // ── 10.16 AI Bridge Modal (Save generated lesson from Section 4 into Course) ──
  function openBridgeModal(courseId) {
    const modal = document.getElementById('jum-modal-save-to-course');
    if (!modal) return;

    const selectEl = document.getElementById('jum-bridge-select-course');
    if (selectEl) {
      selectEl.innerHTML = activeCourses.map(c => `
        <option value="${c.id}" ${c.id === courseId ? 'selected' : ''}>${escapeHtml(c.title)} (${escapeHtml(c.grade || 'All')})</option>
      `).join('');
    }

    modal.classList.add('active');
  }

  function closeBridgeModal() {
    const modal = document.getElementById('jum-modal-save-to-course');
    if (modal) modal.classList.remove('active');
  }

  function handleBridgeFormSubmit(e) {
    if (e) e.preventDefault();
    const selectEl = document.getElementById('jum-bridge-select-course');
    const targetCourseId = selectEl ? selectEl.value : null;
    const course = activeCourses.find(c => c.id === targetCourseId);
    if (!course) {
      alert('Please select a course.');
      return;
    }

    const titleEl = document.getElementById('jum-output-title');
    const bodyEl = document.getElementById('jum-output-body');
    const title = titleEl ? titleEl.textContent : 'AI Adapted Inclusive Lesson';
    const body = bodyEl ? bodyEl.innerHTML : '<p>Lesson content</p>';

    if (!Array.isArray(course.units) || course.units.length === 0) {
      course.units = [{ id: 'unit-' + Date.now(), title: 'Unit 1: Adapted Units', topics: [{ id: 'top-' + Date.now(), title: 'Topic 1', lessons: [] }] }];
    }
    if (!course.units[0].topics || course.units[0].topics.length === 0) {
      course.units[0].topics = [{ id: 'top-' + Date.now(), title: 'Topic 1', lessons: [] }];
    }

    const newLesson = {
      id: 'les-ai-' + Date.now(),
      lessonNumber: String((course.lessons || []).length + 1),
      title: title,
      duration: '35 mins',
      date: new Date().toISOString().split('T')[0],
      outcome: 'Learners demonstrate mastery of adapted inclusive concept.',
      contentHtml: body,
      notesHtml: body,
      resources: [],
      assignment: { id: 'asg-' + Date.now(), title: 'Assignment: ' + title, maxPoints: 20, submissionTypes: ['photo'], rubric: [] },
      quiz: { id: 'quiz-' + Date.now(), title: 'Quiz: ' + title, questions: [] }
    };

    course.units[0].topics[0].lessons.push(newLesson);
    saveCourses(activeCourses);
    closeBridgeModal();
    alert('🎉 Adapted lesson saved into ' + course.title + '!');
    openCourseLessonsViewer(course.id);
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
    // 1. Dropdown Toggle Buttons
    const btnCreateCourse = document.getElementById('jum-btn-create-course');
    const btnCreateToggle = document.getElementById('jum-btn-create-course-toggle');
    const menuCreateCourse = document.getElementById('jum-menu-create-course');

    if (btnCreateCourse) {
      btnCreateCourse.addEventListener('click', () => {
        closeAllDropdownMenus();
        openCourseWizard('create');
      });
    }

    if (btnCreateToggle) {
      btnCreateToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShown = menuCreateCourse && menuCreateCourse.style.display === 'block';
        closeAllDropdownMenus();
        if (menuCreateCourse && !isShown) menuCreateCourse.style.display = 'block';
      });
    }

    const btnTemplates = document.getElementById('jum-btn-create-template');
    const btnTemplatesToggle = document.getElementById('jum-btn-templates-toggle');
    const menuTemplates = document.getElementById('jum-menu-templates');

    if (btnTemplates) {
      btnTemplates.addEventListener('click', () => {
        closeAllDropdownMenus();
        openChooseTemplateModal();
      });
    }

    if (btnTemplatesToggle) {
      btnTemplatesToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShown = menuTemplates && menuTemplates.style.display === 'block';
        closeAllDropdownMenus();
        if (menuTemplates && !isShown) menuTemplates.style.display = 'block';
      });
    }

    // Dropdown menu actions
    if (menuCreateCourse) {
      menuCreateCourse.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          closeAllDropdownMenus();
          const act = btn.getAttribute('data-action');
          if (act === 'menu-create-scratch') openCourseWizard('create');
          else if (act === 'menu-create-template') openChooseTemplateModal();
          else if (act === 'menu-create-import') {
            const fi = document.getElementById('jum-input-import-backup');
            if (fi) fi.click();
          }
        });
      });
    }

    if (menuTemplates) {
      menuTemplates.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          closeAllDropdownMenus();
          const act = btn.getAttribute('data-action');
          if (act === 'menu-tpl-browse') openChooseTemplateModal();
          else if (act === 'menu-tpl-create') openCreateTemplateModal();
        });
      });
    }

    // Tab buttons Courses vs Templates
    const tabCourses = document.getElementById('jum-tab-btn-courses');
    const tabTpl = document.getElementById('jum-tab-btn-templates');
    const viewCourses = document.getElementById('jum-studio-courses-view');
    const viewTpl = document.getElementById('jum-studio-templates-view');

    if (tabCourses && tabTpl && viewCourses && viewTpl) {
      tabCourses.addEventListener('click', () => {
        tabCourses.classList.add('active');
        tabTpl.classList.remove('active');
        viewCourses.style.display = 'block';
        viewTpl.style.display = 'none';
      });

      tabTpl.addEventListener('click', () => {
        tabTpl.classList.add('active');
        tabCourses.classList.remove('active');
        viewTpl.style.display = 'block';
        viewCourses.style.display = 'none';
      });
    }

    // Filters & Search
    const searchCourses = document.getElementById('jum-course-search');
    const filterGrade = document.getElementById('jum-course-filter-grade');
    const filterNeed = document.getElementById('jum-course-filter-need');

    if (searchCourses) searchCourses.addEventListener('input', renderCoursesGrid);
    if (filterGrade) filterGrade.addEventListener('change', renderCoursesGrid);
    if (filterNeed) filterNeed.addEventListener('change', renderCoursesGrid);

    // Header actions
    const btnExport = document.getElementById('jum-btn-export-all');
    if (btnExport) btnExport.addEventListener('click', exportAllCourses);

    const btnImport = document.getElementById('jum-btn-import-backup-trigger');
    const inputImport = document.getElementById('jum-input-import-backup');
    if (btnImport && inputImport) {
      btnImport.addEventListener('click', () => inputImport.click());
      inputImport.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBackupData(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    const btnResetExemplars = document.getElementById('jum-btn-reset-exemplars');
    if (btnResetExemplars) btnResetExemplars.addEventListener('click', resetExemplars);

    // Empty state buttons
    const btnEmptyCreate = document.getElementById('jum-btn-empty-create');
    const btnEmptyTpl = document.getElementById('jum-btn-empty-browse-templates');
    const btnEmptyReset = document.getElementById('jum-btn-empty-reset');

    if (btnEmptyCreate) btnEmptyCreate.addEventListener('click', () => openCourseWizard('create'));
    if (btnEmptyTpl) btnEmptyTpl.addEventListener('click', openChooseTemplateModal);
    if (btnEmptyReset) btnEmptyReset.addEventListener('click', resetExemplars);

    // Choose Template Modal
    const btnCloseChooseTpl = document.getElementById('jum-btn-choose-template-close');
    const btnCancelChooseTpl = document.getElementById('jum-btn-choose-template-cancel');
    const btnBlankChooseTpl = document.getElementById('jum-btn-choose-template-blank');

    if (btnCloseChooseTpl) btnCloseChooseTpl.addEventListener('click', closeChooseTemplateModal);
    if (btnCancelChooseTpl) btnCancelChooseTpl.addEventListener('click', closeChooseTemplateModal);
    if (btnBlankChooseTpl) {
      btnBlankChooseTpl.addEventListener('click', () => {
        closeChooseTemplateModal();
        openCourseWizard('create');
      });
    }

    // Wizard Modal Header Actions
    const btnWizardClose = document.getElementById('jum-btn-wizard-close');
    const btnWizardPreview = document.getElementById('jum-btn-wizard-preview');
    const btnWizardDraft = document.getElementById('jum-btn-wizard-save-draft');
    const btnWizardPublish = document.getElementById('jum-btn-wizard-publish');

    if (btnWizardClose) btnWizardClose.addEventListener('click', closeCourseWizard);
    if (btnWizardPreview) {
      btnWizardPreview.addEventListener('click', () => {
        if (wizardCourse) {
          readWizardStep1();
          readWizardStep2();
          if (wizardCurrentStep === 4) readWizardStep4();
          syncCourseFlatLessons(wizardCourse);
          openCoursePreviewModal(wizardCourse.id);
        }
      });
    }
    if (btnWizardDraft) btnWizardDraft.addEventListener('click', () => saveWizardCourse(false));
    if (btnWizardPublish) btnWizardPublish.addEventListener('click', publishWizardCourse);

    // Wizard Step Navigation
    for (let i = 1; i <= 4; i++) {
      const stepBtn = document.getElementById('jum-step-btn-' + i);
      if (stepBtn) {
        stepBtn.addEventListener('click', () => goToWizardStep(i));
      }
    }

    const btnWizPrev = document.getElementById('jum-btn-wizard-prev');
    const btnWizNext = document.getElementById('jum-btn-wizard-next');
    const btnWizDraftFooter = document.getElementById('jum-wiz-btn-draft');

    if (btnWizPrev) btnWizPrev.addEventListener('click', prevWizardStep);
    if (btnWizNext) btnWizNext.addEventListener('click', nextWizardStep);
    if (btnWizDraftFooter) btnWizDraftFooter.addEventListener('click', () => saveWizardCourse(false));

    // Step 3 Hierarchy Tree Actions
    const btnTreeAddUnit = document.getElementById('jum-btn-tree-add-unit');
    const btnTreeAddLessonQuick = document.getElementById('jum-btn-tree-add-lesson-quick');
    const btnTreeCollapseAll = document.getElementById('jum-btn-tree-collapse-all');
    const btnTreeExpandAll = document.getElementById('jum-btn-tree-expand-all');

    if (btnTreeAddUnit) btnTreeAddUnit.addEventListener('click', addWizardUnit);
    if (btnTreeAddLessonQuick) btnTreeAddLessonQuick.addEventListener('click', addWizardLessonQuick);

    if (btnTreeCollapseAll) {
      btnTreeCollapseAll.addEventListener('click', () => {
        document.querySelectorAll('.jum-tree-topics-group, .jum-tree-lessons-group').forEach(g => g.style.display = 'none');
      });
    }
    if (btnTreeExpandAll) {
      btnTreeExpandAll.addEventListener('click', () => {
        document.querySelectorAll('.jum-tree-topics-group, .jum-tree-lessons-group').forEach(g => g.style.display = 'block');
      });
    }

    // ── Step 4 LMS Module Tab Navigation ──
    const btnLmsNotes = document.getElementById('jum-lms-btn-notes');
    const btnLmsMaterials = document.getElementById('jum-lms-btn-materials');
    const btnLmsAssignment = document.getElementById('jum-lms-btn-assignment');
    const btnLmsQuiz = document.getElementById('jum-lms-btn-quiz');

    if (btnLmsNotes) btnLmsNotes.addEventListener('click', () => switchLmsModuleTab('notes'));
    if (btnLmsMaterials) btnLmsMaterials.addEventListener('click', () => switchLmsModuleTab('materials'));
    if (btnLmsAssignment) btnLmsAssignment.addEventListener('click', () => switchLmsModuleTab('assignment'));
    if (btnLmsQuiz) btnLmsQuiz.addEventListener('click', () => switchLmsModuleTab('quiz'));

    // Step 4 Lesson Selector
    const lessonSelectP4 = document.getElementById('jum-wiz-content-lesson-select');
    if (lessonSelectP4) {
      lessonSelectP4.addEventListener('change', (e) => {
        readWizardStep4();
        loadLessonIntoEditor(e.target.value);
      });
    }

    // Step 4 Rich Editor Toolbar & Callouts
    const formatSelect = document.getElementById('jum-editor-format');
    if (formatSelect) {
      formatSelect.addEventListener('change', (e) => {
        execEditorCommand('formatBlock', e.target.value);
        e.target.value = '';
      });
    }

    const btnInsTable = document.getElementById('jum-btn-insert-table');
    if (btnInsTable) {
      btnInsTable.addEventListener('click', () => {
        const tableHtml = '<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr style="background:#F1F5F9;"><th style="border:1px solid #CBD5E1;padding:8px;">Stage</th><th style="border:1px solid #CBD5E1;padding:8px;">Concrete Focus</th></tr></thead><tbody><tr><td style="border:1px solid #CBD5E1;padding:8px;">Step 1</td><td style="border:1px solid #CBD5E1;padding:8px;">Tactile Exploration</td></tr></tbody></table><p></p>';
        document.execCommand('insertHTML', false, tableHtml);
      });
    }

    const btnInsLink = document.getElementById('jum-btn-insert-link');
    if (btnInsLink) {
      btnInsLink.addEventListener('click', () => {
        const url = prompt('Enter the link URL:', 'https://');
        if (url) execEditorCommand('createLink', url);
      });
    }

    const btnInsImg = document.getElementById('jum-btn-insert-image');
    if (btnInsImg) {
      btnInsImg.addEventListener('click', () => {
        const url = prompt('Enter the image URL:', 'https://');
        if (url) execEditorCommand('insertImage', url);
      });
    }

    const btnInsMedia = document.getElementById('jum-btn-insert-media');
    if (btnInsMedia) {
      btnInsMedia.addEventListener('click', () => {
        const embedUrl = prompt('Enter YouTube or Media Embed URL:', 'https://www.youtube.com/embed/');
        if (embedUrl) {
          const embedHtml = '<div style="margin:12px 0;aspect-ratio:16/9;"><iframe src="' + embedUrl + '" style="width:100%;height:100%;border-radius:8px;border:none;" allowfullscreen></iframe></div><p></p>';
          document.execCommand('insertHTML', false, embedHtml);
        }
      });
    }

    const btnCallTeacher = document.getElementById('jum-btn-insert-teacher-note');
    const btnCallLearner = document.getElementById('jum-btn-insert-learner-inst');
    const btnCallPractical = document.getElementById('jum-btn-insert-practical-act');
    const btnCallTier = document.getElementById('jum-btn-insert-tier-block');
    const btnCallAccom = document.getElementById('jum-btn-insert-accom-block');

    if (btnCallTeacher) btnCallTeacher.addEventListener('click', () => insertCalloutIntoEditor('teacher'));
    if (btnCallLearner) btnCallLearner.addEventListener('click', () => insertCalloutIntoEditor('learner'));
    if (btnCallPractical) btnCallPractical.addEventListener('click', () => insertCalloutIntoEditor('practical'));
    if (btnCallTier) btnCallTier.addEventListener('click', () => insertCalloutIntoEditor('tier'));
    if (btnCallAccom) btnCallAccom.addEventListener('click', () => insertCalloutIntoEditor('accom'));

    // Step 4 Materials Panel Actions
    const btnAddMatToggle = document.getElementById('jum-lms-btn-add-mat-toggle');
    const btnCancelMat = document.getElementById('jum-lms-btn-cancel-mat');
    const btnSaveMat = document.getElementById('jum-lms-btn-save-mat');

    if (btnAddMatToggle) btnAddMatToggle.addEventListener('click', () => toggleLmsMaterialAdder());
    if (btnCancelMat) btnCancelMat.addEventListener('click', () => toggleLmsMaterialAdder(false));
    if (btnSaveMat) btnSaveMat.addEventListener('click', addLmsMaterialToActiveLesson);

    // Step 4 Assignment Panel Actions
    const btnAddRubric = document.getElementById('jum-btn-add-rubric-row');
    if (btnAddRubric) btnAddRubric.addEventListener('click', addLmsRubricCriterion);

    // Step 4 Quiz Panel Actions
    const btnAddQuizQ = document.getElementById('jum-btn-add-quiz-q');
    if (btnAddQuizQ) btnAddQuizQ.addEventListener('click', addLmsQuizQuestion);

    // Step 4 inputs auto-save
    const p4 = document.getElementById('jum-wizard-panel-4');
    if (p4) {
      p4.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => updateAutoSaveStatus('modified'));
      });
    }
    const richEditor = document.getElementById('jum-rich-editor');
    if (richEditor) {
      richEditor.addEventListener('input', () => updateAutoSaveStatus('modified'));
    }

    // Resources Manager Modal Actions
    const btnCloseRes = document.getElementById('jum-btn-res-modal-close');
    const btnUploadRes = document.getElementById('jum-res-dropzone');
    const inputResUpload = document.getElementById('jum-res-file-input');

    if (btnCloseRes) btnCloseRes.addEventListener('click', closeCourseResourcesModal);
    if (btnUploadRes && inputResUpload) {
      btnUploadRes.addEventListener('click', () => inputResUpload.click());
      inputResUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleResourceFilesAdded(e.target.files);
          e.target.value = '';
        }
      });
    }

    // Preview Modal Actions
    const btnClosePrev = document.getElementById('jum-btn-prev-modal-close');
    const btnDonePrev = document.getElementById('jum-btn-prev-modal-done');
    const btnEditPrev = document.getElementById('jum-btn-prev-modal-edit');
    const btnPrintPrev = document.getElementById('jum-btn-prev-print');

    if (btnClosePrev) btnClosePrev.addEventListener('click', closeCoursePreviewModal);
    if (btnDonePrev) btnDonePrev.addEventListener('click', closeCoursePreviewModal);
    if (btnEditPrev) {
      btnEditPrev.addEventListener('click', () => {
        closeCoursePreviewModal();
        if (currentViewingCourseId) openCourseWizard('edit', currentViewingCourseId);
      });
    }
    if (btnPrintPrev) {
      btnPrintPrev.addEventListener('click', () => window.print());
    }

    // Course Lessons Viewer Actions
    const btnCloseViewer = document.getElementById('jum-btn-viewer-close');
    const btnViewerAddLesson = document.getElementById('jum-btn-viewer-add-lesson');
    const btnViewerEditCourse = document.getElementById('jum-btn-viewer-edit-course');
    const btnViewerPreview = document.getElementById('jum-btn-viewer-preview-course');
    const btnViewerResources = document.getElementById('jum-btn-viewer-manage-resources');

    if (btnCloseViewer) btnCloseViewer.addEventListener('click', closeCourseLessonsViewer);
    if (btnViewerAddLesson) {
      btnViewerAddLesson.addEventListener('click', () => {
        if (currentViewingCourseId) openLessonModal(currentViewingCourseId);
      });
    }
    if (btnViewerEditCourse) {
      btnViewerEditCourse.addEventListener('click', () => {
        if (currentViewingCourseId) {
          closeCourseLessonsViewer();
          openCourseWizard('edit', currentViewingCourseId);
        }
      });
    }
    if (btnViewerPreview) {
      btnViewerPreview.addEventListener('click', () => {
        if (currentViewingCourseId) openCoursePreviewModal(currentViewingCourseId);
      });
    }
    if (btnViewerResources) {
      btnViewerResources.addEventListener('click', () => {
        if (currentViewingCourseId) openCourseResourcesModal(currentViewingCourseId);
      });
    }

    // Single Lesson Modal Actions
    const btnCloseLessonModal = document.getElementById('jum-btn-lesson-modal-close');
    const btnCancelLessonModal = document.getElementById('jum-btn-lesson-modal-cancel');
    const formLesson = document.getElementById('jum-form-lesson');

    if (btnCloseLessonModal) btnCloseLessonModal.addEventListener('click', closeLessonModal);
    if (btnCancelLessonModal) btnCancelLessonModal.addEventListener('click', closeLessonModal);
    if (formLesson) formLesson.addEventListener('submit', handleLessonFormSubmit);

    // Single Lesson Preview Modal Actions
    const btnCloseLesPrev = document.getElementById('jum-btn-preview-modal-close');
    const btnDoneLesPrev = document.getElementById('jum-btn-preview-modal-done');

    if (btnCloseLesPrev) btnCloseLesPrev.addEventListener('click', closeLessonPreviewModal);
    if (btnDoneLesPrev) btnDoneLesPrev.addEventListener('click', closeLessonPreviewModal);

    // Custom Template Creator Modal Actions
    const btnCloseTplModal = document.getElementById('jum-btn-create-tpl-close');
    const btnCancelTplModal = document.getElementById('jum-btn-create-tpl-cancel');
    const formTemplate = document.getElementById('jum-form-create-template');

    if (btnCloseTplModal) btnCloseTplModal.addEventListener('click', closeCreateTemplateModal);
    if (btnCancelTplModal) btnCancelTplModal.addEventListener('click', closeCreateTemplateModal);
    if (formTemplate) formTemplate.addEventListener('submit', handleCreateTemplateFormSubmit);

    // AI Bridge Modal Actions
    const btnSaveToCourse = document.getElementById('jum-btn-save-to-course');
    const btnCloseBridge = document.getElementById('jum-btn-bridge-modal-close');
    const btnCancelBridge = document.getElementById('jum-btn-bridge-cancel');
    const formBridge = document.getElementById('jum-form-bridge');

    if (btnSaveToCourse) btnSaveToCourse.addEventListener('click', () => openBridgeModal());
    if (btnCloseBridge) btnCloseBridge.addEventListener('click', closeBridgeModal);
    if (btnCancelBridge) btnCancelBridge.addEventListener('click', closeBridgeModal);
    if (formBridge) formBridge.addEventListener('submit', handleBridgeFormSubmit);

    // Confirm Dialog Actions
    const btnConfirmCancel = document.getElementById('jum-btn-confirm-cancel');
    const btnConfirmOk = document.getElementById('jum-btn-confirm-accept');

    if (btnConfirmCancel) btnConfirmCancel.addEventListener('click', closeConfirmDialog);
    if (btnConfirmOk) {
      btnConfirmOk.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        closeConfirmDialog();
      });
    }

    // Global document click to dismiss dropdowns
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.jum-split-btn-wrap') && !e.target.closest('.jum-card-actions-menu')) {
        closeAllDropdownMenus();
      }
    });

    // Auto-save interval (every 30s if unsaved changes)
    wizardAutoSaveTimer = setInterval(() => {
      const modal = document.getElementById('jum-modal-course-wizard');
      if (modal && modal.classList.contains('active') && hasUnsavedChanges) {
        triggerWizardAutoSave();
      }
    }, 30000);

    // Initial load
    loadCourses();
    loadCustomTemplates();
    updateStudioStats();
    renderCoursesGrid();
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
