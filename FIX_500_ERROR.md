# 🚨 Solución Error 500 - OAuth en Netlify

## ❌ Problema Identificado:
**Error:** 500 Internal Server Error en `/auth/github`
**Causa:** Problema con configuración del servidor o variables de entorno

## 🔍 Causas Más Probables:

### 1. Variables de Entorno Faltantes o Incorrectas
El servidor no puede acceder a las variables de OAuth.

### 2. Problema con Netlify Functions
Netlify no está ejecutando correctamente el backend Express.js.

### 3. Error en la Base de Datos
SQLite no se puede inicializar en Netlify.

## ✅ Solución Paso a Paso:

### Paso 1: Verificar Variables de Entorno en Netlify

1. **Ve a Netlify Dashboard** > Tu sitio > Site settings > Environment variables
2. **Verifica que TODAS estas variables estén configuradas:**

```env
GITHUB_CLIENT_ID=tu_client_id_aqui
GITHUB_CLIENT_SECRET=988a052b304725eed35c55099aa92b5bd6bfb193
SESSION_SECRET=13e17c75fb065005b9ac706f25e80cf141fcfe0776cbfb0eed3fe21b1fe607c2
JWT_SECRET=1945da30fd67559288028c9effe0c5f621a7246c855b2e6be23dcaede01a35b6
NODE_ENV=production
DATABASE_URL=./database/hsk_app.db
CLIENT_URL=https://tu-app.netlify.app
GITHUB_CALLBACK_URL=https://tu-app.netlify.app/auth/github/callback
```

⚠️ **IMPORTANTE:** Reemplaza `https://tu-app.netlify.app` con tu URL real de Netlify.

### Paso 2: Verificar Build Logs

1. **Ve a Netlify Dashboard** > Deploys > [último deploy]
2. **Busca errores** en los logs de build
3. **Busca mensajes** como:
   - "Missing environment variable"
   - "Database connection failed"
   - "OAuth configuration error"

### Paso 3: Verificar Function Logs

1. **Ve a Netlify Dashboard** > Functions
2. **Revisa los logs** en tiempo real
3. **Busca errores** cuando intentas hacer login

### Paso 4: Actualizar netlify.toml

El problema puede ser que Netlify no está manejando correctamente el backend Express.js. Vamos a actualizar la configuración:

```toml
[build]
  command = "npm install"
  publish = "."

[dev]
  command = "npm start"
  port = 5089

# Configuración para Netlify Functions
[functions]
  directory = "netlify/functions"

# Redirects para API
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200

[[redirects]]
  from = "/auth/*"
  to = "/.netlify/functions/server/:splat"
  status = 200

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔧 Solución Alternativa: Usar Netlify Functions

Si el problema persiste, necesitamos convertir el servidor Express.js en Netlify Functions:

### Crear `netlify/functions/server.js`:

```javascript
const express = require('express');
const serverless = require('serverless-http');

// Importar tu servidor existente
const app = require('../../server.js');

// Exportar como función de Netlify
module.exports.handler = serverless(app);
```

## 🚀 Solución Rápida (Recomendada):

### Opción A: Usar Vercel en su lugar
Vercel maneja mejor los backends Express.js:

```bash
npm install -g vercel
vercel --prod
```

### Opción B: Usar Railway
Railway es perfecto para backends con base de datos:

1. Ve a https://railway.app
2. "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Configura las variables de entorno
5. ¡Listo!

## 🔍 Diagnóstico Inmediato:

### Prueba estos URLs en tu navegador:

1. **Health Check:**
   ```
   https://tu-app.netlify.app/api/health
   ```
   **Debería responder:** `{"status":"OK",...}`

2. **OAuth Endpoint:**
   ```
   https://tu-app.netlify.app/auth/github
   ```
   **Debería redirigir** a GitHub (no error 500)

### Si ambos dan error 500:
- El problema es con las variables de entorno
- O Netlify no está ejecutando el backend correctamente

### Si solo OAuth da error 500:
- El problema es específico con la configuración OAuth
- Verifica GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET

## 📞 Información Adicional Necesaria:

Para ayudarte mejor, comparte:

1. **URL exacta de tu app en Netlify**
2. **Screenshot de las variables de entorno** en Netlify (puedes ocultar los valores)
3. **Build logs** de Netlify (si hay errores)
4. **Respuesta de** `https://tu-app.netlify.app/api/health`

## 🎯 Recomendación:

Si el error 500 persiste en Netlify, te recomiendo **usar Vercel** que maneja mejor los backends Express.js:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel --prod

# Configurar variables de entorno en Vercel Dashboard
# Actualizar GitHub OAuth App con nueva URL
```

¡Con esta información podremos solucionar el error 500 rápidamente! 🚀
