/**
 * Retro Brick Game Console - GameRegistry
 * Central catalog registering all 23 original games with metadata and factory instantiation.
 */

import { BrickStacker } from '../games/BrickStacker.js';
import { TurboHighway } from '../games/TurboHighway.js';
import { IronTanks } from '../games/IronTanks.js';
import { CyberViper } from '../games/CyberViper.js';
import { FallingPoly } from '../games/FallingPoly.js';
import { CosmoDefender } from '../games/CosmoDefender.js';
import { BounceDuel } from '../games/BounceDuel.js';
import { TileMemory } from '../games/TileMemory.js';
import { LabyrinthEscape } from '../games/LabyrinthEscape.js';
import { Froggero } from '../games/Froggero.js';
import { MoleHammer } from '../games/MoleHammer.js';
import { ChromaPulse } from '../games/ChromaPulse.js';
import { GridTactics } from '../games/GridTactics.js';
import { FourInLine } from '../games/FourInLine.js';
import { MineScanner } from '../games/MineScanner.js';
import { Matrix2048 } from '../games/Matrix2048.js';
import { AeroGlider } from '../games/AeroGlider.js';
import { BrickBreaker } from '../games/BrickBreaker.js';
import { PinballBounce } from '../games/PinballBounce.js';
import { SprintEscape } from '../games/SprintEscape.js';
import { OrbPop } from '../games/OrbPop.js';
import { SolitaireLite } from '../games/SolitaireLite.js';
import { ReflexRush } from '../games/ReflexRush.js';

