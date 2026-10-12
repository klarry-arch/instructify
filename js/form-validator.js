/* ============================================================
   INSTRUCTIFY KENYA — FORM VALIDATION ENGINE
   Centralised, real-time validation with inline error messages,
   input highlighting, and step-blocking enforcement.
   
   Usage:
     FormValidator.validate(fieldId, rules)
     FormValidator.validateGroup(fieldConfigs) → { valid, errors }
     FormValidator.clearErrors(containerId)
     FormValidator.attachLiveValidation(fieldId, rules)
   ============================================================ */

(function (window) {
  'use strict';

  // ── CSS injection (once) ────────────────────────────────────
  const STYLE_ID = 'ik-form-validator-styles';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Error state for inputs */
      .fv-error {
        border-color: #DC2626 !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12) !important;
        animation: fv-shake 0.35s ease-in-out;
      }
      /* Success state for inputs */
      .fv-valid {
        border-color: #10B981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.10) !important;
      }
      /* Error message */
      .fv-error-msg {
        display: flex;
        align-items: flex-start;
        gap: 5px;
        color: #DC2626;
        font-size: 12.5px;
        font-weight: 600;
        margin-top: 5px;
        line-height: 1.4;
        animation: fv-slideDown 0.2s ease-out;
      }
      .fv-error-msg svg {
        flex-shrink: 0;
        margin-top: 1px;
      }
      /* Shake animation */
      @keyframes fv-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(5px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(2px); }
      }
      @keyframes fv-slideDown {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      /* Error summary banner */
      .fv-error-banner {
        background: #FEF2F2;
        border: 1.5px solid #FECACA;
        border-radius: 12px;
        padding: 14px 18px;
        margin-bottom: 20px;
        animation: fv-slideDown 0.25s ease-out;
      }
      .fv-error-banner-title {
        font-size: 14px;
        font-weight: 700;
        color: #991B1B;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .fv-error-banner ul {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;
        color: #991B1B;
        line-height: 1.8;
      }
    `;
    document.head.appendChild(style);
  }

  const ERROR_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  // ── Rule definitions ────────────────────────────────────────
  const RULES = {
    required: function (value, label) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return (label || 'This field') + ' is required.';
      }
      return null;
    },
    minLength: function (value, minLen, label) {
      if (value && value.trim().length < minLen) {
        return (label || 'This field') + ' must be at least ' + minLen + ' characters.';
      }
      return null;
    },
    maxLength: function (value, maxLen, label) {
      if (value && value.trim().length > maxLen) {
        return (label || 'This field') + ' must be no more than ' + maxLen + ' characters.';
      }
      return null;
    },
    email: function (value, label) {
      if (!value || !value.trim()) return null; // Let 'required' handle empty
      const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!re.test(value.trim())) {
        return 'Please enter a valid email address (e.g. name@example.com).';
      }
      return null;
    },
    phone: function (value, label) {
      if (!value || !value.trim()) return null;
      const cleaned = value.replace(/[\s\-()]/g, '');
      // Kenyan phone: 07XX, 01XX, +254, 254
      const re = /^(\+?254|0)(7[0-9]{8}|1[0-9]{8})$/;
      if (!re.test(cleaned)) {
        return 'Enter a valid Kenyan phone number (e.g. 0712 345 678).';
      }
      return null;
    },
    safaricomPhone: function (value, label) {
      if (!value || !value.trim()) return null;
      const cleaned = value.replace(/[\s\-()]/g, '');
      // Normalise to 254 prefix
      let norm = cleaned;
      if (norm.startsWith('+')) norm = norm.slice(1);
      if (norm.startsWith('0')) norm = '254' + norm.slice(1);
      // Safaricom prefixes in Kenya:
      // 070X, 071X, 072X, 074[0-8], 079X, 075[7-9], 076[8-9], 011[0-5]
      const isSaf = /^254(70[0-9]|71[0-9]|72[0-9]|74[0-8]|79[0-9]|75[789]|76[89]|11[0-5])[0-9]{6}$/.test(norm);
      if (!isSaf) {
        return 'M-Pesa requires an active Safaricom number (e.g. 0712..., 0722..., 0110...).';
      }
      return null;
    },
    url: function (value, label) {
      if (!value || !value.trim()) return null;
      try {
        const u = new URL(value.trim());
        if (!['http:', 'https:'].includes(u.protocol)) throw new Error();
      } catch {
        return 'Please enter a valid URL (starting with https://).';
      }
      return null;
    },
    number: function (value, label) {
      if (!value && value !== 0) return null;
      if (isNaN(Number(value))) {
        return (label || 'This field') + ' must be a number.';
      }
      return null;
    },
    min: function (value, minVal, label) {
      if (!value && value !== 0) return null;
      if (Number(value) < minVal) {
        return (label || 'This value') + ' must be at least ' + minVal + '.';
      }
      return null;
    },
    max: function (value, maxVal, label) {
      if (!value && value !== 0) return null;
      if (Number(value) > maxVal) {
        return (label || 'This value') + ' must be no more than ' + maxVal + '.';
      }
      return null;
    },
    nameFormat: function (value, label) {
      if (!value || !value.trim()) return null;
      // Must contain at least first + last name (2 words), only letters, spaces, hyphens, apostrophes
      const trimmed = value.trim();
      if (!/^[A-Za-zÀ-ÿ\s'\-\.]+$/.test(trimmed)) {
        return 'Name should only contain letters, spaces, hyphens, and apostrophes.';
      }
      const parts = trimmed.split(/\s+/).filter(Boolean);
      if (parts.length < 2) {
        return 'Please enter your full name (first and last name).';
      }
      return null;
    },
    namePart: function (value, label) {
      if (!value || !value.trim()) return null;
      const trimmed = value.trim();
      if (!/^[A-Za-zÀ-ÿ\s'\-\.]+$/.test(trimmed)) {
        return (label || 'Name') + ' should only contain letters, hyphens, and apostrophes.';
      }
      if (trimmed.length < 2) {
        return (label || 'Name') + ' must be at least 2 characters.';
      }
      return null;
    },
    password: function (value, label) {
      if (!value) return null;
      const errors = [];
      if (value.length < 8) errors.push('at least 8 characters');
      if (!/[A-Z]/.test(value)) errors.push('one uppercase letter');
      if (!/[a-z]/.test(value)) errors.push('one lowercase letter');
      if (!/[0-9]/.test(value)) errors.push('one number');
      if (errors.length > 0) {
        return 'Password must contain ' + errors.join(', ') + '.';
      }
      return null;
    },
    match: function (value, otherFieldId, label) {
      const other = document.getElementById(otherFieldId);
      if (other && value !== other.value) {
        return (label || 'Fields') + ' do not match.';
      }
      return null;
    },
    date: function (value, label) {
      if (!value || !value.trim()) return null;
      const d = new Date(value);
      if (isNaN(d.getTime())) {
        return 'Please enter a valid date.';
      }
      return null;
    },
    futureDate: function (value, label) {
      if (!value || !value.trim()) return null;
      const d = new Date(value);
      if (isNaN(d.getTime()) || d <= new Date()) {
        return 'Date must be in the future.';
      }
      return null;
    },
    accessCode: function (value, label) {
      if (!value || !value.trim()) return null;
      if (!/^[A-Za-z0-9\-_]{3,20}$/.test(value.trim())) {
        return 'Access code must be 3–20 characters (letters, numbers, hyphens).';
      }
      return null;
    }
  };

  // ── Element resolution helper ────────────────────────────────
  function resolveElement(fieldOrId) {
    if (!fieldOrId) return null;
    if (typeof fieldOrId === 'string') {
      return document.getElementById(fieldOrId) || document.querySelector(`[name="${fieldOrId}"]`);
    }
    if (fieldOrId.nodeType) return fieldOrId;
    return null;
  }

  // ── Core: validate and error display ─────────────────────────
  function clearFieldError(fieldOrId) {
    const el = resolveElement(fieldOrId);
    if (!el) return;
    el.classList.remove('fv-error', 'fv-valid');
    const attrId = el.id || el.name || '';
    const container = el.closest('.form-group') || el.closest('.jum-form-group') || el.closest('.lms-form-group') || el.closest('.field-group') || el.parentNode;
    if (container) {
      const existing = container.querySelector('.fv-error-msg[data-for="' + attrId + '"]') ||
                       (attrId ? null : container.querySelector('.fv-error-msg'));
      if (existing) existing.remove();
    }
  }

  function showFieldError(fieldOrId, message) {
    const el = resolveElement(fieldOrId);
    if (!el) return;
    clearFieldError(el);
    el.classList.add('fv-error');

    let attrId = el.id || el.name;
    if (!attrId) {
      attrId = 'fv-el-' + Math.random().toString(36).substring(2, 9);
      el.id = attrId;
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = 'fv-error-msg';
    msgDiv.setAttribute('data-for', attrId);
    msgDiv.setAttribute('role', 'alert');
    msgDiv.innerHTML = ERROR_ICON + '<span>' + message + '</span>';

    if (el.nextSibling) {
      el.parentNode.insertBefore(msgDiv, el.nextSibling);
    } else {
      el.parentNode.appendChild(msgDiv);
    }
  }

  function showFieldValid(fieldOrId) {
    const el = resolveElement(fieldOrId);
    if (!el) return;
    clearFieldError(el);
    el.classList.add('fv-valid');
  }

  /**
   * Validate a single field against an array of rule configs.
   * @param {string|HTMLElement} fieldOrId
   * @param {Array} rules — e.g. [{ rule:'required', label:'Full Name' }, { rule:'minLength', param:3 }]
   * @returns {string|null} First error message, or null if valid
   */
  function validateField(fieldOrId, rules) {
    const el = resolveElement(fieldOrId);
    if (!el) return null;
    const value = (el.type === 'checkbox') ? el.checked : el.value;

    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      const ruleFn = RULES[r.rule];
      if (!ruleFn) continue;

      let error = null;
      if (['minLength', 'maxLength', 'min', 'max'].includes(r.rule)) {
        error = ruleFn(value, r.param, r.label);
      } else if (r.rule === 'match') {
        error = ruleFn(value, r.param, r.label);
      } else {
        error = ruleFn(value, r.label);
      }

      if (error) {
        showFieldError(el, error);
        return error;
      }
    }

    // All rules passed
    if (value && (typeof value !== 'string' || value.trim())) {
      showFieldValid(el);
    } else {
      clearFieldError(el);
    }
    return null;
  }

  /**
   * Validate a group of fields at once.
   * @param {Array} fieldConfigs — [{ id:'field-id', rules:[...] }, ...]
   * @returns {{ valid: boolean, errors: string[], firstErrorId: string|null }}
   */
  function validateGroup(fieldConfigs) {
    const errors = [];
    let firstErrorId = null;

    for (let i = 0; i < fieldConfigs.length; i++) {
      const config = fieldConfigs[i];
      const target = config.id || config.element;
      const error = validateField(target, config.rules);
      if (error) {
        errors.push(error);
        if (!firstErrorId) {
          const el = resolveElement(target);
          firstErrorId = (el && el.id) || config.id || null;
        }
      }
    }

    return { valid: errors.length === 0, errors: errors, firstErrorId: firstErrorId };
  }

  // ── Automatic Rule Deduction ────────────────────────────────
  function getElementLabel(el) {
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
    if (el.id) {
      const lbl = document.querySelector('label[for="' + el.id + '"]');
      if (lbl) return lbl.textContent.replace(/[*:]/g, '').trim();
    }
    const parentGroup = el.closest('.form-group, .jum-form-group, .lms-form-group, .field-group');
    if (parentGroup) {
      const lbl = parentGroup.querySelector('label');
      if (lbl) return lbl.textContent.replace(/[*:]/g, '').trim();
    }
    if (el.placeholder && !el.placeholder.startsWith('e.g.') && !el.placeholder.startsWith('+254')) {
      return el.placeholder.replace(/[*:]/g, '').trim();
    }
    const name = el.name || el.id || '';
    if (name) {
      return name.replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }
    return 'This field';
  }

  function deduceElementRules(el) {
    const rules = [];
    const label = getElementLabel(el);
    const id = (el.id || '').toLowerCase();
    const name = (el.name || '').toLowerCase();
    const type = (el.type || '').toLowerCase();

    // Required
    if (el.hasAttribute('required') || el.getAttribute('aria-required') === 'true') {
      rules.push({ rule: 'required', label: label });
    }

    // Email
    if (type === 'email' || id.includes('email') || name.includes('email')) {
      rules.push({ rule: 'email', label: label });
    }

    // Safaricom / Phone
    if (id.includes('safaricom') || name.includes('safaricom') || (id.includes('mpesa') && (id.includes('phone') || type === 'tel'))) {
      rules.push({ rule: 'safaricomPhone', label: label });
    } else if (type === 'tel' || id.includes('phone') || name.includes('phone') || id.includes('whatsapp') || name.includes('whatsapp')) {
      rules.push({ rule: 'phone', label: label });
    }

    // First / Last Name single name format
    const isSingleNameField = (
      /first.*name|last.*name|surname/i.test(label) ||
      /first.*name|last.*name|surname/i.test(id) ||
      /first.*name|last.*name|surname/i.test(name)
    );

    // Full name format
    const cleanId = (el.name || el.id || '').replace(/[-_]/g, '').toLowerCase();
    const isExplicitPersonName = ['name', 'fullname', 'contactname', 'contactperson', 'consultname', 'proposalname', 'enrolname', 'jumcname', 'trainingfullname', 'studentname', 'yourname', 'topicname'].includes(cleanId);
    const isFullNameField = !isSingleNameField && (isExplicitPersonName || (
      /name/i.test(label) &&
      !/school|institution|org|user|file|course|category|brand|inst|resource|topic|assessment|announcement|title/i.test(label) &&
      !/school|institution|org|inst|resource|topic|user|file|course|category|assessment|announcement|title/i.test(id) &&
      !/school|institution|org|inst|resource|topic|user|file|course|category|assessment|announcement|title/i.test(name)
    ));
    if (isSingleNameField && type !== 'hidden') {
      rules.push({ rule: 'namePart', label: label });
    } else if (isFullNameField && type !== 'hidden') {
      rules.push({ rule: 'nameFormat', label: label });
    }

    // URL
    if (type === 'url' || id.includes('url') || name.includes('url') || id.includes('video') || name.includes('video')) {
      rules.push({ rule: 'url', label: label });
    }

    // Password
    if (type === 'password') {
      if (el.hasAttribute('minlength') || id.includes('new') || id.includes('signup') || name.includes('new') || name.includes('signup')) {
        rules.push({ rule: 'password', label: label });
      } else {
        rules.push({ rule: 'required', label: label });
      }
    }

    // Match attribute (e.g. confirm password)
    const matchId = el.getAttribute('data-match') || (id.includes('confirm') ? 'new-password' : null);
    if (matchId && document.getElementById(matchId)) {
      rules.push({ rule: 'match', param: matchId, label: 'Passwords' });
    }

    // Number & Range
    if (type === 'number') {
      rules.push({ rule: 'number', label: label });
      if (el.hasAttribute('min')) rules.push({ rule: 'min', param: Number(el.getAttribute('min')), label: label });
      if (el.hasAttribute('max')) rules.push({ rule: 'max', param: Number(el.getAttribute('max')), label: label });
    }

    // Minlength & Maxlength
    if (el.hasAttribute('minlength')) {
      rules.push({ rule: 'minLength', param: parseInt(el.getAttribute('minlength')), label: label });
    }
    if (el.hasAttribute('maxlength')) {
      rules.push({ rule: 'maxLength', param: parseInt(el.getAttribute('maxlength')), label: label });
    }

    return rules;
  }

  /**
   * Validate all inputs inside an entire form element.
   * @param {HTMLFormElement} formEl
   * @returns {{ valid: boolean, errors: string[], firstErrorEl: HTMLElement|null }}
   */
  function validateForm(formEl) {
    if (!formEl) return { valid: true, errors: [], firstErrorEl: null };
    const controls = formEl.querySelectorAll('input, select, textarea');
    const errors = [];
    let firstErrorEl = null;

    for (let i = 0; i < controls.length; i++) {
      const ctrl = controls[i];
      if (ctrl.disabled || ctrl.type === 'hidden' || ctrl.type === 'submit' || ctrl.type === 'button' || ctrl.type === 'reset') continue;
      if (ctrl.name === '_hp_instructify' || ctrl.id === '_hp_instructify') {
        if (ctrl.value) errors.push('Spam honeypot triggered');
        continue;
      }

      // Checkbox required
      if (ctrl.type === 'checkbox') {
        if (ctrl.hasAttribute('required') && !ctrl.checked) {
          const lbl = getElementLabel(ctrl);
          const err = 'Please check ' + (lbl || 'the required agreement') + '.';
          showFieldError(ctrl, err);
          errors.push(err);
          if (!firstErrorEl) firstErrorEl = ctrl;
          continue;
        } else {
          clearFieldError(ctrl);
          continue;
        }
      }

      const rules = deduceElementRules(ctrl);
      if (rules.length === 0) continue;

      const err = validateField(ctrl, rules);
      if (err) {
        errors.push(err);
        if (!firstErrorEl) firstErrorEl = ctrl;
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      firstErrorEl: firstErrorEl
    };
  }

  /**
   * Clear all validation errors inside a container.
   * @param {string|HTMLElement} containerIdOrEl
   */
  function clearErrors(containerIdOrEl) {
    const container = resolveElement(containerIdOrEl) || document.body;
    if (!container) return;
    container.querySelectorAll('.fv-error').forEach(function (el) { el.classList.remove('fv-error'); });
    container.querySelectorAll('.fv-valid').forEach(function (el) { el.classList.remove('fv-valid'); });
    container.querySelectorAll('.fv-error-msg').forEach(function (el) { el.remove(); });
    container.querySelectorAll('.fv-error-banner').forEach(function (el) { el.remove(); });
  }

  /**
   * Attach real-time (on blur + on input) validation to a field.
   * @param {string|HTMLElement} fieldOrId
   * @param {Array} rules
   */
  function attachLiveValidation(fieldOrId, rules) {
    const el = resolveElement(fieldOrId);
    if (!el) return;

    el.addEventListener('blur', function () {
      validateField(el, rules);
    });

    el.addEventListener('input', function () {
      const parent = el.closest('.form-group, .jum-form-group, .lms-form-group, .field-group') || el.parentNode;
      const errorMsg = parent.querySelector('.fv-error-msg[data-for="' + (el.id || el.name) + '"]') || parent.querySelector('.fv-error-msg');
      if (errorMsg || el.classList.contains('fv-error')) {
        validateField(el, rules);
      }
    });
  }

  function attachLiveToControl(ctrl) {
    if (ctrl._fv_attached) return;
    ctrl._fv_attached = true;

    const eventNames = (ctrl.type === 'checkbox' || ctrl.type === 'radio' || ctrl.tagName === 'SELECT')
      ? ['change']
      : ['input', 'blur'];

    eventNames.forEach(function (evt) {
      ctrl.addEventListener(evt, function () {
        const rules = deduceElementRules(ctrl);
        if (rules.length > 0) {
          const isErrored = ctrl.classList.contains('fv-error');
          if (isErrored || evt === 'blur') {
            validateField(ctrl, rules);
          }
        }
      });
    });
  }

  function initForm(form) {
    if (!form || form._fv_initialized) return;
    if (form.getAttribute('data-no-validate') === 'true') return;
    form._fv_initialized = true;

    form.setAttribute('novalidate', 'true');

    const controls = form.querySelectorAll('input, select, textarea');
    controls.forEach(attachLiveToControl);

    form.addEventListener('submit', function (e) {
      if (form.getAttribute('data-no-validate') === 'true') return;
      const result = validateForm(form);
      if (!result.valid) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (result.firstErrorEl) {
          result.firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(function () { result.firstErrorEl.focus(); }, 250);
        }
        if (window.showToast) {
          window.showToast(result.errors[0] || 'Please correct the highlighted fields before proceeding.', 'warning');
        }
        return false;
      }
    }, true);
  }

  function autoInit() {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;
    document.querySelectorAll('form').forEach(initForm);

    if (typeof MutationObserver !== 'undefined' && document.body) {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              if (node.tagName === 'FORM') initForm(node);
              else if (node.querySelectorAll) node.querySelectorAll('form').forEach(initForm);
            }
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  /**
   * Show an error summary banner in a container.
   * @param {string|HTMLElement} containerIdOrEl
   * @param {string[]} errors
   */
  function showErrorBanner(containerIdOrEl, errors) {
    const container = resolveElement(containerIdOrEl);
    if (!container) return;

    const existing = container.querySelector('.fv-error-banner');
    if (existing) existing.remove();

    if (!errors || errors.length === 0) return;

    const banner = document.createElement('div');
    banner.className = 'fv-error-banner';
    banner.innerHTML = `
      <div class="fv-error-banner-title">⚠️ Please fix the following before continuing:</div>
      <ul>${errors.map(function (e) { return '<li>' + e + '</li>'; }).join('')}</ul>
    `;
    container.insertBefore(banner, container.firstChild);
  }

  /**
   * Scroll to and focus the first errored field.
   * @param {string|HTMLElement} fieldOrId
   */
  function focusFirstError(fieldOrId) {
    const el = resolveElement(fieldOrId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () { el.focus(); }, 250);
    }
  }

  // ── Auto-initialize when ready ──────────────────────────────
  if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit);
    } else {
      autoInit();
    }
  }

  // ── Expose Public API ───────────────────────────────────────
  window.FormValidator = {
    validate: validateField,
    validateGroup: validateGroup,
    validateForm: validateForm,
    deduceRules: deduceElementRules,
    clearErrors: clearErrors,
    attachLiveValidation: attachLiveValidation,
    showFieldError: showFieldError,
    showFieldValid: showFieldValid,
    clearFieldError: clearFieldError,
    showErrorBanner: showErrorBanner,
    focusFirstError: focusFirstError,
    autoInit: autoInit,
    RULES: RULES
  };

})(window);
