/**
 * Retro Brick Game Console - StorageManager
 * Defensive persistence layer with versioned keys and in-memory fallback.
 */

export const STORAGE_KEYS = {
  HIGHSCORES: 'RETRO_BRICK_V1_HIGHSCORES',
  SETTINGS: 'RETRO_BRICK_V1_SETTINGS',
  PREFIX: 'RETRO_BRICK_V1_'
};

export const DEFAULT_SETTINGS = {
  volume: 0.8,
  soundMuted: false,
  difficulty: 'MEDIUM', // 'EASY' | 'MEDIUM' | 'HARD'
  theme: 'vintage',     // 'vintage' | 'mono' | 'amber' | 'cyber'
  vibration: true
};

export class StorageManager {
  constructor() {
    this.memoryStore = new Map();
    this.isLocalStorageAvailable = this._checkStorageAvailability();
  }

  /**
   * Safely probes whether window.localStorage is accessible and writable.
   * @private
   * @returns {boolean}
   */
  _checkStorageAvailability() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const probeKey = '__storage_probe__';
      window.localStorage.setItem(probeKey, probeKey);
      window.localStorage.removeItem(probeKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Retrieves the persisted high score for a specific game.
   * @param {string} gameId 
   * @returns {number}
   */
  getHighScore(gameId) {
    if (!gameId) return 0;
    const scores = this.getAllHighScores();
    const val = scores[gameId];
    return typeof val === 'number' && !isNaN(val) ? val : 0;
  }

  /**
   * Updates and persists the high score for a game if the new score exceeds current.
   * @param {string} gameId 
   * @param {number} score 
   * @returns {boolean} True if a new high score was established
   */
  setHighScore(gameId, score) {
    if (!gameId || typeof score !== 'number' || isNaN(score)) {
      return false;
    }

    const currentHigh = this.getHighScore(gameId);
    if (score > currentHigh) {
      const scores = this.getAllHighScores();
      scores[gameId] = Math.round(score);
      this.setData(STORAGE_KEYS.HIGHSCORES, scores);
      return true;
    }
    return false;
  }

  /**
   * Returns a dictionary of all recorded high scores.
   * @returns {Object.<string, number>}
   */
  getAllHighScores() {
    return this.getData(STORAGE_KEYS.HIGHSCORES, {});
  }

  /**
   * Retrieves console settings merged with defaults.
   * @returns {typeof DEFAULT_SETTINGS}
   */
  getSettings() {
    const saved = this.getData(STORAGE_KEYS.SETTINGS, {});
    return { ...DEFAULT_SETTINGS, ...saved };
  }

  /**
   * Saves partial or complete console settings.
   * @param {Partial<typeof DEFAULT_SETTINGS>} newSettings 
   * @returns {boolean}
   */
  saveSettings(newSettings) {
    if (!newSettings || typeof newSettings !== 'object') return false;
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    return this.setData(STORAGE_KEYS.SETTINGS, merged);
  }

  /**
   * Resets all stored high scores and settings to factory defaults.
   */
  resetAllData() {
    try {
      if (this.isLocalStorageAvailable) {
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith(STORAGE_KEYS.PREFIX)) {
            keysToRemove.push(key);
          }
        }
        for (const k of keysToRemove) {
          window.localStorage.removeItem(k);
        }
      }
    } catch (e) {
      // Ignore storage clear error
    }
    this.memoryStore.clear();
  }

  /**
   * Generic versioned getter.
   * @template T
   * @param {string} key 
   * @param {T} defaultValue 
   * @returns {T}
   */
  getData(key, defaultValue) {
    const fullKey = key.startsWith(STORAGE_KEYS.PREFIX) ? key : `${STORAGE_KEYS.PREFIX}${key}`;
    try {
      if (this.isLocalStorageAvailable) {
        const raw = window.localStorage.getItem(fullKey);
        if (raw !== null) {
          return JSON.parse(raw);
        }
      } else if (this.memoryStore.has(fullKey)) {
        return this.memoryStore.get(fullKey);
      }
    } catch (e) {
      // Fall through to memory store or default
      if (this.memoryStore.has(fullKey)) {
        return this.memoryStore.get(fullKey);
      }
    }
    return defaultValue;
  }

  /**
   * Generic versioned setter.
   * @template T
   * @param {string} key 
   * @param {T} value 
   * @returns {boolean}
   */
  setData(key, value) {
    const fullKey = key.startsWith(STORAGE_KEYS.PREFIX) ? key : `${STORAGE_KEYS.PREFIX}${key}`;
    try {
      const serialized = JSON.stringify(value);
      if (this.isLocalStorageAvailable) {
        window.localStorage.setItem(fullKey, serialized);
      }
      this.memoryStore.set(fullKey, JSON.parse(serialized));
      return true;
    } catch (e) {
      try {
        this.memoryStore.set(fullKey, JSON.parse(JSON.stringify(value)));
        return true;
      } catch (err) {
        return false;
      }
    }
  }
}
