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
      ALGORITHM: "sm2", // "sm2" | "fsrs"
      REQUESTED_RETENTION: 0.9,
      // FSRS default weights (optimized for language learning)
      FSRS_WEIGHTS: [
        0.4, 0.9, 2.4, 5.8, // w0-w3: initial stability for again, hard, good, easy
        4.93, 0.94, // w4-w5: initial difficulty
        0.86, 0.01, // w6-w7: difficulty adjustment and mean reversion
        1.49, 0.14, 0.94, // w8-w10: stability recall factors
        2.18, 0.05, 0.34, 1.26, // w11-w14: stability lapse factors
      ],
    };
  }

  constructor(app) {
    this.app = app;
    this.records = this.loadRecords();
    this.algorithm = this.loadAlgorithmPreference();
    this._syncTimer = null;
    this.hydrateFromIndexedDB();
    this.app.logDebug(
      `🧠 SRSEngine initialized (${Object.keys(this.records).length} word records, algorithm: ${this.algorithm})`,
    );
  }

  loadAlgorithmPreference() {
    try {
      const saved = localStorage.getItem("hsk-srs-algorithm");
      return saved === "fsrs" ? "fsrs" : "sm2";
    } catch {
      return "sm2";
    }
  }

  setAlgorithm(algorithm) {
    this.algorithm = algorithm === "fsrs" ? "fsrs" : "sm2";
    try {
      localStorage.setItem("hsk-srs-algorithm", this.algorithm);
    } catch {
      void 0;
    }
    this.app.logDebug(`🧠 SRS algorithm set to: ${this.algorithm}`);
    return this.algorithm;
  }

  getAlgorithm() {
    return this.algorithm || "sm2";
  }

  async hydrateFromIndexedDB() {
    if (!window.idbStorage) return;
    try {
      const idbRecords = await window.idbStorage.get(SRSEngine.STORAGE_KEY);
      if (idbRecords && typeof idbRecords === "object") {
        this.mergeRemoteRecords(idbRecords);
      }
    } catch (err) {
      this.app.logWarn("SRSEngine: IndexedDB hydration error:", err);
    }
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
      this.app.logWarn("SRSEngine: could not save records to localStorage:", error);
    }

    // Mirror to IndexedDB for robust large storage
    try {
      window.idbStorage?.set?.(SRSEngine.STORAGE_KEY, this.records);
    } catch {
      void 0;
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
      } catch {
        // Storage bloqueado (modo privado, cuota llena): el merge ya está en
        // memoria, así que la sesión sigue; solo no persiste.
      }
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
   * Rate a word and persist its new schedule according to the active algorithm (SM-2 or FSRS).
   * @param {object} word    Vocabulary entry (needs character + level)
   * @param {string} rating  "again" | "hard" | "good" | "easy"
   * @returns {object|null}  The new record, or null if word is invalid
   */
  rate(word, rating) {
    if (this.algorithm === "fsrs") {
      return this.rateFSRS(word, rating);
    }
    return this.rateSM2(word, rating);
  }

  rateSM2(word, rating) {
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

  rateFSRS(word, rating) {
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
      stability: 0,
      difficulty: 0,
    };

    const gradeMap = { again: 1, hard: 2, good: 3, easy: 4 };
    const grade = gradeMap[rating] || 3;
    const weights = D.FSRS_WEIGHTS;

    let reps = prev.reps;
    let lapses = prev.lapses || 0;
    let stability = prev.stability || 0;
    let difficulty = prev.difficulty || 0;
    let interval = 0;

    const isFirstReview = reps === 0 && (!prev.last || prev.last === 0);

    if (isFirstReview) {
      stability = Math.max(0.1, weights[grade - 1] || 2.4);
      const initDiff = weights[4] - Math.exp(weights[5] * (grade - 1)) + 1;
      difficulty = Math.max(1, Math.min(10, Math.round(initDiff * 100) / 100));

      if (grade === 1) {
        reps = 0;
        interval = 0;
      } else {
        reps = 1;
        interval = Math.max(1, Math.round(stability));
      }
    } else {
      const elapsedDays = Math.max(0, (now - (prev.last || now)) / D.DAY_MS);
      const S = Math.max(0.1, stability);
      const retrievability = Math.max(0.01, Math.min(1.0, Math.pow(0.9, elapsedDays / S)));

      const targetD = difficulty - weights[6] * (grade - 3);
      const meanReversion = weights[7] * (weights[4] || 5.0) + (1 - weights[7]) * targetD;
      difficulty = Math.max(1, Math.min(10, Math.round(meanReversion * 100) / 100));

      if (grade === 1) {
        lapses += 1;
        reps = 0;
        interval = 0;
        const lapseS = weights[11] * Math.pow(difficulty, -weights[12]) * (Math.pow(S + 1, weights[13]) - 1) * Math.exp(weights[14] * (1 - retrievability));
        stability = Math.max(0.2, Math.min(S, Math.round(lapseS * 100) / 100));
      } else {
        reps += 1;
        const gradeBonus = grade === 2 ? 0.8 : (grade === 4 ? 1.3 : 1.0);
        const hardPenalty = grade === 2 ? 0.7 : 1.0;
        const recallS = S * (1 + Math.exp(weights[8]) * (11 - difficulty) * Math.pow(S, -weights[9]) * (Math.exp(weights[10] * (1 - retrievability)) - 1) * gradeBonus * hardPenalty);
        stability = Math.max(S + 0.1, Math.round(recallS * 100) / 100);

        const rTarget = D.REQUESTED_RETENTION || 0.9;
        const targetInterval = stability * (Math.log(rTarget) / Math.log(0.9));
        interval = Math.max(1, Math.round(targetInterval));
      }
    }

    interval = Math.min(interval, D.MAX_INTERVAL_DAYS);
    const due = interval < 1 ? now + D.LEARNING_STEP_MS : now + Math.round(interval * D.DAY_MS);
    const ease = prev.ease || D.START_EASE;

    const next = {
      reps,
      interval,
      ease,
      due,
      lapses,
      last: now,
      stability: Math.round(stability * 100) / 100,
      difficulty: Math.round(difficulty * 100) / 100,
      algorithm: "fsrs",
    };

    this.records = { ...this.records, [key]: next };
    this.saveRecords();

    this.app.logDebug(
      `🧠 SRS (FSRS) rated "${word.character}" as ${rating} → interval ${interval}d (S: ${next.stability}, D: ${next.difficulty}), due ${new Date(due).toLocaleString()}`,
    );
    return next;
  }

  getRetrievability(word, now = Date.now()) {
    const record = this.getRecord(word);
    if (!record || !record.last || record.last === 0) return 0;
    const elapsedDays = Math.max(0, (now - record.last) / SRSEngine.DEFAULTS.DAY_MS);
    if (record.stability && record.stability > 0) {
      return Math.max(0, Math.min(1, Math.round(Math.pow(0.9, elapsedDays / record.stability) * 100) / 100));
    }
    const intervalDays = Math.max(0.5, record.interval || 1);
    return Math.max(0, Math.min(1, Math.round(Math.pow(0.9, elapsedDays / intervalDays) * 100) / 100));
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
