import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReflexRush } from '../../src/js/games/ReflexRush.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';
import { createMockDuoContext } from '../fixtures/multiplayer-fixtures.js';

describe('ReflexRush Solo & Duo Reaction Tests', () => {
  it('initializes challenge state and wait timer in Solo mode', () => {
    const context = createMockGameContext({ isDuoMode: false, playerCount: 1 });
    const game = new ReflexRush();
    game.init(context);

    expect(game.context.isDuoMode).toBe(false);
    expect(game.state).toBe('ACTIVE');
    expect(game.currentPrompt).toBeDefined();
    expect(game.timeRemaining).toBeGreaterThan(0);
  });

  it('handles Duo quick-draw buzzer duel where fastest reaction wins point', () => {
    const duoContext = createMockDuoContext();
    const game = new ReflexRush();
    game.init(duoContext);

    expect(game.context.isDuoMode).toBe(true);

    // Normal challenge
    game.currentPrompt = { type: 'A', targetCount: 1 };
    game.state = 'ACTIVE';

    // Player 1 strikes first
    duoContext.input.p1.press('ACTION_A');
    game.update(0.01);

    expect(game.p1Score).toBe(1);
    expect(game.p2Score).toBe(0);
    expect(duoContext.onDuoScore).toHaveBeenCalledWith(1, 0);
  });

  it('penalizes premature false start in Duo mode by awarding point to opponent', () => {
    const duoContext = createMockDuoContext();
    const game = new ReflexRush();
    game.init(duoContext);

    // Fakeout challenge (Do NOT press)
    game.currentPrompt = { type: 'FAKEOUT', targetCount: 1 };
    game.state = 'ACTIVE';

    // Player 1 false starts (strikes on fakeout!)
    duoContext.input.p1.press('ACTION_A');
    game.update(0.01);

    // Player 2 gets the point
    expect(game.p2Score).toBe(1);
    expect(game.p1Score).toBe(0);
    expect(duoContext.onDuoScore).toHaveBeenCalledWith(0, 1);
  });
});
