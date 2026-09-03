/**
 * INSTRUCTIFY KENYA PODCAST — CLIENT LOGIC ENGINE v1.0
 * Handles in-browser audio playback, search & category filtering, modal popups,
 * interactive transcripts, and sharing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Global Audio State ──
  const audio = new Audio();
  let currentEpisode = PODCAST_EPISODES[0] || null;
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

  // Modals References
  const guestModalOverlay = document.getElementById('guest-modal-overlay');
  const shareModalOverlay = document.getElementById('share-modal-overlay');

  // ── Format Seconds to MM:SS ──
  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
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

    // Update Main Player UI if present
    const latestTitleEl = document.getElementById('latest-ep-title');
    const latestDescEl = document.getElementById('latest-ep-desc');
    const latestGuestNameEl = document.getElementById('latest-guest-name');
    const latestGuestTitleEl = document.getElementById('latest-guest-title');
    const latestNumBadge = document.getElementById('latest-ep-num');
    const latestDateBadge = document.getElementById('latest-ep-date');
    const latestDurationBadge = document.getElementById('latest-ep-duration');

    if (latestTitleEl) latestTitleEl.textContent = ep.title;
    if (latestDescEl) latestDescEl.textContent = ep.description;
    if (latestGuestNameEl) latestGuestNameEl.textContent = ep.guest.name;
    if (latestGuestTitleEl) latestGuestTitleEl.textContent = `${ep.guest.title} · ${ep.guest.organization}`;
    if (latestNumBadge) latestNumBadge.textContent = ep.number;
    if (latestDateBadge) latestDateBadge.textContent = ep.date;
    if (latestDurationBadge) latestDurationBadge.textContent = ep.duration;

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
      console.warn("Audio autoplay blocked or placeholder source:", err);
      // Fallback visual simulation if real audio file not reachable
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
      if (epId === currentEpisode.id) {
        btn.innerHTML = playing ? pauseSvg : playSvg;
        btn.classList.toggle('playing', playing);
      } else {
        btn.innerHTML = playSvg;
        btn.classList.remove('playing');
      }
    });
  }

  // ── Audio Event Listeners ──
  audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    const total = audio.duration || currentEpisode.durationSeconds || 1;
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

  // Progress Bar Seek
  function seekAudio(e, container) {
    const rect = container.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const total = audio.duration || currentEpisode.durationSeconds || 2400;
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

  // ── Render Category Filter Pills ──
  let activeCategory = "All";

  function renderCategoryPills() {
    if (!categoryPillsContainer) return;
    categoryPillsContainer.innerHTML = PODCAST_INFO.categories.map(cat => `
      <button class="cat-pill ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">
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

  // ── Render Episode Cards ──
  function renderEpisodeCards(episodes) {
    if (!episodesGrid) return;

    if (episodes.length === 0) {
      episodesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px; background:#F8FAFC; border-radius:20px; border:1px dashed #CBD5E1;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" style="margin-bottom:12px;">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <h3 style="font-size:20px; font-weight:800; color:#0F172A; margin-bottom:8px;">No conversations found</h3>
          <p style="font-size:14.5px; color:#64748B; margin:0;">Try searching for different keywords or select "All" categories.</p>
        </div>
      `;
      if (episodesCountEl) episodesCountEl.textContent = `0 conversations`;
      return;
    }

    if (episodesCountEl) {
      episodesCountEl.textContent = `Showing ${episodes.length} conversation${episodes.length === 1 ? '' : 's'}`;
    }

    episodesGrid.innerHTML = episodes.map(ep => {
      const isCurPlaying = isPlaying && currentEpisode && currentEpisode.id === ep.id;
      return `
        <div class="ep-card" style="--ep-accent:${ep.themeColor}; --ep-glow:rgba(33, 69, 230,0.18);">
          <div>
            <div class="ep-card-header">
              <span class="ep-badge blue">${ep.category}</span>
              <span style="font-size:12px; font-weight:700; color:#64748B;">${ep.duration}</span>
            </div>
            <div style="font-size:12px; font-weight:800; color:${ep.themeColor}; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">
              ${ep.number} · ${ep.date}
            </div>
            <h3 class="ep-card-title">
              <a href="episode.html?id=${ep.id}" style="color:inherit; text-decoration:none;">${ep.title}</a>
            </h3>
            <p class="ep-card-desc">${ep.description}</p>
          </div>

          <div>
            <div class="ep-guest-row">
              <div class="guest-avatar" style="background:${ep.guest.avatarBg};">${ep.guest.initials}</div>
              <div class="guest-info">
                <h4>${ep.guest.name}</h4>
                <p>${ep.guest.title}</p>
              </div>
            </div>

            <div class="ep-card-actions">
              <button class="btn btn-primary btn-sm card-play-btn" data-ep-id="${ep.id}" style="display:inline-flex; align-items:center; gap:6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <span>Listen</span>
              </button>
              <a href="episode.html?id=${ep.id}" class="btn btn-outline btn-sm" style="font-weight:700;">
                Details →
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach play handlers on each card
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
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    const filtered = PODCAST_EPISODES.filter(ep => {
      const matchCat = activeCategory === 'All' || ep.category.toLowerCase() === activeCategory.toLowerCase() || ep.tags.some(t => t.toLowerCase() === activeCategory.toLowerCase());
      const matchQuery = !query ||
        ep.title.toLowerCase().includes(query) ||
        ep.description.toLowerCase().includes(query) ||
        ep.guest.name.toLowerCase().includes(query) ||
        ep.guest.title.toLowerCase().includes(query) ||
        ep.tags.some(t => t.toLowerCase().includes(query));

      return matchCat && matchQuery;
    });

    renderEpisodeCards(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterAndRenderEpisodes);
  }

  // ── Voices Spotlight Grid ──
  const voicesGrid = document.getElementById('voices-grid');
  if (voicesGrid && typeof PODCAST_VOICES !== 'undefined') {
    voicesGrid.innerHTML = PODCAST_VOICES.map(v => `
      <div class="voice-card">
        <div class="voice-avatar-lg" style="background:${v.avatarBg}; color:${v.accentColor};">
          ${v.initials}
        </div>
        <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:${v.accentColor}; letter-spacing:0.06em; margin-bottom:4px;">
          ${v.tag}
        </div>
        <h3 class="voice-name">${v.name}</h3>
        <p class="voice-role">${v.role}</p>
        <p class="voice-org">${v.org}</p>
        <a href="episode.html?id=${v.episodeId}" class="btn btn-outline btn-sm" style="margin-top:14px; font-size:12px; padding:4px 12px;">
          Listen to Episode →
        </a>
      </div>
    `).join('');
  }

  // ── Modal Actions: Become a Guest / Suggest a Topic ──
  window.openGuestModal = function(type = 'guest') {
    if (!guestModalOverlay) return;
    const titleEl = document.getElementById('guest-modal-title');
    const descEl = document.getElementById('guest-modal-desc');
    if (titleEl) titleEl.textContent = type === 'topic' ? 'Suggest a Podcast Topic' : 'Become a Podcast Guest';
    if (descEl) descEl.textContent = type === 'topic'
      ? 'Have an urgent theme, educational challenge, or breakthrough you would like us to discuss? Share your perspective below.'
      : 'Are you an educator, innovator, researcher, or leader with insights that can inspire others? Let us know about your work.';
    guestModalOverlay.classList.add('active');
  };

  window.closeGuestModal = function() {
    if (guestModalOverlay) guestModalOverlay.classList.remove('active');
  };

  window.openShareModal = function(title, url) {
    if (navigator.share) {
      navigator.share({
        title: title || 'The Instructify Kenya Podcast',
        text: 'Listen to this insightful conversation on The Instructify Kenya Podcast',
        url: url || window.location.href
      }).catch(() => {});
    } else {
      if (shareModalOverlay) {
        const urlInput = document.getElementById('share-url-input');
        if (urlInput) urlInput.value = url || window.location.href;
        shareModalOverlay.classList.add('active');
      }
    }
  };

  window.closeShareModal = function() {
    if (shareModalOverlay) shareModalOverlay.classList.remove('active');
  };

  window.copyShareUrl = function() {
    const urlInput = document.getElementById('share-url-input');
    if (urlInput) {
      urlInput.select();
      navigator.clipboard.writeText(urlInput.value).then(() => {
        const copyBtn = document.getElementById('copy-share-btn');
        if (copyBtn) copyBtn.textContent = 'Copied!';
        setTimeout(() => { if (copyBtn) copyBtn.textContent = 'Copy Link'; }, 2000);
      });
    }
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

  // Handle Form Submissions
  const guestForm = document.getElementById('guest-form');
  if (guestForm) {
    guestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = guestForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Sending...';
      setTimeout(() => {
        alert('Thank you for your submission! Our editorial and production team will review your proposal and get in touch.');
        closeGuestModal();
        guestForm.reset();
        if (submitBtn) submitBtn.textContent = 'Submit Proposal';
      }, 750);
    });
  }

  const podcastSubscribeForm = document.getElementById('podcast-subscribe-form');
  if (podcastSubscribeForm) {
    podcastSubscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = podcastSubscribeForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        alert(`Thank you for subscribing! You'll receive every new episode and show notes directly at ${emailInput.value}.`);
        emailInput.value = '';
      }
    });
  }

  // ── Initialize Page ──
  renderCategoryPills();
  renderEpisodeCards(PODCAST_EPISODES);
  if (PODCAST_EPISODES.length > 0) {
    loadEpisode(PODCAST_EPISODES[0], false);
  }

  // ── Check if on Episode Detail Page ──
  const isEpisodeDetailPage = document.getElementById('episode-detail-root');
  if (isEpisodeDetailPage) {
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
    const epDetailGuestName = document.getElementById('ep-detail-guest-name');
    const epDetailGuestTitle = document.getElementById('ep-detail-guest-title');
    const epDetailGuestBio = document.getElementById('ep-detail-guest-bio');
    const epDetailGuestInitials = document.getElementById('ep-detail-guest-initials');
    const epDetailTakeawaysList = document.getElementById('ep-detail-takeaways-list');
    const epDetailTranscriptList = document.getElementById('ep-detail-transcript-list');
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
    if (epDetailGuestName) epDetailGuestName.textContent = activeEp.guest.name;
    if (epDetailGuestTitle) epDetailGuestTitle.textContent = `${activeEp.guest.title} · ${activeEp.guest.organization}`;
    if (epDetailGuestBio) epDetailGuestBio.textContent = activeEp.guest.bio;
    if (epDetailGuestInitials) {
      epDetailGuestInitials.textContent = activeEp.guest.initials;
      epDetailGuestInitials.style.background = activeEp.guest.avatarBg;
    }

    // Takeaways
    if (epDetailTakeawaysList && activeEp.takeaways) {
      epDetailTakeawaysList.innerHTML = activeEp.takeaways.map((t, idx) => `
        <li>
          <span class="takeaway-dot">${idx + 1}</span>
          <div>${t}</div>
        </li>
      `).join('');
    }

    // Transcripts
    if (epDetailTranscriptList && activeEp.transcript) {
      epDetailTranscriptList.innerHTML = activeEp.transcript.map(tr => `
        <div class="transcript-entry">
          <button class="transcript-time-btn" data-time="${tr.timestampSeconds}">
            ▶ ${tr.time}
          </button>
          <div>
            <div class="transcript-speaker">${tr.speaker}</div>
            <p class="transcript-text">${tr.text}</p>
          </div>
        </div>
      `).join('');

      epDetailTranscriptList.querySelectorAll('.transcript-time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetTime = parseFloat(btn.getAttribute('data-time'));
          audio.currentTime = targetTime;
          playAudio();
        });
      });
    }

    // Related Course CTA
    if (activeEp.relatedCourse) {
      if (epDetailCourseTitle) epDetailCourseTitle.textContent = activeEp.relatedCourse.title;
      if (epDetailCourseCategory) epDetailCourseCategory.textContent = activeEp.relatedCourse.category;
      if (epDetailCourseLink) epDetailCourseLink.href = activeEp.relatedCourse.link;
    }

    // Related Episodes
    const relatedGrid = document.getElementById('related-episodes-grid');
    if (relatedGrid) {
      const related = PODCAST_EPISODES.filter(x => x.id !== activeEp.id).slice(0, 3);
      relatedGrid.innerHTML = related.map(ep => `
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
          <div style="margin-top:20px;">
            <a href="episode.html?id=${ep.id}" class="btn btn-outline btn-sm" style="width:100%; text-align:center;">
              Listen to Episode →
            </a>
          </div>
        </div>
      `).join('');
    }
  }
});
