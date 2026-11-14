/**
 * Retro Brick Game Console - Unified Input Controller
 * Handles physical keyboard events, multi-touch virtual on-screen buttons,
 * pointer tracking, haptics, and Delayed Auto Shift (DAS).
 */

export const InputActions = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  ACTION_A: 'ACTION_A',
  ACTION_B: 'ACTION_B',
  START: 'START',
  SELECT: 'SELECT',
  RESET: 'RESET',
  SOUND: 'SOUND',
  PAUSE: 'PAUSE',
  MENU: 'MENU',

  // Player 1 Dual Inputs
  P1_UP: 'P1_UP',
  P1_DOWN: 'P1_DOWN',
  P1_LEFT: 'P1_LEFT',
  P1_RIGHT: 'P1_RIGHT',
  P1_ACTION_A: 'P1_ACTION_A',
  P1_ACTION_B: 'P1_ACTION_B',

  // Player 2 Dual Inputs
  P2_UP: 'P2_UP',
  P2_DOWN: 'P2_DOWN',
  P2_LEFT: 'P2_LEFT',
  P2_RIGHT: 'P2_RIGHT',
  P2_ACTION_A: 'P2_ACTION_A',
  P2_ACTION_B: 'P2_ACTION_B',
});

// Default keyboard key mapping to InputActions
const DEFAULT_KEY_MAP = {
  // Arrow keys
  ArrowUp: InputActions.UP,
  ArrowDown: InputActions.DOWN,
  ArrowLeft: InputActions.LEFT,
  ArrowRight: InputActions.RIGHT,

  // WASD keys
  KeyW: InputActions.UP,
  KeyS: InputActions.DOWN,
  KeyA: InputActions.LEFT,
  KeyD: InputActions.RIGHT,

  // Lowercase & Uppercase direct key fallbacks
  ArrowUp: InputActions.UP,
  ArrowDown: InputActions.DOWN,
  ArrowLeft: InputActions.LEFT,
  ArrowRight: InputActions.RIGHT,
  w: InputActions.UP,
  W: InputActions.UP,
  s: InputActions.DOWN,
  S: InputActions.DOWN,
  a: InputActions.LEFT,
  A: InputActions.LEFT,
  d: InputActions.RIGHT,
  D: InputActions.RIGHT,

  // Primary Action Button A (Rotate / Fire / Select)
  Space: InputActions.ACTION_A,
  KeyJ: InputActions.ACTION_A,
  KeyZ: InputActions.ACTION_A,

  // Secondary Action Button B (Drop / Dash / Back)
  ShiftLeft: InputActions.ACTION_B,
  ShiftRight: InputActions.ACTION_B,
  KeyK: InputActions.ACTION_B,
  KeyX: InputActions.ACTION_B,

  // Function keys
  Enter: InputActions.START,
  Tab: InputActions.SELECT,
  KeyO: InputActions.SELECT,
  KeyP: InputActions.PAUSE,
  KeyM: InputActions.SOUND,
  KeyR: InputActions.RESET,
  Escape: InputActions.MENU,
};

// Duo mode mapping for independent Player 1 and Player 2 controls
const DUO_KEY_MAP = {
  // Player 1: WASD + Space/J/Z (A) + ShiftLeft/K/X (B)
  KeyW: InputActions.P1_UP,
  KeyS: InputActions.P1_DOWN,
  KeyA: InputActions.P1_LEFT,
  KeyD: InputActions.P1_RIGHT,
  Space: InputActions.P1_ACTION_A,
  KeyJ: InputActions.P1_ACTION_A,
  KeyZ: InputActions.P1_ACTION_A,
  ShiftLeft: InputActions.P1_ACTION_B,
  KeyK: InputActions.P1_ACTION_B,
  KeyX: InputActions.P1_ACTION_B,

  // Player 2: Arrow keys + Enter/L/Num0 (A) + ShiftRight/Slash/Num1/U (B)
  ArrowUp: InputActions.P2_UP,
  ArrowDown: InputActions.P2_DOWN,
  ArrowLeft: InputActions.P2_LEFT,
  ArrowRight: InputActions.P2_RIGHT,
  Enter: InputActions.P2_ACTION_A,
  KeyL: InputActions.P2_ACTION_A,
  Numpad0: InputActions.P2_ACTION_A,
  Period: InputActions.P2_ACTION_A,
  ShiftRight: InputActions.P2_ACTION_B,
  Slash: InputActions.P2_ACTION_B,
  Numpad1: InputActions.P2_ACTION_B,
  KeyU: InputActions.P2_ACTION_B,
};

