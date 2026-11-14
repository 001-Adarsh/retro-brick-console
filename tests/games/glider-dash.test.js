import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AeroGlider } from '../../src/js/games/AeroGlider.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('AeroGlider (Glider Dash) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new AeroGlider();
    game.init(context);
  });

  it('initializes glider position and obstacle pylons', () => {
    expect(game.gliderY).toBe(10);
    expect(game.velocity).toBe(0);
    expect(game.pylons).toBeDefined();
  });

  it('flaps upward on Action A press counteracting gravity', () => {
    game.velocity = 2.0; // Falling downward
    context.input.press('ACTION_A');
    game.update(0.05);

    expect(game.velocity).toBeLessThan(2.0);
  });

  it('detects collision when glider impacts bottom boundary', () => {
    game.lives = 1;
    game.gliderY = 19.5; // Bottom of matrix
    game.update(0.1);

    expect(game.isOver).toBe(true);
  });
});
