# Backlog técnico UX/UI (priorizado)

## Objetivo
Convertir la hoja de ruta UX/UI en tickets ejecutables, con alcance claro, criterios de aceptación y prioridad por impacto/esfuerzo.

---

## Fase 1 (1 semana) — Quick wins

### UX-001 — Unificación de microcopy ES/EN en navegación y CTAs
- Prioridad: Alta
- Esfuerzo: S
- Impacto: Alto
- Estado: Completado (2026-02-12)
- Alcance:
  - Revisar textos de tabs, botones principales y labels de flujo activo (Practice/Quiz/Matrix/Ranking/Stats).
  - Asegurar consistencia de voz y terminología en ambos idiomas.
- Criterios de aceptación:
  - No hay mezcla ES/EN en un mismo estado de pantalla para elementos principales.
  - Todos los textos dependen de claves de traducción y no de strings hardcodeados.
  - Validación manual completa en ES y EN por cada pestaña principal.

### UX-002 — Empty states accionables en Ranking y Estadísticas
- Prioridad: Alta
- Esfuerzo: S
- Impacto: Alto
- Estado: Completado (2026-02-12)
- Alcance:
  - Añadir mensaje orientado a acción y CTA visible cuando no hay datos.
  - CTA debe llevar al usuario a Práctica para generar progreso.
- Criterios de aceptación:
  - En estado vacío, existe CTA único y claro.
  - El CTA navega a Práctica correctamente.
  - Mensajes en ES y EN correctos.

### UX-003 — Toasts de feedback para acciones críticas
- Prioridad: Alta
- Esfuerzo: M
- Impacto: Alto
- Estado: Completado (2026-02-12)
- Alcance:
  - Feedback no intrusivo para: cambio de idioma, guardado/sincronización, reset de estadísticas y envío de respuesta en quiz.
- Criterios de aceptación:
  - Toda acción crítica muestra feedback visual en <300ms.
  - Toasts tienen versión éxito/error y expiran automáticamente.
  - No bloquean interacción del usuario.

### UX-004 — Estandarización de etiquetas de botones
- Prioridad: Media
- Esfuerzo: S
- Impacto: Medio
- Estado: Completado (2026-02-12)
- Alcance:
  - Homogeneizar verbos de acción (ejemplo: Comenzar, Enviar, Siguiente, Reintentar).
- Criterios de aceptación:
  - No existen duplicidades semánticas para la misma acción.
  - Botones equivalentes usan texto consistente en ES y EN.

---

## Fase 2 (2 semanas) — Flujo de aprendizaje

### UX-005 — Barra de progreso global persistente
- Prioridad: Alta
- Esfuerzo: M
- Impacto: Alto
- Alcance:
  - Mostrar progreso global en header y estado contextual por módulo.
- Criterios de aceptación:
  - Progreso visible en todas las pestañas.
  - Se actualiza al estudiar tarjetas, responder quiz y completar acciones del juego.

### UX-006 — Contexto de pregunta en Quiz
- Prioridad: Alta
- Esfuerzo: S
- Impacto: Alto
- Alcance:
  - Añadir metadatos visibles por pregunta: nivel HSK, número de pregunta y total.
- Criterios de aceptación:
  - El usuario siempre ve en qué punto del quiz está.
  - El dato mostrado coincide con el estado interno del quiz.

### UX-007 — Reanudar sesión en Quiz y Matrix
- Prioridad: Media
- Esfuerzo: M
- Impacto: Alto
- Alcance:
  - Persistir estado temporal de sesión para retomar sin perder progreso si cambia de pestaña o recarga.
- Criterios de aceptación:
  - Si existe sesión activa reciente, se ofrece “Reanudar”.
  - Reanudar restaura estado funcional (pregunta actual, puntaje/tiempo).

### UX-008 — Mejorar flujo de primer uso (onboarding mínimo)
- Prioridad: Media
- Esfuerzo: M
- Impacto: Medio
- Alcance:
  - Incluir hints contextuales no modales en primera interacción.
- Criterios de aceptación:
  - Usuario nuevo recibe guía breve en Home y primer módulo abierto.
  - Puede cerrar hints y no se vuelven a mostrar en la misma sesión.

---

## Fase 3 (1 mes) — Accesibilidad y consistencia visual

### UX-009 — Contraste y legibilidad de textos secundarios
- Prioridad: Alta
- Esfuerzo: S
- Impacto: Alto
- Estado: Completado (2026-02-12)
- Alcance:
  - Ajustar tokens para placeholders, textos muted y estados disabled.
- Criterios de aceptación:
  - Contraste mínimo aceptable en ambos temas (claro/oscuro).
  - Textos secundarios son legibles en móvil y desktop.

### UX-010 — Área táctil mínima en controles pequeños
- Prioridad: Alta
- Esfuerzo: S
- Impacto: Alto
- Estado: Completado (2026-02-12)
- Alcance:
  - Aumentar target de interacción en icon buttons y toggles (mínimo 44x44).
- Criterios de aceptación:
  - Botones de audio/tema/acciones pequeñas son fácilmente clicables en móvil.
  - No hay regresión visual grave en desktop.

### UX-011 — Navegación por teclado y foco visible
- Prioridad: Media
- Esfuerzo: M
- Impacto: Alto
- Estado: Completado (2026-02-12)
- Alcance:
  - Definir orden de tabulación y estilos de foco consistentes.
- Criterios de aceptación:
  - Toda acción principal puede ejecutarse con teclado.
  - El foco visible es claro en ambos temas.

### UX-012 — Auditoría de consistencia visual por componentes
- Prioridad: Media
- Esfuerzo: M
- Impacto: Medio
- Estado: Completado (2026-02-12)
- Alcance:
  - Revisar spacing, jerarquía tipográfica, iconografía y estados de interacción.
- Criterios de aceptación:
  - Checklist visual sin desviaciones críticas en componentes principales.
  - Tokens de diseño reutilizados, sin estilos ad-hoc innecesarios.

---

## Dependencias sugeridas
- UX-001 antes de UX-004 y UX-006.
- UX-003 antes de UX-007 (feedback de recuperación/reanudación).
- UX-009 y UX-010 antes de UX-011.

---

## KPIs por fase
- Fase 1:
  - Disminución de incidencias de idioma mixto.
  - Mejora de conversión desde empty state hacia Práctica.
- Fase 2:
  - Aumento de tasa de finalización de Quiz.
  - Aumento de sesiones retomadas en Quiz/Matrix.
- Fase 3:
  - Menor tasa de abandono por interacción fallida en móvil.
  - Mejora en métricas de accesibilidad básica.

---

## Propuesta de orden de implementación inmediata
1. UX-001
2. UX-002
3. UX-003
4. UX-005
5. UX-007
