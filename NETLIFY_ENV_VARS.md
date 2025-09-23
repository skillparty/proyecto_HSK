# 🔐 Variables de Entorno para Netlify

## 📋 Variables que Necesitas Configurar:

### En Netlify Dashboard > Site Settings > Environment Variables:

```env
GITHUB_CLIENT_ID=tu_client_id_de_github_oauth_app
GITHUB_CLIENT_SECRET=988a052b304725eed35c55099aa92b5bd6bfb193
SESSION_SECRET=13e17c75fb065005b9ac706f25e80cf141fcfe0776cbfb0eed3fe21b1fe607c2
JWT_SECRET=1945da30fd67559288028c9effe0c5f621a7246c855b2e6be23dcaede01a35b6
NODE_ENV=production
DATABASE_URL=./database/hsk_app.db
```

## ❓ Cómo Obtener GITHUB_CLIENT_ID:

### Opción 1: Si ya tienes una GitHub OAuth App
1. Ve a: https://github.com/settings/developers
2. Busca tu app "HSK Learning App"
3. Copia el Client ID

### Opción 2: Si necesitas crear una nueva OAuth App
1. Ve a: https://github.com/settings/applications/new
2. Completa:
   ```
   Application name: HSK Learning App
   Homepage URL: https://tu-app.netlify.app (la URL que te dé Netlify)
   Authorization callback URL: https://tu-app.netlify.app/auth/github/callback
   ```
3. Crea la app y copia el Client ID

## 🚀 Proceso Completo:

### 1. Desplegar en Netlify
- Ir a https://app.netlify.com/
- "Add new site" > "Import from GitHub"
- Seleccionar `skillparty/proyecto_HSK`

### 2. Configurar Variables de Entorno
- Site Settings > Environment Variables
- Agregar todas las variables de arriba

### 3. Obtener URL de Netlify
- Netlify te dará una URL como: `https://amazing-app-123456.netlify.app`

### 4. Configurar GitHub OAuth
- Actualizar tu OAuth App con la URL de Netlify
- Usar la URL exacta que te dé Netlify

### 5. ¡Listo!
- Tu app funcionará con backend completo
- Autenticación OAuth
- Leaderboard en tiempo real
- Base de datos SQLite

## 🎯 Resultado Final:

Una vez configurado, tendrás:
- ✅ **URL pública**: https://tu-app.netlify.app
- ✅ **Backend completo**: Express.js + SQLite
- ✅ **Autenticación**: GitHub OAuth funcional
- ✅ **Leaderboard**: Rankings en tiempo real
- ✅ **Progreso**: Sincronizado entre dispositivos
- ✅ **API**: 25+ endpoints activos

¡Sigue los pasos en NETLIFY_DEPLOYMENT_STEPS.md y tendrás todo funcionando! 🚀
