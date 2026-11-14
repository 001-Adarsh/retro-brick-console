/**
 * Retro Brick Game Console - Engine
 * Fixed-timestep 60Hz loop orchestrating hardware abstraction, renderer,
 * sound, storage, input, HUD, and active game cartridges.
 */

import { CanvasRenderer } from './CanvasRenderer.js';
import { StorageManager } from './StorageManager.js';
import { GameRegistry } from './GameRegistry.js';

export const EngineState = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

export const FIXED_DT = 1 / 60; // 60Hz logic tick (~0.01667s)
export const MAX_FRAME_TIME = 0.1; // 100ms cap to prevent spiral of death

const _requestAnimationFrame = typeof requestAnimationFrame === 'function' 
  ? requestAnimationFrame 
  : (cb) => setTimeout(() => cb(typeof performance !== 'undefined' ? performance.now() : Date.now()), 16);

const _cancelAnimationFrame = typeof cancelAnimationFrame === 'function'
  ? cancelAnimationFrame
  : (id) => clearTimeout(id);

export class Engine {
  /**
   * @param {Object} options
   * @param {HTMLCanvasElement} [options.canvas]
   * @param {HTMLCanvasElement} [options.subCanvas]
   * @param {Object} [options.input]
   * @param {Object} [options.sound]
   * @param {StorageManager} [options.storage]
   * @param {Object} [options.hud]
   * @param {Object} [options.callbacks]
   */
  constructor(options = {}) {
    this.canvas = options.canvas || null;
    this.subCanvas = options.subCanvas || null;
    this.input = options.input || this._createMockInput();
    this.sound = options.sound || this._createMockSound();
    this.storage = options.storage || new StorageManager();
    this.hud = options.hud || null;
    this.callbacks = options.callbacks || {};

    // Virtual LCD Renderers
    this.renderer = new CanvasRenderer(this.canvas, { cols: 10, rows: 20 });
    this.subRenderer = this.subCanvas ? new CanvasRenderer(this.subCanvas, { cols: 4, rows: 4, drawGhostGrid: false }) : null;

    // Loop state
    this.state = EngineState.IDLE;
    this.activeGame = null;
    this.activeGameId = null;
    this.difficulty = this.storage.getSettings().difficulty || 'MEDIUM';

    this.rafId = null;
    this.lastTime = 0;
    this.accumulator = 0;

    this._loop = this._loop.bind(this);
  }

  /**
   * Returns current engine state.
   * @returns {string}
   */
  getState() {
    return this.state;
  }

