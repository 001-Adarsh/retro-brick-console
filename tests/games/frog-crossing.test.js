import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Froggero } from '../../src/js/games/Froggero.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('Froggero (Frog Crossing) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new Froggero();
    game.init(context);
  });

  it('places frog at starting baseline', () => {
    expect(game.frog).toEqual({ x: 5, y: 19 });
    expect(game.trafficLanes.length).toBeGreaterThan(0);
    expect(game.canalLanes.length).toBeGreaterThan(0);
  });

  it('moves frog forward on UP input', () => {
    const origY = game.frog.y;
    context.input.press('UP');
    game.update(0.1);

    expect(game.frog.y).toBeLessThan(origY);
  });

  it('loses life when hit by highway vehicle', () => {
    const livesBefore = game.lives;
    // Position frog on obstacle
    game.frog.x = 1;
    game.frog.y = 18;
    game.trafficLanes = [
      { y: 18, speed: 3.0, width: 2, cars: [1] }
    ];

    game.update(0.016);
    expect(game.lives).toBeLessThan(livesBefore);
  });
});
