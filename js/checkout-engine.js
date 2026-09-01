/* ============================================================
   INSTRUCTIFY KENYA — Checkout & Daraja M-Pesa Payment Engine
   Secure, production-ready payment flow with server-side validation,
   real STK push, controlled polling, and status reconciliation.
   ============================================================ */

'use strict';

(function () {
  const API_BASE = '';
  const POLL_INTERVAL_MS = 3500;
  const POLL_TIMEOUT_MS = 120000; // 2 minutes max polling window

  let _state = {
    status: 'idle', // idle|creating_order|awaiting_payment|processing|paid|failed|cancelled|timed_out
    courseId: null,
    orderReference: null,
    checkoutRequestId: null,
    method: null,
    phone: null,
    maskedPhone: null,
    amount: null,
    payableAmountKes: null,
    currency: 'KES',
    courseTitle: null,
    receiptNumber: null,
    paidAt: null,
    error: null,
    cooldownRemaining: 0,
    cooldownTimer: null,
    pollTimer: null,
    pollStarted: null,
    isManualChecking: false,
  };

  let _onStatusChange = null;

  window.CheckoutEngine = {
    onStatusChange(cb) {
      _onStatusChange = cb;
    },

    getState() {
      return { ..._state };
    },

    /**
     * Step 1: Start checkout for a course — creates order server-side.
     */
    async startCheckout(courseId) {
      const session = window.getSession ? window.getSession() : null;
      if (!session) {
        localStorage.setItem(
          'ik_return_to',
          JSON.stringify({
            action: 'enroll',
            courseId,
            url: `checkout.html?id=${courseId}`,
          })
        );
        if (window.showToast) window.showToast('Please sign in to enroll.', 'warning');
        setTimeout(() => { window.location.href = 'register.html'; }, 1200);
        return;
      }

      // Check existing local enrollment
      const enrollments = JSON.parse(localStorage.getItem('ik_enrollments') || '[]');
      const alreadyEnrolled = enrollments.some(
        (e) => e.courseId === courseId && e.userId === session.id
      );
      if (alreadyEnrolled) {
        if (window.showToast) window.showToast('You are already enrolled in this course!', 'info');
        setTimeout(() => { window.location.href = 'dashboard-learner.html'; }, 1200);
        return;
      }

      _setState({ status: 'creating_order', courseId, error: null });

      try {
        const res = await fetch(`${API_BASE}/api/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            userId: session.id,
            userEmail: session.email,
            userName: session.name,
          }),
        });

        const data = await res.json();

        if (res.status === 409 && data.error === 'already_enrolled') {
          _addLocalEnrollment(session.id, courseId, data);
          if (window.showToast) window.showToast('You are already enrolled in this course!', 'info');
          setTimeout(() => { window.location.href = 'dashboard-learner.html'; }, 1200);
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to create order. Please try again.');
        }

        _setState({
          status: 'awaiting_payment',
          orderReference: data.orderReference,
          amount: data.amount,
          payableAmountKes: Math.round(Number(data.amount) / 100),
          currency: data.currency || 'KES',
          courseTitle: data.courseTitle,
          error: null,
        });
      } catch (err) {
        console.error('[CheckoutEngine] Order creation error:', err);
        _setState({ status: 'failed', error: err.message });
      }
    },

    /**
     * Step 2: Submit M-Pesa STK Push payment.
     */
    async payWithMpesa(phone, forceResend = false) {
      if (!_state.orderReference) {
        _setState({ status: 'failed', error: 'No active order. Please restart checkout.' });
        return;
      }

      _setState({
        status: 'processing',
        method: 'mpesa',
        phone,
        error: null,
      });

      try {
        const res = await fetch(`${API_BASE}/api/initiate-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderReference: _state.orderReference,
            method: 'mpesa',
            phone,
            forceResend,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to initiate M-Pesa prompt.');
        }

        _setState({
          status: 'processing',
          checkoutRequestId: data.checkoutRequestId || null,
          maskedPhone: data.maskedPhone || phone,
          phone: data.phone || phone,
          payableAmountKes: data.payableAmountKes || Math.round(_state.amount / 100),
          cooldownRemaining: data.cooldownSeconds || 30,
        });

        _startCooldown(data.cooldownSeconds || 30);
        _startPolling();
      } catch (err) {
        console.error('[CheckoutEngine] STK Push initiation failed:', err);
        _setState({ status: 'failed', error: err.message });
      }
    },

    /**
     * Resend STK Prompt with cooldown guard.
     */
    async resendPrompt() {
      if (_state.cooldownRemaining > 0) {
        if (window.showToast) {
          window.showToast(`Please wait ${_state.cooldownRemaining}s before resending prompt.`, 'warning');
        }
        return;
      }
      if (_state.phone) {
        if (window.showToast) window.showToast('Resending M-Pesa payment prompt...', 'info');
        await this.payWithMpesa(_state.phone, true);
      }
    },

    /**
     * Manually check payment status on demand.
     */
    async checkStatusNow() {
      if (_state.isManualChecking) return;
      _setState({ isManualChecking: true });
      if (window.showToast) window.showToast('Checking payment status with Safaricom...', 'info');
      await _checkPaymentStatus();
      _setState({ isManualChecking: false });
    },

    /**
     * Change phone number — returns to phone input state.
     */
    changePhoneNumber() {
      _stopPolling();
      _stopCooldown();
      _setState({ status: 'awaiting_payment', method: 'mpesa', error: null });
    },

    /**
     * Card payment via Paystack.
     */
    async payWithCard() {
      if (!_state.orderReference) {
        _setState({ status: 'failed', error: 'No active order.' });
        return;
      }

      _setState({ status: 'processing', method: 'card', error: null });

      try {
        const res = await fetch(`${API_BASE}/api/initiate-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderReference: _state.orderReference,
            method: 'card',
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Card payment initialization failed');

        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        }
      } catch (err) {
        _setState({ status: 'failed', error: err.message });
      }
    },

    /**
     * Cancel checkout.
     */
    cancel() {
      _stopPolling();
      _stopCooldown();
      _setState({ status: 'cancelled', error: 'Payment request was cancelled.' });
    },
  };

  // ── Internal Helpers ──────────────────────────────────────

  function _setState(patch) {
    _state = { ..._state, ...patch };
    if (_onStatusChange) _onStatusChange({ ..._state });
  }

  function _startCooldown(seconds) {
    _stopCooldown();
    _state.cooldownRemaining = seconds;
    _state.cooldownTimer = setInterval(() => {
      if (_state.cooldownRemaining <= 1) {
        _stopCooldown();
        _setState({ cooldownRemaining: 0 });
      } else {
        _setState({ cooldownRemaining: _state.cooldownRemaining - 1 });
      }
    }, 1000);
  }

  function _stopCooldown() {
    if (_state.cooldownTimer) {
      clearInterval(_state.cooldownTimer);
      _state.cooldownTimer = null;
    }
  }

  function _startPolling() {
    _stopPolling();
    _state.pollStarted = Date.now();
    _state.pollTimer = setInterval(_checkPaymentStatus, POLL_INTERVAL_MS);
  }

  function _stopPolling() {
    if (_state.pollTimer) {
      clearInterval(_state.pollTimer);
      _state.pollTimer = null;
    }
  }

  async function _checkPaymentStatus() {
    if (!_state.orderReference) return;

    if (Date.now() - _state.pollStarted > POLL_TIMEOUT_MS) {
      _stopPolling();
      _setState({
        status: 'timed_out',
        error: 'Payment confirmation timed out. If you entered your PIN, please click "Check Payment Status" or contact support.',
      });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/verify-payment?ref=${encodeURIComponent(_state.orderReference)}`
      );
      const data = await res.json();
      if (!res.ok) return;

      if (data.status === 'paid') {
        _stopPolling();
        _stopCooldown();

        const session = window.getSession ? window.getSession() : null;
        if (session) _addLocalEnrollment(session.id, _state.courseId, data);

        _setState({
          status: 'paid',
          receiptNumber: data.receiptNumber || 'MP-' + Date.now(),
          paidAt: data.paidAt || new Date().toISOString(),
          payableAmountKes: data.payableAmountKes || Math.round(_state.amount / 100),
          courseTitle: data.courseTitle || _state.courseTitle,
        });
        return;
      }

      if (['failed', 'cancelled', 'timed_out'].includes(data.status)) {
        _stopPolling();
        _stopCooldown();
        _setState({
          status: data.status,
          error: data.failureReason || 'Payment could not be completed.',
        });
      }
    } catch (err) {
      // Network hiccup — keep polling
      console.warn('[CheckoutEngine] Polling network warning:', err);
    }
  }

  function _addLocalEnrollment(userId, courseId, orderData = {}) {
    try {
      const enrollments = JSON.parse(localStorage.getItem('ik_enrollments') || '[]');
      if (!enrollments.some((e) => e.courseId === courseId && e.userId === userId)) {
        enrollments.unshift({
          id: 'enr_' + Date.now(),
          userId,
          courseId,
          orderId: _state.orderReference,
          receiptNumber: orderData.receiptNumber || _state.receiptNumber || '',
          amount: _state.payableAmountKes || orderData.payableAmountKes || 0,
          enrolledAt: orderData.paidAt || new Date().toISOString(),
          progress: 0,
          completed: false,
          status: 'active',
          lastAccessed: new Date().toISOString(),
        });
        localStorage.setItem('ik_enrollments', JSON.stringify(enrollments));
      }
    } catch (e) {
      console.warn('[CheckoutEngine] Local storage sync error:', e);
    }
  }
})();
