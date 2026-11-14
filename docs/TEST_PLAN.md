# Master Quality Assurance & Test Plan
**Project:** Retro Brick Game Console (23-in-1 Handheld LCD Emulator)  
**Version:** 1.0.0  
**Role:** Lead QA Engineer, Multiplayer Test Architect & Release Manager  
**Status:** Approved for Execution  
**Hosting Target:** Render Static Site ($0 Cost Tier)

---

## 1. Test Objectives & Strategy

The primary objective of this quality assurance cycle is to validate that the Retro Brick Game Console delivers an authentic, responsive, rock-solid, and accessible retro gaming experience. Specifically, the test strategy guarantees:

1. **Flawless Single-Player Experience**: All 23 original mini-games initialize, accept input, handle game loops, calculate scores, manage win/loss states, and cleanly release resources.
2. **Robust Multiplayer Execution**: Local head-to-head and turn-based games prevent input conflicts, enforce strict turn gates, track dual player scores accurately, and handle restart/pause cycles fairly.
3. **Cross-Platform & Cross-Device Stability**: Responsive ergonomics and consistent frame rates across Desktop (Chrome, Edge, Firefox, Safari), Tablets (iPadOS, Android), and Mobile Viewports.
4. **Data Integrity & Crash Immunity**: Complete resilience against malformed, corrupted, truncated, or malicious `localStorage` states.
5. **Universal Accessibility (a11y)**: Full WCAG 2.1 AA compliance including keyboard-only navigability, visible focus rings, ARIA labels, contrast ratios $\ge 4.5:1$, and `prefers-reduced-motion` support.
6. **Performance Budget**: Deterministic 60 FPS gameplay, sub-16.6ms frame rendering, zero memory leaks during extended multi-game sessions, and sub-second cold boot.
7. **Zero-Defect Release Gate**: Zero console errors, zero unhandled promise rejections, and verified Render static preview deployment.

---

## 2. Test Scope

### 2.1 In Scope
- **Core Engine**: Game loop (`Engine.js`), Fixed-Timestep accumulator ($60\text{ Hz}$), Canvas 2D rasterizer (`CanvasRenderer.js`), input mapping (`InputController.js`), sound synthesizer (`SoundSystem.js`), versioned persistence (`StorageManager.js`).
- **Game Modules (All 23 Original Games)**:
  - `BrickStacker`, `TurboHighway`, `IronTanks`, `CyberViper`, `FallingPoly`, `CosmoDefender`, `BounceDuel`, `TileMemory`, `LabyrinthEscape`, `Froggero`, `MoleHammer`, `ChromaPulse`, `GridTactics`, `FourInLine`, `MineScanner`, `Matrix2048`, `AeroGlider`, `BrickBreaker`, `PinballBounce`, `SprintEscape`, `OrbPop`, `SolitaireLite`, `ReflexRush`.
- **Multiplayer System**: Local simultaneous 2-Player (Split-Keyboard) and Local Turn-Based alternating play across all supported games.
- **UI & Modal System**: Boot screen, Game Selector carousel, In-Game HUD, Pause menu, Game-Over dialog, High-Score leaderboard, Settings dialog, and Help drawers.
- **Physical & Virtual Input**: Physical keyboard, virtual on-screen D-Pad and action buttons, mouse clicks, and HTML5 Gamepad API polling.
- **Production Build & Packaging**: Vite static bundling, asset hashing, directory integrity (`dist/`), and Render static site configuration (`render.yaml`).

### 2.2 Out of Scope
- Online/Cloud WebSocket servers and remote matchmaking (The architecture is strictly static client-side with zero backend/database dependencies, ensuring $0 hosting costs).
- Proprietary or commercial ROM emulation (The software strictly features 100% original IP, original procedural audio, and original rules).

---

## 3. Test Environments & Device/Browser Matrix

