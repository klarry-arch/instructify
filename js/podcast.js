/**
 * INSTRUCTIFY KENYA PODCAST & INSIGHTS — CLIENT LOGIC ENGINE v2.0
 * Theme: CONVERSATIONS FOR A SMARTER FUTURE
 * Mantra: Learn · Connect · Innovate · Transform
 * 
 * Features:
 * - HTML5 Audio Engine with responsive progress bar, time sync, and speed toggle (1x-2x)
 * - Video Playback Modal with 16:9 responsive frame
 * - Live Category Filtering across 8 categories & keyword search
 * - 10-Episode Grid Renderer with Listen, Watch Video, and Details actions
 * - "Meet Our Guests" Directory Renderer
 * - "From Conversation to Classroom" Action Framework (Try It, Adapt It, Transform It)
 * - Expandable / Collapsible Interactive Transcripts with timestamp seeking
 * - "What Should We Talk About Next?" Topic Suggestion engine with confirmation state
 * - Social Sharing for WhatsApp, Facebook, LinkedIn, X, and Copy Link
 * - Sticky Bottom Audio Player with smooth scrolling activation
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Global Audio State ──
  const audio = new Audio();
  let currentEpisode = (typeof PODCAST_EPISODES !== 'undefined' && PODCAST_EPISODES.length > 0) ? PODCAST_EPISODES[0] : null;
  let isPlaying = false;
  let currentSpeed = 1;

  // ── DOM References ──
  const mainPlayBtn = document.getElementById('main-play-btn');
  const mainPlayIcon = document.getElementById('main-play-icon');
  const progressFill = document.getElementById('progress-bar-fill');
  const progressContainer = document.getElementById('progress-container');
  const currentTimeEl = document.getElementById('current-time');
  const totalTimeEl = document.getElementById('total-time');
  const speedBtn = document.getElementById('speed-btn');

  // Sticky Bar References
  const stickyBar = document.getElementById('sticky-audio-bar');
  const stickyPlayBtn = document.getElementById('sticky-play-btn');
  const stickyPlayIcon = document.getElementById('sticky-play-icon');
  const stickyTitle = document.getElementById('sticky-title');
  const stickyGuest = document.getElementById('sticky-guest');
  const stickyProgressFill = document.getElementById('sticky-progress-fill');
  const stickyProgressContainer = document.getElementById('sticky-progress-container');

  // Search & Filter References
  const searchInput = document.getElementById('podcast-search');
  const categoryPillsContainer = document.getElementById('category-pills');
  const episodesGrid = document.getElementById('episodes-grid');
  const episodesCountEl = document.getElementById('episodes-count');

  // Guests Directory Reference
  const guestsDirectoryGrid = document.getElementById('guests-directory-grid');

  // Modals References
  const guestModalOverlay = document.getElementById('guest-modal-overlay');
  const shareModalOverlay = document.getElementById('share-modal-overlay');
  const videoModalOverlay = document.getElementById('video-modal-overlay');
  const videoModalIframe = document.getElementById('video-modal-iframe');
  const videoModalTitle = document.getElementById('video-modal-title');

  // ── Helper: Format Seconds to MM:SS ──
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // ── Load Episode into Audio Engine ──
  function loadEpisode(ep, autoPlay = false) {
    if (!ep) return;
    currentEpisode = ep;
    audio.src = ep.audioUrl;
    audio.playbackRate = currentSpeed;

    // Update Main Featured Player UI if present
    const latestTitleEl = document.getElementById('latest-ep-title');
    const latestDescEl = document.getElementById('latest-ep-desc');
    const latestGuestNameEl = document.getElementById('latest-guest-name');
    const latestGuestTitleEl = document.getElementById('latest-guest-title');
    const latestNumBadge = document.getElementById('latest-ep-num');
    const latestDateBadge = document.getElementById('latest-ep-date');
    const latestDurationBadge = document.getElementById('latest-ep-duration');
    const latestCatBadge = document.getElementById('latest-ep-cat');
    const latestWatchBtn = document.getElementById('latest-watch-video-btn');

    if (latestTitleEl) latestTitleEl.textContent = ep.title;
    if (latestDescEl) latestDescEl.textContent = ep.description;
    if (latestGuestNameEl) latestGuestNameEl.textContent = ep.guest.name;
    if (latestGuestTitleEl) latestGuestTitleEl.textContent = `${ep.guest.title} · ${ep.guest.organization}`;
    if (latestNumBadge) latestNumBadge.textContent = ep.number;
    if (latestDateBadge) latestDateBadge.textContent = ep.date;
    if (latestDurationBadge) latestDurationBadge.textContent = ep.duration;
    if (latestCatBadge) latestCatBadge.textContent = ep.category;
    if (latestWatchBtn) {
      latestWatchBtn.onclick = () => openVideoModal(ep.id);
    }

    // Update Sticky Bar
    if (stickyTitle) stickyTitle.textContent = ep.title;
    if (stickyGuest) stickyGuest.textContent = `${ep.guest.name} (${ep.number})`;

    if (autoPlay) {
      playAudio();
    }
  }

  function playAudio() {
    audio.play().then(() => {
      isPlaying = true;
      updatePlayIcons(true);
      if (stickyBar) stickyBar.classList.add('active');
    }).catch(err => {
      console.warn("Audio autoplay blocked or placeholder audio source:", err);
      isPlaying = true;
      updatePlayIcons(true);
      if (stickyBar) stickyBar.classList.add('active');
    });
  }

  function pauseAudio() {
    audio.pause();
    isPlaying = false;
    updatePlayIcons(false);
  }

  function togglePlay() {
    if (isPlaying) {
      pauseAudio();
    } else {
      if (!audio.src && currentEpisode) {
        loadEpisode(currentEpisode, true);
      } else {
        playAudio();
      }
    }
  }

  function updatePlayIcons(playing) {
    const playSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    const pauseSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

    if (mainPlayIcon) mainPlayIcon.innerHTML = playing ? pauseSvg : playSvg;
    if (stickyPlayIcon) stickyPlayIcon.innerHTML = playing ? pauseSvg : playSvg;

    // Update any card play buttons
    document.querySelectorAll('.card-play-btn').forEach(btn => {
      const epId = btn.getAttribute('data-ep-id');
      if (currentEpisode && epId === currentEpisode.id) {
        btn.innerHTML = playing ? pauseSvg : playSvg;
        btn.classList.toggle('playing', playing);
      } else {
        btn.innerHTML = playSvg;
        btn.classList.remove('playing');
      }
    });
  }

  // ── Audio Engine Event Listeners ──
  audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    const total = audio.duration || (currentEpisode ? currentEpisode.durationSeconds : 2400) || 1;
    const progressPercent = (current / total) * 100;

    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (stickyProgressFill) stickyProgressFill.style.width = `${progressPercent}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
    if (totalTimeEl) totalTimeEl.textContent = formatTime(total);
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayIcons(false);
  });

  // Progress Bar Scrubbing
  function seekAudio(e, container) {
    const rect = container.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const total = audio.duration || (currentEpisode ? currentEpisode.durationSeconds : 2400);
    audio.currentTime = pos * total;
  }

  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => seekAudio(e, progressContainer));
  }
  if (stickyProgressContainer) {
    stickyProgressContainer.addEventListener('click', (e) => seekAudio(e, stickyProgressContainer));
  }

  if (mainPlayBtn) mainPlayBtn.addEventListener('click', togglePlay);
  if (stickyPlayBtn) stickyPlayBtn.addEventListener('click', togglePlay);

  // Playback Speed Toggle
  if (speedBtn) {
    const speeds = [1, 1.25, 1.5, 2];
    speedBtn.addEventListener('click', () => {
      let nextIdx = (speeds.indexOf(currentSpeed) + 1) % speeds.length;
      currentSpeed = speeds[nextIdx];
      audio.playbackRate = currentSpeed;
      speedBtn.textContent = `${currentSpeed}x`;
    });
  }

  // ── Video Modal Logic ──
  window.openVideoModal = function(epId) {
    const ep = (typeof PODCAST_EPISODES !== 'undefined')
      ? PODCAST_EPISODES.find(x => x.id === epId) || currentEpisode
      : currentEpisode;

    if (!ep || !videoModalOverlay) return;

    if (videoModalTitle) {
      videoModalTitle.textContent = `${ep.number}: ${ep.title}`;
    }

    if (videoModalIframe) {
      // Pause audio if video is opened to avoid conflicting sound
      if (isPlaying) pauseAudio();
      videoModalIframe.src = ep.videoEmbedUrl || "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1";
    }

    videoModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeVideoModal = function() {
    if (!videoModalOverlay) return;
    videoModalOverlay.classList.remove('active');
    if (videoModalIframe) {
      videoModalIframe.src = "";
    }
    document.body.style.overflow = '';
  };

  if (videoModalOverlay) {
    videoModalOverlay.addEventListener('click', (e) => {
      if (e.target === videoModalOverlay) closeVideoModal();
    });
  }

  // ── Category Filter Pills Bar ──
  let activeCategory = "All";

  function renderCategoryPills() {
    if (!categoryPillsContainer || typeof PODCAST_INFO === 'undefined') return;

    categoryPillsContainer.innerHTML = PODCAST_INFO.categories.map(cat => `
      <button class="cat-pill ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}" aria-label="Filter by ${cat}">
        ${cat}
      </button>
    `).join('');

    categoryPillsContainer.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        categoryPillsContainer.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterAndRenderEpisodes();
      });
    });
  }

  // ── Render 10 Episode Cards in Library ──
  function renderEpisodeCards(episodes) {
    if (!episodesGrid) return;

    if (episodes.length === 0) {
      episodesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px; background:#F8FAFC; border-radius:24px; border:1.5px dashed #CBD5E1;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" style="margin-bottom:12px;">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <h3 style="font-size:20px; font-weight:800; color:#0F172A; margin-bottom:8px;">No conversations found</h3>
          <p style="font-size:14.5px; color:#64748B; margin:0;">Try adjusting your search terms or select "All" categories to view the full library.</p>
        </div>
      `;
      if (episodesCountEl) episodesCountEl.textContent = `0 conversations`;
      return;
    }

    if (episodesCountEl) {
      episodesCountEl.textContent = `Showing ${episodes.length} of ${PODCAST_EPISODES.length} conversations`;
    }

    episodesGrid.innerHTML = episodes.map(ep => {
      return `
        <article class="ep-card" style="--ep-accent:${ep.themeColor}; --ep-glow:rgba(33, 69, 230,0.18);">
          <div>
            <!-- Episode Thumbnail Banner -->
            <div style="width:100%; aspect-ratio: 16/9; border-radius:14px; background:${ep.coverGradient}; padding:18px; margin-bottom:18px; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden; box-shadow:0 8px 18px -4px rgba(15, 23, 42, 0.18);">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="ep-badge blue" style="background:rgba(255,255,255,0.92); color:#183AD6; font-size:11px; padding:3px 10px;">
                  ${ep.category}
                </span>
                <span style="font-size:12px; font-weight:700; color:#FFFFFF; background:rgba(0,0,0,0.4); padding:2px 8px; border-radius:6px; backdrop-filter:blur(4px);">
                  ${ep.duration}
                </span>
              </div>
              <div>
                <div style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#93C5FD; margin-bottom:2px;">
                  ${ep.number}
                </div>
                <div style="font-size:14px; font-weight:800; color:#FFFFFF; line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                  ${ep.title}
                </div>
              </div>
            </div>

            <div style="font-size:12px; font-weight:700; color:#64748B; margin-bottom:6px;">
              ${ep.number} · ${ep.date}
            </div>

            <h3 class="ep-card-title">
              <a href="episode.html?id=${ep.id}" style="color:inherit; text-decoration:none;">${ep.title}</a>
            </h3>

            <p class="ep-card-desc">${ep.description}</p>
          </div>

          <div>
            <!-- Guest Row -->
            <div class="ep-guest-row">
              <div class="guest-avatar" style="background:${ep.guest.avatarBg}; color:${ep.guest.accentColor || '#2145E6'};">
                ${ep.guest.initials}
              </div>
              <div class="guest-info">
                <h4>${ep.guest.name}</h4>
                <p>${ep.guest.title}</p>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="ep-card-actions">
              <div style="display:flex; gap:8px;">
                <button class="btn btn-primary btn-sm card-play-btn" data-ep-id="${ep.id}" aria-label="Listen to ${ep.title}" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  <span>Listen</span>
                </button>
                <button class="btn btn-outline btn-sm" onclick="openVideoModal('${ep.id}')" aria-label="Watch video for ${ep.title}" style="font-weight:700; display:inline-flex; align-items:center; gap:5px; border-color:#CBD5E1; color:#334155;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  <span>Watch</span>
                </button>
              </div>

              <a href="episode.html?id=${ep.id}" class="btn btn-outline btn-sm" style="font-weight:700; border-color:#CBD5E1; color:#183AD6;" aria-label="View full episode details for ${ep.title}">
                Details →
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach Play Handler on each episode card
    episodesGrid.querySelectorAll('.card-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const epId = btn.getAttribute('data-ep-id');
        const selectedEp = PODCAST_EPISODES.find(x => x.id === epId);
        if (selectedEp) {
          if (currentEpisode && currentEpisode.id === selectedEp.id) {
            togglePlay();
          } else {
            loadEpisode(selectedEp, true);
          }
        }
      });
    });
  }

  // ── Filter and Search Logic ──
  function filterAndRenderEpisodes() {
    if (typeof PODCAST_EPISODES === 'undefined') return;

    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    const filtered = PODCAST_EPISODES.filter(ep => {
      const matchCat = activeCategory === 'All' ||
        ep.category.toLowerCase() === activeCategory.toLowerCase() ||
        ep.tags.some(t => t.toLowerCase() === activeCategory.toLowerCase());

      const matchQuery = !query ||
        ep.title.toLowerCase().includes(query) ||
        ep.description.toLowerCase().includes(query) ||
        ep.guest.name.toLowerCase().includes(query) ||
        ep.guest.title.toLowerCase().includes(query) ||
        ep.guest.organization.toLowerCase().includes(query) ||
        ep.tags.some(t => t.toLowerCase() === query);

      return matchCat && matchQuery;
    });

    renderEpisodeCards(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterAndRenderEpisodes);
  }

  // ── Render "Meet Our Guests" Directory ──
  function renderGuestsDirectory() {
    if (!guestsDirectoryGrid || typeof PODCAST_GUESTS === 'undefined') return;

    guestsDirectoryGrid.innerHTML = PODCAST_GUESTS.map(guest => `
      <div class="guest-card">
        <div class="guest-card-avatar" style="background:${guest.avatarBg}; color:${guest.accentColor};">
          ${guest.initials}
        </div>

        <h3 class="guest-card-name">${guest.name}</h3>
        <div class="guest-card-title">${guest.title}</div>
        <div class="guest-card-org">${guest.organization}</div>

        <p class="guest-card-bio">${guest.bio}</p>

        <div class="guest-expertise-list">
          ${guest.expertise.map(exp => `<span class="guest-expertise-pill">${exp}</span>`).join('')}
        </div>

        <div style="margin-bottom:14px; width:100%;">
          <a href="episode.html?id=${guest.featuredEpisodeId}" class="btn btn-outline btn-sm" style="width:100%; font-size:12px; padding:6px 12px; font-weight:700; border-color:#CBD5E1;">
            🎙️ ${guest.featuredEpisodes[0] || 'Listen to Episode'} →
          </a>
        </div>

        <div class="guest-social-links">
          <a href="${guest.linkedin}" target="_blank" rel="noopener noreferrer" class="guest-social-btn" aria-label="${guest.name} on LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28M7.86 18.5V10.13H5.07V18.5h2.79z"/></svg>
          </a>
          <a href="${guest.twitter}" target="_blank" rel="noopener noreferrer" class="guest-social-btn" aria-label="${guest.name} on X">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>
      </div>
    `).join('');
  }

  // ── "What Should We Talk About Next?" Form Handler ──
  const topicForm = document.getElementById('topic-suggestion-form');
  const topicSuccessBanner = document.getElementById('topic-success-banner');

  if (topicForm) {
    topicForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = topicForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'Submit Topic';

      if (submitBtn) {
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (topicSuccessBanner) {
          topicSuccessBanner.classList.add('active');
          topicSuccessBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        topicForm.reset();
        if (submitBtn) {
          submitBtn.textContent = 'Submitted!';
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }, 3000);
        }
      }, 600);
    });
  }

  // ── Modals: Pitch a Guest / Suggest a Topic Modal ──
  window.openGuestModal = function(type = 'guest') {
    if (!guestModalOverlay) return;
    const titleEl = document.getElementById('guest-modal-title');
    const descEl = document.getElementById('guest-modal-desc');
    if (titleEl) titleEl.textContent = type === 'topic' ? 'Suggest a Podcast Topic' : 'Pitch a Guest for the Podcast';
    if (descEl) descEl.textContent = type === 'topic'
      ? 'Have an urgent theme, educational challenge, or breakthrough you would like us to discuss? Share your thoughts.'
      : 'Are you an educator, innovator, researcher, or leader with insights that can inspire others? Let us know about your story.';
    guestModalOverlay.classList.add('active');
  };

  window.closeGuestModal = function() {
    if (guestModalOverlay) guestModalOverlay.classList.remove('active');
  };

  // ── Social Sharing Options (WhatsApp, FB, LinkedIn, X, Copy Link) ──
  window.openShareModal = function(customTitle, customUrl) {
    const title = customTitle || (currentEpisode ? currentEpisode.title : 'The Instructify Kenya Podcast');
    const url = customUrl || window.location.href;

    if (shareModalOverlay) {
      const urlInput = document.getElementById('share-url-input');
      if (urlInput) urlInput.value = url;

      // Update direct social share links in modal
      const waBtn = document.getElementById('share-btn-wa');
      const fbBtn = document.getElementById('share-btn-fb');
      const liBtn = document.getElementById('share-btn-li');
      const twBtn = document.getElementById('share-btn-tw');

      const encodedUrl = encodeURIComponent(url);
      const encodedText = encodeURIComponent(`Check out "${title}" on The Instructify Kenya Podcast: `);

      if (waBtn) waBtn.href = `https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}`;
      if (fbBtn) fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      if (liBtn) liBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      if (twBtn) twBtn.href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

      shareModalOverlay.classList.add('active');
    }
  };

  window.closeShareModal = function() {
    if (shareModalOverlay) shareModalOverlay.classList.remove('active');
  };

  window.copyShareUrl = function() {
    const urlInput = document.getElementById('share-url-input');
    const url = urlInput ? urlInput.value : window.location.href;

    navigator.clipboard.writeText(url).then(() => {
      const copyBtn = document.getElementById('copy-share-btn');
      if (copyBtn) {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('btn-success');
        setTimeout(() => {
          copyBtn.textContent = 'Copy Link';
          copyBtn.classList.remove('btn-success');
        }, 2000);
      }
    }).catch(() => {
      if (urlInput) {
        urlInput.select();
        document.execCommand('copy');
      }
    });
  };

  // Close modals on background click
  if (guestModalOverlay) {
    guestModalOverlay.addEventListener('click', (e) => {
      if (e.target === guestModalOverlay) closeGuestModal();
    });
  }
  if (shareModalOverlay) {
    shareModalOverlay.addEventListener('click', (e) => {
      if (e.target === shareModalOverlay) closeShareModal();
    });
  }

  // Keyboard Escape to close any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
      closeGuestModal();
      closeShareModal();
    }
  });

  // ── Newsletter / Podcast Subscription Form ──
  const podcastSubscribeForm = document.getElementById('podcast-subscribe-form');
  if (podcastSubscribeForm) {
    podcastSubscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = podcastSubscribeForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        alert(`Thank you for subscribing to Conversations for a Smarter Future! We will send you new episodes and show notes directly to ${emailInput.value}.`);
        emailInput.value = '';
      }
    });
  }

  // ── Initialize Hub View ──
  renderCategoryPills();
  if (typeof PODCAST_EPISODES !== 'undefined') {
    renderEpisodeCards(PODCAST_EPISODES);
    if (PODCAST_EPISODES.length > 0) {
      loadEpisode(PODCAST_EPISODES[0], false);
    }
  }
  renderGuestsDirectory();

  // ── Episode Detail Page Specific View ──
  const isEpisodeDetailPage = document.getElementById('episode-detail-root');
  if (isEpisodeDetailPage && typeof PODCAST_EPISODES !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const epId = urlParams.get('id') || 'ep-01';
    const activeEp = PODCAST_EPISODES.find(x => x.id === epId) || PODCAST_EPISODES[0];

    loadEpisode(activeEp, false);

    // Populate Episode Details
    const epDetailNum = document.getElementById('ep-detail-num');
    const epDetailTitle = document.getElementById('ep-detail-title');
    const epDetailSubtitle = document.getElementById('ep-detail-subtitle');
    const epDetailDate = document.getElementById('ep-detail-date');
    const epDetailDuration = document.getElementById('ep-detail-duration');
    const epDetailCategory = document.getElementById('ep-detail-category');
    const epDetailDesc = document.getElementById('ep-detail-desc');
    const epDetailWatchBtn = document.getElementById('ep-detail-watch-video-btn');

    // Guest Info on Detail Page
    const epDetailGuestName = document.getElementById('ep-detail-guest-name');
    const epDetailGuestTitle = document.getElementById('ep-detail-guest-title');
    const epDetailGuestBio = document.getElementById('ep-detail-guest-bio');
    const epDetailGuestInitials = document.getElementById('ep-detail-guest-initials');
    const epDetailGuestExpertise = document.getElementById('ep-detail-guest-expertise');

    // Action Framework & Takeaways
    const epDetailTakeawaysList = document.getElementById('ep-detail-takeaways-list');
    const epDetailTryIt = document.getElementById('ep-detail-try-it');
    const epDetailAdaptIt = document.getElementById('ep-detail-adapt-it');
    const epDetailTransformIt = document.getElementById('ep-detail-transform-it');

    // Transcript
    const epDetailTranscriptList = document.getElementById('ep-detail-transcript-list');
    const transcriptToggleBtn = document.getElementById('transcript-toggle-btn');
    const transcriptBody = document.getElementById('transcript-body');

    // Related Course
    const epDetailCourseTitle = document.getElementById('ep-detail-course-title');
    const epDetailCourseCategory = document.getElementById('ep-detail-course-category');
    const epDetailCourseLink = document.getElementById('ep-detail-course-link');

    if (epDetailNum) epDetailNum.textContent = activeEp.number;
    if (epDetailTitle) epDetailTitle.textContent = activeEp.title;
    if (epDetailSubtitle) epDetailSubtitle.textContent = activeEp.subtitle;
    if (epDetailDate) epDetailDate.textContent = activeEp.date;
    if (epDetailDuration) epDetailDuration.textContent = activeEp.duration;
    if (epDetailCategory) epDetailCategory.textContent = activeEp.category;
    if (epDetailDesc) epDetailDesc.textContent = activeEp.description;
    if (epDetailWatchBtn) {
      epDetailWatchBtn.onclick = () => openVideoModal(activeEp.id);
    }

    if (epDetailGuestName) epDetailGuestName.textContent = activeEp.guest.name;
    if (epDetailGuestTitle) epDetailGuestTitle.textContent = `${activeEp.guest.title} · ${activeEp.guest.organization}`;
    if (epDetailGuestBio) epDetailGuestBio.textContent = activeEp.guest.bio;
    if (epDetailGuestInitials) {
      epDetailGuestInitials.textContent = activeEp.guest.initials;
      epDetailGuestInitials.style.background = activeEp.guest.avatarBg;
    }
    if (epDetailGuestExpertise && activeEp.guest.expertise) {
      epDetailGuestExpertise.innerHTML = activeEp.guest.expertise.map(exp => `
        <span class="guest-expertise-pill">${exp}</span>
      `).join('');
    }

    // Key Takeaways List
    if (epDetailTakeawaysList && activeEp.takeaways) {
      epDetailTakeawaysList.innerHTML = activeEp.takeaways.map((item, idx) => `
        <li>
          <div class="takeaway-dot">${idx + 1}</div>
          <div>${item}</div>
        </li>
      `).join('');
    }

    // From Conversation to Classroom (Try It / Adapt It / Transform It)
    if (activeEp.classroomActions) {
      if (epDetailTryIt) epDetailTryIt.textContent = activeEp.classroomActions.tryIt;
      if (epDetailAdaptIt) epDetailAdaptIt.textContent = activeEp.classroomActions.adaptIt;
      if (epDetailTransformIt) epDetailTransformIt.textContent = activeEp.classroomActions.transformIt;
    }

    // Expandable Transcript
    if (epDetailTranscriptList && activeEp.transcript) {
      epDetailTranscriptList.innerHTML = activeEp.transcript.map(line => `
        <div class="transcript-entry">
          <button class="transcript-time-btn" data-time="${line.timestampSeconds}" title="Jump to ${line.time}">
            ▶ ${line.time}
          </button>
          <div>
            <div class="transcript-speaker">${line.speaker}</div>
            <p class="transcript-text">${line.text}</p>
          </div>
        </div>
      `).join('');

      // Attach timestamp seeking
      epDetailTranscriptList.querySelectorAll('.transcript-time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const timeSec = parseFloat(btn.getAttribute('data-time'));
          if (!isNaN(timeSec)) {
            audio.currentTime = timeSec;
            playAudio();
          }
        });
      });
    }

    // Expand / Collapse Transcript Toggle
    if (transcriptToggleBtn && transcriptBody) {
      transcriptToggleBtn.addEventListener('click', () => {
        const isOpen = transcriptBody.classList.contains('open');
        if (isOpen) {
          transcriptBody.classList.remove('open');
          transcriptToggleBtn.classList.remove('open');
          transcriptToggleBtn.setAttribute('aria-expanded', 'false');
          const span = transcriptToggleBtn.querySelector('.toggle-label');
          if (span) span.textContent = 'Read Full Episode Transcript (Expand)';
        } else {
          transcriptBody.classList.add('open');
          transcriptToggleBtn.classList.add('open');
          transcriptToggleBtn.setAttribute('aria-expanded', 'true');
          const span = transcriptToggleBtn.querySelector('.toggle-label');
          if (span) span.textContent = 'Hide Episode Transcript (Collapse)';
        }
      });
    }

    // Related Course
    if (activeEp.relatedCourse) {
      if (epDetailCourseTitle) epDetailCourseTitle.textContent = activeEp.relatedCourse.title;
      if (epDetailCourseCategory) epDetailCourseCategory.textContent = activeEp.relatedCourse.category;
      if (epDetailCourseLink) epDetailCourseLink.href = activeEp.relatedCourse.link;
    }

    // Setup Inline Social Sharing Toolbar on Detail Page
    const sharePillWa = document.getElementById('detail-share-wa');
    const sharePillFb = document.getElementById('detail-share-fb');
    const sharePillLi = document.getElementById('detail-share-li');
    const sharePillTw = document.getElementById('detail-share-tw');
    const sharePillCopy = document.getElementById('detail-share-copy');

    const shareUrl = window.location.href;
    const shareTitle = activeEp.title;
    const encodedU = encodeURIComponent(shareUrl);
    const encodedT = encodeURIComponent(`Listening to "${shareTitle}" on The Instructify Kenya Podcast: `);

    if (sharePillWa) sharePillWa.href = `https://api.whatsapp.com/send?text=${encodedT}${encodedU}`;
    if (sharePillFb) sharePillFb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedU}`;
    if (sharePillLi) sharePillLi.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedU}`;
    if (sharePillTw) sharePillTw.href = `https://twitter.com/intent/tweet?text=${encodedT}&url=${encodedU}`;
    if (sharePillCopy) {
      sharePillCopy.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(shareUrl).then(() => {
          sharePillCopy.textContent = '✓ Copied Link!';
          setTimeout(() => {
            sharePillCopy.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Link`;
          }, 2000);
        });
      });
    }

    // Render 3 Related Episodes
    const relatedGrid = document.getElementById('related-episodes-grid');
    if (relatedGrid) {
      const otherEps = PODCAST_EPISODES.filter(x => x.id !== activeEp.id).slice(0, 3);
      relatedGrid.innerHTML = otherEps.map(ep => `
        <div class="ep-card" style="--ep-accent:${ep.themeColor};">
          <div>
            <div class="ep-card-header">
              <span class="ep-badge blue">${ep.category}</span>
              <span style="font-size:12px; font-weight:700; color:#64748B;">${ep.duration}</span>
            </div>
            <h3 class="ep-card-title">
              <a href="episode.html?id=${ep.id}" style="color:inherit; text-decoration:none;">${ep.title}</a>
            </h3>
            <p class="ep-card-desc">${ep.description}</p>
          </div>
          <div>
            <a href="episode.html?id=${ep.id}" class="btn btn-outline btn-sm" style="width:100%; text-align:center; font-weight:700;">
              Listen &amp; Notes →
            </a>
          </div>
        </div>
      `).join('');
    }
  }
});
