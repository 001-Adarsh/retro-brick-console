import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputController, InputActions } from '../src/js/ui/InputController.js';
import { HUD } from '../src/js/ui/HUD.js';
import { ModalManager } from '../src/js/ui/ModalManager.js';
import { ScreenManager, ScreenState, GAMES_CATALOG } from '../src/js/ui/ScreenManager.js';

describe('InputController', () => {
  let controller;

  beforeEach(() => {
    controller = new InputController();
  });

  it('correctly maps keyboard codes to InputActions', () => {
    expect(controller.keyMap['ArrowUp']).toBe(InputActions.UP);
    expect(controller.keyMap['ArrowDown']).toBe(InputActions.DOWN);
    expect(controller.keyMap['ArrowLeft']).toBe(InputActions.LEFT);
    expect(controller.keyMap['ArrowRight']).toBe(InputActions.RIGHT);
    expect(controller.keyMap['KeyW']).toBe(InputActions.UP);
    expect(controller.keyMap['KeyS']).toBe(InputActions.DOWN);
    expect(controller.keyMap['KeyA']).toBe(InputActions.LEFT);
    expect(controller.keyMap['KeyD']).toBe(InputActions.RIGHT);
    expect(controller.keyMap['Space']).toBe(InputActions.ACTION_A);
    expect(controller.keyMap['KeyJ']).toBe(InputActions.ACTION_A);
    expect(controller.keyMap['ShiftLeft']).toBe(InputActions.ACTION_B);
    expect(controller.keyMap['KeyK']).toBe(InputActions.ACTION_B);
    expect(controller.keyMap['Enter']).toBe(InputActions.START);
    expect(controller.keyMap['KeyP']).toBe(InputActions.PAUSE);
    expect(controller.keyMap['KeyM']).toBe(InputActions.SOUND);
    expect(controller.keyMap['KeyR']).toBe(InputActions.RESET);
    expect(controller.keyMap['Escape']).toBe(InputActions.MENU);
  });

  it('tracks isDown, isJustPressed, and isJustReleased states accurately', () => {
    expect(controller.isDown(InputActions.UP)).toBe(false);
    expect(controller.isJustPressed(InputActions.UP)).toBe(false);

    // Simulate key down
    controller._setPressed(InputActions.UP, true);
    expect(controller.isDown(InputActions.UP)).toBe(true);
    expect(controller.isJustPressed(InputActions.UP)).toBe(true);

    // Consume justPressed
    controller.consume(InputActions.UP);
    expect(controller.isJustPressed(InputActions.UP)).toBe(false);
    expect(controller.isDown(InputActions.UP)).toBe(true);

    // End of frame clear
    controller.clearJustPressed();
    expect(controller.isJustPressed(InputActions.UP)).toBe(false);

    // Release key
    controller._setPressed(InputActions.UP, false);
    expect(controller.isDown(InputActions.UP)).toBe(false);
    expect(controller.isJustReleased(InputActions.UP)).toBe(true);
  });

  it('handles Delayed Auto Shift (DAS)', () => {
    controller._setPressed(InputActions.RIGHT, true);

    // First press fires immediately
    expect(controller.checkAutoRepeat(InputActions.RIGHT, 200, 50)).toBe(true);

    // Immediate subsequent check inside delay window returns false
    expect(controller.checkAutoRepeat(InputActions.RIGHT, 200, 50)).toBe(false);
  });

  it('manages haptics configuration', () => {
    controller.setHapticsEnabled(false);
    expect(controller.isHapticsEnabled()).toBe(false);
    controller.setHapticsEnabled(true);
    expect(controller.isHapticsEnabled()).toBe(true);
  });
});

describe('HUD', () => {
  let hud;
  let mockScore, mockHiScore, mockLevel;

  beforeEach(() => {
    mockScore = { innerHTML: '' };
    mockHiScore = { innerHTML: '' };
    mockLevel = { textContent: '' };

    hud = new HUD({
      score: mockScore,
      hiScore: mockHiScore,
      level: mockLevel,
    });
  });

  it('formats 7-segment numbers with unlit leading zeroes', () => {
    expect(hud.format7Segment(0)).toBe('<span class="unlit-digits">00000</span><span>0</span>');
    expect(hud.format7Segment(5)).toBe('<span class="unlit-digits">00000</span><span>5</span>');
    expect(hud.format7Segment(4820)).toBe('<span class="unlit-digits">00</span><span>4820</span>');
    expect(hud.format7Segment(123456)).toBe('<span>123456</span>');
  });

  it('updates score and level correctly', () => {
    hud.updateScore(1500);
    expect(hud.score).toBe(1500);
    expect(mockScore.innerHTML).toContain('1500');

    hud.updateLevel(4);
    expect(hud.level).toBe(4);
    expect(mockLevel.textContent).toBe('04');
  });

  it('handles pause and sound state changes', () => {
    hud.setPaused(true);
    expect(hud.isPaused).toBe(true);
    hud.setPaused(false);
    expect(hud.isPaused).toBe(false);

    hud.setMuted(true);
    expect(hud.isMuted).toBe(true);
  });
});

