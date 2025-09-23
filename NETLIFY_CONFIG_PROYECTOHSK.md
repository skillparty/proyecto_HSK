# 🔧 Configuración Variables de Entorno - proyectohsk.netlify.app

## 📋 Variables a Configurar en Netlify:

### En Netlify Dashboard > proyectohsk > Site settings > Environment variables:

**Agrega estas 8 variables:**

```env
GITHUB_CLIENT_ID=tu_client_id_de_github_oauth_app
GITHUB_CLIENT_SECRET=988a052b304725eed35c55099aa92b5bd6bfb193
GITHUB_CALLBACK_URL=https://proyectohsk.netlify.app/auth/github/callback
CLIENT_URL=https://proyectohsk.netlify.app
SESSION_SECRET=13e17c75fb065005b9ac706f25e80cf141fcfe0776cbfb0eed3fe21b1fe607c2
JWT_SECRET=1945da30fd67559288028c9effe0c5f621a7246c855b2e6be23dcaede01a35b6
NODE_ENV=production
DATABASE_URL=./database/hsk_app.db
```

## 🔑 Cómo Agregar Variables en Netlify:

### 1. GITHUB_CLIENT_ID
- **Key:** `GITHUB_CLIENT_ID`
- **Value:** `tu_client_id_copiado_de_github`
- **Scope:** Same for all deploy contexts

### 2. GITHUB_CLIENT_SECRET
- **Key:** `GITHUB_CLIENT_SECRET`
- **Value:** `988a052b304725eed35c55099aa92b5bd6bfb193`
- **Scope:** Same for all deploy contexts

### 3. GITHUB_CALLBACK_URL
- **Key:** `GITHUB_CALLBACK_URL`
- **Value:** `https://proyectohsk.netlify.app/auth/github/callback`
- **Scope:** Same for all deploy contexts

### 4. CLIENT_URL
- **Key:** `CLIENT_URL`
- **Value:** `https://proyectohsk.netlify.app`
- **Scope:** Same for all deploy contexts

### 5. SESSION_SECRET
- **Key:** `SESSION_SECRET`
- **Value:** `13e17c75fb065005b9ac706f25e80cf141fcfe0776cbfb0eed3fe21b1fe607c2`
- **Scope:** Same for all deploy contexts

### 6. JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** `1945da30fd67559288028c9effe0c5f621a7246c855b2e6be23dcaede01a35b6`
- **Scope:** Same for all deploy contexts

### 7. NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Scope:** Same for all deploy contexts

### 8. DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** `./database/hsk_app.db`
- **Scope:** Same for all deploy contexts

## 📋 GitHub OAuth App Configuration:

### En https://github.com/settings/developers:

```
Application name: HSK Learning App
Homepage URL: https://proyectohsk.netlify.app
Authorization callback URL: https://proyectohsk.netlify.app/auth/github/callback
Application description: Chinese HSK Learning Platform with Progress Tracking
```

## 🔍 Verificación:

### Después de configurar las variables:

1. **Espera 2-3 minutos** para redeploy automático
2. **Prueba:** https://proyectohsk.netlify.app/api/health
   - Debería responder: `{"status":"OK",...}`
3. **Prueba OAuth:** https://proyectohsk.netlify.app/auth/github
   - Debería redirigir a GitHub (no error 500)
4. **Prueba la app:** https://proyectohsk.netlify.app
   - Haz clic en "Sign in"
   - Deberías poder autenticarte con GitHub

## 🎯 Resultado Final:

Una vez configurado correctamente:
- ✅ https://proyectohsk.netlify.app funcionando
- ✅ Autenticación GitHub OAuth completa
- ✅ Usuario puede hacer login/logout
- ✅ API endpoints respondiendo
- ✅ Leaderboard con datos mock
- ✅ Sistema completo operativo

## 📞 Información Pendiente:

**Solo necesitas compartir:**
- **Client ID de tu GitHub OAuth App** (algo como: Ov23liABC123XYZ)

Con eso completamos la configuración! 🚀
