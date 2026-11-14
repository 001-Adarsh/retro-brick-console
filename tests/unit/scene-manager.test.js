import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenManager, ScreenState, GAMES_CATALOG } from '../../src/js/ui/ScreenManager.js';

describe('ScreenManager (Scene Manager) Unit Tests', () => {
  let screenManager;
  let mockModalManager;
  let mockHud;
  let mockInput;
  let mockSound;
  let mockStorage;
  let mockEngine;

  beforeEach(() => {
    mockModalManager = {
      open: vi.fn(),
      close: vi.fn(),
      closeAll: vi.fn(),
      isOpen: vi.fn(() => false),
    };

    mockHud = {
      updateScore: vi.fn(),
      updateLevel: vi.fn(),
      updateSpeed: vi.fn(),
      updateHiScore: vi.fn(),
      setPaused: vi.fn(),
      setMuted: vi.fn(),
      setDuoMode: vi.fn(),
      updateDuoScores: vi.fn(),
      announce: vi.fn(),
    };

    mockInput = {
      isJustPressed: vi.fn(() => false),
      consume: vi.fn(),
    };

    mockSound = {
      playMove: vi.fn(),
      playScore: vi.fn(),
      playGameOver: vi.fn(),
    };

    mockStorage = {
      getHighScore: vi.fn(() => 500),
      setHighScore: vi.fn(),
      getSettings: vi.fn(() => ({})),
      saveSettings: vi.fn(),
    };

    mockEngine = {
      loadGame: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      reset: vi.fn(),
      setDuoMode: vi.fn(),
      isDuoMode: false,
    };

    screenManager = new ScreenManager({
      modalManager: mockModalManager,
      hud: mockHud,
      input: mockInput,
      sound: mockSound,
      storage: mockStorage,
      engine: mockEngine,
    });
  });

  it('initializes in BOOT state with exactly 23 catalog titles', () => {
    expect(screenManager.state).toBe(ScreenState.BOOT);
    expect(GAMES_CATALOG.length).toBe(23);
    expect(screenManager.selectedGameIndex).toBe(0);
  });

  it('cycles through game selection correctly (wraparound)', () => {
    expect(screenManager.selectedGameIndex).toBe(0);

    // Next game
    screenManager.changeSelectedGame(1);
    expect(screenManager.selectedGameIndex).toBe(1);

    // Prev game returns to 0
    screenManager.changeSelectedGame(-1);
    expect(screenManager.selectedGameIndex).toBe(0);

    // Prev game from 0 wraps to 22 (last game)
    screenManager.changeSelectedGame(-1);
    expect(screenManager.selectedGameIndex).toBe(22);

    // Next game from 22 wraps to 0
    screenManager.changeSelectedGame(1);
    expect(screenManager.selectedGameIndex).toBe(0);
  });

  it('supports toggling duo mode and notifies engine and HUD', () => {
    expect(screenManager.isDuoMode).toBe(false);

    screenManager.setDuoMode(true);
    expect(screenManager.isDuoMode).toBe(true);
    expect(mockEngine.setDuoMode).toHaveBeenCalledWith(true);
    expect(mockHud.setDuoMode).toHaveBeenCalledWith(true);

    screenManager.toggleDuoMode();
    expect(screenManager.isDuoMode).toBe(false);
    expect(mockEngine.setDuoMode).toHaveBeenCalledWith(false);
  });

  it('transitions state to PLAYING cleanly', () => {
    screenManager.state = ScreenState.MENU;
    screenManager.transitionTo(ScreenState.PLAYING);

    expect(screenManager.state).toBe(ScreenState.PLAYING);
  });

  it('transitions state to PAUSED and back to PLAYING', () => {
    screenManager.state = ScreenState.PLAYING;
    screenManager.transitionTo(ScreenState.PAUSED);

    expect(screenManager.state).toBe(ScreenState.PAUSED);
    expect(mockEngine.pause).toHaveBeenCalled();
    expect(mockHud.setPaused).toHaveBeenCalledWith(true);

    screenManager.transitionTo(ScreenState.PLAYING);
    expect(screenManager.state).toBe(ScreenState.PLAYING);
    expect(mockEngine.resume).toHaveBeenCalled();
    expect(mockHud.setPaused).toHaveBeenCalledWith(false);
  });
});
