/**
 * Multiplayer Fixtures for testing Duo Mode, simultaneous inputs, and turn enforcement
 */
import { vi } from 'vitest';
import { createMockRenderer, createMockSound } from './game-fixtures.js';

export function createMockDuoInput() {
  const p1Down = new Map();
  const p1JustPressed = new Map();
  const p2Down = new Map();
  const p2JustPressed = new Map();

  const p1 = {
    isDown: vi.fn((action) => !!p1Down.get(action)),
    isJustPressed: vi.fn((action) => !!p1JustPressed.get(action)),
    isActionPressed: vi.fn((action) => !!p1Down.get(action)),
    isActionJustPressed: vi.fn((action) => !!p1JustPressed.get(action)),
    press: (action) => {
      p1Down.set(action, true);
      p1JustPressed.set(action, true);
    },
    release: (action) => {
      p1Down.set(action, false);
      p1JustPressed.delete(action);
    },
    clearJustPressed: () => p1JustPressed.clear(),
  };

  const p2 = {
    isDown: vi.fn((action) => !!p2Down.get(action)),
    isJustPressed: vi.fn((action) => !!p2JustPressed.get(action)),
    isActionPressed: vi.fn((action) => !!p2Down.get(action)),
    isActionJustPressed: vi.fn((action) => !!p2JustPressed.get(action)),
    press: (action) => {
      p2Down.set(action, true);
      p2JustPressed.set(action, true);
    },
    release: (action) => {
      p2Down.set(action, false);
      p2JustPressed.delete(action);
    },
    clearJustPressed: () => p2JustPressed.clear(),
  };

  return {
    p1,
    p2,
    isDown: vi.fn((action) => p1.isDown(action) || p2.isDown(action)),
    isJustPressed: vi.fn((action) => p1.isJustPressed(action) || p2.isJustPressed(action)),
    isActionPressed: vi.fn((action) => p1.isDown(action) || p2.isDown(action)),
    isActionJustPressed: vi.fn((action) => p1.isJustPressed(action) || p2.isJustPressed(action)),
    clearJustPressed: () => {
      p1.clearJustPressed();
      p2.clearJustPressed();
    },
  };
}

export function createMockDuoContext(overrides = {}) {
  const renderer = createMockRenderer();
  const sound = createMockSound();
  const input = createMockDuoInput();

  return {
    renderer,
    subRenderer: renderer,
    sound,
    input,
    storage: {
      getHighScore: vi.fn(() => 1000),
      setHighScore: vi.fn(() => true),
      getSettings: vi.fn(() => ({ difficulty: 'MEDIUM' })),
      saveSettings: vi.fn(),
    },
    difficulty: 'MEDIUM',
    isDuoMode: true,
    playerCount: 2,
    isDuo: vi.fn(() => true),
    onScore: vi.fn(),
    onGameOver: vi.fn(),
    onLevelUp: vi.fn(),
    onLivesChange: vi.fn(),
    onDuoScore: vi.fn(),
    onDuoGameOver: vi.fn(),
    ...overrides,
  };
}
