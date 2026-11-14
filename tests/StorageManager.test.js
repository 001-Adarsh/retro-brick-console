import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageManager, STORAGE_KEYS, DEFAULT_SETTINGS } from '../src/js/core/StorageManager.js';

describe('StorageManager', () => {
  let mockStorageBackend = {};
  let storageManager;

  const createMockLocalStorage = (shouldThrowOnSet = false) => ({
    getItem: vi.fn((key) => mockStorageBackend[key] ?? null),
    setItem: vi.fn((key, value) => {
      if (shouldThrowOnSet) {
        throw new Error('QuotaExceededError: storage limit reached');
      }
      mockStorageBackend[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete mockStorageBackend[key];
    }),
    clear: vi.fn(() => {
      mockStorageBackend = {};
    }),
    get length() {
      return Object.keys(mockStorageBackend).length;
    },
    key: vi.fn((index) => Object.keys(mockStorageBackend)[index] || null)
  });

  beforeEach(() => {
    mockStorageBackend = {};
    const mockLocalStorage = createMockLocalStorage();
    vi.stubGlobal('window', {
      localStorage: mockLocalStorage
    });
    storageManager = new StorageManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('Initialization & Environment Detection', () => {
    it('detects available localStorage in a windowed environment', () => {
      expect(storageManager.isLocalStorageAvailable).toBe(true);
    });

    it('falls back to memory store when window is undefined', () => {
      vi.stubGlobal('window', undefined);
      const fallbackManager = new StorageManager();
      expect(fallbackManager.isLocalStorageAvailable).toBe(false);
      expect(fallbackManager.memoryStore).toBeInstanceOf(Map);
    });

    it('falls back to memory store when localStorage throws on probe', () => {
      vi.stubGlobal('window', {
        localStorage: {
          setItem: () => {
            throw new Error('SecurityError: Access denied');
          },
          removeItem: () => {}
        }
      });
      const fallbackManager = new StorageManager();
      expect(fallbackManager.isLocalStorageAvailable).toBe(false);
    });
  });

  describe('High Score Operations', () => {
    it('returns 0 for unrecorded game IDs or null/undefined', () => {
      expect(storageManager.getHighScore('unknown-game')).toBe(0);
      expect(storageManager.getHighScore(null)).toBe(0);
      expect(storageManager.getHighScore(undefined)).toBe(0);
      expect(storageManager.getHighScore('')).toBe(0);
    });

    it('persists a new high score when higher than current', () => {
      const updated = storageManager.setHighScore('cyber-viper', 1500);
      expect(updated).toBe(true);
      expect(storageManager.getHighScore('cyber-viper')).toBe(1500);

      // Verify in localStorage backend with versioned key
      const stored = JSON.parse(mockStorageBackend[STORAGE_KEYS.HIGHSCORES]);
      expect(stored['cyber-viper']).toBe(1500);
    });

    it('does not overwrite high score if new score is equal or lower', () => {
      storageManager.setHighScore('falling-poly', 5000);
      
      const lowerAttempt = storageManager.setHighScore('falling-poly', 3200);
      expect(lowerAttempt).toBe(false);
      expect(storageManager.getHighScore('falling-poly')).toBe(5000);

      const equalAttempt = storageManager.setHighScore('falling-poly', 5000);
      expect(equalAttempt).toBe(false);
      expect(storageManager.getHighScore('falling-poly')).toBe(5000);
    });

    it('rounds floating-point scores to integers', () => {
      storageManager.setHighScore('brick-stacker', 245.8);
      expect(storageManager.getHighScore('brick-stacker')).toBe(246);
    });

    it('rejects invalid scores (NaN, strings, negative/infinite numbers)', () => {
      expect(storageManager.setHighScore('matrix-2048', NaN)).toBe(false);
      expect(storageManager.setHighScore('matrix-2048', '9999')).toBe(false);
      expect(storageManager.setHighScore('', 100)).toBe(false);
    });

    it('retrieves all high scores via getAllHighScores()', () => {
      storageManager.setHighScore('game-a', 100);
      storageManager.setHighScore('game-b', 250);
      storageManager.setHighScore('game-c', 400);

      const allScores = storageManager.getAllHighScores();
      expect(allScores).toEqual({
        'game-a': 100,
        'game-b': 250,
        'game-c': 400
      });
    });
  });

  describe('Console Settings Operations', () => {
    it('returns factory default settings initially', () => {
      const settings = storageManager.getSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
      expect(settings.volume).toBe(0.8);
      expect(settings.soundMuted).toBe(false);
      expect(settings.difficulty).toBe('MEDIUM');
      expect(settings.theme).toBe('vintage');
    });

    it('merges partial setting updates without overwriting untouched keys', () => {
      const saved = storageManager.saveSettings({ volume: 0.4, theme: 'amber' });
      expect(saved).toBe(true);

      const updated = storageManager.getSettings();
      expect(updated.volume).toBe(0.4);
      expect(updated.theme).toBe('amber');
      expect(updated.difficulty).toBe('MEDIUM'); // Preserved from DEFAULT_SETTINGS
      expect(updated.soundMuted).toBe(false);    // Preserved from DEFAULT_SETTINGS
    });

    it('rejects invalid settings inputs gracefully', () => {
      expect(storageManager.saveSettings(null)).toBe(false);
      expect(storageManager.saveSettings(undefined)).toBe(false);
      expect(storageManager.saveSettings('invalid-settings')).toBe(false);
    });
  });

  describe('Versioned Key & Prefix Management', () => {
    it('automatically prefixes keys with RETRO_BRICK_V1_ if missing', () => {
      storageManager.setData('CUSTOM_METRIC', { streak: 5 });
      expect(mockStorageBackend['RETRO_BRICK_V1_CUSTOM_METRIC']).toBeDefined();
      expect(JSON.parse(mockStorageBackend['RETRO_BRICK_V1_CUSTOM_METRIC'])).toEqual({ streak: 5 });
    });

    it('does not double-prefix keys that already contain the prefix', () => {
      const fullKey = `${STORAGE_KEYS.PREFIX}PLAYER_ID`;
      storageManager.setData(fullKey, 'USR-90210');
      expect(mockStorageBackend[fullKey]).toBe(JSON.stringify('USR-90210'));
      expect(mockStorageBackend[`${STORAGE_KEYS.PREFIX}${fullKey}`]).toBeUndefined();
    });

    it('returns defaultValue when requested key does not exist', () => {
      const result = storageManager.getData('NON_EXISTENT_KEY', 'default-val');
      expect(result).toBe('default-val');
    });
  });

  describe('Corrupted JSON Recovery', () => {
    it('gracefully recovers when localStorage contains corrupted JSON', () => {
      // Intentionally insert malformed JSON string into mock storage
      mockStorageBackend[STORAGE_KEYS.HIGHSCORES] = '{"incomplete-json:';

      // getHighScore should not throw SyntaxError, but return fallback 0
      expect(() => {
        const score = storageManager.getHighScore('cyber-viper');
        expect(score).toBe(0);
      }).not.toThrow();

      // getData should return defaultValue on corrupted raw data
      const data = storageManager.getData(STORAGE_KEYS.HIGHSCORES, { fallback: true });
      expect(data).toEqual({ fallback: true });
    });

    it('uses memoryStore fallback value if available during JSON parse failure', () => {
      // First save valid data so memoryStore has the copy
      storageManager.setData('TEST_KEY', { valid: 42 });
      
      // Corrupt the underlying localStorage representation
      mockStorageBackend[`${STORAGE_KEYS.PREFIX}TEST_KEY`] = 'INVALID_JSON{{{';

      // getData should fall through to memoryStore and still return valid data
      const retrieved = storageManager.getData('TEST_KEY', { valid: 0 });
      expect(retrieved).toEqual({ valid: 42 });
    });
  });

  describe('Storage Quota & Fallback In-Memory Storage', () => {
    it('transparently falls back to in-memory store when localStorage.setItem throws QuotaExceededError', () => {
      const quotaLimitedStorage = createMockLocalStorage(true);
      vi.stubGlobal('window', { localStorage: quotaLimitedStorage });
      
      const quotaManager = new StorageManager();
      
      // Attempting to set data will trigger quota error in localStorage, but memoryStore should catch it
      const success = quotaManager.setData('HIGH_SCORE_SESSION', 9999);
      expect(success).toBe(true);

      // Value should be readable from memoryStore
      const retrieved = quotaManager.getData('HIGH_SCORE_SESSION', 0);
      expect(retrieved).toBe(9999);
    });

    it('functions fully in standalone headless/memory mode', () => {
      vi.stubGlobal('window', undefined);
      const memManager = new StorageManager();
      
      expect(memManager.setHighScore('iron-tanks', 880)).toBe(true);
      expect(memManager.getHighScore('iron-tanks')).toBe(880);
      
      memManager.saveSettings({ theme: 'cyber', volume: 0.5 });
      expect(memManager.getSettings().theme).toBe('cyber');
      expect(memManager.getSettings().volume).toBe(0.5);
    });
  });

  describe('resetAllData()', () => {
    it('removes only RETRO_BRICK_V1_ prefixed keys and preserves external localStorage items', () => {
      mockStorageBackend['RETRO_BRICK_V1_HIGHSCORES'] = '{"game":10}';
      mockStorageBackend['RETRO_BRICK_V1_SETTINGS'] = '{"volume":0.2}';
      mockStorageBackend['OTHER_APP_DATA'] = 'preserve-me';

      storageManager.resetAllData();

      expect(mockStorageBackend['RETRO_BRICK_V1_HIGHSCORES']).toBeUndefined();
      expect(mockStorageBackend['RETRO_BRICK_V1_SETTINGS']).toBeUndefined();
      expect(mockStorageBackend['OTHER_APP_DATA']).toBe('preserve-me');
      expect(storageManager.memoryStore.size).toBe(0);
    });
  });
});