export class InputController {
  constructor(options = {}) {
    this.keyMap = { ...DEFAULT_KEY_MAP, ...(options.keyMap || {}) };
    this.hapticsEnabled = options.hapticsEnabled ?? true;
    this.isDuoMode = false;

    // State maps
    this.down = new Map();
    this.justPressed = new Map();
    this.justReleased = new Map();

    // Auto-repeat (DAS) state tracking: action -> { firstPressed: number, lastFired: number, hasFiredInitial: boolean }
    this.autoRepeatState = new Map();

    // Pointer tracking: pointerId -> Set<action>
    this.activePointers = new Map();

    // Bound DOM elements for cleanup
    this.boundElements = new Map();

    // Bound event listener references
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);
    this._onContextMenu = (e) => e && e.preventDefault && e.preventDefault();

    this.isAttached = false;
  }

  /**
   * Attach keyboard and window listeners.
   */
  attach() {
    if (this.isAttached) return;
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);
      window.addEventListener('contextmenu', this._onContextMenu);
    }
    this.isAttached = true;
  }

  /**
   * Detach keyboard and window listeners and unbind all buttons.
   */
  detach() {
    if (!this.isAttached) return;
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
      window.removeEventListener('contextmenu', this._onContextMenu);
    }

    // Unbind element listeners
    for (const [element, listeners] of this.boundElements.entries()) {
      if (element && typeof element.removeEventListener === 'function') {
        element.removeEventListener('pointerdown', listeners.pointerdown);
        element.removeEventListener('pointerup', listeners.pointerup);
        element.removeEventListener('pointerleave', listeners.pointerleave);
        element.removeEventListener('pointercancel', listeners.pointercancel);
      }
    }
    this.boundElements.clear();
    this.activePointers.clear();
    this.isAttached = false;
  }

  /**
   * Check if an action is currently held down.
   * @param {string} action 
   * @returns {boolean}
   */
  isDown(action) {
    return !!this.down.get(action);
  }

  /**
   * Check if an action was pressed on this tick.
   * @param {string} action 
   * @returns {boolean}
   */
  isJustPressed(action) {
    return !!this.justPressed.get(action);
  }

  /**
   * Check if an action was released on this tick.
   * @param {string} action 
   * @returns {boolean}
   */
  isJustReleased(action) {
    return !!this.justReleased.get(action);
  }

  /**
   * Set Solo or Duo mode for input isolation.
   * @param {boolean} enabled 
   */
  setDuoMode(enabled) {
    this.isDuoMode = !!enabled;
  }

  /**
   * Player 1 input proxy helper for Duo mode.
   */
  get p1() {
    return {
      isDown: (action) => this.isDown(`P1_${action}`) || this.isDown(`P1_ACTION_${action}`) || (action.startsWith('P1_') && this.isDown(action)),
      isJustPressed: (action) => this.isJustPressed(`P1_${action}`) || this.isJustPressed(`P1_ACTION_${action}`) || (action.startsWith('P1_') && this.isJustPressed(action)),
      isJustReleased: (action) => this.isJustReleased(`P1_${action}`) || this.isJustReleased(`P1_ACTION_${action}`) || (action.startsWith('P1_') && this.isJustReleased(action)),
    };
  }

  /**
   * Player 2 input proxy helper for Duo mode.
   */
  get p2() {
    return {
      isDown: (action) => this.isDown(`P2_${action}`) || this.isDown(`P2_ACTION_${action}`),
      isJustPressed: (action) => this.isJustPressed(`P2_${action}`) || this.isJustPressed(`P2_ACTION_${action}`),
      isJustReleased: (action) => this.isJustReleased(`P2_${action}`) || this.isJustReleased(`P2_ACTION_${action}`),
    };
  }

  /**
   * Consume a justPressed flag for an action.
   * @param {string} action 
   */
  consume(action) {
    this.justPressed.set(action, false);
  }

  /**
   * Clear all justPressed and justReleased flags.
   * Should be called at the end of every engine update cycle.
   */
  clearJustPressed() {
    this.justPressed.clear();
    this.justReleased.clear();
  }

  /**
   * End-of-frame update to clear transient press/release states.
   * Called automatically by Engine loop after every update tick.
   */
  update() {
    this.clearJustPressed();
  }

  /**
   * Delayed Auto Shift (DAS) helper for rapid continuous movement.
   * Fires true on the initial press, then waits initialDelayMs,
   * then fires true every repeatRateMs.
   * @param {string} action 
   * @param {number} initialDelayMs Default 200ms
   * @param {number} repeatRateMs Default 50ms
   * @returns {boolean}
   */
  checkAutoRepeat(action, initialDelayMs = 200, repeatRateMs = 50) {
    if (!this.isDown(action)) {
      this.autoRepeatState.delete(action);
      return false;
    }

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let state = this.autoRepeatState.get(action);

    if (!state) {
      state = { firstPressed: now, lastFired: now, hasFiredInitial: true };
      this.autoRepeatState.set(action, state);
      return true;
    }

    if (!state.hasFiredInitial) {
      state.hasFiredInitial = true;
      if (now <= state.firstPressed + 20) {
        state.lastFired = now;
        return true;
      }
    }

    const elapsed = now - state.firstPressed;
    if (elapsed >= initialDelayMs) {
      if (now - state.lastFired >= repeatRateMs) {
        state.lastFired = now;
        return true;
      }
    }

    return false;
  }

  /**
   * Bind on-screen tactile button element to an InputAction.
   * @param {HTMLElement|string} elementOrSelector 
   * @param {string} action 
   */
  bindButton(elementOrSelector, action) {
    const el = typeof elementOrSelector === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(elementOrSelector) : null)
      : elementOrSelector;

    if (!el) return;

    // Prevent default context menu and gesture zoom
    if (el.style) {
      el.style.touchAction = 'manipulation';
    }

    const onPointerDown = (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      try {
        if (el.setPointerCapture && e.pointerId !== undefined) {
          el.setPointerCapture(e.pointerId);
        }
      } catch {
        // Fallback for mock environments
      }

      if (el.classList && typeof el.classList.add === 'function') {
        el.classList.add('active');
      }
      this._setPressed(action, true);

      // Multi-touch tracking
      const pId = e && e.pointerId !== undefined ? e.pointerId : 0;
      if (!this.activePointers.has(pId)) {
        this.activePointers.set(pId, new Set());
      }
      this.activePointers.get(pId).add(action);

      this.triggerHaptic(12);
    };

    const onPointerUp = (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      try {
        if (el.hasPointerCapture && el.releasePointerCapture && e.pointerId !== undefined) {
          if (el.hasPointerCapture(e.pointerId)) {
            el.releasePointerCapture(e.pointerId);
          }
        }
      } catch {
        // Fallback
      }

      if (el.classList && typeof el.classList.remove === 'function') {
        el.classList.remove('active');
      }
      this._setPressed(action, false);

      const pId = e && e.pointerId !== undefined ? e.pointerId : 0;
      if (this.activePointers.has(pId)) {
        this.activePointers.get(pId).delete(action);
        if (this.activePointers.get(pId).size === 0) {
          this.activePointers.delete(pId);
        }
      }
    };

    const onPointerLeave = (e) => {
      const pId = e && e.pointerId !== undefined ? e.pointerId : 0;
      if (!el.hasPointerCapture || !el.hasPointerCapture(pId)) {
        onPointerUp(e);
      }
    };

    if (typeof el.addEventListener === 'function') {
      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointerup', onPointerUp);
      el.addEventListener('pointerleave', onPointerLeave);
      el.addEventListener('pointercancel', onPointerUp);
    }

    this.boundElements.set(el, {
      pointerdown: onPointerDown,
      pointerup: onPointerUp,
      pointerleave: onPointerLeave,
      pointercancel: onPointerUp,
    });
  }

  /**
   * Bind all data-action buttons found in the DOM automatically.
   * @param {HTMLElement} [rootContainer] 
   */
  bindAllDataActions(rootContainer) {
    if (typeof document === 'undefined') return;
    const container = rootContainer || document;
    const buttons = container.querySelectorAll('[data-action]');
    buttons.forEach((btn) => {
      const actionName = btn.getAttribute('data-action');
      if (InputActions[actionName]) {
        this.bindButton(btn, InputActions[actionName]);
      }
    });
  }

  /**
   * Internal keyboard key down handler.
   * @param {KeyboardEvent} e 
   */
  _handleKeyDown(e) {
    const action = this.keyMap[e.code] || this.keyMap[e.key];
    const duoAction = DUO_KEY_MAP[e.code] || DUO_KEY_MAP[e.key];

    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
    }

    if (!e.repeat) {
      if (action) {
        this._setPressed(action, true);
        this._updateDomButtonVisual(action, true);
      }
      if (duoAction) {
        this._setPressed(duoAction, true);
      }
    }
  }

  /**
   * Internal keyboard key up handler.
   * @param {KeyboardEvent} e 
   */
  _handleKeyUp(e) {
    const action = this.keyMap[e.code] || this.keyMap[e.key];
    const duoAction = DUO_KEY_MAP[e.code] || DUO_KEY_MAP[e.key];

    if (action) {
      this._setPressed(action, false);
      this._updateDomButtonVisual(action, false);
    }
    if (duoAction) {
      this._setPressed(duoAction, false);
    }
  }

  /**
   * Updates state maps when button pressed or released.
   * @param {string} action 
   * @param {boolean} isPressed 
   */
  _setPressed(action, isPressed) {
    const wasDown = !!this.down.get(action);
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (isPressed && !wasDown) {
      this.down.set(action, true);
      this.justPressed.set(action, true);
      this.justReleased.set(action, false);
      this.autoRepeatState.set(action, {
        firstPressed: now,
        lastFired: now,
        hasFiredInitial: false,
      });
    } else if (!isPressed && wasDown) {
      this.down.set(action, false);
      this.justPressed.set(action, false);
      this.justReleased.set(action, true);
      this.autoRepeatState.delete(action);
    }
  }

  /**
   * Toggles the .active CSS class on the corresponding hardware DOM button.
   * @param {string} action 
   * @param {boolean} isActive 
   */
  _updateDomButtonVisual(action, isActive) {
    if (typeof document === 'undefined') return;
    try {
      const btn = document.querySelector(`[data-action="${action}"]`);
      if (btn && btn.classList) {
        if (isActive) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    } catch {
      // Ignore in mock environments
    }
  }

  /**
   * Trigger device vibration if supported and enabled.
   * @param {number|number[]} pattern 
   */
  triggerHaptic(pattern = 12) {
    if (this.hapticsEnabled && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently ignore if not permitted by user gesture
      }
    }
  }

  /**
   * Set haptics enabled/disabled.
   * @param {boolean} enabled 
   */
  setHapticsEnabled(enabled) {
    this.hapticsEnabled = !!enabled;
  }

  /**
   * Get haptics state.
   * @returns {boolean}
   */
  isHapticsEnabled() {
    return this.hapticsEnabled;
  }
}
