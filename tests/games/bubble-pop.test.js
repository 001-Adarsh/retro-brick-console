import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrbPop } from '../../src/js/games/OrbPop.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('OrbPop (Bubble Pop) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new OrbPop();
    game.init(context);
  });

  it('initializes bubble cluster at ceiling and bottom launcher', () => {
    expect(game.grid.length).toBe(20);
    expect(game.cannonAngle).toBe(0);
    expect(game.currentOrb).toBeDefined();
    expect(game.flyingOrb).toBeNull();
  });

  it('aims launcher left and right with input', () => {
    expect(game.cannonAngle).toBe(0);
    context.input.press('LEFT');
    game.update(0.1);
    expect(game.cannonAngle).toBe(-1);

    context.input.release('LEFT');
    context.input.press('RIGHT');
    game.update(0.1);
    expect(game.cannonAngle).toBe(0);
  });

  it('launches bubble upward towards clusters on Action A press', () => {
    context.input.press('ACTION_A');
    game.update(0.05);

    expect(game.flyingOrb).toBeDefined();
    expect(game.flyingOrb.dy).toBeLessThan(0);
  });
});
