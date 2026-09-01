/* ============================================================
   INSTRUCTIFY KENYA — MAIN JAVASCRIPT
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initCounterAnimations();
  initToastSystem();
  initAccordions();
  initTabs();
  markActiveNavLink();
  initWorkshopForm();
  initTrainingForm();
});

// ── Navbar & Mobile Toggle ──────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('nav-mobile');

  if (!navbar) return;

  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

function markActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });
}

// ── Scroll Reveal ──────────────────────────────────────────────
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ── Counter Animations ─────────────────────────────────────────
function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-counter'));
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const duration = parseInt(el.getAttribute('data-duration')) || 2000;
  const start = performance.now();

  const update = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

// ── Toast System ───────────────────────────────────────────────
let toastContainer;

function initToastSystem() {
  if (!document.getElementById('toast-container')) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  } else {
    toastContainer = document.getElementById('toast-container');
  }
}

window.showToast = function(message, type = 'info', duration = 4000) {
  if (!toastContainer) initToastSystem();

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  toast.addEventListener('click', () => dismissToast(toast));
  toastContainer.appendChild(toast);

  setTimeout(() => dismissToast(toast), duration);
};

function dismissToast(toast) {
  toast.classList.add('hiding');
  setTimeout(() => toast.remove(), 350);
}

// ── Accordions & Tabs ──────────────────────────────────────────
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });
}

function initTabs() {
  document.querySelectorAll('.tab-group').forEach(group => {
    group.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        const parent = btn.closest('[data-tabs-container]') || document;
        
        group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (target) {
          parent.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
          const panel = parent.querySelector(`#${target}`);
          if (panel) panel.classList.add('active');
        }
      });
    });
  });
}

// ── Workshop Registration Form Logic ───────────────────────────
window.initWorkshopForm = function() {
  const form = document.getElementById('workshop-registration-form');
  if (!form) return;

  // Pre-fill workshop title from query param or hash if present
  const urlParams = new URLSearchParams(window.location.search);
  const workshopParam = urlParams.get('workshop');
  if (workshopParam) {
    const titleSelect = document.getElementById('workshop-title-select');
    if (titleSelect) {
      // Find matching option or select custom
      let matched = false;
      for (let option of titleSelect.options) {
        if (option.value.toLowerCase().includes(workshopParam.toLowerCase())) {
          titleSelect.value = option.value;
          matched = true;
          break;
        }
      }
      if (!matched && titleSelect.querySelector('option[value="Other"]')) {
        titleSelect.value = "Other";
        toggleCustomWorkshopField();
        const customInput = document.getElementById('workshop-title-custom');
        if (customInput) customInput.value = workshopParam;
      }
    }
  }

  // Handle title select change (show custom input if "Other")
  const titleSelect = document.getElementById('workshop-title-select');
  if (titleSelect) {
    titleSelect.addEventListener('change', toggleCustomWorkshopField);
  }
};

window.toggleCustomWorkshopField = function() {
  const titleSelect = document.getElementById('workshop-title-select');
  const customGroup = document.getElementById('custom-workshop-group');
  if (titleSelect && customGroup) {
    if (titleSelect.value === 'Other') {
      customGroup.style.display = 'block';
      document.getElementById('workshop-title-custom').setAttribute('required', 'required');
    } else {
      customGroup.style.display = 'none';
      document.getElementById('workshop-title-custom').removeAttribute('required');
    }
  }
};

window.selectWorkshopRole = function(chip, roleValue) {
  const container = chip.closest('.role-chip-group');
  if (container) {
    container.querySelectorAll('.role-chip').forEach(c => c.classList.remove('selected'));
  }
  chip.classList.add('selected');
  const radio = chip.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
};

window.selectPaymentOption = function(card, paymentValue) {
  const container = card.closest('.payment-grid');
  if (container) {
    container.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
  }
  card.classList.add('selected');
  const radio = card.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
};

window.registerForWorkshop = function(workshopTitle) {
  const formElement = document.getElementById('workshop-registration-form');
  const titleSelect = document.getElementById('workshop-title-select');
  
  if (titleSelect) {
    let optionFound = false;
    for (let option of titleSelect.options) {
      if (option.value.toLowerCase() === workshopTitle.toLowerCase() || option.text.toLowerCase().includes(workshopTitle.toLowerCase())) {
        titleSelect.value = option.value;
        optionFound = true;
        break;
      }
    }
    if (!optionFound) {
      titleSelect.value = "Other";
      toggleCustomWorkshopField();
      const customInput = document.getElementById('workshop-title-custom');
      if (customInput) customInput.value = workshopTitle;
    }
  }

  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const nameInput = document.getElementById('workshop-fullname');
    if (nameInput) nameInput.focus();
  } else {
    // Navigate to events page or standalone page with query param
    window.location.href = `events.html?workshop=${encodeURIComponent(workshopTitle)}#workshop-form`;
  }
};

window.handleWorkshopSubmit = function(event) {
  event.preventDefault();
  const form = event.target;

  // Retrieve form field values
  const fullName = document.getElementById('workshop-fullname')?.value || '';
  const titleSelect = document.getElementById('workshop-title-select');
  let workshopTitle = titleSelect?.value || '';
  if (workshopTitle === 'Other') {
    workshopTitle = document.getElementById('workshop-title-custom')?.value || 'Custom Workshop';
  }

  const roleRadio = form.querySelector('input[name="workshop_role"]:checked');
  const role = roleRadio ? roleRadio.value : 'Participant';

  const langSelect = document.getElementById('workshop-language')?.value || 'English';
  const needs = document.getElementById('workshop-needs')?.value || 'None specified';
  const email = document.getElementById('workshop-email')?.value || '';
  const phone = document.getElementById('workshop-phone')?.value || '';

  const paymentRadio = form.querySelector('input[name="workshop_payment"]:checked');
  const paymentMethod = paymentRadio ? paymentRadio.value : 'Free / Sponsored';

  // Generate random pass ID
  const passId = 'INST-WKSP-' + Math.floor(100000 + Math.random() * 900000);

  // Populate ticket modal
  const ticketModal = document.getElementById('ticket-modal');
  if (ticketModal) {
    document.getElementById('ticket-name').textContent = fullName;
    document.getElementById('ticket-workshop').textContent = workshopTitle;
    document.getElementById('ticket-role').textContent = role;
    document.getElementById('ticket-lang').textContent = langSelect;
    document.getElementById('ticket-contact').textContent = `${email} | ${phone}`;
    document.getElementById('ticket-payment').textContent = paymentMethod;
    document.getElementById('ticket-code').textContent = passId;

    ticketModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  window.showToast(`🎉 Registration Successful! Pass ${passId} generated for ${fullName}.`, 'success', 5000);
  form.reset();
  
  // Re-select defaults
  const firstRole = form.querySelector('.role-chip');
  if (firstRole) window.selectWorkshopRole(firstRole, 'Teacher');
  const firstPay = form.querySelector('.payment-card');
  if (firstPay) window.selectPaymentOption(firstPay, 'Free / Sponsored');
};

window.closeTicketModal = function() {
  const ticketModal = document.getElementById('ticket-modal');
  if (ticketModal) {
    ticketModal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ── Training Registration Form Logic ────────────────────────────
window.initTrainingForm = function() {
  const form = document.getElementById('training-registration-form');
  if (!form) return;

  // Pre-fill track from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const trackParam = urlParams.get('track');
  if (trackParam) {
    const trackSelect = document.getElementById('training-track-select');
    if (trackSelect) {
      for (let option of trackSelect.options) {
        if (option.value.toLowerCase().includes(trackParam.toLowerCase())) {
          trackSelect.value = option.value;
          break;
        }
      }
    }
  }
};

window.selectCertInterest = function(btn, value) {
  const container = btn.closest('.cert-toggle-group');
  if (container) {
    container.querySelectorAll('.cert-toggle-option').forEach(b => b.classList.remove('selected'));
  }
  btn.classList.add('selected');
  const radio = btn.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
};

window.registerForTraining = function(trackTitle) {
  const formElement = document.getElementById('training-registration-form');
  const trackSelect = document.getElementById('training-track-select');

  if (trackSelect) {
    for (let option of trackSelect.options) {
      if (option.value.toLowerCase() === trackTitle.toLowerCase() || option.text.toLowerCase().includes(trackTitle.toLowerCase())) {
        trackSelect.value = option.value;
        break;
      }
    }
  }

  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const nameInput = document.getElementById('training-fullname');
    if (nameInput) nameInput.focus();
  } else {
    window.location.href = `training-registration.html?track=${encodeURIComponent(trackTitle)}#training-form`;
  }
};

window.handleTrainingSubmit = function(event) {
  event.preventDefault();
  const form = event.target;

  const fullName = document.getElementById('training-fullname')?.value || '';
  const institution = document.getElementById('training-institution')?.value || 'N/A';
  const track = document.getElementById('training-track-select')?.value || 'Professional Development';
  const level = document.getElementById('training-level-select')?.value || 'Intermediate';
  const datePref = document.getElementById('training-date-pref')?.value || 'Flexible / Next Cohort';
  const email = document.getElementById('training-email')?.value || '';
  const phone = document.getElementById('training-phone')?.value || '';

  const certRadio = form.querySelector('input[name="cert_interest"]:checked');
  const certInterest = certRadio ? certRadio.value : 'Yes';

  const regCode = 'INST-TRN-' + Math.floor(100000 + Math.random() * 900000);

  const modal = document.getElementById('training-ticket-modal');
  if (modal) {
    document.getElementById('tr-name').textContent = fullName;
    document.getElementById('tr-school').textContent = institution;
    document.getElementById('tr-track').textContent = track;
    document.getElementById('tr-level').textContent = level;
    document.getElementById('tr-date').textContent = datePref;
    document.getElementById('tr-contact').textContent = `${email} | ${phone}`;
    document.getElementById('tr-cert').textContent = certInterest === 'Yes' ? 'Yes (CPD Certificate Requested)' : 'No (Audit Only)';
    document.getElementById('tr-code').textContent = regCode;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  window.showToast(`🎉 Educator Training Registration Confirmed! Registration ID: ${regCode}`, 'success', 5000);
  form.reset();

  const yesCert = form.querySelector('.cert-toggle-option');
  if (yesCert) window.selectCertInterest(yesCert, 'Yes');
};

window.closeTrainingModal = function() {
  const modal = document.getElementById('training-ticket-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.switchFounderVisionTab = function(btn, tabName) {
  const container = btn.closest('.founder-content-panel');
  if (!container) return;

  container.querySelectorAll('.founder-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const visionP1 = document.getElementById('founder-vision-p1');
  const quoteText = document.getElementById('founder-quote-text');

  if (tabName === 'awakening') {
    if (visionP1) visionP1.innerHTML = "You’ve arrived at a place where learning is a journey of renewal and growth. Instructify Kenya was born from a dream—to empower minds, stir hearts, and transform communities through practical, visionary education.";
    if (quoteText) quoteText.innerHTML = '<span class="gold-glow">"Here, we don’t just teach. We awaken."</span><br><span class="orange-glow">"We don’t just deliver content. We ignite purpose."</span>';
  } else if (tabName === 'pedagogy') {
    if (visionP1) visionP1.innerHTML = "Our pedagogy bridges local African realities with global innovation. We ground knowledge in practical classroom tools while elevating learning communities to achieve global excellence.";
    if (quoteText) quoteText.innerHTML = '<span class="gold-glow">"Practical innovation for modern classrooms."</span><br><span class="orange-glow">"Rooted in context, reaching for global excellence."</span>';
  } else if (tabName === 'transformation') {
    if (visionP1) visionP1.innerHTML = "Whether you're crafting a lesson, leading a fellowship, or exploring new ideas, this space is yours. May every module, message, and moment here spark something deeper in you.";
    if (quoteText) quoteText.innerHTML = '<span class="gold-glow">"Ignite purpose through transformative learning."</span><br><span class="orange-glow">"Welcome home to learning that matters."</span>';
  }
};

window.toggleAudioPlayback = function() {
  const btn = document.getElementById('founder-audio-btn');
  const label = document.getElementById('founder-audio-label');
  if (!btn || !label) return;

  const isPlaying = btn.getAttribute('data-playing') === 'true';
  if (isPlaying) {
    btn.setAttribute('data-playing', 'false');
    btn.innerHTML = '▶';
    label.textContent = 'Listen to Founder\'s Welcome Audio (1:15 min)';
    window.showToast('Audio paused', 'info');
  } else {
    btn.setAttribute('data-playing', 'true');
    btn.innerHTML = '⏸';
    label.textContent = 'Playing Alex\'s Message (0:12 / 1:15)';
    window.showToast('🎙️ Now Playing: Founder\'s Welcome Message by Alex', 'info', 4000);
  }
};



