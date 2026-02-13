# Confuc10++ - HSK Learning Platform

Aplicación web para aprendizaje de chino mandarín orientada al estándar HSK, con práctica diaria, evaluación y seguimiento de progreso.

## Resumen

Confuc10++ está diseñado para estudiar vocabulario HSK mediante tarjetas de práctica, cuestionarios y un modo de juego de velocidad. El sistema incorpora autenticación, sincronización de progreso y una interfaz bilingüe.

## Funcionalidades principales

- Práctica con flashcards de caracteres, pinyin y traducciones
- Navegación de vocabulario por niveles HSK
- Quiz configurable con resultados y retroalimentación
- Modo Matrix para práctica rápida en formato juego
- Estadísticas de progreso y leaderboard
- Interfaz en español e inglés
- Tema claro/oscuro, soporte responsive y capacidades PWA

## Arquitectura y stack

| Capa | Tecnología |
|------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend gestionado | Supabase (PostgreSQL, Auth) |
| Autenticación | GitHub OAuth vía Supabase |
| Hosting | GitHub Pages |
| PWA | Service Worker y Web App Manifest |

## Ejecución local

### Requisitos

- Node.js 18+

### Pasos

```bash
git clone https://github.com/skillparty/proyecto_HSK.git
cd proyecto_HSK
npm install
npm run dev
```

Abrir en navegador: http://localhost:3369

## Configuración de entorno

Crear un archivo `.env` a partir de `.env.example` y definir:

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
```

## Configuración de Supabase

1. Crear un proyecto en Supabase.
2. Ejecutar el script `database/supabase-schema.sql`.
3. Configurar GitHub como proveedor OAuth en Supabase Auth.
4. Revisar políticas de acceso (RLS) según el entorno.

## Scripts disponibles

- `npm run dev`: inicia un servidor local en el puerto 3369.
- `npm test`: validación mínima (placeholder del proyecto).

## Estructura del repositorio

```text
proyecto_HSK/
├── index.html
├── assets/
│   ├── css/
│   ├── data/
│   ├── images/
│   └── js/
├── config/
├── database/
├── docs/
├── package.json
└── README.md
```

## Despliegue

El repositorio está preparado para despliegue en GitHub Pages.

URL de producción: https://skillparty.github.io/proyecto_HSK/

## Autor

Jose Alejandro Rollano Revollo  
GitHub: https://github.com/skillparty

## Licencia

MIT
