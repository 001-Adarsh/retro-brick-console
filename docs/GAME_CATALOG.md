# Retro Brick Game Console - Master Game Catalog
**Version:** 1.0.0  
**Legal Notice:** 100% Original Intellectual Property. No trademark infringements, cloned assets, or proprietary code. Designed for the 10×20 Virtual LCD Dot-Matrix Engine.

---

## Catalog Index & Overview Matrix

| # | Game ID | Title | Category | Primary Grid | Key Feature |
|---|---|---|---|---|---|
| 01 | `brick-stacker` | **BrickStacker** | Precision Stacker Puzzle | 10 × 20 | Overhang shearing mechanics & wind shear |
| 02 | `turbo-highway` | **TurboHighway** | Top-Down Retro Racer | 10 × 20 | 3-lane speedway, draft boost & EMP horn |
| 03 | `iron-tanks` | **IronTanks** | Tactical Grid Tank Combat | 10 × 20 | Destructible terrain, 3 enemy classes & base defense |
| 04 | `cyber-viper` | **CyberViper** | Grid Serpent Evolution | 10 × 20 | Capacitor scavenging, turbo sprint & glitch hazards |
| 05 | `falling-poly` | **FallingPoly** | Rotational Polyomino Matrix | 10 × 20 | Extended polyomino set, cascade clears & hold slot |
| 06 | `cosmo-defender` | **CosmoDefender** | Vertical Space Combat Shooter | 10 × 20 | Swarm formations, dive bombers & dual-plasma cannons |
| 07 | `bounce-duel` | **BounceDuel** | Kinetic Paddle Deflector | 10 × 20 | English curve slice, smash shots & midfield barriers |
| 08 | `tile-memory` | **TileMemory** | Cryptographic Matrix Match | 10 × 20 | Glyph decoders, countdown pressure & peek sonar |
| 09 | `labyrinth-escape` | **LabyrinthEscape** | Procedural Maze Infiltration | 10 × 20 | Keycard extraction, roving patrol bots & fog of war |
| 10 | `froggero` | **Froggero** | Transit Hazard Crosser | 10 × 20 | Multi-lane speedway, sinking magnetic logs & docks |
| 11 | `mole-hammer` | **MoleHammer** | High-Reflex Conduit Strike | 10 × 20 | Mallet reticle targeting, gold bots & hazard coils |
| 12 | `chroma-pulse` | **ChromaPulse** | Sequential Quadrant Resonance | 10 × 20 | 4-quadrant audio-visual memory & reverse echo rounds |
| 13 | `grid-tactics` | **GridTactics** | Spatial Alignment Strategy | 10 × 20 | 3×3 & 4×4 dynamic vector arenas with minimax AI |
| 14 | `four-in-line` | **FourInLine** | Gravity Column Resonance | 10 × 20 | 7×6 vertical chute gravity drops with alpha-beta AI |
| 15 | `mine-scanner` | **MineScanner** | Seismic Grid Demining | 10 × 20 | Flagging logic, numeric adjacency & recursive flood |
| 16 | `matrix-2048` | **Matrix2048** | Isotopic Fusion Sliding Puzzle | 10 × 20 | 4-way tile fusion, isotope synthesis & strategic undo |
| 17 | `aero-glider` | **AeroGlider** | Precision Altitude Flap | 10 × 20 | High-voltage storm pylons, air brake & altitude trim |
| 18 | `brick-breaker` | **BrickBreaker** | Orbital Kinetic Demolition | 10 × 20 | Multi-hit cosmic bricks, power capsules & laser paddle |
| 19 | `pinball-bounce` | **PinballBounce** | Graviton Kinetic Arcade Table | 10 × 20 | Independent flippers, pop bumpers, ramps & tilt sensor |
| 20 | `sprint-escape` | **SprintEscape** | Dystopian Rooftop Parkour | 10 × 20 | Gap jumping, double-leaps, low slides & speed boost |
| 21 | `orb-pop` | **OrbPop** | Molecular Cluster Cannon | 10 × 20 | Trajectory aiming, matching trios & avalanche drops |
| 22 | `solitaire-lite` | **SolitaireLite** | Cyber-Deck Sorting Protocol | 10 × 20 | 4-column polarity sorting, draw deck & foundations |
| 23 | `reflex-rush` | **ReflexRush** | Neural Synapse Reflex Evaluator | 10 × 20 | Split-second micro-challenges, fake-outs & rush streaks |

---

## 1. BrickStacker

```
[ ][ ][#][#][#][ ][ ][ ][ ][ ] <- Moving Girder (Oscillates Left-Right)
[ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]
[ ][ ][#][#][#][ ][ ][ ][ ][ ] <- Level 3 Base
[ ][ ][#][#][#][ ][ ][ ][ ][ ] <- Level 2 Base
[ ][ ][#][#][#][#][ ][ ][ ][ ] <- Level 1 Foundation
```

- **Game ID:** `brick-stacker`
- **Category:** Precision Stacker Puzzle
- **Lore & Theme:** High-Rise Architect. In a retro cyberpunk metropolis, robotic cranes hoist high-tensile carbon girders up a burgeoning skyscraper. One misplaced girder risks structural collapse!
- **Playfield & Visual Representation:**
  - Standard 10×20 grid.
  - Placed tower floors rest permanently in rows `19` up toward `0`.
  - The active girder starts at width 3 (or 4 depending on difficulty) and oscillates horizontally across row `y` above the current stack top.
  - Active girder pixels are solid (`1`); sheared pieces flash (`2`) then drop out of view.
- **Rules & Mechanics:**
  - A girder sweeps back and forth horizontally across the row immediately above the existing tower stack.
  - Pressing **Button A** drops and locks the girder onto the tower.
  - Any girder segment that does not align with the foundation layer underneath is sheared off and discarded.
  - The next girder spawns with the newly reduced width.
  - If a player places a girder with zero overlap, the stack topples, losing 1 life.
  - Reaching the top row (`y = 0`) completes the skyscraper stage, triggering a floor bonus and advancing to the next construction zone at higher oscillation speeds.
  - At level 4 and higher, "Wind Shear" applies subtle, sudden directional acceleration shifts to the girder.
- **Handheld Controls:**
  - **Button A / Space / KeyJ:** Lock Girder / Drop.
  - **D-Pad Down / ArrowDown / KeyS:** Quick drop (instant lock without delay).
  - **Button B / KeyK / Shift:** Precision Brake (slows oscillation by 40% for 1 second; 1 charge per 3 floors).
- **Scoring Formulas:**
  - Standard Placed Brick: $\text{Points} = 10 \times \text{Current Floor} \times \text{Difficulty Multiplier}$.
  - Perfect Alignment Bonus: $+50$ points. If 3 consecutive perfect drops occur, $+1$ lost brick width is restored!
  - Skyscraper Stage Clear (Row 0): $+1000$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** Girder width 4; sweep speed 4.0 Hz; no wind shear; 4 lives.
  - **Medium:** Girder width 3; sweep speed 6.0 Hz; wind shear kicks in at Floor 10; 3 lives.
  - **Hard:** Girder width 3; sweep speed 8.5 Hz; wind shear from Floor 4; girder trims to width 2 after Floor 10; 2 lives.
- **Win / Lose Conditions:**
  - **Win:** Clear Stage 5 (5 completed 20-story towers).
  - **Lose:** Tower width reduced to 0 or girder completely misses foundation with 0 remaining lives.
- **High Score Criteria:** Floors erected + Perfect placement streak count + remaining Precision Brake charges.

---

## 2. TurboHighway

```
| .  [#]   .  |  Row 3: Traffic Car (Lane 2)
| .   #    .  |  
| .       [#] |  Row 8: Fast Roadster (Lane 3)
| .        #  |  
|    [#]      |  Row 18: Player Car (Lane 1)
|     #       |  
```

- **Game ID:** `turbo-highway`
- **Category:** Top-Down Retro Highway Racer
- **Lore & Theme:** Midnight Neon Circuit. You pilot the experimental "Photon Interceptor" down an infinite digital superhighway, weaving through congested automated freight haulers and reckless street drones.
- **Playfield & Visual Representation:**
  - 10×20 grid. Outer columns (`x = 0` and `x = 9`) display dashed guardrails scrolling downward to indicate velocity.
  - Three lanes: Left (`x = 1..3`), Center (`x = 4..6`), Right (`x = 7..9`).
  - Player car is a 2×3 brick glyph positioned around `y = 16..18`.
  - Opponent cars are 2×3 or 2×2 brick glyphs descending at varying velocities.
- **Rules & Mechanics:**
  - Continuous vertical downward scroll. Player steers between lanes to avoid crashing into rear-end traffic.
  - Pressing **D-Pad Up** accelerates into Nitro Boost (3× scroll speed, triple point accumulation).
  - Pressing **D-Pad Down** engages regenerative brakes, reducing speed to navigate dense clusters.
  - **Button A** triggers the EMP Horn: sends an acoustic pulse directly forward, forcing the car in your current lane to violently accelerate forward 6 rows, clearing your lane (5s cooldown).
  - Shaving within 1 pixel of an enemy car without colliding scores a "Close-Shave Slipstream Bonus".
