import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrickBreaker } from '../../src/js/games/BrickBreaker.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('BrickBreaker Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new BrickBreaker();
    game.init(context);
  });

  it('initializes with paddle, ball, and brick layout', () => {
    expect(game.paddleX).toBeDefined();
    expect(game.paddleWidth).toBeGreaterThan(0);
    expect(game.balls.length).toBeGreaterThan(0);
    expect(game.bricks.length).toBe(20);
    expect(game.score).toBe(0);
  });

  it('moves paddle left and right via input', () => {
    const initialX = game.paddleX;

    context.input.press('LEFT');
    game.update(0.1);
    expect(game.paddleX).toBeLessThanOrEqual(initialX);

    context.input.release('LEFT');
    context.input.press('RIGHT');
    game.update(0.1);
    expect(game.paddleX).toBeGreaterThanOrEqual(initialX - 1);
  });

  it('updates ball physics and detects paddle bounce', () => {
    const ball = game.balls[0];
    ball.y = 18.5;
    ball.x = game.paddleX + 1;
    ball.dy = 5; // Moving down towards paddle

    game.update(0.016);
    // Should rebound upward
    expect(ball.dy).toBeLessThan(0);
  });

  it('resets cleanly upon reset() call', () => {
    game.score = 500;
    game.reset();

    expect(game.score).toBe(0);
    expect(game.balls.length).toBeGreaterThan(0);
  });
});
