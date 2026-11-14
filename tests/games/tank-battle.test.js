import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IronTanks } from '../../src/js/games/IronTanks.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('IronTanks (Tank Battle) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new IronTanks();
    game.init(context);
  });

  it('initializes player tank and terrain grid', () => {
    expect(game.player).toBeDefined();
    expect(game.player.x).toBe(4);
    expect(game.player.y).toBe(16);
    expect(game.playerBullets).toBeDefined();
    expect(game.walls).toBeDefined();
  });

  it('fires projectile when Action A button is pressed', () => {
    const bulletsBefore = game.playerBullets.length;
    context.input.press('ACTION_A');
    game.update(0.05);

    expect(game.playerBullets.length).toBeGreaterThan(bulletsBefore);
  });

  it('destroys enemy tank when projectile impacts', () => {
    game.enemies = [{ x: 5, y: 5, hp: 1, type: 'scout' }];
    game.playerBullets = [{ x: 5.5, y: 5.5, dx: 0, dy: -1 }];

    game.updateBullets(game.playerBullets, true, 0.01);
    expect(game.enemies.length).toBe(0);
    expect(game.score).toBeGreaterThan(0);
  });
});
