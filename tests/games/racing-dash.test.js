import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TurboHighway } from '../../src/js/games/TurboHighway.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('TurboHighway (Racing Dash) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new TurboHighway();
    game.init(context);
  });

  it('initializes player vehicle in middle lane', () => {
    expect(game.currentLane).toBe(1);
    expect(game.playerY).toBe(16);
    expect(game.traffic).toBeDefined();
  });

  it('switches lanes on left and right input', () => {
    expect(game.currentLane).toBe(1);

    context.input.press('LEFT');
    game.update(0.1);
    expect(game.currentLane).toBe(0);

    context.input.release('LEFT');
    context.input.press('RIGHT');
    game.update(0.1);
    expect(game.currentLane).toBe(1);
  });

  it('detects crash when colliding with oncoming traffic vehicle', () => {
    game.currentLane = 1;
    game.playerY = 16;
    game.lives = 1;
    game.traffic = [{ lane: 1, y: 16, speed: 2, carType: 0 }];

    game.update(0.016);
    expect(game.isOver).toBe(true);
  });
});
