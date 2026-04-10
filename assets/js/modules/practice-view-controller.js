class PracticeViewController {
    constructor(app) {
        this.app = app;
    }

    updateCard() {
        if (!this.app.currentWord) {
            this.app.logWarn('No current word to display');
            return;
        }

        const questionText = document.getElementById('question-text');
        const answerText = document.getElementById('answer-text');
        const fullInfo = document.getElementById('full-info');
        const hintText = document.getElementById('hint-text');

        if (!questionText || !answerText || !fullInfo) {
            this.app.logWarn('Card elements not found in DOM');
            return;
        }

        let question = '';
        let answer = '';
        let hint = '';

        const meaning = this.app.getMeaningForLanguage(this.app.currentWord);
        const mode = this.app.practiceMode || 'char-to-english';

        switch (mode) {
            case 'char-to-pinyin':
                question = this.app.currentWord.character;
                answer = this.app.currentWord.pinyin;
                hint = meaning;
                break;
            case 'char-to-english':
            default:
                question = this.app.currentWord.character;
                answer = meaning;
                hint = this.app.currentWord.pinyin;
                break;
            case 'pinyin-to-char':
                question = this.app.currentWord.pinyin;
                answer = this.app.currentWord.character;
                hint = meaning;
                break;
            case 'english-to-char':
                question = meaning;
                answer = this.app.currentWord.character;
                hint = this.app.currentWord.pinyin;
                break;
        }

        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.style.transition = 'none';
            flashcard.classList.remove('flipped');
            void flashcard.offsetWidth;
            setTimeout(() => {
                flashcard.style.transition = '';
            }, 50);

            this.app.isFlipped = false;
        }

        questionText.textContent = question || '?';
        if (hintText) hintText.textContent = hint || '';
        fullInfo.style.opacity = '1';

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

        if (nextCardBtn) {
            nextCardBtn.style.display = 'none';
        }

        this.app.waitingForNext = false;

        fullInfo.innerHTML = `
            <div class="word-info-expanded">
                <div class="card-back-header">
                    <div class="card-back-character">${this.app.currentWord.character || '?'}</div>
                    <div class="card-back-pinyin">${this.app.currentWord.pinyin || '?'}</div>
                    <button class="card-back-pronunciation" onclick="window.app.playAudio('${this.app.currentWord.character}')">
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
                    <div class="translation-item secondary-translation">
                        <div class="translation-header">
                            <span class="lang-flag">${this.app.currentLanguage === 'es' ? 'EN' : 'ES'}</span>
                            <span class="lang-name">${this.app.currentLanguage === 'es' ? 'English' : 'Español'}</span>
                        </div>
                        <div class="translation-content">${this.app.currentLanguage === 'es' ? (this.app.currentWord.english || '?') : (this.app.currentWord.spanish || this.app.currentWord.translation || '?')}</div>
                    </div>
                </div>

                <div class="details-grid">
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                        </div>
                        <div class="detail-info">
                            <div class="detail-label">${this.app.getTranslation('wordTypeLabel')}</div>
                            <div class="detail-value">${this.getWordType(this.app.currentWord)}</div>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                            </svg>
                        </div>
                        <div class="detail-info">
                            <div class="detail-label">${this.app.getTranslation('tonesLabel')}</div>
                            <div class="detail-value tone-display">${this.getToneMarks(this.app.currentWord.pinyin) || '?'}</div>
                        </div>
                    </div>
                </div>

                ${this.getExampleSentence(this.app.currentWord)}
            </div>
        `;

        this.resetCardState();
        this.app.logDebug('Card updated: ' + this.app.currentWord.character + ' (' + mode + ')');
    }

    getStrokeCount(character) {
        const strokeCounts = {
            '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
            '人': 2, '大': 3, '小': 3, '中': 4, '国': 8, '我': 7, '你': 7, '他': 5, '她': 6,
            '好': 6, '不': 4, '是': 9, '的': 8, '在': 6, '有': 6, '了': 2, '会': 6, '说': 14,
            '来': 8, '去': 5, '看': 9, '听': 7, '吃': 6, '喝': 12, '买': 6, '卖': 8, '学': 8,
            '工': 3, '作': 7, '家': 10, '校': 10, '老': 6, '师': 10, '生': 5
        };

        if (strokeCounts[character]) {
            return strokeCounts[character];
        }

        if (character && character.length === 1) {
            const code = character.charCodeAt(0);
            if (code >= 0x4e00 && code <= 0x9fff) {
                return Math.floor(Math.random() * 15) + 3;
            }
        }

        return '?';
    }

    getWordType(word) {
        const character = word.character;
        const english = (word.english || '').toLowerCase();

        if (english.includes('verb') || english.includes('to ')) {
            return this.app.getTranslation('wordTypeVerb') || 'Verb';
        } else if (english.includes('adj') || english.includes('adjective')) {
            return this.app.getTranslation('wordTypeAdjective') || 'Adjective';
        } else if (english.includes('noun') || english.includes('person') || english.includes('thing')) {
            return this.app.getTranslation('wordTypeNoun') || 'Noun';
        } else if (english.includes('number') || /\d/.test(character)) {
            return this.app.getTranslation('wordTypeNumber') || 'Number';
        } else if (character.length === 1) {
            return this.app.getTranslation('wordTypeCharacter') || 'Character';
        }

        return this.app.getTranslation('wordTypeWord') || 'Word';
    }

    normalizePinyin(text) {
        if (!text) return '';
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    checkPinyinAnswer() {
        this.app.flashcardManager.checkPinyinAnswer();
    }

    getToneMarks(pinyin) {
        if (!pinyin) return '?';

        const toneMap = {
            'ā': '1', 'á': '2', 'ǎ': '3', 'à': '4', 'a': '0',
            'ē': '1', 'é': '2', 'ě': '3', 'è': '4', 'e': '0',
            'ī': '1', 'í': '2', 'ǐ': '3', 'ì': '4', 'i': '0',
            'ō': '1', 'ó': '2', 'ǒ': '3', 'ò': '4', 'o': '0',
            'ū': '1', 'ú': '2', 'ǔ': '3', 'ù': '4', 'u': '0',
            'ǖ': '1', 'ǘ': '2', 'ǚ': '3', 'ǜ': '4', 'ü': '0'
        };

        const tones = [];
        for (const char of pinyin) {
            if (toneMap[char]) {
                tones.push(toneMap[char]);
            }
        }

        return tones.length > 0 ? tones.join('') : '0';
    }

    getExampleSentence(word) {
        const examples = {
            '你': { chinese: '你好吗？', english: 'How are you?', spanish: '¿Cómo estás?' },
            '好': { chinese: '很好，谢谢。', english: 'Very good, thank you.', spanish: 'Muy bien, gracias.' },
            '我': { chinese: '我是学生。', english: 'I am a student.', spanish: 'Soy estudiante.' },
            '是': { chinese: '他是老师。', english: 'He is a teacher.', spanish: 'Él es profesor.' },
            '的': { chinese: '我的书', english: 'My book', spanish: 'Mi libro' },
            '不': { chinese: '我不知道。', english: 'I don\'t know.', spanish: 'No lo sé.' },
            '在': { chinese: '我在家。', english: 'I am at home.', spanish: 'Estoy en casa.' },
            '有': { chinese: '我有一本书。', english: 'I have a book.', spanish: 'Tengo un libro.' }
        };

        const example = examples[word.character];
        if (example) {
            return `
                <div class="example-section">
                    <div class="example-title">${this.app.getTranslation('usageExample')}</div>
                    <div class="example-sentence">
                        <div class="example-chinese">${example.chinese}</div>
                        <div class="example-translations">
                            <div class="example-english"><span class="lang-flag">EN</span> ${example.english}</div>
                            <div class="example-spanish"><span class="lang-flag">ES</span> ${example.spanish}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="example-section">
                <div class="example-title">${this.app.getTranslation('practiceWithWord')}</div>
                <div class="practice-tip">
                    ${this.app.getTranslation('createSentenceUsing', { character: word.character })}
                </div>
            </div>
        `;
    }

    resetCardState() {
        const flashcard = document.getElementById('flashcard');
        const flipBtn = document.getElementById('flip-btn');

        this.app.isFlipped = false;

        if (flashcard) {
            flashcard.classList.remove('flipped');
        }

        if (flipBtn) {
            flipBtn.disabled = false;
            flipBtn.textContent = this.app.getTranslation('showAnswer') || 'Show answer';
            flipBtn.style.opacity = '1';
        }

        this.app.disableKnowledgeButtons();
        this.app.logDebug('Card reset to front side');
    }
}

window.PracticeViewController = PracticeViewController;
