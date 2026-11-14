import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputController, InputActions } from '../../src/js/ui/InputController.js';

describe('InputController Unit & Multiplayer Tests', () => {
  let controller;

  beforeEach(() => {
    controller = new InputController();
  });

  it('correctly maps primary keyboard codes', () => {
    expect(controller.keyMap['ArrowUp']).toBe(InputActions.UP);
    expect(controller.keyMap['ArrowDown']).toBe(InputActions.DOWN);
    expect(controller.keyMap['ArrowLeft']).toBe(InputActions.LEFT);
    expect(controller.keyMap['ArrowRight']).toBe(InputActions.RIGHT);
    expect(controller.keyMap['Space']).toBe(InputActions.ACTION_A);
    expect(controller.keyMap['ShiftLeft']).toBe(InputActions.ACTION_B);
    expect(controller.keyMap['Enter']).toBe(InputActions.START);
    expect(controller.keyMap['KeyP']).toBe(InputActions.PAUSE);
    expect(controller.keyMap['KeyM']).toBe(InputActions.SOUND);
    expect(controller.keyMap['Escape']).toBe(InputActions.MENU);
  });

  it('tracks isDown, isJustPressed, and clearJustPressed', () => {
    expect(controller.isDown(InputActions.UP)).toBe(false);
    expect(controller.isJustPressed(InputActions.UP)).toBe(false);

    controller._setPressed(InputActions.UP, true);
    expect(controller.isDown(InputActions.UP)).toBe(true);
    expect(controller.isJustPressed(InputActions.UP)).toBe(true);

    controller.clearJustPressed();
    expect(controller.isDown(InputActions.UP)).toBe(true);
    expect(controller.isJustPressed(InputActions.UP)).toBe(false);

    controller._setPressed(InputActions.UP, false);
    expect(controller.isDown(InputActions.UP)).toBe(false);
    expect(controller.isJustReleased(InputActions.UP)).toBe(true);
  });

  it('handles Delayed Auto Shift (DAS) accurately', () => {
    controller._setPressed(InputActions.RIGHT, true);
    // Initial press fires immediately
    expect(controller.checkAutoRepeat(InputActions.RIGHT, 200, 50)).toBe(true);
    // Immediate subsequent check inside delay window returns false
    expect(controller.checkAutoRepeat(InputActions.RIGHT, 200, 50)).toBe(false);
  });

  it('provides isolated P1 and P2 sub-controllers for Duo mode', () => {
    expect(controller.p1).toBeDefined();
    expect(controller.p2).toBeDefined();

    // Simulate P1 press on 'KeyA' (LEFT)
    controller._handleKeyDown({ code: 'KeyA', key: 'a' });

    expect(controller.p1.isDown('LEFT')).toBe(true);
    expect(controller.p2.isDown('LEFT')).toBe(false);

    // Simulate P2 press on 'ArrowRight' (RIGHT)
    controller._handleKeyDown({ code: 'ArrowRight', key: 'ArrowRight' });

    expect(controller.p2.isDown('RIGHT')).toBe(true);
    expect(controller.p1.isDown('RIGHT')).toBe(false);

    // Both keys held simultaneously
    expect(controller.p1.isDown('LEFT')).toBe(true);
    expect(controller.p2.isDown('RIGHT')).toBe(true);

    // Release P1
    controller._handleKeyUp({ code: 'KeyA', key: 'a' });
    expect(controller.p1.isDown('LEFT')).toBe(false);
    expect(controller.p2.isDown('RIGHT')).toBe(true);

    // Release P2
    controller._handleKeyUp({ code: 'ArrowRight', key: 'ArrowRight' });
    expect(controller.p2.isDown('RIGHT')).toBe(false);
  });

  it('handles action buttons independently for P1 (Space) and P2 (Enter)', () => {
    controller._handleKeyDown({ code: 'Space', key: ' ' });
    expect(controller.p1.isJustPressed('ACTION_A')).toBe(true);
    expect(controller.p2.isJustPressed('ACTION_A')).toBe(false);

    controller._handleKeyDown({ code: 'Enter', key: 'Enter' });
    expect(controller.p2.isJustPressed('ACTION_A')).toBe(true);
  });
});
