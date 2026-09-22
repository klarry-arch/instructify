/* ============================================================
   INSTRUCTIFY KENYA — LMS NOTIFICATIONS ENGINE
   In-app notification system with toast alerts, notification bell,
   and notification preferences management.
   ============================================================ */

(function(window) {
  'use strict';

  const NOTIF_KEY = 'ik_lms_notifications';
  const PREFS_KEY = 'ik_lms_notif_prefs';
  const MAX_NOTIFICATIONS = 100;

  // ── Default Notifications ──────────────────────────────────
  const DEFAULT_NOTIFICATIONS = [
    {
      id: 'notif_001',
      userId: 'usr_002', // trainer
      type: 'submission',
      title: 'New Assignment Submission',
      message: 'James Mwangi submitted Assignment 2.1: CBC Technology-Enhanced Lesson Plan',
      courseId: 'crs_001',
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actionUrl: 'educator-assessments.html'
    },
    {
      id: 'notif_002',
      userId: 'usr_002',
      type: 'enrollment',
      title: 'New Student Enrolled',
      message: 'Grace Wanjiku has enrolled in ICT Integration in Education',
      courseId: 'crs_001',
      read: false,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actionUrl: 'educator-students.html'
    },
    {
      id: 'notif_003',
      userId: 'usr_001', // learner
      type: 'grade',
      title: 'Quiz Graded',
      message: 'Your Quiz 1.1: Foundations of CBC Digital Literacy has been graded. Score: 100%',
      courseId: 'crs_001',
      read: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      actionUrl: 'course-player.html?id=crs_001'
    },
    {
      id: 'notif_004',
      userId: 'usr_001',
      type: 'announcement',
      title: 'New Course Announcement',
      message: 'Dr. Wanjiku posted: Upcoming Live Q&A on Formative Assessment Best Practices',
      courseId: 'crs_001',
      read: false,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      actionUrl: 'course-player.html?id=crs_001'
    },
    {
      id: 'notif_005',
      userId: 'usr_003', // admin
      type: 'approval',
      title: 'Course Awaiting Approval',
      message: 'Dr. Wanjiku submitted "Advanced CBC Assessment Methods" for review',
      courseId: 'crs_new_001',
      read: false,
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      actionUrl: 'dashboard-admin.html'
    }
  ];

  // ── Storage Helpers ─────────────────────────────────────────
  function getAll() {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e) { /* ignore */ }
    localStorage.setItem(NOTIF_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return [...DEFAULT_NOTIFICATIONS];
  }

  function saveAll(notifications) {
    if (notifications.length > MAX_NOTIFICATIONS) {
      notifications.length = MAX_NOTIFICATIONS;
    }
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  }

  // ── Notification API ────────────────────────────────────────
  const LMSNotifications = {

    // Get notifications for a specific user
    getForUser: function(userId) {
      return getAll().filter(n => n.userId === userId);
    },

    // Get unread count
    getUnreadCount: function(userId) {
      return this.getForUser(userId).filter(n => !n.read).length;
    },

    // Mark a notification as read
    markRead: function(notifId) {
      const all = getAll();
      const notif = all.find(n => n.id === notifId);
      if (notif) {
        notif.read = true;
        saveAll(all);
      }
    },

    // Mark all as read for a user
    markAllRead: function(userId) {
      const all = getAll();
      all.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
      saveAll(all);
    },

    // Create a new notification
    create: function(data) {
      const all = getAll();
      const notif = {
        id: 'notif_' + Date.now().toString(36),
        userId: data.userId,
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        courseId: data.courseId || null,
        read: false,
        timestamp: new Date().toISOString(),
        actionUrl: data.actionUrl || null
      };
      all.unshift(notif);
      saveAll(all);

      // Show toast if the notification is for the current user
      const session = window.getSession ? window.getSession() : null;
      if (session && session.id === data.userId) {
        this.showToast(notif);
        this.updateBellCount();
      }

      return notif;
    },

    // Delete notification
    remove: function(notifId) {
      const all = getAll().filter(n => n.id !== notifId);
      saveAll(all);
    },

    // ── Toast System ──────────────────────────────────────────
    showToast: function(notification) {
      let container = document.querySelector('.lms-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'lms-toast-container';
        document.body.appendChild(container);
      }

      const typeIcons = {
        submission: '📝',
        enrollment: '🎓',
        grade: '📊',
        announcement: '📢',
        approval: '✅',
        reminder: '⏰',
        info: 'ℹ️',
        warning: '⚠️',
        success: '✅',
        error: '❌'
      };

      const typeClasses = {
        submission: 'toast-info',
        enrollment: 'toast-success',
        grade: 'toast-success',
        announcement: 'toast-info',
        approval: 'toast-warning',
        reminder: 'toast-warning',
        info: 'toast-info',
        warning: 'toast-warning',
        success: 'toast-success',
        error: 'toast-error'
      };

      const toast = document.createElement('div');
      toast.className = 'lms-toast ' + (typeClasses[notification.type] || 'toast-info');
      toast.innerHTML = `
        <span style="font-size:18px;flex-shrink:0;">${typeIcons[notification.type] || 'ℹ️'}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:2px;">${notification.title || ''}</div>
          <div style="font-size:12px;color:#64748B;line-height:1.4;">${notification.message || ''}</div>
        </div>
        <button onclick="this.closest('.lms-toast').remove()" style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:16px;padding:2px;">×</button>
      `;

      container.appendChild(toast);

      // Auto-dismiss after 5 seconds
      setTimeout(function() {
        if (toast.parentNode) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(20px)';
          toast.style.transition = 'all 0.3s ease';
          setTimeout(function() { toast.remove(); }, 300);
        }
      }, 5000);
    },

    // ── Notification Bell Update ──────────────────────────────
    updateBellCount: function() {
      const session = window.getSession ? window.getSession() : null;
      if (!session) return;

      const count = this.getUnreadCount(session.id);
      const badges = document.querySelectorAll('.lms-notification-count');
      badges.forEach(function(badge) {
        if (count > 0) {
          badge.textContent = count > 99 ? '99+' : count;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      });
    },

    // ── Render notification dropdown ──────────────────────────
    renderNotificationList: function(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const session = window.getSession ? window.getSession() : null;
      if (!session) return;

      const notifications = this.getForUser(session.id).slice(0, 10);

      if (notifications.length === 0) {
        container.innerHTML = `
          <div class="lms-empty-state" style="padding:24px;">
            <div class="icon">🔔</div>
            <div class="title" style="font-size:14px;">No notifications</div>
            <div class="message" style="font-size:12px;">You're all caught up!</div>
          </div>
        `;
        return;
      }

      const typeIcons = {
        submission: '📝', enrollment: '🎓', grade: '📊',
        announcement: '📢', approval: '✅', reminder: '⏰',
        info: 'ℹ️', warning: '⚠️', success: '✅', error: '❌'
      };

      container.innerHTML = notifications.map(function(n) {
        const timeAgo = LMSNotifications.timeAgo(n.timestamp);
        return `
          <div class="lms-activity-item ${n.read ? '' : 'unread'}" style="${n.read ? '' : 'background:#F8FAFC;'}" data-notif-id="${n.id}">
            <div class="lms-activity-icon" style="background:${n.read ? '#F1F5F9' : '#EEF2FF'};font-size:16px;">
              ${typeIcons[n.type] || 'ℹ️'}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:${n.read ? '500' : '700'};color:#0F172A;line-height:1.4;">
                ${n.title}
              </div>
              <div style="font-size:12px;color:#64748B;margin-top:2px;line-height:1.3;">
                ${n.message}
              </div>
              <div style="font-size:11px;color:#94A3B8;margin-top:4px;">${timeAgo}</div>
            </div>
            ${!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:#2145E6;flex-shrink:0;"></div>' : ''}
          </div>
        `;
      }).join('');
    },

    // ── Time Ago Helper ───────────────────────────────────────
    timeAgo: function(timestamp) {
      const now = Date.now();
      const diff = now - new Date(timestamp).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return mins + 'm ago';
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return hrs + 'h ago';
      const days = Math.floor(hrs / 24);
      if (days < 7) return days + 'd ago';
      return new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    },

    // ── Notification Preferences ──────────────────────────────
    getPreferences: function() {
      try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; }
      catch { return {}; }
    },

    setPreference: function(key, enabled) {
      const prefs = this.getPreferences();
      prefs[key] = enabled;
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    },

    // ── Bulk notification creators ────────────────────────────
    notifyEnrollment: function(studentName, courseName, educatorId) {
      this.create({
        userId: educatorId,
        type: 'enrollment',
        title: 'New Student Enrolled',
        message: `${studentName} has enrolled in ${courseName}`,
        actionUrl: 'educator-students.html'
      });
    },

    notifySubmission: function(studentName, assignmentTitle, educatorId) {
      this.create({
        userId: educatorId,
        type: 'submission',
        title: 'New Assignment Submission',
        message: `${studentName} submitted ${assignmentTitle}`,
        actionUrl: 'educator-assessments.html'
      });
    },

    notifyGraded: function(assignmentTitle, score, studentId) {
      this.create({
        userId: studentId,
        type: 'grade',
        title: 'Assignment Graded',
        message: `Your ${assignmentTitle} has been graded. Score: ${score}%`,
        actionUrl: 'student-assignments.html'
      });
    },

    notifyAnnouncement: function(title, educatorName, studentIds) {
      const self = this;
      studentIds.forEach(function(sid) {
        self.create({
          userId: sid,
          type: 'announcement',
          title: 'New Announcement',
          message: `${educatorName}: ${title}`,
          actionUrl: 'dashboard-learner.html'
        });
      });
    },

    notifyCourseApproval: function(courseName, educatorId, approved) {
      this.create({
        userId: educatorId,
        type: approved ? 'success' : 'warning',
        title: approved ? 'Course Approved' : 'Changes Requested',
        message: approved
          ? `Your course "${courseName}" has been approved and is ready to publish.`
          : `Your course "${courseName}" requires changes before publication.`,
        actionUrl: 'educator-courses.html'
      });
    }
  };

  // ── Expose ──────────────────────────────────────────────────
  window.LMSNotifications = LMSNotifications;

  // ── Init on page load ───────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    LMSNotifications.updateBellCount();
  });

})(window);