- **Handheld Controls:**
  - **D-Pad Left / Right:** Quick lane switch.
  - **D-Pad Up:** Throttle / Nitro Boost.
  - **D-Pad Down:** Regenerative Brakes.
  - **Button A:** EMP Horn (Lane Clearing Pulse).
  - **Button B:** High-Beam Flash (temporarily illuminates upcoming roadblocks 15 rows ahead).
- **Scoring Formulas:**
  - Distance Traveled: $1\text{ pt per meter}$ (base speed); $3\text{ pts per meter}$ (boost speed).
  - Close-Shave Overtake: $+25$ points.
  - EMP Clearance: $+15$ points.
  - Checkpoint Clear (every 1000m): $+500 \times \text{Difficulty Multiplier}$.
- **Difficulty Levels & Progression:**
  - **Easy:** Sparse traffic (maximum 1 car on screen at a time); constant road width; 4 lives.
  - **Medium:** Moderate traffic; speed increases by 8% every 500m; rival cars occasionally execute lane shifts; 3 lives.
  - **Hard:** Dense traffic; narrow 2-lane bridge bottlenecks appear every 750m; dynamic oil slicks cause momentary steering inversions; 2 lives.
- **Win / Lose Conditions:**
  - **Win:** Cross the 10,000-meter Grand Prix finish line.
  - **Lose:** Deplete all lives via high-speed collisions.
- **High Score Criteria:** Total distance traversed + Close-shave streak + High-speed boost percentage.

---

## 3. IronTanks

```
[#][#]          [#][#]  <- Enemy Spawn Ports
      [#][#]            <- Destructible Brick Walls
[=][=]                  <- Indestructible Steel Barrier
      [ A ]             <- Enemy Tank (Facing Down)
      
      [ ^ ]             <- Player Tank (Facing Up)
      [CORE]            <- Power Core (Protect!)
```

- **Game ID:** `iron-tanks`
- **Category:** Tactical Grid Tank Combat
- **Lore & Theme:** Citadel Defense Grid. Commandeer the heavy bastion tank "Iron Vanguard" defending the subterranean core at the bottom of an urban bunker grid against waves of autonomous rogue drone tanks.
- **Playfield & Visual Representation:**
  - 10×20 arena. Bottom row center `(x = 4..5, y = 19)` houses the Power Core.
  - Walls: Single solid pixels (`1`) for destructible bricks; double-thick solid blocks for steel barriers.
  - Tanks: 2×2 pixel blocks with a 1-pixel directional turret barrel.
  - Bullets: 1×1 pixel moving at high velocity.
- **Rules & Mechanics:**
  - Player moves in 4 cardinal directions and fires shells along their turret heading.
  - Destructible bricks disintegrate when struck by cannon shells. Steel barriers ricochet standard shells.
  - Rogue drone tanks spawn at the top ports (`y = 0`) and navigate toward the Power Core.
  - Enemy classes:
    1. *Scout Drone:* Fast, moves 1 cell per 0.2s, 1 hit to destroy, light cannon.
    2. *Cruiser Drone:* Medium speed, 2 hits to destroy, rapid fire.
    3. *Juggernaut:* Slow, 3 hits to destroy, heavy armor, fires explosive shells that destroy steel barriers.
  - Player can deploy a smoke/decoy block behind their tank to distract enemy pathfinding.
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Drive tank & rotate turret in direction of motion.
  - **Button A:** Fire Cannon (maximum 2 shells on-screen simultaneously).
  - **Button B:** Deploy Decoy Barrier (10s cooldown).
- **Scoring Formulas:**
  - Scout Drone Destroyed: $+50$ points.
  - Cruiser Drone Destroyed: $+100$ points.
  - Juggernaut Destroyed: $+250$ points.
  - Wave Clear Bonus: $+500 \times \text{Wave Number}$.
  - Power Core Undamaged Bonus: $+300$ points per wave.
- **Difficulty Levels & Progression:**
  - **Easy:** 3 enemy tanks per wave; slow projectile velocity; enemies do not target the Power Core directly.
  - **Medium:** 5 enemy tanks per wave; Juggernauts introduced in Wave 2; enemy tanks flank from both sides.
  - **Hard:** 8 enemy tanks per wave; enemy shells penetrate single-layer brick walls; rapid enemy respawns.
- **Win / Lose Conditions:**
  - **Win:** Eliminate all 10 assault waves.
  - **Lose:** Power Core destroyed or all player tank lives depleted.
- **High Score Criteria:** Total enemies obliterated + Accuracy ratio + Undamaged core rounds.

---

## 4. CyberViper

```
. . . . . . . . . .
. . . [#][#][#] . . <- Viper Tail & Body
. . . [#] . . . . .
. . . [O] . . . . . <- Viper Head (Heading Down)
. . . . . . [*] . . <- Data Chip (Food)
. [!] . . . . . . . <- Glitch Hazard
```

- **Game ID:** `cyber-viper`
- **Category:** Grid Serpent Evolution
- **Lore & Theme:** Circuit Board Data Hunter. A sentient nano-viper navigates the silicone substrate of an experimental quantum CPU, consuming data capacitors to expand its memory registers while evading overheating transistors.
- **Playfield & Visual Representation:**
  - 10×20 grid.
  - Viper body is rendered as contiguous solid pixels (`1`). The head blinks gently (`2`).
  - Normal Data Chips appear as static solid dots (`1`).
  - Overcharge Chips flash rapidly (`2`) and despawn after 8 seconds.
  - Glitch hazards appear as erratic 2×2 static noise blocks.
- **Rules & Mechanics:**
  - The nano-viper moves continuously forward. Player steers cardinal directions (reversing directly into oneself is forbidden).
  - Consuming a standard Data Chip extends the viper length by 1 segment and spawns a new chip.
  - Consuming an Overcharge Chip grants $+50$ points and 3 seconds of "Ghost Phase", allowing the viper to pass through its own tail or outer boundary walls without crashing.
  - Outer walls: In Easy mode, screen wraps horizontally and vertically. In Medium and Hard, perimeter walls are lethal.
  - Button A triggers a Turbo Sprint, doubling movement velocity to snatch disappearing items.
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Steer nano-viper.
  - **Button A:** Turbo Sprint (burns 1 tail segment per 5 seconds of sustained sprint).
  - **Button B:** Sonar Pulse (briefly reveals location of upcoming Overcharge chip).
- **Scoring Formulas:**
  - Standard Data Chip: $\text{Points} = 10 \times \text{Viper Length} \times \text{Level}$.
  - Overcharge Chip: $\text{Points} = 50 \times \text{Level}$.
  - Turbo Catch Bonus: $+30$ points if caught while sprinting.
  - Board Fullness Milestone: $+1000$ points upon reaching 30, 50, and 70 segments.
- **Difficulty Levels & Progression:**
  - **Easy:** Starting speed 3.5 Hz; screen wraps on all four borders; no glitch hazards.
  - **Medium:** Starting speed 6.0 Hz; perimeter walls are fatal; speed increases by 0.5 Hz every 5 chips.
  - **Hard:** Starting speed 8.5 Hz; perimeter walls fatal; wandering glitch nodes traverse the field; 1 life only.
- **Win / Lose Conditions:**
  - **Win:** Reach 100 segments (filling 50% of the entire playfield).
  - **Lose:** Collide with walls, glitch hazards, or own body without Ghost Phase active.
- **High Score Criteria:** Total length reached + Fast catch bonuses + Multiplier efficiency.

---

## 5. FallingPoly

```
. . . [#][#] . . . . <- Falling Polyomino (Tetromino / Extended Poly)
. . . . [#][#] . . .
. . . . . . . . . .
[#][#][#][#] . [#][#] <- Row 18 (Needs 1 block to clear)
[#][#][#][#][#][#][#] <- Row 19 (Solid row -> Clears!)
```

- **Game ID:** `falling-poly`
- **Category:** Rotational Polyomino Matrix
- **Lore & Theme:** Quantum Core Reactor. Stabilize fluctuating antimatter clusters inside an energy containment chamber by locking falling geometric polyominoes into uninterrupted horizontal rows.
- **Playfield & Visual Representation:**
  - Standard 10×20 primary matrix.
  - Auxiliary display (top-right HUD) shows the upcoming queued polyomino in a 4×4 preview box.
  - Locked matrix blocks remain solid (`1`). Active falling piece renders solid; ghost landing guide renders faint/flickering.
- **Rules & Mechanics:**
  - Polyominoes descend under continuous gravity. Player shifts left/right, rotates, soft drops, or instant hard drops.
  - Shape Roster: Features the classic 7 tetrominoes (I, O, T, S, Z, J, L) plus 3 unlocked "Quantum Polyominoes" at higher levels (3-tile Corner, 3-tile Bar, and 5-tile Cross).
  - Completing a horizontal row of 10 solid blocks clears the row, collapsing all blocks above downward.
  - Clearing 4 rows simultaneously triggers a **Quantum Cascade** with special screen flash and arpeggio fanfare.
  - Player can store 1 polyomino in the "Hold Slot" using **Button B / Select**, swapping with the active piece.
