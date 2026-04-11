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
        this.waitingForNext = false;
        
        console.log('🃏 FlashcardManager module initialized');
    }

    setupSession() {
        // Wait for vocabulary to load through app orchestrator
        if (!this.app.vocabulary || this.app.vocabulary.length === 0) {
            console.log('⏳ Waiting for vocabulary to load...');
            setTimeout(() => this.setupSession(), 500);
            return;
        }

        const level = this.app.currentLevel;
        const levelFilter = level === 'all' ?
            this.app.vocabulary :
            this.app.vocabulary.filter(word => word.level == level);

        this.currentSession = this.sortForPractice(levelFilter, level);
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
            console.log(`[書] Practice session setup: ${this.currentSession.length} words for level ${level}`);
        } else {
            this.handleNoVocabulary(level);
        }
    }

    getBookRank(bookValue) {
        const book = String(bookValue || '').trim().toLowerCase();
        if (!book) return 1;

        if (['shang', 's', 'upper', 'up', '1', 'vol1', 'book1', '上', '上册'].includes(book)) return 1;
        if (['xia', 'x', 'lower', 'down', '2', 'vol2', 'book2', '下', '下册'].includes(book)) return 2;

        const numeric = Number(book);
        return Number.isFinite(numeric) ? numeric : 1;
    }

    getLessonNumber(word) {
        const lesson = Number(word.lesson ?? word.lessonNumber ?? word.unit ?? 0);
        return Number.isFinite(lesson) ? lesson : 0;
    }

    getLessonSequence(word) {
        const sequence = Number(word.lessonOrder ?? word.orderInLesson ?? word.sequence ?? 0);
        return Number.isFinite(sequence) ? sequence : 0;
    }

    hasBookLessonMetadata(word) {
        return Boolean(
            word.book !== undefined
            || word.bookPart !== undefined
            || word.volume !== undefined
            || word.lesson !== undefined
            || word.lessonNumber !== undefined
            || word.unit !== undefined
            || word.lessonOrder !== undefined
            || word.orderInLesson !== undefined
            || word.sequence !== undefined
        );
    }

    sortForPractice(words, selectedLevel) {
        const withIndex = words.map((word, index) => ({ word, index }));

        withIndex.sort((a, b) => {
            const aWord = a.word;
            const bWord = b.word;

            const aLevel = Number(aWord.level || 0);
            const bLevel = Number(bWord.level || 0);
            if (selectedLevel === 'all' && aLevel !== bLevel) {
                return aLevel - bLevel;
            }

            const aHasMetadata = this.hasBookLessonMetadata(aWord);
            const bHasMetadata = this.hasBookLessonMetadata(bWord);
            if (aHasMetadata || bHasMetadata) {
                const aBookRank = this.getBookRank(aWord.book ?? aWord.bookPart ?? aWord.volume);
                const bBookRank = this.getBookRank(bWord.book ?? bWord.bookPart ?? bWord.volume);
                if (aBookRank !== bBookRank) return aBookRank - bBookRank;

                const aLesson = this.getLessonNumber(aWord);
                const bLesson = this.getLessonNumber(bWord);
                if (aLesson !== bLesson) return aLesson - bLesson;

                const aSequence = this.getLessonSequence(aWord);
                const bSequence = this.getLessonSequence(bWord);
                if (aSequence !== bSequence) return aSequence - bSequence;
            }

            const aOrder = Number.isFinite(Number(aWord._sourceOrder)) ? Number(aWord._sourceOrder) : a.index;
            const bOrder = Number.isFinite(Number(bWord._sourceOrder)) ? Number(bWord._sourceOrder) : b.index;
            if (aOrder !== bOrder) return aOrder - bOrder;

            return a.index - b.index;
        });

        return withIndex.map((entry) => entry.word);
    }

    handleNoVocabulary(level) {
        if (this.app.currentLanguage === 'es' && level > 1) {
            // Specialized message for missing Spanish levels
            if (typeof this.app.showSpanishLevelMessage === 'function') {
                this.app.showSpanishLevelMessage();
            } else {
                this.app.showError(`No se encontró vocabulario para HSK ${level} en español aún.`);
            }
        } else {
            this.app.showError(this.app.getTranslation('noVocabularyForLevel', { level }) || `No vocabulary found for HSK level ${level}`);
        }
    }

    updateCard() {
        if (!this.currentWord) return;

        const elements = {
            question: document.getElementById('question-text'),
            answer: document.getElementById('answer-text'),
            fullInfo: document.getElementById('full-info'),
            hint: document.getElementById('hint-text'),
            flashcard: document.getElementById('flashcard')
        };

        if (!elements.question || !elements.fullInfo) return;

        const meaning = this.app.getMeaningForLanguage(this.currentWord);
        const mode = this.app.practiceMode || 'char-to-english';
        
        let question = '';
        let hint = '';

        switch (mode) {
            case 'char-to-pinyin':
                question = this.currentWord.character;
                hint = meaning;
                break;
            case 'pinyin-to-char':
                question = this.currentWord.pinyin;
                hint = meaning;
                break;
            case 'english-to-char':
                question = meaning;
                hint = this.currentWord.pinyin;
                break;
            case 'char-to-english':
            default:
                question = this.currentWord.character;
                hint = this.currentWord.pinyin;
                break;
        }

        // Reset Card UI
        if (elements.flashcard) {
            elements.flashcard.style.transition = 'none';
            elements.flashcard.classList.remove('flipped');
            void elements.flashcard.offsetWidth; // Trigger reflow
            setTimeout(() => elements.flashcard.style.transition = '', 50);
            this.isFlipped = false;
        }

        elements.question.textContent = question || '?';
        if (elements.hint) elements.hint.textContent = hint || '';
        
        // Reset Inputs
        this.resetInputs();

        // Render detailed info for back of card
        this.renderDetailedInfo(elements.fullInfo, meaning);
        
        this.resetCardState();
        
        // Sync state back to app
        this.app.isFlipped = false;
        this.app.currentWord = this.currentWord;
        this.app.sessionIndex = this.sessionIndex;

        console.log(`🃏 Card updated: ${this.currentWord.character} (${mode})`);
    }

    resetInputs() {
        const pinyinInput = document.getElementById('pinyin-input');
        const feedbackMsg = document.getElementById('feedback-message');
        const nextCardBtn = document.getElementById('next-card-next-btn');

        if (pinyinInput) {
            pinyinInput.value = '';
            pinyinInput.disabled = false;
            pinyinInput.className = 'pinyin-input';
            pinyinInput.focus();
        }

        if (feedbackMsg) {
            feedbackMsg.textContent = '';
            feedbackMsg.className = 'feedback-message';
        }

        if (nextCardBtn) nextCardBtn.style.display = 'none';
        this.waitingForNext = false;
    }

    renderDetailedInfo(container, meaning) {
        container.innerHTML = `
            <div class="word-info-expanded">
                <div class="card-back-header">
                    <div class="card-back-character">${this.currentWord.character || '?'}</div>
                    <div class="card-back-pinyin">${this.currentWord.pinyin || '?'}</div>
                    <button class="card-back-pronunciation" onclick="window.app.playAudio('${this.currentWord.character}')">
                        <span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        </span>
                        <span>${this.app.getTranslation('playPronunciation')}</span>
                    </button>
                </div>
                
                <div class="translations-section">
                    <div class="translation-item primary-translation">
                        <div class="translation-header">
                            <span class="lang-flag">${this.app.currentLanguage === 'es' ? 'ES' : 'EN'}</span>
                            <span class="lang-name">${this.app.currentLanguage === 'es' ? 'Español' : 'English'}</span>
                        </div>
                        <div class="translation-content">${meaning}</div>
                    </div>
                </div>
                
                <div class="details-grid">
                    <div class="detail-card">
                        <div class="detail-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg></div>
                        <div class="detail-info">
                            <div class="detail-label">${this.app.getTranslation('wordTypeLabel')}</div>
                            <div class="detail-value">${this.getWordType(this.currentWord)}</div>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>
                        <div class="detail-info">
                            <div class="detail-label">${this.app.getTranslation('tonesLabel')}</div>
                            <div class="detail-value tone-display">${this.getToneMarks(this.currentWord.pinyin) || '?'}</div>
                        </div>
                    </div>
                </div>
                ${this.app.getExampleSentence(this.currentWord)}
            </div>
        `;
    }

    checkPinyinAnswer() {
        if (this.isFlipped) return;

        const input = document.getElementById('pinyin-input');
        const feedback = document.getElementById('feedback-message');
        const nextBtn = document.getElementById('next-card-next-btn');
        if (!input) return;

        const userVal = this.normalizePinyin(input.value);
        const correctVal = this.normalizePinyin(this.currentWord.pinyin);

        if (userVal === correctVal) {
            input.classList.add('correct');
            if (feedback) {
                feedback.textContent = this.app.getTranslation('pinyinCorrectFeedback') || 'Correct!';
                feedback.className = 'feedback-message visible correct-text';
            }
            if (this.app.isAudioEnabled) this.app.playAudio(this.currentWord.character);
            this.app.markAsKnown(true);
            setTimeout(() => {
                this.flipCard();
                this.waitingForNext = true;
                if (nextBtn) { nextBtn.style.display = 'block'; nextBtn.focus(); }
            }, 600);
        } else {
            input.classList.add('incorrect');
            if (feedback) {
                feedback.textContent = this.app.getTranslation('pinyinIncorrectFeedback', { answer: this.currentWord.pinyin }) || `Incorrect. The answer is ${this.currentWord.pinyin}`;
                feedback.className = 'feedback-message visible incorrect-text';
            }
            setTimeout(() => {
                input.classList.remove('incorrect');
                this.flipCard();
                this.app.markAsKnown(false);
                this.waitingForNext = true;
                if (nextBtn) { nextBtn.style.display = 'block'; nextBtn.focus(); }
            }, 1000);
        }
    }

    normalizePinyin(text) {
        if (!text) return '';
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    getToneMarks(pinyin) {
        if (!pinyin) return '?';
        const toneMap = { 'ā': '1', 'á': '2', 'ǎ': '3', 'à': '4', 'ē': '1', 'é': '2', 'ě': '3', 'è': '4', 'ī': '1', 'í': '2', 'ǐ': '3', 'ì': '4', 'ō': '1', 'ó': '2', 'ǒ': '3', 'ò': '4', 'ū': '1', 'ú': '2', 'ǔ': '3', 'ù': '4', 'ǖ': '1', 'ǘ': '2', 'ǚ': '3', 'ǜ': '4' };
        let tones = [];
        for (let char of pinyin) { if (toneMap[char]) tones.push(toneMap[char]); }
        return tones.length > 0 ? tones.join('') : '0';
    }

    getWordType(word) {
        const eng = word.english?.toLowerCase() || '';
        if (eng.includes('verb') || eng.includes('to ')) return this.app.getTranslation('wordTypeVerb') || 'Verb';
        if (eng.includes('adj') || eng.includes('adjective')) return this.app.getTranslation('wordTypeAdjective') || 'Adjective';
        if (eng.includes('noun')) return this.app.getTranslation('wordTypeNoun') || 'Noun';
        if (eng.includes('number') || /\d/.test(word.character)) return this.app.getTranslation('wordTypeNumber') || 'Number';
        return word.character.length === 1 ? (this.app.getTranslation('wordTypeCharacter') || 'Character') : (this.app.getTranslation('wordTypeWord') || 'Word');
    }

    flipCard() {
        const flashcard = document.getElementById('flashcard');
        const input = document.getElementById('pinyin-input');
        if (flashcard && !this.isFlipped) {
            flashcard.classList.add('flipped');
            this.isFlipped = true;
            this.app.isFlipped = true;
            if (input) input.disabled = true;
            this.enableKnowledgeButtons();
            console.log('[卡] Card flipped');
        }
    }

    nextCard() {
        if (this.currentSession.length === 0) return;
        this.sessionIndex = (this.sessionIndex + 1) % this.currentSession.length;
        this.currentWord = this.currentSession[this.sessionIndex];
        this.isFlipped = false;
        this.updateCard();
        this.app.updateProgress();

        this.app.stats.totalCards++;
        this.app.saveStats();
        this.app.updateHeaderStats();
    }

    previousCard() {
        if (this.currentSession.length === 0) return;
        this.sessionIndex = (this.sessionIndex - 1 + this.currentSession.length) % this.currentSession.length;
        this.currentWord = this.currentSession[this.sessionIndex];
        this.isFlipped = false;
        this.updateCard();
        this.app.updateProgress();
    }

    resetCardState() {
        const flipBtn = document.getElementById('flip-btn');
        this.isFlipped = false;
        if (flipBtn) {
            flipBtn.disabled = false;
            flipBtn.textContent = this.app.getTranslation('showAnswer') || 'Show answer';
            flipBtn.style.opacity = '1';
        }
        this.disableKnowledgeButtons();
    }

    enableKnowledgeButtons() {
        ['know-btn', 'dont-know-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        });
    }

    disableKnowledgeButtons() {
        ['know-btn', 'dont-know-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
        });
    }

    handleSwipe(startX, endX) {
        if (Math.abs(endX - startX) < 50) return;
        if (endX < startX) this.nextCard(); else this.previousCard();
    }

    handleDifficulty(difficulty) {
        if (!this.currentWord || !this.isFlipped) return;

        const isKnown = ['easy', 'good'].includes(difficulty);
        console.log(`🧠 Rated as: ${difficulty} (Known: ${isKnown})`);

        // Call orchestrator markAsKnown which handles stats and firebase sync
        this.app.markAsKnown(isKnown);

        // Visual feedback for rating
        const btn = document.querySelector(`[data-difficulty="${difficulty}"]`);
        if (btn) {
            btn.classList.add('active-rating');
            setTimeout(() => btn.classList.remove('active-rating'), 200);
        }
    }
}
