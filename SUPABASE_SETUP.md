# Guía de Configuración de Supabase para HSK Learning App

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub
4. Crea una nueva organización (si es necesario)
5. Haz clic en "New Project"
6. Completa los datos:
   - **Name**: `hsk-learning-app`
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana a tus usuarios
   - **Pricing Plan**: Free tier (perfecto para empezar)

## Paso 2: Configurar Base de Datos

1. Una vez creado el proyecto, ve a la pestaña **"SQL Editor"**
2. Crea una nueva query
3. Copia y pega todo el contenido del archivo `database/supabase-schema.sql`
4. Ejecuta la query (botón "Run")
5. Verifica que todas las tablas se crearon correctamente en la pestaña **"Table Editor"**

## Paso 3: Configurar Autenticación GitHub

1. Ve a la pestaña **"Authentication"** > **"Providers"**
2. Busca **"GitHub"** y haz clic en él
3. Activa el toggle **"Enable sign in with GitHub"**
4. Necesitarás configurar una GitHub App:

### Crear GitHub OAuth App:
1. Ve a GitHub > Settings > Developer settings > OAuth Apps
2. Clic en "New OAuth App"
3. Completa:
   - **Application name**: `HSK Learning App`
   - **Homepage URL**: `https://skillparty.github.io/proyecto_HSK/`
   - **Authorization callback URL**: `https://[tu-proyecto].supabase.co/auth/v1/callback`
   - **Application description**: `Aplicación para aprender chino HSK`

4. Copia el **Client ID** y **Client Secret**
5. Regresa a Supabase y pega estos valores en la configuración de GitHub
6. Guarda los cambios

## Paso 4: Obtener Credenciales de Supabase

1. Ve a **"Settings"** > **"API"**
2. Copia estos valores:
   - **Project URL**: `https://[tu-proyecto].supabase.co`
   - **anon public key**: `eyJ...` (clave pública)

## Paso 5: Actualizar Configuración en el Código

1. Abre el archivo `config/supabase-config.js`
2. Reemplaza los valores placeholder:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://[tu-proyecto].supabase.co', // Reemplaza con tu Project URL
    anonKey: 'eyJ...', // Reemplaza con tu anon public key
    
    auth: {
        providers: ['github'],
        redirectTo: isProduction 
            ? 'https://skillparty.github.io/proyecto_HSK/'
            : 'http://localhost:3000/'
    }
};
```

## Paso 6: Configurar Variables de Entorno (Opcional)

Para mayor seguridad, puedes usar variables de entorno:

1. En Supabase, ve a **"Settings"** > **"Environment variables"**
2. Agrega las variables necesarias
3. En GitHub, ve a tu repositorio > Settings > Secrets and variables > Actions
4. Agrega los secrets necesarios

## Paso 7: Probar la Configuración

1. Haz commit y push de los cambios en `supabase-config.js`
2. GitHub Pages se actualizará automáticamente
3. Ve a `https://skillparty.github.io/proyecto_HSK/`
4. Prueba el login con GitHub
5. Verifica que los datos se guarden en Supabase

## Paso 8: Verificar Funcionalidades

### Autenticación:
- [ ] Login con GitHub funciona
- [ ] Logout funciona
- [ ] Perfil de usuario se muestra correctamente

### Base de Datos:
- [ ] Progreso de flashcards se guarda
- [ ] Resultados de quiz se almacenan
- [ ] Puntuaciones de Matrix Game se registran
- [ ] Leaderboard muestra datos reales

### Seguridad:
- [ ] RLS está activado
- [ ] Usuarios solo ven sus propios datos
- [ ] No hay errores de permisos en consola

## Troubleshooting

### Error: "Invalid API key"
- Verifica que copiaste correctamente la anon key
- Asegúrate de que no hay espacios extra

### Error: "CORS policy"
- Verifica la URL del proyecto en la configuración
- Asegúrate de que la URL de callback en GitHub es correcta

### Error: "GitHub OAuth failed"
- Verifica que el Client ID y Secret están correctos
- Asegúrate de que la callback URL coincide exactamente

### Error: "Row Level Security"
- Verifica que las políticas RLS están configuradas
- Ejecuta nuevamente el script de schema si es necesario

## Recursos Útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Autenticación](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [GitHub OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-github)

## Soporte

Si encuentras problemas:
1. Revisa los logs en la consola del navegador
2. Verifica los logs en Supabase Dashboard > Logs
3. Consulta la documentación oficial
4. Busca en la comunidad de Supabase