- **Handheld Controls:**
  - **D-Pad Left / Right:** Shift piece horizontally (supports Delayed Auto Shift).
  - **D-Pad Down:** Soft drop (2× fall speed).
  - **D-Pad Up:** Hard drop (instantaneous lock to the lowest available floor).
  - **Button A:** Rotate Clockwise (90°).
  - **Button B:** Rotate Counter-Clockwise (90°).
  - **Select:** Hold Piece / Swap with Reserve.
- **Scoring Formulas:**
  - Single Row Clear: $100 \times \text{Level}$.
  - Double Row Clear: $300 \times \text{Level}$.
  - Triple Row Clear: $500 \times \text{Level}$.
  - Quantum Cascade (4 Rows): $1000 \times \text{Level}$.
  - Hard Drop Bonus: $+2$ points per cell dropped instantly.
- **Difficulty Levels & Progression:**
  - **Easy:** Base gravity 1 drop/sec; generous 500ms lock delay; standard 7 tetromino shapes only.
  - **Medium:** Base gravity 0.6s/drop; speed increases 10% per level; 350ms lock delay; level advances every 10 lines.
  - **Hard:** Base gravity 0.3s/drop; 200ms lock delay; Quantum Polyominoes injected into bag; garbage row spawns every 20s.
- **Win / Lose Conditions:**
  - **Win:** Clear Level 15 (150 lines cleared) in Marathon Mode.
  - **Lose:** Polyominoes stack beyond the top boundary (`y = 0`).
- **High Score Criteria:** Total lines cleared + Cascade frequency + Drop velocity points.

---

## 6. CosmoDefender

```
. . [V][V]   [V][V] . . <- Alien Swarm Formation
. .   [V]     [V]   . .
. . . . . | . . . . . . <- Enemy Plasma Bolt
. . . . . v . . . . . .
. . . . . ^ . . . . . . <- Player Dual Laser
. . . . [ -A- ] . . . . <- Player Defense Cruiser (Row 18)
```

- **Game ID:** `cosmo-defender`
- **Category:** Vertical Space Combat Shooter
- **Lore & Theme:** Orbital Perimeter Shield. Deep-space outpost Alpha is targeted by incoming alien bio-cruisers, diving kamikazes, and orbital minefields. Commandeer the interceptor cruiser to hold the line!
- **Playfield & Visual Representation:**
  - 10×20 vertical matrix.
  - Player fighter is a 3×2 pixel delta-wing cruiser stationed along row `18..19`.
  - Enemy formation occupies rows `1..6`, oscillating horizontally and inching downward.
  - Laser bolts are 1×1 pixels; boss ships are 4×3 multi-brick flagships.
- **Rules & Mechanics:**
  - Enemy fleet moves in rhythmic unison left-to-right, dropping 1 row upon hitting the screen edge.
  - Enemy drones randomly detach from formation to perform dive-bombing strafes toward the player.
  - Player can maneuver left and right, and vertically between rows `16` and `19` to evade flanking fire.
  - Defeating the formation commander drops power capsules: Dual-Blasters, Shield Recharge, or Speed Boost.
  - Button B deploys an EMP Shockwave (destroys all active on-screen enemy projectiles; 2 charges per life).
- **Handheld Controls:**
  - **D-Pad Left / Right:** Lateral strafing.
  - **D-Pad Up / Down:** Evasive vertical positioning (rows 16-19).
  - **Button A:** Fire Primary Plasma Blasters (up to 3 salvos on screen).
  - **Button B:** EMP Shockwave (clears enemy bullets; 2 per life).
- **Scoring Formulas:**
  - Swarm Drone in Formation: $+20$ points.
  - Dive-Bombing Drone (Mid-Air): $+50$ points.
  - Formation Commander: $+150$ points.
  - Flagship Boss: $+1000$ points.
  - Wave Clear Shield Bonus: $+100$ points per remaining shield unit.
- **Difficulty Levels & Progression:**
  - **Easy:** Fleet moves slowly (1 shift per 0.8s); enemy bullets travel at 4 pixels/sec; 4 lives.
  - **Medium:** Fleet accelerates as drones are eliminated; dive bombers fire return fire; 3 lives.
  - **Hard:** Relentless dive bombers; sweeping alien laser beams; orbital mines drift down; 2 lives.
- **Win / Lose Conditions:**
  - **Win:** Clear all 8 sector defense sectors including the Dreadnought mothership.
  - **Lose:** Deplete all player fighter lives.
- **High Score Criteria:** Accuracy percentage + Dive-bomber intercept points + Shield preservation bonuses.

---

## 7. BounceDuel

```
. . . . [#][#][#] . . . <- AI Paddle (Row 1)
. . . . . . . . . . . .
. . . . . (o) . . . . . <- Kinetic Energy Sphere
. . . [X][X] . . . . . <- Midfield Obstacle Brick
. . . . . . . . . . . .
. . [#][#][#] . . . . . <- Player Paddle (Row 19)
```

- **Game ID:** `bounce-duel`
- **Category:** Kinetic Paddle Deflector
- **Lore & Theme:** Cyber-Court Arena. High-speed kinetic particle sports in a zero-gravity vacuum chamber. Two deflector paddles rally a supercharged energy sphere across an obstacle-laden court.
- **Playfield & Visual Representation:**
  - 10×20 grid.
  - Top paddle (AI) resides at `y = 1`. Bottom paddle (Player) resides at `y = 19`.
  - Paddle width is 3 pixels (or 4 on Easy). Ball is a 1×1 pixel bouncing within walls `x = 0..9`.
  - Midfield neutral zone contains destructible bonus bricks that yield points when struck.
- **Rules & Mechanics:**
  - The ball rallies continuously between paddles. If a paddle misses, the opposing side scores a goal.
  - Angle of Deflection: Striking the center of the paddle reflects the ball straight forward. Striking the edges reflects the ball at steep 45° and 60° deflection angles.
  - English Curve: Moving the paddle at the precise instant of impact imparts lateral spin, causing the ball trajectory to curve mid-flight!
  - Button A triggers a "Smash Strike" if timed right as the ball arrives, accelerating the rebound by 50%.
  - First player to reach 7 goals wins the match.
  - **Duo Mode (2-Player Head-to-Head)**: When Duo Mode is enabled, AI tracking is disabled! Player 1 operates the bottom paddle (`A` / `D`), and Player 2 operates the top paddle (`ArrowLeft` / `ArrowRight`) on the same keyboard or screen.
- **Handheld Controls:**
  - **D-Pad Left / Right:** Move paddle horizontally.
  - **Button A:** Smash Strike (high-velocity spike on impact).
  - **Button B:** English Curve Slice (imparts heavy spin deflection).
- **Scoring Formulas:**
  - Successful Paddle Return: $+10$ points.
  - Smash Return: $+25$ points.
  - Goal Scored past AI: $+200$ points.
  - Midfield Brick Shatter: $+50$ points.
  - Match Victory: $+1500 \times \text{Difficulty Multiplier}$.
- **Difficulty Levels & Progression:**
  - **Easy:** Paddle width 4 pixels; ball speed moderate; AI reaction latency 150ms; 4 goals to win.
  - **Medium:** Paddle width 3 pixels; ball speed accelerates with each rally; AI latency 60ms; 7 goals to win.
  - **Hard:** Paddle width 2 pixels; high starting velocity; predictive minimax AI with zero latency; 11 goals to win.
- **Win / Lose Conditions:**
  - **Win:** Reach match goal target before AI opponent.
  - **Lose:** AI opponent reaches goal target first.
- **High Score Criteria:** Rally streak length + Smash shot goal conversion + Clean shutouts.

---

## 8. TileMemory

```
+---+---+---+---+
| ? | ? | ? | ? | <- Cryptographic Vault Grid
| ? |[*] | ? | ? | <- Revealed Rune 1
| ? | ? |[*] | ? | <- Matching Rune 2 (Match!)
| ? | ? | ? | ? |
+---+---+---+---+
Time Remaining: [=====    ]
```

- **Game ID:** `tile-memory`
- **Category:** Cryptographic Matrix Match
- **Lore & Theme:** Cipher Terminal Decryption. Infiltrate an ancient monochrome cryptographic data vault by locating and pairing matching cryptographic rune symbols before the mainframe lockdown timer expires.
- **Playfield & Visual Representation:**
  - 10×20 grid. Centered 4×4 (or 4×5 on Hard) card grid.
  - Concealed tiles render as checkered borders `[ ? ]`.
  - Selected tiles reveal unique 3×3 LCD pixel glyphs (Cross, Diamond, Ring, Checker, Plus, Chevron, Bars, Hash).
  - A horizontal countdown timer bar drains across row `19`.
- **Rules & Mechanics:**
  - Player moves a flashing selector cursor across the card matrix with the D-Pad.
  - Pressing **Button A** flips the selected tile to reveal its concealed glyph.
  - Selecting a second tile compares the two:
    - If they match: Both tiles remain permanently illuminated, a chime sounds, and points are awarded.
    - If they mismatch: Both tiles remain visible for 0.8s, then flip back face down.
  - Clearing the entire board advances to the next cryptographic tier with shorter time limits and new glyph designs.
  - Button B triggers a "Peek Sonar": briefly illuminates 2 matching tiles for 0.4 seconds (costs 150 points).
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Navigate selector cursor.
  - **Button A:** Flip / Reveal tile.
  - **Button B:** Peek Sonar (Hint pulse, costs points).
