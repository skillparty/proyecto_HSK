# Technology Stack

## Frontend Technologies

- **HTML5**: Semantic structure with PWA meta tags
- **CSS3**: Modern styling with CSS Grid, Flexbox, CSS variables, and animations
- **Vanilla JavaScript (ES6+)**: No frameworks, pure JavaScript with modern features
  - Classes and modules
  - Async/await
  - LocalStorage for data persistence
  - Event listeners and DOM manipulation

## Key Libraries & APIs

- **Google Fonts**: Inter (UI) and Noto Sans SC (Chinese characters)
- **Web Speech API**: Text-to-speech for pronunciation
- **Service Worker API**: PWA offline functionality
- **LocalStorage API**: User progress and settings persistence

## Data Structure

- **JSON vocabulary files**: HSK level-organized vocabulary data
- **Manifest.json**: PWA configuration
- **Service Worker**: Caching strategy for offline use

## Development Server

- **Node.js HTTP server**: Simple static file server (server.js)
- **ES modules**: Modern import/export syntax

## Common Commands

```bash
# Start development server
node server.js

# Or use Python for quick testing
python -m http.server 8000

# Or use any static file server
npx http-server
```

## Architecture Patterns

- **Single Class Architecture**: Main `HSKApp` class encapsulates all functionality
- **Component-based UI**: Tab-based navigation with reactive state management
- **Observer Pattern**: Event-driven updates for UI state changes
- **Strategy Pattern**: Different practice modes and quiz types

## Performance Considerations

- **Vocabulary caching**: Level-based vocabulary organization for faster filtering
- **Debounced search**: Prevents excessive filtering operations
- **Lazy loading**: Content loaded only when tabs are accessed
- **Service Worker caching**: Static assets cached for offline use