# Arquitectura del Proyecto - HSK Learning App

## 🏗️ Estructura del Proyecto

```
proyecto_HSK/
├── .github/workflows/        # GitHub Actions CI/CD
│   └── deploy.yml           # Auto-deploy a GitHub Pages
│
├── assets/                  # Recursos estáticos
│   ├── css/                # Estilos
│   │   ├── styles-v2.css           # Estilos base (legacy)
│   │   ├── styles-planetscale.css  # Tema principal con diseño chino
│   │   ├── styles-final.css        # Ajustes finales
│   │   ├── leaderboard-styles.css  # Estilos del leaderboard
│   │   ├── matrix-game-styles.css  # Estilos del juego matriz
│   │   └── user-profile-styles.css # Estilos de perfil de usuario
│   │
│   ├── data/               # Datos de vocabulario
│   │   ├── hsk_vocabulary.json          # Vocabulario en inglés
│   │   ├── hsk_vocabulary_spanish.json  # Vocabulario en español
│   │   └── [otros archivos HSK]
│   │
│   ├── images/             # Imágenes y logos
│   │   ├── logo_appDM.png  # Logo modo oscuro
│   │   ├── logo_appLM.png  # Logo modo claro
│   │   └── [otras imágenes]
│   │
│   └── js/                 # JavaScript modularizado
│       ├── app.js                      # Aplicación principal
│       ├── supabase-client.js          # Cliente Supabase
│       ├── auth-backend.js             # Autenticación
│       ├── user-progress-backend.js    # Progreso de usuario
│       ├── leaderboard.js              # Sistema de rankings
│       ├── matrix-game.js              # Lógica del juego
│       ├── matrix-game-ui.js           # UI del juego
│       ├── translations.js             # Sistema i18n
│       ├── supabase-progress-sync.js   # Sincronización
│       ├── progress-integrator.js      # Integrador de progreso
│       ├── compatibility.js            # Compatibilidad legacy
│       └── diagnostic-system.js        # Sistema de diagnóstico
│
├── config/                 # Configuración
│   ├── supabase-config.js  # Config de Supabase
│   ├── sw.js              # Service Worker (PWA)
│   └── manifest.json      # Manifest PWA
│
├── database/              # Esquemas de base de datos
│   └── supabase-schema.sql # Schema PostgreSQL completo
│
├── docs/                  # 📚 Documentación
│   ├── setup/
│   │   └── SUPABASE_SETUP.md
│   └── development/
│       ├── MEJORAS_LEADERBOARD_STATISTICS.md
│       └── REFACTORIZACION_ANALISIS.md
│
├── .env.example           # Template de variables de entorno
├── .gitignore            # Archivos ignorados por Git
├── .nojekyll             # Desactiva Jekyll en GitHub Pages
├── _config.yml           # Configuración Jekyll (mínima)
├── CNAME                 # Dominio personalizado (si aplica)
├── index.html            # Página principal
├── package.json          # Dependencias npm
├── package-lock.json     # Lock de dependencias
├── README.md             # Documentación principal
└── ARQUITECTURA.md       # Este archivo
```

---

## 🔄 Flujo de Datos

### 1. Inicialización de la Aplicación

```
index.html
    ↓
Carga Supabase CDN
    ↓
supabase-config.js → Configura cliente
    ↓
supabase-client.js → Inicializa conexión
    ↓
app.js → Inicializa aplicación
    ↓
translations.js → Carga idioma
    ↓
auth-backend.js → Verifica autenticación
```

### 2. Autenticación de Usuario

```
Usuario hace clic en "Sign in with GitHub"
    ↓
supabase-client.js → signInWithGitHub()
    ↓
Redirect a GitHub OAuth
    ↓
Callback a Supabase
    ↓
supabase-client.js → onAuthStateChange()
    ↓
auth-backend.js → Actualiza UI
    ↓
user-progress-backend.js → Carga progreso
```

### 3. Estudio de Flashcards

```
Usuario selecciona HSK nivel
    ↓
app.js → loadVocabulary(level)
    ↓
Carga desde assets/data/hsk_vocabulary_[lang].json
    ↓
Usuario marca tarjeta (know/don't know)
    ↓
app.js → markAsKnown(isKnown)
    ↓
├─ Local: Actualiza stats en localStorage
└─ Supabase: supabase-client.updateProgress()
    ↓
Supabase → RPC: update_user_progress()
    ↓
Base de datos actualizada
```

