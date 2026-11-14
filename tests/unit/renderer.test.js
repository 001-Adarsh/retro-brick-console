import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer, PALETTES } from '../../src/js/core/CanvasRenderer.js';

describe('CanvasRenderer Unit Tests', () => {
  let mockCanvas;
  let mockCtx;
  let renderer;

  beforeEach(() => {
    mockCtx = {
      setTransform: vi.fn(),
      scale: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      imageSmoothingEnabled: true,
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
    };

    mockCanvas = {
      getContext: vi.fn(() => mockCtx),
      getBoundingClientRect: vi.fn(() => ({
        width: 240,
        height: 480,
        top: 0,
        left: 0,
        bottom: 480,
        right: 240,
      })),
      width: 240,
      height: 480,
    };

    renderer = new CanvasRenderer(mockCanvas, { cols: 10, rows: 20 });
  });

  it('initializes 10x20 grid dimensions and palette', () => {
    expect(renderer.getCols()).toBe(10);
    expect(renderer.getRows()).toBe(20);
    expect(renderer.grid.length).toBe(200);
    expect(renderer.palette).toBeDefined();
  });

  it('sets and gets pixel states with boundary protection', () => {
    renderer.setPixel(4, 7, 1);
    expect(renderer.getPixel(4, 7)).toBe(1);

    // Negative coordinates out-of-bounds
    renderer.setPixel(-1, 5, 1);
    expect(renderer.getPixel(-1, 5)).toBe(0);

    // Large coordinates out-of-bounds
    renderer.setPixel(10, 20, 1);
    expect(renderer.getPixel(10, 20)).toBe(0);
  });

  it('clears grid to zero', () => {
    renderer.setPixel(2, 3, 1);
    renderer.setPixel(8, 12, 1);

    renderer.clear();
    expect(renderer.getPixel(2, 3)).toBe(0);
    expect(renderer.getPixel(8, 12)).toBe(0);
    expect(renderer.grid.every(p => p === 0)).toBe(true);
  });

  it('fills grid with specified state', () => {
    renderer.fill(1);
    expect(renderer.grid.every(p => p === 1)).toBe(true);
  });

  it('inverts active pixels', () => {
    renderer.setPixel(0, 0, 1);
    renderer.setPixel(1, 1, 0);

    renderer.invert();
    expect(renderer.getPixel(0, 0)).toBe(0);
    expect(renderer.getPixel(1, 1)).toBe(1);
  });

  it('switches themes across built-in LCD palettes', () => {
    renderer.setTheme('amber');
    expect(renderer.palette.bg).toBe(PALETTES.amber.bg);

    renderer.setTheme('cyber');
    expect(renderer.palette.bg).toBe(PALETTES.cyber.bg);
  });
});
