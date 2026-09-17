/**
 * QuizEngine Module - Handles HSK testing logic
 * Extracted from app.js and enhanced with multidimensional modes, smart distractors,
 * time attacks, mistake review, and custom deck integration.
 */
class QuizEngine {
  constructor(app) {
    this.app = app;
    this.timerInterval = null;
    this.state = {
      questions: [],
      currentQuestion: 0,
      score: 0,
      isActive: false,
      selectedAnswer: null,
      correctAnswer: null,
      mode: "meaning", // "meaning" | "reverse" | "listening" | "pinyin"
      timerSeconds: 0, // 0 = no limit, or 15, 10, 5
      timeLeft: 0,
      answersHistory: [], // array of { question, selectedAnswer, correctAnswer, isCorrect, mode }
      isMistakeRetry: false,
    };

    (window.hskLogger || console).debug("📝 QuizEngine module initialized");
  }

  // Method to link existing quiz data from app if needed
  syncFromApp() {
    if (this.app.quiz) {
      this.state = { ...this.state, ...this.app.quiz };
    }
  }

  // Fisher-Yates shuffle — statistically unbiased
  shuffleArray(array) {
    const arr = [...array]; // never mutate the original
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  start() {
    const levelSelect = document.getElementById("quiz-level");
    const questionsSelect = document.getElementById("quiz-questions");
    const modeSelect = document.getElementById("quiz-mode");
    const timerSelect = document.getElementById("quiz-timer");

    const selectedLevel = levelSelect ? levelSelect.value : "1";
    const numQuestions = questionsSelect ? parseInt(questionsSelect.value, 10) : 10;
    const selectedMode = modeSelect ? modeSelect.value : "meaning";
    const selectedTimer = timerSelect && timerSelect.value !== "none" ? parseInt(timerSelect.value, 10) : 0;

    // Filter vocabulary by level
    let vocabPool =
      selectedLevel === "all"
        ? this.app.vocabulary
        : this.app.vocabulary.filter((word) => Number(word.level) === Number(selectedLevel));

    if (!vocabPool || vocabPool.length === 0) {
      this.app.showToast(
        this.app.getTranslation("noVocabularyForLevel") ||
          "No vocabulary for this level",
        "error",
        2000,
      );
      return;
    }

    // Shuffle and select questions
    vocabPool = this.shuffleArray(vocabPool);
    this.state.questions = vocabPool.slice(0, numQuestions);
    this.state.currentQuestion = 0;
    this.state.score = 0;
    this.state.correctAnswer = null;
    this.state.selectedAnswer = null;
    this.state.isActive = true;
    this.state.mode = selectedMode;
    this.state.timerSeconds = selectedTimer;
    this.state.timeLeft = selectedTimer;
    this.state.answersHistory = [];
    this.state.isMistakeRetry = false;

    // Sync back to app for compatibility
    this.app.quiz = this.state;

    // Show quiz container
    const setupEl = document.getElementById("quiz-setup");
    const containerEl = document.getElementById("quiz-container");
    const resultsEl = document.getElementById("quiz-results");

    if (setupEl) setupEl.style.display = "none";
    if (containerEl) containerEl.style.display = "block";
    if (resultsEl) resultsEl.style.display = "none";

    this.saveSession();
    this.showQuestion();
  }

  showQuestion() {
    this.clearTimer();

    const question = this.state.questions[this.state.currentQuestion];
    if (!question) {
      this.showResults();
      return;
    }

    const questionDisplay = document.getElementById("quiz-question");
    const optionsContainer = document.getElementById("quiz-options");
    const currentSpan = document.getElementById("quiz-current");
    const totalSpan = document.getElementById("quiz-total");
    const scoreSpan = document.getElementById("quiz-score");
    const currentQuestionNumber = this.state.currentQuestion + 1;
    const totalQuestions = this.state.questions.length;

    if (currentSpan) currentSpan.textContent = currentQuestionNumber;
    if (totalSpan) totalSpan.textContent = totalQuestions;
    if (scoreSpan) scoreSpan.textContent = this.state.score;

    const mode = this.state.mode || "meaning";
    const correctAnswerMeaning = this.app.getMeaningForLanguage(question);

    let correctAnswer = "";
    if (mode === "reverse") {
      correctAnswer = question.character;
    } else if (mode === "pinyin") {
      correctAnswer = question.pinyin;
    } else {
      correctAnswer = correctAnswerMeaning;
    }

    this.state.correctAnswer = correctAnswer;
    this.state.selectedAnswer = null;

    // Render Question Header Meta & Prompts
    if (questionDisplay) {
      const hskLevelLabel = this.app.getTranslation("quizHskLevel") || "HSK Level";
      const questionLabel =
        this.app.getTranslation("quizQuestionCounter") ||
        this.app.getTranslation("question") ||
        "Question";
      const ofLabel = this.app.getTranslation("of") || "of";
      const hskLevelValue = question?.level
        ? `HSK ${question.level}`
        : this.app.getTranslation("allLevels") || "All levels";

      let promptText = "";
      let mainDisplay = "";
      let subDisplay = "";

      if (mode === "meaning") {
        promptText = this.app.getTranslation("whatDoesThisCharacterMean") || "¿Qué significa este carácter?";
        mainDisplay = `
          <div class="quiz-character-wrap">
            <div class="quiz-character">${this.escapeHtml(question.character)}</div>
            <button type="button" class="quiz-audio-btn" id="quiz-speak-btn" title="${this.escapeHtml(this.app.getTranslation("quizPlayAudio") || "Escuchar pronunciación")}">🔊</button>
          </div>
        `;
        subDisplay = `<div class="quiz-pinyin">${this.escapeHtml(question.pinyin)}</div>`;
      } else if (mode === "reverse") {
        promptText = this.app.getTranslation("whichCharacterMeans") || "¿Qué carácter corresponde a este significado?";
        mainDisplay = `<div class="quiz-reverse-meaning">"${this.escapeHtml(correctAnswerMeaning)}"</div>`;
        subDisplay = `<div class="quiz-mode-hint">(HSK ${question.level || 1})</div>`;
      } else if (mode === "listening") {
        promptText = this.app.getTranslation("listenAndIdentify") || "Escucha con atención e identifica el significado:";
        mainDisplay = `
          <div class="quiz-listening-hero">
            <button type="button" class="quiz-big-audio-btn" id="quiz-speak-btn" title="${this.escapeHtml(this.app.getTranslation("quizPlayAudio") || "Escuchar pronunciación")}">
              <span class="quiz-audio-wave"><span></span><span></span><span></span></span>
              <span>🔊 ${this.escapeHtml(this.app.getTranslation("quizPlayAudio") || "Escuchar audio")}</span>
            </button>
            <div class="quiz-character quiz-masked-char" id="quiz-masked-char">🎧 ?</div>
          </div>
        `;
        subDisplay = `<div class="quiz-pinyin quiz-masked-pinyin" id="quiz-masked-pinyin">---</div>`;
      } else if (mode === "pinyin") {
        promptText = this.app.getTranslation("whatIsTheCorrectPinyin") || "¿Cuál es el Pinyin y tono correcto?";
        mainDisplay = `
          <div class="quiz-character-wrap">
            <div class="quiz-character">${this.escapeHtml(question.character)}</div>
            <button type="button" class="quiz-audio-btn" id="quiz-speak-btn" title="${this.escapeHtml(this.app.getTranslation("quizPlayAudio") || "Escuchar pronunciación")}">🔊</button>
          </div>
        `;
        subDisplay = `<div class="quiz-pinyin-meaning">${this.escapeHtml(correctAnswerMeaning)}</div>`;
      }

      questionDisplay.innerHTML = `
        <div class="quiz-question-meta">
          <span class="quiz-meta-pill">${hskLevelLabel}: ${hskLevelValue}</span>
          <span class="quiz-meta-pill">${questionLabel} ${currentQuestionNumber} ${ofLabel} ${totalQuestions}</span>
        </div>
        <div class="quiz-question-text">${promptText}</div>
        ${mainDisplay}
        ${subDisplay}
      `;

      // Bind speak button
      const speakBtn = questionDisplay.querySelector("#quiz-speak-btn");
      if (speakBtn) {
        speakBtn.addEventListener("click", () => this.playCurrentAudio());
      }
    }

    // Auto-play audio on listening mode
    if (mode === "listening") {
      setTimeout(() => this.playCurrentAudio(), 300);
    }

    // Generate smart options
    const options = this.generateOptions(question, correctAnswer, mode);

    if (optionsContainer) {
      optionsContainer.innerHTML = "";
      options.forEach((option) => {
        const optionBtn = document.createElement("button");
        optionBtn.type = "button";
        optionBtn.className = "quiz-option";
        optionBtn.textContent = option;
        optionBtn.addEventListener("click", () => {
          this.selectAnswer(option, correctAnswer);
        });
        optionsContainer.appendChild(optionBtn);
      });
    }

    // Reset submit button
    const submitBtn = document.getElementById("quiz-submit");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.display = "inline-block";
      submitBtn.classList.remove("ready");
      submitBtn.textContent = this.app.getTranslation("submit") || "Submit";
    }

    const nextBtn = document.getElementById("quiz-next");
    if (nextBtn) {
      nextBtn.style.display = "none";
    }

    // Setup timer if active
    this.setupTimer();
    this.saveSession();
  }

