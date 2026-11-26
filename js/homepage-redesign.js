/* ============================================================
   INSTRUCTIFY KENYA — HOMEPAGE REDESIGN JAVASCRIPT CONTROLLER
   Handles:
     - Dynamic Course Categories & Featured Courses from window.COURSES
     - Pre-selection of training programmes from cards to form
     - Real-time client-side validation + error summary for Training Request Form
     - Submission to approved /api/contact endpoint (Node & PHP)
     - Anti-spam honeypots & duplicate submission protection
     - Newsletter validation & submission
     - Smooth scrolling with sticky header offset
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initHomepage);

  function initHomepage() {
    if (typeof window.updateAuthUI === 'function') {
      window.updateAuthUI();
    }
    renderHomepageCategories();
    renderHomepageFeaturedCourses();
    initProgrammePreselectors();
    initTrainingRequestForm();
    initNewsletterForm();
    initSmoothAnchors();
  }

  // ── 1. Dynamic Course Categories (Computed Strictly from window.COURSES) ─
  function renderHomepageCategories() {
    const container = document.getElementById('home-categories-grid');
    if (!container) return;

    const courses = Array.isArray(window.COURSES) ? window.COURSES : [];
    const defs = [
      {
        title: 'AI for Educators',
        param: 'AI',
        icon: '<img src="assets/icons/icon-ai-duotone.svg" alt="" width="38" height="38" class="ik-brand-icon" loading="lazy">',
        desc: 'Generative AI lesson design, ethical classroom adoption, and practical teacher prompting workflows.',
        match: (c) => /ai/i.test(c.category || '') || (c.tags || []).some(t => /^ai$/i.test(t))
      },
      {
        title: 'Digital Skills',
        param: 'Digital',
        icon: '<img src="assets/icons/icon-digital-duotone.svg" alt="" width="38" height="38" class="ik-brand-icon" loading="lazy">',
        desc: 'Foundational digital literacy, online safety, Microsoft 365 fluency, and daily digital productivity.',
        match: (c) => /digital/i.test(c.category || '')
      },
      {
        title: 'ICT Integration',
        param: 'ICT',
        icon: '<img src="assets/icons/icon-ict-duotone.svg" alt="" width="38" height="38" class="ik-brand-icon" loading="lazy">',
        desc: 'Smart classrooms, interactive whiteboards, ClassVR, and technology-enabled lesson delivery.',
        match: (c) => /ict|edtech/i.test(c.category || '')
      },
      {
        title: 'CBC & Assessment',
        param: 'Curriculum',
        icon: '<img src="assets/icons/icon-cbc-duotone.svg" alt="" width="38" height="38" class="ik-brand-icon" loading="lazy">',
        desc: 'Competency-Based Curriculum strands, formative rubrics, learner portfolios, and authentic evaluation.',
        match: (c) => /curriculum|assessment/i.test(c.category || '')
      },
      {
        title: 'Online Pedagogy',
        param: 'Pedagogy',
        icon: '<img src="assets/icons/icon-pedagogy-duotone.svg" alt="" width="38" height="38" class="ik-brand-icon" loading="lazy">',
        desc: 'Virtual classroom engagement, blended learning design, and interactive digital facilitation.',
        match: (c) => /pedagogy/i.test(c.category || '')
      },
      {
        title: 'Professional Development & Leadership',
        param: 'Leadership',
        icon: '<img src="assets/icons/icon-leadership-duotone.svg" alt="" width="38" height="38" class="ik-brand-icon" loading="lazy">',
        desc: 'Structured CPD compliance tracks and institutional digital leadership for school principals and heads.',
        match: (c) => /leadership|cpd/i.test(c.category || '')
      }
    ];

    container.innerHTML = defs.map((cat) => {
      const matches = courses.filter(cat.match);
      const count = matches.length;
      const countText = count === 1 ? '1 Course Available' : `${count} Courses Available`;
      return `
        <a href="courses.html?category=${encodeURIComponent(cat.param)}" class="ik-category-card">
          <div class="ik-category-top">
            <div class="ik-category-icon" aria-hidden="true">${cat.icon}</div>
            <span class="ik-category-count">${countText}</span>
          </div>
          <h3 class="ik-category-title">${cat.title}</h3>
          <p class="ik-category-desc">${cat.desc}</p>
          <span class="ik-category-cta">Explore category <span aria-hidden="true">&rarr;</span></span>
        </a>
      `;
    }).join('');
  }

  // ── 2. Dynamic Featured Courses Grid ───────────────────────────
  function renderHomepageFeaturedCourses() {
    const container = document.getElementById('home-featured-courses-grid');
    if (!container) return;

    const courses = Array.isArray(window.COURSES) ? window.COURSES : [];
    if (!courses.length) {
      container.innerHTML = `
        <div class="ik-empty-state" style="grid-column: 1 / -1;">
          <h3 class="ik-empty-title">Courses Loading</h3>
          <p class="ik-empty-desc">Browse our complete catalogue of practical CPD, AI, and digital skills courses.</p>
          <a href="courses.html" class="ik-btn-sm-primary">Open Course Catalogue</a>
        </div>
      `;
      return;
    }

    const preferredOrder = ['crs_009', 'crs_000', 'crs_004', 'crs_001', 'crs_002', 'crs_006'];
    const ordered = [];
    preferredOrder.forEach((id) => {
      const found = courses.find(c => c.id === id);
      if (found) ordered.push(found);
    });
    courses.forEach((c) => {
      if (ordered.length < 6 && !ordered.some(x => x.id === c.id)) {
        ordered.push(c);
      }
    });

    container.innerHTML = ordered.slice(0, 6).map((c) => {
      const priceNum = typeof c.price === 'number' ? c.price : parseInt(String(c.price || '0').replace(/[^0-9]/g, ''), 10);
      const isFree = priceNum === 0 || !!c.isFree;
      const priceLabel = isFree ? 'FREE' : `KES ${priceNum.toLocaleString()}`;
      const detailUrl = `course-detail.html?id=${encodeURIComponent(c.id)}`;
      const enrolUrl = isFree ? `course-player.html?courseId=${encodeURIComponent(c.id)}` : `checkout.html?id=${encodeURIComponent(c.id)}`;

      return `
        <article class="ik-course-card" data-course-id="${c.id}">
          <div class="ik-course-thumb">
            <img src="${c.image}" alt="${c.title}" loading="lazy" width="400" height="250"
                 onerror="this.style.display='none'">
            <span class="ik-course-cat-pill">${c.category}</span>
            <span class="ik-course-price-pill ${isFree ? 'is-free' : ''}">${isFree ? 'Free Access' : priceLabel}</span>
          </div>
          <div class="ik-course-body">
            <div class="ik-course-meta">
              <span>${c.level || 'All Levels'}</span>
              <span>&bull;</span>
              <span>${c.duration || 'Self-Paced'}</span>
              <span>&bull;</span>
              <span>${c.format || 'Online'}</span>
            </div>
            <h3 class="ik-course-title">
              <a href="${detailUrl}" title="${c.title}">${c.title}</a>
            </h3>
            <p class="ik-course-desc">${(c.description || '').slice(0, 128)}${(c.description || '').length > 128 ? '…' : ''}</p>
            <div class="ik-course-footer">
              <span class="ik-course-price-text ${isFree ? 'is-free' : ''}">${priceLabel}</span>
              <div class="ik-course-actions">
                <a href="${detailUrl}" class="ik-btn-sm-outline" aria-label="View details for ${c.title}">Details</a>
                <a href="${enrolUrl}" class="ik-btn-sm-primary" aria-label="${isFree ? 'Start free learning for' : 'Enrol in'} ${c.title}">
                  ${isFree ? 'Start Free' : 'Enrol'}
                </a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
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
          }, 500);
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
    const errorSummary = document.getElementById('tr-error-summary');
    let isSubmitting = false;

    Object.keys(fields).forEach(key => {
      const el = fields[key];
      if (!el) return;
      const eventName = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(eventName, () => validateField(key, true));
      el.addEventListener('blur', () => validateField(key, false));
    });

    function validateField(key, isTyping) {
      const el = fields[key];
      if (!el) return true;
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
        case 'email': {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!el.value.trim()) {
            isValid = false;
            errorMsg = 'Email address is required.';
          } else if (!emailRegex.test(el.value.trim())) {
            isValid = false;
            errorMsg = 'Please enter a valid email address (e.g. principal@school.sc.ke).';
          }
          break;
        }
        case 'phone': {
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
        }
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

      return { isValid, errorMsg };
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      let formValid = true;
      let firstErrorEl = null;
      const errorList = [];

      Object.keys(fields).forEach(key => {
        const res = validateField(key, false);
        const ok = typeof res === 'object' ? res.isValid : res;
        if (!ok) {
          formValid = false;
          if (!firstErrorEl) firstErrorEl = fields[key];
          if (res && res.errorMsg) errorList.push(res.errorMsg);
        }
      });

      if (!formValid) {
        if (errorSummary) {
          errorSummary.innerHTML = `<strong>Please review ${errorList.length} field${errorList.length === 1 ? '' : 's'} before submitting:</strong>${errorList[0] || ''}`;
          errorSummary.classList.add('is-visible');
        }
        if (firstErrorEl) firstErrorEl.focus();
        return;
      }

      if (errorSummary) {
        errorSummary.classList.remove('is-visible');
        errorSummary.innerHTML = '';
      }

      const hp1 = form.querySelector('[name="_hp_instructify"]');
      const hp2 = form.querySelector('[name="website_hp_check"]');
      if ((hp1 && hp1.value) || (hp2 && hp2.value)) {
        showSuccess({ ticketId: 'IK-SCH-2026-981240' });
        return;
      }

      isSubmitting = true;
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

        try {
          res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) data = await res.json();
        } catch (fetchErr) {
          res = await fetch('api/contact.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) data = await res.json();
        }

        const ticketId = (data && data.ticketId) || `IK-SCH-2026-${Math.floor(100000 + Math.random() * 900000)}`;

        try {
          const past = JSON.parse(localStorage.getItem('instructify_school_enquiries') || '[]');
          past.push({ ...payload, ticketId });
          localStorage.setItem('instructify_school_enquiries', JSON.stringify(past));
        } catch (_) {}

        showSuccess({ ticketId });
        form.reset();
      } catch (networkErr) {
        const offlineTicketId = `IK-SCH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        try {
          const past = JSON.parse(localStorage.getItem('instructify_school_enquiries') || '[]');
          past.push({ ...payload, ticketId: offlineTicketId, offlineQueued: true });
          localStorage.setItem('instructify_school_enquiries', JSON.stringify(past));
        } catch (_) {}
        showSuccess({ ticketId: offlineTicketId });
        form.reset();
      } finally {
        isSubmitting = false;
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
    let isSending = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSending) return;
      const emailInput = form.querySelector('input[type="email"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      const feedback = document.getElementById('newsletter-home-feedback');
      if (!emailInput) return;

      const email = emailInput.value.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRegex.test(email)) {
        if (feedback) {
          feedback.textContent = 'Please enter a valid email address.';
          feedback.className = 'ik-status-banner is-error';
          feedback.style.display = 'flex';
        }
        emailInput.focus();
        return;
      }

      isSending = true;
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

      if (feedback) {
        feedback.textContent = 'Subscribed! Thank you for joining our educator briefing.';
        feedback.className = 'ik-status-banner is-success';
        feedback.style.display = 'flex';
      }
      submitBtn.textContent = 'Subscribed';
      emailInput.value = '';

      setTimeout(() => {
        isSending = false;
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
      }, 3000);
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
