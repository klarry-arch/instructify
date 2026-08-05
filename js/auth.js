/* ============================================================
   INSTRUCTIFY KENYA — AUTHENTICATION MODULE
   ============================================================ */

'use strict';

// ── Mock User Database ──────────────────────────────────────────
const MOCK_USERS = [
  { id: 'usr_001', email: 'learner@instructify.ke', password: 'Learn@2024', name: 'James Mwangi', role: 'learner', avatar: 'JM', verified: true },
  { id: 'usr_002', email: 'trainer@instructify.ke', password: 'Train@2024', name: 'Dr. Wanjiku Kamau', role: 'trainer', avatar: 'WK', verified: true },
  { id: 'usr_003', email: 'admin@instructify.ke',   password: 'Admin@2024', name: 'Prof. Ochieng Otieno', role: 'admin', avatar: 'OO', verified: true },
];

const SESSION_KEY  = 'ik_session';
const USERS_KEY    = 'ik_users';

// ── Session Management ──────────────────────────────────────────
function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function setSession(user) {
  const session = { ...user, loggedInAt: new Date().toISOString() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

window.getSession = getSession;
window.isLoggedIn = () => !!getSession();

// ── Get stored users (mock + registered) ───────────────────────
function getAllUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  const extra = stored ? JSON.parse(stored) : [];
  return [...MOCK_USERS, ...extra];
}

function saveUser(user) {
  const stored = localStorage.getItem(USERS_KEY);
  const users = stored ? JSON.parse(stored) : [];
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Login ───────────────────────────────────────────────────────
window.attemptLogin = function(email, password) {
  const users = getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) return { success: false, message: 'No account found with that email address.' };
  if (user.password !== password) return { success: false, message: 'Incorrect password. Please try again.' };
  if (!user.verified) return { success: false, message: 'Please verify your email before logging in.' };
  
  setSession(user);
  return { success: true, user };
};

// ── Register ────────────────────────────────────────────────────
window.attemptRegister = function(data) {
  const users = getAllUsers();
  
  if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, message: 'An account with this email already exists.' };
  }
  
  if (data.password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters.' };
  }
  
  const newUser = {
    id: 'usr_' + Date.now(),
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role || 'learner',
    phone: data.phone || '',
    institution: data.institution || '',
    avatar: data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    verified: true, // auto-verify in demo
    registeredAt: new Date().toISOString()
  };
  
  saveUser(newUser);
  setSession(newUser);
  return { success: true, user: newUser };
};

// ── Logout ──────────────────────────────────────────────────────
window.logout = function() {
  clearSession();
  window.location.href = 'index.html';
};

// ── Redirect if not authenticated ───────────────────────────────
window.requireAuth = function(allowedRoles = []) {
  const session = getSession();
  if (!session) {
    showToast('Please log in to access this page.', 'warning');
    setTimeout(() => window.location.href = 'register.html', 1200);
    return false;
  }
  if (allowedRoles.length && !allowedRoles.includes(session.role)) {
    showToast('You do not have permission to access this page.', 'error');
    setTimeout(() => {
      const redirectMap = { admin: 'dashboard-admin.html', trainer: 'dashboard-trainer.html', learner: 'dashboard-learner.html' };
      window.location.href = redirectMap[session.role] || 'index.html';
    }, 1200);
    return false;
  }
  return session;
};

// ── Update UI based on auth state ───────────────────────────────
window.updateAuthUI = function() {
  const session = getSession();
  const loginBtn  = document.getElementById('nav-login-btn');
  const userMenu  = document.getElementById('nav-user-menu');
  const userAvatar= document.getElementById('nav-user-avatar');
  const userName  = document.getElementById('nav-user-name');

  if (session) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userAvatar) userAvatar.textContent = session.avatar || session.name.slice(0,2).toUpperCase();
    if (userName) userName.textContent = session.name.split(' ')[0];
  } else {
    if (loginBtn) loginBtn.style.display = '';
    if (userMenu) userMenu.style.display = 'none';
  }
};

// ── Password Reset (simulated) ───────────────────────────────────
window.requestPasswordReset = function(email) {
  const users = getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { success: false, message: 'No account found with that email.' };
  return { success: true, message: `Password reset link sent to ${email}. Check your inbox.` };
};

// ── Init on page load ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
});
