/**
 * Retro Brick Game Console - BaseGame
 * Abstract base class defining the 7-method contract and helper utilities for all 23 games.
 */

export class BaseGame {
  /**
   * @param {string} id Unique game identifier (e.g. 'brick-stacker')
   * @param {string} title Display title (e.g. 'Brick Stacker')
   * @param {string} [category='Arcade'] Genre category
   */
  constructor(id, title, category = 'Arcade') {
    this.id = id;
    this.title = title;
    this.category = category;
    this.context = null;
    this.isPaused = false;
    this.isOver = false;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.initialLives = 3;
  }

  /**
   * Initialize game state, cache context, setup entities and difficulty parameters.
   * @param {Object} context The console GameContext
   */
  init(context) {
    this.context = context;
    this.isPaused = false;
    this.isOver = false;
    this.score = 0;
    this.level = 1;

    // Determine initial lives by difficulty
    const diff = context && context.difficulty ? context.difficulty : 'MEDIUM';
    if (diff === 'EASY') {
      this.initialLives = 4;
    } else if (diff === 'HARD') {
      this.initialLives = 2;
    } else {
      this.initialLives = 3;
    }
    this.lives = this.initialLives;

    if (this.context) {
      if (typeof this.context.onLivesChange === 'function') {
        this.context.onLivesChange(this.lives);
      }
      if (typeof this.context.onLevelUp === 'function') {
        this.context.onLevelUp(this.level);
      }
    }
  }

  /**
   * Physics, input, and game state update tick.
   * @param {number} deltaTime Elapsed time in seconds
   */
  update(deltaTime) {
    if (this.isPaused || this.isOver) return;
  }

  /**
   * Virtual LCD render tick.
   * @param {Object} context The console GameContext
   */
  render(context) {
    if (context && context.renderer) {
      context.renderer.clear();
    }
  }

  /**
   * Reset game to level 1 clean state.
   */
  reset() {
    this.init(this.context);
  }

  /**
   * Pause gameplay.
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume gameplay.
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Teardown and cleanup.
   */
  destroy() {
    this.isPaused = true;
    this.isOver = true;
    this.context = null;
  }

  /**
   * Returns current difficulty multiplier.
   * @returns {number}
   */
  getDifficultyMultiplier() {
    const diff = this.context && this.context.difficulty ? this.context.difficulty : 'MEDIUM';
    if (diff === 'EASY') return 1.0;
    if (diff === 'HARD') return 2.5;
    return 1.5;
  }

  /**
   * Award points scaled by difficulty multiplier.
   * @param {number} basePoints 
   */
  addScore(basePoints) {
    if (typeof basePoints !== 'number' || isNaN(basePoints)) return;
    const mult = this.getDifficultyMultiplier();
    const points = Math.max(1, Math.round(basePoints * mult));
    this.score += points;
    if (this.context && typeof this.context.onScore === 'function') {
      this.context.onScore(points);
    }
  }

  /**
   * Emits score points (alias for addScore).
   * @param {number} points 
   */
  emitScore(points) {
    this.addScore(points);
  }

  /**
   * Updates level and notifies platform.
   * @param {number} lvl 
   */
  emitLevel(lvl) {
    this.level = lvl;
    if (this.context) {
      if (typeof this.context.onLevelUp === 'function') {
        this.context.onLevelUp(this.level);
      }
      if (this.context.sound && typeof this.context.sound.playLevelUp === 'function') {
        this.context.sound.playLevelUp();
      }
    }
  }

  /**
   * Updates lives and notifies platform.
   * @param {number} lives 
   */
  emitLives(lives) {
    this.lives = Math.max(0, lives);
    if (this.context && typeof this.context.onLivesChange === 'function') {
      this.context.onLivesChange(this.lives);
    }
  }

  /**
   * Helper to set a pixel on the context renderer.
   * @param {number} x 
   * @param {number} y 
   * @param {0|1|2} state 
   */
  setPixel(x, y, state = 1) {
    if (this.context && this.context.renderer) {
      this.context.renderer.setPixel(x, y, state);
    }
  }

  /**
   * Helper to get a pixel state from the context renderer.
   * @param {number} x 
   * @param {number} y 
   * @returns {number}
   */
  getPixel(x, y) {
    if (this.context && this.context.renderer) {
      return this.context.renderer.getPixel(x, y);
    }
    return 0;
  }

  /**
   * Helper to clear renderer grid.
   */
  clearGrid() {
    if (this.context && this.context.renderer) {
      this.context.renderer.clear();
    }
  }

  /**
   * Helper to check if a pixel is solid (1).
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  isSolid(x, y) {
    return this.getPixel(x, y) === 1;
  }

  /**
   * Handles terminal game over sequence.
   */
  gameOver() {
    if (this.isOver) return;
    this.isOver = true;

    if (this.context) {
      if (this.context.storage && typeof this.context.storage.setHighScore === 'function') {
        this.context.storage.setHighScore(this.id, this.score);
      }
      if (this.context.sound && typeof this.context.sound.playGameOver === 'function') {
        this.context.sound.playGameOver();
      }
      if (typeof this.context.onGameOver === 'function') {
        this.context.onGameOver(this.score);
      }
    }
  }

  /**
   * Alias for gameOver().
   * @param {number} [score] 
   */
  emitGameOver(score) {
    if (typeof score === 'number') {
      this.score = score;
    }
    this.gameOver();
  }
}
