# 🔧 Solución OAuth para GitHub Pages

## ❌ Problema Identificado:
**Error:** 404 File not found al intentar iniciar sesión con GitHub
**Causa:** OAuth configurado para localhost, pero la app está en GitHub Pages
**URL de la App:** https://skillparty.github.io/proyecto_HSK/

## ✅ Solución para GitHub Pages:

### Paso 1: Actualizar GitHub OAuth App
1. **Ve a tu GitHub OAuth App:** https://github.com/settings/developers
2. **Busca tu app "HSK Learning App"** (o créala si no existe)
3. **Actualiza las URLs:**
   ```
   Application name: HSK Learning App
   Homepage URL: https://skillparty.github.io/proyecto_HSK/
   Authorization callback URL: https://skillparty.github.io/proyecto_HSK/auth/github/callback
   ```
4. **Guarda los cambios**
5. **Copia el Client ID**

### Paso 2: Problema con GitHub Pages
⚠️ **IMPORTANTE:** GitHub Pages es un hosting estático (solo HTML/CSS/JS), pero tu aplicación ahora tiene un **backend con Express.js** que necesita un servidor Node.js.

## 🚨 Opciones de Solución:

### Opción A: Usar Solo Frontend (Limitado)
Si quieres mantener GitHub Pages, necesitas:
1. **Remover el backend** y usar solo el sistema de autenticación frontend original
2. **Usar localStorage** para guardar progreso (sin base de datos)
3. **No tener leaderboard real** (solo local)

### Opción B: Desplegar Backend en Servidor (Recomendado)
Para usar todas las funcionalidades nuevas (backend + leaderboard), necesitas:

#### 1. **Netlify (Gratis y Fácil):**
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Desplegar
netlify deploy --prod
```

#### 2. **Vercel (Gratis y Fácil):**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel --prod
```

#### 3. **Railway (Gratis):**
- Conecta tu repo GitHub
- Auto-deploy desde GitHub

#### 4. **Render (Gratis):**
- Conecta tu repo GitHub
- Auto-deploy desde GitHub

## 🎯 Recomendación: Usar Netlify

### Configuración para Netlify:
1. **Crear `netlify.toml`:**
```toml
[build]
  command = "npm install"
  functions = "netlify/functions"
  publish = "."

[dev]
  command = "npm start"
  port = 5089

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Desplegar:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

3. **Configurar OAuth con la URL de Netlify:**
```
Homepage URL: https://tu-app.netlify.app
Callback URL: https://tu-app.netlify.app/auth/github/callback
```

## 🔄 Solución Rápida (Solo Frontend)

Si prefieres mantener GitHub Pages temporalmente:

### 1. Revertir a Sistema Anterior:
```bash
# Usar el sistema de auth anterior (solo frontend)
git checkout HEAD~2 -- auth.js user-profile.js
```

### 2. Configurar OAuth para GitHub Pages:
```
Homepage URL: https://skillparty.github.io/proyecto_HSK/
Callback URL: https://skillparty.github.io/proyecto_HSK/
```

### 3. Actualizar `auth.js`:
```javascript
// En auth.js, cambiar:
this.redirectUri = 'https://skillparty.github.io/proyecto_HSK/';
```

## 🚀 Recomendación Final:

**Para aprovechar todas las funcionalidades nuevas (backend + leaderboard):**

1. **Desplegar en Netlify/Vercel** (5 minutos)
2. **Configurar OAuth** con la nueva URL
3. **Disfrutar del backend completo** con base de datos y leaderboard

**Para mantener GitHub Pages (limitado):**

1. **Usar solo el frontend** original
2. **Sin base de datos** ni leaderboard real
3. **Progreso solo en localStorage**

¿Qué opción prefieres? Te ayudo a configurar cualquiera de las dos! 🚀
