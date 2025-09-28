# 🇨🇳 Confuc10++ - HSK Learning Platform

Una aplicación web moderna para el aprendizaje del idioma chino basada en el sistema HSK (Hanyu Shuiping Kaoshi).

## 📁 Estructura del Proyecto

```
proyecto_HSK/
├── 📄 index.html                 # Página principal
├── 📄 README.md                  # Este archivo
├── 📄 package.json               # Dependencias del proyecto
├── 📄 netlify.toml               # Configuración de Netlify
├── 📄 _config.yml                # Configuración de Jekyll
├── 📄 .nojekyll                  # Desactiva Jekyll en GitHub Pages
├── 📄 CNAME                      # Dominio personalizado
│
├── 📂 assets/                    # Recursos estáticos
│   ├── 📂 css/ (6 archivos)      # Hojas de estilo
│   │   ├── styles-v2.css         # Estilos base
│   │   ├── styles-final.css      # Estilos adicionales
│   │   ├── styles-planetscale.css # Tema principal
│   │   ├── matrix-game-styles.css # Estilos del juego Matrix
│   │   ├── leaderboard-styles.css # Estilos del leaderboard
│   │   └── user-profile-styles.css # Estilos del perfil
│   │
│   ├── 📂 js/ (11 archivos)      # Scripts JavaScript
│   │   ├── app.js                # Aplicación principal
│   │   ├── translations.js       # Sistema de traducciones
│   │   ├── auth-backend.js       # Autenticación GitHub
│   │   ├── user-progress-backend.js # Progreso del usuario
│   │   ├── supabase-progress-sync.js # Sincronización Supabase
│   │   ├── progress-integrator.js # Integrador de progreso
│   │   ├── diagnostic-system.js  # Sistema de diagnóstico
│   │   ├── compatibility.js      # Compatibilidad
│   │   ├── matrix-game.js        # Juego Matrix
│   │   ├── matrix-game-ui.js     # UI del juego Matrix
│   │   └── leaderboard.js        # Sistema de clasificaciones
│   │
│   ├── 📂 images/ (4 archivos)   # Imágenes y logos
│   │   ├── logo_appDM.png        # Logo modo oscuro
│   │   ├── logo_appLM.png        # Logo modo claro
│   │   ├── dev_logo.png          # Logo del desarrollador
│   │   └── logoBACKGROUND.png    # Imagen de fondo
│   │
│   └── 📂 data/ (5 archivos)     # Datos de vocabulario
│       ├── hsk_vocabulary_spanish.json # Vocabulario HSK en español
│       ├── hsk_vocabulary.json   # Vocabulario HSK en inglés
│       ├── hsk4_official_vocabulary.json # HSK 4 oficial
│       ├── hsk5_official_vocabulary.json # HSK 5 oficial
│       └── hsk6_official_vocabulary.json # HSK 6 oficial
│
├── 📂 config/ (2 archivos)       # Archivos de configuración
│   ├── manifest.json             # Manifiesto PWA
│   └── sw.js                     # Service Worker
│
└── 📂 netlify/ (4 archivos)      # Netlify Functions
    └── functions/                # Funciones serverless
        ├── api.js                # API principal
        ├── auth.js               # Autenticación OAuth
        ├── debug-env-vars.js     # Debug variables
        └── package.json          # Dependencias functions
```

## 🚀 Características Principales

### 🎯 **Aprendizaje HSK**
- ✅ **Flashcards interactivas** con caracteres chinos, pinyin y traducciones
- ✅ **6 niveles HSK** completos (HSK 1-6)
- ✅ **Modo bilingüe** - Español e Inglés
- ✅ **Audio nativo** con síntesis de voz china
- ✅ **Progreso personalizado** con estadísticas detalladas

### 🎮 **Gamificación**
- 🎯 **Juego Matrix** - Encuentra caracteres en tiempo real
- 🏆 **Sistema de clasificaciones** con rankings globales
- 📊 **Estadísticas avanzadas** y seguimiento de progreso
- 🎖️ **Sistema de logros** y medallas

