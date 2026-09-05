/**
 * INSTRUCTIFY KENYA — EDUCATIONAL RESOURCES INTERACTIVITY ENGINE
 * Handles real-time search, multi-facet filtering, quick preview modals,
 * media player simulations, bookmarking (localStorage), and smooth interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Ensure RESOURCES_DATA is available
  if (typeof window.RESOURCES_DATA === 'undefined') {
    console.error('[Resources Hub]: RESOURCES_DATA is not loaded.');
    return;
  }

  const {
    statistics,
    categories,
    featured,
    library,
    toolkits,
    media,
    articles
  } = window.RESOURCES_DATA;

  // ── State Management ────────────────────────────────────────
  let currentSearchQuery = '';
  let activeCategory = 'all';
  let activeAudience = 'all';
  let activeLevel = 'all';
  let activeFormat = 'all';
  let activeAccess = 'all'; // 'all', 'Free', 'Premium'
  let activeSort = 'relevant';
  let activeViewMode = 'grid'; // 'grid' or 'list'
  let visibleLibraryCount = 9;
  const pageSize = 6;

  // Saved/Bookmarked resources stored in localStorage
  let savedResourceIds = new Set();
  try {
    const rawSaved = localStorage.getItem('instructify_saved_resources');
    if (rawSaved) savedResourceIds = new Set(JSON.parse(rawSaved));
  } catch (e) {
    console.warn('Could not read saved resources from localStorage:', e);
  }

  function persistSavedResources() {
    try {
      localStorage.setItem('instructify_saved_resources', JSON.stringify([...savedResourceIds]));
    } catch (e) {
      console.warn('Could not save resources to localStorage:', e);
    }
  }

  // ── 1. Statistics Counter Animation ─────────────────────────
  const statsContainer = document.getElementById('resources-stats-grid');
  if (statsContainer) {
    statsContainer.innerHTML = statistics.map((stat, idx) => {
      const colors = ['blue', 'teal', 'purple', 'amber', 'green'];
      const color = colors[idx % colors.length];
      return `
        <div class="res-stat-card">
          <div class="res-stat-icon-box ${color}">
            ${getSvgIcon(stat.icon)}
          </div>
          <div>
            <div class="res-stat-number" data-target="${stat.count}" data-suffix="${stat.suffix}">0${stat.suffix}</div>
            <div class="res-stat-label">${stat.label}</div>
          </div>
        </div>
      `;
    }).join('');

    // Animate numbers on scroll
    let animatedStats = false;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animatedStats) {
        animatedStats = true;
        animateAllCounters();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(statsContainer);
  }

  function animateAllCounters() {
    document.querySelectorAll('.res-stat-number').forEach(el => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1600;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * ease);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target.toLocaleString() + suffix;
        }
      }
      requestAnimationFrame(update);
    });
  }

  // ── 2. Render Quick Categories ──────────────────────────────
  const categoriesGrid = document.getElementById('res-categories-grid');
  if (categoriesGrid) {
    categoriesGrid.innerHTML = categories.map(cat => `
      <div class="res-cat-card" data-cat-id="${cat.id}" tabindex="0" role="button" aria-label="Browse ${cat.name}">
        <div class="res-cat-card-header">
          <div class="res-cat-icon ${cat.color}">
            ${getSvgIcon(cat.icon)}
          </div>
          <span class="res-cat-badge">${cat.count} Resources</span>
        </div>
        <h3 class="res-cat-title">${cat.name}</h3>
        <p class="res-cat-desc">${cat.description}</p>
        <div class="res-cat-footer">
          Explore Category <span>→</span>
        </div>
      </div>
    `).join('');

    categoriesGrid.querySelectorAll('.res-cat-card').forEach(card => {
      const triggerFilter = () => {
        const catId = card.getAttribute('data-cat-id');
        activeCategory = catId;
        const catSelect = document.getElementById('lib-filter-category');
        if (catSelect) catSelect.value = catId;
        filterAndRenderLibrary();
        
        // Smooth scroll down to the library section
        const librarySection = document.getElementById('resource-library');
        if (librarySection) {
          librarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      card.addEventListener('click', triggerFilter);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerFilter();
        }
      });
    });
  }

  // ── 3. Render Featured Resources ────────────────────────────
  const featuredGrid = document.getElementById('res-featured-grid');
  if (featuredGrid) {
    featuredGrid.innerHTML = featured.map(res => renderResourceCard(res, true)).join('');
    attachCardEventListeners(featuredGrid);
  }

  // ── 4. Comprehensive Resource Library ───────────────────────
  const libraryGrid = document.getElementById('res-library-grid');
  const resultsCountEl = document.getElementById('res-results-count');
  const activeChipsRow = document.getElementById('res-active-chips-row');
  const loadMoreBtn = document.getElementById('res-load-more-btn');
  const loadMoreContainer = document.getElementById('res-load-more-box');

  // Populate Library Category Dropdown Options
  const libCatSelect = document.getElementById('lib-filter-category');
  if (libCatSelect) {
    libCatSelect.innerHTML = '<option value="all">All Categories (12)</option>' +
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  function getFilteredLibraryResources() {
    return library.filter(item => {
      // Search keyword match
      if (currentSearchQuery.trim() !== '') {
        const q = currentSearchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCat && !matchTags) return false;
      }

      // Category filter
      if (activeCategory !== 'all' && item.categoryId !== activeCategory) {
        return false;
      }

      // Audience filter
      if (activeAudience !== 'all' && item.audience !== activeAudience) {
        return false;
      }

      // Level filter
      if (activeLevel !== 'all' && item.educationLevel !== activeLevel) {
        return false;
      }

      // Format filter
      if (activeFormat !== 'all' && item.format !== activeFormat) {
        return false;
      }

      // Access filter
      if (activeAccess !== 'all' && item.access !== activeAccess) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeSort === 'newest') {
        return new Date(b.date) - new Date(a.date);
      }
      if (activeSort === 'popular' || activeSort === 'downloads') {
        return b.downloads - a.downloads;
      }
      if (activeSort === 'rating') {
        return b.rating - a.rating;
      }
      // default: 'relevant'
      return b.rating * b.downloads - a.rating * a.downloads;
    });
  }

  function filterAndRenderLibrary() {
    if (!libraryGrid) return;

    const filtered = getFilteredLibraryResources();
    const visible = filtered.slice(0, visibleLibraryCount);

    // Update Result Counter
    if (resultsCountEl) {
      resultsCountEl.innerHTML = `Showing <strong>${Math.min(visible.length, filtered.length)}</strong> of <strong>${filtered.length}</strong> resources`;
    }

    // Update Active Filter Chips
    renderActiveFilterChips();

    // Render Cards or Empty State
    if (filtered.length === 0) {
      libraryGrid.innerHTML = `
        <div class="res-empty-state" style="grid-column: 1/-1;">
          <div class="res-empty-icon">
            ${getSvgIcon('search')}
          </div>
          <h4 class="res-empty-title">No resources matched your criteria</h4>
          <p class="res-empty-desc">Try clearing selected filters, adjusting search keywords, or selecting another educational category.</p>
          <button class="btn btn-hero-primary" id="res-empty-reset-btn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('res-empty-reset-btn');
      if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      return;
    }

    libraryGrid.className = `res-library-grid ${activeViewMode === 'list' ? 'list-view' : ''}`;
    libraryGrid.innerHTML = visible.map(res => renderResourceCard(res, false)).join('');
    attachCardEventListeners(libraryGrid);

    // Toggle Load More Button
    if (loadMoreContainer) {
      if (visible.length < filtered.length) {
        loadMoreContainer.style.display = 'block';
      } else {
        loadMoreContainer.style.display = 'none';
      }
    }
  }

  function renderActiveFilterChips() {
    if (!activeChipsRow) return;

    const chips = [];

    if (currentSearchQuery.trim()) {
      chips.push({ label: `Search: "${currentSearchQuery}"`, type: 'search' });
    }

    if (activeCategory !== 'all') {
      const catObj = categories.find(c => c.id === activeCategory);
      chips.push({ label: `Category: ${catObj ? catObj.name : activeCategory}`, type: 'category' });
    }

    if (activeAudience !== 'all') {
      chips.push({ label: `Audience: ${activeAudience}`, type: 'audience' });
    }

    if (activeLevel !== 'all') {
      chips.push({ label: `Level: ${activeLevel}`, type: 'level' });
    }

    if (activeFormat !== 'all') {
      chips.push({ label: `Format: ${activeFormat}`, type: 'format' });
    }

    if (activeAccess !== 'all') {
      chips.push({ label: `Access: ${activeAccess}`, type: 'access' });
    }

    if (chips.length === 0) {
      activeChipsRow.innerHTML = '';
      return;
    }

    activeChipsRow.innerHTML = `
      <span style="font-size:13px; font-weight:600; color:var(--res-text-muted); margin-right:4px;">Active Filters:</span>
      ${chips.map(chip => `
        <span class="res-filter-chip">
          ${chip.label}
          <span class="res-filter-chip-remove" data-chip-type="${chip.type}" role="button" aria-label="Remove filter">&times;</span>
        </span>
      `).join('')}
      <button class="res-clear-all-btn" id="res-chips-clear-all" style="margin-left:8px;">Clear All</button>
    `;

    activeChipsRow.querySelectorAll('.res-filter-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-chip-type');
        if (type === 'search') {
          currentSearchQuery = '';
          const heroSearch = document.getElementById('res-hero-search-input');
          if (heroSearch) heroSearch.value = '';
        } else if (type === 'category') {
          activeCategory = 'all';
          const sel = document.getElementById('lib-filter-category');
          if (sel) sel.value = 'all';
        } else if (type === 'audience') {
          activeAudience = 'all';
          const sel = document.getElementById('lib-filter-audience');
          if (sel) sel.value = 'all';
        } else if (type === 'level') {
          activeLevel = 'all';
          const sel = document.getElementById('lib-filter-level');
          if (sel) sel.value = 'all';
        } else if (type === 'format') {
          activeFormat = 'all';
          const sel = document.getElementById('lib-filter-format');
          if (sel) sel.value = 'all';
        } else if (type === 'access') {
          activeAccess = 'all';
          updateAccessPillUI();
        }
        visibleLibraryCount = 9;
        filterAndRenderLibrary();
      });
    });

    const clearAllBtn = document.getElementById('res-chips-clear-all');
    if (clearAllBtn) clearAllBtn.addEventListener('click', resetAllFilters);
  }

  function resetAllFilters() {
    currentSearchQuery = '';
    activeCategory = 'all';
    activeAudience = 'all';
    activeLevel = 'all';
    activeFormat = 'all';
    activeAccess = 'all';
    activeSort = 'relevant';
    visibleLibraryCount = 9;

    const heroSearch = document.getElementById('res-hero-search-input');
    if (heroSearch) heroSearch.value = '';

    const catSelect = document.getElementById('lib-filter-category');
    if (catSelect) catSelect.value = 'all';

    const audSelect = document.getElementById('lib-filter-audience');
    if (audSelect) audSelect.value = 'all';

    const lvlSelect = document.getElementById('lib-filter-level');
    if (lvlSelect) lvlSelect.value = 'all';

    const fmtSelect = document.getElementById('lib-filter-format');
    if (fmtSelect) fmtSelect.value = 'all';

    const sortSelect = document.getElementById('res-sort-select');
    if (sortSelect) sortSelect.value = 'relevant';

    updateAccessPillUI();
    filterAndRenderLibrary();
  }

  function updateAccessPillUI() {
    document.querySelectorAll('.res-radio-pill').forEach(pill => {
      const val = pill.getAttribute('data-access');
      if (val === activeAccess) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Bind Sidebar Filters
  const catSel = document.getElementById('lib-filter-category');
  if (catSel) {
    catSel.addEventListener('change', (e) => {
      activeCategory = e.target.value;
      visibleLibraryCount = 9;
      filterAndRenderLibrary();
    });
  }

  const audSel = document.getElementById('lib-filter-audience');
  if (audSel) {
    audSel.addEventListener('change', (e) => {
      activeAudience = e.target.value;
      visibleLibraryCount = 9;
      filterAndRenderLibrary();
    });
  }

  const lvlSel = document.getElementById('lib-filter-level');
  if (lvlSel) {
    lvlSel.addEventListener('change', (e) => {
      activeLevel = e.target.value;
      visibleLibraryCount = 9;
      filterAndRenderLibrary();
    });
  }

  const fmtSel = document.getElementById('lib-filter-format');
  if (fmtSel) {
    fmtSel.addEventListener('change', (e) => {
      activeFormat = e.target.value;
      visibleLibraryCount = 9;
      filterAndRenderLibrary();
    });
  }

  document.querySelectorAll('.res-radio-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      activeAccess = pill.getAttribute('data-access') || 'all';
      updateAccessPillUI();
      visibleLibraryCount = 9;
      filterAndRenderLibrary();
    });
  });

  const clearSidebarBtn = document.getElementById('res-clear-sidebar-filters');
  if (clearSidebarBtn) clearSidebarBtn.addEventListener('click', resetAllFilters);

  // Bind Sort Dropdown
  const sortSel = document.getElementById('res-sort-select');
  if (sortSel) {
    sortSel.addEventListener('change', (e) => {
      activeSort = e.target.value;
      filterAndRenderLibrary();
    });
  }

  // Bind Grid vs List View Switcher
  const btnGridView = document.getElementById('res-view-grid');
  const btnListView = document.getElementById('res-view-list');
  if (btnGridView && btnListView) {
    btnGridView.addEventListener('click', () => {
      activeViewMode = 'grid';
      btnGridView.classList.add('active');
      btnListView.classList.remove('active');
      filterAndRenderLibrary();
    });
    btnListView.addEventListener('click', () => {
      activeViewMode = 'list';
      btnListView.classList.add('active');
      btnGridView.classList.remove('active');
      filterAndRenderLibrary();
    });
  }

  // Bind Load More Button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleLibraryCount += pageSize;
      filterAndRenderLibrary();
    });
  }

  // Mobile Filter Drawer Toggle
  const mobileFilterToggle = document.getElementById('res-mobile-filter-toggle');
  const filterSidebar = document.getElementById('res-filter-sidebar');
  if (mobileFilterToggle && filterSidebar) {
    mobileFilterToggle.addEventListener('click', () => {
      filterSidebar.classList.toggle('mobile-open');
      const isOpen = filterSidebar.classList.contains('mobile-open');
      mobileFilterToggle.innerHTML = isOpen 
        ? `${getSvgIcon('filter')} Hide Filters` 
        : `${getSvgIcon('filter')} Filter Resources`;
    });
  }

  // ── 5. Hero Search & Autocomplete ───────────────────────────
  const heroSearchInput = document.getElementById('res-hero-search-input');
  const heroSearchClear = document.getElementById('res-hero-search-clear');
  const heroSearchBtn = document.getElementById('res-hero-search-btn');
  const autocompleteBox = document.getElementById('res-autocomplete-box');

  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      currentSearchQuery = val;
      if (heroSearchClear) heroSearchClear.style.display = val ? 'flex' : 'none';

      // Autocomplete Suggestions
      if (val.trim().length >= 2 && autocompleteBox) {
        const matches = [...featured, ...library].filter(item => 
          item.title.toLowerCase().includes(val.toLowerCase()) ||
          item.category.toLowerCase().includes(val.toLowerCase())
        ).slice(0, 5);

        if (matches.length > 0) {
          autocompleteBox.innerHTML = matches.map(m => `
            <div class="res-autocomplete-item" data-id="${m.id}" data-title="${m.title}">
              <div class="res-auto-left">
                ${getSvgIcon('file-text')}
                <span>${highlightMatch(m.title, val)}</span>
              </div>
              <span class="res-auto-tag">${m.format || 'Resource'}</span>
            </div>
          `).join('');
          autocompleteBox.classList.add('active');

          autocompleteBox.querySelectorAll('.res-autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
              const resId = item.getAttribute('data-id');
              const resObj = [...featured, ...library].find(r => r.id === resId);
              if (resObj) openResourcePreviewModal(resObj);
              autocompleteBox.classList.remove('active');
            });
          });
        } else {
          autocompleteBox.classList.remove('active');
        }
      } else if (autocompleteBox) {
        autocompleteBox.classList.remove('active');
      }

      visibleLibraryCount = 9;
      filterAndRenderLibrary();
    });

    heroSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (autocompleteBox) autocompleteBox.classList.remove('active');
        const libSec = document.getElementById('resource-library');
        if (libSec) libSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    document.addEventListener('click', (e) => {
      if (autocompleteBox && !e.target.closest('.res-search-container')) {
        autocompleteBox.classList.remove('active');
      }
    });
  }

  if (heroSearchClear) {
    heroSearchClear.addEventListener('click', () => {
      if (heroSearchInput) heroSearchInput.value = '';
      currentSearchQuery = '';
      heroSearchClear.style.display = 'none';
      if (autocompleteBox) autocompleteBox.classList.remove('active');
      visibleLibraryCount = 9;
      filterAndRenderLibrary();
    });
  }

  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => {
      const libSec = document.getElementById('resource-library');
      if (libSec) libSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Popular Search Tags in Hero
  document.querySelectorAll('.res-hero-tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const query = pill.getAttribute('data-tag') || pill.textContent.trim();
      currentSearchQuery = query;
      if (heroSearchInput) {
        heroSearchInput.value = query;
        if (heroSearchClear) heroSearchClear.style.display = 'flex';
      }
      visibleLibraryCount = 9;
      filterAndRenderLibrary();

      const libSec = document.getElementById('resource-library');
      if (libSec) libSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── 6. Render Downloadable Toolkits & Templates ─────────────
  const toolkitsGrid = document.getElementById('res-toolkits-grid');
  if (toolkitsGrid) {
    toolkitsGrid.innerHTML = toolkits.map(tool => `
      <div class="res-toolkit-card" data-id="${tool.id}">
        <div class="res-toolkit-header">
          <span class="res-filetype-pill ${tool.fileType.toLowerCase()}">${tool.fileType}</span>
          <span class="res-editable-badge">
            ${tool.editable ? '✏️ Editable Template' : '📄 Ready to Print'}
          </span>
        </div>
        <h4 class="res-toolkit-title">${tool.title}</h4>
        <p class="res-toolkit-desc">${tool.description}</p>
        <div class="res-toolkit-meta">
          <span>👥 ${tool.audience}</span>
          <span>💾 ${tool.fileSize}</span>
        </div>
        <div class="res-toolkit-actions">
          <button class="btn-card-outline res-preview-trigger" data-title="${tool.title}" data-category="${tool.category}" data-desc="${tool.description}" data-size="${tool.fileSize}" data-format="${tool.fileType}">
            👁 Preview
          </button>
          <button class="btn-card-primary res-download-btn" data-title="${tool.title}">
            📥 Download
          </button>
        </div>
      </div>
    `).join('');

    toolkitsGrid.querySelectorAll('.res-download-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-title');
        showResourceToast(`Downloading "${title}"...`, 'success');
      });
    });

    toolkitsGrid.querySelectorAll('.res-preview-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const mockItem = {
          title: btn.getAttribute('data-title'),
          category: btn.getAttribute('data-category'),
          description: btn.getAttribute('data-desc'),
          fileSize: btn.getAttribute('data-size'),
          format: btn.getAttribute('data-format'),
          audience: 'Educators & Administrators',
          access: 'Free',
          rating: 4.9,
          downloads: 1200
        };
        openResourcePreviewModal(mockItem);
      });
    });
  }

  // ── 7. Render Learning Media Hub ────────────────────────────
  const mediaGrid = document.getElementById('res-media-grid');
  if (mediaGrid) {
    mediaGrid.innerHTML = media.map(m => `
      <div class="res-media-card" data-id="${m.id}">
        <div class="res-media-thumb">
          <img src="${m.thumbnail}" alt="${m.title}" loading="lazy">
          <div class="res-play-overlay">
            <div class="res-play-btn-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>
          <span class="res-media-type-tag">${m.mediaType}</span>
          <span class="res-media-duration">⏱ ${m.duration}</span>
        </div>
        <div class="res-media-body">
          <div class="res-media-topic">${m.topic}</div>
          <h4 class="res-media-title">${m.title}</h4>
          <p class="res-media-desc">${m.description}</p>
          <div class="res-media-footer">
            <span>🎙 ${m.presenter}</span>
            <span>👁 ${m.views} views</span>
          </div>
        </div>
      </div>
    `).join('');

    mediaGrid.querySelectorAll('.res-media-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const mediaObj = media.find(item => item.id === id);
        if (mediaObj) openMediaPlayerModal(mediaObj);
      });
    });
  }

  // ── 8. Render Latest Insights & Articles ────────────────────
  const articlesGrid = document.getElementById('res-articles-grid');
  if (articlesGrid) {
    articlesGrid.innerHTML = articles.map(art => `
      <article class="res-article-card">
        <div class="res-article-media">
          <img src="${art.image}" alt="${art.title}" loading="lazy">
        </div>
        <div class="res-article-body">
          <div class="res-article-category">${art.category}</div>
          <h4 class="res-article-title">${art.title}</h4>
          <p class="res-article-summary">${art.summary}</p>
          <div class="res-article-meta">
            <span>✍️ ${art.author}</span>
            <span>⏱ ${art.readTime}</span>
          </div>
          <a href="${art.link}" class="res-article-link">Read Full Article →</a>
        </div>
      </article>
    `).join('');
  }

  // ── Card Rendering Helper ───────────────────────────────────
  function renderResourceCard(res, isFeatured = false) {
    const isSaved = savedResourceIds.has(res.id);
    const accessClass = res.access === 'Free' ? 'badge-access-free' : 'badge-access-premium';
    const accessLabel = res.access === 'Free' ? 'Free Resource' : 'Premium';

    return `
      <div class="res-card" data-id="${res.id}">
        <div class="res-card-media">
          <img src="${res.image || 'assets/images/about.png'}" alt="${res.title}" loading="lazy">
          <div class="res-card-badges">
            <span class="badge-format">${res.format || 'Resource'}</span>
            <span class="${accessClass}">${accessLabel}</span>
          </div>
        </div>
        <div class="res-card-body">
          <div class="res-card-cat-row">
            <span class="res-card-category">${res.category}</span>
            <span class="res-card-readtime">⏱ ${res.readTime || '15 mins'}</span>
          </div>
          <h3 class="res-card-title">${res.title}</h3>
          <p class="res-card-desc">${res.description}</p>
          <div class="res-card-meta">
            <span class="res-meta-item">👥 ${res.audience || 'All Educators'}</span>
            ${res.fileSize ? `<span class="res-meta-item">💾 ${res.fileSize}</span>` : ''}
            <span class="res-meta-item">⭐ ${res.rating || 4.9}</span>
            <span class="res-meta-item">📥 ${(res.downloads || 450).toLocaleString()}</span>
          </div>
          <div class="res-card-actions">
            <button class="btn-card-outline res-preview-btn" data-id="${res.id}">
              Preview
            </button>
            <button class="btn-card-primary res-download-btn" data-id="${res.id}" data-title="${res.title}">
              📥 Download
            </button>
            <button class="btn-icon-control res-bookmark-btn ${isSaved ? 'active' : ''}" data-id="${res.id}" aria-label="Save resource" title="Save resource">
              ${getSvgIcon('bookmark')}
            </button>
            <button class="btn-icon-control res-share-btn" data-id="${res.id}" data-title="${res.title}" aria-label="Share resource" title="Share resource">
              ${getSvgIcon('share')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachCardEventListeners(container) {
    if (!container) return;

    // Preview
    container.querySelectorAll('.res-preview-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const resObj = [...featured, ...library].find(r => r.id === id);
        if (resObj) openResourcePreviewModal(resObj);
      });
    });

    // Download
    container.querySelectorAll('.res-download-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = btn.getAttribute('data-title') || 'Resource';
        showResourceToast(`Preparing download for "${title}"...`, 'success');
      });
    });

    // Bookmark
    container.querySelectorAll('.res-bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (savedResourceIds.has(id)) {
          savedResourceIds.delete(id);
          btn.classList.remove('active');
          showResourceToast('Resource removed from saved collection.', 'info');
        } else {
          savedResourceIds.add(id);
          btn.classList.add('active');
          showResourceToast('Resource saved to your collection! ⭐', 'success');
        }
        persistSavedResources();
      });
    });

    // Share
    container.querySelectorAll('.res-share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = btn.getAttribute('data-title');
        const shareUrl = window.location.origin + window.location.pathname + '#resource-' + btn.getAttribute('data-id');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            showResourceToast(`Link for "${title}" copied to clipboard! 📋`, 'success');
          }).catch(() => {
            showResourceToast('Share link: ' + shareUrl, 'info');
          });
        } else {
          showResourceToast('Share link: ' + shareUrl, 'info');
        }
      });
    });
  }

  // ── 9. Modals Implementation ────────────────────────────────

  // Preview Modal
  const previewModal = document.getElementById('res-preview-modal');
  const previewTitle = document.getElementById('res-preview-modal-title');
  const previewBody = document.getElementById('res-preview-modal-body');
  const previewClose = document.getElementById('res-preview-modal-close');
  const previewDownloadBtn = document.getElementById('res-preview-download-btn');

  function openResourcePreviewModal(res) {
    if (!previewModal) return;
    if (previewTitle) previewTitle.textContent = res.title;
    if (previewBody) {
      previewBody.innerHTML = `
        <div style="margin-bottom:18px;">
          <span class="badge-format" style="margin-right:8px;">${res.format || 'Resource'}</span>
          <span class="${res.access === 'Premium' ? 'badge-access-premium' : 'badge-access-free'}">${res.access || 'Free Resource'}</span>
        </div>
        <p style="font-size:15px; color:var(--res-text-secondary); line-height:1.65; margin-bottom:16px;">
          ${res.description}
        </p>
        <table class="res-meta-table">
          <tbody>
            <tr><td>Category</td><td>${res.category}</td></tr>
            <tr><td>Target Audience</td><td>${res.audience || 'Educators'}</td></tr>
            <tr><td>Education Level</td><td>${res.educationLevel || 'General'}</td></tr>
            <tr><td>File Size</td><td>${res.fileSize || '2.4 MB'}</td></tr>
            <tr><td>Estimated Time</td><td>${res.readTime || '20 mins'}</td></tr>
            <tr><td>User Rating</td><td>⭐ ${res.rating || 4.9} / 5.0 (${(res.downloads || 350).toLocaleString()} downloads)</td></tr>
          </tbody>
        </table>
        <div style="background:var(--res-blue-soft); border-left:4px solid var(--res-blue); padding:12px 16px; border-radius:4px; font-size:13.5px; color:var(--res-blue-hover);">
          💡 <strong>Educator Tip:</strong> This resource includes editable student worksheets, assessment checklists, and practical guidance aligned to the Kenyan Competency-Based Curriculum.
        </div>
      `;
    }
    if (previewDownloadBtn) {
      previewDownloadBtn.onclick = () => {
        showResourceToast(`Downloading "${res.title}"...`, 'success');
      };
    }
    previewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (previewClose) {
    previewClose.addEventListener('click', () => {
      previewModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Media Player Modal
  const mediaModal = document.getElementById('res-media-modal');
  const mediaTitle = document.getElementById('res-media-modal-title');
  const mediaContainer = document.getElementById('res-media-modal-container');
  const mediaClose = document.getElementById('res-media-modal-close');

  function openMediaPlayerModal(mediaItem) {
    if (!mediaModal) return;
    if (mediaTitle) mediaTitle.textContent = mediaItem.title;
    if (mediaContainer) {
      mediaContainer.innerHTML = `
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; background:#0F172A; margin-bottom:18px;">
          <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#FFFFFF; text-align:center; padding:20px;">
            <div style="width:68px; height:68px; border-radius:50%; background:var(--res-blue); display:flex; align-items:center; justify-content:center; margin-bottom:14px; box-shadow:0 8px 24px rgba(48,92,222,0.5);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <h4 style="font-size:18px; font-weight:700; color:#FFFFFF; margin-bottom:6px;">Now Playing: ${mediaItem.title}</h4>
            <p style="font-size:14px; color:#CBD5E1; margin:0;">${mediaItem.mediaType} • Presented by ${mediaItem.presenter} (${mediaItem.duration})</p>
          </div>
        </div>
        <p style="font-size:14.5px; color:var(--res-text-secondary); line-height:1.65; margin:0;">
          ${mediaItem.description}
        </p>
      `;
    }
    mediaModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (mediaClose) {
    mediaClose.addEventListener('click', () => {
      mediaModal.classList.remove('active');
      document.body.style.overflow = '';
      if (mediaContainer) mediaContainer.innerHTML = '';
    });
  }

  // Submit Resource Modal
  const submitModal = document.getElementById('res-submit-modal');
  const submitClose = document.getElementById('res-submit-modal-close');
  const submitForm = document.getElementById('res-submit-resource-form');
  const heroSubmitBtn = document.getElementById('res-hero-submit-btn');

  if (heroSubmitBtn && submitModal) {
    heroSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      submitModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (submitClose && submitModal) {
    submitClose.addEventListener('click', () => {
      submitModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (submitForm) {
    submitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('res-submit-title')?.value;
      const author = document.getElementById('res-submit-author')?.value;

      showResourceToast(`Thank you, ${author || 'Educator'}! Your submission for "${title || 'Resource'}" has been sent for editorial review. 🎉`, 'success');
      submitForm.reset();
      submitModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close modals on backdrop click or ESC key
  [previewModal, mediaModal, submitModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (mediaContainer) mediaContainer.innerHTML = '';
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [previewModal, mediaModal, submitModal].forEach(modal => {
        if (modal && modal.classList.contains('active')) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
          if (mediaContainer) mediaContainer.innerHTML = '';
        }
      });
    }
  });

  // ── 10. Toast Notification Utility ──────────────────────────
  function showResourceToast(message, type = 'info') {
    let toast = document.getElementById('res-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'res-toast-notification';
      toast.className = 'res-toast-notification';
      document.body.appendChild(toast);
    }
    toast.className = `res-toast-notification ${type} show`;
    toast.textContent = message;

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // ── 11. Helper Utilities ────────────────────────────────────
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background:#FEF08A; color:#854D0E; padding:0 2px; border-radius:2px;">$1</mark>');
  }

  function getSvgIcon(iconName) {
    switch (iconName) {
      case 'books':
      case 'book-open':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
      case 'file-text':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
      case 'award':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`;
      case 'grid':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
      case 'users':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
      case 'compass':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
      case 'calendar':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
      case 'check-square':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;
      case 'monitor':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
      case 'briefcase':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
      case 'server':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`;
      case 'heart':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
      case 'home':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
      case 'target':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;
      case 'shield':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      case 'search':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
      case 'filter':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`;
      case 'bookmark':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
      case 'share':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
      default:
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
    }
  }

  // Initial Render of Library
  filterAndRenderLibrary();
});
