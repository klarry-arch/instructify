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
})();