### 4. Leaderboard

```
Usuario abre tab Leaderboard
    ↓
leaderboard.js → loadLeaderboard()
    ↓
supabase-client.js → getLeaderboard()
    ↓
Supabase → SELECT FROM leaderboard_view
    ↓
leaderboard.js → renderLeaderboard()
    ↓
UI actualizada con rankings
```

### 5. Statistics

```
Usuario abre tab Statistics
    ↓
app.js → updateStats()
    ↓
supabase-client.js → getUserStatistics()
    ↓
Supabase → SELECT FROM user_progress
    ↓
app.js → renderiza estadísticas por nivel
```

---

## 🗄️ Modelo de Datos (Supabase)

### Tablas Principales

#### `user_profiles`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- username (TEXT)
- display_name (TEXT)
- avatar_url (TEXT)
- github_username (TEXT)
- preferred_language (TEXT)
```

#### `user_progress`
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- hsk_level (INTEGER 1-6)
- total_words_studied (INTEGER)
- correct_answers (INTEGER)
- incorrect_answers (INTEGER)
- current_streak (INTEGER)
- best_streak (INTEGER)
- total_time_spent (INTEGER)
- last_study_date (TIMESTAMP)
```

#### `word_progress`
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- word_character (TEXT)
- word_pinyin (TEXT)
- hsk_level (INTEGER)
- times_seen (INTEGER)
- times_correct (INTEGER)
- times_incorrect (INTEGER)
- confidence_level (INTEGER 0-5)
```

### Vista Leaderboard

#### `leaderboard_view`
```sql
SELECT:
  - user_id
  - username
  - display_name
  - avatar_url
  - SUM(total_words_studied) as total_words
  - AVG(accuracy) as accuracy_rate
  - MAX(best_streak) as best_streak
  - SUM(total_time_spent) as total_time
  - COUNT(levels_studied)
GROUP BY user_id
ORDER BY total_words DESC
```

---

## 🧩 Módulos JavaScript

### Core Modules

#### `app.js` - Aplicación Principal
- **Responsabilidades:**
  - Inicialización de la app
  - Gestión de tabs y navegación
  - Lógica de flashcards
  - Sistema de práctica
  - Integración de módulos
- **Dependencias:**
  - supabase-client.js
  - translations.js
  - auth-backend.js
  - user-progress-backend.js

#### `supabase-client.js` - Cliente Supabase
- **Responsabilidades:**
  - Conexión a Supabase
  - Autenticación OAuth
  - Queries a base de datos
  - Sincronización de progreso
  - Actualización de UI de auth
- **Métodos principales:**
  - `initialize()`
  - `signInWithGitHub()`
  - `signOut()`
  - `getLeaderboard()`
  - `getUserStatistics()`
  - `updateProgress()`

#### `auth-backend.js` - Autenticación
- **Responsabilidades:**
  - Manejo de sesiones
  - Gestión de perfil de usuario
  - Persistencia de preferencias
- **Integración:** Supabase Auth

#### `leaderboard.js` - Sistema de Rankings
- **Responsabilidades:**
  - Carga de rankings
  - Renderizado de leaderboard
  - Filtros y ordenamiento
  - Estadísticas globales
- **Datos:** Vista `leaderboard_view`

### Feature Modules

#### `matrix-game.js` + `matrix-game-ui.js`
- **Responsabilidades:**
  - Lógica del juego de matriz
  - Renderizado de UI
  - Sistema de puntuación
  - Guardado de scores
- **Integración:** Supabase (tabla `matrix_scores`)

#### `translations.js` - Internacionalización
- **Responsabilidades:**
  - Cambio de idioma (ES/EN)
  - Traducción de UI
  - Gestión de textos
- **Soporte:** Español, Inglés

### Utility Modules

#### `supabase-progress-sync.js`
- Sincronización automática de progreso

#### `progress-integrator.js`
- Integración entre progreso local y Supabase

#### `compatibility.js`
- Compatibilidad con navegadores antiguos

#### `diagnostic-system.js`
- Sistema de diagnóstico y debugging

---

## 🎨 Sistema de Estilos

### CSS Architecture

1. **`styles-v2.css`** - Base styles (legacy)
2. **`styles-planetscale.css`** - Tema principal
   - Diseño tradicional chino
   - Variables CSS
   - Grid system
   - Components base
3. **`styles-final.css`** - Overrides y ajustes finales
4. **Module-specific CSS:**
   - `leaderboard-styles.css`
   - `matrix-game-styles.css`
   - `user-profile-styles.css`

### Color Palette
```css
--chinese-red: rgb(196, 30, 58)
--gold: rgb(255, 215, 0)
--bronze: rgb(139, 69, 19)
--dark-bg: #0f0f23
--surface: #1e1e3f
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

