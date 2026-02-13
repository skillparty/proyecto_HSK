# UX QA Report — 2026-02-12

## Alcance
Validación final de tickets implementados:
- UX-009 — Contraste y legibilidad de textos secundarios
- UX-010 — Área táctil mínima en controles pequeños
- UX-011 — Navegación por teclado y foco visible
- UX-012 — Consistencia visual por componentes

## Verificación técnica (automatizada)
- `node --check assets/js/app.js` ✅
- `node --check assets/js/translations.js` ✅
- Errores de editor (CSS/JS/HTML modificados) ✅

Archivos validados:
- `assets/css/styles-professional.css`
- `assets/css/leaderboard-styles.css`
- `assets/css/user-profile-styles.css`
- `assets/js/app.js`
- `index.html`

## Cambios de versión de assets (cache-bust)
- `styles-professional.css?v=8`
- `leaderboard-styles.css?v=2`
- `user-profile-styles.css?v=2`
- `app.js?v=15`

## Checklist QA manual (navegador)

### UX-009 (contraste)
- [ ] Revisar placeholders en `Practice` y `Browse` (desktop + móvil).
- [ ] Verificar textos secundarios (`muted/dim`) legibles en tarjetas y paneles.
- [ ] Comprobar estados `disabled` en inputs/botones (color y cursor `not-allowed`).

### UX-010 (touch targets)
- [ ] En móvil (`<=768px`), comprobar tamaño táctil cómodo en:
  - [ ] `#theme-toggle`
  - [ ] `#audio-toggle`
  - [ ] `.vocab-audio-btn`
  - [ ] `.card-back-pronunciation`
- [ ] Confirmar que en desktop no hay regresión visual severa en header y cards.

### UX-011 (teclado + foco)
- [ ] Navegar con `Tab` por header, tabs, botones y cards; foco debe ser visible.
- [ ] Activar con `Enter/Espacio` tarjetas de Home (`home-card`).
- [ ] Activar con `Enter/Espacio` tarjetas de vocabulario (`vocab-card`).
- [ ] Activar flip de `flashcard` con teclado sin interferir con inputs/botones internos.

### UX-012 (consistencia visual)
- [ ] Verificar foco y estilos de `control-select` + `refresh-btn` en Leaderboard.
- [ ] Verificar botón de login en perfil con acento visual alineado al primario global.
- [ ] Revisar uniformidad de bordes/transiciones/estados en Home, Browse, Matrix, Leaderboard y Profile.

## Resultado esperado
Si todo el checklist manual pasa, la Fase 3 del backlog UX/UI queda cerrada sin desviaciones críticas.

## Guía rápida de ejecución (5 minutos)

### 0) Preparación (30s)
- Ejecutar `npm run dev`.
- Abrir `http://localhost:3369` en desktop.
- Abrir DevTools y alternar a viewport móvil (`<=768px`) para los checks táctiles.

### 1) Home + Header (60s)
- Con `Tab`, recorrer `language-select`, `theme-toggle`, `voice-select`, `audio-toggle` y tabs.
- Verificar foco visible en cada control.
- En Home, enfocar cada `home-card` y activar con `Enter` (o `Espacio`) para confirmar navegación.

### 2) Practice (75s)
- Confirmar legibilidad de placeholder en `#pinyin-input`.
- Navegar con `Tab` hasta botones/controles y validar foco visible.
- Abrir reverso de flashcard y usar botón de pronunciación (`.card-back-pronunciation`) en móvil: target cómodo.

### 3) Browse (60s)
- Revisar placeholder en `.search-input`.
- Con teclado, enfocar una `vocab-card` y activar con `Enter/Espacio`.
- Validar `.vocab-audio-btn` en móvil: target táctil cómodo y sin solapamientos.

### 4) Quiz + Matrix + Stats/Leaderboard + Profile (75s)
- Quiz/Matrix: confirmar foco visible en acciones principales y ausencia de regresión de spacing.
- Leaderboard: revisar `control-select` y `refresh-btn` (focus/hover coherentes con tema).
- Profile: verificar `auth-login-btn`/`logout-btn`/`github-login-btn` con acento visual y foco consistente.

## Registro de resultado (quick log)

| Área | Resultado | Nota |
|---|---|---|
| Home + Header | ⬜ Pass / ⬜ Fail | |
| Practice | ⬜ Pass / ⬜ Fail | |
| Browse | ⬜ Pass / ⬜ Fail | |
| Quiz + Matrix | ⬜ Pass / ⬜ Fail | |
| Leaderboard + Profile | ⬜ Pass / ⬜ Fail | |
