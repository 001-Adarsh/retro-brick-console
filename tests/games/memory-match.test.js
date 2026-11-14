import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TileMemory } from '../../src/js/games/TileMemory.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('TileMemory (Memory Match) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new TileMemory();
    game.init(context);
  });

  it('initializes matched card deck with hidden tiles', () => {
    expect(game.cards).toBeDefined();
    expect(game.cards.length).toBeGreaterThan(0);
    expect(game.cursor).toEqual({ x: 0, y: 0 });
  });

  it('moves cursor across memory card grid', () => {
    const origX = game.cursor.x;
    context.input.press('RIGHT');
    game.update(0.1);

    expect(game.cursor.x).toBe(origX + 1);
  });

  it('flips selected tile upon action button press', () => {
    context.input.press('ACTION_A');
    game.update(0.05);

    expect(game.firstPick !== null || game.cards[0][0].revealed).toBe(true);
  });
});