| Environment ID | Device / OS | Resolution / Viewport | Browser & Engine | Input Modality |
| :--- | :--- | :--- | :--- | :--- |
| **ENV-DESK-01** | Windows 11 Desktop | $1920 \times 1080$, $2560 \times 1440$ | Microsoft Edge / Chromium 120+ | Keyboard, Mouse, Gamepad |
| **ENV-DESK-02** | macOS Sonoma | $1728 \times 1117$ (Retina) | Safari 17+ (WebKit) | Keyboard, Trackpad |
| **ENV-DESK-03** | Ubuntu Linux 22.04 | $1920 \times 1080$ | Mozilla Firefox 120+ (Gecko) | Keyboard, Mouse |
| **ENV-MOB-01** | iPhone 14 / 15 Pro | $393 \times 852$ (Mobile Portrait) | Mobile Safari / iOS 17 | On-Screen Touch D-Pad |
| **ENV-MOB-02** | Samsung Galaxy S23 | $360 \times 780$ (Mobile Portrait) | Chrome Mobile / Android 14 | On-Screen Touch D-Pad |
| **ENV-TAB-01** | iPad Air / Pro | $820 \times 1180$ (Tablet Portrait) | Safari / iPadOS 17 | Touch & Bluetooth Keyboard |
| **ENV-HEAD-01** | CI / Virtual Linux | Headless $1280 \times 720$ | Chromium (Playwright / Vitest) | Simulated Events |

---

## 4. Manual Test Cases & Execution Scripts

### TC-BOOT-01: Console Cold Boot & Menu Navigation
- **Precondition**: Fresh browser session; `localStorage` empty.
- **Steps**:
  1. Open index URL.
  2. Verify boot screen displays authentic retro handheld layout and LCD lens reflection.
  3. Press `Enter` or click on-screen `START`.
  4. Verify Game Selection menu opens showing 23 titles with title, category, and preview graphics.
  5. Cycle through titles using `ArrowLeft`/`ArrowRight` and on-screen D-Pad.
- **Expected Outcome**: Instantaneous response, zero console warnings, active selection highlighted, HUD displays game title and high score.

### TC-SP-01: Single-Player Full Lifecycle (Across all 23 Games)
- **Precondition**: Console running; game selected.
- **Steps**:
  1. Launch game via `Space` / `Enter` / virtual `START`.
  2. Play for $\ge 30$ seconds; verify directional controls and action buttons work without lag.
  3. Press `P` or virtual `PAUSE`; verify game loop freezes and Pause modal displays.
  4. Press `P` again; verify seamless resumption without delta-time jump.
  5. Trigger lose or win condition; verify Game Over dialog appears with final score.
  6. Select `RESTART`; verify game resets to initial frame with score reset to 0.
- **Expected Outcome**: No lingering timers, memory stabilizes, sound effects match action.

### TC-DUO-01: Local Simultaneous 2-Player (BounceDuel)
- **Precondition**: Duo Mode enabled (`isDuo = true`).
- **Steps**:
  1. Launch **BounceDuel**.
  2. Press Player 1 controls (`A` / `D`) to move bottom paddle.
  3. Press Player 2 controls (`ArrowLeft` / `ArrowRight`) to move top paddle.
  4. Verify AI paddle tracking is deactivated; top paddle responds strictly to Player 2.
  5. Rally ball back and forth; verify collision detection at both paddles.
  6. Allow ball to pass Player 1; verify Player 2 score increments on HUD.
  7. Allow ball to pass Player 2; verify Player 1 score increments on HUD.
  8. First player to reach 5 points triggers victory banner naming the winner.
- **Expected Outcome**: Independent non-blocking simultaneous inputs, accurate attribution of points, fair match termination.

### TC-DUO-02: Turn-Based 2-Player (GridTactics & FourInLine)
- **Precondition**: Duo Mode enabled.
- **Steps**:
  1. Launch **GridTactics** or **FourInLine**.
  2. Verify HUD or board displays "P1 TURN".
  3. Attempt to make a move with Player 2 controls (`Enter`); verify input is ignored.
  4. Make a move with Player 1 (`Space`); verify token placed and turn indicator flips to "P2 TURN".
  5. Attempt to make a move with Player 1; verify input is ignored.
  6. Execute moves until 3-in-a-row or 4-in-a-row is achieved.
