class LanguageController {
    constructor(app) {
        this.app = app;
    }

    updateLanguageDisplay() {
        if (this.app.currentWord) {
            this.app.updateCard();
        }

        this.app.updateVocabularyCards();
        this.relocalizeQuizQuestionsToCurrentVocabulary();

        const quizContainer = document.getElementById('quiz-container');
        const isQuizVisible = quizContainer && quizContainer.style.display !== 'none';
        const hasActiveQuestion = this.app.quiz && this.app.quiz.isActive &&
            Array.isArray(this.app.quiz.questions) &&
            this.app.quiz.currentQuestion < this.app.quiz.questions.length;

        if (isQuizVisible && hasActiveQuestion) {
            this.app.showQuizQuestion();
        }

        this.app.updateThemeButton();
        this.app.updateAudioButton();
        this.updateHeaderControlMicrocopy();
    }

    updateHeaderControlMicrocopy() {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            const title = this.getTranslation('languageSelectorTitle') || 'Language';
            const tooltip = this.getTranslation('languageSelectorTooltip') || 'Change interface language';
            languageSelect.title = title;
            languageSelect.setAttribute('aria-label', title);
            languageSelect.setAttribute('data-tooltip', tooltip);
        }

        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            const title = this.getTranslation('voiceSelectorTitle') || 'Voice';
            const tooltip = this.getTranslation('voiceSelectorTooltip') || 'Select voice for pronunciation';
            voiceSelect.title = title;
            voiceSelect.setAttribute('aria-label', title);
            voiceSelect.setAttribute('data-tooltip', tooltip);
        }
    }

    relocalizeQuizQuestionsToCurrentVocabulary() {
        if (!this.app.quiz || !Array.isArray(this.app.quiz.questions) || this.app.quiz.questions.length === 0) {
            return;
        }

        this.app.quiz.questions = this.app.quiz.questions.map((question) => {
            const byCharacterAndPinyin = this.app.vocabulary.find((word) =>
                word.character === question.character && word.pinyin === question.pinyin
            );
            if (byCharacterAndPinyin) return byCharacterAndPinyin;

            const byCharacter = this.app.vocabulary.find((word) => word.character === question.character);
            if (byCharacter) return byCharacter;

            const byPinyin = this.app.vocabulary.find((word) => word.pinyin === question.pinyin);
            if (byPinyin) return byPinyin;

            return question;
        });
    }

    getTranslation(key, replacements = {}) {
        if (window.languageManager) {
            return window.languageManager.t(key, replacements);
        }

        return key;
    }

    changeLanguage(lang) {
        this.app.logDebug('Language changed to: ' + lang);
    }
}

window.LanguageController = LanguageController;
