import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CosmoDefender } from '../../src/js/games/CosmoDefender.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('CosmoDefender (Star Defender) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new CosmoDefender();
    game.init(context);
  });

  it('initializes spaceship and alien formations', () => {
    expect(game.playerX).toBe(3);
    expect(game.playerY).toBe(18);
    expect(game.playerLasers).toBeDefined();
    expect(game.aliens.length).toBeGreaterThan(0);
  });

  it('moves ship horizontally with input bounds', () => {
    const origX = game.playerX;
    context.input.press('LEFT');
    game.update(0.05);

    expect(game.playerX).toBeLessThanOrEqual(origX);
  });

  it('fires cannon lasers upward toward invaders', () => {
    const initialLaserCount = game.playerLasers.length;
    context.input.press('ACTION_A');
    game.update(0.05);

    expect(game.playerLasers.length).toBeGreaterThan(initialLaserCount);
  });
});