  playCurrentAudio() {
    const question = this.state.questions[this.state.currentQuestion];
    if (!question || !question.character) return;
    if (this.app.audioController?.playWordAudio) {
      this.app.audioController.playWordAudio(question.character);
    }
  }

  setupTimer() {
    this.clearTimer();
    const timerBadge = document.getElementById("quiz-timer-badge");
    const timerVal = document.getElementById("quiz-timer-val");

    if (!this.state.timerSeconds || this.state.timerSeconds <= 0) {
      if (timerBadge) timerBadge.style.display = "none";
      return;
    }

    this.state.timeLeft = this.state.timerSeconds;
    if (timerBadge) timerBadge.style.display = "inline-flex";
    if (timerVal) timerVal.textContent = this.state.timeLeft;
    if (timerBadge) timerBadge.classList.remove("is-warning", "is-danger");

    this.timerInterval = setInterval(() => {
      this.state.timeLeft--;
      if (timerVal) timerVal.textContent = this.state.timeLeft;

      if (timerBadge) {
        if (this.state.timeLeft <= 3) {
          timerBadge.classList.add("is-danger");
          timerBadge.classList.remove("is-warning");
        } else if (this.state.timeLeft <= 5) {
          timerBadge.classList.add("is-warning");
          timerBadge.classList.remove("is-danger");
        }
      }

      if (this.state.timeLeft <= 0) {
        this.clearTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleTimeUp() {
    // If user hadn't selected an answer, register timeout
    if (!this.state.selectedAnswer) {
      this.state.selectedAnswer = `(${this.app.getTranslation("quizTimeUp") || "Tiempo agotado"})`;
    }
    this.submitAnswer(true);
  }

  generateToneVariants(pinyin) {
    if (!pinyin || typeof pinyin !== "string") return [];
    const vowelsWithTones = {
      a: ["ā", "á", "ǎ", "à"],
      e: ["ē", "é", "ě", "è"],
      i: ["ī", "í", "ǐ", "ì"],
      o: ["ō", "ó", "ǒ", "ò"],
      u: ["ū", "ú", "ǔ", "ù"],
      ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
    };

    for (const tones of Object.values(vowelsWithTones)) {
      for (const toneChar of tones) {
        if (pinyin.includes(toneChar)) {
          return tones
            .filter((t) => t !== toneChar)
            .map((t) => pinyin.replace(toneChar, t));
        }
      }
    }
    return [];
  }

  generateOptions(currentWord, correctAnswer, mode = "meaning") {
    const vocab = Array.isArray(this.app.vocabulary) ? this.app.vocabulary : [];

    if (mode === "reverse") {
      // 4 characters (1 correct, 3 wrong from same level)
      const sameLevel = vocab.filter(
        (w) => w.character !== currentWord.character && (!currentWord.level || Number(w.level) === Number(currentWord.level))
      );
      const pool = sameLevel.length >= 3 ? sameLevel : vocab.filter((w) => w.character !== currentWord.character);
      const wrong = this.shuffleArray(pool.map((w) => w.character)).slice(0, 3);
      return this.shuffleArray([correctAnswer, ...wrong]);
    }

    if (mode === "pinyin") {
      // 4 Pinyin strings
      const toneVariants = this.generateToneVariants(currentWord.pinyin);
      let wrongPinyins = [];

      if (toneVariants.length >= 3) {
        wrongPinyins = toneVariants.slice(0, 3);
      } else {
        const otherPinyins = vocab
          .filter((w) => w.pinyin && w.pinyin !== correctAnswer)
          .map((w) => w.pinyin)
          .filter((p, i, arr) => arr.indexOf(p) === i);
        wrongPinyins = this.shuffleArray(otherPinyins).slice(0, 3);
      }

      while (wrongPinyins.length < 3) {
        wrongPinyins.push(`pinyin_${wrongPinyins.length + 1}`);
      }

      return this.shuffleArray([correctAnswer, ...wrongPinyins]);
    }

    // Meaning mode & Listening mode
    const sameLevelWords = vocab.filter(
      (w) => w.character !== currentWord.character && (!currentWord.level || Number(w.level) === Number(currentWord.level))
    );
    const poolWords = sameLevelWords.length >= 3 ? sameLevelWords : vocab.filter((w) => w.character !== currentWord.character);

    const allWrongAnswers = poolWords
      .map((word) => this.app.getMeaningForLanguage(word))
      .filter((meaning) => meaning && meaning !== correctAnswer)
      .filter((meaning, index, arr) => arr.indexOf(meaning) === index);

    if (allWrongAnswers.length < 3) {
      const generic =
        this.app.currentLanguage === "es"
          ? ["hola", "adiós", "gracias", "por favor", "lo siento", "sí", "no"]
          : ["hello", "goodbye", "thank you", "please", "sorry", "yes", "no"];
      allWrongAnswers.push(...generic.filter((a) => a !== correctAnswer));
    }

    const wrongAnswers = this.shuffleArray(allWrongAnswers).slice(0, 3);
    const shuffledOptions = this.shuffleArray([correctAnswer, ...wrongAnswers]);

    if (!shuffledOptions.includes(correctAnswer)) {
      shuffledOptions[0] = correctAnswer;
      return this.shuffleArray(shuffledOptions);
    }

    return shuffledOptions;
  }

  selectAnswer(selected, correct) {
    this.state.selectedAnswer = selected;
    this.state.correctAnswer = correct;

    document.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.classList.remove("selected");
      if (btn.textContent === selected) {
        btn.classList.add("selected");
        btn.style.transform = "scale(0.96)";
        setTimeout(() => (btn.style.transform = "scale(1)"), 150);
      }
    });

    const submitBtn = document.getElementById("quiz-submit");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.add("ready");
      submitBtn.textContent = this.app.getTranslation("submit") || "Submit";
    }
  }

  submitAnswer(isTimeout = false) {
    this.clearTimer();

    if (!this.state.selectedAnswer && !isTimeout) return;

    const currentQuestionObj = this.state.questions[this.state.currentQuestion];
    const isCorrect = this.state.selectedAnswer === this.state.correctAnswer;

    // Record question history for review breakdown
    if (!Array.isArray(this.state.answersHistory)) {
      this.state.answersHistory = [];
    }
    if (currentQuestionObj) {
      this.state.answersHistory.push({
        question: currentQuestionObj,
        selectedAnswer: this.state.selectedAnswer || "",
        correctAnswer: this.state.correctAnswer || "",
        isCorrect,
        mode: this.state.mode || "meaning",
        isTimeout,
      });
    }

    // Update stats in app
    if (this.app.stats) {
      this.app.stats.totalStudied++;
      this.app.stats.quizAnswered++;
    }

    if (isCorrect) {
      this.state.score++;
      if (this.app.stats) this.app.stats.correctAnswers++;
      this.app.audioController?.playCorrect?.();
    } else {
      this.app.audioController?.playIncorrect?.();
    }

    this.app.updateDailyProgress?.();
    this.app.saveStats?.();
    this.app.updateProgress?.();
    this.app.updateHeaderStats?.();

    this.saveSession();

    // Update UI
    const scoreSpan = document.getElementById("quiz-score");
    if (scoreSpan) scoreSpan.textContent = this.state.score;

    document.querySelectorAll(".quiz-option").forEach((btn) => {
      if (btn.textContent === this.state.correctAnswer) {
        btn.classList.add("correct");
      } else if (btn.textContent === this.state.selectedAnswer && !isCorrect) {
        btn.classList.add("incorrect");
      }
      btn.disabled = true;
    });

    // If listening mode, unmask character and pinyin
    if (this.state.mode === "listening" && currentQuestionObj) {
      const maskedChar = document.getElementById("quiz-masked-char");
      const maskedPinyin = document.getElementById("quiz-masked-pinyin");
      if (maskedChar) {
        maskedChar.classList.remove("quiz-masked-char");
        maskedChar.textContent = currentQuestionObj.character;
      }
      if (maskedPinyin) {
        maskedPinyin.classList.remove("quiz-masked-pinyin");
        maskedPinyin.textContent = currentQuestionObj.pinyin;
      }
    }

    this.showFeedback(isCorrect, isTimeout);

    const submitBtn = document.getElementById("quiz-submit");
    if (submitBtn) submitBtn.style.display = "none";

    const nextBtn = document.getElementById("quiz-next");
    if (nextBtn) nextBtn.style.display = "inline-block";
  }

  showFeedback(isCorrect, isTimeout = false) {
    const quizContent = document.getElementById("quiz-content");
    if (!quizContent) return;

    const existingFeedback = document.getElementById("quiz-feedback");
    if (existingFeedback) existingFeedback.remove();

    const feedback = document.createElement("div");
    feedback.id = "quiz-feedback";
    feedback.className = `quiz-feedback ${isCorrect ? "correct" : "incorrect"}`;

    const feedbackMsg = isCorrect
      ? this.app.getTranslation("correctQuizFeedback") || "¡Correcto!"
      : isTimeout
      ? this.app.getTranslation("quizTimeUp") || "¡Tiempo agotado!"
      : this.app.getTranslation("incorrectQuizFeedback") || "Incorrecta";

    feedback.innerHTML = `
      <div class="feedback-icon">${
        isCorrect
          ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
          : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      }</div>
      <div class="feedback-text">${feedbackMsg}</div>
      ${!isCorrect ? `<div class="feedback-answer">${this.app.getTranslation("correctAnswerLabel") || "Respuesta correcta"}: <strong>${this.escapeHtml(this.state.correctAnswer)}</strong></div>` : ""}
    `;

    quizContent.appendChild(feedback);
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.style.opacity = "0";
        setTimeout(() => feedback.remove(), 300);
      }
    }, 2000);
  }

  nextQuestion() {
    this.clearTimer();
    this.state.currentQuestion++;

    if (this.state.currentQuestion >= this.state.questions.length) {
      this.showResults();
    } else {
      const submitBtn = document.getElementById("quiz-submit");
      if (submitBtn) {
        submitBtn.style.display = "inline-block";
        submitBtn.disabled = true;
        submitBtn.classList.remove("ready");
        submitBtn.textContent =
          this.app.getTranslation("selectAnAnswer") || "Select an Answer";
      }
      const nextBtn = document.getElementById("quiz-next");
      if (nextBtn) nextBtn.style.display = "none";

      this.saveSession();
      this.showQuestion();
    }
  }

  showResults() {
    this.clearTimer();
    const total = this.state.questions.length || 1;
    const percentage = Math.round((this.state.score / total) * 100);

    const containerEl = document.getElementById("quiz-container");
    const resultsEl = document.getElementById("quiz-results");
    const finalScoreEl = document.getElementById("final-score");
    const finalPercEl = document.getElementById("final-percentage");

    if (containerEl) containerEl.style.display = "none";
    if (resultsEl) resultsEl.style.display = "block";
    if (finalScoreEl) finalScoreEl.textContent = `${this.state.score}/${total}`;
    if (finalPercEl) finalPercEl.textContent = `${percentage}%`;

    // Grade Banner
    const gradeBanner = document.getElementById("quiz-grade-banner");
    if (gradeBanner) {
      let gradeHtml = "";
      if (percentage >= 90) {
        gradeHtml = `
          <div class="grade-pill grade-excellent">
            ${this.escapeHtml(this.app.getTranslation("quizGradeExcellent") || "¡Dominio Excepcional! 🏆")}
          </div>
        `;
      } else if (percentage >= 70) {
        gradeHtml = `
          <div class="grade-pill grade-good">
            ${this.escapeHtml(this.app.getTranslation("quizGradeGood") || "¡Muy Buen Trabajo! 🌟")}
          </div>
        `;
      } else {
        gradeHtml = `
          <div class="grade-pill grade-practice">
            ${this.escapeHtml(this.app.getTranslation("quizGradePractice") || "¡Sigue Practicando! 💪")}
          </div>
        `;
      }
      gradeBanner.innerHTML = gradeHtml;
    }

    if (this.app.stats) {
      this.app.stats.quizzesCompleted = (this.app.stats.quizzesCompleted || 0) + 1;
      this.app.saveStats?.();
    }
    this.clearSession();
    this.app.renderQuizResumeAction?.();

    if (percentage >= 80) {
      this.app.audioController?.playStreakFanfare?.();
    }

    if (this.app.userProgress?.recordQuizCompletion) {
      this.app.userProgress.recordQuizCompletion(
        this.app.currentLevel,
        this.state.score,
        total,
      );
    }

    // Render Mistakes & Review Breakdown
    this.renderReviewBreakdown();
  }

  renderReviewBreakdown() {
    const wrapper = document.getElementById("quiz-breakdown-wrapper");
    const list = document.getElementById("quiz-breakdown-list");
    const retryMistakesBtn = document.getElementById("retry-mistakes-btn");
    const saveMistakesBtn = document.getElementById("save-mistakes-deck-btn");

    if (!wrapper || !list) return;

    const history = this.state.answersHistory || [];
    const mistakes = history.filter((item) => !item.isCorrect);

    // Toggle mistakes action buttons
    if (mistakes.length > 0) {
      if (retryMistakesBtn) {
        retryMistakesBtn.style.display = "inline-flex";
        retryMistakesBtn.textContent = `${this.app.getTranslation("quizRetryMistakes") || "Repasar solo errores"} (${mistakes.length})`;
        retryMistakesBtn.onclick = () => this.retryMistakes();
      }

      if (saveMistakesBtn) {
        saveMistakesBtn.style.display = "inline-flex";
        saveMistakesBtn.disabled = false;
        saveMistakesBtn.textContent = this.app.getTranslation("quizSaveMistakesToDeck") || "Guardar fallos en mazo";
        saveMistakesBtn.onclick = () => this.saveMistakesToDeck();
      }
    } else {
      if (retryMistakesBtn) retryMistakesBtn.style.display = "none";
      if (saveMistakesBtn) saveMistakesBtn.style.display = "none";
    }

    if (history.length === 0) {
      wrapper.style.display = "none";
      return;
    }

    wrapper.style.display = "block";
    list.innerHTML = history
      .map((item, idx) => {
        const q = item.question;
        const meaning = this.app.getMeaningForLanguage(q);
        const isOk = item.isCorrect;

        return `
          <div class="quiz-breakdown-card ${isOk ? "is-correct" : "is-wrong"}">
            <div class="breakdown-card-header">
              <span class="breakdown-status-badge">${isOk ? "✅" : "❌"} #${idx + 1}</span>
              <span class="breakdown-hsk-badge">HSK ${q.level || 1}</span>
            </div>
            <div class="breakdown-char-row">
              <span class="breakdown-char">${this.escapeHtml(q.character)}</span>
              <span class="breakdown-pinyin">${this.escapeHtml(q.pinyin)}</span>
              <button type="button" class="breakdown-audio-btn" data-char="${this.escapeHtml(q.character)}" title="Audio">🔊</button>
            </div>
            <div class="breakdown-meaning">${this.escapeHtml(meaning)}</div>
            <div class="breakdown-answers-row">
              <div class="breakdown-user-ans">
                <span class="label">${this.escapeHtml(this.app.getTranslation("quizYourAnswer") || "Tu respuesta:")}</span>
                <span class="val ${isOk ? "val-ok" : "val-err"}">${this.escapeHtml(item.selectedAnswer || "--")}</span>
              </div>
              ${
                !isOk
                  ? `
                <div class="breakdown-correct-ans">
                  <span class="label">${this.escapeHtml(this.app.getTranslation("quizCorrectAnswer") || "Correcta:")}</span>
                  <span class="val val-correct">${this.escapeHtml(item.correctAnswer)}</span>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");

    // Bind audio buttons in breakdown
    list.querySelectorAll(".breakdown-audio-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const char = btn.getAttribute("data-char");
        if (char && this.app.audioController?.playWordAudio) {
          this.app.audioController.playWordAudio(char);
        }
      });
    });
  }

  retryMistakes() {
    const mistakes = (this.state.answersHistory || []).filter((item) => !item.isCorrect);
    if (mistakes.length === 0) return;

    this.state.questions = mistakes.map((item) => item.question);
    this.state.currentQuestion = 0;
    this.state.score = 0;
    this.state.correctAnswer = null;
    this.state.selectedAnswer = null;
    this.state.answersHistory = [];
    this.state.isActive = true;
    this.state.isMistakeRetry = true;

    const setupEl = document.getElementById("quiz-setup");
    const containerEl = document.getElementById("quiz-container");
    const resultsEl = document.getElementById("quiz-results");

    if (setupEl) setupEl.style.display = "none";
    if (containerEl) containerEl.style.display = "block";
    if (resultsEl) resultsEl.style.display = "none";

    this.saveSession();
    this.showQuestion();
  }

  saveMistakesToDeck() {
    const mistakes = (this.state.answersHistory || []).filter((item) => !item.isCorrect);
    if (mistakes.length === 0) return;

    const deckManager = this.app.deckManager;
    if (!deckManager) {
      this.app.showToast?.("DeckManager no disponible", "error");
      return;
    }

    const deckName = "⚠️ Errores de Quiz HSK";
    let targetDeck = deckManager.getAllDecks().find((d) => d.name === deckName);

    if (!targetDeck) {
      targetDeck = deckManager.createDeck(deckName, "Palabras falladas durante sesiones de quiz para repaso espaciado");
    }

    if (!targetDeck) {
      this.app.showToast?.("No se pudo crear el mazo", "error");
      return;
    }

    let addedCount = 0;
    mistakes.forEach((item) => {
      const q = item.question;
      if (q && !deckManager.isWordInDeck(targetDeck.id, q.character)) {
        deckManager.addWordToDeck(targetDeck.id, q);
        addedCount++;
      }
    });

    const msg = this.app.getTranslation("quizMistakesDeckCreated", {
      count: String(addedCount),
      deckName,
    }) || `Se guardaron ${addedCount} palabras en '${deckName}'`;

    this.app.showToast?.(msg, "success", 3000);

    const saveBtn = document.getElementById("save-mistakes-deck-btn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = this.app.getTranslation("quizMistakesSavedDone") || "Guardado en mazo ✓";
    }
  }

  restart() {
    this.reset();
  }

  reset() {
    this.clearTimer();
    this.state = {
      questions: [],
      currentQuestion: 0,
      score: 0,
      isActive: false,
      selectedAnswer: null,
      correctAnswer: null,
      mode: "meaning",
      timerSeconds: 0,
      timeLeft: 0,
      answersHistory: [],
      isMistakeRetry: false,
    };
    this.app.quiz = this.state;
    this.clearSession();

    const setup = document.getElementById("quiz-setup");
    const container = document.getElementById("quiz-container");
    const results = document.getElementById("quiz-results");

    if (setup) setup.style.display = "block";
    if (container) container.style.display = "none";
    if (results) results.style.display = "none";
  }

  renderResumeAction() {
    const quizSetup = document.getElementById("quiz-setup");
    if (!quizSetup) return;

    let resumeBtn = document.getElementById("resume-quiz");
    if (!this.hasResumableSession()) {
      if (resumeBtn) resumeBtn.remove();
      return;
    }

    if (!resumeBtn) {
      const startBtn = document.getElementById("start-quiz");
      resumeBtn = document.createElement("button");
      resumeBtn.id = "resume-quiz";
      resumeBtn.className = "btn btn-secondary";
      resumeBtn.style.marginLeft = "10px";
      if (startBtn && startBtn.parentNode) {
        startBtn.parentNode.insertBefore(resumeBtn, startBtn.nextSibling);
      } else {
        quizSetup.appendChild(resumeBtn);
      }

      resumeBtn.addEventListener("click", () => this.resumeSession());
    }

    resumeBtn.textContent =
      this.app.getTranslation("resumeQuiz") || "Resume Quiz";
  }

  hasResumableSession(session = null) {
    const state = session || this.loadSession();
    if (!state || !state.updatedAt || !state.quiz) return false;

    const age = Date.now() - Number(state.updatedAt);
    if (age > this.getSessionMaxAgeMs()) {
      this.clearSession();
      return false;
    }

    return !!(
      state.quiz.isActive &&
      Array.isArray(state.quiz.questions) &&
      state.quiz.questions.length > 0
    );
  }

  resumeSession() {
    const state = this.loadSession();
    if (!this.hasResumableSession(state)) {
      this.renderResumeAction();
      return;
    }

    const levelSelect = document.getElementById("quiz-level");
    const questionsSelect = document.getElementById("quiz-questions");
    const modeSelect = document.getElementById("quiz-mode");
    const timerSelect = document.getElementById("quiz-timer");

    if (levelSelect && state.selectedLevel) {
      levelSelect.value = state.selectedLevel;
    }

    if (questionsSelect && state.numQuestions) {
      questionsSelect.value = String(state.numQuestions);
    }

    if (modeSelect && state.quiz.mode) {
      modeSelect.value = state.quiz.mode;
    }

    if (timerSelect && state.quiz.timerSeconds) {
      timerSelect.value = String(state.quiz.timerSeconds);
    }

    this.state = {
      ...this.state,
      ...state.quiz,
      isActive: true,
    };

    this.app.quiz = this.state;

    document.getElementById("quiz-setup").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    document.getElementById("quiz-results").style.display = "none";

    this.showToast(
      this.app.getTranslation("quizSessionResumed") || "Quiz session resumed",
      "success",
      1600,
    );
    this.showQuestion();
  }

  showToast(message, type, duration) {
    if (this.app.uiController) {
      this.app.uiController.showToast(message, type, duration);
    } else if (typeof this.app.showToast === "function") {
      this.app.showToast(message, type, duration);
    }
  }

  getSessionStorageKey() {
    return this.app.quizSessionStorageKey || "hsk-quiz-session-v1";
  }

  getSessionMaxAgeMs() {
    const configured = Number(this.app.quizSessionMaxAgeMs);
    if (Number.isFinite(configured) && configured > 0) {
      return configured;
    }

    return 6 * 60 * 60 * 1000;
  }

  saveSession() {
    try {
      const levelSelect = document.getElementById("quiz-level");
      const questionsSelect = document.getElementById("quiz-questions");

      const selectedLevel = levelSelect
        ? levelSelect.value
        : this.app.currentLevel || "1";
      const numQuestions = questionsSelect
        ? parseInt(questionsSelect.value, 10) ||
          this.state.questions.length ||
          10
        : this.state.questions.length || 10;

      const payload = {
        selectedLevel,
        numQuestions,
        updatedAt: Date.now(),
        quiz: {
          questions: Array.isArray(this.state.questions)
            ? this.state.questions
            : [],
          currentQuestion: Number(this.state.currentQuestion) || 0,
          score: Number(this.state.score) || 0,
          selectedAnswer: this.state.selectedAnswer || null,
          correctAnswer: this.state.correctAnswer || null,
          isActive: Boolean(this.state.isActive),
          mode: this.state.mode || "meaning",
          timerSeconds: Number(this.state.timerSeconds) || 0,
          answersHistory: Array.isArray(this.state.answersHistory)
            ? this.state.answersHistory
            : [],
        },
      };

      localStorage.setItem(
        this.getSessionStorageKey(),
        JSON.stringify(payload),
      );
    } catch (error) {
      console.warn("⚠️ Unable to save quiz session state:", error);
    }
  }

  loadSession() {
    try {
      const raw = localStorage.getItem(this.getSessionStorageKey());
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;

      return parsed;
    } catch (error) {
      console.warn("⚠️ Unable to load quiz session state:", error);
      return null;
    }
  }

  clearSession() {
    try {
      localStorage.removeItem(this.getSessionStorageKey());
    } catch (error) {
      console.warn("⚠️ Unable to clear quiz session state:", error);
    }
  }

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

window.QuizEngine = QuizEngine;
