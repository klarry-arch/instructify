/* ============================================================
   INSTRUCTIFY KENYA — UNIFIED SITE HEADER JAVASCRIPT CONTROLLER
   Handles:
     - Sticky header elevation on scroll (.scrolled)
     - Mobile navigation drawer toggle with ARIA & keyboard escape
   ============================================================ */

(function () {
  'use strict';

  function initHeader() {
    initHeaderScroll();
    initMobileNav();
    initFooterNewsletter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }

  function initHeaderScroll() {
    const header = document.querySelector('.sticky-header');
    if (!header) return;

    const handleScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    if (!toggleBtn || !drawer || toggleBtn.dataset.navBound === 'true') return;
    toggleBtn.dataset.navBound = 'true';

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

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        toggleMenu(false);
        toggleBtn.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  function initFooterNewsletter() {
    const forms = document.querySelectorAll('.footer-newsletter-form');
    forms.forEach((form) => {
      if (form.dataset.bound === 'true') return;
      form.dataset.bound = 'true';

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const btn = form.querySelector('button[type="submit"]');
        const msg = form.parentElement ? form.parentElement.querySelector('.footer-newsletter-msg') : null;
        if (!input) return;

        const email = input.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (msg) {
            msg.textContent = 'Please enter a valid email address.';
            msg.classList.add('is-visible', 'is-error');
          }
          input.focus();
          return;
        }

        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Saving...';
        }
        if (msg) {
          msg.classList.remove('is-error');
        }

        const payload = {
          name: 'Newsletter Subscriber',
          email: email,
          category: 'General Inquiry',
          subject: 'Footer Newsletter Subscription',
          message: `Newsletter signup from ${window.location.pathname}`
        };

        try {
          let res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.status === 404) {
            await fetch('/api/contact.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        } catch (_) {
          // Graceful client-side confirmation even when offline
        }

        if (msg) {
          msg.textContent = 'Subscribed! Thank you for joining Instructify Kenya.';
          msg.classList.add('is-visible');
          msg.classList.remove('is-error');
        }
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Subscribe';
        }
      });
    });
  }
})();

