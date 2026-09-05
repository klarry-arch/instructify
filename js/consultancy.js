/* ============================================================
   INSTRUCTIFY KENYA — Consultancy Page Interactivity
   Animated Statistics, Form Handling & Smooth Navigation
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
      const duration = 1800; // ms
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: easeOutQuart
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
  } else {
    // Fallback if IntersectionObserver not available
    animateCounters();
  }

  // ── 2. Smooth Anchor Navigation ─────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

  // ── 3. Consultation Booking Form Submission ─────────────────
  const form = document.getElementById('consultation-form');
  const feedback = document.getElementById('form-feedback');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const institution = form.querySelector('#inst_name').value.trim();
      const contactPerson = form.querySelector('#contact_person').value.trim();
      const email = form.querySelector('#email').value.trim();
      const phone = form.querySelector('#phone').value.trim();
      const instType = form.querySelector('#inst_type').value;
      const notes = form.querySelector('#notes').value.trim();

      // Collect checked services
      const checkedServices = [];
      form.querySelectorAll('input[name="services"]:checked').forEach(cb => {
        checkedServices.push(cb.value);
      });

      if (!institution || !contactPerson || !email || !phone) {
        if (feedback) {
          feedback.className = 'form-feedback error';
          feedback.textContent = 'Please fill in all required fields (Institution, Contact Name, Email, and Phone Number).';
          feedback.style.display = 'block';
        }
        return;
      }

      // Format WhatsApp message text
      const servicesText = checkedServices.length > 0 ? checkedServices.join(', ') : 'General Advisory';
      const waMessage = encodeURIComponent(
        `Hello Instructify Kenya,\n\nI would like to book a consultancy discovery session:\n` +
        `• Institution: ${institution} (${instType})\n` +
        `• Contact Person: ${contactPerson}\n` +
        `• Email: ${email}\n` +
        `• Phone: ${phone}\n` +
        `• Services Required: ${servicesText}\n` +
        (notes ? `• Specific Requirements: ${notes}` : '')
      );

      const waUrl = `https://wa.me/254143024416?text=${waMessage}`;

      if (feedback) {
        feedback.className = 'form-feedback success';
        feedback.innerHTML = `
          <strong>Thank you, ${contactPerson}!</strong> Your consultation request has been received. Our advisory team will reach out within 24 hours.<br><br>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:6px; color:#065F46; font-weight:700; text-decoration:underline;">
            💬 Click here to connect directly with our Lead Consultant on WhatsApp
          </a>
        `;
        feedback.style.display = 'block';
      }

      form.reset();
    });
  }
});
