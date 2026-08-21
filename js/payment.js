/* ============================================================
   INSTRUCTIFY KENYA — PAYMENT MODULE v2
   Real Paystack integration via CheckoutEngine.
   The legacy simulated flow has been replaced.
   ============================================================ */

'use strict';

/**
 * Entry point called by "Enroll Now" buttons across all pages.
 * Delegates to CheckoutEngine which handles auth, order creation,
 * payment initiation, and polling.
 *
 * @param {string} courseId
 */
window.initPaymentFlow = function (courseId) {
  if (!window.CheckoutEngine) {
    console.error('[payment] CheckoutEngine not loaded — ensure checkout-engine.js is included before payment.js');
    window.showToast('Payment system is loading. Please try again in a moment.', 'warning');
    return;
  }
  // Navigate to the dedicated checkout page — this keeps the modal clean
  // and allows the full multi-step experience.
  window.location.href = `checkout.html?id=${encodeURIComponent(courseId)}`;
};

/**
 * Legacy alias — keeps backwards compatibility with any existing
 * onclick="enrollCourse(courseId)" calls.
 */
window.enrollWithPayment = window.initPaymentFlow;
