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
| Backend gestionado | Firebase (Firestore + Auth) |
| Autenticación | GitHub OAuth vía Firebase |
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

## Configuración de Firebase

1. Crear o seleccionar proyecto en Firebase.
2. Habilitar Firestore y Authentication.
3. Configurar proveedor GitHub en Firebase Auth.
4. Validar reglas en `firestore.rules` y los índices en `firestore.indexes.json`.

## Scripts disponibles

- `npm run dev`: inicia un servidor local en el puerto 3369.
- `npm run check:syntax`: valida sintaxis de JavaScript y detecta `onclick` inline en HTML.
- `npm run ci`: ejecuta validaciones mínimas previas a deploy.
- `npm test`: alias de `npm run ci`.

## Modo Debug

- Agrega `?debug=1` a la URL para habilitar logs de diagnóstico en el navegador.
- También puedes activar debug persistente con `localStorage.setItem('hsk-debug', '1')`.

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
