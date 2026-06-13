/**
 * FlashcardManager Module - Handles HSK study sessions
 * Extracted from app.js as part of modularization
 */
class FlashcardManager {
  constructor(app) {
    this.app = app;
    this.currentSession = [];
    this.sessionIndex = 0;
    this.currentWord = null;
    this.isFlipped = false;
    this.revealStep = 0;
    this.waitingForNext = false;

    this.app.logDebug("🃏 FlashcardManager module initialized");
  }

  setupSession() {
    // Wait for vocabulary to load through app orchestrator
    if (!this.app.vocabulary || this.app.vocabulary.length === 0) {
      this.app.logDebug(
        "⏳ FlashcardManager: vocabulary not ready, waiting for hsk:vocabulary-ready event",
      );
      window.addEventListener(
        "hsk:vocabulary-ready",
        () => this.setupSession(),
        { once: true },
      );
      return;
    }

    const level = this.app.currentLevel;
    const levelFilter =
      level === "all"
        ? this.app.vocabulary
        : this.app.vocabulary.filter((word) => word.level == level);

    this.currentSession = this.buildSessionOrder(levelFilter, level);
    this.sessionIndex = 0;

    if (this.currentSession.length > 0) {
      this.currentWord = this.currentSession[0];
      this.isFlipped = false;

      // Sync session data to app for backward compatibility
      this.app.currentSession = this.currentSession;
      this.app.sessionIndex = this.sessionIndex;
      this.app.currentWord = this.currentWord;
      this.app.isFlipped = this.isFlipped;

      this.updateCard();
      this.app.updateProgress();
      this.app.logDebug(
        `[書] Practice session setup: ${this.currentSession.length} words for level ${level}`,
      );
    } else {
      this.handleNoVocabulary(level);
    }
  }

  getBookRank(bookValue) {
    const book = String(bookValue || "")
      .trim()
      .toLowerCase();
    if (!book) return 1;

    if (
      [
        "shang",
        "s",
        "upper",
        "up",
        "1",
        "vol1",
        "book1",
        "上",
        "上册",
      ].includes(book)
    )
      return 1;
    if (
      [
        "xia",
        "x",
        "lower",
        "down",
        "2",
        "vol2",
        "book2",
        "下",
        "下册",
      ].includes(book)
    )
      return 2;

    const numeric = Number(book);
    return Number.isFinite(numeric) ? numeric : 1;
  }

  getLessonNumber(word) {
    const lesson = Number(word.lesson ?? word.lessonNumber ?? word.unit ?? 0);
    return Number.isFinite(lesson) ? lesson : 0;
  }

  getLessonSequence(word) {
    const sequence = Number(
      word.lessonOrder ?? word.orderInLesson ?? word.sequence ?? 0,
    );
    return Number.isFinite(sequence) ? sequence : 0;
  }

  hasBookLessonMetadata(word) {
    return Boolean(
      word.book !== undefined ||
      word.bookPart !== undefined ||
      word.volume !== undefined ||
      word.lesson !== undefined ||
      word.lessonNumber !== undefined ||
      word.unit !== undefined ||
      word.lessonOrder !== undefined ||
      word.orderInLesson !== undefined ||
      word.sequence !== undefined,
    );
  }

  sortForPractice(words, selectedLevel) {
    const withIndex = words.map((word, index) => ({ word, index }));

    withIndex.sort((a, b) => {
      const aWord = a.word;
      const bWord = b.word;

      const aLevel = Number(aWord.level || 0);
      const bLevel = Number(bWord.level || 0);
      if (selectedLevel === "all" && aLevel !== bLevel) {
        return aLevel - bLevel;
      }

      const aHasMetadata = this.hasBookLessonMetadata(aWord);
      const bHasMetadata = this.hasBookLessonMetadata(bWord);
      
      if (aHasMetadata && bHasMetadata) {
        const aBookRank = this.getBookRank(
          aWord.book ?? aWord.bookPart ?? aWord.volume,
        );
        const bBookRank = this.getBookRank(
          bWord.book ?? bWord.bookPart ?? bWord.volume,
        );
        if (aBookRank !== bBookRank) return aBookRank - bBookRank;

        const aLesson = this.getLessonNumber(aWord);
        const bLesson = this.getLessonNumber(bWord);
        if (aLesson !== bLesson) return aLesson - bLesson;

        const aSequence = this.getLessonSequence(aWord);
        const bSequence = this.getLessonSequence(bWord);
        if (aSequence !== bSequence) return aSequence - bSequence;
      } else if (aHasMetadata && !bHasMetadata) {
        return -1;
      } else if (!aHasMetadata && bHasMetadata) {
        return 1;
      }

      const aOrder = Number.isFinite(Number(aWord._sourceOrder))
        ? Number(aWord._sourceOrder)
        : a.index;
      const bOrder = Number.isFinite(Number(bWord._sourceOrder))
        ? Number(bWord._sourceOrder)
        : b.index;
      if (aOrder !== bOrder) return aOrder - bOrder;

      return a.index - b.index;
    });

    return withIndex.map((entry) => entry.word);
  }