- **Scoring Formulas:**
  - Matching Pair: $+100$ points.
  - Consecutive Match Combo: $+100 \times \text{Combo Streak}$ (e.g. 2nd consecutive pair = 200 pts, 3rd = 300 pts).
  - Time Bonus: $\text{Remaining Seconds} \times 20$ points upon clearing stage.
  - Flawless Memory Bonus: $+500$ points if board cleared without any mismatches.
- **Difficulty Levels & Progression:**
  - **Easy:** 3×4 matrix (6 pairs); generous 90-second countdown; 4 lives/chances.
  - **Medium:** 4×4 matrix (8 pairs); 60-second countdown; 3 lives.
  - **Hard:** 4×5 matrix (10 pairs); 45-second countdown; tile positions shuffle if 3 consecutive mismatches occur.
- **Win / Lose Conditions:**
  - **Win:** Decrypt all 5 cryptographic vault stages.
  - **Lose:** Mainframe lockdown timer reaches zero or lives exhausted.
- **High Score Criteria:** Total completion speed + Maximum match combo streak + Flawless stages.

---

## 9. LabyrinthEscape

```
[#][#][#][#][#][#][#][#][#][#]
[#][P] .  . [#] .  .  . [K][#] <- Player [P] & Keycard [K]
[#] . [#] . [#] . [#][#] . [#]
[#] . [#] .  .  .  . [D] . [#] <- Patrol Drone [D]
[#] . [#][#][#][#] . [#] . [#]
[#] .  .  .  .  .  . [#][E][#] <- Escape Hatch [E]
[#][#][#][#][#][#][#][#][#][#]
```

- **Game ID:** `labyrinth-escape`
- **Category:** Procedural Maze Infiltration
- **Lore & Theme:** Sub-Terranean Catacombs. Guide an autonomous exploration probe through procedurally generated stone bunker labyrinths to locate the encryption keycard and reach the extraction hatch before oxygen runs out.
- **Playfield & Visual Representation:**
  - 10×20 grid. Walls are solid double-thick lines (`1`). Open corridors are empty (`0`).
  - Player probe is a blinking dot (`2`).
  - Keycard `[K]` pulses rapidly. Escape portal `[E]` is an alternating perimeter square.
  - Patrol drones `[D]` are rotating crosshairs traversing set patrol circuits.
- **Rules & Mechanics:**
  - Player navigates corridors to locate and collect the security Keycard.
  - Once the Keycard is collected, the Escape Hatch activates and unlocks.
  - Roaming security patrol drones traverse the corridors along deterministic loop routes. Contact with a drone is fatal.
  - One-way pressure doors permit passage in only one direction, creating intricate pathfinding puzzles.
  - Button B emits a Sonar Ping that reveals hidden false walls that can be breached.
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Navigate corridors.
  - **Button A:** Interact / Hack door / Collect keycard.
  - **Button B:** Sonar Ping (reveals shortcuts / secrets; 3 charges per maze).
- **Scoring Formulas:**
  - Keycard Retrieved: $+200$ points.
  - Hatch Extraction: $+1000$ points.
  - Stealth Bonus (no alarms or drone alerts): $+500$ points.
  - Oxygen Time Bonus: $\text{Remaining Seconds} \times 15$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** Wide corridors; static layout; 0 patrol drones; 90-second oxygen timer.
  - **Medium:** Narrow corridors; 1 roaming patrol drone; locked security gates; 60-second timer.
  - **Hard:** 2 fast patrol drones; dynamic shifting walls; Fog of War reveals only a 3-tile radius around player; 40-second timer.
- **Win / Lose Conditions:**
  - **Win:** Successfully escape all 6 bunker depth sectors.
  - **Lose:** Deplete oxygen supply or get intercepted by patrol drones.
- **High Score Criteria:** Time efficiency + Stealth clears + Secrets uncovered.

---

## 10. Froggero

```
[D][ ][D][ ][D][ ][D][ ][D] <- Docks (Goal)
~~~~~~~~ CANAL ~~~~~~~~~~
[===]       [===]       <- Floating Magnetic Log (Moving Left)
      [===]       [===] <- Sinking Buoy (Moving Right)
-------------------------- <- Safe Median Highway Strip
  [#]       [#]     [#] <- Fast Transport (Moving Left)
      [#]       [#]     <- Cargo Truck (Moving Right)
. . . . . [F] . . . . . . <- Amphibian Toad [F] (Start)
```

- **Game ID:** `froggero`
- **Category:** Transit Hazard Crosser
- **Lore & Theme:** Cyber-Bog Transit. Guide a bionic leaping toad across a multi-lane magnetic transit corridor and over a rushing high-voltage plasma canal into five safe docking bays.
- **Playfield & Visual Representation:**
  - 10×20 grid divided into four sectors:
    - Rows `19..15`: Bottom starting strip and 4 vehicular traffic lanes.
    - Row `14`: Central safe median strip.
    - Rows `13..2`: High-voltage canal with floating logs, magnetic barges, and sinking buoys.
    - Row `1`: Five target docking bays separated by electric pylons.
  - The frog is a 1×1 pulsing entity. Vehicles are 2×1 or 3×1 solid pixel blocks.
- **Rules & Mechanics:**
  - Each tap of the D-Pad hops the toad one grid square forward, backward, left, or right.
  - Vehicles travel horizontally at alternating velocities across the highway lanes. Collision causes instant squash.
  - In the canal, the toad must land on floating logs or buoys. Touching the water plasma results in immediate loss of life.
  - Certain logs periodically submerge! Player must leap off before the log fully sinks below the surface.
  - Successfully landing in an open docking bay secures that dock. Filling all 5 docks completes the round and advances the level.
  - Button B launches the toad's tongue to snatch passing bonus dragonfly drones for extra score.
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Single-hop movement.
  - **Button A:** Super Leap (double-hop leap directly forward over 1 hazard cell).
  - **Button B:** Tongue Snap (catches bonus insects up to 3 cells ahead).
- **Scoring Formulas:**
  - Forward Hop: $+10$ points per new row reached.
  - Secure Docking Bay: $+200$ points.
  - Bonus Dragonfly Caught: $+250$ points.
  - All 5 Docks Cleared: $+1000 \times \text{Level} + (\text{Timer} \times 10)$.
- **Difficulty Levels & Progression:**
  - **Easy:** Slow highway traffic; long floating logs that never sink; 60 seconds per dock; 4 lives.
  - **Medium:** Traffic speeds vary dynamically; buoys sink for 2 seconds every 6 seconds; 45 seconds per dock; 3 lives.
  - **Hard:** High-speed sports transports; snapping croc-logs with opening jaws; floating debris; 30 seconds per dock; 2 lives.
- **Win / Lose Conditions:**
  - **Win:** Clear all 5 levels (25 total dockings).
  - **Lose:** Deplete all lives from drowning, traffic impact, or time expiration.
- **High Score Criteria:** Rapid dock fill times + Dragonfly snaps + Flawless crossing streaks.

---

## 11. MoleHammer

```
+---+---+---+
| ( ) | (O) | ( ) | <- Conduit 2 has an active bot!
+---+---+---+
| ( ) | [X] | ( ) | <- Player Reticle [X] at Center
+---+---+---+
| (!) | ( ) | ( ) | <- Conduit 7 has a Hazard Rod (!)
+---+---+---+
Score: 0450  Streak: x4
```

- **Game ID:** `mole-hammer`
- **Category:** High-Reflex Conduit Strike
- **Lore & Theme:** Reactor Rod Malfunction. Faulty energy rods and subterranean mole-bots are erupting across the power station conduits. Mallet down rogue bots before they short out the reactor, but beware radioactive cooling rods!
- **Playfield & Visual Representation:**
  - 10×20 grid. Centered 3×3 conduit array (or 4×3 on Hard mode).
  - Conduits are 2×2 circular brick frames.
  - Rogue bots emerge as solid upward blocks (`1`).
  - Rare Gold Bots flash rapidly (`2`).
  - Radioactive hazard rods display an inverted cross warning glyph.
  - Player targeting reticle is a crosshair bracket `[ ]` moved via D-Pad.
- **Rules & Mechanics:**
  - Rogue bots pop out of random conduits for brief intervals (between 0.4s and 1.2s depending on level).
  - Position the targeting reticle over an active bot and press **Button A** to strike.
  - Striking a standard bot scores points and retracts it instantly.
  - Striking a Gold Bot scores triple points and activates a 5-second score frenzy multiplier.
  - Striking a radioactive hazard rod causes an energy stun, locking the hammer for 1.5 seconds and deducting points.
  - Button B executes a Sweep Strike that hits two horizontally adjacent conduits simultaneously (limited 3 uses per round).
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Reposition targeting reticle across conduit holes.
  - **Button A:** Hammer Strike!
  - **Button B:** Sweep Strike (dual-hole area impact; 3 charges per round).
