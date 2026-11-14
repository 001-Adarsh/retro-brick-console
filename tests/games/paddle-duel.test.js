import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BounceDuel } from '../../src/js/games/BounceDuel.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';
import { createMockDuoContext } from '../fixtures/multiplayer-fixtures.js';

describe('BounceDuel (Paddle Duel) Solo & Duo Tests', () => {
  it('operates in single-player with AI tracking', () => {
    const context = createMockGameContext({ isDuoMode: false, playerCount: 1 });
    const game = new BounceDuel();
    game.init(context);

    expect(game.context.isDuoMode).toBe(false);
    expect(game.playerX).toBeDefined();
    expect(game.aiX).toBeDefined();
  });

  it('switches to 2-player local multiplayer when Duo mode is enabled', () => {
    const duoContext = createMockDuoContext();
    const game = new BounceDuel();
    game.init(duoContext);

    expect(game.context.isDuoMode).toBe(true);

    // Player 1 controls bottom paddle (WASD/Left-Right)
    const p1Initial = game.playerX;
    duoContext.input.p1.press('LEFT');
    game.update(0.05);
    expect(game.playerX).toBeLessThanOrEqual(p1Initial);

    // Player 2 controls top paddle (ArrowLeft/ArrowRight)
    const p2Initial = game.aiX;
    duoContext.input.p2.press('RIGHT');
    game.update(0.05);
    expect(game.aiX).toBeGreaterThanOrEqual(p2Initial);
  });

  it('scores point for P1 when ball passes top boundary', () => {
    const duoContext = createMockDuoContext();
    const game = new BounceDuel();
    game.init(duoContext);

    game.ball.y = 0.2;
    game.ball.dy = -5;
    game.aiX = 0;

    game.update(0.016);
    expect(game.playerScore).toBe(1);
    expect(duoContext.onDuoScore).toHaveBeenCalledWith(1, 0);
  });

  it('scores point for P2 when ball passes bottom boundary', () => {
    const duoContext = createMockDuoContext();
    const game = new BounceDuel();
    game.init(duoContext);

    game.ball.y = 19.8;
    game.ball.dy = 5;
    game.playerX = 0;

    game.update(0.016);
    expect(game.aiScore).toBe(1);
    expect(duoContext.onDuoScore).toHaveBeenCalledWith(0, 1);
  });
});
