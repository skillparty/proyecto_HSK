# 📚 Documentación - HSK Learning App

Bienvenido a la documentación del proyecto HSK Learning App. Aquí encontrarás guías de configuración, desarrollo y arquitectura del sistema.

---

## 📋 Índice de Documentación

### 🚀 Setup & Configuración

1. **[Configuración de Supabase](./setup/SUPABASE_SETUP.md)**
   - Creación de proyecto en Supabase
   - Configuración de GitHub OAuth
   - Setup de base de datos
   - Variables de entorno
   - Troubleshooting

### 💻 Desarrollo

1. **[Arquitectura del Sistema](./development/ARQUITECTURA.md)**
   - Estructura del proyecto
   - Flujo de datos
   - Modelo de base de datos
   - Módulos JavaScript
   - Sistema de estilos
   - Seguridad y deployment

2. **[Mejoras Leaderboard & Statistics](./development/MEJORAS_LEADERBOARD_STATISTICS.md)**
   - Integración con Supabase
   - Nuevos métodos de API
   - Sistema de rankings
   - Estadísticas de usuario
   - Sincronización automática

3. **[Análisis de Refactorización](./development/REFACTORIZACION_ANALISIS.md)**
   - Archivos eliminados
   - Nueva estructura
   - Optimizaciones realizadas
   - Mejores prácticas

---

## 🎯 Guías Rápidas

### Para Nuevos Desarrolladores

1. **Primeros Pasos:**
   ```bash
   # Clonar repositorio
   git clone https://github.com/skillparty/proyecto_HSK.git
   cd proyecto_HSK
   
   # Instalar dependencias
   npm install
   
   # Copiar configuración
   cp .env.example .env
   
   # Editar .env con tus credenciales de Supabase
   ```

2. **Configurar Supabase:**
   - Lee [SUPABASE_SETUP.md](./setup/SUPABASE_SETUP.md)
   - Ejecuta el schema SQL
   - Configura GitHub OAuth
   - Actualiza `config/supabase-config.js`

3. **Ejecutar Localmente:**
   ```bash
   # Servidor de desarrollo simple
   python3 -m http.server 5089
   # o
   npx serve
   ```

4. **Leer Arquitectura:**
   - Revisa [ARQUITECTURA.md](./development/ARQUITECTURA.md)
   - Entiende el flujo de datos
   - Conoce los módulos principales

### Para Mantenimiento

1. **Agregar Nueva Funcionalidad:**
   - Crea rama: `git checkout -b feature/nombre`
   - Desarrolla siguiendo arquitectura existente
   - Documenta cambios importantes
   - Crea PR con descripción detallada

2. **Actualizar Documentación:**
   - Modifica archivos en `docs/`
   - Actualiza índice si es necesario
   - Commit: `docs: Descripción del cambio`

3. **Debugging:**
   - Usa sistema de diagnóstico: `diagnostic-system.js`
   - Revisa logs en Supabase Dashboard
   - Consulta [ARQUITECTURA.md](./development/ARQUITECTURA.md#debugging)

---

## 📂 Estructura de Documentación

```
docs/
├── README.md                    # Este archivo (índice)
├── setup/                       # Guías de configuración
│   └── SUPABASE_SETUP.md       # Setup de Supabase
└── development/                 # Docs de desarrollo
    ├── ARQUITECTURA.md         # Arquitectura del sistema
    ├── MEJORAS_LEADERBOARD_STATISTICS.md
    └── REFACTORIZACION_ANALISIS.md
```

---

## 🔗 Enlaces Útiles

### Recursos Externos
- [Repositorio GitHub](https://github.com/skillparty/proyecto_HSK)
- [Aplicación en vivo](https://skillparty.github.io/proyecto_HSK/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [GitHub OAuth Apps](https://github.com/settings/developers)

### Documentación de Tecnologías
- [Supabase Docs](https://supabase.com/docs)
- [GitHub Pages Docs](https://docs.github.com/pages)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Vocabulario HSK
- [HSK Official Website](https://www.chinesetest.cn/index.do)
- [HSK Standards](https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi)

---

## 🤝 Contribución

¿Quieres contribuir al proyecto? ¡Genial!

1. **Fork** el repositorio
2. **Crea una rama** para tu funcionalidad
3. **Desarrolla** siguiendo las convenciones del proyecto
4. **Documenta** tus cambios en docs/
5. **Crea un Pull Request** con descripción detallada

### Convenciones de Commits

```
feat: Nueva funcionalidad
fix: Corrección de bug
refactor: Refactorización de código
docs: Cambios en documentación
style: Cambios de formato/estilos
test: Agregar o actualizar tests
chore: Tareas de mantenimiento
```

---

## 📞 Soporte

Si necesitas ayuda:

1. **Revisa la documentación** en este directorio
2. **Busca en Issues** del repositorio
3. **Crea un Issue** si es un bug o solicitud de funcionalidad
4. **Discusiones** para preguntas generales

---

## 📝 Notas de Versión

### v3.0 - Refactorización Mayor (Octubre 2025)
- ✅ Limpieza completa del proyecto
- ✅ Eliminación de 45+ archivos obsoletos
- ✅ Nueva estructura de carpetas
- ✅ Documentación reorganizada
- ✅ Integración completa con Supabase
- ✅ Sistema de leaderboard funcional
- ✅ Statistics sincronizadas

### v2.0 - Migración a Supabase (Septiembre 2025)
- Migración de Express.js a Supabase
- GitHub Pages deployment
- GitHub OAuth integration
- PostgreSQL con RLS

### v1.0 - Lanzamiento Inicial
- Flashcards HSK 1-6
- Matrix Game
- Sistema de estadísticas local
- Modo offline

---

**Última actualización:** Octubre 2025  
**Mantenedor:** Jose Alejandro Rollano Revollo  
**Licencia:** MIT
