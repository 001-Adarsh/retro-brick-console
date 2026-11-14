import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputController, InputActions } from '../src/js/ui/InputController.js';

describe('InputController', () => {
  let controller;
  let mockWindow;
  let mockDocument;
  let eventListeners;

  beforeEach(() => {
    eventListeners = {};
    mockWindow = {
      addEventListener: vi.fn((event, handler) => {
        eventListeners[event] = handler;
      }),
      removeEventListener: vi.fn((event, handler) => {
        if (eventListeners[event] === handler) {
          delete eventListeners[event];
        }
      }),
      navigator: {
        vibrate: vi.fn()
      }
    };

    mockDocument = {
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => [])
    };

    vi.stubGlobal('window', mockWindow);
    vi.stubGlobal('document', mockDocument);
    vi.stubGlobal('navigator', mockWindow.navigator);

    controller = new InputController({ hapticsEnabled: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('Key Mappings & Action Normalization', () => {
    it('contains all standard InputActions constants', () => {
      expect(InputActions.UP).toBe('UP');
      expect(InputActions.DOWN).toBe('DOWN');
      expect(InputActions.LEFT).toBe('LEFT');
      expect(InputActions.RIGHT).toBe('RIGHT');
      expect(InputActions.ACTION_A).toBe('ACTION_A');
      expect(InputActions.ACTION_B).toBe('ACTION_B');
      expect(InputActions.START).toBe('START');
      expect(InputActions.SELECT).toBe('SELECT');
      expect(InputActions.RESET).toBe('RESET');
      expect(InputActions.SOUND).toBe('SOUND');
      expect(InputActions.PAUSE).toBe('PAUSE');
      expect(InputActions.MENU).toBe('MENU');
    });

    it('maps ArrowKeys to directional actions', () => {
      expect(controller.keyMap['ArrowUp']).toBe(InputActions.UP);
      expect(controller.keyMap['ArrowDown']).toBe(InputActions.DOWN);
      expect(controller.keyMap['ArrowLeft']).toBe(InputActions.LEFT);
      expect(controller.keyMap['ArrowRight']).toBe(InputActions.RIGHT);
    });

    it('maps WASD keys to directional actions', () => {
      expect(controller.keyMap['KeyW']).toBe(InputActions.UP);
      expect(controller.keyMap['KeyS']).toBe(InputActions.DOWN);
      expect(controller.keyMap['KeyA']).toBe(InputActions.LEFT);
      expect(controller.keyMap['KeyD']).toBe(InputActions.RIGHT);
    });

    it('maps Action buttons (Space, Shift, J, K, Z, X)', () => {
      expect(controller.keyMap['Space']).toBe(InputActions.ACTION_A);
      expect(controller.keyMap['KeyJ']).toBe(InputActions.ACTION_A);
      expect(controller.keyMap['KeyZ']).toBe(InputActions.ACTION_A);

      expect(controller.keyMap['ShiftLeft']).toBe(InputActions.ACTION_B);
      expect(controller.keyMap['ShiftRight']).toBe(InputActions.ACTION_B);
      expect(controller.keyMap['KeyK']).toBe(InputActions.ACTION_B);
      expect(controller.keyMap['KeyX']).toBe(InputActions.ACTION_B);
    });

    it('maps Console function keys (Enter, Tab, P, M, R, Escape)', () => {
      expect(controller.keyMap['Enter']).toBe(InputActions.START);
      expect(controller.keyMap['Tab']).toBe(InputActions.SELECT);
      expect(controller.keyMap['KeyP']).toBe(InputActions.PAUSE);
      expect(controller.keyMap['KeyM']).toBe(InputActions.SOUND);
      expect(controller.keyMap['KeyR']).toBe(InputActions.RESET);
      expect(controller.keyMap['Escape']).toBe(InputActions.MENU);
    });
  });

  describe('isDown, isJustPressed, isJustReleased', () => {
    it('correctly transitions state when button is pressed and released', () => {
      expect(controller.isDown(InputActions.UP)).toBe(false);
      expect(controller.isJustPressed(InputActions.UP)).toBe(false);
      expect(controller.isJustReleased(InputActions.UP)).toBe(false);

      // Simulate key down
      controller._setPressed(InputActions.UP, true);
      expect(controller.isDown(InputActions.UP)).toBe(true);
      expect(controller.isJustPressed(InputActions.UP)).toBe(true);
      expect(controller.isJustReleased(InputActions.UP)).toBe(false);

      // Simulate clearJustPressed at the end of frame
      controller.clearJustPressed();
      expect(controller.isDown(InputActions.UP)).toBe(true); // Still down
      expect(controller.isJustPressed(InputActions.UP)).toBe(false); // No longer just pressed

      // Simulate key up
      controller._setPressed(InputActions.UP, false);
      expect(controller.isDown(InputActions.UP)).toBe(false);
      expect(controller.isJustPressed(InputActions.UP)).toBe(false);
      expect(controller.isJustReleased(InputActions.UP)).toBe(true); // Just released

      // End of next frame
      controller.clearJustPressed();
      expect(controller.isJustReleased(InputActions.UP)).toBe(false);
    });

    it('consume(action) immediately consumes isJustPressed flag', () => {
      controller._setPressed(InputActions.ACTION_A, true);
      expect(controller.isJustPressed(InputActions.ACTION_A)).toBe(true);

      controller.consume(InputActions.ACTION_A);
      expect(controller.isJustPressed(InputActions.ACTION_A)).toBe(false);
      expect(controller.isDown(InputActions.ACTION_A)).toBe(true); // Down state remains unchanged
    });

    it('does not re-trigger isJustPressed on repeat keydown events when already held down', () => {
      controller.attach();

      // First key down
      eventListeners['keydown']({
        code: 'Space',
        preventDefault: vi.fn(),
        repeat: false
      });
      expect(controller.isJustPressed(InputActions.ACTION_A)).toBe(true);

      controller.clearJustPressed();
      expect(controller.isJustPressed(InputActions.ACTION_A)).toBe(false);

      // OS repeat key down
      eventListeners['keydown']({
        code: 'Space',
        preventDefault: vi.fn(),
        repeat: true // Repeated key
      });
      expect(controller.isJustPressed(InputActions.ACTION_A)).toBe(false);
      expect(controller.isDown(InputActions.ACTION_A)).toBe(true);
    });
  });

  describe('Keyboard Event Dispatch & Prevention', () => {
    it('prevents default browser scrolling on arrow and space keys', () => {
      controller.attach();
      const preventDefault = vi.fn();

      eventListeners['keydown']({
        code: 'ArrowDown',
        preventDefault,
        repeat: false
      });
      expect(preventDefault).toHaveBeenCalled();
      expect(controller.isDown(InputActions.DOWN)).toBe(true);

      eventListeners['keyup']({
        code: 'ArrowDown',
        preventDefault: vi.fn()
      });
      expect(controller.isDown(InputActions.DOWN)).toBe(false);
      expect(controller.isJustReleased(InputActions.DOWN)).toBe(true);
    });
  });

  describe('Delayed Auto Shift (DAS) checkAutoRepeat', () => {
    it('handles initial press timing and repeats at repeatRate after initialDelay', () => {
      let currentTime = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

      // Button is not down yet
      expect(controller.checkAutoRepeat(InputActions.LEFT, 200, 50)).toBe(false);

      // Press button down at t = 1000
      controller._setPressed(InputActions.LEFT, true);
      expect(controller.isDown(InputActions.LEFT)).toBe(true);
      expect(controller.isJustPressed(InputActions.LEFT)).toBe(true);

      // Initial press: checkAutoRepeat fires immediately
      expect(controller.checkAutoRepeat(InputActions.LEFT, 200, 50)).toBe(true);

      // At t = 1100 (100ms elapsed, less than initialDelay 200ms) -> false
      currentTime = 1100;
      expect(controller.checkAutoRepeat(InputActions.LEFT, 200, 50)).toBe(false);

      // At t = 1205 (205ms elapsed >= 200ms initialDelay) -> fires repeat
      currentTime = 1205;
      expect(controller.checkAutoRepeat(InputActions.LEFT, 200, 50)).toBe(true);

      // At t = 1225 (20ms later, less than 50ms repeat rate) -> false
      currentTime = 1225;
      expect(controller.checkAutoRepeat(InputActions.LEFT, 200, 50)).toBe(false);

      // At t = 1260 (55ms later >= 50ms repeat rate) -> fires next repeat
      currentTime = 1260;
      expect(controller.checkAutoRepeat(InputActions.LEFT, 200, 50)).toBe(true);

      // Release button -> resets DAS state
      controller._setPressed(InputActions.LEFT, false);
      expect(controller.checkAutoRepeat(InputActions.LEFT, 200, 50)).toBe(false);
    });
  });

  describe('Virtual Tactile Button Binding & Pointer Events', () => {
    let mockElement;
    let boundListeners;

    beforeEach(() => {
      boundListeners = {};
      mockElement = {
        style: {},
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        },
        addEventListener: vi.fn((event, handler) => {
          boundListeners[event] = handler;
        }),
        removeEventListener: vi.fn((event, handler) => {
          if (boundListeners[event] === handler) {
            delete boundListeners[event];
          }
        }),
        setPointerCapture: vi.fn(),
        releasePointerCapture: vi.fn(),
        hasPointerCapture: vi.fn(() => true)
      };
    });

    it('binds pointer events to DOM elements and sets touch-action: manipulation', () => {
      controller.bindButton(mockElement, InputActions.ACTION_A);

      expect(mockElement.style.touchAction).toBe('manipulation');
      expect(mockElement.addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(mockElement.addEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function));
    });

    it('activates action on pointerdown and cleans on pointerup', () => {
      controller.bindButton(mockElement, InputActions.ACTION_B);

      // Trigger pointerdown
      boundListeners['pointerdown']({
        pointerId: 1,
        preventDefault: vi.fn()
      });

      expect(mockElement.classList.add).toHaveBeenCalledWith('active');
      expect(controller.isDown(InputActions.ACTION_B)).toBe(true);
      expect(controller.isJustPressed(InputActions.ACTION_B)).toBe(true);
      expect(mockWindow.navigator.vibrate).toHaveBeenCalledWith(12);

      // Trigger pointerup
      boundListeners['pointerup']({
        pointerId: 1,
        preventDefault: vi.fn()
      });

      expect(mockElement.classList.remove).toHaveBeenCalledWith('active');
      expect(controller.isDown(InputActions.ACTION_B)).toBe(false);
      expect(controller.isJustReleased(InputActions.ACTION_B)).toBe(true);
    });
  });

  describe('Lifecycle attach() & detach()', () => {
    it('attaches and cleanly removes window event listeners without memory leaks', () => {
      controller.attach();
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(controller.isAttached).toBe(true);

      controller.detach();
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(controller.isAttached).toBe(false);
    });
  });
});
