import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PinballBounce } from '../../src/js/games/PinballBounce.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('PinballBounce Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new PinballBounce();
    game.init(context);
  });

  it('initializes pinball sphere, bumpers, and dual flippers', () => {
    expect(game.ball).toBeDefined();
    expect(game.popBumpers.length).toBeGreaterThan(0);
    expect(game.leftFlipperActive).toBe(false);
    expect(game.rightFlipperActive).toBe(false);
  });

  it('triggers left flipper on LEFT input and right flipper on ACTION_A input', () => {
    game.inPlunger = false;
    context.input.press('LEFT');
    game.update(0.05);
    expect(game.leftFlipperActive).toBe(true);

    context.input.release('LEFT');
    context.input.press('ACTION_A');
    game.update(0.05);
    expect(game.rightFlipperActive).toBe(true);
  });

  it('rebounds pinball and awards score upon bumper impact', () => {
    game.inPlunger = false;
    game.ball = { x: 3, y: 4, vx: 0, vy: 1 };
    game.popBumpers = [{ x: 3, y: 4, radius: 1 }];

    game.update(0.016);
    expect(game.score).toBeGreaterThan(0);
  });
});
