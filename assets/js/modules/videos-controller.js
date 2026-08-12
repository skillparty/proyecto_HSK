/**
 * VideosController Module - Manages YouTube Videos & Channels for HSK Learning
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
    this.favorites = new Set();
    this.watched = new Set();
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
  }

  parseYouTubeId(urlOrId) {
    if (!urlOrId) return null;
    const str = urlOrId.trim();

    // If it's a URL or contains slashes/dots, extract YouTube ID
    if (str.includes("://") || str.includes("www.") || str.includes("/") || str.includes(".")) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = str.match(regExp);
      return match && match[2] && match[2].length === 11 ? match[2] : null;
    }

    // Direct 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }

    return null;
  }

  renderChannels() {
    const container = document.getElementById("videos-channels-list");
    if (!container || !this.data || !this.data.channels) return;

    const currentLang = window.languageManager?.currentLanguage || "es";

    container.innerHTML = this.data.channels
      .map((ch) => {
        const desc = ch.description[currentLang] || ch.description.es;
        const isActive = this.activeChannel === ch.id;
        return `
          <div class="videos-channel-card ${isActive ? "active" : ""}" data-channel-id="${ch.id}">
            <div class="videos-channel-top">
              <div class="videos-channel-avatar" style="border-color: ${ch.badgeColor || "var(--color-primary)"};">
                ${ch.avatar || "🇨🇳"}
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

  getFilteredVideos() {
    if (!this.data || !this.data.videos) return [];
    const currentLang = window.languageManager?.currentLanguage || "es";

    return this.data.videos.filter((vid) => {
      // Channel filter
      if (this.activeChannel !== "all" && vid.channelId !== this.activeChannel) {
        return false;
      }

      // Category / Level / Custom Filter
      if (this.activeFilter === "favorites") {
        if (!this.favorites.has(vid.id)) return false;
      } else if (this.activeFilter === "watched") {
        if (!this.watched.has(vid.id)) return false;
      } else if (this.activeFilter !== "all") {
        const matchesCategory = vid.category === this.activeFilter;
        const matchesLevel = vid.level === this.activeFilter;
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
              ${isWtch ? `<span class="video-card-watched-badge">✓ Visto</span>` : ""}
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
                    ${isFav ? "❤️" : "🤍"}
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

  playVideo(vid) {
    const theater = document.getElementById("videos-theater-player");
    const iframe = document.getElementById("videos-iframe");
    const titleEl = document.getElementById("videos-player-title");
    const channelEl = document.getElementById("videos-player-channel");
    const levelEl = document.getElementById("videos-player-level");
    const categoryEl = document.getElementById("videos-player-category");
    const notesCard = document.getElementById("videos-notes-card");
    const notesText = document.getElementById("videos-notes-text");
    const extLink = document.getElementById("videos-channel-external-link");

    if (!theater || !iframe) return;

    this.currentVideoId = vid.id;
    const currentLang = window.languageManager?.currentLanguage || "es";
    const channel = this.getChannel(vid.channelId);

    // Update iframe src with no-cookie privacy domain
    iframe.src = `https://www.youtube-nocookie.com/embed/${vid.videoId}?autoplay=1&rel=0`;

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

    // Mark automatically as watched
    this.watched.add(vid.id);
    this.saveWatched();
    this.updateTheaterButtons();

    theater.style.display = "block";
    theater.scrollIntoView({ behavior: "smooth", block: "start" });

    // Refresh grid to show watched status badge
    this.renderVideos();
  }

  updateTheaterButtons() {
    if (!this.currentVideoId) return;
    const favText = document.getElementById("videos-favorite-text");
    const watchText = document.getElementById("videos-watched-text");
    const favIcon = document.querySelector("#videos-favorite-btn .favorite-icon");

    const isFav = this.favorites.has(this.currentVideoId);
    const isWtch = this.watched.has(this.currentVideoId);

    if (favIcon) favIcon.textContent = isFav ? "❤️" : "🤍";
    if (favText) favText.textContent = isFav ? "En Favoritos" : "Favorito";
    if (watchText) watchText.textContent = isWtch ? "Visto ✓" : "Marcar visto";
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
    if (iframe) iframe.src = ""; // Stops playback & audio completely
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