- **Scoring Formulas:**
  - Standard Rogue Bot Strike: $+50$ points.
  - Gold Bot Strike: $+150$ points.
  - Hazard Rod Strike: $-75$ points & 1.5s hammer lock.
  - Consecutive Hit Streak: $+10\%$ compounding bonus per consecutive successful strike without a miss.
  - Perfect Round (Zero Misses): $+1000$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** 1 bot emerges at a time; 1.2s pop duration; zero hazard rods; 60-second round.
  - **Medium:** Up to 2 simultaneous bots; 0.7s pop duration; hazard rods appear periodically; 45-second round.
  - **Hard:** Up to 3 simultaneous bots; 0.45s pop duration; decoy bots switch to hazard rods right before striking; 30-second round.
- **Win / Lose Conditions:**
  - **Win:** Survive and clear all 5 reactor sectors with $\ge 80\%$ accuracy.
  - **Lose:** Miss 10 bots or allow reactor overcharge bar to reach 100%.
- **High Score Criteria:** Accuracy percentage + Strike streak combo + Frenzy utilization.

---

## 12. ChromaPulse

```
       [ ^ ] (TOP: High Pitch)
         |
[ < ] - [ + ] - [ > ] (RIGHT: Mid-High)
(LEFT:   |
Low)   [ v ] (BOTTOM: Mid-Low)
Step: 07 / 15  Pulse Speed: 240ms
```

- **Game ID:** `chroma-pulse`
- **Category:** Sequential Quadrant Resonance
- **Lore & Theme:** Resonant Audio-Visual Matrix. Attune with an alien monolithic artifact by echoing back its escalating rhythmic pulses across four illuminated directional quadrants.
- **Playfield & Visual Representation:**
  - 10×20 grid. Four distinct quadrants:
    - **Up:** Top quadrant (`y = 2..6`, centered).
    - **Right:** Right quadrant (`x = 7..9`, centered).
    - **Down:** Bottom quadrant (`y = 14..18`, centered).
    - **Left:** Left quadrant (`x = 0..2`, centered).
  - During playback, an active quadrant fills with solid pixels and plays its signature procedural chiptune tone:
    - Up: 880 Hz (A5)
    - Right: 659 Hz (E5)
    - Down: 440 Hz (A4)
    - Left: 329 Hz (E4)
- **Rules & Mechanics:**
  - The console plays a randomized sequence of illuminated quadrants and corresponding tones.
  - The player must listen, memorize, and accurately replicate the sequence in exact order using the D-Pad.
  - Each successful replication appends one additional step to the sequence.
  - Every 5th level introduces "Echo Inversion" where the sequence must be entered in **reverse order**!
  - Button B provides a "Re-Listen Hint", replaying the current sequence at the cost of 25% of the round's points.
- **Handheld Controls:**
  - **D-Pad Up:** Activate Top quadrant (High tone).
  - **D-Pad Right:** Activate Right quadrant (Mid-high tone).
  - **D-Pad Down:** Activate Bottom quadrant (Mid-low tone).
  - **D-Pad Left:** Activate Left quadrant (Low tone).
  - **Button A:** Confirm / Input trigger.
  - **Button B:** Re-Listen Hint (replay sequence once; 25% point deduction).
- **Scoring Formulas:**
  - Base Step Score: $25 \times \text{Current Step Length}$.
  - Fast Echo Bonus: $+50$ points if entire sequence is entered within 2.5 seconds of playback finishing.
  - Inverted Round Milestone: $+500$ points upon conquering a reverse echo round.
  - Sequence Cleared: $\text{Step Count}^2 \times 10$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** Pulse flash duration 500ms; starts at 2 steps; max sequence length 12; 4 error strikes allowed.
  - **Medium:** Pulse duration 320ms; starts at 3 steps; max sequence length 20; 3 error strikes allowed.
  - **Hard:** Pulse duration 180ms; starts at 4 steps; max sequence length 30; reverse rounds every 3rd level; 1 strike only.
- **Win / Lose Conditions:**
  - **Win:** Complete the maximum sequence length for the chosen difficulty.
  - **Lose:** Deplete all error strike allowances.
- **High Score Criteria:** Longest unbroken sequence memorized + Fast echo execution + Zero hints used.

---

## 13. GridTactics

```
   0   1   2
 +---+---+---+
0| X | . | O | <- Row 0: Player [X], Empty [.], AI [O]
 +---+---+---+
1| . | X | . | <- Row 1: Player center control
 +---+---+---+
2| O | . | X | <- Row 2: Player diagonal win!
 +---+---+---+
Round 3 / 5   Player: 2   AI: 0
```

- **Game ID:** `grid-tactics`
- **Category:** Spatial Alignment Strategy
- **Lore & Theme:** Tactical Matrix Confrontation. An advanced cybernetic neural core challenges you to complete unbroken power conduits on an augmented micro-grid. Outwit the algorithm before it locks down your sector!
- **Playfield & Visual Representation:**
  - 10×20 grid. Centered 3×3 board (Standard mode) or 4×4 board (Expanded mode).
  - Player tokens are solid crosshairs (`X`). AI tokens are hollow squares (`O`).
  - Active cursor is an outer bracket box flashing at 4 Hz.
  - Winning linear conduits flash rapidly upon round completion.
- **Rules & Mechanics:**
  - Turn-based tactical placement. Player and AI alternate placing tokens in vacant grid cells.
  - In 3×3 mode: Connecting 3 tokens in a row (horizontal, vertical, or diagonal) wins the round.
  - In 4×4 Expanded mode: Connecting 4 tokens in a row OR forming a 2×2 square box wins the round.
  - Features an intelligent Minimax AI engine with variable search depth and tactical heuristics.
  - Matches are played as Best of 5 rounds.
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Move selector cursor across grid cells.
  - **Button A:** Place token in highlighted cell.
  - **Button B:** Tactical Pass / Quick Forfeit current round (Arcade mode).
- **Scoring Formulas:**
  - Round Win (3×3): $+300$ points.
  - Round Win (4×4): $+600$ points.
  - Quick Win Bonus (won in $\le 5$ moves): $+250$ points.
  - Draw / Stalemate: $+100$ points.
  - Match Sweep (3-0 victory): $+1500$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** AI utilizes heuristic rules with 30% chance of tactical oversight; 3×3 mode.
  - **Medium:** AI runs Minimax search to depth 3; blocks immediate threats; 3×3 & 4×4 modes.
  - **Hard:** AI runs deep Minimax with Alpha-Beta pruning and an opening book; perfect play; 4×4 mode only.
- **Win / Lose Conditions:**
  - **Win:** Win 3 rounds in the Best-of-5 match.
  - **Lose:** AI wins 3 rounds first.
- **High Score Criteria:** Match sweep score + Fewest turns to victory + Hard difficulty clearance.

---

## 14. FourInLine

```
  1   2   3   4   5   6   7
| . | . | . | . | . | . | . |
| . | . | . | . | . | . | . |
| . | . | O | . | . | . | . |
| . | X | X | O | . | . | . |
| O | X | O | X | . | . | . |
| X | X | O | O | O | X | . |
-----------------------------
Selector: [Col 4] -> Press A to Drop
```

- **Game ID:** `four-in-line`
- **Category:** Gravity Column Resonance
- **Lore & Theme:** Quantum Siphon Core. Drop high-density isotope spheres down vertical containment chutes to align a 4-token resonance conduit before the rival reactor core establishes its own link.
- **Playfield & Visual Representation:**
  - 10×20 grid. Centered 7 columns × 6 rows vertical matrix.
  - Player tokens: Solid circular dots (`1`).
  - AI tokens: Hollow rings (`2` / outline).
  - Top row shows a hovering pointer indicator above the active column.
- **Rules & Mechanics:**
  - Players alternate turns dropping a token into one of the 7 vertical columns.
  - Gravity pulls each dropped token down to the lowest unoccupied row in that column.
  - The first player to align 4 matching tokens horizontally, vertically, or diagonally wins the match instantly.
  - If all 42 cells fill without any player forming 4-in-a-row, the game ends in a draw.
  - AI engine utilizes 6-ply Alpha-Beta search with center-column positional weighting.
- **Handheld Controls:**
  - **D-Pad Left / Right:** Shift column selector (columns 1 through 7).
  - **Button A:** Drop token into selected column.
  - **Button B:** Inspect Column Heights / Toggle telemetry overlay.
- **Scoring Formulas:**
  - Round Win: $+1000$ points.
  - Speed Efficiency Bonus: $+20$ points for every empty cell remaining on the board.
  - Diagonal Resonance Win: $+250$ points bonus.
  - 3-Game Championship Sweep: $+2500$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** AI evaluates 1 move ahead; occasionally misses diagonal traps.
  - **Medium:** AI evaluates 3 moves ahead; actively blocks opponent triples and sets traps.
  - **Hard:** Full Alpha-Beta minimax engine searching 6 moves ahead; flawless endgame conversion.
- **Win / Lose Conditions:**
  - **Win:** Connect 4 tokens in a row before the AI.
  - **Lose:** AI connects 4 tokens in a row first.
- **High Score Criteria:** Turn count minimization + Diagonal finishes + Undefeated match streaks.

---

## 15. MineScanner

```
  0 1 2 3 4 5 6 7 8 9
0 . . . . . . . . . .
1 . [1][1][1] . . . .
2 . [1][*][1] . . [F] <- Flagged Mine [F]
3 . [1][1][1] . . . .
4 . . . . . . . . . .
Remaining Mines: 08   Time: 042s
```

