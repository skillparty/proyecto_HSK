# ⚡ Configuración Rápida de Firebase

## Pasos Esenciales (5 minutos)

### 1. Crear Proyecto Firebase
```
1. Ve a https://console.firebase.google.com/
2. Click en "Add project"
3. Nombre: "Confuc10-HSK" (o el que prefieras)
4. Desactiva Google Analytics (opcional)
5. Click en "Create project"
```

### 2. Registrar App Web
```
1. Click en el ícono de web "</>"
2. Nickname: "Confuc10 Web"
3. NO marques "Also set up Firebase Hosting"
4. Click en "Register app"
```

### 3. Copiar Credenciales
Copia el objeto `firebaseConfig` que aparece y pégalo en `/workspace/config/firebase-config.js`:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456"
};
```

### 4. Habilitar GitHub OAuth
```
1. Firebase Console → Authentication → Sign-in method
2. Click en "GitHub" → Enable
3. Copia "Callback URL" 
4. Ve a https://github.com/settings/applications/new
5. Application name: "Confuc10 HSK"
6. Homepage URL: https://skillparty.github.io/proyecto_HSK/
7. Authorization callback URL: [pega el callback de Firebase]
8. Click "Register application"
9. Copia Client ID y Client Secret
10. Pégalos en Firebase Console
11. Click "Save" en Firebase
```

### 5. Configurar Firestore
```
1. Firebase Console → Firestore Database
2. Click "Create database"
3. Selecciona "Start in production mode"
4. Elige ubicación: us-central (EE.UU.) o asia-northeast1 (Tokio)
5. Click "Enable"
```

### 6. Subir Reglas de Seguridad
```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto (en /workspace)
firebase init firestore

# Cuando pregunte, selecciona:
# - Use existing project
# - firestore.rules (sobrescribe el existente)
# - No a index creation (lo haremos manual)

# Deploy reglas
firebase deploy --only firestore:rules
```

### 7. Crear Índices Manualmente
Ve a Firestore Console → Indexes y crea:

**Índice 1:**
- Collection: `user_progress`
- Fields: `user_id` (ASC), `hsk_level` (ASC)

**Índice 2:**
- Collection: `word_progress`  
- Fields: `user_id` (ASC), `hsk_level` (ASC)

**Índice 3:**
- Collection: `leaderboard`
- Field: `total_words` (DESC)

**Índice 4:**
- Collection: `leaderboard`
- Field: `best_streak` (DESC)

## ✅ ¡Listo!

Tu aplicación ahora debería funcionar con Firebase.

### Verificación Rápida:
```
1. Abre http://localhost:3369/
2. Abre DevTools (F12)
3. Deberías ver: "✅ Firebase client initialized successfully"
4. Click en "Login with GitHub"
5. Deberías autenticarte correctamente
```

## 🐛 Solución de Problemas Comunes

### Error: "Firebase configuration not loaded"
- Verifica que `firebase-config.js` tenga credenciales válidas
- Revisa el orden de carga en `index.html`

### Error: "The caller does not have permission"
- Las reglas de seguridad no se han subido
- Ejecuta: `firebase deploy --only firestore:rules`

### Error: "INDEX_CONFIGURATION_ERROR"
- Faltan índices compuestos
- Revisa el paso 7 y créalos manualmente

### GitHub OAuth no funciona
- Verifica que el Callback URL esté bien configurado en GitHub
- Asegúrate de haber pegado Client ID y Secret en Firebase

## 📊 Monitoreo

Para ver uso y estadísticas:
- Firebase Console → Project Overview
- Firebase Console → Firestore → Data
- Firebase Console → Authentication → Users

## 🔥 Opcional: Cloud Functions

Para leaderboard automático, sigue las instrucciones en `MIGRATION_GUIDE.md`
