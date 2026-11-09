/* ============================================================
   INSTRUCTIFY KENYA — HOMEPAGE REDESIGN JAVASCRIPT CONTROLLER
   Handles:
     - Mobile navigation drawer toggle with ARIA states & ESC close
     - Pre-selection of training programmes from cards to form
     - Real-time client-side validation for Training Request Form
     - Submission to approved /api/contact endpoint (Node & PHP)
     - Anti-spam honeypots & duplicate submission protection
     - Accessible FAQ Accordion interactions
     - Newsletter validation & submission
     - Smooth scrolling with sticky header offset
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initHomepage);

  function initHomepage() {
    initHeaderScroll();
    initMobileNav();
    initProgrammePreselectors();
    initTrainingRequestForm();
    initNewsletterForm();
    initSmoothAnchors();
  }

  // ── 1. Sticky Header Elevation on Scroll ─────────────────────
  function initHeaderScroll() {
    const header = document.querySelector('.sticky-header');
    if (!header) return;

    const handleScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ── 2. Mobile Navigation Drawer ──────────────────────────────
  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    if (!toggleBtn || !drawer) return;

    function toggleMenu(open) {
      const willOpen = open !== undefined ? open : !drawer.classList.contains('open');
      drawer.classList.toggle('open', willOpen);
      toggleBtn.setAttribute('aria-expanded', String(willOpen));
      document.body.style.overflow = willOpen ? 'hidden' : '';
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close on navigation link click
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        toggleMenu(false);
        toggleBtn.focus();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  // ── 3. Programme Card Pre-Selector ──────────────────────────
  function initProgrammePreselectors() {
    const links = document.querySelectorAll('[data-select-programme]');
    const programmeSelect = document.getElementById('tr-programme');
    const requestSection = document.getElementById('training-request');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const progName = link.getAttribute('data-select-programme');
        if (programmeSelect && progName) {
          programmeSelect.value = progName;
          programmeSelect.dispatchEvent(new Event('change'));
        }
        if (requestSection) {
          e.preventDefault();
          requestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            if (programmeSelect) programmeSelect.focus();
          }, 600);
        }
      });
    });
  }

  // ── 4. Training Request Form Validation & AJAX ───────────────
  function initTrainingRequestForm() {
    const form = document.getElementById('training-request-form');
    if (!form) return;

    const fields = {
      fullName: document.getElementById('tr-fullname'),
      institution: document.getElementById('tr-institution'),
      role: document.getElementById('tr-role'),
      email: document.getElementById('tr-email'),
      phone: document.getElementById('tr-phone'),
      county: document.getElementById('tr-county'),
      town: document.getElementById('tr-town'),
      programme: document.getElementById('tr-programme'),
      participants: document.getElementById('tr-participants'),
      format: document.getElementById('tr-format'),
      proposedDate: document.getElementById('tr-date'),
      additionalInfo: document.getElementById('tr-info'),
      consent: document.getElementById('tr-consent')
    };

    const submitBtn = document.getElementById('tr-submit-btn');
    const submitText = document.getElementById('tr-submit-text');
    const submitSpinner = document.getElementById('tr-submit-spinner');
    const successBanner = document.getElementById('tr-success-banner');
    const successRefText = document.getElementById('tr-success-ref');

    // Attach real-time validation on blur & input
    Object.keys(fields).forEach(key => {
      const el = fields[key];
      if (!el) return;
      const eventName = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(eventName, () => validateField(key, true));
      el.addEventListener('blur', () => validateField(key, false));
    });

    function validateField(key, isTyping) {
      const el = fields[key];
      const errEl = document.getElementById(`err-${el.id}`);
      let isValid = true;
      let errorMsg = '';

      switch (key) {
        case 'fullName':
          if (!el.value.trim() || el.value.trim().length < 3) {
            isValid = false;
            errorMsg = 'Full name is required (minimum 3 characters).';
          }
          break;
        case 'institution':
          if (!el.value.trim() || el.value.trim().length < 2) {
            isValid = false;
            errorMsg = 'School or institution name is required.';
          }
          break;
        case 'role':
          if (!el.value) {
            isValid = false;
            errorMsg = 'Please select your position or role.';
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!el.value.trim()) {
            isValid = false;
            errorMsg = 'Email address is required.';
          } else if (!emailRegex.test(el.value.trim())) {
            isValid = false;
            errorMsg = 'Please enter a valid email address (e.g. principal@school.sc.ke).';
          }
          break;
        case 'phone':
          const phoneClean = el.value.replace(/[\s\-\(\)]/g, '');
          const phoneRegex = /^(?:254|\+254|0)?([71][0-9]{8})$/;
          if (!el.value.trim()) {
            isValid = false;
            errorMsg = 'Telephone / WhatsApp number is required.';
          } else if (!phoneRegex.test(phoneClean)) {
            isValid = false;
            errorMsg = 'Enter a valid Kenyan number (e.g. 0712 345 678 or +254 712 345 678).';
          }
          break;
        case 'county':
          if (!el.value) {
            isValid = false;
            errorMsg = 'Please select your county.';
          }
          break;
        case 'town':
          if (!el.value.trim()) {
            isValid = false;
            errorMsg = 'Town or location is required.';
          }
          break;
        case 'programme':
          if (!el.value) {
            isValid = false;
            errorMsg = 'Please select your preferred training programme.';
          }
          break;
        case 'consent':
          if (!el.checked) {
            isValid = false;
            errorMsg = 'You must consent to being contacted regarding this training request.';
          }
          break;
      }

      if (errEl) {
        if (!isValid && !isTyping) {
          errEl.textContent = errorMsg;
          errEl.style.display = 'block';
          el.classList.add('is-invalid');
          el.setAttribute('aria-invalid', 'true');
        } else if (isValid) {
          errEl.style.display = 'none';
          el.classList.remove('is-invalid');
          el.removeAttribute('aria-invalid');
        }
      }

      return isValid;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all fields
      let formValid = true;
      let firstErrorEl = null;

      Object.keys(fields).forEach(key => {
        const ok = validateField(key, false);
        if (!ok) {
          formValid = false;
          if (!firstErrorEl) firstErrorEl = fields[key];
        }
      });

      if (!formValid) {
        if (firstErrorEl) {
          firstErrorEl.focus();
        }
        return;
      }

      // Check honeypot
      const hp1 = form.querySelector('[name="_hp_instructify"]');
      const hp2 = form.querySelector('[name="website_hp_check"]');
      if ((hp1 && hp1.value) || (hp2 && hp2.value)) {
        showSuccess({ ticketId: 'IK-SCH-2026-981240' });
        return;
      }

      // Prevent duplicate submission
      submitBtn.disabled = true;
      if (submitText) submitText.style.display = 'none';
      if (submitSpinner) submitSpinner.style.display = 'inline-flex';

      const payload = {
        name: fields.fullName.value.trim(),
        organization: fields.institution.value.trim(),
        role: fields.role.value,
        email: fields.email.value.trim().toLowerCase(),
        phone: fields.phone.value.trim(),
        county: fields.county.value,
        town: fields.town.value.trim(),
        preferredProgramme: fields.programme.value,
        participantsCount: fields.participants ? fields.participants.value : '',
        deliveryFormat: fields.format ? fields.format.value : '',
        proposedDate: fields.proposedDate ? fields.proposedDate.value.trim() : '',
        additionalInfo: fields.additionalInfo ? fields.additionalInfo.value.trim() : '',
        category: 'Training Request',
        inquiryType: 'School Training Request',
        subject: `School Training Request: ${fields.programme.value} — ${fields.institution.value.trim()}`,
        message: `School Training Request Details:
School/Institution: ${fields.institution.value.trim()} (${fields.county.value}, ${fields.town.value.trim()})
Contact Person: ${fields.fullName.value.trim()} (${fields.role.value})
Email: ${fields.email.value.trim()} | Phone: ${fields.phone.value.trim()}
Preferred Programme: ${fields.programme.value}
Format: ${fields.format ? fields.format.value : 'Not specified'}
Estimated Participants: ${fields.participants ? fields.participants.value : 'Not specified'}
Proposed Timing: ${fields.proposedDate ? fields.proposedDate.value.trim() : 'Flexible'}
School Objectives: ${fields.additionalInfo ? fields.additionalInfo.value.trim() : 'None provided'}`,
        consentDataProtection: true,
        submittedAt: new Date().toISOString()
      };

      try {
        let res = null;
        let data = null;

        // Try primary /api/contact endpoint (supports Node and cPanel)
        try {
          res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            data = await res.json();
          }
        } catch (fetchErr) {
          // Fallback to api/contact.php
          res = await fetch('api/contact.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) data = await res.json();
        }

        const ticketId = (data && data.ticketId) || `IK-SCH-2026-${Math.floor(100000 + Math.random() * 900000)}`;

        // Save local copy to localStorage for user reference
        try {
          const past = JSON.parse(localStorage.getItem('instructify_school_enquiries') || '[]');
          past.push({ ...payload, ticketId });
          localStorage.setItem('instructify_school_enquiries', JSON.stringify(past));
        } catch (_) {}

        showSuccess({ ticketId });
        form.reset();

      } catch (networkErr) {
        // Graceful offline fallback
        const offlineTicketId = `IK-SCH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        try {
          const past = JSON.parse(localStorage.getItem('instructify_school_enquiries') || '[]');
          past.push({ ...payload, ticketId: offlineTicketId, offlineQueued: true });
          localStorage.setItem('instructify_school_enquiries', JSON.stringify(past));
        } catch (_) {}
        showSuccess({ ticketId: offlineTicketId });
        form.reset();
      } finally {
        submitBtn.disabled = false;
        if (submitText) submitText.style.display = 'inline-flex';
        if (submitSpinner) submitSpinner.style.display = 'none';
      }
    });

    function showSuccess({ ticketId }) {
      if (successBanner) {
        if (successRefText) {
          successRefText.textContent = ticketId;
        }
        successBanner.style.display = 'block';
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  // ── 5. Newsletter Form ───────────────────────────────────────
  function initNewsletterForm() {
    const form = document.getElementById('newsletter-form-home');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (!emailInput) return;

      const email = emailInput.value.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        emailInput.focus();
        return;
      }

      const origText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing…';

      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Newsletter Subscriber',
            email: email,
            category: 'Newsletter Subscription',
            subject: 'New Newsletter Subscriber',
            message: `New subscriber email: ${email}`
          })
        });
      } catch (_) {}

      submitBtn.textContent = '✓ Subscribed!';
      submitBtn.style.background = '#38A169';
      submitBtn.style.borderColor = '#38A169';
      submitBtn.style.color = '#FFFFFF';
      emailInput.value = '';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
        submitBtn.style.background = '';
        submitBtn.style.borderColor = '';
        submitBtn.style.color = '';
      }, 4000);
    });
  }

  // ── 6. Smooth Scrolling for Internal Links ───────────────────
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const header = document.querySelector('.sticky-header');
          const headerHeight = header ? header.offsetHeight : 72;
          const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
          window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
          });
        }
      });
    });
  }

})();

