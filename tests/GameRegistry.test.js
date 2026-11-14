import { describe, it, expect } from 'vitest';
import { GameRegistry } from '../src/js/core/GameRegistry.js';
import { BaseGame } from '../src/js/core/BaseGame.js';

describe('GameRegistry', () => {
  const EXPECTED_GAME_IDS = [
    'brick-stacker',
    'turbo-highway',
    'iron-tanks',
    'cyber-viper',
    'falling-poly',
    'cosmo-defender',
    'bounce-duel',
    'tile-memory',
    'labyrinth-escape',
    'froggero',
    'mole-hammer',
    'chroma-pulse',
    'grid-tactics',
    'four-in-line',
    'mine-scanner',
    'matrix-2048',
    'aero-glider',
    'brick-breaker',
    'pinball-bounce',
    'sprint-escape',
    'orb-pop',
    'solitaire-lite',
    'reflex-rush'
  ];

  describe('Master 23-Game Catalog Verification', () => {
    it('registers exactly 23 distinct original games', () => {
      const allGames = GameRegistry.getAllGames();
      expect(allGames.length).toBe(23);

      const uniqueIds = new Set(allGames.map(g => g.id));
      expect(uniqueIds.size).toBe(23);
    });

    it('contains every required game ID from the specification', () => {
      for (const expectedId of EXPECTED_GAME_IDS) {
        expect(GameRegistry.hasGame(expectedId)).toBe(true);
      }
    });

    it('verifies that every registered game has valid metadata fields', () => {
      const allGames = GameRegistry.getAllGames();

      for (const game of allGames) {
        // ID check
        expect(typeof game.id).toBe('string');
        expect(game.id.trim().length).toBeGreaterThan(0);
        expect(game.id).toMatch(/^[a-z0-9-]+$/); // kebab-case

        // Title check
        expect(typeof game.title).toBe('string');
        expect(game.title.trim().length).toBeGreaterThan(0);

        // Category check
        expect(typeof game.category).toBe('string');
        expect(game.category.trim().length).toBeGreaterThan(0);

        // Description check
        expect(typeof game.description).toBe('string');
        expect(game.description.trim().length).toBeGreaterThan(5);

        // Controls check
        expect(Array.isArray(game.controls)).toBe(true);
        expect(game.controls.length).toBeGreaterThan(0);
        for (const ctrl of game.controls) {
          expect(typeof ctrl.button).toBe('string');
          expect(typeof ctrl.action).toBe('string');
        }

        // Difficulty support check
        expect(Array.isArray(game.difficultySupport)).toBe(true);
        expect(game.difficultySupport).toContain('EASY');
        expect(game.difficultySupport).toContain('MEDIUM');
        expect(game.difficultySupport).toContain('HARD');

        // Constructor check
        expect(typeof game.GameClass).toBe('function');
      }
    });
  });

  describe('Factory Instantiation & BaseGame Contract Parity', () => {
    it('successfully instantiates all 23 games and satisfies BaseGame contract', () => {
      const allGames = GameRegistry.getAllGames();

      for (const meta of allGames) {
        const instance = GameRegistry.createGame(meta.id);

        expect(instance).not.toBeNull();
        expect(instance).toBeInstanceOf(BaseGame);
        expect(instance.id).toBe(meta.id);
        expect(typeof instance.title).toBe('string');

        // Verify the 7 required lifecycle methods
        expect(typeof instance.init).toBe('function');
        expect(typeof instance.update).toBe('function');
        expect(typeof instance.render).toBe('function');
        expect(typeof instance.reset).toBe('function');
        expect(typeof instance.pause).toBe('function');
        expect(typeof instance.resume).toBe('function');
        expect(typeof instance.destroy).toBe('function');
      }
    });

    it('returns null when attempting to create a non-existent game', () => {
      expect(GameRegistry.createGame('non-existent-game-id')).toBeNull();
      expect(GameRegistry.createGame('')).toBeNull();
      expect(GameRegistry.createGame(null)).toBeNull();
      expect(GameRegistry.createGame(undefined)).toBeNull();
    });
  });

  describe('Category Filtering & Information Queries', () => {
    it('retrieves specific game metadata via getGameInfo', () => {
      const viperInfo = GameRegistry.getGameInfo('cyber-viper');
      expect(viperInfo).not.toBeNull();
      expect(viperInfo.title).toBe('Cyber Viper');
      expect(viperInfo.category).toBe('Arcade');

      const polyInfo = GameRegistry.getGameInfo('falling-poly');
      expect(polyInfo).not.toBeNull();
      expect(polyInfo.title).toBe('Falling Poly');
      expect(polyInfo.category).toBe('Puzzle');

      expect(GameRegistry.getGameInfo('unknown-id')).toBeNull();
    });

    it('filters games by category case-insensitively', () => {
      const puzzles = GameRegistry.getGamesByCategory('Puzzle');
      expect(puzzles.length).toBeGreaterThan(0);
      expect(puzzles.every(g => g.category.toLowerCase() === 'puzzle')).toBe(true);

      const arcadeGames = GameRegistry.getGamesByCategory('arcade');
      expect(arcadeGames.length).toBeGreaterThan(0);
      expect(arcadeGames.every(g => g.category.toLowerCase() === 'arcade')).toBe(true);

      const empty = GameRegistry.getGamesByCategory('NonExistentCategory');
      expect(empty).toEqual([]);
    });
  });

  describe('Custom Registration & Validation', () => {
    it('rejects registration of metadata without an id', () => {
      expect(() => {
        GameRegistry.register(null);
      }).toThrow();

      expect(() => {
        GameRegistry.register({});
      }).toThrow();
    });

    it('allows registration of modular third-party or custom game cartridges', () => {
      class CustomGame extends BaseGame {
        constructor() {
          super('custom-cyber-race', 'Custom Cyber Race', 'Racing');
        }
      }

      GameRegistry.register({
        id: 'custom-cyber-race',
        title: 'Custom Cyber Race',
        category: 'Racing',
        description: 'A modular racing cartridge extension',
        controls: [{ button: 'A', action: 'Boost' }],
        difficultySupport: ['EASY', 'MEDIUM', 'HARD'],
        GameClass: CustomGame
      });

      expect(GameRegistry.hasGame('custom-cyber-race')).toBe(true);
      const instance = GameRegistry.createGame('custom-cyber-race');
      expect(instance).toBeInstanceOf(CustomGame);
      expect(instance.id).toBe('custom-cyber-race');
    });
  });
});
