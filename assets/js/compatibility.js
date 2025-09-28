// Compatibility layer for class name changes
document.addEventListener('DOMContentLoaded', function() {
    // Simple compatibility for any old references
    console.log('Compatibility layer loaded - minimal interference mode');
    
    // Ensure proper flashcard functionality without interfering
    setTimeout(() => {
        const flashcard = document.querySelector('.flashcard');
        if (flashcard) {
            // Remove any conflicting classes that might interfere
            flashcard.classList.remove('flipped');
        }
    }, 100);
});
