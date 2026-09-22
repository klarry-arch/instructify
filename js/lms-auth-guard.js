/* ============================================================
   INSTRUCTIFY KENYA — LMS AUTH GUARD & ROUTE PROTECTION
   Provides role-based page access control, session validation,
   and automatic redirect logic for the LMS portal.
   ============================================================ */

(function(window) {
  'use strict';

  const ROLE_HIERARCHY = {
    admin:   3,
    trainer: 2,
    learner: 1
  };

  const ROLE_DASHBOARDS = {
    admin:   'dashboard-admin.html',
    trainer: 'dashboard-trainer.html',
    learner: 'dashboard-learner.html'
  };

  const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours
  const LOCKOUT_KEY = 'ik_lockouts';
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  // ── Session Expiry Check ────────────────────────────────────
  function isSessionExpired(session) {
    if (!session || !session.loggedInAt) return true;
    const elapsed = Date.now() - new Date(session.loggedInAt).getTime();
    return elapsed > SESSION_TIMEOUT_MS;
  }

  // ── Account Lockout ─────────────────────────────────────────
  function getLockouts() {
    try { return JSON.parse(localStorage.getItem(LOCKOUT_KEY)) || {}; }
    catch { return {}; }
  }

  function recordFailedAttempt(email) {
    const lockouts = getLockouts();
    const key = email.toLowerCase();
    if (!lockouts[key]) lockouts[key] = { attempts: 0, lockedUntil: null };
    lockouts[key].attempts++;
    if (lockouts[key].attempts >= MAX_FAILED_ATTEMPTS) {
      lockouts[key].lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockouts));
    return lockouts[key];
  }

  function clearFailedAttempts(email) {
    const lockouts = getLockouts();
    delete lockouts[email.toLowerCase()];
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockouts));
  }

  function isAccountLocked(email) {
    const lockouts = getLockouts();
    const record = lockouts[email.toLowerCase()];
    if (!record || !record.lockedUntil) return false;
    if (Date.now() > record.lockedUntil) {
      clearFailedAttempts(email);
      return false;
    }
    return true;
  }

  function getRemainingLockoutTime(email) {
    const lockouts = getLockouts();
    const record = lockouts[email.toLowerCase()];
    if (!record || !record.lockedUntil) return 0;
    return Math.max(0, Math.ceil((record.lockedUntil - Date.now()) / 60000));
  }

  // ── Password Strength ───────────────────────────────────────
  function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', label: 'Weak', color: '#DC2626', percent: 25 };
    if (score <= 3) return { level: 'fair', label: 'Fair', color: '#F59E0B', percent: 50 };
    if (score <= 4) return { level: 'good', label: 'Good', color: '#2145E6', percent: 75 };
    return { level: 'strong', label: 'Strong', color: '#059669', percent: 100 };
  }

  // ── Audit Logging ───────────────────────────────────────────
  const AUDIT_KEY = 'ik_audit_log';
  const MAX_AUDIT_ENTRIES = 500;

  function logAuditEvent(action, details) {
    try {
      const logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
      const session = window.getSession ? window.getSession() : null;
      logs.unshift({
        id: 'aud_' + Date.now().toString(36),
        timestamp: new Date().toISOString(),
        action: action,
        userId: session ? session.id : 'anonymous',
        userName: session ? session.name : 'Anonymous',
        userRole: session ? session.role : 'none',
        details: details || '',
        ip: 'local' // placeholder
      });
      // Keep only the most recent entries
      if (logs.length > MAX_AUDIT_ENTRIES) logs.length = MAX_AUDIT_ENTRIES;
      localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
    } catch(e) { /* non-critical */ }
  }

  function getAuditLog(filters) {
    try {
      let logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
      if (filters) {
        if (filters.userId) logs = logs.filter(l => l.userId === filters.userId);
        if (filters.action) logs = logs.filter(l => l.action === filters.action);
        if (filters.role) logs = logs.filter(l => l.userRole === filters.role);
      }
      return logs;
    } catch { return []; }
  }

  // ── Guard: Protect page based on role ───────────────────────
  function guardPage(allowedRoles, options) {
    options = options || {};
    const session = window.getSession ? window.getSession() : null;

    // No session → redirect to login
    if (!session) {
      if (options.silent) return null;
      const returnUrl = window.location.pathname + window.location.search;
      localStorage.setItem('ik_return_to_url', returnUrl);
      if (window.showToast) window.showToast('Please sign in to access this page.', 'warning');
      setTimeout(function() {
        window.location.href = 'login.html';
      }, options.delay || 800);
      return null;
    }

    // Session expired → force logout
    if (isSessionExpired(session)) {
      if (window.showToast) window.showToast('Your session has expired. Please sign in again.', 'warning');
      if (window.logout) window.logout();
      return null;
    }

    // Check role permission
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(session.role)) {
        if (window.showToast) window.showToast('You do not have permission to view this page.', 'error');
        logAuditEvent('UNAUTHORIZED_ACCESS', 'Attempted to access: ' + window.location.pathname);
        setTimeout(function() {
          window.location.href = ROLE_DASHBOARDS[session.role] || 'index.html';
        }, options.delay || 1200);
        return null;
      }
    }

    // Log page access
    logAuditEvent('PAGE_VIEW', window.location.pathname);

    return session;
  }

  // ── Post-login redirect ─────────────────────────────────────
  function getPostLoginRedirect(role) {
    const returnUrl = localStorage.getItem('ik_return_to_url');
    if (returnUrl) {
      localStorage.removeItem('ik_return_to_url');
      return returnUrl;
    }
    return ROLE_DASHBOARDS[role] || 'index.html';
  }

  // ── Enhanced login with lockout ─────────────────────────────
  function enhancedLogin(email, password) {
    if (isAccountLocked(email)) {
      const mins = getRemainingLockoutTime(email);
      return {
        success: false,
        message: `Account is temporarily locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
        locked: true
      };
    }

    const result = window.attemptLogin(email, password);
    if (result.success) {
      clearFailedAttempts(email);
      logAuditEvent('LOGIN_SUCCESS', email);
      return result;
    }

    const lockState = recordFailedAttempt(email);
    logAuditEvent('LOGIN_FAILED', email);

    if (lockState.lockedUntil) {
      return {
        success: false,
        message: `Too many failed attempts. Account locked for ${Math.ceil(LOCKOUT_DURATION_MS / 60000)} minutes.`,
        locked: true
      };
    }

    const remaining = MAX_FAILED_ATTEMPTS - lockState.attempts;
    if (remaining <= 2) {
      result.message += ` ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`;
    }

    return result;
  }

  // ── Profile Management ──────────────────────────────────────
  function updateProfile(updates) {
    const session = window.getSession ? window.getSession() : null;
    if (!session) return { success: false, message: 'Not signed in.' };

    // Update in session
    if (updates.name) session.name = updates.name;
    if (updates.phone) session.phone = updates.phone;
    if (updates.institution) session.institution = updates.institution;
    if (updates.avatar) session.avatar = updates.avatar;

    sessionStorage.setItem('ik_session', JSON.stringify(session));
    localStorage.setItem('ik_session', JSON.stringify(session));

    // Also update in stored users
    try {
      const stored = JSON.parse(localStorage.getItem('ik_users') || '[]');
      const userIdx = stored.findIndex(u => u.id === session.id);
      if (userIdx >= 0) {
        Object.assign(stored[userIdx], updates);
        localStorage.setItem('ik_users', JSON.stringify(stored));
      }
    } catch(e) { /* non-critical */ }

    logAuditEvent('PROFILE_UPDATED', 'Updated: ' + Object.keys(updates).join(', '));
    return { success: true, user: session };
  }

  // ── Expose API ──────────────────────────────────────────────
  window.LMSAuth = {
    guardPage: guardPage,
    isSessionExpired: isSessionExpired,
    isAccountLocked: isAccountLocked,
    getRemainingLockoutTime: getRemainingLockoutTime,
    getPasswordStrength: getPasswordStrength,
    enhancedLogin: enhancedLogin,
    getPostLoginRedirect: getPostLoginRedirect,
    updateProfile: updateProfile,
    logAuditEvent: logAuditEvent,
    getAuditLog: getAuditLog,
    clearFailedAttempts: clearFailedAttempts,
    ROLE_DASHBOARDS: ROLE_DASHBOARDS,
    ROLE_HIERARCHY: ROLE_HIERARCHY
  };

})(window);