- **Game ID:** `mine-scanner`
- **Category:** Seismic Grid Demining
- **Lore & Theme:** Sub-Surface Mine Clearance. A remote planetary surveyor crawler must map an unchartered seismic sector, accurately flagging buried proximity charges while opening up safe mineral conduits.
- **Playfield & Visual Representation:**
  - 10×20 grid. Configured as an 8×10 or 10×14 active demining zone.
  - Unrevealed cells render as solid filled blocks.
  - Cleared empty cells render blank (`0`).
  - Numbered cells display retro 3×5 numeric glyphs (`1` through `8`).
  - Flagged cells render as a distinctive `[F]` flag icon.
  - Detonated mines flash across the entire screen.
- **Rules & Mechanics:**
  - The player moves a crosshair cursor across the grid to scan cells.
  - Pressing **Button A** reveals the targeted cell.
    - If the cell contains a mine: Detonation! Game Over.
    - If the cell is empty: Displays the count of adjacent mines in the surrounding 8 cells.
    - If zero adjacent mines: Automatically triggers a recursive flood-fill uncovering all connected safe cells!
  - Pressing **Button B** plants or removes a Flag marker `[F]` on suspect cells.
  - First-Click Guarantee: The very first cell revealed in any game is guaranteed to be completely safe (0 adjacent mines).
  - Pressing **Button A + Button B simultaneously** over a revealed number whose adjacent flags match the number triggers a "Chord Clear", instantly revealing all remaining unflagged neighbors!
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Move scanner cursor.
  - **Button A:** Reveal / Uncover cell.
  - **Button B:** Toggle Mine Flag `[F]`.
  - **Button A + B:** Chord Clear (rapidly reveal adjacent non-flagged cells).
- **Scoring Formulas:**
  - Safe Cell Revealed: $+10$ points.
  - Mine Accurately Flagged: $+50$ points.
  - Sector Completely Cleared: $+1500 \times \text{Difficulty Multiplier}$.
  - Time Clearance Bonus: $\text{Remaining Seconds} \times 15$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** 8×8 grid; 8 mines (12.5% mine density); 120-second timer.
  - **Medium:** 9×10 grid; 16 mines (17.7% density); 90-second timer.
  - **Hard:** 10×14 grid; 26 mines (18.5% density); 60-second timer; strict chord penalties.
- **Win / Lose Conditions:**
  - **Win:** Uncover every non-mine cell on the grid.
  - **Lose:** Detonate any buried mine or allow countdown timer to hit 0.
- **High Score Criteria:** Clearance speed + Zero chord errors + Hard grid completion.

---

## 16. Matrix2048

```
+----+----+----+----+
|  2 |  4 |  8 | 16 |
+----+----+----+----+
|  . |  2 | 32 | 64 |
+----+----+----+----+
|  . |  . |  4 | 128|
+----+----+----+----+
|  . |  . |  . | 256|
+----+----+----+----+
Score: 03420   Max Tile: 256
```

- **Game ID:** `matrix-2048`
- **Category:** Isotopic Fusion Sliding Puzzle
- **Lore & Theme:** Fusion Reactor Core. Compress identical isotopic elements under magnetic force inside a quantum accelerator chamber to synthesize super-heavy element 2048 and unlock unlimited power!
- **Playfield & Visual Representation:**
  - 10×20 grid. Centered 4×4 isotope grid.
  - Tile values: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048.
  - Rendered with crisp numeric badge typography or custom geometric isotope pixel patterns tailored for LCD legibility.
  - Smooth 1-frame sliding interpolation when shifting rows.
- **Rules & Mechanics:**
  - Pressing any cardinal D-Pad direction slides all tiles on the board toward that boundary.
  - When two tiles of identical value collide while sliding, they merge into a single tile with their combined sum ($2+2 \to 4, 4+4 \to 8$).
  - A merged tile cannot merge again within the same slide turn.
  - After every valid slide, a new tile (90% chance of a `2`, 10% chance of a `4`) spawns in a random empty cell.
  - Player has 1 "Quantum Undo" charge (Button B) to reverse the previous move in emergencies.
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Slide all tiles in chosen direction.
  - **Button A:** Inspect / Tile Detail zoom view.
  - **Button B:** Quantum Undo (reverses last slide; 1 charge per game).
- **Scoring Formulas:**
  - Merge Points: Sum of the newly formed tile is added directly to total score ($16+16 \to +32$ points).
  - Milestone 512 Synthesized: $+1000$ points.
  - Milestone 1024 Synthesized: $+2500$ points.
  - Milestone 2048 Synthesized: $+10,000$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** Spawns 80% `2`s and 20% `4`s; 3 Quantum Undo charges; continuous post-2048 endless mode.
  - **Medium:** Standard 90% `2`s / 10% `4`s; 1 Quantum Undo charge.
  - **Hard:** 70% `2`s / 30% `4`s; zero undo charges; an immovable 1×1 carbon obstacle block occupies a random cell from the start!
- **Win / Lose Conditions:**
  - **Win:** Synthesize the 2048 isotope tile (game may continue for endless high scores).
  - **Lose:** No empty cells remain and no valid adjacent merges can be executed.
- **High Score Criteria:** Peak score achieved + Highest tile value synthesized + Turn efficiency.

---

## 17. AeroGlider

```
. . . . . . . . . .
. . . . . . [#][#]  <- Top Lightning Pylon
. . . . . . [#][#]
. . [>] . . . . . . <- Aero-Glider [>] (Flaps Upwards)
. . . . . . . . . . <- Gap (Clear Passage!)
. . . . . . [#][#]  <- Bottom Lightning Pylon
. . . . . . [#][#]
Score: 0024   Distance: 240m
```

- **Game ID:** `aero-glider`
- **Category:** Precision Altitude Flap
- **Lore & Theme:** Atmospheric Ion Glider. Pilot a fragile experimental solar glider through a dense storm canyon filled with fluctuating high-voltage lightning pylons and treacherous thermals.
- **Playfield & Visual Representation:**
  - 10×20 grid. Glider is a 2×1 aerodynamic dart positioned at `x = 2`.
  - Pylon obstacles scroll continuously from right (`x = 9`) to left (`x = 0`).
  - Pylon columns have variable gap openings between 4 and 6 pixels high.
  - Active lightning sparks arc between pylon tips.
- **Rules & Mechanics:**
  - Constant gravity pulls the glider downward toward the canyon floor.
  - Pressing **Button A** gives an upward aerodynamic flap / impulse.
  - Glider must glide cleanly through the gap between top and bottom lightning pylons without touching them, the ceiling, or the ground.
  - Button B engages an "Air Brake", flattening glider pitch to drop vertically through tight gaps.
  - Wind turbulence gusts randomly push or pull glider velocity at higher levels.
- **Handheld Controls:**
  - **Button A / Space / KeyJ:** Upward Aerodynamic Flap.
  - **Button B / KeyK / Shift:** Air Brake / Dive trim.
  - **D-Pad Left / Right:** Fine forward/rear aerodynamic positioning.
- **Scoring Formulas:**
  - Pylon Gate Passed: $+10$ points.
  - Clean Passage (navigating dead-center through gap without grazing edges): $+25$ points.
  - Consecutive Gate Streak: $+5$ points compounding bonus per consecutive gate.
  - Milestone 50 Gates: $+2000$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** Wide 5-pixel gate gaps; slow scroll speed (3.0 Hz); mild gravity; 4 lives.
  - **Medium:** 4-pixel gate gaps; faster scroll speed (5.0 Hz); moderate gravity; 3 lives.
  - **Hard:** 3-pixel gate gaps; high-speed scroll (7.0 Hz); pulsating moving pylons that oscillate vertically; 1 life only.
- **Win / Lose Conditions:**
  - **Win:** Successfully navigate 100 consecutive storm canyon pylons.
  - **Lose:** Collide with pylons, ceiling, or canyon floor with zero remaining lives.
- **High Score Criteria:** Total pylons cleared + Center-gap accuracy ratio + Maximum gate streak.

---

## 18. BrickBreaker

```
[#][#][#][#][#][#][#][#] <- Row 2: Armored Bricks
[#][#][#][#][#][#][#][#] <- Row 3: Standard Bricks
. . . . . . . . . . . .
. . . . (o) . . . . . . <- Disruptor Ball
. . . .  ^  . . . . . . 
. . [#][#][#] . . . . . <- Repulsor Paddle (Row 19)
```

- **Game ID:** `brick-breaker`
- **Category:** Orbital Kinetic Demolition
- **Lore & Theme:** Orbital Demolition Shield. Clear dense cosmic debris barriers blocking orbital transit corridors using a high-density kinetic disruptor ball bounced off a mobile repulsor bar.
- **Playfield & Visual Representation:**
  - 10×20 grid.
  - Top rows `2..6` hold layered brick formations.
  - Brick varieties:
    - Standard Brick (`1` hit to shatter).
    - Armored Brick (`2` hits; flashes on first hit).
    - Indestructible Titanium Brick (solid barrier).
    - Power Capsule Brick (drops falling capsule when shattered).
  - Bottom paddle (width 3 or 4 pixels) moves horizontally along row `19`.
