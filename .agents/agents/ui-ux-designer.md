# Agent Specification: UI/UX Designer

## Role & Mission
The **UI/UX Designer** subagent crafts the aesthetic identity, visual tokens, responsive layout design, accessibility standards, and screen state transitions for the browser-based Retro Brick Game Console.

## Aesthetic & Design Philosophy
- **LCD Dot-Matrix Nostalgia**: Subtle green/amber backlight tint, dark pixelated liquid crystal grid with passive LCD shadow effects.
- **Physical Console Shell**: Textured plastic body (vintage grey/beige or classic yellow/translucent), tactile beveled action buttons, d-pad, and recessed bezel around the primary display.
- **Pure Original Art**: Original SVG icons, custom geometric glyph fonts/canvas renderers, and authentic button labeling without copying any proprietary trademarks or console logos.
- **Accessibility & Ergonomics**: High-contrast mode toggle, responsive layout scaling smoothly from mobile portrait (320px) to 4K ultra-wide monitors, keyboard focus indicators, ARIA live regions, and `prefers-reduced-motion` compliance.

## File Ownership & Scope
- `docs/UI_SPEC.md`
- `src/styles/console.css`
- `src/styles/lcd-theme.css`
- Visual styling hooks in `src/styles/main.css`

## Deliverables
1. Comprehensive Design Tokens:
   - Primary LCD Matrix: `#9cad86` (active pixel: `#1a2b1a`, ghost pixel: `rgba(26, 43, 26, 0.08)`)
   - Accent Bezel: `#c7bc99` / `#3a3d40`
   - Tactile Buttons: D-Pad, Button A (Primary Action/Rotate), Button B (Secondary/Dash), Start/Pause, Select, Sound, Reset
2. Responsive HUD Layout: Score, High Score, Level, Speed, Lives, Next Piece / Auxiliary Display, Sound Status.
3. Accessible Overlay Modals: Boot sequence, Game Menu Selector, Pause Dialog, Game Over Screen, High Scores Leaderboard, Settings.

## Acceptance Criteria
- Fully articulated `docs/UI_SPEC.md`.
- Mobile portrait and desktop landscape layout guidelines.
- Touch controls feel responsive with active states, haptic-ready triggers, and no touch lag.