const CATALOG_DATA = [
  {
    id: 'brick-stacker',
    title: 'Brick Stacker',
    category: 'Puzzle',
    description: 'Stack oscillating girders to erect high-rise skyscrapers. Shear off overhangs with pixel precision!',
    controls: [
      { button: 'A / Down', action: 'Lock Girder' },
      { button: 'B', action: 'Precision Brake' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'stacker',
    GameClass: BrickStacker
  },
  {
    id: 'turbo-highway',
    title: 'Turbo Highway',
    category: 'Racing',
    description: 'Weave through congested midnight traffic at blistering velocities with nitro boost and EMP horn.',
    controls: [
      { button: 'Left / Right', action: 'Steer Lane' },
      { button: 'Up / Down', action: 'Nitro / Brake' },
      { button: 'A', action: 'EMP Horn' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'racer',
    GameClass: TurboHighway
  },
  {
    id: 'iron-tanks',
    title: 'Iron Tanks',
    category: 'Action',
    description: 'Defend the subterranean Power Core from waves of autonomous rogue drone tanks with heavy cannon fire.',
    controls: [
      { button: 'D-Pad', action: 'Drive & Aim' },
      { button: 'A', action: 'Fire Cannon' },
      { button: 'B', action: 'Decoy Barrier' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'tank',
    GameClass: IronTanks
  },
  {
    id: 'cyber-viper',
    title: 'Cyber Viper',
    category: 'Arcade',
    description: 'Navigate quantum CPU circuitry, snatching overcharge data chips while dodging lethal glitches.',
    controls: [
      { button: 'D-Pad', action: 'Steer Viper' },
      { button: 'A', action: 'Turbo Sprint' },
      { button: 'B', action: 'Sonar Pulse' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'viper',
    GameClass: CyberViper
  },
  {
    id: 'falling-poly',
    title: 'Falling Poly',
    category: 'Puzzle',
    description: 'Lock falling geometric polyominoes into solid horizontal rows to trigger Quantum Cascades.',
    controls: [
      { button: 'Left / Right', action: 'Shift' },
      { button: 'Down / Up', action: 'Soft / Hard Drop' },
      { button: 'A / B', action: 'Rotate CW / CCW' },
      { button: 'Select', action: 'Hold Piece' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'poly',
    GameClass: FallingPoly
  },
  {
    id: 'cosmo-defender',
    title: 'Cosmo Defender',
    category: 'Shooter',
    description: 'Repel invading alien bio-swarms and dive-bombing drones using dual plasma cannons and EMP shockwaves.',
    controls: [
      { button: 'D-Pad', action: 'Maneuver Cruiser' },
      { button: 'A', action: 'Fire Lasers' },
      { button: 'B', action: 'EMP Shockwave' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'ship',
    GameClass: CosmoDefender
  },
  {
    id: 'bounce-duel',
    title: 'Bounce Duel',
    category: 'Sports',
    description: 'High-speed zero-g kinetic paddle deflector duel featuring English curve slice and smash spikes.',
    controls: [
      { button: 'Left / Right', action: 'Move Paddle' },
      { button: 'A', action: 'Smash Strike' },
      { button: 'B', action: 'English Curve' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'pong',
    GameClass: BounceDuel
  },
  {
    id: 'tile-memory',
    title: 'Tile Memory',
    category: 'Puzzle',
    description: 'Decrypt cryptographic vault matrices by pairing matching ancient rune glyphs under time pressure.',
    controls: [
      { button: 'D-Pad', action: 'Move Cursor' },
      { button: 'A', action: 'Flip Tile' },
      { button: 'B', action: 'Peek Sonar' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'memory',
    GameClass: TileMemory
  },
  {
    id: 'labyrinth-escape',
    title: 'Labyrinth Escape',
    category: 'Adventure',
    description: 'Infiltrate procedurally generated subterranean bunker mazes, extract security keycards, and escape.',
    controls: [
      { button: 'D-Pad', action: 'Navigate Corridors' },
      { button: 'A', action: 'Interact / Collect' },
      { button: 'B', action: 'Sonar Ping' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'maze',
    GameClass: LabyrinthEscape
  },
  {
    id: 'froggero',
    title: 'Froggero',
    category: 'Arcade',
    description: 'Guide a leaping bionic toad across multi-lane highways and rushing canals into safe docking bays.',
    controls: [
      { button: 'D-Pad', action: 'Hop Movement' },
      { button: 'A', action: 'Super Leap' },
      { button: 'B', action: 'Tongue Snap' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'frog',
    GameClass: Froggero
  },
  {
    id: 'mole-hammer',
    title: 'Mole Hammer',
    category: 'Action',
    description: 'Whack rogue conduit bots and golden frenzy bots while avoiding radioactive hazard coils.',
    controls: [
      { button: 'D-Pad', action: 'Aim Reticle' },
      { button: 'A', action: 'Hammer Strike' },
      { button: 'B', action: 'Sweep Strike' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'hammer',
    GameClass: MoleHammer
  },
  {
    id: 'chroma-pulse',
    title: 'Chroma Pulse',
    category: 'Puzzle',
    description: 'Echo back escalating audio-visual resonance sequences across 4 quadrants with reverse echo rounds.',
    controls: [
      { button: 'D-Pad', action: 'Quadrant Input' },
      { button: 'B', action: 'Re-Listen Hint' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'simon',
    GameClass: ChromaPulse
  },
  {
    id: 'grid-tactics',
    title: 'Grid Tactics',
    category: 'Puzzle',
    description: 'Spatial vector alignment showdown against an intelligent minimax neural core in Best-of-5 rounds.',
    controls: [
      { button: 'D-Pad', action: 'Select Cell' },
      { button: 'A', action: 'Place Token' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'tictactoe',
    GameClass: GridTactics
  },
  {
    id: 'four-in-line',
    title: 'Four In Line',
    category: 'Puzzle',
    description: 'Drop gravity isotope spheres into vertical containment chutes to align 4 resonance conduits.',
    controls: [
      { button: 'Left / Right', action: 'Select Column' },
      { button: 'A', action: 'Drop Sphere' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'connect4',
    GameClass: FourInLine
  },
  {
    id: 'mine-scanner',
    title: 'Mine Scanner',
    category: 'Puzzle',
    description: 'Demine seismic planetary grids with first-click protection, recursive flood fill, and flag markers.',
    controls: [
      { button: 'D-Pad', action: 'Move Scanner' },
      { button: 'A', action: 'Reveal Cell' },
      { button: 'B', action: 'Toggle Flag' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'mine',
    GameClass: MineScanner
  },
  {
    id: 'matrix-2048',
    title: 'Matrix 2048',
    category: 'Puzzle',
    description: 'Compress identical isotopic elements under 4-way magnetic sliding force to synthesize element 2048.',
    controls: [
      { button: 'D-Pad', action: 'Slide Grid' },
      { button: 'B', action: 'Quantum Undo' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: '2048',
    GameClass: Matrix2048
  },
  {
    id: 'aero-glider',
    title: 'Aero Glider',
    category: 'Arcade',
    description: 'Pilot an ion glider through a storm canyon dodging high-voltage lightning pylons with air brakes.',
    controls: [
      { button: 'A / Up', action: 'Flap Impulse' },
      { button: 'B / Down', action: 'Air Brake' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'glider',
    GameClass: AeroGlider
  },
  {
    id: 'brick-breaker',
    title: 'Brick Breaker',
    category: 'Arcade',
    description: 'Demolish multi-hit orbital cosmic brick formations with a repulsor paddle and falling power capsules.',
    controls: [
      { button: 'Left / Right', action: 'Move Paddle' },
      { button: 'A', action: 'Launch Ball' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'breakout',
    GameClass: BrickBreaker
  },
  {
    id: 'pinball-bounce',
    title: 'Pinball Bounce',
    category: 'Arcade',
    description: 'Propel metallic spheres across an arcade table with pop bumpers, drop target banks, and flippers.',
    controls: [
      { button: 'Left', action: 'Left Flipper' },
      { button: 'A', action: 'Right Flipper' },
      { button: 'Down', action: 'Pull Plunger' },
      { button: 'Up / B', action: 'Nudge Table' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'pinball',
    GameClass: PinballBounce
  },
  {
    id: 'sprint-escape',
    title: 'Sprint Escape',
    category: 'Runner',
    description: 'Dash across dystopian rooftops escaping rogue enforcers with gap double-jumps and conduit slides.',
    controls: [
      { button: 'A / Up', action: 'Jump / Double Jump' },
      { button: 'B / Down', action: 'Low Slide' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'runner',
    GameClass: SprintEscape
  },
  {
    id: 'orb-pop',
    title: 'Orb Pop',
    category: 'Puzzle',
    description: 'Fire elemental orbs with ricochet aiming to match 3+ clusters and trigger massive avalanches.',
    controls: [
      { button: 'Left / Right', action: 'Aim Cannon' },
      { button: 'A', action: 'Launch Orb' },
      { button: 'B', action: 'Swap Orb' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'bubble',
    GameClass: OrbPop
  },
  {
    id: 'solitaire-lite',
    title: 'Solitaire Lite',
    category: 'Card',
    description: 'Defrag micro-data cards in 4 tableau columns and sort into foundations before security lockdown.',
    controls: [
      { button: 'D-Pad', action: 'Navigate Deck' },
      { button: 'A', action: 'Select / Move Card' },
      { button: 'B', action: 'Auto-Foundation' },
      { button: 'Select', action: 'Draw Card' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'card',
    GameClass: SolitaireLite
  },
  {
    id: 'reflex-rush',
    title: 'Reflex Rush',
    category: 'Action',
    description: 'Test human reaction limits against split-second micro-challenges, fake-outs, and rapid-fire inputs.',
    controls: [
      { button: 'Contextual', action: 'Follow Directive' },
      { button: 'A / B / D-Pad', action: 'Execute Prompt' }
    ],
    difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
    icon: 'reflex',
    GameClass: ReflexRush
  }
];

class GameRegistryImpl {
  constructor() {
    this.games = new Map();
    for (const item of CATALOG_DATA) {
      this.register(item);
    }
  }

  /**
   * Registers a game cartridge metadata and class constructor.
   * @param {Object} metadata 
   */
  register(metadata) {
    if (!metadata || !metadata.id) {
      throw new Error('[GameRegistry] Invalid game metadata registration');
    }
    this.games.set(metadata.id, metadata);
  }

  /**
   * Retrieves game metadata by ID.
   * @param {string} id 
   * @returns {Object|null}
   */
  getGameInfo(id) {
    return this.games.get(id) || null;
  }

  /**
   * Alias for getGameInfo.
   * @param {string} id 
   * @returns {Object|null}
   */
  getGame(id) {
    return this.getGameInfo(id);
  }

  /**
   * Returns list of unique categories.
   * @returns {Array<string>}
   */
  getCategories() {
    return Array.from(new Set(this.getAllGames().map(g => g.category)));
  }

  /**
   * Get game by index with wraparound.
   * @param {number} index 
   * @returns {Object}
   */
  getGameByIndex(index) {
    const all = this.getAllGames();
    if (all.length === 0) return null;
    const normalized = ((index % all.length) + all.length) % all.length;
    return all[normalized];
  }

  /**
   * Returns list of all registered game metadata.
   * @returns {Array<Object>}
   */
  getAllGames() {
    return Array.from(this.games.values());
  }

  /**
   * Returns registered games filtered by genre category.
   * @param {string} category 
   * @returns {Array<Object>}
   */
  getGamesByCategory(category) {
    return this.getAllGames().filter(g => g.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Factory function that instantiates a game cartridge by ID.
   * @param {string} id 
   * @returns {import('./BaseGame.js').BaseGame|null}
   */
  createGame(id) {
    const meta = this.games.get(id);
    if (!meta || !meta.GameClass) {
      return null;
    }
    return new meta.GameClass();
  }

  /**
   * Returns true if game ID is registered.
   * @param {string} id 
   * @returns {boolean}
   */
  hasGame(id) {
    return this.games.has(id);
  }
}

export { GameRegistryImpl };
export const GameRegistry = new GameRegistryImpl();
export default GameRegistry;