- **Rules & Mechanics:**
  - Player launches the kinetic ball from the paddle. The ball ricochets off side walls, ceiling, bricks, and paddle.
  - Striking a brick damages or destroys it and rebounds the ball downward.
  - Deflection angle varies based on paddle point of impact (striking outer ends yields wide ricochets).
  - Falling Power Capsules include:
    - *Laser Blaster [L]:* Allows paddle to fire direct laser shots at bricks with Button A.
    - *Wide Bar [W]:* Expands paddle by 2 pixels.
    - *Multi-Ball [M]:* Splits active ball into 3 independent balls.
    - *Slow Ball [S]:* Reduces ball velocity by 30%.
- **Handheld Controls:**
  - **D-Pad Left / Right:** Move repulsor paddle.
  - **Button A:** Launch ball / Fire Laser Cannons (when equipped).
  - **Button B:** Magnetic Catch (holds ball on paddle surface when magnet power-up is active).
- **Scoring Formulas:**
  - Standard Brick Destroyed: $+20$ points.
  - Armored Brick Destroyed: $+50$ points.
  - Power Capsule Caught: $+100$ points.
  - Laser Shot Hit: $+15$ points.
  - Board Clear Bonus: $+1000 \times \text{Level}$.
- **Difficulty Levels & Progression:**
  - **Easy:** Paddle width 4 pixels; ball speed moderate; power capsule drop rate 25%; 4 lives.
  - **Medium:** Paddle width 3 pixels; ball accelerates after every 6 paddle bounces; drop rate 15%; 3 lives.
  - **Hard:** Paddle width 2 pixels; high starting ball velocity; indestructible titanium brick clusters; drop rate 8%; 2 lives.
- **Win / Lose Conditions:**
  - **Win:** Clear all 8 orbital demolition sectors.
  - **Lose:** Ball drains past the bottom paddle with zero remaining lives.
- **High Score Criteria:** Total bricks demolished + Multi-ball juggle duration + Laser accuracy.

---

## 19. PinballBounce

```
| . . . (B) . (B) . . . | <- Pop Bumpers (B)
| . . . . . . . . . . . |
| [/] . . [===] . . [\] | <- Slingshots [/] & Drop Targets
| . . . . . . . . . . |
| . . . . (o) . . . . | <- Metallic Ball
| . [/] . . . . [\] . | <- Lower Guide Lanes
| . [L] . . . . [R] . | <- Left [L] and Right [R] Flippers
```

- **Game ID:** `pinball-bounce`
- **Category:** Graviton Kinetic Arcade Table
- **Lore & Theme:** Graviton Arcade Table. Launch metallic spheres through a pinball machine packed with pop bumpers, slingshot deflectors, drop target banks, and high-multiplier jackpot ramps.
- **Playfield & Visual Representation:**
  - 10×20 grid.
  - Plunger chute on far-right column (`x = 9`).
  - Top field features 2 active Pop Bumpers (2×2 circular bumpers that flash on contact).
  - Midfield features a 3-bank Drop Target array and left/right Slingshot kickers.
  - Bottom field contains Left Flipper `[L]` (`x = 2..4, y = 18`) and Right Flipper `[R]` (`x = 5..7, y = 18`).
- **Rules & Mechanics:**
  - Pull and release the spring plunger to propel the ball into the upper playfield.
  - Twin flippers are controlled independently:
    - **D-Pad Left** actuates the Left Flipper upward.
    - **Button A** actuates the Right Flipper upward.
  - Hitting all 3 Drop Targets lowers the bank and activates the **Jackpot Ramp** for 15 seconds.
  - Ball Save Mechanism: If the ball drains within the first 12 seconds of launch, it is automatically re-served.
  - Table Nudge: Player can nudge the table with D-Pad Up or Button B to alter ball trajectory, but 3 rapid nudges triggers a "TILT!" penalty, locking the flippers!
- **Handheld Controls:**
  - **D-Pad Left:** Actuate Left Flipper.
  - **Button A:** Actuate Right Flipper.
  - **D-Pad Down:** Pull Plunger (hold to build spring tension).
  - **D-Pad Up:** Release Plunger / Nudge Table Forward.
  - **Button B:** Side Table Nudge (careful: triggers Tilt if abused).
- **Scoring Formulas:**
  - Pop Bumper Hit: $+50$ points.
  - Slingshot Kicker: $+25$ points.
  - Single Drop Target Hit: $+100$ points.
  - Drop Target Bank Cleared: $+1000$ points.
  - Jackpot Ramp Shot: $+2500 \times \text{Active Multiplier}$ (up to 5×).
- **Difficulty Levels & Progression:**
  - **Easy:** Wide flipper blades; 15s ball save; generous tilt threshold (5 warnings); 4 balls.
  - **Medium:** Standard flipper blades; 8s ball save; 3 tilt warnings; 3 balls.
  - **Hard:** Narrow flipper gap; no ball save; strict tilt sensor (2 warnings); high gravity; 2 balls.
- **Win / Lose Conditions:**
  - **Win:** Achieve Grand Champion score threshold ($\ge 50,000$ points).
  - **Lose:** Drain all allotted pinballs.
- **High Score Criteria:** Total score accumulated + Jackpot multipliers unlocked + Bumper hit count.

---

## 20. SprintEscape

```
. . . . . . . . . .
. . . . . . . . . .
. [P] . . . . . . . <- Cyber Runner [P]
[#][#] . . [#][#][#] <- Rooftops (Gap in between!)
. . . . . . . . . .
Score: 0520   Distance: 380m   Speed: 6.2 Hz
```

- **Game ID:** `sprint-escape`
- **Category:** Dystopian Rooftop Parkour
- **Lore & Theme:** Rooftop Cyber Pursuit. Dash across dystopian neon rooftops escaping a relentless robotic enforcer drone, leaping vast sky-well gaps, sliding under electrified overhead conduit wires, and stomping accelerator pads.
- **Playfield & Visual Representation:**
  - 10×20 grid. Side-scrolling runner perspective.
  - The runner is a 2×2 pixel bipedal avatar positioned at `x = 2`.
  - Rooftops, gaps, elevated platforms, and obstacles scroll horizontally right-to-left.
  - Spikes and low electrified pipes render as distinctive jagged patterns.
- **Rules & Mechanics:**
  - Continuous forward running. The player must time leaps and slides to survive the obstacle course.
  - Pressing **Button A** executes a Jump. Pressing Button A while airborne executes a **Double Jump**!
  - Pressing **D-Pad Down / Button B** executes a low slide under overhead conduit barriers.
  - Falling into a building gap or crashing into an obstacle causes instant loss of life.
  - Speed continuously accelerates the further the player runs.
  - Collecting glowing Data Cubes along the rooftops adds bonus points and charges the Dash Shield.
- **Handheld Controls:**
  - **Button A:** Jump (tap twice for Double Jump).
  - **D-Pad Down / Button B:** Low Slide / Duck under overhead hazards.
  - **D-Pad Left / Right:** Micro-adjust pace (slow down slightly / sprint forward).
- **Scoring Formulas:**
  - Distance Traveled: $+1$ point per meter.
  - Rooftop Gap Leap: $+25$ points.
  - Low Conduit Slide: $+30$ points.
  - Data Cube Pickup: $+50$ points.
  - Distance Milestone (every 500m): $+500$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** Wide rooftop landing platforms; small gaps; slow starting speed (3.5 Hz); 4 lives.
  - **Medium:** Narrower platforms; crumbling rooftops that collapse 0.5s after landing; medium speed (5.5 Hz); 3 lives.
  - **Hard:** Single-block platforms; moving airborne drones; wind resistance; blistering speed (8.0 Hz); 2 lives.
- **Win / Lose Conditions:**
  - **Win:** Reach the extraction dropship landing pad at 5,000 meters.
  - **Lose:** Deplete all runner lives via falls or obstacle collisions.
- **High Score Criteria:** Maximum distance sprinted + Data cubes collected + Clean obstacle clears.

---

## 21. OrbPop

```
. [#][#][*][*][#][#] . <- Ceiling Orb Cluster
. [*][*][@][@][*][*] . <- Striped & Solid Orbs
. . . . . . . . . . .
. . . . . / . . . . . <- Aim Trajectory Line
. . . . [O] . . . . . <- Current Orb to Launch (Row 18)
. . . . [/\] . . . . . <- Particle Cannon (Row 19)
```

- **Game ID:** `orb-pop`
- **Category:** Molecular Cluster Cannon
- **Lore & Theme:** Molecular Fusion Chamber. A high-precision particle cannon fires elemental orbs into an advancing ceiling cluster inside a fusion accelerator chamber. Match molecular isotopes to neutralize the ceiling!
- **Playfield & Visual Representation:**
  - 10×20 grid.
  - Ceiling rows `0..8` hold clusters of elemental orbs.
  - Four visual orb types on LCD:
    - *Solid Orb:* Dark filled block (`1`).
    - *Hollow Orb:* Outline square.
    - *Cross Orb:* Center plus sign.
    - *Stripe Orb:* Alternating vertical lines.
  - Cannon resides at `x = 4..5, y = 19`, rotating its aim trajectory left and right.
