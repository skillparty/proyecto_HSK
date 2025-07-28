# Design Document - HSK App Critical Fixes

## Overview

This design document outlines the technical approach to fix critical issues in the HSK Learning application. The fixes focus on three main areas: flashcard flip functionality, browse section with infinite scroll and audio, and quiz system accuracy.

## Architecture

### Component Structure
```
HSKApp
├── FlashcardManager
│   ├── flipCard()
│   ├── resetCard()
│   └── playAudio()
├── BrowseManager
│   ├── InfiniteScroll
│   ├── VocabularyRenderer
│   └── AudioPlayer
├── QuizManager
│   ├── QuestionGenerator
│   ├── AnswerValidator
│   └── ScoreTracker
├── LanguageManager
│   ├── changeLanguage()
│   ├── getTranslation()
│   └── updateUI()
├── ThemeManager
│   ├── toggleTheme()
│   ├── applyTheme()
│   └── savePreference()
└── AudioManager
    ├── VoiceSelector
    ├── playWithVoice()
    └── getAvailableVoices()
```

## Components and Interfaces

### 1. Flashcard Component Fixes

#### FlashcardManager Class
```javascript
class FlashcardManager {
    constructor(app) {
        this.app = app;
        this.isFlipped = false;
        this.currentCard = null;
    }
    
    flipCard() {
        // Toggle flip state
        // Update UI classes
        // Play audio if enabled
        // Update button states
    }
    
    resetCard() {
        // Reset to front side
        // Enable flip button
        // Clear flip state
    }
}
```

#### Key Methods:
- `flipCard()`: Handles the card flipping animation and state
- `resetCard()`: Resets card to initial state for new words
- `updateCardContent()`: Updates card content without affecting flip state
- `playAudio()`: Plays pronunciation when card is flipped

### 2. Browse Section Enhancements

#### InfiniteScroll Implementation
```javascript
class InfiniteScroll {
    constructor(container, loadMore) {
        this.container = container;
        this.loadMore = loadMore;
        this.loading = false;
        this.hasMore = true;
        this.currentPage = 0;
        this.itemsPerPage = 20;
    }
    
    init() {
        // Setup scroll event listener
        // Initialize first batch
    }
    
    checkScroll() {
        // Check if near bottom
        // Load more if needed
    }
}
```

#### VocabularyCard Component
```javascript
class VocabularyCard {
    constructor(word, audioEnabled) {
        this.word = word;
        this.audioEnabled = audioEnabled;
    }
    
    render() {
        // Create card HTML
        // Add audio button
        // Add click handlers
    }
    
    playAudio() {
        // Play pronunciation
    }
}
```

### 3. Quiz System Corrections

#### QuestionGenerator Class
```javascript
class QuestionGenerator {
    constructor(vocabulary) {
        this.vocabulary = vocabulary;
    }
    
    generateQuestion(word) {
        // Create question object
        // Generate 4 options (1 correct, 3 wrong)
        // Ensure correct answer is included
        // Shuffle options
    }
    
    generateWrongAnswers(correctAnswer, count = 3) {
        // Filter out correct answer
        // Select random wrong answers
        // Ensure uniqueness
    }
}
```

#### ScoreTracker Class
```javascript
class ScoreTracker {
    constructor() {
        this.score = 0;
        this.totalQuestions = 0;
        this.currentQuestion = 0;
    }
    
    incrementScore() {
        this.score++;
        this.updateUI();
    }
    
    nextQuestion() {
        this.currentQuestion++;
        this.updateUI();
    }
}
```

### 4. Language System Implementation

#### LanguageManager Class
```javascript
class LanguageManager {
    constructor() {
        this.currentLanguage = 'es'; // Default Spanish
        this.translations = {
            es: {
                appTitle: 'Confuc10 ++',
                appSubtitle: 'Plataforma Avanzada de Aprendizaje de Chino',
                practiceTab: 'Práctica',
                browseTab: 'Explorar',
                quizTab: 'Quiz',
                statsTab: 'Estadísticas'
            },
            en: {
                appTitle: 'Confuc10 ++',
                appSubtitle: 'Advanced Chinese Learning Platform',
                practiceTab: 'Practice',
                browseTab: 'Browse',
                quizTab: 'Quiz',
                statsTab: 'Statistics'
            }
        };
    }
    
    changeLanguage(lang) {
        // Update current language
        // Save to localStorage
        // Update all UI elements
        // Show notification
    }
    
    getTranslation(key) {
        // Return translation for current language
        // Fallback to English if not found
    }
    
    updateUI() {
        // Update all elements with data-i18n attributes
        // Update placeholders
        // Update vocabulary meanings
    }
}
```

### 5. Theme System Implementation

#### ThemeManager Class
```javascript
class ThemeManager {
    constructor() {
        this.isDarkMode = true; // Default dark theme
        this.themes = {
            dark: {
                background: '#0f0f23',
                surface: '#1e1e3f',
                text: '#ffffff',
                primary: '#6366f1'
            },
            light: {
                background: '#ffffff',
                surface: '#f8fafc',
                text: '#1e293b',
                primary: '#6366f1'
            }
        };
    }
    
    toggleTheme() {
        // Switch between light/dark
        // Apply theme changes
        // Update button icons
        // Save preference
        // Show notification
    }
    
    applyTheme() {
        // Set CSS custom properties
        // Update data-theme attribute
        // Change logo source
        // Apply smooth transitions
    }
    
    updateThemeButton() {
        // Show/hide appropriate icons
        // Update button state
        // Add active class
    }
}
```

