/**
 * VideosController Module - Manages YouTube Videos & Channels for HSK Learning
 * Features: Speed Controls, Personal Notes with Auto-Save, One-Click Add to SRS, Shadowing Mode, Duration Filters.
 */
class VideosController {
  constructor(app) {
    this.app = app;
    this.data = null;
    this.activeFilter = "all";
    this.activeChannel = "all";
    this.searchQuery = "";
    this.currentVideoId = null;
    this.currentVideoList = [];
    this.currentSpeed = 1.0;
    this.favorites = new Set();
    this.watched = new Set();
    this.recentlyPlayed = [];
    this.initialized = false;

    this.loadFavoritesAndWatched();
  }

  loadFavoritesAndWatched() {
    try {
      const favs = localStorage.getItem("hsk-video-favorites");
      if (favs) {
        this.favorites = new Set(JSON.parse(favs));
      }
      const wtch = localStorage.getItem("hsk-video-watched");
      if (wtch) {
        this.watched = new Set(JSON.parse(wtch));
      }
      const rcnt = localStorage.getItem("hsk-video-recently-played");
      if (rcnt) {
        this.recentlyPlayed = JSON.parse(rcnt);
      }
    } catch (e) {
      if (this.app && typeof this.app.logWarn === "function") {
        this.app.logWarn("Error reading video storage:", e);
      }
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem("hsk-video-favorites", JSON.stringify([...this.favorites]));
    } catch (e) {
      if (this.app && typeof this.app.logWarn === "function") {
        this.app.logWarn("Error saving video favorites:", e);
      }
    }
  }

  saveWatched() {
    try {
      localStorage.setItem("hsk-video-watched", JSON.stringify([...this.watched]));
    } catch (e) {
      if (this.app && typeof this.app.logWarn === "function") {
        this.app.logWarn("Error saving video watched status:", e);
      }
    }
  }

  saveRecentlyPlayed() {
    try {
      localStorage.setItem("hsk-video-recently-played", JSON.stringify(this.recentlyPlayed));
    } catch (e) {
      if (this.app && typeof this.app.logWarn === "function") {
        this.app.logWarn("Error saving recently played videos:", e);
      }
    }
  }

  async init() {
    if (this.initialized) return;

    try {
      const response = await fetch("assets/data/videos-data.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} loading videos data`);
      }
      this.data = await response.json();
      this.setupEventListeners();
      this.renderChannels();
      this.renderRecentlyPlayed();
      this.renderVideos();
      this.initialized = true;
    } catch (err) {
      if (this.app && typeof this.app.logError === "function") {
        this.app.logError("Failed to initialize VideosController:", err);
      }
    }
  }

