/**
 * INSTRUCTIFY KENYA KNOWLEDGE HUB — CLIENT LOGIC ENGINE v1.0
 * Handles real-time search, category filtering, reading progress bar,
 * dynamic article rendering, social sharing, and resource downloads.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Reading Progress Bar ──
  const progressBar = document.getElementById('reading-progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = `${scrolled}%`;
    }, { passive: true });
  }

  // ── DOM References ──
  const searchInput = document.getElementById('blog-search');
  const categoryPillsContainer = document.getElementById('blog-category-pills');
  const articlesGrid = document.getElementById('articles-grid');
  const articlesCountEl = document.getElementById('articles-count');

  let activeCategory = "All";

  // ── Render Category Pills ──
  function renderCategoryPills() {
    if (!categoryPillsContainer || typeof BLOG_INFO === 'undefined') return;

    categoryPillsContainer.innerHTML = BLOG_INFO.categories.map(cat => `
      <button class="blog-cat-pill ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');

    categoryPillsContainer.querySelectorAll('.blog-cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        categoryPillsContainer.querySelectorAll('.blog-cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterAndRenderArticles();
      });
    });
  }

  // ── Render Article Cards ──
  function renderArticleCards(articles) {
    if (!articlesGrid) return;

    if (articles.length === 0) {
      articlesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px; background:#F8FAFC; border-radius:20px; border:1px dashed #CBD5E1;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" style="margin-bottom:12px;">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <h3 style="font-size:20px; font-weight:800; color:#0F172A; margin-bottom:8px;">No articles found</h3>
          <p style="font-size:14.5px; color:#64748B; margin:0;">Try searching for other educational topics, AI keywords, or select "All".</p>
        </div>
      `;
      if (articlesCountEl) articlesCountEl.textContent = `0 articles`;
      return;
    }

    if (articlesCountEl) {
      articlesCountEl.textContent = `Showing ${articles.length} article${articles.length === 1 ? '' : 's'}`;
    }

    articlesGrid.innerHTML = articles.map(art => {
      const author = BLOG_INFO.authors[art.authorId] || { name: "Instructify Editorial", title: "Educator", initials: "IE" };
      return `
        <article class="article-card" style="--art-accent:${art.themeColor}; --art-glow:rgba(33, 69, 230,0.18);">
          <img src="${art.coverImage}" alt="${art.title}" class="article-card-cover" loading="lazy">
          <div class="article-card-body">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="ep-badge blue" style="font-size:11px;">${art.category}</span>
                <span style="font-size:12px; font-weight:600; color:#64748B;">${art.readTime}</span>
              </div>
              <h3 class="article-card-title">
                <a href="article.html?id=${art.id}">${art.title}</a>
              </h3>
              <p class="article-card-excerpt">${art.excerpt}</p>
            </div>

            <div>
              <div class="article-card-footer">
                <div style="display:flex; align-items:center; gap:8px;">
                  <div class="author-avatar" style="width:28px; height:28px; font-size:10px;">${author.initials}</div>
                  <span style="font-weight:700; color:#0F172A;">${author.name}</span>
                </div>
                <a href="article.html?id=${art.id}" style="color:${art.themeColor}; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                  Read →
                </a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // ── Filter and Search Logic ──
  function filterAndRenderArticles() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    const filtered = BLOG_ARTICLES.filter(art => {
      const author = BLOG_INFO.authors[art.authorId] || { name: "" };
      const matchCat = activeCategory === 'All' || art.category.toLowerCase() === activeCategory.toLowerCase() || art.tags.some(t => t.toLowerCase() === activeCategory.toLowerCase());
      const matchQuery = !query ||
        art.title.toLowerCase().includes(query) ||
        art.subtitle.toLowerCase().includes(query) ||
        art.excerpt.toLowerCase().includes(query) ||
        author.name.toLowerCase().includes(query) ||
        art.tags.some(t => t.toLowerCase().includes(query));

      return matchCat && matchQuery;
    });

    renderArticleCards(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterAndRenderArticles);
  }

  // ── Initialize Blog Hub ──
  if (articlesGrid) {
    renderCategoryPills();
    renderArticleCards(BLOG_ARTICLES);
  }

  // ── Article Detail Page Handler (`article.html`) ──
  const isArticleDetailPage = document.getElementById('article-detail-root');
  if (isArticleDetailPage && typeof BLOG_ARTICLES !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id') || 'ai-transforming-education';
    const article = BLOG_ARTICLES.find(x => x.id === articleId) || BLOG_ARTICLES[0];
    const author = BLOG_INFO.authors[article.authorId] || { name: "Instructify Kenya Editorial", title: "Lead Contributor", bio: "Educational thought leadership team.", initials: "IK" };

    // Update Meta and Document Title
    document.title = `${article.title} | Instructify Kenya Knowledge Hub`;

    // Populate Header Elements
    const titleEl = document.getElementById('art-detail-title');
    const subtitleEl = document.getElementById('art-detail-subtitle');
    const catEl = document.getElementById('art-detail-category');
    const dateEl = document.getElementById('art-detail-date');
    const readTimeEl = document.getElementById('art-detail-read-time');
    const authorNameEl = document.getElementById('art-detail-author-name');
    const authorTitleEl = document.getElementById('art-detail-author-title');
    const authorAvatarEl = document.getElementById('art-detail-author-avatar');
    const heroCoverEl = document.getElementById('art-detail-cover-image');
    const bodyContentEl = document.getElementById('art-detail-body-content');

    if (titleEl) titleEl.textContent = article.title;
    if (subtitleEl) subtitleEl.textContent = article.subtitle;
    if (catEl) catEl.textContent = article.category;
    if (dateEl) dateEl.textContent = `${article.publishDate} · Updated ${article.lastUpdated || article.publishDate}`;
    if (readTimeEl) readTimeEl.textContent = article.readTime;
    if (authorNameEl) authorNameEl.textContent = author.name;
    if (authorTitleEl) authorTitleEl.textContent = `${author.title} · ${author.organization}`;
    if (authorAvatarEl) authorAvatarEl.textContent = author.initials;
    if (heroCoverEl) {
      heroCoverEl.src = article.coverImage;
      heroCoverEl.alt = article.title;
    }
    if (bodyContentEl) bodyContentEl.innerHTML = article.content;

    // Key Takeaways Box
    const takeawaysList = document.getElementById('art-detail-takeaways');
    if (takeawaysList && article.keyTakeaways) {
      takeawaysList.innerHTML = article.keyTakeaways.map((point, idx) => `
        <li style="display:flex; align-items:flex-start; gap:12px; margin-bottom:12px; font-size:15.5px; color:#166534; line-height:1.6;">
          <span style="background:#DCFCE7; color:#166534; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px; flex-shrink:0; margin-top:2px;">✓</span>
          <div>${point}</div>
        </li>
      `).join('');
    }

    // Downloadable Resource Box
    const resourceBox = document.getElementById('art-detail-resource-box');
    const resourceTitle = document.getElementById('art-resource-title');
    const resourceDesc = document.getElementById('art-resource-desc');
    if (article.downloadableResource && resourceBox) {
      if (resourceTitle) resourceTitle.textContent = article.downloadableResource.title;
      if (resourceDesc) resourceDesc.textContent = article.downloadableResource.description;
      resourceBox.style.display = 'flex';
    } else if (resourceBox) {
      resourceBox.style.display = 'none';
    }

    // Podcast Connection Box
    const podcastBox = document.getElementById('art-detail-podcast-box');
    const podcastEpTitle = document.getElementById('art-podcast-title');
    const podcastEpLink = document.getElementById('art-podcast-link');
    if (article.podcastEpisodeId && podcastBox) {
      podcastBox.style.display = 'flex';
      if (podcastEpTitle) podcastEpTitle.textContent = `Listen to the conversation on The Instructify Kenya Podcast`;
      if (podcastEpLink) podcastEpLink.href = `episode.html?id=${article.podcastEpisodeId}`;
    } else if (podcastBox) {
      podcastBox.style.display = 'none';
    }

    // Author Profile Box
    const authorCardName = document.getElementById('art-author-card-name');
    const authorCardTitle = document.getElementById('art-author-card-title');
    const authorCardBio = document.getElementById('art-author-card-bio');
    const authorCardAvatar = document.getElementById('art-author-card-avatar');
    if (authorCardName) authorCardName.textContent = author.name;
    if (authorCardTitle) authorCardTitle.textContent = `${author.title} · ${author.organization}`;
    if (authorCardBio) authorCardBio.textContent = author.bio;
    if (authorCardAvatar) authorCardAvatar.textContent = author.initials;

    // Contextual Course Box
    const courseTitleEl = document.getElementById('art-course-title');
    const courseCategoryEl = document.getElementById('art-course-category');
    const courseLinkEl = document.getElementById('art-course-link');
    if (article.relatedCourse) {
      if (courseTitleEl) courseTitleEl.textContent = article.relatedCourse.title;
      if (courseCategoryEl) courseCategoryEl.textContent = article.relatedCourse.category;
      if (courseLinkEl) courseLinkEl.href = article.relatedCourse.link;
    }

    // Related Articles Grid
    const relatedGrid = document.getElementById('art-related-grid');
    if (relatedGrid) {
      const related = BLOG_ARTICLES.filter(x => x.id !== article.id).slice(0, 3);
      relatedGrid.innerHTML = related.map(rel => `
        <article class="article-card" style="--art-accent:${rel.themeColor};">
          <img src="${rel.coverImage}" alt="${rel.title}" class="article-card-cover" style="height:170px;" loading="lazy">
          <div class="article-card-body" style="padding:20px;">
            <div>
              <span class="ep-badge blue" style="font-size:11px;">${rel.category}</span>
              <h3 class="article-card-title" style="font-size:17px; margin:8px 0;">
                <a href="article.html?id=${rel.id}">${rel.title}</a>
              </h3>
            </div>
            <div style="margin-top:16px;">
              <a href="article.html?id=${rel.id}" class="btn btn-outline btn-sm" style="width:100%; text-align:center;">
                Read Article →
              </a>
            </div>
          </div>
        </article>
      `).join('');
    }
  }

  // ── Share Actions ──
  window.shareArticle = function(platform) {
    const title = document.title || 'Instructify Kenya Knowledge Hub';
    const url = window.location.href;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('Article link copied to clipboard!');
        });
        break;
      default:
        if (navigator.share) {
          navigator.share({ title, url }).catch(() => {});
        } else {
          navigator.clipboard.writeText(url).then(() => {
            alert('Article link copied to clipboard!');
          });
        }
    }
  };

  // ── Simulated Download Handler ──
  window.downloadResource = function() {
    alert('Preparing your downloadable resource... Download will start automatically.');
  };

  // ── Newsletter Form Handler ──
  const blogSubscribeForm = document.getElementById('blog-subscribe-form');
  if (blogSubscribeForm) {
    blogSubscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = blogSubscribeForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        alert(`Thank you for subscribing! Practical educational insights will be sent to ${emailInput.value}.`);
        emailInput.value = '';
      }
    });
  }
});
