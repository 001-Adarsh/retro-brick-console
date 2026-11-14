/**
 * Game Fixtures providing mock GameContext, mock Renderer, and lifecycle harnesses
 */
import { vi } from 'vitest';

export function createMockRenderer() {
  const primaryBuffer = Array(20).fill(null).map(() => Array(10).fill(0));
  const subBuffer = Array(4).fill(null).map(() => Array(4).fill(0));

  return {
    primaryBuffer,
    subBuffer,
    clear: vi.fn(() => {
      for (let r = 0; r < 20; r++) primaryBuffer[r].fill(0);
    }),
    clearSub: vi.fn(() => {
      for (let r = 0; r < 4; r++) subBuffer[r].fill(0);
    }),
    setPixel: vi.fn((x, y, state = 1) => {
      if (x >= 0 && x < 10 && y >= 0 && y < 20) {
        primaryBuffer[y][x] = state;
      }
    }),
    getPixel: vi.fn((x, y) => {
      if (x >= 0 && x < 10 && y >= 0 && y < 20) {
        return primaryBuffer[y][x];
      }
      return 0;
    }),
    drawPixel: vi.fn((x, y, state = 1) => {
      if (x >= 0 && x < 10 && y >= 0 && y < 20) {
        primaryBuffer[y][x] = state;
      }
    }),
    drawSubPixel: vi.fn((x, y, state = 1) => {
      if (x >= 0 && x < 4 && y >= 0 && y < 4) {
        subBuffer[y][x] = state;
      }
    }),
    drawMatrix: vi.fn(),
    drawSprite: vi.fn(),
    drawText: vi.fn(),
    drawRect: vi.fn(),
    render: vi.fn(),
  };
}

export function createMockSound() {
  return {
    playTone: vi.fn(),
    playNoise: vi.fn(),
    playSfx: vi.fn(),
    playScore: vi.fn(),
    playGameOver: vi.fn(),
    playMove: vi.fn(),
    playRotate: vi.fn(),
    playDrop: vi.fn(),
    playExplosion: vi.fn(),
    playShoot: vi.fn(),
    playBeep: vi.fn(),
    playBounce: vi.fn(),
    playVictory: vi.fn(),
    playLevelUp: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    isMuted: vi.fn(() => false),
  };
}

export function createMockInput() {
  const downMap = new Map();
  const justPressedMap = new Map();

  const controller = {
    downMap,
    justPressedMap,
    isDown: vi.fn((action) => !!downMap.get(action)),
    isJustPressed: vi.fn((action) => !!justPressedMap.get(action)),
    isJustReleased: vi.fn(() => false),
    isActionPressed: vi.fn((action) => !!downMap.get(action)),
    isActionJustPressed: vi.fn((action) => !!justPressedMap.get(action)),
    checkAutoRepeat: vi.fn((action) => !!downMap.get(action)),
    consume: vi.fn((action) => justPressedMap.delete(action)),
    press: (action) => {
      downMap.set(action, true);
      justPressedMap.set(action, true);
    },
    release: (action) => {
      downMap.set(action, false);
      justPressedMap.delete(action);
    },
    clearJustPressed: () => {
      justPressedMap.clear();
    },
  };

  // Provide p1 and p2 proxy objects
  controller.p1 = {
    isDown: vi.fn((action) => controller.isDown(action)),
    isJustPressed: vi.fn((action) => controller.isJustPressed(action)),
    isActionPressed: vi.fn((action) => controller.isDown(action)),
    isActionJustPressed: vi.fn((action) => controller.isJustPressed(action)),
    press: (action) => controller.press(action),
    release: (action) => controller.release(action),
  };

  controller.p2 = {
    isDown: vi.fn((action) => controller.isDown(action)),
    isJustPressed: vi.fn((action) => controller.isJustPressed(action)),
    isActionPressed: vi.fn((action) => controller.isDown(action)),
    isActionJustPressed: vi.fn((action) => controller.isJustPressed(action)),
    press: (action) => controller.press(action),
    release: (action) => controller.release(action),
  };

  return controller;
}

export function createMockGameContext(overrides = {}) {
  const renderer = createMockRenderer();
  const sound = createMockSound();
  const input = createMockInput();

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
      getSetting: vi.fn((key, def) => def),
      setSetting: vi.fn(),
    },
    difficulty: 'MEDIUM',
    isDuoMode: false,
    playerCount: 1,
    isDuo: vi.fn(() => false),
    onScore: vi.fn(),
    onGameOver: vi.fn(),
    onLevelUp: vi.fn(),
    onLivesChange: vi.fn(),
    onDuoScore: vi.fn(),
    onDuoGameOver: vi.fn(),
    ...overrides,
  };
}