- **Rules & Mechanics:**
  - Player angles the cannon trajectory and fires the loaded orb upward.
  - Orbs ricochet off left and right side walls.
  - When the fired orb connects with a cluster of 2 or more matching orbs (forming a group of 3 or more), all connected matching orbs dissolve!
  - **Avalanche Mechanism:** Any un-matched orbs that lose connection to the ceiling fall and dissolve as huge bonus points!
  - Every 5 shots, the ceiling shifts down by 1 row.
  - If any orb descends to touch the bottom cannon line (`y = 18`), the reactor overpressurizes: Game Over.
  - Button B swaps the current loaded orb with the reserve chamber orb.
- **Handheld Controls:**
  - **D-Pad Left / Right:** Rotate cannon aim trajectory angle.
  - **Button A:** Launch elemental orb.
  - **Button B:** Swap loaded orb with reserve orb.
- **Scoring Formulas:**
  - Direct Popped Orb: $+30$ points per orb.
  - Avalanche Dropped Orbs: $+100$ points per falling orb.
  - Chain Reaction Multiplier: $2\times, 3\times, 5\times$ for consecutive combo bursts.
  - Complete Ceiling Wipe: $+2000$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** Laser aim trajectory guide line visible; ceiling drops every 6 shots; 3 orb varieties; 4 lives.
  - **Medium:** Short trajectory guide; ceiling drops every 4 shots; 4 orb varieties; 3 lives.
  - **Hard:** No trajectory guide; ceiling drops every 3 shots; 5 orb varieties; bouncing trick shots required; 2 lives.
- **Win / Lose Conditions:**
  - **Win:** Clear all ceiling orbs across 6 molecular chambers.
  - **Lose:** Orbs breach the bottom baseline (`y = 18`).
- **High Score Criteria:** Avalanche drop count + Chain reaction combos + Shot efficiency.

---

## 22. SolitaireLite

```
[DECK] [WASTE]       [FOUNDATION 1] [FOUNDATION 2]
 [ ? ]   [ 4*]            [ 1# ]         [ 1* ]

 COL 1   COL 2   COL 3   COL 4
  [ 7*]   [ 6#]   [ 5*]   [ 3#]
  [ 6#]   [ ? ]   [ ? ]   [ ? ]
```

- **Game ID:** `solitaire-lite`
- **Category:** Cyber-Deck Sorting Protocol
- **Lore & Theme:** Cyber-Deck Sorting Protocol. Defrag and organize fragmented micro-data cards into ordered numeric stacks inside a high-security mainframe terminal before security locks the drive.
- **Playfield & Visual Representation:**
  - 10×20 grid. Perfectly optimized for the 10-column LCD matrix:
    - Top rows `0..3`: Draw Deck, Waste Pile, and 2 Foundation stacks.
    - Rows `5..19`: Four Tableau columns (Columns 1 through 4, spaced at `x = 0, 3, 6, 9`).
  - Cards are rendered with rank digits (`1` through `7`) and 2 polarity suits:
    - *Solid Suit (`#`):* Solid filled background with white number.
    - *Hollow Suit (`*`):* Clear background with dark outline number.
- **Rules & Mechanics:**
  - Deck consists of 28 cards (Ranks 1 to 7 across 2 Solid and 2 Hollow suits).
  - Tableau Rules: Cards in tableau columns must be stacked in strictly descending sequence alternating polarities (e.g. `6#` on `7*`, `5*` on `6#`).
  - Foundation Rules: Foundations build upward in ascending order of the same polarity from `1` up to `7` (`1# -> 2# -> ... -> 7#`).
  - Player draws cards from the Reserve Deck into the Waste pile.
  - Button A picks up or drops the selected card or valid descending column stack.
  - Button B automatically sends the selected card to its Foundation if eligible.
- **Handheld Controls:**
  - **D-Pad Up / Down / Left / Right:** Move selector cursor across Deck, Foundations, and Tableau columns.
  - **Button A:** Select / Pick up card stack / Place down card stack.
  - **Button B:** Auto-Move to Foundation (quick-dispatch).
  - **Select:** Draw next card from Reserve Deck.
- **Scoring Formulas:**
  - Card Moved from Waste to Tableau: $+25$ points.
  - Face-Down Tableau Card Revealed: $+50$ points.
  - Card Placed in Foundation: $+150$ points.
  - Foundation Completed (Rank 7): $+1000$ points.
  - Full Deck Decryption Victory: $+3000$ points.
- **Difficulty Levels & Progression:**
  - **Easy:** Draw 1 card at a time from deck; unlimited redeals; all tableau cards dealt face-up.
  - **Medium:** Draw 1 card; 3 deck redeals allowed; hidden tableau cards face-down.
  - **Hard:** Draw 2 cards; single deck pass (no redeals); strict 150-move limit.
- **Win / Lose Conditions:**
  - **Win:** Transfer all 28 cards into the Foundations.
  - **Lose:** No legal moves remain and deck is exhausted, or move limit reached.
- **High Score Criteria:** Time to completion + Move count efficiency + Foundations cleared.

---

## 23. ReflexRush

```
===================================
     >>> PRESS [A] NOW! <<<
===================================
[ # # # # # # # # # . . . . . . . ]
React Window: 480ms   Streak: x8
Current Time: 182ms -> GODLIKE!
```

- **Game ID:** `reflex-rush`
- **Category:** Neural Synapse Reflex Evaluator
- **Lore & Theme:** Neural Synapse Reflex Evaluator. Test your cognitive reaction speeds against an escalating barrage of randomized split-second micro-challenges designed to push human response limits.
- **Playfield & Visual Representation:**
  - 10×20 grid.
  - Central display shows an urgent directive glyph (e.g. Arrow pointing Left, large `[A]` icon, `[B]` icon, or "HOLD" bar).
  - A rapidly shrinking countdown bar displays remaining milliseconds across rows `16..17`.
  - Flashing screen flash and audio chime confirms split-second success or failure.
- **Rules & Mechanics:**
  - The console presents randomized rapid-fire imperative prompts in rapid succession:
    1. *"PRESS A!"* -> Tap Button A immediately.
    2. *"DODGE RIGHT!"* -> Tap D-Pad Right.
    3. *"TAP B 3 TIMES!"* -> Rapidly mash Button B 3 times.
    4. *"HOLD UP!"* -> Press and hold D-Pad Up until buzzer sounds.
    5. *"FAKE-OUT (DO NOT PRESS)!"* -> Hands off all buttons!
  - Player has a strict countdown window (from 1200ms down to 350ms) to execute the command.
  - Pressing the wrong button, reacting too slowly, or moving during a Fake-Out costs 1 life.
  - Every 5 consecutive successes triggers a "Speed Rush", accelerating the challenge tempo.
  - **Duo Mode (2-Player Quick-Draw Duel)**: In Duo Mode, ReflexRush transforms into a western-style quick-draw duel! When the visual buzzer triggers, Player 1 strikes `Space` and Player 2 strikes `Enter`. The first player whose signal registers wins the round; false starts hand the point to the opponent!
- **Handheld Controls:**
  - Contextual based on on-screen directive:
    - **D-Pad Up / Down / Left / Right:** Directional evasion/prompts.
    - **Button A:** Primary reflex strike.
    - **Button B:** Rapid secondary mashing / defensive parry.
- **Scoring Formulas:**
  - Base Challenge Clear: $+100$ points.
  - Latency Speed Bonus: $\text{Remaining Reaction Milliseconds} \times 2$ points.
  - Sub-200ms "Godlike Reflex" Bonus: $+250$ points.
  - Flawless Streak Milestone (every 5 tests): $+500 \times \text{Streak Tier}$.
- **Difficulty Levels & Progression:**
  - **Easy:** 1200ms reaction window; clear advance warning audio cues; no fake-outs; 4 lives.
  - **Medium:** 800ms down to 500ms window; deceptive fake-outs included; 3 lives.
  - **Hard:** 500ms down to 320ms window; inverted prompts ("DO NOT TAP A"); ultra-fast tempo; 2 lives.
- **Win / Lose Conditions:**
  - **Win:** Clear 50 consecutive reflex trials.
  - **Lose:** Deplete all player lives.
- **High Score Criteria:** Average reaction latency (ms) + Peak reflex streak + Hard tier trials completed.

---

## Catalog Design Principles & Legal Originality Statement

1. **Zero Trademark / Copyright Infringement:**
   - Every game in this catalog features an entirely unique title, original thematic lore, customized scoring formulas, and distinct mechanics.
   - Traditional arcade archetypes (such as falling blocks, snake, paddle bouncing, racing, and space shooting) have been re-engineered from the ground up with fresh original twists (e.g., Wind Shear, EMP Horn, Quantum Cascade, English Curve Slice, Ghost Phase, and Overcharge Chips).
2. **Harmonized 10×20 LCD Grid Experience:**
   - All games share the identical virtual 10×20 coordinate system and 2-bit pixel state paradigm (`0`: Off, `1`: Solid, `2`: Blink).
   - This guarantees uniform rendering, consistent physical bezel integration, and identical touch/keypad mapping across the entire 23-game library.
3. **Deterministic Fair Play:**
   - Randomness is seeded cleanly; physics loops run at fixed 60Hz ticks; difficulty curves are mathematically structured to reward skill, reflexes, and strategic planning.
