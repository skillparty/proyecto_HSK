# HSK Learning App - Backend Setup Guide

## 🚀 Configuración del Backend con Autenticación GitHub OAuth

Este documento te guiará paso a paso para configurar el backend completo de la aplicación HSK Learning con autenticación GitHub OAuth y almacenamiento de progreso de usuarios.

### 📋 Prerrequisitos

- Node.js 16+ instalado
- Una cuenta de GitHub
- Acceso a la configuración de tu repositorio GitHub

### 🔧 Paso 1: Instalación de Dependencias

```bash
# Instalar todas las dependencias del backend
npm install

# O si prefieres usar yarn
yarn install
```

### 🔐 Paso 2: Configurar GitHub OAuth App

1. **Crear una GitHub OAuth App:**
   - Ve a [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
   - Haz clic en "New OAuth App"

2. **Configurar la aplicación:**
   ```
   Application name: HSK Learning App
   Homepage URL: http://localhost:5089
   Authorization callback URL: http://localhost:5089/auth/github/callback
   ```

3. **Obtener credenciales:**
   - Después de crear la app, copia el `Client ID`
   - Genera un `Client Secret` y cópialo también

### ⚙️ Paso 3: Configurar Variables de Entorno

1. **Copiar el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Editar el archivo `.env`:**
   ```env
   # GitHub OAuth Configuration
   GITHUB_CLIENT_ID=tu_github_client_id_aqui
   GITHUB_CLIENT_SECRET=tu_github_client_secret_aqui

   # Server Configuration
   PORT=5089
   NODE_ENV=development

   # Session Configuration
   SESSION_SECRET=una_clave_secreta_muy_segura_aqui

   # JWT Configuration
   JWT_SECRET=otra_clave_secreta_para_jwt_aqui

   # Database Configuration
   DATABASE_URL=./database/hsk_app.db

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:5089,https://skillparty.github.io

   # Application URLs
   CLIENT_URL=http://localhost:5089
   GITHUB_CALLBACK_URL=http://localhost:5089/auth/github/callback
   ```

3. **Generar claves secretas seguras:**
   ```bash
   # Para generar claves secretas aleatorias
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 💾 Paso 4: Configurar la Base de Datos

La aplicación usa SQLite por defecto, que se configura automáticamente:

```bash
# La base de datos se creará automáticamente al iniciar el servidor
# Se ubicará en: ./database/hsk_app.db
```

### 🚀 Paso 5: Iniciar el Servidor

```bash
# Modo desarrollo
npm run dev

# O modo producción
npm start

# O directamente con Node
node server.js
```

El servidor se iniciará en `http://localhost:5089` (o el puerto que hayas configurado).

### 🌐 Paso 6: Configuración para Producción

#### Para GitHub Pages:

1. **Actualizar la GitHub OAuth App:**
   ```
   Homepage URL: https://skillparty.github.io/proyecto_HSK/
   Authorization callback URL: https://skillparty.github.io/proyecto_HSK/auth/github/callback
   ```

2. **Actualizar variables de entorno:**
   ```env
   NODE_ENV=production
   CLIENT_URL=https://skillparty.github.io/proyecto_HSK
   GITHUB_CALLBACK_URL=https://skillparty.github.io/proyecto_HSK/auth/github/callback
   ALLOWED_ORIGINS=https://skillparty.github.io
   ```

#### Para servidor propio:

1. **Configurar dominio personalizado:**
   ```env
   CLIENT_URL=https://tu-dominio.com
   GITHUB_CALLBACK_URL=https://tu-dominio.com/auth/github/callback
   ALLOWED_ORIGINS=https://tu-dominio.com
   ```

2. **Usar HTTPS en producción:**
   - Asegúrate de que `NODE_ENV=production`
   - Configura un proxy reverso (nginx, Apache) con SSL

### 🔍 Verificación de la Configuración

1. **Verificar que el servidor esté funcionando:**
   ```bash
   curl http://localhost:5089/api/health
   ```
   
   Deberías recibir:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-XX...",
     "version": "3.1.0"
   }
   ```

2. **Verificar la autenticación:**
   - Ve a `http://localhost:5089`
   - Haz clic en "Sign in" en la esquina superior derecha
   - Deberías ser redirigido a GitHub para autorizar la aplicación

### 📊 Endpoints de la API

El backend proporciona los siguientes endpoints:

#### Autenticación:
- `GET /auth/github` - Iniciar OAuth con GitHub
- `GET /auth/github/callback` - Callback de OAuth
- `GET /api/auth/user` - Obtener información del usuario actual
- `POST /api/auth/logout` - Cerrar sesión

#### Perfil de Usuario:
- `GET /api/profile` - Obtener perfil del usuario
- `PUT /api/profile` - Actualizar perfil del usuario

#### Progreso:
- `GET /api/progress` - Obtener progreso del usuario
- `PUT /api/progress` - Actualizar progreso del usuario
- `POST /api/progress/word-study` - Registrar estudio de palabra
- `PUT /api/progress/hsk/:level` - Actualizar progreso de nivel HSK

#### Estadísticas:
- `GET /api/statistics` - Obtener estadísticas del usuario

#### Juego Matrix:
- `POST /api/matrix-game/score` - Guardar puntuación
- `GET /api/matrix-game/leaderboard` - Obtener tabla de líderes

#### Logros:
- `POST /api/achievements` - Agregar logro

### 🛠️ Solución de Problemas

#### Error: "GitHub OAuth not configured"
- Verifica que `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET` estén configurados en `.env`
- Asegúrate de que las URLs de callback coincidan exactamente

#### Error: "Database connection failed"
- Verifica que la carpeta `database/` exista
- Asegúrate de que el proceso tenga permisos de escritura

#### Error: "CORS policy"
- Verifica que `ALLOWED_ORIGINS` incluya tu dominio
- En desarrollo, asegúrate de incluir `http://localhost:5089`

#### El usuario no se autentica correctamente:
- Verifica que `SESSION_SECRET` y `JWT_SECRET` estén configurados
- Comprueba que las URLs de callback sean exactas (sin barras finales extra)

### 🔒 Consideraciones de Seguridad

1. **Nunca commits las claves secretas:**
   - El archivo `.env` está en `.gitignore`
   - Usa variables de entorno en producción

2. **Usa HTTPS en producción:**
   - Configura SSL/TLS
   - Actualiza `secure: true` en las cookies de sesión

3. **Mantén las dependencias actualizadas:**
   ```bash
   npm audit
   npm update
   ```

### 📈 Monitoreo y Logs

El servidor proporciona logs detallados:

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# O usar PM2 para producción
npm install -g pm2
pm2 start server.js --name hsk-app
pm2 logs hsk-app
```

### 🎯 Próximos Pasos

Una vez configurado el backend:

1. **Prueba la autenticación** - Inicia sesión con GitHub
2. **Verifica el progreso** - Estudia algunas palabras y comprueba que se guarden
3. **Revisa las estadísticas** - Ve a la sección de estadísticas para ver tu progreso
4. **Prueba en diferentes dispositivos** - El progreso se sincroniza automáticamente

### 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs del servidor
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que las URLs de GitHub OAuth sean correctas
4. Comprueba que el puerto no esté siendo usado por otra aplicación

¡Tu aplicación HSK Learning ahora tiene un backend completo con autenticación y sincronización de progreso! 🎉
