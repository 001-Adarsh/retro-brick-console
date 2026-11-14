import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChromaPulse } from '../../src/js/games/ChromaPulse.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('ChromaPulse (Pattern Echo) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new ChromaPulse();
    game.init(context);
  });

  it('initializes sequence queue and starts playback', () => {
    expect(game.sequence.length).toBeGreaterThan(0);
    expect(game.isPlayback).toBe(true);
  });

  it('generates next pattern step when round begins', () => {
    const lenBefore = game.sequence.length;
    game.addStepToSequence();
    expect(game.sequence.length).toBe(lenBefore + 1);
  });

  it('accepts correct player input matching sequence', () => {
    game.sequence = ['UP'];
    game.isPlayback = false;
    game.playerIndex = 0;

    context.input.press('UP');
    game.update(0.1);

    expect(game.isOver).toBe(false);
  });
});
