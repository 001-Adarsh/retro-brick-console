import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FourInLine } from '../../src/js/games/FourInLine.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';
import { createMockDuoContext } from '../fixtures/multiplayer-fixtures.js';

describe('FourInLine (Four In A Row) Solo & Duo Tests', () => {
  it('initializes 7-column gravity grid', () => {
    const context = createMockGameContext();
    const game = new FourInLine();
    game.init(context);

    expect(game.cols).toBe(7);
    expect(game.rows).toBe(6);
    expect(game.selectedCol).toBe(3); // Center column
  });

  it('enforces turn alternation in Duo mode', () => {
    const duoContext = createMockDuoContext();
    const game = new FourInLine();
    game.init(duoContext);

    expect(game.context.isDuoMode).toBe(true);
    expect(game.currentTurn).toBe(1);

    // P1 drops token in column 3
    duoContext.input.p1.press('ACTION_A');
    game.update(0.016);
    duoContext.input.p1.release('ACTION_A');
    expect(game.currentTurn).toBe(2);

    // P2 drops token in column 3
    duoContext.input.p2.press('ACTION_A');
    game.update(0.016);
    duoContext.input.p2.release('ACTION_A');
    expect(game.currentTurn).toBe(1);
  });

  it('detects 4-in-a-row horizontal win', () => {
    const duoContext = createMockDuoContext();
    const game = new FourInLine();
    game.init(duoContext);

    // Set 3 tokens for P1
    game.grid[5][0] = 1;
    game.grid[5][1] = 1;
    game.grid[5][2] = 1;

    // Drop 4th token in column 3
    game.selectedCol = 3;
    game.currentTurn = 1;
    duoContext.input.p1.press('ACTION_A');
    game.update(0.016);

    expect(game.roundOver).toBe(true);
  });
});
