# 🔧 Solución Error 404 - GitHub OAuth

## ❌ Problema Identificado:
**Error:** 404 File not found al intentar iniciar sesión con GitHub
**Causa:** GITHUB_CLIENT_ID no configurado en el archivo .env

## ✅ Solución (2 minutos):

### Paso 1: Crear GitHub OAuth App
1. **Ve a:** https://github.com/settings/applications/new
2. **Completa exactamente así:**
   ```
   Application name: HSK Learning App
   Homepage URL: http://localhost:5089
   Authorization callback URL: http://localhost:5089/auth/github/callback
   Description: Chinese HSK Learning Platform
   ```
3. **Haz clic en "Register application"**
4. **Copia el Client ID** (algo como: Ov23liABC123XYZ)

### Paso 2: Configurar Client ID
1. **Abre el archivo `.env`** en tu editor
2. **Busca esta línea:**
   ```
   GITHUB_CLIENT_ID=your_github_client_id_here
   ```
3. **Reemplázala por:**
   ```
   GITHUB_CLIENT_ID=tu_client_id_copiado_de_github
   ```
4. **Guarda el archivo**

### Paso 3: Reiniciar Servidor
```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
npm start
```

### Paso 4: Verificar Configuración
Cuando reinicies el servidor, deberías ver:
```
🔐 GitHub OAuth: Configured ✅
```

## 🔍 URLs Importantes:

- **Aplicación Local:** http://localhost:5089
- **Callback URL:** http://localhost:5089/auth/github/callback
- **GitHub OAuth Apps:** https://github.com/settings/developers

## ⚠️ Puntos Críticos:

1. **Callback URL debe ser EXACTA:** `http://localhost:5089/auth/github/callback`
2. **No agregar barras extra** al final de las URLs
3. **Client ID es público** (no es secreto)
4. **Client Secret ya está configurado** correctamente

## 🧪 Prueba Final:

1. Reinicia el servidor con el Client ID configurado
2. Ve a http://localhost:5089
3. Haz clic en "Sign in" 
4. Deberías ser redirigido a GitHub para autorizar
5. Después de autorizar, regresarás autenticado a la app

## 🚨 Si Persiste el Error:

### Verificar en GitHub OAuth App:
- Homepage URL: `http://localhost:5089`
- Callback URL: `http://localhost:5089/auth/github/callback`
- App debe estar "Active"

### Verificar en .env:
```env
GITHUB_CLIENT_ID=Ov23li... (tu Client ID real)
GITHUB_CLIENT_SECRET=988a052b304725eed35c55099aa92b5bd6bfb193
CLIENT_URL=http://localhost:5089
GITHUB_CALLBACK_URL=http://localhost:5089/auth/github/callback
```

### Verificar Servidor:
```bash
curl http://localhost:5089/api/health
# Debe responder: {"status":"OK",...}
```

Una vez configurado el Client ID, la autenticación GitHub funcionará perfectamente! 🎉