  shuffleWords(words) {
    const items = [...words];
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  buildSessionOrder(words, selectedLevel) {
    const mode = this.app.practiceOrderMode || "lesson";
    if (mode === "mixed") {
      return this.shuffleWords(words);
    }
    if (mode === "srs" && this.app.srsEngine) {
      return this.buildSrsQueue(words, selectedLevel);
    }
    return this.sortForPractice(words, selectedLevel);
  }

  buildSrsQueue(words, selectedLevel) {
    const engine = this.app.srsEngine;
    // New words enter in lesson order so SRS respects the curriculum
    const ordered = this.sortForPractice(words, selectedLevel);
    const newLimit = Number(this.app.stats?.dailyGoal) > 0
      ? Number(this.app.stats.dailyGoal)
      : 20;

    const queue = engine.buildQueue(ordered, { newLimit });
    if (queue.length > 0) {
      const summary = engine.getSummary(ordered);
      this.app.logDebug(
        `🧠 SRS queue: ${summary.due} due + ${Math.min(summary.fresh, newLimit)} new (learned: ${summary.learned})`,
      );
      return queue;
    }

    // Nothing due and nothing new: offer early review (soonest due first)
    const upcoming = engine.getUpcomingWords(ordered);
    if (upcoming.length > 0 && typeof this.app.showToast === "function") {
      this.app.showToast(
        this.app.getTranslation("srsNothingDue") ||
          "Sin tarjetas pendientes hoy - repaso adelantado",
        "success",
        2500,
      );
    }
    return upcoming;
  }

  handleNoVocabulary(level) {
    if (this.app.currentLanguage === "es" && level > 1) {
      // Specialized message for missing Spanish levels
      if (typeof this.app.showSpanishLevelMessage === "function") {
        this.app.showSpanishLevelMessage();
      } else {
        this.app.showError(
          `No se encontró vocabulario para HSK ${level} en español aún.`,
        );
      }
    } else {
      this.app.showError(
        this.app.getTranslation("noVocabularyForLevel", { level }) ||
          `No vocabulary found for HSK level ${level}`,
      );
    }
  }

  updateCard() {
    if (!this.currentWord) return;

    // Sync state to app orchestrator
    this.app.currentWord = this.currentWord;
    this.app.isFlipped = false;
    this.app.sessionIndex = this.sessionIndex;

    // Delegate rendering to practiceViewController
    if (this.app.practiceViewController) {
      this.app.practiceViewController.updateCard();
    } else {
      this.app.updateCard();
    }

    // Reset local inputs
    this.resetInputs();
    this.resetCardState();

    this.app.logDebug(
      `🃏 Card updated (delegated): ${this.currentWord.character}`,
    );
  }

  resetInputs() {
    const pinyinInput = document.getElementById("pinyin-input");
    const feedbackMsg = document.getElementById("feedback-message");
    const nextCardBtn = document.getElementById("next-card-next-btn");

    if (pinyinInput) {
      pinyinInput.value = "";
      pinyinInput.disabled = false;
      pinyinInput.className = "pinyin-input";
      // Autoenfocar solo en escritorio (puntero fino); en móvil el focus
      // abre el teclado y provoca auto-scroll que oculta el header.
      if (window.matchMedia("(pointer: fine)").matches) {
        pinyinInput.focus();
      }
    }

    if (feedbackMsg) {
      feedbackMsg.textContent = "";
      feedbackMsg.className = "feedback-message";
    }

    if (nextCardBtn) nextCardBtn.style.display = "none";
    this.waitingForNext = false;
  }

  renderDetailedInfo(container, meaning) {
    const lessonMeta = this.getLessonMetadataLabel(this.currentWord);
    container.innerHTML = `
            <div class="word-info-expanded">
                <div class="card-back-header">
                    <div class="card-back-character-container">${this.app.renderChineseCharacters(this.currentWord.character, true)}</div>
                    <div class="card-back-header-text">
                        <div class="card-back-pinyin">${this.colorPinyinWithBadges(this.currentWord.pinyin) || "?"}</div>
                        <button class="card-back-pronunciation" data-play-character="${(this.currentWord.character || "").replace(/'/g, "&#39;")}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                            <span>${this.app.getTranslation("playPronunciation")}</span>
                        </button>
                    </div>
                </div>
                ${lessonMeta ? `<div class="card-back-meta">${lessonMeta}</div>` : ""}
 
                <div class="translations-section">
                    <div class="translation-item primary-translation">
                        <div class="translation-header">
                            <span class="lang-flag">${this.app.currentLanguage === "es" ? "ES" : "EN"}</span>
                            <span class="lang-name">${this.app.currentLanguage === "es" ? "Español" : "English"}</span>
                        </div>
                        <div class="translation-content">${meaning}</div>
                    </div>
                    <div class="translation-item secondary-translation">
                        <div class="translation-header">
                            <span class="lang-flag">${this.app.currentLanguage === "es" ? "EN" : "ES"}</span>
                            <span class="lang-name">${this.app.currentLanguage === "es" ? "English" : "Español"}</span>
                        </div>
                        <div class="translation-content">${this.app.currentLanguage === "es" ? (this.currentWord.english || "?") : (this.currentWord.spanish || this.currentWord.translation || "?")}</div>
                    </div>
                </div>
 
                <div class="details-grid">
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                        </div>
                        <div class="detail-info">
                            <div class="detail-label">${this.app.getTranslation("wordTypeLabel")}</div>
                            <div class="detail-value">${this.getWordTypeBadge(this.currentWord)}</div>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                            </svg>
                        </div>
                        <div class="detail-info">
                            <div class="detail-label">${this.app.getTranslation("tonesLabel")}</div>
                            <div class="detail-value tone-display">${this.getToneVisuals(this.currentWord.pinyin) || "?"}</div>
                        </div>
                    </div>
                </div>
                ${this.app.getExampleSentence(this.currentWord)}
            </div>
        `;
    // Attach audio button listener safely (avoids inline onclick XSS vector)
    const audioBtn = container.querySelector(".card-back-pronunciation");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        this.app.playAudio(this.currentWord.character);
      });
    }
  }

  checkPinyinAnswer() {
    if (this.isFlipped) return;

    const input = document.getElementById("pinyin-input");
    const feedback = document.getElementById("feedback-message");
    const nextBtn = document.getElementById("next-card-next-btn");
    if (!input) return;

    const isStrict = this.app.toneCheckMode === "strict";
    const userVal = isStrict ? this.convertToNumberedPinyin(input.value) : this.normalizePinyin(input.value);
    const correctVal = isStrict ? this.convertToNumberedPinyin(this.currentWord.pinyin) : this.normalizePinyin(this.currentWord.pinyin);

    if (userVal === correctVal) {
      input.classList.add("correct");
      if (feedback) {
        feedback.textContent =
          this.app.getTranslation("pinyinCorrectFeedback") || "Correct!";
        feedback.className = "feedback-message visible correct-text";
      }
      if (this.app.isAudioEnabled)
        this.app.playAudio(this.currentWord.character);
      this.app.markAsKnown(true);
      setTimeout(() => {
        this.flipCard();
        this.waitingForNext = true;
        if (nextBtn) {
          nextBtn.style.display = "block";
          nextBtn.focus();
        }
      }, 600);
    } else {
      input.classList.add("incorrect");
      if (feedback) {
        // En modo estricto, si se equivoca, le damos una pista del pinyin correcto
        const answerText = isStrict 
          ? `${this.currentWord.pinyin} (ej: ${this.convertToNumberedPinyin(this.currentWord.pinyin)})`
          : this.currentWord.pinyin;
        feedback.textContent =
          this.app.getTranslation("pinyinIncorrectFeedback", {
            answer: answerText,
          }) || `Incorrect. The answer is ${answerText}`;
        feedback.className = "feedback-message visible incorrect-text";
      }
      setTimeout(() => {
        input.classList.remove("incorrect");
        this.flipCard();
        this.app.markAsKnown(false);
        this.waitingForNext = true;
        if (nextBtn) {
          nextBtn.style.display = "block";
          nextBtn.focus();
        }
      }, 1000);
    }
  }

  normalizePinyin(text) {
    if (!text) return "";
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ü/g, "v")
      .replace(/[^a-z0-9]/g, "");
  }

  convertToNumberedPinyin(pinyin) {
    if (!pinyin) return "";
    const toneMap = {
      'ā':'1', 'á':'2', 'ǎ':'3', 'à':'4',
      'ē':'1', 'é':'2', 'ě':'3', 'è':'4',
      'ī':'1', 'í':'2', 'ǐ':'3', 'ì':'4',
      'ō':'1', 'ó':'2', 'ǒ':'3', 'ò':'4',
      'ū':'1', 'ú':'2', 'ǔ':'3', 'ù':'4',
      'ǖ':'1', 'ǘ':'2', 'ǚ':'3', 'ǜ':'4'
    };
    const charToBaseMap = {
      'ā':'a', 'á':'a', 'ǎ':'a', 'à':'a',
      'ē':'e', 'é':'e', 'ě':'e', 'è':'e',
      'ī':'i', 'í':'i', 'ǐ':'i', 'ì':'i',
      'ō':'o', 'ó':'o', 'ǒ':'o', 'ò':'o',
      'ū':'u', 'ú':'u', 'ǔ':'u', 'ù':'u',
      'ǖ':'ü', 'ǘ':'ü', 'ǚ':'ü', 'ǜ':'ü'
    };

    const regex = /[bcdfghjklmnpqrstwxyz]?h?[aeiouvüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(?:ng|n|r)?/ig;
    const syllables = pinyin.match(regex) || [];

    return syllables.map(syllable => {
      let tone = '5'; // Neutro por defecto
      let clean = '';
      for (const char of syllable.toLowerCase()) {
        if (toneMap[char]) {
          tone = toneMap[char];
        }
        clean += charToBaseMap[char] || char;
      }
      clean = clean.replace(/ü/g, 'v');
      if (/\d$/.test(syllable)) {
        return syllable.replace(/ü/g, 'v');
      }
      return clean + tone;
    }).join('').replace(/[^a-z0-9]/g, "");
  }

  getToneMarks(pinyin) {
    if (!pinyin) return "?";
    const toneMap = {
      ā: "1",
      á: "2",
      ǎ: "3",
      à: "4",
      ē: "1",
      é: "2",
      ě: "3",
      è: "4",
      ī: "1",
      í: "2",
      ǐ: "3",
      ì: "4",
      ō: "1",
      ó: "2",
      ǒ: "3",
      ò: "4",
      ū: "1",
      ú: "2",
      ǔ: "3",
      ù: "4",
      ǖ: "1",
      ǘ: "2",
      ǚ: "3",
      ǜ: "4",
    };
    let tones = [];
    for (let char of pinyin) {
      if (toneMap[char]) tones.push(toneMap[char]);
    }
    return tones.length > 0 ? tones.join("") : "0";
  }

  getWordType(word) {
    const eng = word.english?.toLowerCase() || "";
    if (eng.includes("verb") || eng.includes("to "))
      return this.app.getTranslation("wordTypeVerb") || "Verb";
    if (eng.includes("adj") || eng.includes("adjective"))
      return this.app.getTranslation("wordTypeAdjective") || "Adjective";
    if (eng.includes("noun"))
      return this.app.getTranslation("wordTypeNoun") || "Noun";
    if (eng.includes("number") || /\d/.test(word.character))
      return this.app.getTranslation("wordTypeNumber") || "Number";
    return word.character.length === 1
      ? this.app.getTranslation("wordTypeCharacter") || "Character"
      : this.app.getTranslation("wordTypeWord") || "Word";
  }

  getBookLabel(bookValue) {
    const raw = String(bookValue || "")
      .trim()
      .toLowerCase();
    if (!raw) return "";

    if (["shang", "上", "上册"].includes(raw)) return "Shang";
    if (["xia", "下", "下册"].includes(raw)) return "Xia";
    return String(bookValue);
  }

  getLessonMetadataLabel(word) {
    const hasLessonMeta =
      word &&
      (word.book !== undefined ||
        word.bookPart !== undefined ||
        word.volume !== undefined ||
        word.lesson !== undefined ||
        word.lessonOrder !== undefined ||
        word.orderInLesson !== undefined);

    if (!hasLessonMeta) {
      return "";
    }

    const lang = this.app.currentLanguage || "en";
    const level = Number(word.level || this.app.currentLevel || 0);
    const bookLabel = this.getBookLabel(
      word.book ?? word.bookPart ?? word.volume,
    );
    const lessonNumber = Number(word.lesson || 0);
    const lessonOrder = Number(word.lessonOrder || word.orderInLesson || 0);

    const lessonWord = lang === "es" ? "Leccion" : "Lesson";
    const orderWord = lang === "es" ? "Palabra" : "Word";
    const segments = [];

    if (level) segments.push(`HSK ${level}`);
    if (bookLabel) segments.push(bookLabel);
    if (lessonNumber) segments.push(`${lessonWord} ${lessonNumber}`);
    if (lessonOrder) segments.push(`${orderWord} #${lessonOrder}`);

    return segments.join(" · ");
  }

  flipCard() {
    const flashcard = document.getElementById("flashcard");
    const mode = this.app.practiceMode || "char-to-english";

    // Step 0 in char-to-english: reveal pinyin hint before flipping
    if (mode === "char-to-english" && this.revealStep === 0) {
      this.revealStep = 1;
      const hintEl = document.getElementById("hint-text");
      if (hintEl) {
        hintEl.classList.remove("hint-hidden");
        hintEl.classList.add("hint-revealed");
      }
      const flipBtn = document.getElementById("flip-btn");
      if (flipBtn) {
        flipBtn.textContent =
          this.app.getTranslation("showAnswer") || "Show answer";
      }
      this.app.logDebug("[卡] Pinyin revealed (step 1)");
      return;
    }

    // Full flip to back
    const input = document.getElementById("pinyin-input");
    if (flashcard && !this.isFlipped) {
      flashcard.classList.add("flipped");
      this.isFlipped = true;
      this.app.isFlipped = true;
      if (input) input.disabled = true;
      this.enableKnowledgeButtons();
      this.app.logDebug("[卡] Card flipped");
    }
  }

  nextCard() {
    if (this.currentSession.length === 0) return;
    this.sessionIndex = (this.sessionIndex + 1) % this.currentSession.length;
    this.currentWord = this.currentSession[this.sessionIndex];
    this.isFlipped = false;
    this.revealStep = 0;
    this.updateCard();
    this.app.updateProgress();

    this.app.stats.totalCards++;
    this.app.saveStats();
    this.app.updateHeaderStats();
  }

  previousCard() {
    if (this.currentSession.length === 0) return;
    this.sessionIndex =
      (this.sessionIndex - 1 + this.currentSession.length) %
      this.currentSession.length;
    this.currentWord = this.currentSession[this.sessionIndex];
    this.isFlipped = false;
    this.revealStep = 0;
    this.updateCard();
    this.app.updateProgress();
  }

  resetCardState() {
    const flipBtn = document.getElementById("flip-btn");
    const mode = this.app.practiceMode || "char-to-english";
    this.isFlipped = false;
    this.revealStep = 0;
    if (flipBtn) {
      flipBtn.disabled = false;
      flipBtn.textContent = mode === "char-to-english"
        ? (this.app.getTranslation("revealPinyin") || "Reveal Pinyin")
        : (this.app.getTranslation("showAnswer") || "Show answer");
      flipBtn.style.opacity = "1";
    }
    this.disableKnowledgeButtons();
  }

  enableKnowledgeButtons() {
    ["know-btn", "dont-know-btn"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = "1";
      }
    });
  }

  disableKnowledgeButtons() {
    ["know-btn", "dont-know-btn"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = "0.6";
      }
    });
  }

  handleSwipe(startX, endX) {
    if (Math.abs(endX - startX) < 50) return;
    if (endX < startX) this.nextCard();
    else this.previousCard();
  }

  handleDifficulty(difficulty) {
    if (!this.currentWord || !this.isFlipped) return;

    const isKnown = ["easy", "good"].includes(difficulty);
    this.app.logDebug(`🧠 Rated as: ${difficulty} (Known: ${isKnown})`);

    // Call orchestrator markAsKnown which handles stats, SRS and firebase sync
    this.app.markAsKnown(isKnown, difficulty);

    // Visual feedback for rating
    const btn = document.querySelector(`[data-difficulty="${difficulty}"]`);
    if (btn) {
      btn.classList.add("active-rating");
      setTimeout(() => btn.classList.remove("active-rating"), 200);
    }
  }

  getWordTypeBadge(word) {
    const type = this.getWordType(word);
    let gemClass = "word-type-word";

    const english = (word.english || "").toLowerCase();
    if (english.includes("verb") || english.includes("to ")) {
      gemClass = "word-type-verb";
    } else if (english.includes("adj") || english.includes("adjective")) {
      gemClass = "word-type-adj";
    } else if (english.includes("noun") || english.includes("person") || english.includes("thing")) {
      gemClass = "word-type-noun";
    } else if (english.includes("number") || /\d/.test(word.character)) {
      gemClass = "word-type-noun";
    } else if (word.character && word.character.length === 1) {
      gemClass = "word-type-char";
    }

    return `<span class="word-type-badge ${gemClass}">${type}</span>`;
  }

  getToneVisuals(pinyin) {
    if (!pinyin) return "?";
    const toneMap = {
      "ā": "1", "á": "2", "ǎ": "3", "à": "4",
      "ē": "1", "é": "2", "ě": "3", "è": "4",
      "ī": "1", "í": "2", "ǐ": "3", "ì": "4",
      "ō": "1", "ó": "2", "ǒ": "3", "ò": "4",
      "ū": "1", "ú": "2", "ǔ": "3", "ù": "4",
      "ǖ": "1", "ǘ": "2", "ǚ": "3", "ǜ": "4"
    };

    const tones = [];
    const regex = /[bcdfghjklmnpqrstwxyz]?h?[aeiouvüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(?:ng|n|r)?/ig;
    const syllables = pinyin.match(regex) || [];
    for (const syllable of syllables) {
      let detectedTone = "0";
      for (const char of syllable) {
        if (toneMap[char]) {
          detectedTone = toneMap[char];
          break;
        }
      }
      tones.push(detectedTone);
    }

    const toneDetails = {
      "1": { symbol: "ˉ", arrow: "→", name: "Plano", css: "tone-1" },
      "2": { symbol: "ˊ", arrow: "↗", name: "Ascendente", css: "tone-2" },
      "3": { symbol: "ˇ", arrow: "↘↗", name: "Desc-Asc", css: "tone-3" },
      "4": { symbol: "ˋ", arrow: "↘", name: "Descendente", css: "tone-4" },
      "0": { symbol: "•", arrow: "•", name: "Neutro", css: "tone-0" }
    };

    return tones.map((toneNum) => {
      const info = toneDetails[toneNum] || toneDetails["0"];
      return `<span class="tone-visual-badge ${info.css}" title="Tono ${toneNum}: ${info.name}">
                <span>${toneNum}</span>
                <span class="tone-arrow">${info.arrow}</span>
            </span>`;
    }).join(" ");
  }

  colorPinyinWithBadges(pinyin) {
    if (!pinyin) return "";
    const toneMap = {
      "ā": 1, "á": 2, "ǎ": 3, "à": 4,
      "ē": 1, "é": 2, "ě": 3, "è": 4,
      "ī": 1, "í": 2, "ǐ": 3, "ì": 4,
      "ō": 1, "ó": 2, "ǒ": 3, "ò": 4,
      "ū": 1, "ú": 2, "ǔ": 3, "ù": 4,
      "ǖ": 1, "ǘ": 2, "ǚ": 3, "ǜ": 4
    };

    const regex = /[bcdfghjklmnpqrstwxyz]?h?[aeiouvüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(?:ng|n|r)?/ig;
    const syllables = pinyin.match(regex) || [];

    return syllables.map((syllable) => {
      let detectedTone = 0;
      for (const char of syllable) {
        if (toneMap[char]) {
          detectedTone = toneMap[char];
          break;
        }
      }
      return `<span class="tone-${detectedTone} pinyin-syllable-badge">${syllable}</span>`;
    }).join(" ");
  }
}
