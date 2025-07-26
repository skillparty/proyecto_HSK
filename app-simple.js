// HSK App Simple - Sin código problemático

class HSKApp {
    constructor() {
        this.vocabulary = [];
        this.currentWord = null;
        this.practiceMode = 'char-to-pinyin';
        this.selectedLevel = 'all';
        this.isFlipped = false;
        this.currentSession = [];
        this.sessionIndex = 0;
        this.isProcessing = false; // Flag para prevenir múltiples procesamiento
        
        this.init();
    }

    async init() {
        try {
            await this.loadVocabulary();
            this.setupEventListeners();
            this.initializeTabs();
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    async loadVocabulary() {
        try {
            console.log('Loading vocabulary...');
            const response = await fetch('hsk_vocabulary_small.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.vocabulary = await response.json();
            console.log(`Successfully loaded ${this.vocabulary.length} vocabulary items`);
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            // Fallback vocabulary
            this.vocabulary = [
                { character: '你', pinyin: 'nǐ', translation: 'you', level: 1 },
                { character: '好', pinyin: 'hǎo', translation: 'good', level: 1 },
                { character: '我', pinyin: 'wǒ', translation: 'I', level: 1 }
            ];
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Level selector - ULTRA SIMPLE
        const levelSelect = document.getElementById('level-select');
        if (levelSelect) {
            levelSelect.addEventListener('change', (e) => {
                console.log('Level changed to:', e.target.value);
                this.selectedLevel = e.target.value;
                
                // Solo cambiar el mensaje, NO procesar nada
                const questionText = document.getElementById('question-text');
                if (questionText) {
                    questionText.textContent = `Nivel ${this.selectedLevel} - Presiona Next`;
                }
            });
        }

        // Practice mode
        document.querySelectorAll('input[name="practice-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.practiceMode = e.target.value;
                console.log('Practice mode changed to:', this.practiceMode);
            });
        });

        // Next button
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextCard();
            });
        }

        // Flip button
        const flipBtn = document.getElementById('flip-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', () => {
                this.flipCard();
            });
        }

        // Know/Don't know buttons
        const knowBtn = document.getElementById('know-btn');
        if (knowBtn) {
            knowBtn.addEventListener('click', () => {
                if (this.isFlipped) {
                    console.log('Marked as known');
                    // Solo marcar, no avanzar automáticamente
                }
            });
        }

        const dontKnowBtn = document.getElementById('dont-know-btn');
        if (dontKnowBtn) {
            dontKnowBtn.addEventListener('click', () => {
                if (this.isFlipped) {
                    console.log('Marked as not known');
                    // Solo marcar, no avanzar automáticamente
                }
            });
        }
    }

    showMessage(message) {
        const questionText = document.getElementById('question-text');
        if (questionText) {
            questionText.textContent = message;
        }
    }

    nextCard() {
        if (this.isProcessing) {
            console.log('Already processing, please wait');
            return;
        }

        this.isProcessing = true;
        
        try {
            // Si no hay sesión, crear una nueva
            if (this.currentSession.length === 0) {
                this.createSession();
            }

            if (this.currentSession.length === 0) {
                this.showMessage('No hay palabras disponibles para este nivel');
                this.isProcessing = false;
                return;
            }

            // Obtener siguiente palabra
            if (this.sessionIndex >= this.currentSession.length) {
                this.sessionIndex = 0; // Reiniciar
            }

            this.currentWord = this.currentSession[this.sessionIndex];
            this.sessionIndex++;
            this.isFlipped = false;

            this.updateCard();
            this.updateButtons();

        } catch (error) {
            console.error('Error in nextCard:', error);
            this.showMessage('Error obteniendo siguiente palabra');
        } finally {
            this.isProcessing = false;
        }
    }

    createSession() {
        console.log('Creating session for level:', this.selectedLevel);
        
        let filtered = [];
        
        // Filtrado simple
        if (this.selectedLevel === 'all') {
            filtered = [...this.vocabulary];
        } else {
            filtered = this.vocabulary.filter(word => word.level.toString() === this.selectedLevel);
        }

        console.log(`Found ${filtered.length} words for level ${this.selectedLevel}`);

        // Shuffle simple
        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }

        this.currentSession = filtered;
        this.sessionIndex = 0;
    }

    updateCard() {
        const questionText = document.getElementById('question-text');
        const answerText = document.getElementById('answer-text');
        
        if (!questionText || !this.currentWord) return;

        // Mostrar pregunta según modo de práctica
        switch (this.practiceMode) {
            case 'char-to-pinyin':
                questionText.textContent = this.currentWord.character;
                if (answerText) answerText.textContent = this.currentWord.pinyin;
                break;
            case 'char-to-english':
                questionText.textContent = this.currentWord.character;
                if (answerText) answerText.textContent = this.currentWord.translation;
                break;
            case 'pinyin-to-char':
                questionText.textContent = this.currentWord.pinyin;
                if (answerText) answerText.textContent = this.currentWord.character;
                break;
            case 'english-to-char':
                questionText.textContent = this.currentWord.translation;
                if (answerText) answerText.textContent = this.currentWord.character;
                break;
        }

        // Reset card visual state
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.classList.remove('flipped');
        }
    }

    flipCard() {
        if (!this.currentWord) return;

        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;

        this.isFlipped = !this.isFlipped;
        
        if (this.isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }

        this.updateButtons();
        console.log('Card flipped:', this.isFlipped);
    }

    updateButtons() {
        const flipBtn = document.getElementById('flip-btn');
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');

        if (flipBtn) {
            flipBtn.disabled = !this.currentWord;
            flipBtn.textContent = this.isFlipped ? 'Volver' : 'Mostrar Respuesta';
        }

        if (knowBtn) {
            knowBtn.disabled = !this.isFlipped;
            knowBtn.style.opacity = this.isFlipped ? '1' : '0.5';
        }

        if (dontKnowBtn) {
            dontKnowBtn.disabled = !this.isFlipped;
            dontKnowBtn.style.opacity = this.isFlipped ? '1' : '0.5';
        }
    }

    initializeTabs() {
        this.switchTab('practice');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-panel').forEach(content => {
            content.classList.remove('active');
        });
        const tabPanel = document.getElementById(tabName);
        if (tabPanel) {
            tabPanel.classList.add('active');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing HSK App');
    window.app = new HSKApp();
});
