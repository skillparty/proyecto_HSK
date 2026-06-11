/**
 * SRSEngine Module - Spaced Repetition System (simplified SM-2)
 *
 * Per-word scheduling state, local-first (localStorage).
 * Ratings: "again" | "hard" | "good" | "easy"
 *
 * Record shape (per word):
 *   reps     - consecutive successful reviews
 *   interval - current interval in days (0 = learning step, due in minutes)
 *   ease     - ease factor (1.3 .. 2.8), starts at 2.5
 *   due      - next review timestamp (ms)
 *   lapses   - times the word was forgotten after being learned
 *   last     - last review timestamp (ms)
 */
class SRSEngine {
  static get STORAGE_KEY() {
    return "hsk-srs-v1";
  }

  static get DEFAULTS() {
    return {
      START_EASE: 2.5,
      MIN_EASE: 1.3,
      MAX_EASE: 2.8,
      EASY_BONUS: 1.3,
      HARD_FACTOR: 1.2,
      MAX_INTERVAL_DAYS: 365,
      LEARNING_STEP_MS: 10 * 60 * 1000, // relearn in 10 minutes
      DAY_MS: 24 * 60 * 60 * 1000,
      NEW_LIMIT: 20,
    };
  }

  constructor(app) {
    this.app = app;
    this.records = this.loadRecords();
    this._syncTimer = null;
    this.app.logDebug(
      `🧠 SRSEngine initialized (${Object.keys(this.records).length} word records)`,
    );
  }

  // --- Persistence -------------------------------------------------------

  loadRecords() {
    try {
      const raw = localStorage.getItem(SRSEngine.STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      this.app.logWarn("SRSEngine: could not load records:", error);
      return {};
    }
  }

  saveRecords() {
    try {
      localStorage.setItem(
        SRSEngine.STORAGE_KEY,
        JSON.stringify(this.records),
      );
    } catch (error) {
      this.app.logWarn("SRSEngine: could not save records:", error);
    }
    this._scheduleSyncToFirebase();
  }

  _scheduleSyncToFirebase() {
    if (!window.firebaseClient || !window.firebaseClient.user) return;
    clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => {
      window.firebaseClient.saveSRSRecords(this.records).catch(() => {});
    }, 3000);
  }

  /**
   * Merge remote records into local: per-key, keep the one with later `last` timestamp.
   * Call this after loading from Firestore on login.
   */
  mergeRemoteRecords(remoteRecords) {
    if (!remoteRecords || typeof remoteRecords !== "object") return;
    let changed = false;
    for (const [key, remote] of Object.entries(remoteRecords)) {
      const local = this.records[key];
      if (!local || (remote.last || 0) > (local.last || 0)) {
        this.records = { ...this.records, [key]: remote };
        changed = true;
      }
    }
    if (changed) {
      try {
        localStorage.setItem(SRSEngine.STORAGE_KEY, JSON.stringify(this.records));
      } catch (_) {}
      this.app.logDebug(`🧠 SRS merged ${Object.keys(remoteRecords).length} remote records`);
    }
  }

  async syncFromFirebase() {
    if (!window.firebaseClient || !window.firebaseClient.user) return;
    try {
      const remote = await window.firebaseClient.loadSRSRecords();
      if (remote) this.mergeRemoteRecords(remote);
      // Push merged state back so all devices stay consistent
      await window.firebaseClient.saveSRSRecords(this.records);
    } catch (error) {
      this.app.logWarn("SRSEngine: Firebase sync error:", error);
    }
  }

  // --- Keys & lookup -----------------------------------------------------

  getWordKey(word) {
    if (!word || !word.character) return null;
    const level = Number(word.level || 0) || 0;
    return `${level}:${word.character}`;
  }

  getRecord(word) {
    const key = this.getWordKey(word);
    return key ? this.records[key] || null : null;
  }

  isNew(word) {
    return !this.getRecord(word);
  }

  isDue(word, now = Date.now()) {
    const record = this.getRecord(word);
    return Boolean(record && record.due <= now);
  }

  // --- Scheduling (SM-2 simplified) --------------------------------------

