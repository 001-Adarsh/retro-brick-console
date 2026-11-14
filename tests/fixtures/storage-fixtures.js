/**
 * Storage Fixtures for testing StorageManager and persistence resilience
 */

export const VALID_STORAGE_STATE = {
  RETRO_BRICK_V1_SCORES: JSON.stringify({
    'brick-stacker': 1200,
    'turbo-highway': 3450,
    'iron-tanks': 2800,
    'cyber-viper': 4500,
    'falling-poly': 8900,
    'cosmo-defender': 5100,
    'bounce-duel': 7,
    'grid-tactics': 3,
    'four-in-line': 4,
    'reflex-rush': 210,
  }),
  RETRO_BRICK_V1_SETTINGS: JSON.stringify({
    volume: 75,
    isMuted: false,
    difficulty: 'medium',
    theme: 'pea-soup',
    duoMode: false,
    haptics: true,
  }),
};

export const CORRUPTED_STORAGE_STATES = {
  INVALID_JSON_SYNTAX: '{ "scores": [ unquoted_value, , }',
  TRUNCATED_JSON: '{"brick-stacker": 1200, "turbo-high',
  NON_OBJECT_JSON: '"string-instead-of-object"',
  ARRAY_INSTEAD_OF_OBJECT: '[1, 2, 3, 4]',
  OUT_OF_BOUNDS_SCORES: JSON.stringify({
    'brick-stacker': -500,
    'turbo-highway': Infinity,
    'iron-tanks': NaN,
    'cyber-viper': 999999999999,
    'malicious-script': '<script>alert(1)</script>',
  }),
};

export const LEGACY_STORAGE_V0 = {
  BRICK_SCORES: JSON.stringify({
    gameA: 500,
    gameB: 800,
  }),
  BRICK_SOUND: 'true',
};
