import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GridTactics } from '../../src/js/games/GridTactics.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';
import { createMockDuoContext } from '../fixtures/multiplayer-fixtures.js';

describe('GridTactics (Tic-Tac-Grid) Solo & Duo Tests', () => {
  it('operates in single-player against CPU', () => {
    const context = createMockGameContext({ isDuoMode: false, playerCount: 1 });
    const game = new GridTactics();
    game.init(context);

    expect(game.context.isDuoMode).toBe(false);
    expect(game.board.length).toBe(3);
    expect(game.board[0].length).toBe(3);
  });

  it('alternates turns strictly between P1 and P2 in Duo mode', () => {
    const duoContext = createMockDuoContext();
    const game = new GridTactics();
    game.init(duoContext);

    expect(game.context.isDuoMode).toBe(true);
    expect(game.currentTurn).toBe(1);

    // P1 makes move at (0, 0)
    game.cursor = { x: 0, y: 0 };
    duoContext.input.p1.press('ACTION_A');
    game.update(0.016);
    duoContext.input.p1.release('ACTION_A');

    expect(game.board[0][0]).toBe(1); // P1 token placed
    expect(game.currentTurn).toBe(2); // Turn transitioned to P2

    // P2 makes move at (1, 1)
    game.cursor = { x: 1, y: 1 };
    duoContext.input.p2.press('ACTION_A');
    game.update(0.016);
    duoContext.input.p2.release('ACTION_A');

    expect(game.board[1][1]).toBe(2); // P2 token placed
    expect(game.currentTurn).toBe(1); // Turn returned to P1
  });

  it('detects 3-in-a-row victory for Player 1', () => {
    const duoContext = createMockDuoContext();
    const game = new GridTactics();
    game.init(duoContext);

    game.board = [
      [1, 1, 0],
      [2, 2, 0],
      [0, 0, 0],
    ];
    game.cursor = { x: 2, y: 0 };
    game.currentTurn = 1;

    duoContext.input.p1.press('ACTION_A');
    game.update(0.016);

    expect(game.roundOver).toBe(true);
  });
});
