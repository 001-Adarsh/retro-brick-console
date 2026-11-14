import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseGame } from '../src/js/core/BaseGame.js';

describe('BaseGame Lifecycle & Contract', () => {
  let mockRenderer;
  let mockSound;
  let mockStorage;
  let mockContext;
  let game;

  beforeEach(() => {
    mockRenderer = {
      clear: vi.fn(),
      setPixel: vi.fn(),
      getPixel: vi.fn((x, y) => (x === 1 && y === 1 ? 1 : 0))
    };

    mockSound = {
      playGameOver: vi.fn(),
      playLevelUp: vi.fn(),
      playScore: vi.fn(),
      playMove: vi.fn()
    };

    mockStorage = {
      setHighScore: vi.fn(() => true),
      getHighScore: vi.fn(() => 500)
    };

    mockContext = {
      renderer: mockRenderer,
      sound: mockSound,
      storage: mockStorage,
      difficulty: 'MEDIUM',
      onScore: vi.fn(),
      onGameOver: vi.fn(),
      onLevelUp: vi.fn(),
      onLivesChange: vi.fn()
    };

    game = new BaseGame('test-game', 'Test Game Title', 'Puzzle');
  });

  describe('Constructor & Initial State', () => {
    it('sets initial properties correctly with custom arguments', () => {
      expect(game.id).toBe('test-game');
      expect(game.title).toBe('Test Game Title');
      expect(game.category).toBe('Puzzle');
      expect(game.context).toBeNull();
      expect(game.isPaused).toBe(false);
      expect(game.isOver).toBe(false);
      expect(game.score).toBe(0);
      expect(game.level).toBe(1);
      expect(game.lives).toBe(3);
    });

    it('defaults category to Arcade when omitted', () => {
      const defaultGame = new BaseGame('arcade-game', 'Arcade Title');
      expect(defaultGame.category).toBe('Arcade');
    });
  });

  describe('init(context) Lifecycle', () => {
    it('caches injected context and emits initial HUD events', () => {
      game.init(mockContext);

      expect(game.context).toBe(mockContext);
      expect(game.isPaused).toBe(false);
      expect(game.isOver).toBe(false);
      expect(game.score).toBe(0);
      expect(game.level).toBe(1);
      expect(mockContext.onLivesChange).toHaveBeenCalledWith(3);
      expect(mockContext.onLevelUp).toHaveBeenCalledWith(1);
    });

    it('allocates 4 lives for EASY difficulty', () => {
      mockContext.difficulty = 'EASY';
      game.init(mockContext);
      expect(game.lives).toBe(4);
      expect(game.initialLives).toBe(4);
      expect(mockContext.onLivesChange).toHaveBeenCalledWith(4);
    });

    it('allocates 3 lives for MEDIUM difficulty', () => {
      mockContext.difficulty = 'MEDIUM';
      game.init(mockContext);
      expect(game.lives).toBe(3);
      expect(game.initialLives).toBe(3);
      expect(mockContext.onLivesChange).toHaveBeenCalledWith(3);
    });

    it('allocates 2 lives for HARD difficulty', () => {
      mockContext.difficulty = 'HARD';
      game.init(mockContext);
      expect(game.lives).toBe(2);
      expect(game.initialLives).toBe(2);
      expect(mockContext.onLivesChange).toHaveBeenCalledWith(2);
    });

    it('tolerates missing callback handlers in context gracefully', () => {
      expect(() => {
        game.init({});
      }).not.toThrow();
    });
  });

  describe('update(deltaTime) & Execution Control', () => {
    it('bypasses update when game is paused or over', () => {
      class TestSubGame extends BaseGame {
        constructor() {
          super('sub', 'Sub');
          this.ticks = 0;
        }
        update(dt) {
          if (this.isPaused || this.isOver) return;
          this.ticks++;
        }
      }

      const subGame = new TestSubGame();
      subGame.init(mockContext);

      subGame.update(0.016);
      expect(subGame.ticks).toBe(1);

      subGame.pause();
      subGame.update(0.016);
      expect(subGame.ticks).toBe(1); // Frozen during pause

      subGame.resume();
      subGame.update(0.016);
      expect(subGame.ticks).toBe(2); // Resumed

      subGame.gameOver();
      subGame.update(0.016);
      expect(subGame.ticks).toBe(2); // Frozen after game over
    });
  });

  describe('render(context) Contract', () => {
    it('clears the virtual renderer matrix', () => {
      game.init(mockContext);
      game.render(mockContext);
      expect(mockRenderer.clear).toHaveBeenCalled();
    });

    it('handles render safely when context is null or lacks renderer', () => {
      expect(() => game.render(null)).not.toThrow();
      expect(() => game.render({})).not.toThrow();
    });
  });

  describe('reset(), pause(), resume(), destroy()', () => {
    it('reset() cleanly restores initial state and HUD callbacks', () => {
      game.init(mockContext);
      game.score = 5000;
      game.level = 8;
      game.lives = 1;
      game.isPaused = true;

      game.reset();

      expect(game.score).toBe(0);
      expect(game.level).toBe(1);
      expect(game.lives).toBe(3);
      expect(game.isPaused).toBe(false);
      expect(game.isOver).toBe(false);
      expect(mockContext.onLivesChange).toHaveBeenLastCalledWith(3);
      expect(mockContext.onLevelUp).toHaveBeenLastCalledWith(1);
    });

    it('pause() and resume() toggle isPaused state', () => {
      game.init(mockContext);
      expect(game.isPaused).toBe(false);

      game.pause();
      expect(game.isPaused).toBe(true);

      game.resume();
      expect(game.isPaused).toBe(false);
    });

    it('destroy() halts activity, marks isOver, and cleans context reference', () => {
      game.init(mockContext);
      game.destroy();

      expect(game.isPaused).toBe(true);
      expect(game.isOver).toBe(true);
      expect(game.context).toBeNull();
    });
  });

  describe('Scoring & Difficulty Multipliers', () => {
    it('calculates 1.0x multiplier on EASY', () => {
      mockContext.difficulty = 'EASY';
      game.init(mockContext);
      expect(game.getDifficultyMultiplier()).toBe(1.0);

      game.addScore(100);
      expect(game.score).toBe(100);
      expect(mockContext.onScore).toHaveBeenCalledWith(100);
    });

    it('calculates 1.5x multiplier on MEDIUM', () => {
      mockContext.difficulty = 'MEDIUM';
      game.init(mockContext);
      expect(game.getDifficultyMultiplier()).toBe(1.5);

      game.addScore(100);
      expect(game.score).toBe(150);
      expect(mockContext.onScore).toHaveBeenCalledWith(150);
    });

    it('calculates 2.5x multiplier on HARD', () => {
      mockContext.difficulty = 'HARD';
      game.init(mockContext);
      expect(game.getDifficultyMultiplier()).toBe(2.5);

      game.addScore(100);
      expect(game.score).toBe(250);
      expect(mockContext.onScore).toHaveBeenCalledWith(250);
    });

    it('ignores invalid or NaN base score inputs', () => {
      game.init(mockContext);
      game.addScore(NaN);
      game.addScore('100');
      game.addScore(null);
      expect(game.score).toBe(0);
      expect(mockContext.onScore).not.toHaveBeenCalled();
    });
  });

  describe('Level & Lives Emission', () => {
    it('emitLevel updates local state, sounds, and UI callbacks', () => {
      game.init(mockContext);
      game.emitLevel(4);

      expect(game.level).toBe(4);
      expect(mockContext.onLevelUp).toHaveBeenCalledWith(4);
      expect(mockSound.playLevelUp).toHaveBeenCalled();
    });

    it('emitLives clamps negative values to 0 and notifies UI', () => {
      game.init(mockContext);
      game.emitLives(-2);

      expect(game.lives).toBe(0);
      expect(mockContext.onLivesChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Virtual Matrix Helpers (setPixel, getPixel, isSolid)', () => {
    it('proxies pixel operations to context renderer', () => {
      game.init(mockContext);

      game.setPixel(4, 5, 1);
      expect(mockRenderer.setPixel).toHaveBeenCalledWith(4, 5, 1);

      expect(game.isSolid(1, 1)).toBe(true);
      expect(game.isSolid(0, 0)).toBe(false);

      game.clearGrid();
      expect(mockRenderer.clear).toHaveBeenCalled();
    });
  });

  describe('gameOver() Contract', () => {
    it('triggers sound, records high score, notifies callback, and is idempotent', () => {
      game.init(mockContext);
      game.score = 2500;

      game.gameOver();

      expect(game.isOver).toBe(true);
      expect(mockStorage.setHighScore).toHaveBeenCalledWith('test-game', 2500);
      expect(mockSound.playGameOver).toHaveBeenCalledTimes(1);
      expect(mockContext.onGameOver).toHaveBeenCalledWith(2500);

      // Re-invoking gameOver must not fire secondary sounds or duplicate callbacks
      game.gameOver();
      expect(mockSound.playGameOver).toHaveBeenCalledTimes(1);
      expect(mockContext.onGameOver).toHaveBeenCalledTimes(1);
    });
  });
});
