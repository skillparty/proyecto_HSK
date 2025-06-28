// HSK Chinese Learning App - Translations
const translations = {
    es: {
        // Header
        appTitle: "Confuc10 ++",
        appSubtitle: "Aprende caracteres chinos, pinyin y traducciones",
        themeToggleTitle: "Cambiar tema",
        audioToggleTitle: "Activar/Desactivar audio",
        
        // Navigation
        practiceTab: "Práctica",
        browseTab: "Explorar",
        quizTab: "Quiz",
        statsTab: "Estadísticas",
        
        // Practice Mode
        levelLabel: "Nivel HSK:",
        allLevels: "Todos los niveles",
        practiceMode: "Modo de práctica:",
        charToPinyin: "Carácter → Pinyin",
        charToEnglish: "Carácter → Inglés",
        pinyinToChar: "Pinyin → Carácter",
        englishToChar: "Inglés → Carácter",
        
        // Flashcard Controls
        showAnswer: "Mostrar respuesta",
        next: "Siguiente",
        iKnow: "✓ Lo sé",
        iDontKnow: "✗ No lo sé",
        clickToStart: "Haz clic en \"Siguiente\" para comenzar",
        
        // Browse Section
        searchPlaceholder: "Buscar por carácter, pinyin o traducción...",
        
        // Quiz Section
        configureQuiz: "Configurar Quiz",
        numberOfQuestions: "Número de preguntas:",
        startQuiz: "Comenzar Quiz",
        score: "Puntuación:",
        confirm: "Confirmar",
        quizCompleted: "¡Quiz Completado!",
        finalScore: "Puntuación final:",
        percentage: "Porcentaje:",
        newQuiz: "Nuevo Quiz",
        
        // Statistics
        learningStats: "Estadísticas de Aprendizaje",
        wordsStudied: "Palabras estudiadas",
        accuracy: "Precisión",
        quizzesCompleted: "Quizzes completados",
        currentStreak: "Racha actual",
        progressByLevel: "Progreso por nivel HSK",
        resetStats: "Resetear estadísticas",
        resetConfirm: "¿Estás seguro de que quieres resetear todas las estadísticas?",
        
        // Vocabulary Info
        character: "Carácter:",
        pinyin: "Pinyin:",
        translation: "Traducción:",
        level: "Nivel HSK:",
        
        // Audio
        enableAudio: "Activar audio",
        disableAudio: "Desactivar audio",
        clickToPronounce: "Hacer clic para escuchar pronunciación",
        
        // Footer
        developedBy: "Desarrollado con ❤️ por",
        version: "v2.0.0 | Confuc10 ++ Platform",
        githubLink: "📂 GitHub",
        confuciusInspired: "🀄 Instituto Confucio inspired",
        
        // Messages
        noWordsAvailable: "No hay más palabras disponibles",
        onlyWordsAvailable: "Solo hay {count} palabras disponibles para este nivel.",
        loadingError: "Error loading vocabulary data. Please check the console for details.",
        
        // Language
        language: "Idioma:",
        spanish: "Español",
        english: "English"
    },
    
    en: {
        // Header
        appTitle: "Confuc10 ++",
        appSubtitle: "Learn Chinese characters, pinyin and translations",
        themeToggleTitle: "Toggle theme",
        audioToggleTitle: "Enable/Disable audio",
        
        // Navigation
        practiceTab: "Practice",
        browseTab: "Browse",
        quizTab: "Quiz",
        statsTab: "Statistics",
        
        // Practice Mode
        levelLabel: "HSK Level:",
        allLevels: "All levels",
        practiceMode: "Practice mode:",
        charToPinyin: "Character → Pinyin",
        charToEnglish: "Character → English",
        pinyinToChar: "Pinyin → Character",
        englishToChar: "English → Character",
        
        // Flashcard Controls
        showAnswer: "Show answer",
        next: "Next",
        iKnow: "✓ I know",
        iDontKnow: "✗ I don't know",
        clickToStart: "Click \"Next\" to begin",
        
        // Browse Section
        searchPlaceholder: "Search by character, pinyin or translation...",
        
        // Quiz Section
        configureQuiz: "Configure Quiz",
        numberOfQuestions: "Number of questions:",
        startQuiz: "Start Quiz",
        score: "Score:",
        confirm: "Confirm",
        quizCompleted: "Quiz Completed!",
        finalScore: "Final score:",
        percentage: "Percentage:",
        newQuiz: "New Quiz",
        
        // Statistics
        learningStats: "Learning Statistics",
        wordsStudied: "Words studied",
        accuracy: "Accuracy",
        quizzesCompleted: "Quizzes completed",
        currentStreak: "Current streak",
        progressByLevel: "Progress by HSK level",
        resetStats: "Reset statistics",
        resetConfirm: "Are you sure you want to reset all statistics?",
        
        // Vocabulary Info
        character: "Character:",
        pinyin: "Pinyin:",
        translation: "Translation:",
        level: "HSK Level:",
        
        // Audio
        enableAudio: "Enable audio",
        disableAudio: "Disable audio",
        clickToPronounce: "Click to hear pronunciation",
        
        // Footer
        developedBy: "Developed with ❤️ by",
        version: "v2.0.0 | Confuc10 ++ Platform",
        githubLink: "📂 GitHub",
        confuciusInspired: "🀄 Confucius Institute inspired",
        
        // Messages
        noWordsAvailable: "No more words available",
        onlyWordsAvailable: "Only {count} words available for this level.",
        loadingError: "Error loading vocabulary data. Please check the console for details.",
        
        // Language
        language: "Language:",
        spanish: "Español",
        english: "English"
    }
};

// Language Manager Class
class LanguageManager {
    constructor() {
        this.currentLanguage = this.loadLanguage();
        this.translations = translations;
    }
    
    loadLanguage() {
        const saved = localStorage.getItem('hsk-language');
        return saved || 'es'; // Default to Spanish
    }
    
    saveLanguage() {
        localStorage.setItem('hsk-language', this.currentLanguage);
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        this.saveLanguage();
        this.updateInterface();
    }
    
    t(key, replacements = {}) {
        let text = this.translations[this.currentLanguage]?.[key] || 
                   this.translations['es'][key] || 
                   key;
        
        // Replace placeholders like {count}
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        
        return text;
    }
    
    updateInterface() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
                element.placeholder = text;
            } else if (element.hasAttribute('title')) {
                element.title = text;
            } else {
                element.textContent = text;
            }
        });
        
        // Update language selector
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
        }
        
        // Update document language attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Trigger custom event for components that need manual update
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: this.currentLanguage }
        }));
    }
}

// Export for use in main app
window.LanguageManager = LanguageManager;
window.translations = translations;
