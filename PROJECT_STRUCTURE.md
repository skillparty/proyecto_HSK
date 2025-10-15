# 📁 Estructura del Proyecto - HSK Learning App

## Última actualización: Octubre 2025

---

## 🌲 Árbol de Directorios

```
proyecto_HSK/
│
├── .github/                          # GitHub Actions y workflows
│   └── workflows/
│       └── deploy.yml               # CI/CD para GitHub Pages
│
├── assets/                          # Recursos estáticos
│   ├── css/                        # Hojas de estilo
│   │   ├── leaderboard-styles.css         # 🏆 Estilos del leaderboard
│   │   ├── matrix-game-styles.css         # 🎮 Estilos del juego matriz
│   │   ├── styles-final.css               # ✨ Ajustes finales
│   │   ├── styles-planetscale.css         # 🎨 Tema principal (diseño chino)
│   │   ├── styles-v2.css                  # 📦 Estilos base (legacy)
│   │   └── user-profile-styles.css        # 👤 Estilos de perfil
│   │
│   ├── data/                       # Datos de vocabulario HSK
│   │   ├── hsk_vocabulary.json            # 📚 Vocabulario en inglés
│   │   ├── hsk_vocabulary_spanish.json    # 📚 Vocabulario en español
│   │   ├── hsk1_vocabulary.json           # HSK 1
│   │   ├── hsk2_vocabulary.json           # HSK 2
│   │   ├── hsk3_vocabulary.json           # HSK 3
│   │   ├── hsk4_vocabulary.json           # HSK 4
│   │   ├── hsk5_vocabulary.json           # HSK 5
│   │   └── hsk6_vocabulary.json           # HSK 6
│   │
│   ├── images/                     # Imágenes y recursos gráficos
│   │   ├── logo_appDM.png                # 🌙 Logo modo oscuro
│   │   ├── logo_appLM.png                # ☀️ Logo modo claro
│   │   └── [otras imágenes]
│   │
│   └── js/                         # Módulos JavaScript
│       ├── app.js                         # 🎯 Aplicación principal
│       ├── auth-backend.js                # 🔐 Sistema de autenticación
│       ├── compatibility.js               # 🔄 Compatibilidad legacy
│       ├── diagnostic-system.js           # 🔧 Sistema de diagnóstico
│       ├── leaderboard.js                 # 🏆 Gestión de rankings
│       ├── matrix-game.js                 # 🎮 Lógica del juego matriz
│       ├── matrix-game-ui.js              # 🎮 UI del juego matriz
│       ├── progress-integrator.js         # 🔄 Integrador de progreso
│       ├── supabase-client.js             # 💾 Cliente Supabase
│       ├── supabase-progress-sync.js      # 📡 Sincronización de progreso
│       ├── translations.js                # 🌐 Sistema de traducciones
│       └── user-progress-backend.js       # 📊 Gestión de progreso
│
├── config/                         # Configuración de la aplicación
│   ├── supabase-config.js                # ⚙️ Configuración Supabase
│   ├── sw.js                             # 📱 Service Worker (PWA)
│   └── manifest.json                     # 📱 Manifest PWA
│
├── database/                       # Esquemas de base de datos
│   └── supabase-schema.sql              # 🗄️ Schema PostgreSQL completo
│
├── docs/                           # 📚 Documentación del proyecto
│   ├── README.md                         # 📖 Índice de documentación
│   │
│   ├── setup/                            # Guías de configuración
│   │   └── SUPABASE_SETUP.md            # 🚀 Setup de Supabase
│   │
│   └── development/                      # Docs de desarrollo
│       ├── ARQUITECTURA.md               # 🏗️ Arquitectura del sistema
│       ├── MEJORAS_LEADERBOARD_STATISTICS.md
│       └── REFACTORIZACION_ANALISIS.md
│
├── .env.example                    # 🔒 Template de variables de entorno
├── .gitignore                      # 🚫 Archivos ignorados por Git
├── .nojekyll                       # ⚙️ Desactiva Jekyll en GitHub Pages
├── _config.yml                     # ⚙️ Configuración Jekyll (mínima)
├── CNAME                           # 🌐 Dominio personalizado
├── index.html                      # 🏠 Página principal de la app
├── package.json                    # 📦 Dependencias npm
├── package-lock.json               # 🔒 Lock de dependencias
└── README.md                       # 📖 Documentación principal del repo
```

---

