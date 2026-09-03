/**
 * HandsFreeController - Auto-play audio review mode with MediaSession API integration.
 * Perfect for mobile commuters, runners, and walkers studying with headphones.
 */
class HandsFreeController {
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.isPlaying = false;
        this.intervalMs = 5000;
        this.timer = null;
        this.audioElement = null;
    }

    init() {
        const toggleBtn = document.getElementById("hands-free-toggle-btn");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => this.toggle());
        }

        const playBtn = document.getElementById("hf-play-btn");
        const nextBtn = document.getElementById("hf-next-btn");
        const prevBtn = document.getElementById("hf-prev-btn");
        const closeBtn = document.getElementById("hf-close-btn");
        const speedSelect = document.getElementById("hf-speed-select");

        if (playBtn) playBtn.addEventListener("click", () => this.togglePlayback());
        if (nextBtn) nextBtn.addEventListener("click", () => this.next());
        if (prevBtn) prevBtn.addEventListener("click", () => this.previous());
        if (closeBtn) closeBtn.addEventListener("click", () => this.stop());
        if (speedSelect) {
            speedSelect.addEventListener("change", (e) => {
                this.intervalMs = parseInt(e.target.value, 10) || 5000;
            });
        }

        this.setupMediaSession();
    }

    setupMediaSession() {
        if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

        try {
            navigator.mediaSession.setActionHandler("play", () => this.resume());
            navigator.mediaSession.setActionHandler("pause", () => this.pause());
            navigator.mediaSession.setActionHandler("nexttrack", () => this.next());
            navigator.mediaSession.setActionHandler("previoustrack", () => this.previous());
        } catch {
            // Some platforms may throw on certain action handlers
        }
    }

    ensureAudioKeepAlive() {
        if (typeof document === "undefined") return;
        if (!this.audioElement) {
            this.audioElement = document.createElement("audio");
            // 1-second silent WAV loop to keep media session active on iOS and Android lock screen
            this.audioElement.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
            this.audioElement.loop = true;
        }
        try {
            this.audioElement.play().catch(() => {});
        } catch {
            // Autoplay policy prevented playback
        }
    }

    updateMediaSessionMetadata(word) {
        if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !word) return;

        const isEs = this.app.currentLanguage !== "en";
        const meaning = isEs ? (word.spanish || word.meaning || "") : (word.english || word.meaning || "");

        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `${word.character}  [${word.pinyin}]`,
                artist: `${meaning}  ·  HSK ${word.level || 1}`,
                album: "Confuc10++ HSK Learning",
                artwork: [
                    { src: "assets/images/logo05.png", sizes: "512x512", type: "image/png" }
                ]
            });
            navigator.mediaSession.playbackState = this.isPlaying ? "playing" : "paused";
        } catch {
            // MediaMetadata constructor not available in some environments
        }
    }

    toggle() {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        this.isActive = true;
        this.isPlaying = true;
        this.ensureAudioKeepAlive();

        const player = document.getElementById("hands-free-player");
        if (player) player.style.display = "flex";

        const toggleBtn = document.getElementById("hands-free-toggle-btn");
        if (toggleBtn) {
            toggleBtn.classList.add("active");
            toggleBtn.classList.add("btn-primary");
            toggleBtn.classList.remove("btn-outline-primary");
        }

        this.updatePlayerUI();
        this.runCycle();
    }

    stop() {
        this.isActive = false;
        this.isPlaying = false;
        clearTimeout(this.timer);

        if (this.audioElement) {
            try { this.audioElement.pause(); } catch { void 0; }
        }

        const player = document.getElementById("hands-free-player");
        if (player) player.style.display = "none";

        const toggleBtn = document.getElementById("hands-free-toggle-btn");
        if (toggleBtn) {
            toggleBtn.classList.remove("active");
            toggleBtn.classList.remove("btn-primary");
            toggleBtn.classList.add("btn-outline-primary");
        }

        if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "none";
        }
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.resume();
        }
    }

    pause() {
        this.isPlaying = false;
        clearTimeout(this.timer);
        this.updatePlayPauseIcon();
        if (this.audioElement) {
            try { this.audioElement.pause(); } catch { void 0; }
        }
        if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "paused";
        }
    }

    resume() {
        this.isPlaying = true;
        this.ensureAudioKeepAlive();
        this.updatePlayPauseIcon();
        if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "playing";
        }
        this.runCycle();
    }

    next() {
        clearTimeout(this.timer);
        if (this.app.flashcardManager) {
            this.app.flashcardManager.nextCard();
        }
        this.updatePlayerUI();
        if (this.isPlaying) {
            this.runCycle();
        }
    }

    previous() {
        clearTimeout(this.timer);
        if (this.app.flashcardManager) {
            this.app.flashcardManager.previousCard();
        }
        this.updatePlayerUI();
        if (this.isPlaying) {
            this.runCycle();
        }
    }

    updatePlayerUI() {
        const word = this.app.currentWord;
        if (!word) return;

        const charEl = document.getElementById("hf-char");
        const pinyinEl = document.getElementById("hf-pinyin");
        const meaningEl = document.getElementById("hf-meaning");

        const isEs = this.app.currentLanguage !== "en";
        const meaning = isEs ? (word.spanish || word.meaning || "") : (word.english || word.meaning || "");

        if (charEl) charEl.textContent = word.character || "";
        if (pinyinEl) pinyinEl.textContent = word.pinyin || "";
        if (meaningEl) meaningEl.textContent = meaning;

        this.updatePlayPauseIcon();
        this.updateMediaSessionMetadata(word);
    }

    updatePlayPauseIcon() {
        const playIcon = document.getElementById("hf-play-icon");
        const pauseIcon = document.getElementById("hf-pause-icon");
        if (playIcon && pauseIcon) {
            playIcon.style.display = this.isPlaying ? "none" : "block";
            pauseIcon.style.display = this.isPlaying ? "block" : "none";
        }
    }

    runCycle() {
        if (!this.isActive || !this.isPlaying) return;
        const word = this.app.currentWord;
        if (!word) return;

        this.updatePlayerUI();

        // 1. Pronounce Chinese word
        if (this.app.audioController) {
            this.app.audioController.playAudio(word.character);
        }

        // 2. Schedule flip & meaning, then auto-advance
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (!this.isActive || !this.isPlaying) return;

            if (this.app.flashcardManager && !this.app.flashcardManager.isFlipped) {
                this.app.flashcardManager.flipCard();
            }

            this.speakMeaning(word);

            this.timer = setTimeout(() => {
                if (!this.isActive || !this.isPlaying) return;
                this.next();
            }, this.intervalMs);

        }, 1600);
    }

    speakMeaning(word) {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        const isEs = this.app.currentLanguage !== "en";
        const text = isEs ? (word.spanish || word.meaning || "") : (word.english || word.meaning || "");
        if (!text) return;

        try {
            const utterance = new SpeechSynthesisUtterance(text.split(";")[0].split(",")[0].trim());
            utterance.lang = isEs ? "es-ES" : "en-US";
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        } catch {
            // Speech synthesis failed or blocked
        }
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = HandsFreeController;
}
