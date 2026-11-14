# 🎮 Retro Brick Game Console (23-in-1 Handheld LCD Emulator)

[![Render Static Site](https://img.shields.io/badge/Deploy-Render%20Static%20Site-46E3B7?logo=render&logoColor=white)](https://render.com)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Vanilla JS](https://img.shields.io/badge/Code-Vanilla%20ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Audio-Pure%20Web%20Audio%20API-FF69B4)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Tests](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Cost](https://img.shields.io/badge/Runtime%20Hosting%20Cost-%240.00-brightgreen)](#deployment)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An authentic, responsive browser-based emulation of the iconic 1980s/1990s monochrome dot-matrix brick game handheld. Features **23 completely original classic games**, genuine tactile casing and controls, retro LCD visual themes, dynamic audio chiptune synthesis via Web Audio API, and zero external runtime dependencies.

---

## 📑 Table of Contents

- [Overview & Aesthetics](#-overview--aesthetics)
- [Key Features](#-key-features)
- [The 23-Game Catalog](#-the-23-game-catalog)
- [Console Controls & Input System](#-console-controls--input-system)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Automated Testing & Quality Gates](#-automated-testing--quality-gates)
- [Deployment (Render Static Site)](#-deployment-render-static-site)
- [GitButler Virtual Branch Workflow](#-gitbutler-virtual-branch-workflow)
- [Legal Compliance & Originality](#-legal-compliance--originality)
- [License](#-license)

---

## 🕹 Overview & Aesthetics

The **Retro Brick Game Console** recreates the look, tactile feel, sound, and gameplay of vintage LCD handheld gaming systems. Rendered upon a simulated dot-matrix grid with customizable sub-pixel LCD artifacts, authentic ghosting, and pixel margins, it provides instant nostalgia with modern web performance.

### Visual Authenticity
- **Simulated Dot-Matrix Grid**: Precise 10×20 and 20×20 active LCD brick matrices with individual pixel borders and inactive ghost pixel states.
- **Multiple Vintage LCD Color Palettes**:
  - **Classic Pea Soup Green**: Authentic 1989 monochrome handheld tone.
  - **Pocket Monochrome Gray**: High-contrast clean LCD gray.
  - **Amber Cyber**: 1980s retro terminal amber phosphor.
  - **Backlit Aqua Blue**: Cool electroluminescent backlight tone.
  - **High-Contrast Dark Matrix**: Inverted OLED-style high-readability mode.
- **Physical Handheld Chassis**: Realistic plastic textured casing, speaker cutout vents, directional D-Pad, angled action buttons, and recessed LCD bezel with protective screen lens.

---

## ✨ Key Features

- **23 Full-Featured Games**: Fully playable original titles spanning arcade, puzzle, racing, shooting, action, and logic genres.
- **Zero Runtime Dependencies**: Pure Vanilla ES6+ JavaScript and HTML5 Canvas. No heavy frameworks (0 KB React/Vue overhead).
- **100% Pure Web Audio API Chiptune Engine**: Zero external MP3/WAV/OGG downloads. Every beep, boop, explosion, and melody is synthesized in real time using square waves, triangle waves, and white noise bursts.
- **Universal Multi-Input Controller**:
  - Physical Keyboard bindings (`ArrowKeys`, `WASD`, `Space`, `Enter`, `Escape`, `P`, `M`).
  - Virtual On-Screen Tactile Controls (Touch & Mouse with zero-delay `touch-action: manipulation`).
  - Standard HTML5 Gamepad API integration for USB/Bluetooth game controllers.
- **Persistent State**: High scores, user settings (audio volume, mute status, difficulty level, color theme) automatically saved to browser `localStorage`.
- **Responsive Layout**: Adapts seamlessly to mobile portrait, mobile landscape, tablet, desktop, and 4K viewports.
- **Zero-Cost Deployment**: Ready for 1-click continuous deployment on Render Static Site free tier.

---

## 🎮 The 23-Game Catalog

Each game implements the standardized `IGame` lifecycle contract (`init`, `update`, `render`, `reset`, `pause`, `resume`, `destroy`).

| # | Code | Title | Category | Description & Objective |
| :-: | :-: | :--- | :--- | :--- |
| **1** | `A` | **Tetro Classic** | Falling Puzzle | Rotate and slot falling geometric brick tetrominoes to clear horizontal rows. |
| **2** | `B` | **Brick Tank Battle** | Combat Arcade | Command an LCD tank, navigate destructible brick obstacles, and destroy enemy tanks while defending your base. |
| **3** | `C` | **Retro Formula Highway** | Racing | Steer across 3 lanes of oncoming traffic at escalating speeds. Avoid collisions to rack up points. |
| **4** | `D` | **Brick Snake Classic** | Action Reflex | Guide a growing dot-matrix snake to eat food pellets without colliding with borders or your own tail. |
| **5** | `E` | **Space Invaders Matrix** | Fixed Shooter | Pilot a laser cannon, dodge falling bombs, and eliminate rows of marching alien invaders before they reach bottom. |
| **6** | `F` | **Paddle Breakout** | Arcade Action | Deflect a bouncing ball using a bottom paddle to smash layered brick barriers and collect high scores. |
| **7** | `G` | **Pong Duel** | Sports Arcade | Classic 2-player rally simulation. Compete with your paddle against an adaptive CPU opponent. |
| **8** | `H` | **Flappy Glider** | Tap Reflex | Tap to flutter and maintain altitude while navigating narrow openings between vertical brick pillars. |
| **9** | `I` | **Frogger Crossing** | Arcade Crossing | Guide your character across treacherous multi-lane highways and floating log rivers to reach safety. |
| **10** | `J` | **Whack-a-Brick** | Reflex Test | Hit popping brick moles as they rapidly appear across matrix holes before time expires. |
| **11** | `K` | **Simon Sequence** | Memory Puzzle | Watch, remember, and replicate an ever-expanding sequence of tones and flashing quadrant lights. |
| **12** | `L` | **Memory Match** | Mind Puzzle | Flip paired brick patterns on the matrix and match all pairs in the fewest moves possible. |
| **13** | `M` | **Maze Runner** | Labyrinth | Navigate procedurally generated dot labyrinths to locate exit checkpoints under strict time limits. |
| **14** | `N` | **Galaxy Patrol** | Vertical Shooter | Maneuver a starship through asteroid belts and alien squadrons in continuous vertical combat. |
| **15** | `O` | **Endless Runner** | Platform Runner | Jump over spike pits and slide under low brick overhangs in a relentless side-scrolling obstacle run. |
| **16** | `P` | **2048 Brick Edition** | Number Puzzle | Slide and combine matching numbered brick blocks to build up to the coveted 2048 tile. |
| **17** | `Q` | **Tic-Tac-Toe LCD** | Strategy | Battle a smart Minimax-powered CPU opponent on a classic 3×3 LCD grid. |
| **18** | `R` | **Connect-4 Matrix** | Strategy | Drop colored tokens down vertical columns to achieve 4 consecutive connections horizontally, vertically, or diagonally. |
| **19** | `S` | **Minesweeper Grid** | Logic Deduction | Uncover safe tiles on a concealed grid using numerical clues while avoiding hidden explosive mines. |
| **20** | `T` | **Bubble Shooter Matrix** | Aim & Match | Aim the bottom launcher to fire colored bricks, matching 3 or more adjacent bricks to pop clusters. |
| **21** | `U` | **Card Solitaire Lite** | Card Strategy | Mini column card stacker adapted for clean 10×20 and 20×20 dot-matrix resolution. |
| **22** | `V` | **Reaction Test** | Precision Timing | Test raw human reaction speed. Await the random matrix flash and strike the Action button instantly. |
| **23** | `W` | **Alien Swarm** | Defensive Shooter | Defend an orbital perimeter against multi-directional incoming waves of extraterrestrial invaders. |

---

## 🎮 Console Controls & Input System

The console offers full parity between physical controls and on-screen virtual tactile buttons:

```
                      ┌──────────────────────────────┐
                      │    RETRO BRICK CONSOLE       │
                      │ ┌──────────────────────────┐ │
                      │ │  10x20 DOT MATRIX LCD    │ │
                      │ │                          │ │
                      │ └──────────────────────────┘ │
                      │                              │
                      │     [▲]              [B] [A] │
                      │  [◀]   [▶]                   │
                      │     [▼]                      │
                      │                              │
                      │  [SELECT] [START] [SOUND]    │
                      └──────────────────────────────┘
```

### Input Mapping Table

| Function | Virtual Button | Keyboard Key(s) | Gamepad Button |
| :--- | :--- | :--- | :--- |
| **D-Pad Up** | `UP` button | `ArrowUp` / `W` | D-Pad Up / Left Stick Up |
| **D-Pad Down** | `DOWN` button | `ArrowDown` / `S` | D-Pad Down / Left Stick Down |
| **D-Pad Left** | `LEFT` button | `ArrowLeft` / `A` | D-Pad Left / Left Stick Left |
| **D-Pad Right** | `RIGHT` button | `ArrowRight` / `D` | D-Pad Right / Left Stick Right |
| **Action A** (Rotate / Fire / Jump) | `A` button | `Space` / `Z` / `J` | Button 0 (A / Cross) |
| **Action B** (Secondary / Drop) | `B` button | `X` / `K` | Button 1 (B / Circle) |
| **Select** (Cycle Game / Options) | `SELECT` button | `Tab` / `Shift` / `C` | Back / Select |
| **Start / Pause** | `START` button | `Enter` / `P` | Start / Options |
| **Reset Game** | `RESET` button | `Escape` / `R` | Guide / Home |
| **Mute / Sound Toggle** | `SOUND` button | `M` | Right Shoulder |

---

## 🏛 Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Window                        │
├──────────────────────────────┬──────────────────────────────┤
│        Input Layer           │        Audio Engine          │
│  - Virtual Touch Buttons     │  - Web Audio Context         │
│  - Keyboard Listeners        │  - Square/Triangle Synth     │
│  - Gamepad API Poll          │  - White Noise Generator     │
├──────────────────────────────┼──────────────────────────────┤
│                      Core Game Engine                       │
│  - 60 FPS Fixed-Timestep Loop (`requestAnimationFrame`)    │
│  - Canvas 2D Dot-Matrix Renderer (10x20 & 20x20)           │
│  - State Machine & Game Registry                           │
│  - localStorage High Score & Settings Manager               │
├─────────────────────────────────────────────────────────────┤
│                      Game Modules                           │
│  Game A ─── Game B ─── Game C ─── ... ─── Game W (23 Games)  │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend Core**: Vanilla ES6+ modules (No framework dependencies).
- **Rendering Engine**: HTML5 Canvas 2D context optimized for crisp integer sub-pixel rendering.
- **Audio Synthesis**: Native Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `AudioBufferSourceNode`).
- **Build Tooling**: Vite 5 for instant Hot Module Replacement (HMR) and optimized rollup production bundles.
- **Testing**: Vitest with unit tests for game contracts, input routing, and rendering performance.

---

## 📁 Project Directory Structure

```
retro-brick-console/
├── .agents/                    # Agent specifications and collaboration roles
│   └── agents/                 # Subagent definitions (DevOps, Game, UI, Audio, QA)
├── docs/                       # Project documentation
│   ├── GITBUTLER_WORKFLOW.md   # GitButler virtual branch workflow guide
│   ├── GAME_CATALOG.md         # Comprehensive game design specifications
│   └── GAME_INTERFACE_SPEC.md  # Standard IGame interface definition
├── src/                        # Application source code
│   ├── index.html              # Main HTML entry point
│   ├── styles/                 # CSS stylesheets & theme variables
│   │   ├── main.css            # Layout, chassis, bezel, responsive styling
│   │   └── themes.css          # LCD palette definitions
│   └── js/                     # ES6+ JavaScript modules
│       ├── main.js             # Bootstrap & application initialization
│       ├── core/               # Engine core (Loop, Canvas, GameRegistry)
│       ├── audio/              # Web Audio chiptune synthesizer
│       ├── ui/                 # UI components, modals, HUD, input controller
│       └── games/              # 23 game implementations (GameA.js - GameW.js)
├── tests/                      # Automated Vitest test suite
│   ├── engine.test.js          # Core engine & loop tests
│   ├── games.test.js           # 23-game IGame contract compliance tests
│   └── audio.test.js           # Audio queue & synthesizer tests
├── .gitignore                  # Production git ignore configuration
├── render.yaml                 # Render Static Site Blueprint specification
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite bundler configuration
└── README.md                   # This project manual
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.x or 20.x LTS recommended)
- `npm` (v9 or later)

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/your-username/retro-brick-console.git
cd retro-brick-console

# 2. Install dependencies cleanly
npm install

# 3. Start local development server with Vite
npm run dev
```

Open your browser at `http://localhost:5173` to experience the console.

### Build for Production
```bash
# Generate optimized production bundle in dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Automated Testing & Quality Gates

Run the automated test suite using Vitest:

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate code coverage report
npm run test:coverage
```

### Verified Acceptance Criteria
1. **IGame Contract Compliance**: All 23 games strictly implement required lifecycle hooks (`init`, `update`, `render`, `reset`, `pause`, `resume`, `destroy`).
2. **60 FPS Performance Budget**: Matrix render loop stays comfortably under the 16.6ms frame budget.
3. **Audio Safety**: Web Audio context initializes cleanly upon user interaction without browser autoplay blocking.
4. **Offline Ready & Zero Runtime Cost**: No external API calls or third-party service dependencies.

---

## 🌐 Deployment (Render Static Site)

This project is configured as an Infrastructure-as-Code **Render Static Site** blueprint via [`render.yaml`](./render.yaml).

### Highlights
- **Zero Cost**: Runs entirely on Render's free tier with zero recurring hosting costs.
- **Global CDN**: Built assets in `dist/` are automatically cached across Render's global edge network.
- **Automated Previews**: Pull Request previews enabled automatically.
- **Security & Caching Headers**:
  - `Cache-Control: public, max-age=31536000, immutable` for static hashed assets in `/assets/*`.
  - `Cache-Control: no-cache, no-store, must-revalidate` for `index.html` ensuring instantaneous zero-downtime deployments.
  - Strict security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, and restrictive `Content-Security-Policy`.

### 1-Click Deployment via Render Dashboard
1. Push this repository to GitHub or GitLab.
2. In the Render Dashboard, click **New > Blueprint**.
3. Select your repository. Render automatically reads `render.yaml` and provisions the static site service.
4. Every push to the `main` branch automatically triggers a build and deploy.

---

## 🔀 GitButler Virtual Branch Workflow

This repository uses **GitButler Virtual Branches** for parallelized modular development across 7 dedicated streams:
- `chore/project-setup`
- `feat/console-ui`
- `feat/game-engine`
- `feat/games-catalog`
- `feat/audio-system`
- `test/quality`
- `chore/deployment`

For full branch architecture, dependency diagrams, commit message conventions, and CLI workflows, consult the [GitButler Workflow Guide](docs/GITBUTLER_WORKFLOW.md).

---

## ⚖ Legal Compliance & Originality

- **100% Originality Guardrail**: All game code, rule variations, layouts, visual assets, audio routines, and game titles are completely original.
- **Zero Trademark Infringement**: This software does not copy or infringe upon trademarked console brand names, proprietary game titles, or copyrighted commercial ROM assets.
- **Public Domain Retro Inspiration**: Designed as an original educational homage to 1980s/1990s vintage monochrome dot-matrix handheld electronics.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
