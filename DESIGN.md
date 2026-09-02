---
version: 4.0.0
name: Confuc10++ (Sino-Bolivian Fusion Theme)
description: Confuc10++ is an advanced HSK Mandarin Chinese learning platform designed with a unique Sino-Bolivian aesthetic fusion. It blends traditional Chinese imperial red and calligraphy aesthetics with the vibrant Bolivian tricolor identity (Red, Yellow, Green), structured over a clean, academic, Notion-like functional interface.
colors:
  primary: "#e53935"
  primary-hover: "#c62828"
  primary-subtle: "#ffebee"
  primary-glow: "rgba(229, 57, 53, 0.25)"
  secondary: "#000000"
  accent: "#facc15"
  accent-subtle: "#fef9c3"
  bg-app: "#ffffff"
  bg-panel: "#ffffff"
  bg-card: "#ffffff"
  bg-hover: "#f4f4f5"
  border: "#e4e4e7"
  border-subtle: "#f4f4f5"
  text-main: "#000000"
  text-charcoal: "#18181b"
  text-muted: "#52525b"
  text-dim: "#71717a"
  text-on-dark: "#ffffff"
  semantic-success: "#22c55e"
  semantic-success-subtle: "#dcfce7"
  semantic-warning: "#facc15"
  semantic-warning-subtle: "#fef9c3"
  semantic-error: "#ef4444"
  semantic-error-subtle: "#fee2e2"
  tone-1: "#dc2626"
  tone-2: "#16a34a"
  tone-3: "#2563eb"
  tone-4: "#7c3aed"
  tone-0: "#6b7280"
  card-tint-peach: "#fff7ed"
  card-tint-rose: "#fff1f2"
  card-tint-mint: "#f0fdf4"
  card-tint-lavender: "#faf5ff"
  card-tint-sky: "#f0f9ff"
  card-tint-yellow: "#fef9c3"

typography:
  font-main: "Inter, -apple-system, system-ui, 'Segoe UI', Helvetica, sans-serif"
  font-display: "'Noto Serif SC', 'Songti SC', Georgia, serif"
  font-chinese: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
  font-chinese-serif: "'Noto Serif SC', 'Songti SC', 'Noto Sans SC', serif"
  font-mono: "'JetBrains Mono', 'Fira Code', monospace"
  display-lg:
    fontSize: "56px"
    lineHeight: "1.15"
    letterSpacing: "-1px"
  heading-1:
    fontSize: "48px"
    lineHeight: "1.15"
    letterSpacing: "-0.5px"
  heading-2:
    fontSize: "36px"
    lineHeight: "1.20"
    letterSpacing: "-0.5px"
  heading-3:
    fontSize: "28px"
    lineHeight: "1.25"
  heading-4:
    fontSize: "22px"
    lineHeight: "1.30"
  subtitle:
    fontSize: "18px"
    lineHeight: "1.50"
  body-base:
    fontSize: "16px"
    lineHeight: "1.55"
  body-sm:
    fontSize: "14px"
    lineHeight: "1.50"
  caption:
    fontSize: "12px"
    lineHeight: "1.40"

rounded:
  none: "0px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"

spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  xxl: "32px"
  section: "64px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-on-dark}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  card-base:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.border}"
  hanzi-card:
    fontFamily: "{typography.font-chinese}"
    fontSize: "80px"
    lineHeight: "1.1"
    textAlign: "center"
---

# Confuc10++ — Design System Specification

## 1. Overview & Brand Identity

**Confuc10++** is a modern, academic, and gamified web application for mastering Mandarin Chinese according to the HSK standards (HSK 1 to HSK 6+).

### Design Philosophy: Sino-Bolivian Fusion
- **Sino Heritage**: Imperial Chinese Red (`#e53935`), calligraphy backgrounds, songti serif typography for Hanzi display, and strict 5-tone pedagogical color standards.
- **Bolivian Vibrancy**: Clean, high-contrast integration of Red, Yellow/Gold (`#facc15`), and Jade Green (`#22c55e`).
- **Academic Notion-like Layout**: Clean cards, subtle hairline borders (`#e4e4e7`), 8px button radiuses, clear typographic hierarchy, and distraction-free dark mode (`Zinc-950` base).

