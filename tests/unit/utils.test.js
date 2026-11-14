import { describe, it, expect } from 'vitest';
import { HUD } from '../../src/js/ui/HUD.js';
import { InputActions } from '../../src/js/ui/InputController.js';

describe('Utility & Formatting Unit Tests', () => {
  it('formats numbers into 6-digit LCD segment display with unlit leading zeroes', () => {
    const hud = new HUD({
      score: { innerHTML: '' },
      hiScore: { innerHTML: '' },
      level: { textContent: '' },
    });

    expect(hud.format7Segment(0)).toBe('<span class="unlit-digits">00000</span><span>0</span>');
    expect(hud.format7Segment(42)).toBe('<span class="unlit-digits">0000</span><span>42</span>');
    expect(hud.format7Segment(9999)).toBe('<span class="unlit-digits">00</span><span>9999</span>');
    expect(hud.format7Segment(123456)).toBe('<span>123456</span>');
  });

  it('clamps 7-segment numbers exceeding 999999 to max digits', () => {
    const hud = new HUD({
      score: { innerHTML: '' },
      hiScore: { innerHTML: '' },
      level: { textContent: '' },
    });

    expect(hud.format7Segment(1000000)).toBe('<span>999999</span>');
  });

  it('ensures all InputActions constants are unique strings', () => {
    const actions = Object.values(InputActions);
    const unique = new Set(actions);
    expect(unique.size).toBe(actions.length);
  });
});
