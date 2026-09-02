/**
 * INSTRUCTIFY KENYA — Live Chat & Communication Engine v1.0
 * Provides interactive floating assistant, automated smart routing, lead capture, and WhatsApp bridge.
 */

(function () {
  'use strict';

  let chatOpen = false;
  const config = window.INSTRUCTIFY_COMM_CONFIG || {};
  const contact = config.contact || { whatsappNumber: '254143024416', displayPhone: '0143 024 416', email: 'info@instructify.ke' };
  const chatConfig = config.chat || {};

  function initLiveChat() {
    if (document.getElementById('instructify-chat-launcher')) return;

    // 1. Build and Inject DOM
    const launcherHtml = `
      <button id="instructify-chat-launcher" class="instructify-chat-launcher" aria-label="Open Live Chat" aria-expanded="false">
        <div class="chat-launcher-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
            <circle cx="8" cy="9" r="1.5"/><circle cx="12" cy="9" r="1.5"/><circle cx="16" cy="9" r="1.5"/>
          </svg>
          <span class="chat-online-badge" aria-label="Online"></span>
        </div>
        <span>Chat with Us</span>
      </button>

      <div id="instructify-chat-window" class="instructify-chat-window" role="dialog" aria-label="Instructify Live Chat" aria-modal="true">
        <!-- Header -->
        <div class="chat-window-header">
          <div class="chat-header-info">
            <div class="chat-bot-avatar">
              IK
              <span class="chat-avatar-status"></span>
            </div>
            <div class="chat-header-titles">
              <span class="chat-header-title">${chatConfig.botName || 'Instructify Assistant'}</span>
              <span class="chat-header-status"><span class="status-dot"></span> Online &bull; Replies in 2m</span>
            </div>
          </div>
          <div class="chat-header-actions">
            <a href="https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent('Hello Instructify Kenya, I would like to connect.')}" 
               target="_blank" rel="noopener noreferrer" class="chat-header-btn chat-whatsapp-btn" title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </a>
            <button id="chat-close-btn" class="chat-header-btn" title="Close Chat" aria-label="Close Chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Body Message Stream -->
        <div id="chat-window-body" class="chat-window-body">
          <div class="chat-msg bot">
            <div class="chat-bubble">
              <strong>${chatConfig.greeting?.title || 'Hello! Welcome to Instructify Kenya 👋'}</strong><br>
              ${chatConfig.greeting?.message || 'How can we help you today? Ask us about our courses, consultancy, or podcast.'}
            </div>
            <span class="chat-msg-time">Just now</span>
          </div>

          <!-- Quick Topic Pills -->
          <div class="chat-topics-container">
            <span class="chat-topics-title">Choose a topic or ask below:</span>
            <div class="chat-topics-grid" id="chat-topics-grid">
              ${(chatConfig.topics || []).map(t => `
                <button type="button" class="chat-topic-chip" data-topic-id="${t.id}">
                  <span>${t.icon}</span> ${t.label}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer Input Bar -->
        <div class="chat-window-footer">
          <form id="chat-input-form" class="chat-input-row" autocomplete="off">
            <input type="text" id="chat-text-input" class="chat-text-input" placeholder="Type your question..." aria-label="Chat message">
            <button type="submit" class="chat-send-btn" aria-label="Send message">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>
          <a href="https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent('Hello Instructify Kenya, I would like to chat directly.')}" 
             target="_blank" rel="noopener noreferrer" class="chat-whatsapp-footer-link">
            <span>💬 Continue on WhatsApp →</span>
          </a>
        </div>
      </div>
    `;

    const chatContainer = document.createElement('div');
    chatContainer.id = 'instructify-chat-container';
    chatContainer.innerHTML = launcherHtml;
    document.body.appendChild(chatContainer);

    // 2. Event Listeners
    const launcher = document.getElementById('instructify-chat-launcher');
    const chatWindow = document.getElementById('instructify-chat-window');
    const closeBtn = document.getElementById('chat-close-btn');
    const chatForm = document.getElementById('chat-input-form');
    const textInput = document.getElementById('chat-text-input');
    const topicsGrid = document.getElementById('chat-topics-grid');

    launcher.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);

    topicsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.chat-topic-chip');
      if (!btn) return;
      const topicId = btn.dataset.topicId;
      const topicLabel = btn.innerText.trim();
      handleUserTopicSelect(topicId, topicLabel);
    });

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = textInput.value.trim();
      if (!text) return;
      handleUserTextMessage(text);
      textInput.value = '';
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatOpen) closeChat();
    });
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    const chatWindow = document.getElementById('instructify-chat-window');
    const launcher = document.getElementById('instructify-chat-launcher');

    chatWindow.classList.toggle('open', chatOpen);
    launcher.setAttribute('aria-expanded', String(chatOpen));

    if (chatOpen) {
      setTimeout(() => {
        const input = document.getElementById('chat-text-input');
        if (input && window.innerWidth > 768) input.focus();
        scrollToBottom();
      }, 100);
    }
  }

  function closeChat() {
    chatOpen = false;
    const chatWindow = document.getElementById('instructify-chat-window');
    const launcher = document.getElementById('instructify-chat-launcher');
    chatWindow.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
  }

  function appendUserBubble(text) {
    const stream = document.getElementById('chat-window-body');
    const msg = document.createElement('div');
    msg.className = 'chat-msg user';
    msg.innerHTML = `
      <div class="chat-bubble">${escapeHtml(text)}</div>
      <span class="chat-msg-time">Just now</span>
    `;
    stream.appendChild(msg);
    scrollToBottom();
  }

  function appendBotCard(cardData) {
    const stream = document.getElementById('chat-window-body');
    const msg = document.createElement('div');
    msg.className = 'chat-msg bot';

    let actionsHtml = '';
    if (cardData.actions && cardData.actions.length) {
      actionsHtml = `
        <div class="chat-action-buttons">
          ${cardData.actions.map(act => {
            if (act.url) {
              return `<a href="${act.url}" class="chat-act-btn ${act.type || 'primary'}">${act.text}</a>`;
            } else if (act.action === 'whatsapp') {
              const url = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent('Hello Instructify Kenya, I am enquiring about ' + (act.topic || 'your services') + '.')}`;
              return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-act-btn whatsapp">${act.text}</a>`;
            } else if (act.action === 'form') {
              return `<button type="button" class="chat-act-btn secondary" onclick="window.InstructifyChat.showLeadForm('${act.topic || 'General'}')">${act.text}</button>`;
            }
            return '';
          }).join('')}
        </div>
      `;
    }

    msg.innerHTML = `
      <div class="chat-bubble">
        <div class="chat-action-card">
          <h4>${cardData.title}</h4>
          <p>${cardData.text}</p>
          ${actionsHtml}
        </div>
      </div>
      <span class="chat-msg-time">Just now</span>
    `;
    stream.appendChild(msg);
    scrollToBottom();
  }

  function appendLeadForm(topic) {
    const stream = document.getElementById('chat-window-body');
    const msg = document.createElement('div');
    msg.className = 'chat-msg bot';

    msg.innerHTML = `
      <div class="chat-bubble">
        <div class="chat-lead-form" id="active-lead-form">
          <h4>📝 Leave a Message (${topic})</h4>
          <p style="font-size:12px; color:#64748B; margin:0;">Our team will get back to you via WhatsApp or Email.</p>
          <input type="text" id="lead-name" class="chat-lead-input" placeholder="Your Full Name *" required>
          <input type="text" id="lead-phone" class="chat-lead-input" placeholder="Phone or WhatsApp Number *" required>
          <input type="email" id="lead-email" class="chat-lead-input" placeholder="Email Address">
          <textarea id="lead-msg" class="chat-lead-input chat-lead-textarea" placeholder="How can we assist you?"></textarea>
          <button type="button" class="chat-lead-submit" onclick="window.InstructifyChat.submitLead('${topic}')">Send Enquiry ✓</button>
        </div>
      </div>
      <span class="chat-msg-time">Just now</span>
    `;
    stream.appendChild(msg);
    scrollToBottom();
  }

  function handleUserTopicSelect(topicId, label) {
    appendUserBubble(label);

    const faqMap = config.chat?.faq || {};
    const response = faqMap[topicId];

    setTimeout(() => {
      if (response) {
        appendBotCard(response);
      } else {
        appendBotCard({
          title: '💬 Talk to Instructify Kenya',
          text: 'Thank you for reaching out! How would you like to connect with our team?',
          actions: [
            { text: 'Chat on WhatsApp', action: 'whatsapp', topic: label, type: 'whatsapp' },
            { text: 'Leave a Message', action: 'form', topic: label, type: 'primary' }
          ]
        });
      }
    }, 350);
  }

  function handleUserTextMessage(query) {
    appendUserBubble(query);

    const lower = query.toLowerCase();
    const faqMap = config.chat?.faq || {};

    let matchedKey = null;
    if (lower.includes('course') || lower.includes('train') || lower.includes('learn') || lower.includes('cert')) matchedKey = 'training';
    else if (lower.includes('consult') || lower.includes('school') || lower.includes('institution') || lower.includes('b2b')) matchedKey = 'consultancy';
    else if (lower.includes('ict') || lower.includes('digital') || lower.includes('cbc') || lower.includes('computer')) matchedKey = 'ict_skills';
    else if (lower.includes('ai') || lower.includes('robot') || lower.includes('tech') || lower.includes('innovat')) matchedKey = 'ai_innovation';
    else if (lower.includes('podcast') || lower.includes('listen') || lower.includes('episode') || lower.includes('audio')) matchedKey = 'podcast';
    else if (lower.includes('blog') || lower.includes('article') || lower.includes('resource') || lower.includes('read')) matchedKey = 'blog';
    else if (lower.includes('verify') || lower.includes('authenticat')) matchedKey = 'verify';
    else if (lower.includes('contact') || lower.includes('phone') || lower.includes('whatsapp') || lower.includes('agent') || lower.includes('support') || lower.includes('help')) matchedKey = 'agent';

    setTimeout(() => {
      if (matchedKey && faqMap[matchedKey]) {
        appendBotCard(faqMap[matchedKey]);
      } else {
        appendBotCard({
          title: '💬 Thank you for your question!',
          text: `We can certainly assist you with "${escapeHtml(query)}". Connect with an advisor directly or leave your contact information below.`,
          actions: [
            { text: 'Chat on WhatsApp', action: 'whatsapp', topic: query, type: 'whatsapp' },
            { text: 'Leave a Message', action: 'form', topic: query, type: 'primary' }
          ]
        });
      }
    }, 400);
  }

  function scrollToBottom() {
    const stream = document.getElementById('chat-window-body');
    if (stream) stream.scrollTop = stream.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Public Interface for Inline Actions
  window.InstructifyChat = {
    injectMessage: function(name, topic, userMsg, botReply) {
      appendUserBubble('[Ticket: ' + (topic || 'Enquiry') + '] ' + userMsg);
      setTimeout(function() {
        appendBotCard({
          title: 'Hello ' + name + '! 👋',
          text: botReply,
          actions: [
            { text: 'Chat on WhatsApp (0143 024 416)', action: 'whatsapp', topic: topic, type: 'whatsapp' },
            { text: 'Browse Courses →', url: 'courses.html', type: 'primary' }
          ]
        });
      }, 300);
    },
    open: function() { if (!chatOpen) toggleChat(); },
    close: closeChat,
    showLeadForm: function(topic) { appendLeadForm(topic); },
    submitLead: function(topic) {
      const name = document.getElementById('lead-name')?.value.trim();
      const phone = document.getElementById('lead-phone')?.value.trim();
      const email = document.getElementById('lead-email')?.value.trim();
      const msg = document.getElementById('lead-msg')?.value.trim();

      if (!name || !phone) {
        alert('Please provide your Name and Phone/WhatsApp number.');
        return;
      }

      // Save to localStorage for persistence
      const leads = JSON.parse(localStorage.getItem('instructify_chat_leads') || '[]');
      leads.push({ name, phone, email, msg, topic, date: new Date().toISOString() });
      localStorage.setItem('instructify_chat_leads', JSON.stringify(leads));

      // Replace form with confirmation
      const formEl = document.getElementById('active-lead-form');
      if (formEl) {
        formEl.innerHTML = `
          <div style="text-align:center; padding: 12px 0;">
            <div style="font-size:28px; margin-bottom:6px;">✅</div>
            <strong style="color:#10B981; font-size:14px;">Enquiry Received!</strong>
            <p style="font-size:12.5px; color:#475569; margin-top:6px;">Thank you, ${escapeHtml(name)}. An Instructify advisor will contact you shortly.</p>
            <a href="https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent('Hello Instructify Kenya, I just submitted an enquiry regarding ' + topic + '. My name is ' + name + '.')}" 
               target="_blank" rel="noopener noreferrer" class="chat-act-btn whatsapp" style="margin-top:10px; width:100%;">
              Open WhatsApp Chat →
            </a>
          </div>
        `;
      }
      scrollToBottom();
    }
  };

  // Mount on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveChat);
  } else {
    initLiveChat();
  }
})();