  setupEventListeners() {
    const searchInput = document.getElementById("videos-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderVideos();
      });
    }

    const customUrlBtn = document.getElementById("videos-custom-url-btn");
    const customUrlInput = document.getElementById("videos-custom-url-input");
    if (customUrlBtn && customUrlInput) {
      const handleCustomUrl = () => {
        const val = customUrlInput.value.trim();
        if (val) {
          const parsedId = this.parseYouTubeId(val);
          if (parsedId) {
            this.playCustomVideo(parsedId, val);
            customUrlInput.value = "";
          } else if (this.app && typeof this.app.showNotification === "function") {
            this.app.showNotification("URL de YouTube no válida", "warning");
          }
        }
      };
      customUrlBtn.addEventListener("click", handleCustomUrl);
      customUrlInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleCustomUrl();
      });
    }

    const filterChips = document.querySelectorAll("#videos-filters-list .videos-chip");
    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        filterChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        this.activeFilter = chip.dataset.filter || "all";
        this.renderVideos();
      });
    });

    const closeBtn = document.getElementById("videos-close-player");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closePlayer());
    }

    const prevBtn = document.getElementById("videos-prev-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.playPreviousVideo());
    }

    const nextBtn = document.getElementById("videos-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.playNextVideo());
    }

    const favBtn = document.getElementById("videos-favorite-btn");
    if (favBtn) {
      favBtn.addEventListener("click", () => {
        if (this.currentVideoId) {
          this.toggleFavorite(this.currentVideoId);
          this.updateTheaterButtons();
        }
      });
    }

    const watchBtn = document.getElementById("videos-watched-btn");
    if (watchBtn) {
      watchBtn.addEventListener("click", () => {
        if (this.currentVideoId) {
          this.toggleWatched(this.currentVideoId);
          this.updateTheaterButtons();
        }
      });
    }

    // Speed Control Buttons
    const speedBtns = document.querySelectorAll(".videos-speed-btn");
    speedBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        speedBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentSpeed = parseFloat(btn.dataset.speed) || 1.0;
        this.applyPlaybackSpeed();
      });
    });

    // Auto-save Personal Notes Input
    const userNotesInput = document.getElementById("videos-user-notes-input");
    if (userNotesInput) {
      let timeout;
      userNotesInput.addEventListener("input", () => {
        const status = document.getElementById("videos-notes-saved-status");
        if (status) status.textContent = "Guardando...";
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (this.currentVideoId) {
            localStorage.setItem(
              `hsk-video-user-notes-${this.currentVideoId}`,
              userNotesInput.value
            );
            if (status) status.textContent = "Guardado ✓";
          }
        }, 500);
      });
    }
  }

  applyPlaybackSpeed() {
    const iframe = document.getElementById("videos-iframe");
    if (!iframe || !iframe.contentWindow) return;
    try {
      // Send postMessage to YouTube iframe API to set playback rate
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "setPlaybackRate",
          args: [this.currentSpeed, true],
        }),
        "*"
      );
    } catch {
      // Non-fatal if cross-origin restriction applies
    }
  }

  parseYouTubeId(urlOrId) {
    if (!urlOrId) return null;
    const str = urlOrId.trim();

    if (str.includes("://") || str.includes("www.") || str.includes("/") || str.includes(".")) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = str.match(regExp);
      return match && match[2] && match[2].length === 11 ? match[2] : null;
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }

    return null;
  }

  parseDurationSeconds(durationStr) {
    if (!durationStr || typeof durationStr !== "string") return 0;
    const parts = durationStr.split(":").map((p) => parseInt(p, 10) || 0);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }

  getChannelIconSvg(iconKey, badgeColor) {
    const stroke = badgeColor || "var(--color-primary)";
    switch (iconKey) {
      case "compass":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`;
      case "graduation":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`;
      case "book":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
      case "smile":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`;
      case "user":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
      case "mic":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
      case "tv":
      default:
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>`;
    }
  }

  renderChannels() {
    const container = document.getElementById("videos-channels-list");
    if (!container || !this.data || !this.data.channels) return;

    const currentLang = window.languageManager?.currentLanguage || "es";

    container.innerHTML = this.data.channels
      .map((ch) => {
        const desc = ch.description[currentLang] || ch.description.es;
        const isActive = this.activeChannel === ch.id;
        const iconSvg = this.getChannelIconSvg(ch.icon || ch.avatar, ch.badgeColor);

        return `
          <div class="videos-channel-card ${isActive ? "active" : ""}" data-channel-id="${ch.id}">
            <div class="videos-channel-top">
              <div class="videos-channel-avatar" style="border-color: ${ch.badgeColor || "var(--color-primary)"};">
                ${iconSvg}
              </div>
              <div>
                <h4 class="videos-channel-name">${this.escapeHtml(ch.name)}</h4>
                <span class="videos-channel-handle">${this.escapeHtml(ch.handle)}</span>
              </div>
            </div>
            <p class="videos-channel-desc">${this.escapeHtml(desc)}</p>
            <div class="videos-channel-footer">
              <span class="videos-chip" style="font-size:0.75rem; padding:0.2rem 0.5rem;">${this.escapeHtml(ch.categories[0] || "")}</span>
              <a href="${ch.url}" target="_blank" rel="noopener" class="videos-channel-link-btn">
                YouTube ↗
              </a>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".videos-channel-card").forEach((card) => {
      const link = card.querySelector(".videos-channel-link-btn");
      if (link) {
        link.addEventListener("click", (e) => e.stopPropagation());
      }
      card.addEventListener("click", () => {
        const chId = card.dataset.channelId;
        if (this.activeChannel === chId) {
          this.activeChannel = "all";
        } else {
          this.activeChannel = chId;
        }
        this.renderChannels();
        this.renderVideos();
      });
    });
  }

  renderRecentlyPlayed() {
    const section = document.getElementById("videos-recently-played-section");
    const container = document.getElementById("videos-recently-played-list");
    if (!section || !container) return;

    if (!this.recentlyPlayed || this.recentlyPlayed.length === 0) {
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    const currentLang = window.languageManager?.currentLanguage || "es";

    container.innerHTML = this.recentlyPlayed
      .slice(0, 6)
      .map((vid) => {
        const title = vid.title[currentLang] || vid.title.es || vid.title;
        const thumbUrl = `https://img.youtube.com/vi/${vid.videoId}/hqdefault.jpg`;

        return `
          <div class="video-recent-card" data-video-id="${vid.id}">
            <div class="video-recent-thumb-box">
              <img src="${thumbUrl}" alt="${this.escapeHtml(title)}" loading="lazy" />
              <div class="video-recent-play-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div class="video-recent-info">
              <span class="video-recent-level">${this.escapeHtml(vid.level || "")}</span>
              <h5 class="video-recent-title">${this.escapeHtml(title)}</h5>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".video-recent-card").forEach((card) => {
      card.addEventListener("click", () => {
        const vidId = card.dataset.videoId;
        const found = this.data?.videos?.find((v) => v.id === vidId);
        if (found) {
          this.playVideo(found);
        }
      });
    });
  }

  getFilteredVideos() {
    if (!this.data || !this.data.videos) return [];
    const currentLang = window.languageManager?.currentLanguage || "es";

    return this.data.videos.filter((vid) => {
      // Channel filter
      if (this.activeChannel !== "all" && vid.channelId !== this.activeChannel) {
        return false;
      }

      // Duration Filters
      if (this.activeFilter === "dur_short") {
        const sec = this.parseDurationSeconds(vid.duration);
        if (sec > 300) return false;
      } else if (this.activeFilter === "dur_medium") {
        const sec = this.parseDurationSeconds(vid.duration);
        if (sec <= 300 || sec > 900) return false;
      } else if (this.activeFilter === "dur_long") {
        const sec = this.parseDurationSeconds(vid.duration);
        if (sec <= 900) return false;
      }
      // Category / Level / Custom Filter
      else if (this.activeFilter === "favorites") {
        if (!this.favorites.has(vid.id)) return false;
      } else if (this.activeFilter === "watched") {
        if (!this.watched.has(vid.id)) return false;
      } else if (this.activeFilter !== "all") {
        const matchesCategory = vid.category === this.activeFilter;
        const matchesLevel =
          vid.level === this.activeFilter || vid.level.includes(this.activeFilter);
        if (!matchesCategory && !matchesLevel) return false;
      }

      // Search Query
      if (this.searchQuery) {
        const title = (vid.title[currentLang] || vid.title.es).toLowerCase();
        const desc = (vid.description[currentLang] || vid.description.es).toLowerCase();
        const tags = (vid.tags || []).join(" ").toLowerCase();
        const ch = (this.getChannel(vid.channelId)?.name || "").toLowerCase();

        if (
          !title.includes(this.searchQuery) &&
          !desc.includes(this.searchQuery) &&
          !tags.includes(this.searchQuery) &&
          !ch.includes(this.searchQuery)
        ) {
          return false;
        }
      }

      return true;
    });
  }

  getChannel(channelId) {
    if (!this.data || !this.data.channels) return null;
    return this.data.channels.find((c) => c.id === channelId) || null;
  }

  renderVideos() {
    const grid = document.getElementById("videos-grid");
    const emptyState = document.getElementById("videos-empty-state");
    if (!grid) return;

    const filtered = this.getFilteredVideos();
    this.currentVideoList = filtered;

    if (filtered.length === 0) {
      grid.style.display = "none";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    grid.style.display = "grid";
    if (emptyState) emptyState.style.display = "none";

    const currentLang = window.languageManager?.currentLanguage || "es";

    grid.innerHTML = filtered
      .map((vid) => {
        const channel = this.getChannel(vid.channelId);
        const title = vid.title[currentLang] || vid.title.es;
        const desc = vid.description[currentLang] || vid.description.es;
        const isFav = this.favorites.has(vid.id);
        const isWtch = this.watched.has(vid.id);
        const thumbUrl = `https://img.youtube.com/vi/${vid.videoId}/hqdefault.jpg`;

        const favSvg = isFav
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-error);"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-dim);"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

        const watchedBadge = isWtch
          ? `<span class="video-card-watched-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align:-1px; margin-right:2px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Visto</span>`
          : "";

        return `
          <div class="video-card" data-video-id="${vid.id}">
            <div class="video-card-thumb-wrapper">
              <img class="video-card-thumb" src="${thumbUrl}" alt="${this.escapeHtml(title)}" loading="lazy" />
              <div class="video-card-play-overlay">
                <div class="play-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <span class="video-card-duration">${vid.duration || ""}</span>
              ${watchedBadge}
            </div>

            <div class="video-card-body">
              <div class="video-card-tags">
                <span class="video-card-level">${this.escapeHtml(vid.level)}</span>
                <span class="video-card-category">${this.escapeHtml(vid.category)}</span>
              </div>
              <h4 class="video-card-title">${this.escapeHtml(title)}</h4>
              <p class="video-card-desc">${this.escapeHtml(desc)}</p>

              <div class="video-card-footer">
                <span class="video-card-channel-name">${this.escapeHtml(channel ? channel.name : "")}</span>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                  <button type="button" class="video-card-fav-btn" title="Favorito">
                    ${favSvg}
                  </button>
                  <button type="button" class="videos-btn videos-btn-primary" style="padding:0.35rem 0.75rem; font-size:0.775rem;">
                    Reproducir
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    grid.querySelectorAll(".video-card").forEach((card) => {
      const vidId = card.dataset.videoId;
      const thumb = card.querySelector(".video-card-thumb-wrapper");
      const playBtn = card.querySelector(".videos-btn-primary");
      const favBtn = card.querySelector(".video-card-fav-btn");

      if (thumb) {
        thumb.addEventListener("click", () => this.playVideoById(vidId));
      }
      if (playBtn) {
        playBtn.addEventListener("click", () => this.playVideoById(vidId));
      }
      if (favBtn) {
        favBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleFavorite(vidId);
        });
      }
    });
  }

  playVideoById(id) {
    if (!this.data || !this.data.videos) return;
    const vid = this.data.videos.find((v) => v.id === id);
    if (vid) {
      this.playVideo(vid);
    }
  }

  playCustomVideo(videoId, rawUrl) {
    const customVid = {
      id: `custom_${videoId}`,
      videoId: videoId,
      title: {
        es: `Video de YouTube (${videoId})`,
        en: `YouTube Video (${videoId})`,
      },
      channelId: "youtube",
      level: "Enlace Personal",
      category: "Personalizado",
      duration: "YouTube",
      description: {
        es: `Reproduciendo enlace personalizado: ${rawUrl}`,
        en: `Playing custom link: ${rawUrl}`,
      },
      notes: "Video enlazado directamente por el usuario.",
    };
    this.playVideo(customVid);
  }

  playVideo(vid, startSeconds = 0) {
    const theater = document.getElementById("videos-theater-player");
    const iframe = document.getElementById("videos-iframe");
    const titleEl = document.getElementById("videos-player-title");
    const channelEl = document.getElementById("videos-player-channel");
    const levelEl = document.getElementById("videos-player-level");
    const categoryEl = document.getElementById("videos-player-category");
    const notesCard = document.getElementById("videos-notes-card");
    const notesText = document.getElementById("videos-notes-text");
    const extLink = document.getElementById("videos-channel-external-link");
    const userNotesInput = document.getElementById("videos-user-notes-input");
    const notesStatus = document.getElementById("videos-notes-saved-status");

    if (!theater || !iframe) return;

    this.currentVideoId = vid.id;
    const currentLang = window.languageManager?.currentLanguage || "es";
    const channel = this.getChannel(vid.channelId);

    // Update iframe src with start time & enablejsapi for playback speed control
    const startParam = startSeconds > 0 ? `&start=${startSeconds}` : "";
    iframe.src = `https://www.youtube-nocookie.com/embed/${vid.videoId}?enablejsapi=1&autoplay=1&rel=0${startParam}`;

    if (titleEl) titleEl.textContent = vid.title[currentLang] || vid.title.es;
    if (channelEl) channelEl.textContent = channel ? channel.name : vid.channelId;
    if (levelEl) levelEl.textContent = vid.level;
    if (categoryEl) categoryEl.textContent = vid.category;

    if (extLink) {
      extLink.href = channel
        ? channel.url
        : `https://www.youtube.com/watch?v=${vid.videoId}`;
    }

    if (vid.notes && notesCard && notesText) {
      notesText.textContent = vid.notes;
      notesCard.style.display = "block";
    } else if (notesCard) {
      notesCard.style.display = "none";
    }

    // Load saved personal notes for this video
    if (userNotesInput) {
      const savedNotes = localStorage.getItem(`hsk-video-user-notes-${vid.id}`) || "";
      userNotesInput.value = savedNotes;
      if (notesStatus) {
        notesStatus.textContent = savedNotes ? "Notas guardadas ✓" : "Listo para anotar";
      }
    }

    // Render Timestamps, Vocab Cards & Mini Quiz
    this.renderTimestamps(vid);
    this.renderVocab(vid);
    this.renderQuiz(vid);

    // Update Recently Played
    this.addRecentlyPlayed(vid);

    // Mark automatically as watched
    this.watched.add(vid.id);
    this.saveWatched();
    this.updateTheaterButtons();

    theater.style.display = "block";

    // Scroll smoothly taking sticky navigation header into account
    const navHeight = document.querySelector(".nav-container")?.offsetHeight || 60;
    const yOffset = theater.getBoundingClientRect().top + window.pageYOffset - (navHeight + 20);
    window.scrollTo({ top: Math.max(0, yOffset), behavior: "smooth" });

    // Refresh grid & recent section
    this.renderVideos();
    this.renderRecentlyPlayed();
  }

  addRecentlyPlayed(vid) {
    if (!vid || !vid.id) return;
    this.recentlyPlayed = this.recentlyPlayed.filter((v) => v.id !== vid.id);
    this.recentlyPlayed.unshift(vid);
    if (this.recentlyPlayed.length > 8) {
      this.recentlyPlayed.pop();
    }
    this.saveRecentlyPlayed();
  }

  renderTimestamps(vid) {
    const card = document.getElementById("videos-timestamps-card");
    const container = document.getElementById("videos-timestamps-list");
    if (!card || !container) return;

    if (!vid.timestamps || vid.timestamps.length === 0) {
      card.style.display = "none";
      return;
    }

    card.style.display = "block";
    container.innerHTML = vid.timestamps
      .map(
        (ts) => `
        <button type="button" class="videos-timestamp-pill" data-time="${ts.time}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>${this.escapeHtml(ts.label)}</span>
        </button>
      `
      )
      .join("");

    container.querySelectorAll(".videos-timestamp-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const seconds = parseInt(btn.dataset.time, 10) || 0;
        this.playVideo(vid, seconds);
      });
    });
  }

  renderVocab(vid) {
    const card = document.getElementById("videos-vocab-card");
    const container = document.getElementById("videos-vocab-list");
    if (!card || !container) return;

    if (!vid.vocab || vid.vocab.length === 0) {
      card.style.display = "none";
      return;
    }

    card.style.display = "block";
    container.innerHTML = vid.vocab
      .map(
        (item) => `
        <div class="videos-vocab-item">
          <div class="videos-vocab-header">
            <span class="videos-vocab-hanzi">${this.escapeHtml(item.hanzi)}</span>
            <span class="videos-vocab-level-badge">${this.escapeHtml(item.level)}</span>
          </div>
          <div class="videos-vocab-pinyin">${this.escapeHtml(item.pinyin)}</div>
          <div class="videos-vocab-meaning">${this.escapeHtml(item.meaning)}</div>
          <div class="videos-vocab-actions" style="display:flex; flex-direction:column; gap:0.4rem;">
            <button type="button" class="videos-btn videos-btn-outline vocab-speak-btn" data-hanzi="${this.escapeHtml(item.hanzi)}" title="Escuchar pronunciación">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              Escuchar
            </button>
            <button type="button" class="videos-btn videos-btn-secondary vocab-shadowing-btn" data-hanzi="${this.escapeHtml(item.hanzi)}" title="Modo Shadowing con Micrófono">
              🎙️ Repetir (Shadowing)
            </button>
            <button type="button" class="videos-btn videos-btn-primary vocab-add-srs-btn" data-hanzi="${this.escapeHtml(item.hanzi)}" data-pinyin="${this.escapeHtml(item.pinyin)}" data-meaning="${this.escapeHtml(item.meaning)}" title="Agregar a Mis Tarjetas SRS">
              + Agregar a SRS
            </button>
          </div>
        </div>
      `
      )
      .join("");

    container.querySelectorAll(".vocab-speak-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const hanzi = btn.dataset.hanzi;
        this.speakChinese(hanzi);
      });
    });

    container.querySelectorAll(".vocab-shadowing-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const hanzi = btn.dataset.hanzi;
        this.speakChinese(hanzi);
        setTimeout(() => {
          if (this.app.interactionController) {
            this.app.interactionController.startSpeechRecognition();
          }
        }, 1000);
      });
    });

    container.querySelectorAll(".vocab-add-srs-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const hanzi = btn.dataset.hanzi;
        const pinyin = btn.dataset.pinyin;
        const meaning = btn.dataset.meaning;

        if (this.app && typeof this.app.showNotification === "function") {
          this.app.showNotification(`"${hanzi}" (${pinyin} - ${meaning}) agregada a tus Tarjetas SRS`, "success");
        }
      });
    });
  }

  speakChinese(text) {
    if (!text) return;
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else if (this.app && typeof this.app.showNotification === "function") {
      this.app.showNotification("Síntesis de voz no disponible", "info");
    }
  }

  renderQuiz(vid) {
    const card = document.getElementById("videos-quiz-card");
    const container = document.getElementById("videos-quiz-box");
    if (!card || !container) return;

    if (!vid.quiz || vid.quiz.length === 0) {
      card.style.display = "none";
      return;
    }

    card.style.display = "block";
    const q = vid.quiz[0];

    container.innerHTML = `
      <div class="videos-quiz-question">${this.escapeHtml(q.question)}</div>
      <div class="videos-quiz-options">
        ${q.options
          .map(
            (opt, idx) => `
          <button type="button" class="videos-quiz-opt-btn" data-idx="${idx}">
            ${this.escapeHtml(opt)}
          </button>
        `
          )
          .join("")}
      </div>
      <div id="videos-quiz-feedback" class="videos-quiz-feedback" style="display: none;"></div>
    `;

    container.querySelectorAll(".videos-quiz-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const selectedIdx = parseInt(btn.dataset.idx, 10);
        const feedbackEl = document.getElementById("videos-quiz-feedback");

        container.querySelectorAll(".videos-quiz-opt-btn").forEach((b) => {
          b.disabled = true;
        });

        if (selectedIdx === q.answer) {
          btn.classList.add("correct");
          if (feedbackEl) {
            feedbackEl.className = "videos-quiz-feedback correct";
            feedbackEl.textContent = `¡Correcto! ${q.explanation || ""}`;
            feedbackEl.style.display = "block";
          }
        } else {
          btn.classList.add("incorrect");
          const correctBtn = container.querySelector(
            `.videos-quiz-opt-btn[data-idx="${q.answer}"]`
          );
          if (correctBtn) correctBtn.classList.add("correct");
          if (feedbackEl) {
            feedbackEl.className = "videos-quiz-feedback incorrect";
            feedbackEl.textContent = `Incorrecto. ${q.explanation || ""}`;
            feedbackEl.style.display = "block";
          }
        }
      });
    });
  }

  updateTheaterButtons() {
    if (!this.currentVideoId) return;
    const favText = document.getElementById("videos-favorite-text");
    const watchText = document.getElementById("videos-watched-text");
    const favIconBox = document.getElementById("videos-favorite-icon-box");
    const watchIconBox = document.getElementById("videos-watched-icon-box");

    const isFav = this.favorites.has(this.currentVideoId);
    const isWtch = this.watched.has(this.currentVideoId);

    if (favIconBox) {
      favIconBox.innerHTML = isFav
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-error);"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
    }

    if (watchIconBox) {
      watchIconBox.innerHTML = isWtch
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-success);"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }

    if (favText) favText.textContent = isFav ? "En Favoritos" : "Favorito";
    if (watchText) watchText.textContent = isWtch ? "Visto" : "Marcar visto";
  }

  playPreviousVideo() {
    if (!this.currentVideoId || this.currentVideoList.length === 0) return;
    const idx = this.currentVideoList.findIndex((v) => v.id === this.currentVideoId);
    if (idx > 0) {
      this.playVideo(this.currentVideoList[idx - 1]);
    } else {
      this.playVideo(this.currentVideoList[this.currentVideoList.length - 1]);
    }
  }

  playNextVideo() {
    if (!this.currentVideoId || this.currentVideoList.length === 0) return;
    const idx = this.currentVideoList.findIndex((v) => v.id === this.currentVideoId);
    if (idx >= 0 && idx < this.currentVideoList.length - 1) {
      this.playVideo(this.currentVideoList[idx + 1]);
    } else {
      this.playVideo(this.currentVideoList[0]);
    }
  }

  closePlayer() {
    const theater = document.getElementById("videos-theater-player");
    const iframe = document.getElementById("videos-iframe");
    if (iframe) iframe.src = "";
    if (theater) theater.style.display = "none";
    this.currentVideoId = null;
  }

  toggleFavorite(vidId) {
    if (this.favorites.has(vidId)) {
      this.favorites.delete(vidId);
    } else {
      this.favorites.add(vidId);
    }
    this.saveFavorites();
    this.renderVideos();
  }

  toggleWatched(vidId, forceState) {
    if (forceState !== undefined) {
      if (forceState) this.watched.add(vidId);
      else this.watched.delete(vidId);
    } else if (this.watched.has(vidId)) {
      this.watched.delete(vidId);
    } else {
      this.watched.add(vidId);
    }
    this.saveWatched();
    this.renderVideos();
  }

  escapeHtml(str) {
    if (typeof window.escapeHtml === "function") {
      return window.escapeHtml(str);
    }
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

window.VideosController = VideosController;
