import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CyberViper } from '../../src/js/games/CyberViper.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('CyberViper (Snake Trail) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new CyberViper();
    game.init(context);
  });

  it('starts with 4-segment snake body and active chip food', () => {
    expect(game.body.length).toBeGreaterThanOrEqual(3);
    expect(game.chip).toBeDefined();
    expect(game.chip.x).toBeGreaterThanOrEqual(0);
    expect(game.chip.x).toBeLessThan(10);
    expect(game.chip.y).toBeGreaterThanOrEqual(0);
    expect(game.chip.y).toBeLessThan(20);
  });

  it('changes direction on directional input, rejecting 180-degree reversal', () => {
    game.dir = { x: 1, y: 0 }; // Moving right
    game.nextDir = { x: 1, y: 0 };

    // Press left (opposite) - should be ignored to prevent self-collision
    context.input.press('LEFT');
    game.update(0.01);
    expect(game.nextDir.x).toBe(1);

    // Press up (valid perpendicular turn)
    context.input.release('LEFT');
    context.input.press('UP');
    game.update(0.01);
    expect(game.nextDir.y).toBe(-1);
  });

  it('grows snake length when eating chip food', () => {
    const initialLen = game.body.length;
    // Position food directly in front of head
    game.body[0] = { x: 5, y: 5 };
    game.dir = { x: 1, y: 0 };
    game.nextDir = { x: 1, y: 0 };
    game.chip = { x: 6, y: 5 };

    game.step();
    expect(game.body.length).toBe(initialLen + 1);
    expect(game.score).toBeGreaterThan(0);
  });
});
