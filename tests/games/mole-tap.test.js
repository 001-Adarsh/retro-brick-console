import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MoleHammer } from '../../src/js/games/MoleHammer.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('MoleHammer (Mole Tap) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new MoleHammer();
    game.init(context);
  });

  it('initializes hammer reticle and conduit holes', () => {
    expect(game.reticle).toEqual({ x: 1, y: 1 });
    expect(game.conduits.length).toBe(3);
    expect(game.conduits[0].length).toBe(3);
    expect(game.score).toBe(0);
  });

  it('moves hammer reticle across matrix conduits', () => {
    expect(game.reticle.x).toBe(1);
    context.input.press('RIGHT');
    game.update(0.1);

    expect(game.reticle.x).toBe(2);
  });

  it('strikes mole and increments score on Action A press', () => {
    game.reticle = { x: 0, y: 0 };
    game.conduits[0][0].type = 'bot';
    game.conduits[0][0].timer = 1.0;

    context.input.press('ACTION_A');
    game.update(0.05);

    expect(game.score).toBeGreaterThan(0);
    expect(game.conduits[0][0].type).toBe('empty');
  });
});
