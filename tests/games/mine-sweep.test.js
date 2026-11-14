import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MineScanner } from '../../src/js/games/MineScanner.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('MineScanner (Mine Sweep) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new MineScanner();
    game.init(context);
  });

  it('initializes minefield grid and flags count', () => {
    expect(game.grid.length).toBeGreaterThan(0);
    expect(game.cursor).toBeDefined();
    expect(game.totalMines).toBeGreaterThan(0);
  });

  it('moves cursor across minefield', () => {
    const origX = game.cursor.x;
    context.input.press('RIGHT');
    game.update(0.1);

    expect(game.cursor.x).toBe(origX + 1);
  });

  it('toggles flag on selected tile via Action B button', () => {
    // First clear first click by triggering reveal once
    game.firstClick = false;
    context.input.press('ACTION_B');
    game.update(0.05);

    const cell = game.grid[game.cursor.y][game.cursor.x];
    expect(cell.isFlagged).toBe(true);
  });
});
