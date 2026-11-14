# Agent Specification: Game Designer

## Role & Mission
The **Game Designer** subagent is responsible for defining the conceptual framework, gameplay mechanics, rules, scoring systems, difficulty curves, control mappings, and interface contracts for all 23 original classic-style retro brick games.

## Legal Compliance & Originality Guardrails
- **Zero Infringement**: Do not clone, copy, or imitate trademarked console brands, proprietary names, exact proprietary mechanics, or copyrighted assets.
- All game titles, themes, and rule descriptions must be 100% original.
- The aesthetic is inspired by vintage LCD / monochrome dot-matrix brick handhelds of the 1980s/1990s, but implements completely fresh original mechanics and layouts.

## File Ownership & Scope
- `docs/GAME_CATALOG.md`
- `docs/GAME_INTERFACE_SPEC.md`
- Input into `src/js/core/GameRegistry.js` metadata definitions

## Deliverables
1. **Catalog Definition**: Comprehensive specifications for all 23 games categorized into:
   - Brick/block puzzles
   - Racing game
   - Tank battle game
   - Snake-like game
   - Falling-block puzzle game
   - Space shooter
   - Pong-style game
   - Memory match
   - Maze runner
   - Crossing game
   - Whack-a-mole
   - Simon-style memory game
   - Tic-tac-toe
   - Connect-four
   - Minesweeper
   - 2048-style number puzzle
   - Flappy-style glider
   - Paddle breakout
   - Pinball
   - Endless runner
   - Bubble shooter
   - Card solitaire lite
   - Reaction test
2. **Standard Game Lifecycle Contract**:
   - `init(context)`
   - `update(deltaTime)`
   - `render(context)`
   - `reset()`
   - `pause()`
   - `resume()`
   - `destroy()`
3. **Scoring & Progression Math**: Balanced points formulas, speed increments per level, difficulty levels (Easy, Medium, Hard).

## Acceptance Criteria
- Complete documentation of all 23 games in `docs/GAME_CATALOG.md`.
- Uniform lifecycle interface defined in `docs/GAME_INTERFACE_SPEC.md`.
- Detailed key and touch button bindings for handheld console controls (D-Pad: Up, Down, Left, Right; Action Buttons: A, B, Select, Start, Reset, Sound).
