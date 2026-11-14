import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SolitaireLite } from '../../src/js/games/SolitaireLite.js';
import { createMockGameContext } from '../fixtures/game-fixtures.js';

describe('SolitaireLite (Card Solitaire) Game Tests', () => {
  let game;
  let context;

  beforeEach(() => {
    context = createMockGameContext();
    game = new SolitaireLite();
    game.init(context);
  });

  it('deals 4 tableau columns, foundations, and draw stock deck', () => {
    expect(game.tableau.length).toBe(4);
    expect(game.foundations.length).toBe(2);
    expect(game.deck.length).toBeGreaterThan(0);
    expect(game.waste.length).toBe(0);
  });

  it('navigates zones via D-Pad', () => {
    expect(game.cursor.zone).toBe('deck');
    context.input.press('RIGHT');
    game.update(0.1);

    expect(game.cursor.zone).toBe('waste');
  });

  it('draws card from stock pile on Action A press while on deck', () => {
    game.cursor.zone = 'deck';
    context.input.press('ACTION_A');
    game.update(0.05);

    expect(game.waste.length).toBe(1);
  });
});
