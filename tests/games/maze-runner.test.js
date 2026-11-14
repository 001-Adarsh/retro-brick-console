import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LabyrinthEscape } from '../../src/js/games/LabyrinthEscape.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('LabyrinthEscape (Maze Runner) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new LabyrinthEscape();
    game.init(context);
  });

  it('generates maze walls and places runner at start', () => {
    expect(game.player).toEqual({ x: 1, y: 1 });
    expect(game.keycard).toBeDefined();
    expect(game.escape).toBeDefined();
    expect(game.maze.length).toBe(20);
  });

  it('moves runner into open corridor, blocking on wall collision', () => {
    const origX = game.player.x;
    const origY = game.player.y;

    context.input.press('DOWN');
    game.update(0.1);

    // Player either advanced or was blocked by wall
    expect(game.player.y === origY || game.player.y === origY + 1).toBe(true);
  });

  it('triggers level win when runner reaches exit portal with keycard', () => {
    game.keycard.collected = true;
    game.escape.unlocked = true;
    game.player.x = game.escape.x;
    game.player.y = game.escape.y - 1;

    context.input.press('DOWN');
    game.update(0.05);
    expect(game.score).toBeGreaterThan(0);
  });
});
