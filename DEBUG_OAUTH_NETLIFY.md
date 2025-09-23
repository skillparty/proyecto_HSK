# 🔍 Diagnóstico OAuth en Netlify

## ❓ Información Necesaria para Diagnosticar:

### 1. URL de tu App en Netlify:
**¿Cuál es la URL que te dio Netlify?**
Ejemplo: `https://amazing-app-123456.netlify.app`

### 2. Error Específico:
**¿Qué mensaje de error ves exactamente?**
- ¿404 File not found?
- ¿Error de OAuth?
- ¿Redirect URI mismatch?
- ¿Invalid client?

### 3. Configuración GitHub OAuth App:
**Verifica que tu GitHub OAuth App tenga exactamente:**
```
Homepage URL: https://tu-url-netlify.netlify.app
Authorization callback URL: https://tu-url-netlify.netlify.app/auth/github/callback
```

### 4. Variables de Entorno en Netlify:
**¿Configuraste todas estas variables en Netlify?**
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- SESSION_SECRET
- JWT_SECRET
- NODE_ENV=production

## 🔧 Pasos de Diagnóstico:

### Paso 1: Verificar que la App Esté Funcionando
1. Ve a tu URL de Netlify
2. ¿Se carga la página principal correctamente?
3. ¿Ves el botón "Sign in"?

### Paso 2: Verificar Build Logs
1. En Netlify Dashboard > Deploys
2. Haz clic en el último deploy
3. ¿Hay errores en los logs?

### Paso 3: Verificar Function Logs
1. En Netlify Dashboard > Functions
2. ¿Ves funciones listadas?
3. Revisa los logs por errores

### Paso 4: Probar API Endpoints
Prueba estos URLs directamente:
- `https://tu-app.netlify.app/api/health`
- `https://tu-app.netlify.app/auth/github`

## 🚨 Problemas Comunes:

### Problema 1: Build Failed
**Síntoma:** La app no se carga
**Solución:** Revisar build logs en Netlify

### Problema 2: Variables de Entorno No Configuradas
**Síntoma:** Error 500 o "OAuth not configured"
**Solución:** Verificar todas las variables en Netlify

### Problema 3: URLs No Coinciden
**Síntoma:** "Redirect URI mismatch"
**Solución:** Actualizar GitHub OAuth App con URL exacta de Netlify

### Problema 4: Client ID Incorrecto
**Síntoma:** "Invalid client"
**Solución:** Verificar GITHUB_CLIENT_ID en Netlify

### Problema 5: Netlify Functions No Configuradas
**Síntoma:** 404 en /api/* o /auth/*
**Solución:** Verificar netlify.toml y redeploy

## 🔍 Comandos de Verificación:

### Verificar Build:
```bash
# Localmente, probar que el build funcione
npm install
npm start
```

### Verificar Variables:
En tu terminal local:
```bash
echo "CLIENT_ID configurado: $(grep GITHUB_CLIENT_ID .env)"
echo "CLIENT_SECRET configurado: $(grep GITHUB_CLIENT_SECRET .env)"
```

## 📋 Checklist de Verificación:

- [ ] App desplegada correctamente en Netlify
- [ ] URL de Netlify accesible
- [ ] GitHub OAuth App creada
- [ ] URLs en GitHub OAuth App actualizadas con Netlify URL
- [ ] Todas las variables de entorno configuradas en Netlify
- [ ] Build exitoso sin errores
- [ ] API endpoints respondiendo

## 🚀 Siguiente Paso:

**Comparte conmigo:**
1. La URL de tu app en Netlify
2. El error exacto que ves
3. Screenshot del error si es posible
4. Estado del build en Netlify (exitoso/fallido)

Con esta información podremos identificar y solucionar el problema específico! 🔧
