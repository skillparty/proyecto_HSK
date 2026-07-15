/**
 * StrokesRadicalsPractice - self-contained multiple-choice practice quiz
 * for the strokes & radicals module (question selection, difficulty
 * ramping, scoring, session persistence). Extracted from
 * StrokesRadicalsController; owns its own quiz state (previously
 * controller.state.practice) and reaches back into the controller only
 * for app/logger/constants and the filtered vocabulary pool.
 */
class StrokesRadicalsPractice {
    constructor(controller) {
        this.controller = controller;
        this.state = {
            currentEntry: null,
            correctOption: null,
            selectedOption: null,
            answered: false,
            score: 0,
            attempts: 0,
            streak: 0,
            bestStreak: 0,
            difficulty: 'auto',
            lastDifficultyUsed: 'easy',
            sessionStartedAt: null
        };
    }

    getPracticeCategory(entry) {
        if (entry.hasRadical && entry.hasStroke) return 'both';
        if (entry.hasRadical) return 'radical';
        if (entry.hasStroke) return 'stroke';
        return 'none';
    }

    getPracticeOptionLabel(optionKey) {
        const keyByOption = {
            radical: 'strokesRadicalsPracticeOptionRadical',
            stroke: 'strokesRadicalsPracticeOptionStroke',
            both: 'strokesRadicalsPracticeOptionBoth',
            none: 'strokesRadicalsPracticeOptionNone'
        };

        return this.controller.app.getTranslation(keyByOption[optionKey] || keyByOption.none);
    }

    shuffleArray(items) {
        const copy = [...items];
        for (let index = copy.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
        }

        return copy;
    }

