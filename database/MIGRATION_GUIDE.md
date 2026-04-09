# Migración de Supabase a Firebase - Guía de Implementación

## ✅ Archivos Creados/Modificados

### Nuevos Archivos Creados:
1. **`config/firebase-config.js`** - Configuración de Firebase (requiere tus credenciales)
2. **`assets/js/firebase-client.js`** - Cliente Firebase con interfaz compatible
3. **`assets/js/firebase-progress-sync.js`** - Sincronización de progreso offline-first
4. **`database/firestore.rules`** - Reglas de seguridad de Firestore
5. **`database/FIRESTORE_STRUCTURE.md`** - Documentación de estructura de datos

### Archivos Modificados:
1. **`index.html`** - Reemplazo de CDN de Supabase por Firebase
2. **`assets/js/auth-backend.js`** - Autenticación actualizada a Firebase
3. **`assets/js/leaderboard.js`** - Referencias actualizadas
4. **`assets/js/user-progress-backend.js`** - Referencias actualizadas
5. **`assets/js/progress-integrator.js`** - Referencias actualizadas
6. **`assets/js/bg-data.js`** - Referencias actualizadas
7. **`assets/js/matrix-game.js`** - Referencias actualizadas

## 📋 Pasos para Completar la Migración

### 1. Configurar Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Registra una aplicación web
4. Copia las credenciales de configuración

### 2. Actualizar Credenciales en `firebase-config.js`

```javascript
const FIREBASE_CONFIG = {
    apiKey: 'TU_API_KEY_REAL',
    authDomain: 'tu-app.firebaseapp.com',
    projectId: 'tu-app',
    storageBucket: 'tu-app.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abc123def456'
};
```

### 3. Habilitar GitHub OAuth en Firebase

1. En Firebase Console → Authentication → Sign-in method
2. Habilita "GitHub" como proveedor
3. Copia el Client ID y Client Secret de tu app de GitHub OAuth
4. Configura los callbacks autorizados:
   - Producción: `https://skillparty.github.io/proyecto_HSK/__/auth/handler`
   - Desarrollo: `http://localhost:3369/__/auth/handler`

### 4. Configurar Firestore Database

1. En Firebase Console → Firestore Database
2. Crea una base de datos en modo producción
3. Selecciona la ubicación más cercana a tus usuarios
4. Sube las reglas de seguridad desde `database/firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 5. Crear Índices Compuestos

En Firestore Console, crea estos índices:

1. **Colección `user_progress`**
   - Campo: `user_id` (ASC)
   - Campo: `hsk_level` (ASC)

2. **Colección `word_progress`**
   - Campo: `user_id` (ASC)
   - Campo: `hsk_level` (ASC)

3. **Colección `leaderboard`**
   - Campo: `total_words` (DESC)
   - Campo: `accuracy_rate` (DESC)
   - Campo: `best_streak` (DESC)
   - Campo: `total_time` (DESC)

### 6. (Opcional) Cloud Functions para Leaderboard

Para mantener el leaderboard actualizado automáticamente:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.updateLeaderboard = functions.firestore
  .document('user_progress/{userId}_hsk{level}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    
    // Obtener todos los progresos del usuario
    const snapshot = await db.collection('user_progress')
      .where('user_id', '==', userId)
      .get();
    
    let totalWords = 0;
    let totalTime = 0;
    let bestStreak = 0;
    let levelsStudied = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      totalWords += (data.total_words_studied || 0);
      totalTime += (data.total_time_spent || 0);
      bestStreak = Math.max(bestStreak, data.best_streak || 0);
      totalCorrect += (data.correct_answers || 0);
      totalIncorrect += (data.incorrect_answers || 0);
      levelsStudied++;
    });
    
    const accuracyRate = (totalCorrect + totalIncorrect) > 0
      ? (totalCorrect / (totalCorrect + totalIncorrect)) * 100
      : 0;
    
    // Obtener perfil del usuario
    const profileSnap = await db.collection('user_profiles').doc(userId).get();
    const profileData = profileSnap.exists ? profileSnap.data() : {};
    
    // Actualizar leaderboard
    await db.collection('leaderboard').doc(userId).set({
      user_id: userId,
      username: profileData.username || 'Anonymous',
      display_name: profileData.display_name || 'Anonymous',
      avatar_url: profileData.avatar_url || '',
      total_words: totalWords,
      accuracy_rate: accuracyRate,
      best_streak: bestStreak,
      total_time: totalTime,
      levels_studied: levelsStudied,
      last_activity: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });
```

### 7. Probar la Migración

1. Abre la aplicación en modo desarrollo (`http://localhost:3369/`)
2. Verifica que no haya errores en la consola
3. Inicia sesión con GitHub
4. Comprueba que el progreso se guarde correctamente
5. Verifica el leaderboard

## 🔄 Diferencias Clave entre Supabase y Firebase

| Característica | Supabase | Firebase |
|---------------|----------|----------|
| **Tipo de DB** | PostgreSQL (relacional) | Firestore (NoSQL documental) |
| **Consultas** | SQL completo | Limitado, sin JOINs |
| **Offline** | Manual con localStorage | Nativo con persistencia |
| **Auth** | Basado en Postgres RLS | Sistema propio integrado |
| **Funciones** | Stored procedures | Cloud Functions (separado) |
| **Tiempo real** | Suscripciones | Listeners nativos |

## ⚠️ Consideraciones Importantes

### 1. Migración de Datos Existentes

Si tienes datos en Supabase que necesitas migrar:

```javascript
// Script de migración (ejecutar en Node.js)
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

// Configurar ambos clientes
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
admin.initializeApp({ credential: admin.credential.cert(SERVICE_ACCOUNT) });
const db = admin.firestore();

// Migrar usuarios
async function migrateUsers() {
  const { data: users } = await supabase.from('user_profiles').select('*');
  
  for (const user of users) {
    await db.collection('user_profiles').doc(user.user_id).set({
      ...user,
      created_at: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
      updated_at: admin.firestore.Timestamp.fromDate(new Date(user.updated_at))
    });
  }
}
```

### 2. Límites de Firestore

- **Lecturas gratuitas**: 50,000/día
- **Escrituras gratuitas**: 20,000/día
- **Almacenamiento gratuito**: 1 GB
- **Índices compuestos**: Máximo 200 por colección

### 3. Optimización de Consultas

El leaderboard ahora requiere una colección denormalizada. Para aplicaciones grandes, considera:
- Usar Cloud Functions para actualizar el leaderboard
- Implementar paginación para listas grandes
- Usar caché del lado del cliente

## 🧪 Testing Checklist

- [ ] Autenticación con GitHub funciona
- [ ] El perfil de usuario se crea/actualiza
- [ ] El progreso se guarda correctamente
- [ ] El modo offline funciona
- [ ] El leaderboard muestra datos
- [ ] Las estadísticas se calculan bien
- [ ] El juego Matrix guarda scores
- [ ] Logout funciona correctamente
- [ ] No hay errores en consola

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador
2. Verifica las reglas de seguridad en Firebase Console
3. Comprueba que los índices estén creados
4. Revisa los logs de Cloud Functions (si usas)

## 🎯 Próximos Pasos Recomendados

1. **Implementar Cloud Functions** para el leaderboard automático
2. **Agregar Analytics** de Firebase para tracking de uso
3. **Configurar Hosting** en Firebase para mejor rendimiento
4. **Implementar notificaciones push** para recordatorios de estudio
5. **Agregar Remote Config** para A/B testing de características