## 📊 Estadísticas del Proyecto

### Por Tipo de Archivo

| Tipo | Cantidad | Uso |
|------|----------|-----|
| **JavaScript** | 12 archivos | Core de la aplicación |
| **CSS** | 6 archivos | Estilos y temas |
| **JSON** | ~10 archivos | Vocabulario y config |
| **Markdown** | 6 archivos | Documentación |
| **HTML** | 1 archivo | Página principal |
| **SQL** | 1 archivo | Schema de base de datos |

### Tamaño Aproximado

```
Total del proyecto: ~2 MB
├── JavaScript: ~300 KB
├── CSS: ~250 KB
├── Datos (JSON): ~1.2 MB
├── Documentación: ~50 KB
└── Configuración: <10 KB
```

---

## 🎯 Descripción de Directorios

### `/assets/css/` - Hojas de Estilo

Sistema de estilos en cascada:

1. **`styles-v2.css`** (Base legacy)
   - Estilos fundamentales
   - Reset CSS
   - Tipografía base

2. **`styles-planetscale.css`** (Tema principal)
   - Diseño tradicional chino
   - Variables CSS
   - Grid system
   - Componentes principales

3. **`styles-final.css`** (Overrides)
   - Ajustes finales
   - Correcciones específicas
   - Responsive fixes

4. **Módulos específicos:**
   - `leaderboard-styles.css` → Rankings
   - `matrix-game-styles.css` → Juego
   - `user-profile-styles.css` → Perfil

### `/assets/data/` - Vocabulario HSK

**Archivos de vocabulario:**
- Formato JSON
- Niveles HSK 1-6
- Traducciones: Inglés y Español
- ~10,000 palabras totales

**Estructura de datos:**
```json
{
  "character": "你好",
  "pinyin": "nǐ hǎo",
  "translation": "hola",
  "level": 1,
  "part_of_speech": "interjection"
}
```

### `/assets/js/` - Módulos JavaScript

#### Módulos Core

**`app.js`** (Principal)
- Inicialización de la app
- Gestión de tabs
- Sistema de flashcards
- Integración de módulos
- ~3000 líneas

**`supabase-client.js`** (Cliente DB)
- Conexión a Supabase
- Autenticación OAuth
- Queries a base de datos
- Sincronización de datos
- ~400 líneas

**`auth-backend.js`** (Autenticación)
- Manejo de sesiones
- Gestión de perfil
- Persistencia de preferencias
- ~300 líneas

#### Módulos de Features

**`leaderboard.js`** (Rankings)
- Sistema de rankings
- Filtros y ordenamiento
- Estadísticas globales
- ~350 líneas

**`matrix-game.js`** + **`matrix-game-ui.js`** (Juego)
- Lógica del juego
- Renderizado de UI
- Sistema de puntuación
- ~500 líneas combinadas

**`translations.js`** (i18n)
- Cambio de idioma
- Traducción de UI
- Soporte ES/EN
- ~200 líneas

#### Módulos de Utilidad

**`supabase-progress-sync.js`**
- Sincronización automática

**`progress-integrator.js`**
- Integración progreso local/cloud

**`compatibility.js`**
- Compatibilidad navegadores

**`diagnostic-system.js`**
- Sistema de debugging

### `/config/` - Configuración

**`supabase-config.js`**
```javascript
{
  url: 'https://[proyecto].supabase.co',
  anonKey: 'ey...',
  auth: { providers: ['github'] }
}
```

**`sw.js`** (Service Worker)
- Estrategia de caché
- Funcionamiento offline
- Actualización automática

**`manifest.json`** (PWA)
- Metadatos de la app
- Iconos
- Tema y colores

### `/database/` - Base de Datos

**`supabase-schema.sql`**
- 7 tablas principales
- 1 vista (leaderboard)
- 2 funciones RPC
- Políticas RLS
- ~350 líneas SQL

### `/docs/` - Documentación

**Organización:**
- `setup/` → Guías de configuración
- `development/` → Docs técnicas

**Archivos clave:**
- `README.md` → Índice general
- `ARQUITECTURA.md` → Estructura técnica
- `SUPABASE_SETUP.md` → Guía de setup

---

## 🔄 Flujo de Archivos

### Al Cargar la Aplicación