    getNumericValue(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    getPracticeSessionStorageKey() {
        const currentUser = window.backendAuth?.getCurrentUser?.();
        const userId = currentUser?.id || 'guest';
        return `${this.controller.practiceSessionStorageKey}:${userId}`;
    }

    sanitizeDifficulty(value) {
        const allowed = new Set(['auto', 'easy', 'normal', 'hard']);
        return allowed.has(value) ? value : 'auto';
    }

    loadPracticeSession() {
        this.state.sessionStartedAt = Date.now();

        try {
            const raw = sessionStorage.getItem(this.getPracticeSessionStorageKey());
            if (!raw) {
                return;
            }

            const parsed = JSON.parse(raw);
            this.state.score = this.getNumericValue(parsed.score, 0);
            this.state.attempts = this.getNumericValue(parsed.attempts, 0);
            this.state.streak = this.getNumericValue(parsed.streak, 0);
            this.state.bestStreak = this.getNumericValue(parsed.bestStreak, 0);
            this.state.difficulty = this.sanitizeDifficulty(String(parsed.difficulty || 'auto'));
            this.state.sessionStartedAt = this.getNumericValue(parsed.sessionStartedAt, Date.now());
        } catch (error) {
            this.controller.logWarn('[strokes-radicals] Could not load practice session:', error);
        }
    }

    savePracticeSession() {
        try {
            sessionStorage.setItem(this.getPracticeSessionStorageKey(), JSON.stringify({
                score: this.state.score,
                attempts: this.state.attempts,
                streak: this.state.streak,
                bestStreak: this.state.bestStreak,
                difficulty: this.sanitizeDifficulty(this.state.difficulty),
                sessionStartedAt: this.state.sessionStartedAt || Date.now()
            }));
        } catch (error) {
            this.controller.logWarn('[strokes-radicals] Could not save practice session:', error);
        }
    }

    syncPracticeControls() {
        const difficultySelect = document.getElementById('sr-practice-difficulty');
        if (difficultySelect) {
            difficultySelect.value = this.state.difficulty || 'auto';
        }
    }

    getEffectiveDifficulty() {
        const selectedDifficulty = this.state.difficulty || 'auto';
        if (selectedDifficulty !== 'auto') {
            return selectedDifficulty;
        }

        if (this.state.streak >= this.controller.difficultyThresholds.hard) {
            return 'hard';
        }

        if (this.state.streak >= this.controller.difficultyThresholds.normal) {
            return 'normal';
        }

        return 'easy';
    }

    getDifficultyLabel(difficulty) {
        const keyByDifficulty = {
            auto: 'strokesRadicalsPracticeDifficultyAuto',
            easy: 'strokesRadicalsPracticeDifficultyEasy',
            normal: 'strokesRadicalsPracticeDifficultyNormal',
            hard: 'strokesRadicalsPracticeDifficultyHard'
        };

        return this.controller.app.getTranslation(keyByDifficulty[difficulty] || keyByDifficulty.auto);
    }

    getPracticeOptionsForDifficulty(difficulty, correctOption) {
        if (difficulty === 'easy') {
            if (correctOption === 'radical' || correctOption === 'stroke') {
                return ['radical', 'stroke'];
            }
            return [correctOption, 'radical'];
        }

        if (difficulty === 'normal') {
            const options = ['radical', 'stroke', 'both'];
            if (!options.includes(correctOption)) {
                options.push(correctOption);
            }
            return options;
        }

        return ['radical', 'stroke', 'both'];
    }

    getPracticeHint(entry, difficulty) {
        const pinyin = String(entry.word.pinyin || '?');
        const meaning = this.controller.sanitizeMeaning(entry.word);

        if (difficulty === 'hard') {
            return pinyin;
        }

        if (difficulty === 'normal') {
            const shortMeaning = meaning.split(/[;,|]/)[0]?.trim() || meaning;
            return `${pinyin} · ${shortMeaning}`;
        }

        return `${pinyin} · ${meaning}`;
    }

    getPracticePool() {
        const filteredItems = this.controller.state.filteredItems;
        const effectiveDifficulty = this.getEffectiveDifficulty();
        this.state.lastDifficultyUsed = effectiveDifficulty;

        const pool = filteredItems.filter((entry) => {
            const category = this.getPracticeCategory(entry);

            if (effectiveDifficulty === 'easy') {
                return category === 'radical' || category === 'stroke';
            }

            if (effectiveDifficulty === 'normal') {
                return category !== 'none';
            }

            return true;
        });

        return pool.length ? pool : filteredItems;
    }

    updatePracticeScore() {
        const scoreEl = document.getElementById('sr-practice-score');
        const streakEl = document.getElementById('sr-practice-streak');
        const bestStreakEl = document.getElementById('sr-practice-best-streak');
        const accuracyEl = document.getElementById('sr-practice-accuracy');
        const difficultyEl = document.getElementById('sr-practice-current-difficulty');

        const score = this.state.score;
        const attempts = this.state.attempts;
        const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
        const effectiveDifficulty = this.getEffectiveDifficulty();

        if (scoreEl) {
            scoreEl.textContent = `${score}/${attempts}`;
        }

        if (streakEl) {
            streakEl.textContent = String(this.state.streak);
        }

        if (bestStreakEl) {
            bestStreakEl.textContent = String(this.state.bestStreak);
        }

        if (accuracyEl) {
            accuracyEl.textContent = `${accuracy}%`;
        }

        if (difficultyEl) {
            difficultyEl.textContent = this.getDifficultyLabel(effectiveDifficulty);
        }

        this.savePracticeSession();
    }

    resetPracticeSession() {
        this.state.score = 0;
        this.state.attempts = 0;
        this.state.streak = 0;
        this.state.bestStreak = 0;
        this.state.sessionStartedAt = Date.now();
        this.state.answered = false;
        this.state.selectedOption = null;

        this.savePracticeSession();

        if (this.controller.state.filteredItems.length === 0) {
            this.renderPracticeNoData();
            return;
        }

        this.pickNextPracticeQuestion();
        this.updatePracticeScore();
    }

    renderPracticeNoData() {
        const questionEl = document.getElementById('sr-practice-question');
        const characterEl = document.getElementById('sr-practice-character');
        const hintEl = document.getElementById('sr-practice-hint');
        const optionsEl = document.getElementById('sr-practice-options');
        const feedbackEl = document.getElementById('sr-practice-feedback');
        const nextBtn = document.getElementById('sr-practice-next');

        if (questionEl) questionEl.textContent = this.controller.app.getTranslation('strokesRadicalsPracticeNoData');
        if (characterEl) characterEl.textContent = '-';
        if (hintEl) hintEl.textContent = '';
        if (optionsEl) optionsEl.innerHTML = '';
        if (feedbackEl) feedbackEl.textContent = '';
        if (nextBtn) nextBtn.style.display = 'none';

        this.state.currentEntry = null;
        this.state.correctOption = null;
        this.state.selectedOption = null;
        this.state.answered = false;
        this.updatePracticeScore();
    }

    pickNextPracticeQuestion() {
        const pool = this.getPracticePool();
        if (pool.length === 0) {
            this.renderPracticeNoData();
            return;
        }

        const currentEntry = this.state.currentEntry;
        const available = currentEntry ? pool.filter((entry) => entry !== currentEntry) : pool;
        const selectionPool = available.length ? available : pool;
        const nextEntry = selectionPool[Math.floor(Math.random() * selectionPool.length)];
        this.state.currentEntry = nextEntry;
        this.state.correctOption = this.getPracticeCategory(nextEntry);
        this.state.selectedOption = null;
        this.state.answered = false;

        this.renderPracticeQuestion();
    }

    applyPracticeAnswerState() {
        const selectedOption = this.state.selectedOption;
        const correctOption = this.state.correctOption;
        if (!this.state.answered || !selectedOption || !correctOption) {
            return;
        }

        const isCorrect = selectedOption === correctOption;

        document.querySelectorAll('#sr-practice-options .sr-practice-option').forEach((button) => {
            const option = button.dataset.option;
            if (option === correctOption) {
                button.classList.add('correct');
            } else if (option === selectedOption && !isCorrect) {
                button.classList.add('incorrect');
            }
            button.disabled = true;
        });

        const feedbackEl = document.getElementById('sr-practice-feedback');
        if (feedbackEl) {
            if (isCorrect) {
                feedbackEl.textContent = this.controller.app.getTranslation('strokesRadicalsPracticeCorrect');
                feedbackEl.className = 'sr-practice-feedback correct';
            } else {
                feedbackEl.textContent = this.controller.app.getTranslation('strokesRadicalsPracticeIncorrect', {
                    answer: this.getPracticeOptionLabel(correctOption)
                });
                feedbackEl.className = 'sr-practice-feedback incorrect';
            }
        }

        const nextBtn = document.getElementById('sr-practice-next');
        if (nextBtn) {
            nextBtn.style.display = 'inline-flex';
        }
    }

    renderPracticeQuestion(resetQuestionState = true) {
        const questionEl = document.getElementById('sr-practice-question');
        const characterEl = document.getElementById('sr-practice-character');
        const hintEl = document.getElementById('sr-practice-hint');
        const optionsEl = document.getElementById('sr-practice-options');
        const feedbackEl = document.getElementById('sr-practice-feedback');
        const nextBtn = document.getElementById('sr-practice-next');

        const entry = this.state.currentEntry;
        if (!entry || !questionEl || !characterEl || !hintEl || !optionsEl || !feedbackEl || !nextBtn) {
            return;
        }

        if (resetQuestionState) {
            this.state.answered = false;
            this.state.selectedOption = null;
        }

        const activeDifficulty = this.state.lastDifficultyUsed || this.getEffectiveDifficulty();
        const optionKeys = this.shuffleArray(
            this.getPracticeOptionsForDifficulty(activeDifficulty, this.state.correctOption)
        );

        questionEl.textContent = this.controller.app.getTranslation('strokesRadicalsPracticePrompt');
        characterEl.textContent = String(entry.word.character || '?');
        hintEl.textContent = this.getPracticeHint(entry, activeDifficulty);
        feedbackEl.textContent = '';
        feedbackEl.className = 'sr-practice-feedback';
        optionsEl.innerHTML = '';
        nextBtn.style.display = 'none';

        optionKeys.forEach((optionKey) => {
            const optionBtn = document.createElement('button');
            optionBtn.type = 'button';
            optionBtn.className = 'sr-practice-option';
            optionBtn.dataset.option = optionKey;
            optionBtn.textContent = this.getPracticeOptionLabel(optionKey);
            optionBtn.addEventListener('click', () => this.submitPracticeAnswer(optionKey));
            optionsEl.appendChild(optionBtn);
        });

        if (!resetQuestionState && this.state.answered) {
            this.applyPracticeAnswerState();
        }

        this.updatePracticeScore();
    }

    submitPracticeAnswer(selectedOption) {
        if (this.state.answered) {
            return;
        }

        const correctOption = this.state.correctOption;
        const isCorrect = selectedOption === correctOption;
        this.state.selectedOption = selectedOption;
        this.state.answered = true;
        this.state.attempts += 1;
        if (isCorrect) {
            this.state.score += 1;
            this.state.streak += 1;
            this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
        } else {
            this.state.streak = 0;
        }

        this.applyPracticeAnswerState();

        this.updatePracticeScore();
    }

}

window.StrokesRadicalsPractice = StrokesRadicalsPractice;
