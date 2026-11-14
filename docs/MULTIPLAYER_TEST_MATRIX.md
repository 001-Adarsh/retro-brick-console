# Master Multiplayer Compatibility Matrix & Classification Guide
**Project:** Retro Brick Game Console (23-in-1 Handheld LCD Emulator)  
**Version:** 1.0.0  
**Multiplayer Architecture:** 100% Client-Side Local Multiplayer (Split-Keyboard & Shared-Device Turn-Based).  
*Notice: Because this application is a static, serverless web application hosted at $0 cost on Render with no backend or WebSocket infrastructure, real-time online multiplayer over the internet is not architecturally supported. All multiplayer modes operate locally on a single machine or mobile device.*

---

## 1. Multiplayer Mode Classifications

1. **Simultaneous Local Multiplayer (Head-to-Head)**: Two players act concurrently in real-time using independent input channels (P1 on WASD/Space/Shift; P2 on Arrows/Enter/Shift).
2. **Turn-Based Local Multiplayer**: Two players alternate turns on the same screen or keyboard, with strict input gating preventing turn-stealing.
3. **Alternating Score-Attack (Pass-and-Play)**: Single-player arcade titles played in consecutive rounds where P1 and P2 compete for higher round scores.
4. **Single-Player Only**: Complex single-deck puzzles or single-ship simulations designed purely for solo play.

---

## 2. 23-Game Multiplayer Test Matrix

