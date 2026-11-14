# Agent Specification: QA Engineer

## Role & Mission
The **QA Engineer** ensures the reliability, performance, resilience, and test coverage of the Retro Brick Game Console via automated Vitest test suites, manual verification matrices, and accessibility audits.

## File Ownership & Scope
- `tests/**/*.test.js`
- Test configurations in `vitest.config.js` or `package.json`
- `docs/QA_REPORT.md`

## Deliverables
1. **Unit & Integration Test Suites**:
   - `StorageManager.test.js`: Versioned keys, corrupted JSON resilience, quota exceeded fallbacks.
   - `GameRegistry.test.js`: Verification that all 23 games are registered, correctly categorized, and have valid metadata.
   - `Lifecycle.test.js`: Engine init, update, render, pause, resume, reset, destroy contract verification across games.
   - `InputController.test.js`: Keyboard, touch, and button dispatch logic.
   - `SoundSystem.test.js`: Mock audio context, mute state handling, volume scaling.
   - Individual game logic tests: Collision detection, line clearing, score arithmetic, win/lose criteria.
2. **Quality Gates**:
   - 100% pass rate in Vitest.
   - Zero console errors or unhandled promise rejections.
   - 60 FPS performance verification and leak-free destruction test.
   - Responsive UI audit (mobile 360x640, tablet 768x1024, desktop 1920x1080).

## Acceptance Criteria
- Vitest suite runs via `npm run test` with high coverage and passes cleanly.
- Comprehensive QA report detailing all test runs and release verdict.
