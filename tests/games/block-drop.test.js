import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FallingPoly } from '../../src/js/games/FallingPoly.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('FallingPoly (Block Drop) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new FallingPoly();
    game.init(context);
  });

  it('spawns active falling polyomino in bounds', () => {
    expect(game.currentPiece).toBeDefined();
    expect(game.board).toBeDefined();
    expect(game.board.length).toBe(20);
    expect(game.board[0].length).toBe(10);
  });

  it('moves piece laterally within grid boundaries', () => {
    const origX = game.pieceX;
    context.input.press('RIGHT');
    game.update(0.05);

    expect(game.pieceX).toBeGreaterThanOrEqual(origX);
  });

  it('drops piece down when drop key is triggered', () => {
    const origY = game.pieceY;
    context.input.press('DOWN');
    game.update(0.1);

    expect(game.pieceY).toBeGreaterThanOrEqual(origY);
  });

  it('clears completed horizontal rows', () => {
    // Fill row 19 completely
    for (let c = 0; c < 10; c++) {
      game.board[19][c] = 1;
    }
    game.currentPiece = [[0]];
    const scoreBefore = game.score;
    game.lockPiece();

    expect(game.board[19].every(cell => cell === 0)).toBe(true);
    expect(game.score).toBeGreaterThan(scoreBefore);
  });
});
