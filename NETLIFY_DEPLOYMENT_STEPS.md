# 🚀 Despliegue en Netlify - Guía Paso a Paso

## ✅ Estado Actual:
- ✅ Cuenta Netlify vinculada
- ✅ Código subido a GitHub con configuración
- ✅ netlify.toml configurado
- ✅ Listo para desplegar

## 📋 Pasos a Seguir:

### Paso 1: Crear Nuevo Site en Netlify
1. **Ve a:** https://app.netlify.com/
2. **Haz clic en:** "Add new site" > "Import an existing project"
3. **Selecciona:** "Deploy with GitHub"
4. **Autoriza Netlify** si te lo pide
5. **Busca y selecciona:** `skillparty/proyecto_HSK`

### Paso 2: Configurar Build Settings
Netlify debería detectar automáticamente:
```
Build command: npm install
Publish directory: . (punto)
```

Si no lo detecta, configúralo manualmente:
- **Build command:** `npm install`
- **Publish directory:** `.` (punto)
- **Functions directory:** (déjalo vacío)

### Paso 3: Configurar Variables de Entorno
**IMPORTANTE:** Antes de desplegar, configura estas variables:

1. **En Netlify:** Site settings > Environment variables
2. **Agrega estas variables:**

```env
GITHUB_CLIENT_ID=tu_client_id_de_github
GITHUB_CLIENT_SECRET=988a052b304725eed35c55099aa92b5bd6bfb193
SESSION_SECRET=tu_session_secret_del_env_local
JWT_SECRET=tu_jwt_secret_del_env_local
NODE_ENV=production
DATABASE_URL=./database/hsk_app.db
```

**Para obtener los valores:**
- `GITHUB_CLIENT_ID`: Lo obtienes de tu GitHub OAuth App
- `SESSION_SECRET` y `JWT_SECRET`: Los tienes en tu archivo `.env` local

### Paso 4: Deploy
1. **Haz clic en:** "Deploy site"
2. **Espera** a que termine el build (2-3 minutos)
3. **Netlify te dará una URL** como: `https://amazing-app-123456.netlify.app`

### Paso 5: Configurar GitHub OAuth App
1. **Ve a:** https://github.com/settings/developers
2. **Busca tu OAuth App** "HSK Learning App"
3. **Actualiza las URLs:**
   ```
   Homepage URL: https://tu-app-netlify.netlify.app
   Authorization callback URL: https://tu-app-netlify.netlify.app/auth/github/callback
   ```
4. **Guarda los cambios**

### Paso 6: Probar la Aplicación
1. **Ve a tu URL de Netlify**
2. **Haz clic en "Sign in"**
3. **Deberías ser redirigido a GitHub**
4. **Después de autorizar, regresarás autenticado**
5. **Prueba el leaderboard y todas las funcionalidades**

## 🔧 Si Necesitas los Valores del .env Local:

Ejecuta este comando para ver tus claves locales:
```bash
grep -E "SESSION_SECRET|JWT_SECRET" .env
```

## 🎯 Resultado Final:

Tendrás tu aplicación HSK Learning funcionando en Netlify con:
- ✅ Backend Express.js completo
- ✅ Base de datos SQLite
- ✅ Autenticación GitHub OAuth
- ✅ Leaderboard en tiempo real
- ✅ Progreso sincronizado
- ✅ Sistema de logros
- ✅ 25+ API endpoints

## 🚨 Troubleshooting:

### Si el build falla:
- Verifica que `package.json` esté en el repo
- Asegúrate de que `netlify.toml` esté configurado

### Si OAuth no funciona:
- Verifica que las URLs en GitHub OAuth App sean exactas
- Asegúrate de que `GITHUB_CLIENT_ID` esté configurado en Netlify

### Si la base de datos no funciona:
- Netlify creará una nueva base de datos SQLite en cada deploy
- Los datos se resetearán en cada deploy (normal para desarrollo)

## 🎉 ¡Listo!

Una vez completado, tendrás tu aplicación HSK Learning con backend completo funcionando en Netlify! 🚀

**URL de ejemplo:** https://hsk-learning-app.netlify.app
**Funcionalidades:** Backend completo + Leaderboard + OAuth + Base de datos
