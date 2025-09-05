# HSK Learning App - GitHub Pages Deployment Guide

## 🚀 Live App
The HSK Learning App is deployed at: https://skillparty.github.io/proyecto_HSK/

## 🔧 Setup Instructions

### 1. GitHub OAuth Configuration (Required for authentication)

To enable user authentication and progress saving, you need to create a GitHub OAuth App:

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App with these settings:
   - **Application name:** HSK Learning App
   - **Homepage URL:** `https://skillparty.github.io/proyecto_HSK/`
   - **Authorization callback URL:** `https://skillparty.github.io/proyecto_HSK/`
3. Copy the Client ID
4. Access the app with: `https://skillparty.github.io/proyecto_HSK/?client_id=YOUR_CLIENT_ID_HERE`

### 2. Features Available

#### 🔐 Authentication System
- **Guest Mode:** Use the app without signing in (local storage only)
- **GitHub OAuth:** Sign in to sync progress across devices
- **Cloud Sync:** Authenticated users can save/load progress via GitHub Gists

#### 📚 Learning Features
- **6 HSK Levels:** Complete vocabulary for HSK 1-6
- **Multiple Practice Modes:** Character recognition, pinyin, translations
- **Smart Flashcards:** "I Know" / "I Don't Know" buttons with progress tracking
- **Language Support:** Full English/Spanish interface switching
- **Statistics:** Real-time progress tracking and streaks
- **Vocabulary Browser:** Search and explore all HSK vocabulary

#### 💾 Data Persistence
- **Local Storage:** All progress saved locally for guest users
- **Cloud Sync:** Authenticated users get automatic cloud backup
- **Cross-Device:** Access your progress from any device when signed in

### 3. Technical Architecture

#### Frontend (Static)
- **Vanilla JavaScript:** No external frameworks
- **PWA Ready:** Service worker and manifest included
- **Responsive Design:** Works on desktop and mobile
- **GitHub Pages Compatible:** Pure static deployment

#### Authentication Flow
- **OAuth 2.0:** Standard GitHub authentication
- **Token Simulation:** Client-side only (no backend required)
- **Secure State:** CSRF protection with state parameter

#### Data Storage
- **Local:** localStorage for guest users
- **Cloud:** GitHub Gists API for authenticated users (planned)
- **Preferences:** Language, theme, and study settings

### 4. Development Mode

For local development:
```bash
# Clone the repository
git clone https://github.com/skillparty/proyecto_HSK.git
cd proyecto_HSK

# Start local server
PORT=5089 node server.js

# Access at http://localhost:5089
```

### 5. Environment Detection

The app automatically detects the deployment environment:
- **Development:** `localhost` or `127.0.0.1`
- **Production:** `skillparty.github.io` domain

OAuth redirect URIs are set automatically based on the environment.

## 🔄 Deployment Process

1. **Automatic:** Push to `main` branch triggers GitHub Actions
2. **Build:** Jekyll processes the static files
3. **Deploy:** Files are published to GitHub Pages
4. **Live:** App is available at the GitHub Pages URL

## 📱 Progressive Web App (PWA)

The app includes PWA features:
- **Installable:** Add to home screen on mobile
- **Offline Ready:** Service worker for offline functionality
- **App-like:** Full screen and native feel

## 🛠️ Troubleshooting

### OAuth Issues
- Ensure callback URL matches exactly in GitHub OAuth settings
- Check that Client ID is provided in URL parameter
- Verify the app is accessed via HTTPS (GitHub Pages requirement)

### Performance
- All resources are versioned for cache busting
- Fonts and styles are optimized for fast loading
- Vocabulary data is loaded asynchronously

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used throughout
- Fallbacks provided for older browsers

## 📊 Analytics & Monitoring

- **Console Logging:** Detailed logs for debugging
- **Error Handling:** Graceful fallbacks for network issues
- **User Feedback:** Visual confirmations for all actions

## 🔮 Future Enhancements

- [ ] Backend integration for true OAuth token exchange
- [ ] Advanced SRS (Spaced Repetition System)
- [ ] Audio pronunciation guides
- [ ] Community features and shared progress
- [ ] Mobile app versions (React Native/Flutter)

---

Made with ❤️ by the Confuc10++ Team