---

## 2. Color System & Pedagogical Tones

### 2.1 Brand & Semantic Palette
- **Primary Brand (Imperial Red)**: `--color-primary: #e53935` (Hover: `#c62828`, Subtle: `#ffebee`)
- **Accent (Golden Yellow)**: `--color-accent: #facc15` (Subtle: `#fef9c3`)
- **Success (Emerald Green)**: `--color-success: #22c55e` (Subtle: `#dcfce7`)
- **Error**: `--color-error: #ef4444` (Subtle: `#fee2e2`)
- **Dark Mode Base**: `--color-bg-app: #09090b` (Zinc 950), Cards: `#141417`, Hover: `#27272a`

### 2.2 Mandarin Tone Colors (Single Source of Truth)
In accordance with international Chinese pedagogical conventions:
- **1st Tone (Flat / Mā)**: `--color-tone-1: #dc2626` (Dark mode: `#ef4444`)
- **2nd Tone (Rising / Má)**: `--color-tone-2: #16a34a` (Dark mode: `#22c55e`)
- **3rd Tone (Dipping / Mǎ)**: `--color-tone-3: #2563eb` (Dark mode: `#3b82f6`)
- **4th Tone (Falling / Mà)**: `--color-tone-4: #7c3aed` (Dark mode: `#a78bfa`)
- **Neutral Tone (Light / Ma)**: `--color-tone-0: #6b7280` (Dark mode: `#9ca3af`)

---

## 3. Typography Hierarchy

### 3.1 Font Stacks
1. **Primary UI (Latin/Pinyin)**: `Inter, -apple-system, system-ui, 'Segoe UI', Helvetica, sans-serif`
2. **Hanzi Regular (Simplified)**: `'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`
3. **Hanzi Display (Serif / Songti)**: `'Noto Serif SC', 'Songti SC', Georgia, serif`
4. **Code / Metrics**: `'JetBrains Mono', 'Fira Code', monospace`

### 3.2 Scales
- **Hanzi Hero**: `120px` (Home banner / Canvas writing practice)
- **Hanzi Card (Flashcard)**: `80px` (`--hanzi-xl`)
- **Hanzi Medium**: `36px` (`--hanzi-md`)
- **Hanzi Small**: `24px` (`--hanzi-sm`)
- **Pinyin**: `14px - 18px` with tone mark support (`unicode-range: U+0300-036F, U+00C0-00FF`)

---

## 4. Components & Surface Rules

### 4.1 Buttons & Interactive Controls
- Rectangular buttons with `--radius-md` (8px). **Never** use pill buttons for general actions.
- Primary buttons: Background `#e53935`, Text `#ffffff`, Weight 500.
- Pill shapes (`--radius-pill: 9999px`) are reserved exclusively for status chips, tags, and HSK level badges.
- Keyboard focus visible: Custom focus ring `0 0 0 3px rgba(229, 57, 53, 0.45)` adhering to WCAG 2.4.7.

### 4.2 Flashcard System & Mi Zi Ge Canvas
- Flashcards use a 3D perspective flip (`perspective: 1000px`, `transform-style: preserve-3d`).
- Canvas stroke orders render inside a traditional *Mi Zi Ge* (米字格) 8-quadrant guide box with dashed diagonal and cross axes.

### 4.3 Dark Mode Architecture
- Single source of truth driven by CSS custom properties under `html[data-theme="dark"]`.
- Never inject inline color styles via JavaScript; toggle `data-theme` on the root HTML element.
- Elevated cards use translucent tint overlays to prevent glare while maintaining high contrast (4.5:1 minimum).

---

## 5. Accessibility & Motion Guidelines

1. **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by setting animation durations to `0.01ms`.
2. **Text Contrast**: Dark mode red text adjustments (`#ef4444` and `#f87171`) ensure WCAG AA compliance across dark cards.
3. **PWA Standalone Experience**: Supports Window Controls Overlay, custom title bar, and touch-friendly bottom navigation.
