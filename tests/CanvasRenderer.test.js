import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer, PALETTES } from '../src/js/core/CanvasRenderer.js';

describe('CanvasRenderer', () => {
  let mockCanvas;
  let mockCtx;

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
      lineWidth: 1
    };

    mockCanvas = {
      getContext: vi.fn(() => mockCtx),
      getBoundingClientRect: vi.fn(() => ({
        width: 240,
        height: 480,
        top: 0,
        left: 0,
        bottom: 480,
        right: 240
      })),
      width: 240,
      height: 480
    };
  });

  describe('Grid Initialization & Dimensions', () => {
    it('initializes default 10x20 dimensions when no options are provided', () => {
      const renderer = new CanvasRenderer(null);
      expect(renderer.getCols()).toBe(10);
      expect(renderer.getRows()).toBe(20);
      expect(renderer.grid.length).toBe(200);
      expect(renderer.grid.every((p) => p === 0)).toBe(true);
    });

    it('supports custom matrix dimensions (e.g. 4x4 preview grid, 20x30 wide grid)', () => {
      const previewRenderer = new CanvasRenderer(null, { cols: 4, rows: 4 });
      expect(previewRenderer.getCols()).toBe(4);
      expect(previewRenderer.getRows()).toBe(4);
      expect(previewRenderer.grid.length).toBe(16);

      const largeRenderer = new CanvasRenderer(null, { cols: 20, rows: 30 });
      expect(largeRenderer.getCols()).toBe(20);
      expect(largeRenderer.getRows()).toBe(30);
      expect(largeRenderer.grid.length).toBe(600);
    });

    it('initializes with default vintage palette and allows theme switching', () => {
      const renderer = new CanvasRenderer(null);
      expect(renderer.palette).toEqual(PALETTES.vintage);

      renderer.setTheme('amber');
      expect(renderer.palette).toEqual(PALETTES.amber);

      renderer.setTheme('cyber');
      expect(renderer.palette).toEqual(PALETTES.cyber);

      renderer.setTheme('mono');
      expect(renderer.palette).toEqual(PALETTES.mono);

      // Custom theme override
      renderer.setTheme({ bg: '#111111', lit: '#00ffcc' });
      expect(renderer.palette.bg).toBe('#111111');
      expect(renderer.palette.lit).toBe('#00ffcc');
    });
  });

  describe('Pixel Operations & Boundary Clamping', () => {
    let renderer;

    beforeEach(() => {
      renderer = new CanvasRenderer(null, { cols: 10, rows: 20 });
    });

    it('sets and gets pixel states correctly within bounds', () => {
      expect(renderer.getPixel(0, 0)).toBe(0);

      renderer.setPixel(0, 0, 1);
      expect(renderer.getPixel(0, 0)).toBe(1);

      renderer.setPixel(9, 19, 2); // Blink state at bottom-right corner
      expect(renderer.getPixel(9, 19)).toBe(2);

      renderer.setPixel(4, 10, 1);
      expect(renderer.getPixel(4, 10)).toBe(1);
    });

    it('silently clamps and ignores out-of-bounds coordinates on setPixel', () => {
      // Negative bounds
      renderer.setPixel(-1, 5, 1);
      renderer.setPixel(5, -1, 1);
      renderer.setPixel(-10, -20, 1);

      // Greater than bounds
      renderer.setPixel(10, 5, 1);
      renderer.setPixel(5, 20, 1);
      renderer.setPixel(100, 200, 1);

      // Ensure no out-of-bounds pixels were written
      expect(renderer.grid.every((p) => p === 0)).toBe(true);
    });

    it('returns 0 for out-of-bounds queries on getPixel', () => {
      expect(renderer.getPixel(-1, 0)).toBe(0);
      expect(renderer.getPixel(0, -1)).toBe(0);
      expect(renderer.getPixel(10, 5)).toBe(0);
      expect(renderer.getPixel(5, 20)).toBe(0);
      expect(renderer.getPixel(999, 999)).toBe(0);
    });

    it('handles floating-point coordinate inputs by flooring them', () => {
      renderer.setPixel(3.7, 8.9, 1);
      expect(renderer.getPixel(3, 8)).toBe(1);
      expect(renderer.getPixel(3.2, 8.1)).toBe(1);
    });
  });

  describe('Matrix Manipulation (clear, fill, invert)', () => {
    let renderer;

    beforeEach(() => {
      renderer = new CanvasRenderer(null, { cols: 10, rows: 20 });
    });

    it('clears all pixels to 0', () => {
      renderer.setPixel(0, 0, 1);
      renderer.setPixel(5, 10, 1);
      renderer.setPixel(9, 19, 2);

      renderer.clear();
      expect(renderer.grid.every((p) => p === 0)).toBe(true);
    });

    it('fills entire matrix with the specified state', () => {
      renderer.fill(1);
      expect(renderer.grid.every((p) => p === 1)).toBe(true);

      renderer.fill(2);
      expect(renderer.grid.every((p) => p === 2)).toBe(true);

      renderer.fill(0);
      expect(renderer.grid.every((p) => p === 0)).toBe(true);
    });

    it('inverts lit pixels (0 -> 1, 1 -> 0, preserves 2)', () => {
      renderer.setPixel(2, 2, 1);
      renderer.setPixel(3, 3, 2); // Blink state

      renderer.invert();

      // (2, 2) was 1 -> now 0
      expect(renderer.getPixel(2, 2)).toBe(0);
      // (3, 3) was 2 -> preserves 2
      expect(renderer.getPixel(3, 3)).toBe(2);
      // (0, 0) was 0 -> now 1
      expect(renderer.getPixel(0, 0)).toBe(1);
    });
  });

  describe('Geometric & Sprite Rendering', () => {
    let renderer;

    beforeEach(() => {
      renderer = new CanvasRenderer(null, { cols: 10, rows: 20 });
    });

    it('draws filled rectangles correctly', () => {
      renderer.drawRect(2, 2, 3, 2, 1, true);

      // (2, 2) to (4, 3) should be 1
      for (let y = 2; y <= 3; y++) {
        for (let x = 2; x <= 4; x++) {
          expect(renderer.getPixel(x, y)).toBe(1);
        }
      }

      // Adjacent pixel outside rectangle should be 0
      expect(renderer.getPixel(1, 2)).toBe(0);
      expect(renderer.getPixel(5, 2)).toBe(0);
    });

    it('draws hollow (outline) rectangles correctly', () => {
      renderer.drawRect(1, 1, 4, 4, 1, false);

      // Top edge
      expect(renderer.getPixel(1, 1)).toBe(1);
      expect(renderer.getPixel(2, 1)).toBe(1);
      expect(renderer.getPixel(3, 1)).toBe(1);
      expect(renderer.getPixel(4, 1)).toBe(1);

      // Bottom edge
      expect(renderer.getPixel(1, 4)).toBe(1);
      expect(renderer.getPixel(4, 4)).toBe(1);

      // Interior hollow center should be 0
      expect(renderer.getPixel(2, 2)).toBe(0);
      expect(renderer.getPixel(3, 2)).toBe(0);
      expect(renderer.getPixel(2, 3)).toBe(0);
      expect(renderer.getPixel(3, 3)).toBe(0);
    });

    it('draws 2D polyomino/sprite matrix at offsets with clipping', () => {
      const tTetromino = [
        [1, 1, 1],
        [0, 1, 0]
      ];

      renderer.drawMatrix(tTetromino, 3, 5, 1);

      expect(renderer.getPixel(3, 5)).toBe(1);
      expect(renderer.getPixel(4, 5)).toBe(1);
      expect(renderer.getPixel(5, 5)).toBe(1);
      expect(renderer.getPixel(3, 6)).toBe(0);
      expect(renderer.getPixel(4, 6)).toBe(1);
      expect(renderer.getPixel(5, 6)).toBe(0);
    });

    it('gracefully handles empty or null matrix passed to drawMatrix', () => {
      expect(() => {
        renderer.drawMatrix(null, 0, 0);
        renderer.drawMatrix([], 0, 0);
        renderer.drawMatrix([null, []], 0, 0);
      }).not.toThrow();
    });
  });

  describe('3x5 Font & Text Glyphs', () => {
    let renderer;

    beforeEach(() => {
      renderer = new CanvasRenderer(null, { cols: 10, rows: 20 });
    });

    it('draws alphanumeric characters using 3x5 font', () => {
      // Draw digit '1' at (0, 0)
      renderer.drawText('1', 0, 0, 1);
      
      // According to FONT_3X5 for '1':
      // [0,1,0]
      // [1,1,0]
      // [0,1,0]
      // [0,1,0]
      // [1,1,1]
      expect(renderer.getPixel(1, 0)).toBe(1);
      expect(renderer.getPixel(0, 1)).toBe(1);
      expect(renderer.getPixel(1, 1)).toBe(1);
      expect(renderer.getPixel(1, 2)).toBe(1);
      expect(renderer.getPixel(1, 3)).toBe(1);
      expect(renderer.getPixel(0, 4)).toBe(1);
      expect(renderer.getPixel(1, 4)).toBe(1);
      expect(renderer.getPixel(2, 4)).toBe(1);
    });

    it('advances horizontal offset by 4 pixels per character', () => {
      renderer.drawText('GO', 0, 0, 1);
      // First character 'G' occupies x=0..2
      // Spacer is x=3
      // Second character 'O' occupies x=4..6
      // Row 0 of 'O' is [1,1,1] at x=4,5,6, y=0
      expect(renderer.getPixel(4, 0)).toBe(1);
      expect(renderer.getPixel(5, 0)).toBe(1);
      expect(renderer.getPixel(6, 0)).toBe(1);
    });

    it('drawDigit helper formats and renders numbers', () => {
      renderer.drawDigit(8, 0, 0, 1);
      // '8' has [1,1,1] at top row y=0
      expect(renderer.getPixel(0, 0)).toBe(1);
      expect(renderer.getPixel(1, 0)).toBe(1);
      expect(renderer.getPixel(2, 0)).toBe(1);
    });
  });

  describe('Blinking Pixel State Animation', () => {
    let renderer;

    beforeEach(() => {
      renderer = new CanvasRenderer(null);
    });

    it('toggles blinkState at 125ms intervals (~4Hz)', () => {
      expect(renderer.blinkState).toBe(false);

      renderer.updateBlink(0.06); // 60ms elapsed
      expect(renderer.blinkState).toBe(false);

      renderer.updateBlink(0.07); // Total 130ms elapsed -> toggles to true
      expect(renderer.blinkState).toBe(true);

      renderer.updateBlink(0.125); // Another 125ms -> toggles to false
      expect(renderer.blinkState).toBe(false);
    });
  });

  describe('Canvas Hi-DPI Scaling & Resize', () => {
    it('calculates cell dimensions and sets DPI transform on resize', () => {
      const renderer = new CanvasRenderer(mockCanvas, { cols: 10, rows: 20 });
      
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(renderer.cellWidth).toBe(24);  // 240 / 10
      expect(renderer.cellHeight).toBe(24); // 480 / 20
      expect(mockCtx.scale).toHaveBeenCalled();
    });

    it('handles resize safely when canvas is null', () => {
      const renderer = new CanvasRenderer(null);
      expect(() => renderer.resize()).not.toThrow();
    });
  });
});
