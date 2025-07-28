#  HSK Learning - Advanced Chinese Learning Platform

Una aplicación web interactiva para aprender vocabulario chino basado en los niveles HSK (Hanyu Shuiping Kaoshi). La aplicación incluye práctica con flashcards, exploración de vocabulario, quizzes, seguimiento de estadísticas y un diseño moderno con UX/UI mejorada.

**Desarrollado por Jose Alejandro Rollano Revollo**

##  Características

###  Práctica con Flashcards
- **4 modos de práctica diferentes:**
  - Carácter → Pinyin
  - Carácter → Inglés  
  - Pinyin → Carácter
  - Inglés → Carácter
- Filtrado por nivel HSK (1-6 o todos)
- Tarjetas interactivas con animación 3D
- Sistema de progreso y evaluación personal
- Historial de palabras estudiadas

###  Explorador de Vocabulario
- Navegación completa del vocabulario HSK
- Búsqueda por carácter, pinyin o traducción
- Filtros por nivel HSK
- Vista en tarjetas organizadas
- Interfaz responsive

###  Sistema de Quiz
- Quizzes configurables por nivel HSK
- Opciones de 10, 20 o 30 preguntas
- Preguntas de opción múltiple
- Retroalimentación inmediata
- Resultados y porcentajes de acierto

###  Estadísticas de Aprendizaje
- Palabras totales estudiadas
- Porcentaje de precisión
- Racha actual de aciertos
- Número de quizzes completados
- Progreso por nivel HSK
- Persistencia de datos con localStorage

##  Estructura del Proyecto

```
proyecto_HSK/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── app.js             # Lógica JavaScript
├── hsk_vocabulary.json # Base de datos de vocabulario
└── README.md          # Documentación
```

##  Instalación y Uso

### Prerrequisitos
- Navegador web moderno
- Servidor web local (opcional pero recomendado)

### Instalación

1. **Clona o descarga el proyecto:**
   ```bash
   git clone [url-del-repositorio]
   cd proyecto_HSK
   ```

2. **Inicia un servidor web local:**
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (si tienes http-server instalado)
   npx http-server
   
   # Con PHP
   php -S localhost:8000
   ```

3. **Abre tu navegador y ve a:**
   ```
   http://localhost:8000
   ```

### Uso Directo
También puedes abrir directamente el archivo `index.html` en tu navegador, aunque algunos navegadores pueden tener restricciones CORS para cargar el archivo JSON.

##  Contenido del Vocabulario

El archivo `hsk_vocabulary.json` contiene **5000 palabras oficiales del HSK completo** estructuradas con:

```json
{
  "character": "爱",
  "pinyin": "ài", 
  "translation": "love",
  "level": 1
}
```

###  **Distribución Oficial HSK Completa:**
- **HSK 1**: 150 palabras (3.0%)
- **HSK 2**: 150 palabras (3.0%)
- **HSK 3**: 300 palabras (6.0%)
- **HSK 4**: 600 palabras (12.0%)
- **HSK 5**: 1300 palabras (26.0%)
- **HSK 6**: 2500 palabras (50.0%)
- **Total**: **5000 palabras** 🎯

###  **Fuentes Oficiales:**
- **Niveles 1-3**: Vocabulario estándar HSK
- **Niveles 4-6**: [HSK Official Lists](https://github.com/glxxyz/hskhsk.com) - Listas oficiales 2012
- **Calidad**: Pinyin con tonos diacríticos y traducciones precisas

###  **Estructura de Datos:**
- **character**: Carácter chino simplificado
- **pinyin**: Pronunciación con tonos diacríticos (ài, xiǎng, etc.)
- **translation**: Traducción detallada al inglés
- **level**: Nivel HSK (1-6) - **TODOS LOS NIVELES DISPONIBLES**

##  Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: 
  - Grid y Flexbox para layouts
  - Gradientes y animaciones
  - Variables CSS
  - Media queries para responsividad
- **JavaScript ES6+**:
  - Clases y módulos
  - Async/await
  - LocalStorage para persistencia
  - Event listeners
- **Google Fonts**: 
  - Inter (interfaz)
  - Noto Sans SC (caracteres chinos)

##  Características Técnicas

### Arquitectura
- **Patrón de clase única**: Toda la lógica encapsulada en la clase `HSKApp`
- **Gestión de estado**: Estados reactivos para práctica, quiz y estadísticas
- **Persistencia**: Uso de localStorage para guardar progreso
- **Responsive**: Diseño adaptativo para móviles y escritorio

### Funcionalidades Avanzadas
- **Algoritmo de barajado**: Fisher-Yates shuffle para randomización
- **Sistema de sesiones**: Práctica organizada en sesiones
- **Filtrado dinámico**: Búsqueda en tiempo real
- **Animaciones CSS**: Transiciones suaves y efectos 3D
- **Gestión de errores**: Manejo de errores de carga de datos

##  Responsive Design

La aplicación está optimizada para:
- **Desktop**: Layout completo con múltiples columnas
- **Tablet**: Adaptación de grids y controles
- **Mobile**: Interfaz simplificada y navegación táctil

##  Mejoras Futuras

- [ ] Sistema de spaced repetition (SRS)
- [ ] Audio para pronunciación
- [ ] Modo oscuro
- [ ] Exportar/importar progreso
- [ ] Más idiomas de interfaz
- [ ] Gamificación con badges
- [ ] Práctica de escritura de caracteres
- [ ] API backend para sincronización

##  Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

##  Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

##  Desarrollador

**Jose Alejandro Rollano Revollo**

Desarrollado con ❤️ para estudiantes de chino mandarín.

*Versión 2.1.0 | Advanced Chinese Learning Platform 2025*

---

**¡Feliz aprendizaje! 加油! (Jiāyóu!)**
