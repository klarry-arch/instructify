/* ============================================================
   INSTRUCTIFY KENYA — Consultancy & Consultancy Request Form JS
   Animated Statistics, Area Pre-Fill, API Submission & WhatsApp
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Animated Impact Statistics Counter ───────────────────
  const counters = document.querySelectorAll('[data-counter]');
  let animated = false;

  function animateCounters() {
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-counter'));
      const suffix = counter.getAttribute('data-counter-suffix') || '';
      const decimals = parseInt(counter.getAttribute('data-counter-decimals') || '0', 10);
      const duration = 1800;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentVal = (target * ease).toFixed(decimals);
        counter.textContent = currentVal + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
        }
      }

      requestAnimationFrame(update);
    });
  }

  const metricsSection = document.getElementById('impact-metrics');
  if (metricsSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCounters();
          obs.disconnect();
        }
      });
    }, { threshold: 0.25 });
    observer.observe(metricsSection);
  } else if (counters.length > 0) {
    animateCounters();
  }

  // ── 2. Smooth Anchor Navigation ─────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72', 10);
        const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - navHeight - 16,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── 3. Pre-select Consultancy Focus Area from ?area= Query Param ─
  const form = document.getElementById('consultation-form');
  const feedback = document.getElementById('form-feedback');

  if (form) {
    try {
      const params = new URLSearchParams(window.location.search);
      const areaParam = (params.get('area') || '').toLowerCase().trim();
      if (areaParam) {
        areaParam.split(',').forEach(code => {
          const cb = form.querySelector('input[name="services"][data-area="' + code.trim() + '"]');
          if (cb) cb.checked = true;
        });
      }
    } catch (_) {
      // Ignore malformed query string
    }

    // ── 4. Consultancy Request Form Submission ────────────────
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const instEl = form.querySelector('#inst_name');
      const contactEl = form.querySelector('#contact_person');
      const countyEl = form.querySelector('#county');
      const emailEl = form.querySelector('#email');
      const phoneEl = form.querySelector('#phone');
      const instTypeEl = form.querySelector('#inst_type');
      const modeEl = form.querySelector('#consultation_mode');
      const timelineEl = form.querySelector('#timeline');
      const notesEl = form.querySelector('#notes');
      const consentEl = form.querySelector('#cr_consent');
      const hpEl = form.querySelector('#cr_hp_check');
      const submitBtn = form.querySelector('#cr-submit-btn');

      const institution = instEl ? instEl.value.trim() : '';
      const contactPerson = contactEl ? contactEl.value.trim() : '';
      const county = countyEl ? countyEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const phone = phoneEl ? phoneEl.value.trim() : '';
      const instType = instTypeEl ? instTypeEl.value : 'Institution';
      const mode = modeEl ? modeEl.value : 'Virtual Discovery Call';
      const timeline = timelineEl ? timelineEl.value : 'This Term';
      const notes = notesEl ? notesEl.value.trim() : '';

      const checkedServices = [];
      form.querySelectorAll('input[name="services"]:checked').forEach(cb => {
        checkedServices.push(cb.value);
      });

      function showError(msg, focusEl) {
        if (feedback) {
          feedback.className = 'form-feedback error';
          feedback.textContent = msg;
          feedback.style.display = 'block';
        }
        if (window.showToast) window.showToast(msg, 'warning');
        if (focusEl && typeof focusEl.focus === 'function') focusEl.focus();
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!institution || institution.length < 2) {
        return showError('Please enter your institution or organization name.', instEl);
      }
      if (!contactPerson || contactPerson.length < 2) {
        return showError('Please enter the contact person name and role.', contactEl);
      }
      if (countyEl && (!county || county.length < 2)) {
        return showError('Please enter your county or location.', countyEl);
      }
      if (!email || !emailRegex.test(email)) {
        return showError('Please enter a valid work email address.', emailEl);
      }
      if (!phone || phone.replace(/[^0-9+]/g, '').length < 9) {
        return showError('Please enter a valid phone or WhatsApp number.', phoneEl);
      }
      if (!notes || notes.length < 10) {
        return showError('Please share a brief overview of your program, curriculum, or technology goals (at least 10 characters).', notesEl);
      }
      if (consentEl && !consentEl.checked) {
        return showError('Please confirm consent so our advisory team can contact you.', consentEl);
      }

      const servicesText = checkedServices.length > 0 ? checkedServices.join(', ') : 'General Institutional Consultancy';
      const summaryMessage =
        'Consultancy Request — ' + institution + ' (' + instType + ')\n' +
        'Location: ' + (county || 'Kenya') + '\n' +
        'Focus Areas: ' + servicesText + '\n' +
        'Preferred Format: ' + mode + '\n' +
        'Target Timeline: ' + timeline + '\n' +
        'Project Goals: ' + notes;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.origHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Submitting Consultancy Request...</span>';
      }

      let ticketId = 'IK-CON-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
      try {
        if (window.location.protocol !== 'file:') {
          const resp = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: contactPerson,
              email,
              phone,
              organization: institution + ' (' + instType + (county ? ', ' + county : '') + ')',
              category: 'Consultancy',
              inquiryType: 'Consultancy',
              subject: 'Consultancy Request: ' + institution + ' — ' + servicesText,
              message: summaryMessage,
              _hp_instructify: hpEl ? hpEl.value : ''
            })
          });
          if (resp.ok) {
            const payload = await resp.json();
            if (payload && payload.ticketId) ticketId = payload.ticketId;
          }
        }
      } catch (_) {
        // Static / offline graceful fallback — still confirm locally and provide WhatsApp handoff
      }

      const waMessage = encodeURIComponent(
        'Hello Instructify Kenya,\n\n' +
        'I have submitted a Consultancy Request (Ref: ' + ticketId + '):\n' +
        '• Institution: ' + institution + ' (' + instType + ')\n' +
        '• Contact Person: ' + contactPerson + '\n' +
        (county ? '• Location: ' + county + '\n' : '') +
        '• Email: ' + email + '\n' +
        '• Phone: ' + phone + '\n' +
        '• Consultancy Areas: ' + servicesText + '\n' +
        '• Format & Timeline: ' + mode + ' · ' + timeline + '\n' +
        '• Project Goals: ' + notes
      );
      const waUrl = 'https://wa.me/254143024416?text=' + waMessage;

      function esc(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      if (feedback) {
        feedback.className = 'form-feedback success';
        feedback.innerHTML =
          '<span class="cr-ticket-badge">Reference: ' + esc(ticketId) + '</span><br>' +
          '<strong>Thank you, ' + esc(contactPerson) + '!</strong> Your consultancy request for <strong>' + esc(institution) + '</strong> has been received. Our advisory team will review your goals and reach out within 24 hours.<br>' +
          '<a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" class="cr-wa-followup">💬 Fast-Track With Our Lead Consultant on WhatsApp &rarr;</a>';
        feedback.style.display = 'block';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.dataset.origHtml || '<span>Submit Consultancy Request</span> <span aria-hidden="true">&rarr;</span>';
      }

      form.reset();
    });
  }
});