### 6. Audio Voice Selection System

#### AudioManager Class
```javascript
class AudioManager {
    constructor() {
        this.isEnabled = true;
        this.selectedVoice = 'auto'; // 'male', 'female', 'auto'
        this.availableVoices = [];
        this.chineseVoices = {
            male: null,
            female: null
        };
    }
    
    initializeVoices() {
        // Get available speech synthesis voices
        // Filter Chinese voices
        // Categorize by gender if possible
        // Set default preferences
    }
    
    playWithVoice(text, voiceType = null) {
        // Use specified voice type or user preference
        // Create speech synthesis utterance
        // Apply voice settings
        // Handle errors gracefully
        // Show visual feedback
    }
    
    getAvailableVoices() {
        // Return categorized Chinese voices
        // Include fallback options
    }
    
    setVoicePreference(voiceType) {
        // Update voice preference
        // Save to localStorage
        // Update UI indicators
        // Test voice with sample
    }
}
```

## Data Models

### Flashcard State
```javascript
{
    isFlipped: boolean,
    currentWord: {
        character: string,
        pinyin: string,
        english: string,
        level: number
    },
    mode: string // 'char-to-pinyin', 'char-to-english', etc.
}
```

### Browse State
```javascript
{
    vocabulary: Array<Word>,
    filteredVocabulary: Array<Word>,
    displayedItems: Array<Word>,
    currentPage: number,
    hasMore: boolean,
    loading: boolean,
    searchTerm: string,
    selectedLevel: string
}
```

### Quiz State
```javascript
{
    questions: Array<Question>,
    currentQuestion: number,
    score: number,
    totalQuestions: number,
    selectedAnswer: string,
    correctAnswer: string,
    isAnswered: boolean
}
```

### Question Model
```javascript
{
    id: string,
    word: {
        character: string,
        pinyin: string,
        english: string,
        level: number
    },
    question: string,
    options: Array<string>,
    correctAnswer: string,
    type: string // 'meaning', 'character', 'pinyin'
}
```

### Language State
```javascript
{
    currentLanguage: string, // 'es' or 'en'
    translations: Object,
    isLoading: boolean
}
```

### Theme State
```javascript
{
    isDarkMode: boolean,
    currentTheme: Object,
    transitionDuration: number
}
```

### Audio State
```javascript
{
    isEnabled: boolean,
    selectedVoice: string, // 'male', 'female', 'auto'
    availableVoices: Array<Voice>,
    chineseVoices: {
        male: Voice,
        female: Voice
    },
    isPlaying: boolean
}
```

## Error Handling

### Flashcard Errors
- Handle missing vocabulary data
- Graceful degradation if audio fails
- Fallback for animation issues

### Browse Errors
- Handle network failures for vocabulary loading
- Manage memory for large vocabulary sets
- Audio playback error handling

### Quiz Errors
- Validate question generation
- Handle insufficient vocabulary for wrong answers
- Score calculation error prevention

## Testing Strategy

### Unit Tests
- Flashcard flip functionality
- Quiz question generation
- Score calculation accuracy
- Infinite scroll logic

### Integration Tests
- Complete flashcard workflow
- Browse section with filtering
- Full quiz completion flow

### User Acceptance Tests
- Flashcard flipping smoothness
- Browse section usability
- Quiz accuracy and feedback

## Performance Considerations

### Flashcard Performance
- Optimize CSS animations for 60fps
- Minimize DOM manipulations during flip
- Efficient audio loading and caching

### Browse Performance
- Virtual scrolling for large datasets
- Lazy loading of images
- Debounced search functionality
- Memory management for infinite scroll

### Quiz Performance
- Efficient question generation algorithms
- Optimized option shuffling
- Minimal DOM updates during quiz

## Implementation Plan

### Phase 1: Flashcard Fixes
1. Fix flip animation CSS
2. Implement proper event handlers
3. Add audio integration
4. Test flip functionality

### Phase 2: Browse Enhancements
1. Implement infinite scroll
2. Add audio buttons to cards
3. Optimize vocabulary rendering
4. Test scroll performance

### Phase 3: Quiz Corrections
1. Fix question generation logic
2. Implement proper scoring
3. Improve UI feedback
4. Test quiz accuracy

### Phase 4: Language System Implementation
1. Implement LanguageManager class
2. Add translation system
3. Update UI elements with data-i18n
4. Test language switching

### Phase 5: Theme System Implementation
1. Implement ThemeManager class
2. Add light theme CSS
3. Create smooth transitions
4. Test theme persistence

### Phase 6: Audio Voice Selection
1. Implement AudioManager class
2. Add voice detection and categorization
3. Create voice selection UI
4. Test male/female voice switching

### Phase 7: Integration & Polish
1. Integrate all fixes
2. Cross-component testing
3. Performance optimization
4. Final user testing