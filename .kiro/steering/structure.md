# Project Structure

## Root Directory Organization

```
proyecto_HSK/
├── index.html              # Main application entry point
├── app.js                  # Core application logic (HSKApp class)
├── styles-v2.css          # Main stylesheet with CSS variables
├── translations.js         # Multi-language support
├── compatibility.js        # Browser compatibility checks
├── server.js              # Development server (Node.js)
├── sw.js                  # Service Worker for PWA
├── manifest.json          # PWA configuration
└── README.md              # Project documentation
```

## Data Files

```
├── hsk_vocabulary.json           # Complete vocabulary database (5000 words)
├── hsk4_official_vocabulary.json # HSK Level 4 specific data
├── hsk5_official_vocabulary.json # HSK Level 5 specific data
├── hsk6_official_vocabulary.json # HSK Level 6 specific data
└── level4_vocabulary.json        # Additional level 4 data
```

## Assets

```
├── logo_appLM.png         # Light mode app logo
├── logo_appDM.png         # Dark mode app logo
├── dev_logo.png           # Developer signature logo
└── logo_background.png    # Background logo variant
```

## Development & Testing Files

```
├── test.html              # Main test file
├── test-simple.html       # Simplified test environment
├── debug.html             # Debug interface
├── diagnostic.html        # Diagnostic tools
└── various *-fix.js files # Bug fix implementations
```

## Code Organization Conventions

### JavaScript Structure
- **Single main class**: `HSKApp` contains all application logic
- **Method grouping**: Related functionality grouped together (practice, quiz, stats)
- **Event handling**: Centralized in `setupEventListeners()`
- **State management**: Properties track current application state

### CSS Architecture
- **CSS Variables**: Consistent design system with theme support
- **Component-based**: Styles organized by UI components
- **Responsive design**: Mobile-first approach with media queries
- **Animation system**: Consistent transitions and effects

### File Naming Conventions
- **Kebab-case**: For CSS files and HTML files
- **camelCase**: For JavaScript files and methods
- **Descriptive names**: Clear purpose indication (e.g., `hsk4_official_vocabulary.json`)

## Key Directories (if they existed)
- No subdirectories - flat structure for simplicity
- All assets and code files in root directory
- Separation by file type and purpose rather than folders