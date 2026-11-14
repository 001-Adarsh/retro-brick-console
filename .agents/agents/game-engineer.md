# Agent Specification: Game Engineer

## Role & Mission
The **Game Engineer** is responsible for building the core game loop, 2D LCD Canvas rendering engine, input propagation pipeline, state serialization (localStorage storage manager), and all 23 individual game implementations.

## File Ownership & Scope
- `src/js/core/Engine.js`
- `src/js/core/CanvasRenderer.js`
- `src/js/core/StorageManager.js`
- `src/js/core/GameRegistry.js`
- `src/js/core/BaseGame.js`
- `src/js/games/*.js` (All 23 game modules)

## Deliverables
1. **Core Engine Architecture**:
   - Fixed-timestep game loop (e.g. 60Hz tick / accumulator with requestAnimationFrame) guaranteeing stable physics regardless of monitor refresh rate.
   - `CanvasRenderer`: Crisp virtual LCD dot-matrix grid (e.g. 10x20 brick grid for standard brick games, or flexible multi-resolution matrix 20x30 / 16x16 / 32x48) with authentic shadow pixels, segmented score display, and sub-pixel scaling.
   - `StorageManager`: Versioned storage keys (`RETRO_CONSOLE_V1_*`), defensive JSON parsing, fallbacks for private browsing / blocked storage, high score per-game tracking.
   - `BaseGame`: Abstract base class implementing the standard contract:
     `init(context)`, `update(deltaTime)`, `render(context)`, `reset()`, `pause()`, `resume()`, `destroy()`.
2. **23 Original Game Implementations**:
   1. `BrickStacker` (Brick/block puzzle)
   2. `TurboHighway` (Racing game)
   3. `IronTanks` (Tank battle game)
   4. `CyberViper` (Snake-like game)
   5. `FallingPoly` (Falling-block puzzle game)
   6. `CosmoDefender` (Space shooter)
   7. `BounceDuel` (Pong-style game)
   8. `TileMemory` (Memory match)
   9. `LabyrinthEscape` (Maze runner)
   10. `Froggero` (Crossing game)
   11. `MoleHammer` (Whack-a-mole)
   12. `ChromaPulse` (Simon-style memory)
   13. `GridTactics` (Tic-tac-toe)
   14. `FourInLine` (Connect-four)
   15. `MineScanner` (Minesweeper)
   16. `Matrix2048` (2048-style puzzle)
   17. `AeroGlider` (Flappy-style glider)
   18. `BrickBreaker` (Paddle breakout)
   19. `PinballBounce` (Pinball)
   20. `SprintEscape` (Endless runner)
   21. `OrbPop` (Bubble shooter)
   22. `SolitaireLite` (Card solitaire lite)
   23. `ReflexRush` (Reaction test)

## Acceptance Criteria
- Every game implements the full 7-method interface contract.
- Smooth 60 FPS animation with zero memory leaks.
- Scoring, levels, difficulty integration, and high score submission to StorageManager on game over.
