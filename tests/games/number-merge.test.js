import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Matrix2048 } from '../../src/js/games/Matrix2048.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('Matrix2048 (Number Merge) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new Matrix2048();
    game.init(context);
  });

  it('spawns 4x4 matrix with initial tiles', () => {
    expect(game.grid).toBeDefined();
    expect(game.grid.length).toBe(4);
    expect(game.grid[0].length).toBe(4);

    let nonZeroCount = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (game.grid[r][c] > 0) nonZeroCount++;
      }
    }
    expect(nonZeroCount).toBeGreaterThanOrEqual(2);
  });

  it('merges adjacent identical tiles and increases score', () => {
    game.grid = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    context.input.press('LEFT');
    game.update(0.1);

    expect(game.grid[0][0]).toBe(4);
    expect(game.score).toBeGreaterThanOrEqual(4);
  });

  it('supports single-step undo via Action B button', () => {
    game.grid = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    game.undoCharges = 1;

    // Mock spawnTile for deterministic undo verification
    vi.spyOn(game, 'spawnTile').mockImplementation(() => {
      game.grid[3][3] = 2;
    });

    context.input.press('LEFT');
    game.update(0.1);
    expect(game.grid[0][0]).toBe(4);

    // Trigger undo
    context.input.release('LEFT');
    context.input.press('ACTION_B');
    game.update(0.1);

    expect(game.grid[0][1]).toBe(2);
  });
});
