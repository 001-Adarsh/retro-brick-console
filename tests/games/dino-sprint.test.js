import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SprintEscape } from '../../src/js/games/SprintEscape.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('SprintEscape (Dino Sprint) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new SprintEscape();
    game.init(context);
  });

  it('initializes runner on rooftop and scrolls obstacles', () => {
    expect(game.runnerY).toBe(14);
    expect(game.platforms.length).toBeGreaterThan(0);
    expect(game.isGrounded).toBe(true);
  });

  it('triggers jump upward on Action A or UP input', () => {
    context.input.press('ACTION_A');
    game.update(0.05);

    expect(game.isGrounded).toBe(false);
    expect(game.velocityY).toBeLessThan(0);
  });

  it('slides under low obstacles on DOWN input', () => {
    context.input.press('DOWN');
    game.update(0.05);

    expect(game.isSliding).toBe(true);
  });
});
