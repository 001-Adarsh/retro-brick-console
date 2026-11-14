import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager, STORAGE_KEYS } from '../../src/js/core/StorageManager.js';
import {
  VALID_STORAGE_STATE,
  CORRUPTED_STORAGE_STATES,
} from '../fixtures/storage-fixtures.js';

describe('StorageManager Unit & Resilience Tests', () => {
  let mockStore = {};
  let storage;

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: vi.fn((key) => mockStore[key] ?? null),
      setItem: vi.fn((key, value) => {
        mockStore[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete mockStore[key];
      }),
      clear: vi.fn(() => {
        mockStore = {};
      }),
      get length() {
        return Object.keys(mockStore).length;
      },
      key: vi.fn((i) => Object.keys(mockStore)[i] || null),
    };

    globalThis.localStorage = mockLocalStorage;
    globalThis.window = { localStorage: mockLocalStorage };
    storage = new StorageManager();
  });

  it('retrieves high score safely or returns default 0', () => {
    expect(storage.getHighScore('brick-stacker')).toBe(0);
    storage.setHighScore('brick-stacker', 1500);
    expect(storage.getHighScore('brick-stacker')).toBe(1500);
  });

  it('only overwrites high score if the new score is strictly greater', () => {
    storage.setHighScore('iron-tanks', 2000);
    expect(storage.getHighScore('iron-tanks')).toBe(2000);

    // Lower score should not overwrite
    storage.setHighScore('iron-tanks', 1200);
    expect(storage.getHighScore('iron-tanks')).toBe(2000);

    // Higher score overwrites
    storage.setHighScore('iron-tanks', 3500);
    expect(storage.getHighScore('iron-tanks')).toBe(3500);
  });

  it('recovers gracefully from syntax corrupted JSON in localStorage', () => {
    mockStore[STORAGE_KEYS.HIGHSCORES] = CORRUPTED_STORAGE_STATES.INVALID_JSON_SYNTAX;

    const resilientStorage = new StorageManager();
    // Does not throw and returns default 0
    expect(resilientStorage.getHighScore('brick-stacker')).toBe(0);

    // Can still safely write new scores
    resilientStorage.setHighScore('brick-stacker', 800);
    expect(resilientStorage.getHighScore('brick-stacker')).toBe(800);
  });

  it('recovers gracefully from truncated JSON string', () => {
    mockStore[STORAGE_KEYS.HIGHSCORES] = CORRUPTED_STORAGE_STATES.TRUNCATED_JSON;

    const resilientStorage = new StorageManager();
    expect(resilientStorage.getHighScore('turbo-highway')).toBe(0);
  });

  it('persists and restores user settings', () => {
    storage.saveSettings({
      theme: 'amber',
      volume: 0.85,
      difficulty: 'HARD',
    });

    const settings = storage.getSettings();
    expect(settings.theme).toBe('amber');
    expect(settings.volume).toBe(0.85);
    expect(settings.difficulty).toBe('HARD');
  });

  it('falls back to in-memory storage if localStorage throws quota exception', () => {
    globalThis.window.localStorage.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });

    const fallbackStorage = new StorageManager();
    // Setting score should not throw exception
    expect(() => fallbackStorage.setHighScore('cyber-viper', 4000)).not.toThrow();
    // Should still retrieve the score from in-memory fallback
    expect(fallbackStorage.getHighScore('cyber-viper')).toBe(4000);
  });

  it('clears all data and resets to factory defaults', () => {
    storage.setHighScore('brick-stacker', 1000);
    storage.saveSettings({ volume: 0.2 });

    storage.resetAllData();
    expect(storage.getHighScore('brick-stacker')).toBe(0);
    expect(storage.getSettings().volume).toBe(0.8);
  });
});