```
1. index.html
   ↓
2. Supabase CDN
   ↓
3. config/supabase-config.js
   ↓
4. assets/js/supabase-client.js
   ↓
5. assets/js/translations.js
   ↓
6. assets/js/app.js
   ↓
7. assets/data/hsk_vocabulary_[lang].json
   ↓
8. [Otros módulos según necesidad]
```

### Orden de Carga de Scripts (index.html)

```html
<!-- 1. CDN Externo -->
<script src="supabase-js@2"></script>

<!-- 2. Configuración -->
<script src="config/supabase-config.js"></script>
<script src="assets/js/supabase-client.js"></script>

<!-- 3. Core -->
<script src="assets/js/translations.js"></script>
<script src="assets/js/supabase-progress-sync.js"></script>
<script src="assets/js/progress-integrator.js"></script>

<!-- 4. Autenticación -->
<script src="assets/js/auth-backend.js"></script>
<script src="assets/js/user-progress-backend.js"></script>

<!-- 5. Aplicación Principal -->
<script src="assets/js/diagnostic-system.js"></script>
<script src="assets/js/app.js"></script>

<!-- 6. Features -->
<script src="assets/js/compatibility.js"></script>
<script src="assets/js/matrix-game.js"></script>
<script src="assets/js/matrix-game-ui.js"></script>
<script src="assets/js/leaderboard.js"></script>
```

---

## 📝 Convenciones de Nombres

### Archivos

```
kebab-case.js          → Módulos JavaScript
PascalCase.js          → Clases (si aplica)
UPPERCASE.md           → Docs importantes
lowercase.json         → Datos y configuración
```

### Directorios

```
lowercase/             → Todos los directorios
no-spaces-or-special/  → Sin espacios ni caracteres especiales
```

---

## 🧹 Archivos Eliminados (Refactorización v3.0)

Total: **~45 archivos obsoletos**

### Categorías:
- ❌ Archivos .md vacíos (17)
- ❌ JS duplicados en raíz (8)
- ❌ Archivos de debug (5)
- ❌ Netlify/Vercel config (10+)
- ❌ Backend Express.js obsoleto (5)

---

## ✅ Mejores Prácticas

### Agregar Nuevos Archivos

1. **JavaScript:** Siempre en `assets/js/`
2. **CSS:** Siempre en `assets/css/`
3. **Datos:** Siempre en `assets/data/`
4. **Docs:** Siempre en `docs/`

### Naming Conventions

```javascript
// Bueno ✅
assets/js/new-feature-manager.js
assets/css/new-feature-styles.css
docs/development/NEW_FEATURE.md

// Malo ❌
new-feature.js (en raíz)
NewFeature.js (PascalCase sin razón)
new feature manager.js (espacios)
```

### Organización de Código

```javascript
// Orden en archivos JS:
1. Imports/requires
2. Constantes
3. Clase o funciones principales
4. Funciones auxiliares
5. Exports
```

---

## 🔍 Búsqueda Rápida

### Por Funcionalidad

| Funcionalidad | Archivo(s) |
|---------------|-----------|
| Flashcards | `app.js` |
| Autenticación | `supabase-client.js`, `auth-backend.js` |
| Rankings | `leaderboard.js` |
| Juego Matriz | `matrix-game.js`, `matrix-game-ui.js` |
| Traducciones | `translations.js` |
| Progreso | `user-progress-backend.js` |
| Sincronización | `supabase-progress-sync.js` |
| Base de Datos | `database/supabase-schema.sql` |

### Por Tecnología

| Tecnología | Ubicación |
|------------|-----------|
| PostgreSQL | `database/supabase-schema.sql` |
| Supabase JS | `assets/js/supabase-client.js` |
| OAuth | `supabase-client.js`, `config/supabase-config.js` |
| PWA | `config/sw.js`, `config/manifest.json` |
| i18n | `assets/js/translations.js` |

---

## 📦 Dependencias

### NPM Packages

```json
{
  "@supabase/supabase-js": "^2.x",
  "otros": "según package.json"
}
```

### CDN Resources

- Supabase JS Client (v2)
- Fonts (si aplica)

---

## 🚀 Deployment

### GitHub Pages

**Build:**
- Automático via GitHub Actions
- Trigger: Push a `main` branch
- Workflow: `.github/workflows/deploy.yml`

**URL:**
- Production: `https://skillparty.github.io/proyecto_HSK/`

---

**Última actualización:** Octubre 2025  
**Versión:** 3.0.1  
**Mantenedor:** Jose Alejandro Rollano Revollo