- **Expected Outcome**: Strict turn enforcement; no turn-stealing; win detected immediately upon line completion.

### TC-A11Y-01: Keyboard-Only Navigation & Reduced Motion
- **Precondition**: Mouse disconnected / untouched.
- **Steps**:
  1. Press `Tab` through console interface.
  2. Verify all interactive controls receive high-contrast visible focus outlines (`outline: 2px solid`).
  3. Activate modals using `Space` / `Enter` and close using `Escape`.
  4. Verify focus is trapped within open modals and restored to previous element on close.
  5. Enable `prefers-reduced-motion: reduce` in OS/DevTools; verify CRT flicker and screen shake are disabled.
- **Expected Outcome**: 100% accessible via keyboard, zero focus traps when modals closed.

---

## 5. Automated Test Coverage Matrix

The automated testing architecture consists of two complementary layers:

### Layer 1: Vitest Unit & Integration Suites (`tests/unit/` & `tests/games/`)
- Run in `happy-dom` virtual browser DOM with mocked Web Audio and timers.
- Validates internal data models, arithmetic edge cases, contracts, and regression boundaries in milliseconds.
- Minimum coverage target: $\ge 90\%$ line coverage across `src/js/core/` and `src/js/games/`.

### Layer 2: Playwright End-to-End Suites (`tests/e2e/`)
- Launches real browser instances (Microsoft Edge / Chromium).
- Executes real user flows: boot, menu selection, keyboard split-multiplayer, responsive viewport resizing, localStorage sabotage, and audio unlocks.

---

## 6. Security, Resilience & Data Integrity Test Plan

| Test ID | Risk Scenario | Test Action | Expected Defensive Behavior |
| :--- | :--- | :--- | :--- |
| **SEC-01** | Malformed JSON in localStorage | Invalidate `RETRO_BRICK_V1_SCORES` with `{ invalid, json: [ ` | StorageManager catches JSON parse exception, logs warning, initializes in-memory default store without app crash. |
| **SEC-02** | Out-of-bounds High Score tampering | Inject score `{"game-01": 9999999999}` or `{"game-01": "DROP TABLE"}` | StorageManager validates `typeof score === 'number'` and bounds score to valid range $0 \le s \le 999,999$. |
| **SEC-03** | Private/Incognito localStorage Quota Denial | Mock `localStorage.setItem` to throw `QuotaExceededError` | Graceful fallback to memory storage; user gameplay uninterrupted. |
| **SEC-04** | Global Scope Pollution | Check `window` object for leaked game instances or variables | No game logic or sensitive internals attached to `window`; strictly encapsulated ES modules. |

---

## 7. Performance & Stability Benchmarks

- **Frame Rate**: Continuous $60\text{ FPS} \pm 2\text{ FPS}$ sustained over 10 minutes of active gameplay.
- **Memory Growth**: Heap allocation delta $< 15\text{ MB}$ over 10 consecutive game switches (verifying `destroy()` properly unbinds listeners and nullifies matrix buffers).
- **Audio Thread Latency**: Audio synthesis dispatch time $< 5\text{ ms}$; zero clipping or dropped oscillator nodes.
- **Cold Load Time**: DOMContentLoaded $< 250\text{ ms}$; First Contentful Paint $< 400\text{ ms}$ on 3G network simulation.

---

## 8. Release Go/No-Go Criteria

### 🟢 GO Conditions (All Must Be Met)
- 100% of Vitest unit and integration tests pass ($130+$ test cases).
- 100% of Playwright E2E browser tests pass.
- Production build `npm run build` succeeds with zero errors.
- Render static deployment preview active and verified on desktop and mobile.
- Zero Critical, High, or Medium severity bugs outstanding.
- 23 mini-games verified playable in single-player; 4 games verified in Duo mode.

### 🔴 NO-GO Conditions (Any Single Failure Blocks Release)
- Any unhandled JavaScript exception thrown in normal game loop.
- Input locking or failure to resume from pause state.
- Player 1 inputs leaking into Player 2 controls in Duo mode.
- Render static site failing to serve `index.html` or static assets.
