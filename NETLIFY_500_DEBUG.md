# 🚨 Debug Error 500 - Variables de Entorno

## ❌ Problema:
Error 500 en /auth/github - Las variables de entorno no están configuradas en Netlify

## 🔍 Verificación Inmediata:

### 1. Probar Health Check:
Ve a: https://proyectohsk.netlify.app/api/health

**¿Qué responde?**
- Si responde JSON → Backend funciona, problema con OAuth
- Si da 500 → Variables no configuradas
- Si da 404 → Problema con Functions

### 2. Verificar Variables en Netlify:
1. Ve a: https://app.netlify.com/
2. Selecciona tu sitio "proyectohsk"
3. Site settings > Environment variables
4. **¿Ves las 8 variables configuradas?**

## 🚀 Solución Rápida:

### Si NO tienes las variables configuradas:

#### Opción A: Netlify CLI (Automático)
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login a Netlify
netlify login

# Subir variables automáticamente
netlify env:import .env.netlify
```

#### Opción B: Manual en Dashboard
1. Ve a Netlify Dashboard > proyectohsk
2. Site settings > Environment variables
3. Agrega una por una:

```
Key: GITHUB_CLIENT_ID
Value: Ov23li2CCbHnYNI8sm7e

Key: GITHUB_CLIENT_SECRET  
Value: 988a052b304725eed35c55099aa92b5bd6bfb193

Key: GITHUB_CALLBACK_URL
Value: https://proyectohsk.netlify.app/auth/github/callback

Key: CLIENT_URL
Value: https://proyectohsk.netlify.app

Key: SESSION_SECRET
Value: 13e17c75fb065005b9ac706f25e80cf141fcfe0776cbfb0eed3fe21b1fe607c2

Key: JWT_SECRET
Value: 1945da30fd67559288028c9effe0c5f621a7246c855b2e6be23dcaede01a35b6

Key: NODE_ENV
Value: production

Key: DATABASE_URL
Value: ./database/hsk_app.db
```

### Después de Configurar Variables:
1. **Netlify redesplegará** automáticamente (2-3 minutos)
2. **Espera** a que termine el deploy
3. **Prueba de nuevo:** https://proyectohsk.netlify.app/auth/github

## 🔧 Verificación Paso a Paso:

### 1. Health Check:
```
https://proyectohsk.netlify.app/api/health
```
**Debería responder:**
```json
{"status":"OK","timestamp":"...","environment":"production"}
```

### 2. OAuth Endpoint:
```
https://proyectohsk.netlify.app/auth/github
```
**Debería redirigir** a GitHub (no error 500)

### 3. App Principal:
```
https://proyectohsk.netlify.app
```
**Debería cargar** la aplicación HSK Learning

## 📞 Información Necesaria:

Para diagnosticar mejor, comparte:
1. **¿Configuraste las variables en Netlify?** (Sí/No)
2. **¿Qué responde** https://proyectohsk.netlify.app/api/health?
3. **¿Ves las variables** en Netlify Dashboard?

## 🎯 Resultado Esperado:

Una vez configuradas las variables correctamente:
- ✅ /api/health responde JSON
- ✅ /auth/github redirige a GitHub
- ✅ Login con GitHub funciona
- ✅ Usuario puede autenticarse

¡El error 500 se solucionará en cuanto las variables estén configuradas! 🚀