  /**
   * Rate a word and persist its new schedule.
   * @param {object} word    Vocabulary entry (needs character + level)
   * @param {string} rating  "again" | "hard" | "good" | "easy"
   * @returns {object|null}  The new record, or null if word is invalid
   */
  rate(word, rating) {
    const key = this.getWordKey(word);
    if (!key) return null;

    const D = SRSEngine.DEFAULTS;
    const now = Date.now();
    const prev = this.records[key] || {
      reps: 0,
      interval: 0,
      ease: D.START_EASE,
      due: now,
      lapses: 0,
      last: 0,
    };

    let { reps, interval, ease, lapses } = prev;

    switch (rating) {
      case "again":
        if (reps > 0) lapses += 1;
        reps = 0;
        interval = 0;
        ease = Math.max(D.MIN_EASE, ease - 0.2);
        break;
      case "hard":
        reps += 1;
        ease = Math.max(D.MIN_EASE, ease - 0.15);
        interval = interval < 1 ? 1 : Math.max(interval + 1, interval * D.HARD_FACTOR);
        break;
      case "easy":
        reps += 1;
        ease = Math.min(D.MAX_EASE, ease + 0.15);
        interval = interval < 1 ? 3 : interval * ease * D.EASY_BONUS;
        break;
      case "good":
      default:
        reps += 1;
        interval = interval < 1 ? 1 : interval * ease;
        break;
    }

    interval = Math.min(Math.round(interval * 10) / 10, D.MAX_INTERVAL_DAYS);

    const due =
      interval < 1 ? now + D.LEARNING_STEP_MS : now + Math.round(interval * D.DAY_MS);

    const next = { reps, interval, ease: Math.round(ease * 100) / 100, due, lapses, last: now };
    this.records = { ...this.records, [key]: next };
    this.saveRecords();

    this.app.logDebug(
      `🧠 SRS rated "${word.character}" as ${rating} → interval ${interval}d, due ${new Date(due).toLocaleString()}`,
    );
    return next;
  }

  // --- Queue building ----------------------------------------------------

  getDueWords(words, now = Date.now()) {
    return words
      .filter((word) => this.isDue(word, now))
      .sort((a, b) => (this.getRecord(a).due || 0) - (this.getRecord(b).due || 0));
  }

  getNewWords(words) {
    return words.filter((word) => this.isNew(word));
  }

  /**
   * Build a study queue: overdue words first (oldest due first),
   * then up to `newLimit` unseen words in their given order.
   */
  buildQueue(words, { newLimit = SRSEngine.DEFAULTS.NEW_LIMIT, now = Date.now() } = {}) {
    const due = this.getDueWords(words, now);
    const fresh = this.getNewWords(words).slice(0, Math.max(0, newLimit));
    return [...due, ...fresh];
  }

  /**
   * Words already learned but not yet due, soonest first.
   * Used as "early review" fallback when the queue is empty.
   */
  getUpcomingWords(words, now = Date.now()) {
    return words
      .filter((word) => {
        const record = this.getRecord(word);
        return record && record.due > now;
      })
      .sort((a, b) => (this.getRecord(a).due || 0) - (this.getRecord(b).due || 0));
  }

  /**
   * Returns a weighted copy of `words` for use as a game word pool.
   * Due words appear 2x, lapsed (forgotten) words appear 3x,
   * so random-pick games naturally encounter weak words more often.
   * All original words always stay in the pool — no words are removed.
   */
  getWeightedGamePool(words, now = Date.now()) {
    if (!words || words.length === 0) return words;
    const pool = [];
    for (const word of words) {
      const record = this.getRecord(word);
      pool.push(word);
      if (record && record.due <= now) {
        pool.push(word); // +1 for due
        if (record.lapses > 0) pool.push(word); // +1 more for lapsed
      }
    }
    return pool;
  }

  /**
   * Summary counts for dashboards / home screen.
   * @returns {{due: number, fresh: number, learned: number, total: number}}
   */
  getSummary(words, now = Date.now()) {
    let due = 0;
    let fresh = 0;
    let learned = 0;
    for (const word of words) {
      const record = this.getRecord(word);
      if (!record) {
        fresh += 1;
      } else if (record.due <= now) {
        due += 1;
      } else {
        learned += 1;
      }
    }
    return { due, fresh, learned, total: words.length };
  }
}

window.SRSEngine = SRSEngine;
