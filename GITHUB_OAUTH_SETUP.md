# 🔐 Configuración GitHub OAuth - HSK Learning App

## ✅ Estado Actual

- ✅ **Client Secret**: Ya configurado
- ✅ **Variables de entorno**: Archivo `.env` creado
- ✅ **Backend**: Preparado para OAuth
- ❓ **Client ID**: Necesita ser obtenido de GitHub

## 🚀 Pasos para Completar la Configuración

### Paso 1: Crear GitHub OAuth App

1. **Ve a GitHub OAuth Apps:**
   ```
   https://github.com/settings/applications/new
   ```

2. **Completa el formulario con estos datos exactos:**
   ```
   Application name: HSK Learning App
   Homepage URL: http://localhost:5089
   Authorization callback URL: http://localhost:5089/auth/github/callback
   Application description: Chinese HSK Learning Platform with Progress Tracking
   ```

3. **Haz clic en "Register application"**

### Paso 2: Obtener Client ID

1. **Después de crear la app, verás una página con:**
   - Client ID (algo como: `Ov23liABC123XYZ`)
   - Client secrets (ya tienes este)

2. **Copia el Client ID** (es público, no es secreto)

### Paso 3: Actualizar Configuración

1. **Abre el archivo `.env`** en tu editor
2. **Reemplaza esta línea:**
   ```
   GITHUB_CLIENT_ID=your_github_client_id_here
   ```
   **Por:**
   ```
   GITHUB_CLIENT_ID=tu_client_id_copiado_aqui
   ```

### Paso 4: Reiniciar el Servidor

```bash
# Detener el servidor actual (Ctrl+C si está corriendo)
# Luego reiniciar:
npm start
```

## 🔍 Verificación de la Configuración

### 1. Verificar Variables de Entorno

El archivo `.env` debe contener:
```env
GITHUB_CLIENT_ID=Ov23li... (tu Client ID real)
GITHUB_CLIENT_SECRET=988a052b304725eed35c55099aa92b5bd6bfb193
PORT=5089
NODE_ENV=development
SESSION_SECRET=... (generado automáticamente)
JWT_SECRET=... (generado automáticamente)
DATABASE_URL=./database/hsk_app.db
ALLOWED_ORIGINS=http://localhost:5089,https://skillparty.github.io
CLIENT_URL=http://localhost:5089
GITHUB_CALLBACK_URL=http://localhost:5089/auth/github/callback
```

### 2. Verificar que el Servidor Inicie Correctamente

Cuando ejecutes `npm start`, deberías ver:
```
🚀 HSK Learning App Server Started
📍 Server running on: http://localhost:5089
🔐 GitHub OAuth: Configured ✅
```

### 3. Probar la Autenticación

1. **Abre:** `http://localhost:5089`
2. **Haz clic en "Sign in"** en la esquina superior derecha
3. **Deberías ser redirigido a GitHub** para autorizar la aplicación
4. **Después de autorizar**, regresarás a la app autenticado

## 🐛 Solución de Problemas

### Error: "GitHub OAuth not configured"
- ✅ Verifica que `GITHUB_CLIENT_ID` esté configurado en `.env`
- ✅ Reinicia el servidor después de cambiar `.env`

### Error: "Invalid client"
- ✅ Verifica que el Client ID sea correcto
- ✅ Asegúrate de que la OAuth App esté activa en GitHub

### Error: "Redirect URI mismatch"
- ✅ Verifica que la callback URL sea exactamente: `http://localhost:5089/auth/github/callback`
- ✅ No debe tener barras adicionales al final

### Error: "Invalid client secret"
- ✅ El Client Secret ya está configurado correctamente
- ✅ Si hay problemas, verifica que no tenga espacios extra

## 🎯 URLs Importantes

- **GitHub OAuth Apps:** https://github.com/settings/developers
- **Aplicación Local:** http://localhost:5089
- **Callback URL:** http://localhost:5089/auth/github/callback
- **API Health Check:** http://localhost:5089/api/health

## 🔒 Seguridad

- ✅ **Client Secret**: Ya configurado y seguro en `.env`
- ✅ **Session Secret**: Generado automáticamente
- ✅ **JWT Secret**: Generado automáticamente
- ✅ **Archivo `.env`**: Está en `.gitignore` (no se sube a GitHub)

## 🚀 Después de la Configuración

Una vez que tengas el Client ID configurado:

1. **Los usuarios podrán:**
   - Iniciar sesión con GitHub
   - Sincronizar progreso entre dispositivos
   - Aparecer en el leaderboard
   - Obtener logros y estadísticas

2. **El sistema tendrá:**
   - Autenticación segura
   - Progreso persistente
   - Rankings en tiempo real
   - Sincronización automática

## 📞 Soporte

Si tienes problemas:
1. Verifica que todos los pasos se hayan seguido exactamente
2. Revisa los logs del servidor para errores específicos
3. Asegúrate de que el puerto 5089 no esté siendo usado por otra aplicación

¡Una vez configurado, tendrás autenticación GitHub OAuth completamente funcional! 🎉
