// Compatibility layer for class name changes
document.addEventListener('DOMContentLoaded', function() {
    // Map old class names to new ones
    const classMap = {
        'tab-btn': 'nav-tab',
        'tab-content': 'tab-panel',
        'container': 'app-container',
        'header': 'app-header',
        'flashcard-container': 'flashcard-container',
        'flashcard': 'flashcard',
        'vocab-item': 'vocab-card',
        'srs-buttons': 'action-buttons',
        'simple-buttons': 'action-buttons'
    };

    // Update querySelectorAll usage in the app
    const originalQuerySelectorAll = document.querySelectorAll.bind(document);
    document.querySelectorAll = function(selector) {
        // Check if selector uses old class names
        for (const [oldClass, newClass] of Object.entries(classMap)) {
            if (selector.includes(`.${oldClass}`)) {
                selector = selector.replace(`.${oldClass}`, `.${newClass}`);
            }
        }
        return originalQuerySelectorAll(selector);
    };

    // Update querySelector usage
    const originalQuerySelector = document.querySelector.bind(document);
    document.querySelector = function(selector) {
        // Check if selector uses old class names
        for (const [oldClass, newClass] of Object.entries(classMap)) {
            if (selector.includes(`.${oldClass}`)) {
                selector = selector.replace(`.${oldClass}`, `.${newClass}`);
            }
        }
        return originalQuerySelector(selector);
    };

    // Fix flashcard inner structure
    setTimeout(() => {
        const flashcard = document.querySelector('.flashcard');
        if (flashcard && !flashcard.querySelector('.flashcard-inner')) {
            const inner = document.createElement('div');
            inner.className = 'flashcard-inner';
            
            // Move existing content to inner
            const children = Array.from(flashcard.children);
            children.forEach(child => {
                inner.appendChild(child);
            });
            
            flashcard.appendChild(inner);
        }
        
        // Override the flipCard method to work with flashcard-inner
        if (window.app && window.app.flipCard) {
            const originalFlipCard = window.app.flipCard.bind(window.app);
            window.app.flipCard = function() {
                if (!this.currentWord) return;
                
                const flashcard = document.querySelector('.flashcard');
                const flashcardInner = flashcard.querySelector('.flashcard-inner');
                
                if (flashcardInner) {
                    flashcard.classList.add('flipped');
                } else {
                    // Fallback to original method
                    flashcard.classList.add('flipped');
                }
                
                this.isFlipped = true;
                this.updateControlButtons();
            };
        }
        
        // Also update the updateCard method
        if (window.app && window.app.updateCard) {
            const originalUpdateCard = window.app.updateCard.bind(window.app);
            window.app.updateCard = function() {
                // Call original method
                originalUpdateCard();
                
                // Ensure flipped class is removed
                const flashcard = document.querySelector('.flashcard');
                if (flashcard) {
                    flashcard.classList.remove('flipped');
                }
            };
        }
    }, 500);

    // Update flashcard faces
    const frontFace = document.querySelector('.card-front');
    const backFace = document.querySelector('.card-back');
    
    if (frontFace && !frontFace.classList.contains('flashcard-front')) {
        frontFace.classList.add('flashcard-front');
        frontFace.classList.remove('card-front');
    }
    
    if (backFace && !backFace.classList.contains('flashcard-back')) {
        backFace.classList.add('flashcard-back');
        backFace.classList.remove('card-back');
    }

    // Fix SRS buttons display
    const srsButtons = document.getElementById('srs-buttons');
    const simpleButtons = document.getElementById('simple-buttons');
    
    if (srsButtons) {
        srsButtons.classList.add('srs-buttons');
    }
    
    if (simpleButtons) {
        simpleButtons.classList.add('simple-buttons');
    }
});