  /**
   * Updates console difficulty setting.
   * @param {'EASY'|'MEDIUM'|'HARD'} difficulty 
   */
  setDifficulty(difficulty) {
    if (['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      this.difficulty = difficulty;
      this.storage.saveSettings({ difficulty });
      if (this.activeGame && !this.activeGame.isOver) {
        this.activeGame.init(this.getContext());
      }
    }
  }

  /**
   * Loads a game cartridge by ID.
   * @param {string} gameId 
   * @returns {boolean}
   */
  loadGame(gameId) {
    if (this.activeGame) {
      this.unloadGame();
    }

    const gameInstance = GameRegistry.createGame(gameId);
    if (!gameInstance) {
      console.error(`[Engine] Game ID not found: ${gameId}`);
      return false;
    }

    this.activeGame = gameInstance;
    this.activeGameId = gameId;

    // Initialize game with injected context
    const context = this.getContext();
    this.activeGame.init(context);

    this.state = EngineState.RUNNING;
    this._notifyStateChange(EngineState.RUNNING);

    if (this.callbacks.onGameChange) {
      this.callbacks.onGameChange(this.activeGame);
    }

    this.start();
    return true;
  }

  /**
   * Unloads and destroys active game cartridge.
   */
  unloadGame() {
    if (this.activeGame) {
      try {
        this.activeGame.destroy();
      } catch (e) {
        console.error('[Engine] Error destroying active game:', e);
      }
      this.activeGame = null;
      this.activeGameId = null;
    }

    if (this.renderer) {
      this.renderer.clear();
      this.renderer.render();
    }
    if (this.subRenderer) {
      this.subRenderer.clear();
      this.subRenderer.render();
    }
    if (this.hud && typeof this.hud.clearNextPiece === 'function') {
      this.hud.clearNextPiece();
    }

    this.state = EngineState.IDLE;
    this._notifyStateChange(EngineState.IDLE);
  }

  /**
   * Starts or resumes the game loop.
   */
  start() {
    if (this.rafId === null) {
      this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this.accumulator = 0;
      this.rafId = _requestAnimationFrame(this._loop);
    }
    if (this.activeGame && this.state === EngineState.PAUSED) {
      this.resume();
    }
  }

  /**
   * Stops the game loop RAF.
   */
  stop() {
    if (this.rafId !== null) {
      _cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Pauses active gameplay.
   */
  pause() {
    if (this.state === EngineState.RUNNING) {
      this.state = EngineState.PAUSED;
      if (this.activeGame) {
        this.activeGame.pause();
      }
      this._notifyStateChange(EngineState.PAUSED);
    }
  }

  /**
   * Resumes active gameplay from paused state.
   */
  resume() {
    if (this.state === EngineState.PAUSED) {
      this.state = EngineState.RUNNING;
      if (this.activeGame) {
        this.activeGame.resume();
      }
      this.lastTime = performance.now();
      this.accumulator = 0;
      this._notifyStateChange(EngineState.RUNNING);
    }
  }

  /**
   * Restarts current active game.
   */
  restart() {
    if (this.activeGame) {
      this.activeGame.reset();
      this.state = EngineState.RUNNING;
      this.lastTime = performance.now();
      this.accumulator = 0;
      this._notifyStateChange(EngineState.RUNNING);
    }
  }

  /**
   * Constructs the full GameContext object injected into games.
   * @returns {Object}
   */
  getContext() {
    return {
      canvas: this.canvas,
      ctx: this.renderer ? this.renderer.ctx : null,
      renderer: this.renderer,
      subRenderer: this.subRenderer,
      input: this.input,
      sound: this.sound,
      storage: this.storage,
      ui: {
        showMessage: (text, durationMs) => {
          if (this.hud && typeof this.hud.showMessage === 'function') {
            this.hud.showMessage(text, durationMs);
          }
        },
        showNextPiece: (matrix) => {
          if (this.subRenderer) {
            this.subRenderer.clear();
            this.subRenderer.drawMatrix(matrix, 0, 0, 1);
            this.subRenderer.render();
          }
          if (this.hud && typeof this.hud.showNextPiece === 'function') {
            this.hud.showNextPiece(matrix);
          }
        },
        clearNextPiece: () => {
          if (this.subRenderer) {
            this.subRenderer.clear();
            this.subRenderer.render();
          }
          if (this.hud && typeof this.hud.clearNextPiece === 'function') {
            this.hud.clearNextPiece();
          }
        },
        showAuxiliary: (value) => {
          if (this.hud && typeof this.hud.showAuxiliary === 'function') {
            this.hud.showAuxiliary(value);
          }
        }
      },
      difficulty: this.difficulty,
      onScore: (points) => this._handleScore(points),
      onGameOver: (finalScore) => this._handleGameOver(finalScore),
      onLevelUp: (newLevel) => this._handleLevelUp(newLevel),
      onLivesChange: (lives) => this._handleLivesChange(lives)
    };
  }

  /**
   * Internal loop: processes fixed timestep updates + dynamic rendering.
   * @private
   * @param {number} currentTime 
   */
  _loop(currentTime) {
    this.rafId = _requestAnimationFrame(this._loop);

    const frameDelta = Math.min((currentTime - this.lastTime) / 1000, MAX_FRAME_TIME);
    this.lastTime = currentTime;

    if (this.state === EngineState.RUNNING) {
      this.accumulator += frameDelta;

      while (this.accumulator >= FIXED_DT) {
        this._update(FIXED_DT);
        this.accumulator -= FIXED_DT;
      }
    }

    this._render();
  }

  /**
   * Update tick.
   * @private
   * @param {number} dt 
   */
  _update(dt) {
    if (this.renderer) {
      this.renderer.updateBlink(dt);
    }
    if (this.subRenderer) {
      this.subRenderer.updateBlink(dt);
    }

    if (this.activeGame && !this.activeGame.isPaused && !this.activeGame.isOver) {
      this.activeGame.update(dt);
    }

    if (this.input && typeof this.input.update === 'function') {
      this.input.update();
    }
  }

  /**
   * Render tick.
   * @private
   */
  _render() {
    if (this.activeGame) {
      this.activeGame.render(this.getContext());
    }

    if (this.renderer) {
      this.renderer.render();
    }
    if (this.subRenderer) {
      this.subRenderer.render();
    }
  }

  // --- Internal Event Handlers ---

  _handleScore(points) {
    if (this.callbacks.onScore) {
      this.callbacks.onScore(points, this.activeGame ? this.activeGame.score : 0);
    }
    if (this.hud && typeof this.hud.setScore === 'function') {
      this.hud.setScore(this.activeGame ? this.activeGame.score : 0);
    }
  }

  _handleGameOver(finalScore) {
    this.state = EngineState.GAME_OVER;
    if (this.activeGameId) {
      this.storage.setHighScore(this.activeGameId, finalScore);
    }
    if (this.callbacks.onGameOver) {
      this.callbacks.onGameOver(finalScore);
    }
    if (this.hud && typeof this.hud.showGameOver === 'function') {
      this.hud.showGameOver(finalScore);
    }
    this._notifyStateChange(EngineState.GAME_OVER);
  }

  _handleLevelUp(newLevel) {
    if (this.callbacks.onLevelUp) {
      this.callbacks.onLevelUp(newLevel);
    }
    if (this.hud && typeof this.hud.setLevel === 'function') {
      this.hud.setLevel(newLevel);
    }
  }

  _handleLivesChange(lives) {
    if (this.callbacks.onLivesChange) {
      this.callbacks.onLivesChange(lives);
    }
    if (this.hud && typeof this.hud.setLives === 'function') {
      this.hud.setLives(lives);
    }
  }

  _notifyStateChange(newState) {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(newState);
    }
  }

  // --- Fallback Safe Mocks ---

  _createMockInput() {
    return {
      isDown: () => false,
      isJustPressed: () => false,
      isJustReleased: () => false,
      checkAutoRepeat: () => false,
      consume: () => {},
      update: () => {}
    };
  }

  _createMockSound() {
    return {
      playMove: () => {},
      playRotate: () => {},
      playDrop: () => {},
      playScore: () => {},
      playLevelUp: () => {},
      playGameOver: () => {},
      playShoot: () => {},
      playExplosion: () => {},
      playBounce: () => {},
      playVictory: () => {},
      playTone: () => {},
      toggleMute: () => false,
      isMuted: () => false,
      setVolume: () => {}
    };
  }
}