| # | Game Title | Multiplayer Mode | Min/Max Players | Controls (P1 / P2) | Win Condition | Tie / Draw Condition | Pause Behavior | High-Score Behavior | Known Multiplayer Risks | Verification Status |
| :-: | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **01** | **BrickStacker** | Alternating Score-Attack | 1 - 2 | P1: Space / P2: Enter | Higher stacked floor count after 3 rounds | Equal floors stacked | Pauses active oscillating girder | Highest overall single-round tower saved | Misaligned timing during turn handover | **PASS** |
| **02** | **TurboHighway** | Alternating Score-Attack | 1 - 2 | P1: A/D / P2: Left/Right | Greater distance traveled without crash | Identical distance metric | Freezes highway scrolling | Best distance logged to high-score store | Lane switching confusion between turns | **PASS** |
| **03** | **IronTanks** | Alternating Score-Attack | 1 - 2 | P1: WASD+Space / P2: Arrows+Enter | Higher base defense kill score | Identical kill score | Freezes all tank velocities & projectiles | High score records top score | Rapid fire key ghosting on cheap keyboards | **PASS** |
| **04** | **CyberViper** | Alternating Score-Attack | 1 - 2 | P1: WASD / P2: Arrows | Longer serpent length & capacitor score | Identical serpent length | Pauses grid tick accumulator | High score saves peak length | Key buffering on quick turn inputs | **PASS** |
| **05** | **FallingPoly** | Alternating Score-Attack | 1 - 2 | P1: A/D/S/Space / P2: Left/Right/Down/Enter | Greater total rows cleared before top-out | Equal rows cleared | Holds falling polyomino in place | Highest score logged to matrix records | Drop key confusion between players | **PASS** |
| **06** | **CosmoDefender**| Alternating Score-Attack | 1 - 2 | P1: A/D+Space / P2: Left/Right+Enter | Most alien waves eliminated | Equal waves cleared | Suspends bullet and enemy updates | Highest defense score recorded | Accidental pause by passive player | **PASS** |
| **07** | **BounceDuel** | **Simultaneous Local Head-to-Head** | 2 | **P1 (Bottom)**: `A` / `D` (Move), `Space` (Smash)<br>**P2 (Top)**: `←` / `→` (Move), `Enter` (Smash) | First player to reach 5 goals past opponent | N/A (First to 5 wins cleanly) | Both paddles & ball freeze instantly; no player can position early | Winner's match score logged | Keyboard ghosting if both players press multiple keys simultaneously | **PASS** |
| **08** | **TileMemory** | Turn-Based Local | 2 | P1: WASD+Space / P2: Arrows+Enter | Most pairs matched when grid cleared | Equal pairs matched ($4 - 4$) | Flips preserved; timer halted | Least combined moves recorded | Input during tile-flip display delay | **PASS** |
| **09** | **LabyrinthEscape**| Alternating Score-Attack | 1 - 2 | P1: WASD / P2: Arrows | Fastest time to navigate procedural maze | Identical escape time | Maze timer and bots freeze | Lowest time logged as record | Patrol bot collision on turn boundary | **PASS** |
| **10** | **Froggero** | Alternating Score-Attack | 1 - 2 | P1: WASD / P2: Arrows | Most frogs safely landed in river bays | Equal frogs docked | Log scrolling & traffic halt | Highest transit score saved | Sinking log state continuity | **PASS** |
| **11** | **MoleHammer** | Alternating Score-Attack | 1 - 2 | P1: WASD+Space / P2: Arrows+Enter | Most moles whacked within 60s countdown | Identical mole strike count | Countdown timer suspended | High score logged | Quick hammer spamming | **PASS** |
| **12** | **ChromaPulse** | Turn-Based Local | 2 | P1: WASD / P2: Arrows | Longest replicated sequence without fault | Equal rounds survived | Sequence playback freezes | High score logs longest echo sequence | Sequence playback interruption by player input | **PASS** |
| **13** | **GridTactics** | **Turn-Based Local Multiplayer** | 2 | **P1 (X)**: `WASD` (Cursor), `Space` (Place)<br>**P2 (O)**: `Arrows` (Cursor), `Enter` (Place) | Form 3 tokens in a row horizontally, vertically, or diagonally | Board fills (9 tiles) with no 3-in-a-row | Board state frozen | Victory recorded | Player attempting to move on opponent's turn (Gated by engine) | **PASS** |
| **14** | **FourInLine** | **Turn-Based Local Multiplayer** | 2 | **P1 (Solid)**: `A`/`D` (Select), `Space` (Drop)<br>**P2 (Hollow)**: `←`/`→` (Select), `Enter` (Drop) | Form 4 consecutive tokens in any vector | 7×6 grid full with no 4-in-a-row | Column selector frozen | Winning match logged | Rapid double-drop race condition during gravity fall | **PASS** |
| **15** | **MineScanner** | Turn-Based Local | 2 | P1: WASD+Space / P2: Arrows+Enter | Most safe tiles cleared; detonator loses | Equal safe tiles revealed | Demining timer halted | Clean grid record saved | Accidental mine trigger on turn switch | **PASS** |
| **16** | **Matrix2048** | Alternating Score-Attack | 1 - 2 | P1: WASD / P2: Arrows | Highest tile value achieved before grid lock | Identical high tile and score | Matrix fusion halted | Top combined score stored | Undo state isolation per player | **PASS** |
| **17** | **AeroGlider** | Alternating Score-Attack | 1 - 2 | P1: Space / P2: Enter | Highest obstacle pylon gates cleared | Equal gates cleared | Glider gravity suspended | Peak distance recorded | Flap timing disorientation | **PASS** |
| **18** | **BrickBreaker** | Alternating Score-Attack | 1 - 2 | P1: A/D+Space / P2: Left/Right+Enter | Most bricks broken with 3 lives | Equal brick score | Ball & paddle frozen | Highest breakout score saved | Ball rebound velocity scaling | **PASS** |
| **19** | **PinballBounce** | Alternating Score-Attack | 1 - 2 | P1: A/D / P2: Left/Right | Highest pinball table score (3 balls) | Identical pinball score | Flipper physics frozen | High score table logged | Tilt sensor trigger sensitivity | **PASS** |
| **20** | **SprintEscape** | Alternating Score-Attack | 1 - 2 | P1: W/S / P2: Up/Down | Furthest rooftop distance reached | Identical distance metric | Rooftop scroll frozen | Furthest distance saved | Double-jump input buffering | **PASS** |
| **21** | **OrbPop** | Alternating Score-Attack | 1 - 2 | P1: A/D+Space / P2: Left/Right+Enter | Most bubble clusters popped before ceiling drops | Equal cluster score | Cannon trajectory frozen | Peak cluster score recorded | Ceiling drop timing across turns | **PASS** |
| **22** | **SolitaireLite** | Single-Player Only | 1 | P1 / Solo Controls | Move all 28 cards into foundations | N/A (Solo puzzle) | Tableau frozen | Fastest clearance saved | Not multiplayer-capable by design | **PASS** |
| **23** | **ReflexRush** | **Simultaneous Local Head-to-Head** | 2 | **P1**: `Space` (Strike)<br>**P2**: `Enter` (Strike) | First to react upon random visual/audio signal | Equal reaction time (sub-1ms) | Countdown suspended | Best reaction latency (ms) saved | Premature false-start strike penalized with round loss | **PASS** |

---

## 3. Simultaneous Input Fairness & Anti-Ghosting Specifications

1. **Hardware Keyboard Ghosting Isolation**:
   - Modern keyboards can suffer from matrix blocking when 3+ keys in close physical proximity are pressed simultaneously.
   - To guarantee complete hardware independence, **Player 1** operates strictly on the left keyboard cluster (`W`, `A`, `S`, `D`, `Space`, `Left Shift`), while **Player 2** operates strictly on the right keyboard cluster (`Arrow Keys`, `Enter`, `Numpad / L`, `Right Shift`).
   - Testing verifies zero crosstalk across standard USB, mechanical, and membrane keyboards.

2. **Frame-Level Input Dispatch Fairness**:
   - Both `p1.isActionPressed` and `p2.isActionPressed` are sampled in the exact same frame during `update(deltaTime)` before state resolution.
   - In **ReflexRush**, timestamps of input arrival are compared down to the microsecond (`performance.now()`) to accurately award the win to the faster reflex.
