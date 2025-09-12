// ASCII Art Library for HSK Learning App
// Elaborate ASCII drawings to replace emojis

const ASCIIArt = {
    // Navigation and Home Cards
    practice: `
    ┌─────────────┐
    │ ╔═══════╗   │
    │ ║ 汉 字 ║   │
    │ ║       ║   │
    │ ╚═══════╝   │
    │   PRACTICE  │
    └─────────────┘`,
    
    browse: `
    ┌─────────────┐
    │  ___   ___  │
    │ |   | |   | │
    │ | 书 | | 本 | │
    │ |___| |___| │
    │   LIBRARY   │
    └─────────────┘`,
    
    quiz: `
    ┌─────────────┐
    │    ╭─╮     │
    │   ╱   ╲    │
    │  ╱ ? ? ╲   │
    │ ╱  ___  ╲  │
    │ ╲       ╱  │
    │  ╲_____╱   │
    │    QUIZ     │
    └─────────────┘`,
    
    matrix: `
    ┌─────────────┐
    │ ┌─┬─┬─┬─┐   │
    │ ├─┼─┼─┼─┤   │
    │ ├─┼─┼─┼─┤   │
    │ └─┴─┴─┴─┘   │
    │   MATRIX    │
    └─────────────┘`,
    
    stats: `
    ┌─────────────┐
    │     ╱╲      │
    │    ╱  ╲     │
    │   ╱    ╲    │
    │  ╱______╲   │
    │ ╱        ╲  │
    │╱__________╲ │
    │  PROGRESS   │
    └─────────────┘`,
    
    // Compact versions for inline use
    practiceCompact: `[卡]`,
    browseCompact: `[書]`,
    quizCompact: `[?]`,
    matrixCompact: `[#]`,
    statsCompact: `[^]`,
    
    // Game elements
    target: `
    ┌───────────┐
    │     ●     │
    │   ● ● ●   │
    │ ● ● ● ● ● │
    │   ● ● ●   │
    │     ●     │
    └───────────┘`,
    
    // Status indicators
    success: `
    ┌─────┐
    │  ✓  │
    │ ╱ ╲ │
    │╱   ╲│
    └─────┘`,
    
    error: `
    ┌─────┐
    │ ╲ ╱ │
    │  ╳  │
    │ ╱ ╲ │
    └─────┘`,
    
    heart: `
    ┌─────────┐
    │ ╭─╮ ╭─╮ │
    │ │ ╰─╯ │ │
    │ ╰─────╯ │
    │  ╲___╱  │
    └─────────┘`,
    
    // Difficulty levels
    easy: `
    ┌─────┐
    │  ☺  │
    │ ╱─╲ │
    │╱   ╲│
    └─────┘`,
    
    normal: `
    ┌─────┐
    │  ◉  │
    │ ╱─╲ │
    │╱   ╲│
    └─────┘`,
    
    hard: `
    ┌─────┐
    │  ▲  │
    │ ╱█╲ │
    │╱███╲│
    └─────┘`,
    
    // Action buttons
    play: `
    ┌─────┐
    │ ▶   │
    │ ▶▶  │
    │ ▶   │
    └─────┘`,
    
    pause: `
    ┌─────┐
    │ ║ ║ │
    │ ║ ║ │
    │ ║ ║ │
    └─────┘`,
    
    stop: `
    ┌─────┐
    │ ███ │
    │ ███ │
    │ ███ │
    └─────┘`,
    
    // Awards and achievements
    trophy: `
    ┌─────────┐
    │   ╭─╮   │
    │  ╱   ╲  │
    │ ╱ ★ ★ ╲ │
    │ ╲     ╱ │
    │  ╲___╱  │
    │   ║║║   │
    │  ╔═══╗  │
    └─────────┘`,
    
    star: `
    ┌─────┐
    │  ★  │
    │ ╱█╲ │
    │╱███╲│
    │╲███╱│
    │ ╲█╱ │
    │  ▼  │
    └─────┘`,
    
    // Lightning/speed
    lightning: `
    ┌─────┐
    │ ╱╲  │
    │╱  ╲ │
    │╲  ╱ │
    │ ╲╱  │
    │  ╲  │
    └─────┘`,
    
    // Fire/streak
    fire: `
    ┌─────┐
    │ ╱╲╱╲│
    │╱╲╱╲╱│
    │╲╱╲╱╲│
    │ ╲╱╲╱│
    │  ╲╱ │
    └─────┘`,
    
    // Rocket/launch
    rocket: `
    ┌─────┐
    │  ▲  │
    │ ╱█╲ │
    │ ║█║ │
    │ ║█║ │
    │ ╲█╱ │
    │ ╱╲╱╲│
    └─────┘`,
    
    // Chinese-themed decorations
    dragon: `
    ┌───────────┐
    │   ╭─╮     │
    │  ╱   ╲╭─╮ │
    │ ╱ ● ● ║ ║ │
    │ ╲  ▼  ║ ║ │
    │  ╲___╱╰─╯ │
    │ ╱╲╱╲╱╲╱╲ │
    └───────────┘`,
    
    // Compact single-line versions for buttons
    heartInline: `♡`,
    checkInline: `✓`,
    crossInline: `✗`,
    starInline: `★`,
    targetInline: `◎`,
    fireInline: `▲`,
    lightningInline: `⚡`,
    
    // Method to get ASCII art by name
    get: function(name) {
        return this[name] || name;
    },
    
    // Method to get compact version
    getCompact: function(name) {
        const compactName = name + 'Compact';
        return this[compactName] || this.get(name);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASCIIArt;
} else {
    window.ASCIIArt = ASCIIArt;
}
