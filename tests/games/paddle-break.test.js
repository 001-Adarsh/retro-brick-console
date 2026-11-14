import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrickStacker } from '../../src/js/games/BrickStacker.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('BrickStacker (Paddle Break / Stacker) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new BrickStacker();
    game.init(context);
  });

  it('initializes foundation floor and oscillating girder', () => {
    expect(game.currentRow).toBe(19);
    expect(game.girderWidth).toBeGreaterThanOrEqual(3);
    expect(game.girderX).toBeDefined();
    expect(game.girderDir).toBe(1);
  });

  it('oscillates girder horizontally across matrix', () => {
    const origX = game.girderX;
    game.update(0.2);

    expect(game.girderX !== origX).toBe(true);
  });

  it('locks girder and shears overhang on Action A press', () => {
    game.girderX = 3;
    game.girderWidth = 3;

    context.input.press('ACTION_A');
    game.update(0.05);

    expect(game.currentRow).toBe(18);
    expect(game.tower[19]).toBeDefined();
    expect(game.score).toBeGreaterThan(0);
  });
});