### 🔐 **Autenticación y Sincronización**
- 🔑 **Login con GitHub** OAuth 2.0
- ☁️ **Sincronización en la nube** con Supabase
- 👤 **Perfiles de usuario** personalizados
- 📱 **Progreso multi-dispositivo**

### 🎨 **Interfaz Moderna**
- 🌙 **Tema oscuro/claro** adaptable
- 📱 **Diseño responsive** para móviles y desktop
- ⚡ **PWA** - Instalable como app nativa
- 🎭 **Animaciones fluidas** y transiciones

## 🛠️ Tecnologías Utilizadas

### **Frontend:**
- **HTML5** + **CSS3** + **JavaScript ES6+**
- **PWA** (Progressive Web App)
- **Service Workers** para funcionalidad offline
- **Web Speech API** para pronunciación

### **Backend:**
- **Netlify Functions** (Serverless)
- **Supabase** (Base de datos y autenticación)
- **GitHub OAuth** (Autenticación social)

### **Deployment:**
- **Netlify** - Hosting principal
- **GitHub Pages** - Hosting alternativo
- **Vercel** - Hosting de respaldo

## 🚀 Instalación y Uso

### **1. Clonar el repositorio:**
```bash
git clone https://github.com/skillparty/proyecto_HSK.git
cd proyecto_HSK
```

### **2. Instalar dependencias:**
```bash
npm install
```

### **3. Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### **4. Ejecutar localmente:**
```bash
# Servidor simple
python3 -m http.server 3369

# O usando Node.js
npx serve . -p 3369
```

### **5. Acceder a la aplicación:**
```
http://localhost:3369
```

## 🌐 Deployment

### **Netlify (Recomendado):**
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Deploy automático en cada push

### **GitHub Pages:**
1. Habilitar GitHub Pages en settings
2. Configurar OAuth para GitHub Pages
3. Deploy automático via Actions

## 📚 Uso de la Aplicación

### **🎯 Modo Práctica:**
1. Selecciona nivel HSK (1-6)
2. Elige modo de práctica:
   - Carácter → Traducción
   - Carácter → Pinyin
   - Pinyin → Carácter
   - Traducción → Carácter
3. Estudia con flashcards interactivas
4. Marca si conoces o no cada palabra

### **🎮 Juego Matrix:**
1. Encuentra caracteres chinos en la matriz
2. Compite por el mejor tiempo
3. Sube en el ranking global

### **🏆 Clasificaciones:**
1. Ve tu posición en rankings globales
2. Compite con otros estudiantes
3. Filtra por período y nivel HSK

### **📊 Estadísticas:**
1. Seguimiento de progreso diario
2. Estadísticas de precisión
3. Rachas de estudio
4. Heatmap de actividad

## 🔧 Configuración

### **Variables de Entorno:**
```env
# GitHub OAuth
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret

# Supabase
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_key

# Netlify
NETLIFY_SITE_ID=tu_site_id
```

### **Configuración OAuth:**
1. Crear aplicación GitHub OAuth
2. Configurar redirect URIs
3. Obtener client ID y secret

### **Configuración Supabase:**
1. Crear proyecto Supabase
2. Configurar tablas de usuario
3. Habilitar RLS (Row Level Security)

## 👨‍💻 Desarrollador

**Jose Alejandro Rollano Revollo**
- 🌐 Desarrollador Full Stack
- 🇨🇳 Especialista en tecnologías de aprendizaje de idiomas
- 📧 Contacto: [GitHub Profile](https://github.com/skillparty)

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📈 Roadmap

### **Próximas características:**
- [ ] 🎯 Más niveles HSK en español
- [ ] 🎮 Nuevos juegos educativos
- [ ] 📱 App móvil nativa
- [ ] 🤖 IA para recomendaciones personalizadas
- [ ] 🗣️ Reconocimiento de voz
- [ ] 📝 Práctica de escritura de caracteres

---

**¡Disfruta aprendiendo chino con Confuc10++!** 🇨🇳✨
