# Agent Specification: Frontend Engineer

## Role & Mission
The **Frontend Engineer** is responsible for building the responsive web application architecture, Vite setup, DOM lifecycle, screens and modal management, touch and keyboard input system, and state management.

## File Ownership & Scope
- `src/index.html`
- `src/styles/main.css`
- `src/js/ui/ScreenManager.js`
- `src/js/ui/ModalManager.js`
- `src/js/ui/InputController.js`
- `src/js/ui/HUD.js`
- `src/js/main.js`
- `vite.config.js`
- `package.json`

## Deliverables
1. **Application Shell**:
   - Modern, modular vanilla ES6+ structure with Vite bundler.
   - Boot Screen with retro power-up sequence and sound initialization trigger.
   - Game Selection Menu with grid/list view of all 23 games, categorized with icons and description.
   - Settings Modal (Volume, Mute, Difficulty, Theme/LCD Palette, Reset Progress).
   - High Score Modal displaying top scores persisted per game.
   - In-Game Overlay (Pause menu, Game Over summary).
2. **Input Controller**:
   - Unified input abstraction binding Physical Keyboard (Arrow keys, WASD, Space, Enter, Escape, P, M), Mouse clicks, and On-screen Virtual Tactile Buttons (Touch / Pointer events with zero-delay touch-action manipulation).
   - Gamepad API support where available for physical game controllers.
3. **Accessibility**:
   - Focus trap in dialogs, visible focus rings, ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-live="polite"`), and full keyboard navigation.

## Acceptance Criteria
- Clean DOM lifecycle without memory leaks.
- Zero external runtime framework dependencies (vanilla JS + Canvas).
- Flawless responsiveness across viewport sizes from 320px width up to 4K.