describe('ModalManager', () => {
  let modalManager;
  let modalA, modalB;

  beforeEach(() => {
    modalA = {
      id: 'modal-test-a',
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      querySelector: vi.fn().mockReturnValue(null),
    };
    modalB = {
      id: 'modal-test-b',
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      querySelector: vi.fn().mockReturnValue(null),
    };

    modalManager = new ModalManager({ container: null, announcer: null });
    modalManager.register('test-a', modalA);
    modalManager.register('test-b', modalB);
  });

  it('opens and closes modals, managing stack hierarchy', () => {
    expect(modalManager.isOpen()).toBe(false);

    modalManager.open('test-a');
    expect(modalManager.isOpen('test-a')).toBe(true);
    expect(modalManager.getCurrentModalId()).toBe('test-a');
    expect(modalA.classList.remove).toHaveBeenCalledWith('hidden');

    // Open modal B on top of A
    modalManager.open('test-b');
    expect(modalManager.getCurrentModalId()).toBe('test-b');

    // Close top modal (B) returns to A
    modalManager.close();
    expect(modalManager.getCurrentModalId()).toBe('test-a');
    expect(modalB.classList.add).toHaveBeenCalledWith('hidden');

    // Close A returns to empty stack
    modalManager.close();
    expect(modalManager.isOpen()).toBe(false);
    expect(modalManager.getCurrentModalId()).toBe(null);
  });

  it('dispatches open and close event callbacks', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();

    modalManager.on('open', onOpen);
    modalManager.on('close', onClose);

    modalManager.open('test-a');
    expect(onOpen).toHaveBeenCalledWith('test-a', null);

    modalManager.close('test-a');
    expect(onClose).toHaveBeenCalledWith('test-a');
  });
});

describe('ScreenManager', () => {
  let screenManager;
  let mockModalManager, mockHud, mockInput;

  beforeEach(() => {
    mockModalManager = {
      open: vi.fn(),
      close: vi.fn(),
      closeAll: vi.fn(),
    };
    mockHud = {
      score: 100,
      level: 1,
      isMuted: false,
      setPaused: vi.fn(),
      setMuted: vi.fn(),
      announce: vi.fn(),
      updateHighScore: vi.fn(),
    };
    mockInput = {
      isHapticsEnabled: vi.fn().mockReturnValue(true),
      setHapticsEnabled: vi.fn(),
    };

    screenManager = new ScreenManager({
      modalManager: mockModalManager,
      hud: mockHud,
      input: mockInput,
    });
  });

  it('contains all 23 games in the catalog matching specs', () => {
    expect(GAMES_CATALOG.length).toBe(23);
    expect(GAMES_CATALOG[0].id).toBe('brick-stacker');
    expect(GAMES_CATALOG[1].id).toBe('turbo-highway');
    expect(GAMES_CATALOG[2].id).toBe('iron-tanks');
    expect(GAMES_CATALOG[3].id).toBe('cyber-viper');
    expect(GAMES_CATALOG[4].id).toBe('falling-poly');
    expect(GAMES_CATALOG[22].id).toBe('reflex-rush');
  });

  it('navigates the game carousel with wrap-around', () => {
    expect(screenManager.selectedGameIndex).toBe(0);

    screenManager.changeSelectedGame(1);
    expect(screenManager.selectedGameIndex).toBe(1);

    // Wrap-around backwards
    screenManager.selectedGameIndex = 0;
    screenManager.changeSelectedGame(-1);
    expect(screenManager.selectedGameIndex).toBe(22);
  });

  it('transitions state machine between states', () => {
    screenManager.transitionTo(ScreenState.PLAYING);
    expect(screenManager.state).toBe(ScreenState.PLAYING);
    expect(mockModalManager.closeAll).toHaveBeenCalled();

    screenManager.transitionTo(ScreenState.PAUSED);
    expect(screenManager.state).toBe(ScreenState.PAUSED);
    expect(mockHud.setPaused).toHaveBeenCalledWith(true);
    expect(mockModalManager.open).toHaveBeenCalledWith('pause');
  });

  it('updates difficulty and theme settings', () => {
    screenManager.setDifficulty('HARD');
    expect(screenManager.difficulty).toBe('HARD');

    screenManager.setVolume(50);
    expect(screenManager.volume).toBe(50);
  });
});
