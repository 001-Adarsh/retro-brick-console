import { describe, it, expect } from 'vitest';
import { GameRegistry, GameRegistryImpl } from '../../src/js/core/GameRegistry.js';

describe('GameRegistry Master Catalog', () => {
  it('registers exactly 23 unique games', () => {
    const games = GameRegistry.getAllGames();
    expect(games.length).toBe(23);

    const ids = new Set(games.map(g => g.id));
    expect(ids.size).toBe(23);
  });

  it('ensures every game has title, category, description, and controls metadata', () => {
    const games = GameRegistry.getAllGames();
    for (const game of games) {
      expect(game.id).toBeTruthy();
      expect(game.title).toBeTruthy();
      expect(game.category).toBeTruthy();
      expect(game.description).toBeTruthy();
      expect(Array.isArray(game.controls)).toBe(true);
      expect(game.GameClass).toBeDefined();
    }
  });

  it('can instantiate every single game through createGame', () => {
    const games = GameRegistry.getAllGames();
    for (const entry of games) {
      const instance = GameRegistry.createGame(entry.id);
      expect(instance).toBeDefined();
      expect(instance.id).toBe(entry.id);

      // Verify required lifecycle interface
      expect(typeof instance.init).toBe('function');
      expect(typeof instance.update).toBe('function');
      expect(typeof instance.render).toBe('function');
      expect(typeof instance.reset).toBe('function');
      expect(typeof instance.pause).toBe('function');
      expect(typeof instance.resume).toBe('function');
      expect(typeof instance.destroy).toBe('function');
    }
  });

  it('retrieves distinct categories', () => {
    const categories = GameRegistry.getCategories();
    expect(categories.length).toBeGreaterThanOrEqual(5);
    expect(categories).toContain('Puzzle');
    expect(categories).toContain('Action');
    expect(categories).toContain('Arcade');
  });
});