```sql
-- Users can only view/edit their own data
CREATE POLICY "Users can view own progress" 
ON user_progress FOR SELECT 
USING (auth.uid() = user_id);

-- Leaderboard is public (read-only)
CREATE POLICY "Anyone can view leaderboard" 
ON user_progress FOR SELECT 
USING (true);
```

### Variables de Entorno

```bash
# .env.example
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
GITHUB_CLIENT_ID=your_github_client_id
```

**⚠️ Nunca commitear `.env` al repositorio**

---

## 🚀 Deployment

### GitHub Pages

1. **Build automático:** GitHub Actions workflow
2. **Deploy:** Push a `main` branch
3. **URL:** https://skillparty.github.io/proyecto_HSK/

### Workflow CI/CD

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    - Checkout code
    - Deploy to GitHub Pages
```

---

## 📱 Progressive Web App (PWA)

### Service Worker
- **Archivo:** `config/sw.js`
- **Caché:** Estrategia offline-first
- **Actualización:** Automática

### Manifest
- **Archivo:** `config/manifest.json`
- **Instalable:** Sí
- **Iconos:** Múltiples tamaños

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Autenticación GitHub funciona
- [ ] Flashcards cargan correctamente
- [ ] Progreso se sincroniza
- [ ] Leaderboard muestra datos
- [ ] Statistics son precisas
- [ ] Matrix Game funcional
- [ ] Cambio de idioma funciona
- [ ] Modo offline funcional (PWA)

---

## 📊 Performance

### Optimizaciones

1. **Lazy Loading:** Imágenes y módulos
2. **Code Splitting:** Módulos independientes
3. **Caché:** Service Worker
4. **CDN:** Supabase para archivos estáticos
5. **Minificación:** CSS y JS (en producción)

### Métricas

- **First Paint:** < 1s
- **Time to Interactive:** < 2s
- **Lighthouse Score:** > 90

---

## 🔄 Estado y Sincronización

### Local Storage
```javascript
{
  "hsk-stats": { totalStudied, correctAnswers, streak... },
  "hsk-daily-progress": { lastStudyDate, activeDays... },
  "hsk-theme": "dark" | "light",
  "hsk-language": "es" | "en"
}
```

### Supabase (Cloud)
- Progreso real-time
- Sincronización automática
- Backup en la nube

---

## 🛠️ Herramientas de Desarrollo

### Requisitos
- Node.js 16+
- npm 7+
- Git
- Cuenta Supabase
- GitHub OAuth App

### Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo local
npm start  # o python -m http.server 5089

# Lint (si configurado)
npm run lint

# Build (si aplicable)
npm run build
```

---

## 📚 Recursos Adicionales

- [Documentación Supabase](https://supabase.com/docs)
- [GitHub Pages Docs](https://docs.github.com/pages)
- [HSK Vocabulary Standards](https://www.chinesetest.cn/index.do)

---

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crea Pull Request

---

## 📝 Convenciones de Código

### JavaScript
- ES6+ syntax
- Async/await para promesas
- Comentarios JSDoc
- Nombres descriptivos

### CSS
- BEM methodology (opcional)
- Variables CSS para colores
- Mobile-first approach

### Git Commits
```
feat: Nueva funcionalidad
fix: Corrección de bug
refactor: Refactorización
docs: Documentación
style: Estilos/formato
test: Tests
```

---

## 🐛 Debugging

### Console Logs
```javascript
console.log('✅ Success');
console.error('❌ Error');
console.warn('⚠️ Warning');
console.log('🔍 Debug info');
```

### Supabase Dashboard
- **Logs:** Real-time database logs
- **Auth:** Ver sesiones activas
- **Database:** Ejecutar queries directas

---

**Última actualización:** Octubre 2025  
**Versión:** 3.0.1  
**Mantenedor:** Jose Alejandro Rollano Revollo
