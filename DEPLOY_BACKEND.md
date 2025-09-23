# 🚀 Desplegar Backend HSK Learning App

## 🎯 Problema Actual:
- Tu app está en GitHub Pages (solo frontend estático)
- Pero ahora tienes un backend con Express.js + SQLite + OAuth
- GitHub Pages no puede ejecutar servidores Node.js

## ✅ Soluciones Rápidas (Gratis):

### Opción 1: Netlify (Recomendado - 5 minutos)

#### Paso 1: Preparar para Netlify
```bash
# Ya tienes netlify.toml configurado ✅
# Solo necesitas desplegar
```

#### Paso 2: Desplegar
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login a Netlify
netlify login

# Desplegar desde tu carpeta del proyecto
netlify deploy --prod

# Netlify te dará una URL como: https://amazing-app-123.netlify.app
```

#### Paso 3: Configurar GitHub OAuth
1. Ve a: https://github.com/settings/developers
2. Actualiza tu OAuth App:
   ```
   Homepage URL: https://tu-app.netlify.app
   Callback URL: https://tu-app.netlify.app/auth/github/callback
   ```

#### Paso 4: Configurar Variables de Entorno en Netlify
1. Ve a tu dashboard de Netlify
2. Site settings > Environment variables
3. Agrega:
   ```
   GITHUB_CLIENT_ID=tu_client_id
   GITHUB_CLIENT_SECRET=988a052b304725eed35c55099aa92b5bd6bfb193
   SESSION_SECRET=tu_session_secret
   JWT_SECRET=tu_jwt_secret
   NODE_ENV=production
   ```

### Opción 2: Vercel (Alternativa - 5 minutos)

#### Paso 1: Desplegar
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login a Vercel
vercel login

# Desplegar
vercel --prod

# Vercel te dará una URL como: https://proyecto-hsk.vercel.app
```

#### Paso 2: Configurar Variables de Entorno
1. Ve a tu dashboard de Vercel
2. Settings > Environment Variables
3. Agrega las mismas variables que en Netlify

### Opción 3: Railway (Automático)

#### Paso 1: Conectar Repo
1. Ve a: https://railway.app
2. "Deploy from GitHub repo"
3. Selecciona: skillparty/proyecto_HSK
4. Railway auto-detecta Node.js y despliega

#### Paso 2: Configurar Variables
En Railway dashboard, agrega las variables de entorno.

## 🔧 Configuración Post-Despliegue:

### 1. Actualizar .env.example (para documentación)
```env
# Production URLs (example)
CLIENT_URL=https://tu-app.netlify.app
GITHUB_CALLBACK_URL=https://tu-app.netlify.app/auth/github/callback
```

### 2. Probar Funcionalidades:
- ✅ Autenticación GitHub OAuth
- ✅ Progreso sincronizado en base de datos
- ✅ Leaderboard en tiempo real
- ✅ Sistema de logros
- ✅ Competencia entre usuarios

## 🎉 Resultado Final:

Tendrás tu app HSK Learning con:
- ✅ **Backend completo** funcionando
- ✅ **Base de datos SQLite** persistente
- ✅ **Autenticación GitHub** OAuth
- ✅ **Leaderboard competitivo** en tiempo real
- ✅ **Progreso sincronizado** entre dispositivos
- ✅ **25+ API endpoints** activos
- ✅ **Sistema de logros** automático

## 🚨 Alternativa: Solo Frontend en GitHub Pages

Si prefieres mantener GitHub Pages (sin backend):

### Configurar OAuth para GitHub Pages:
```
Homepage URL: https://skillparty.github.io/proyecto_HSK/
Callback URL: https://skillparty.github.io/proyecto_HSK/
```

### Limitaciones:
- ❌ Sin base de datos (solo localStorage)
- ❌ Sin leaderboard real
- ❌ Sin sincronización entre dispositivos
- ❌ Sin sistema de logros persistente

## 🎯 Recomendación:

**Usa Netlify** para tener todas las funcionalidades:
1. 5 minutos de setup
2. Gratis para proyectos personales
3. Auto-deploy desde GitHub
4. HTTPS automático
5. Variables de entorno seguras

¿Cuál opción prefieres? ¡Te ayudo con cualquiera! 🚀
