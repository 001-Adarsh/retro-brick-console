/**
 * Retro Brick Game Console - CanvasRenderer
 * High-fidelity LCD dot-matrix rasterizer with authentic segmented brick pixels,
 * ghost pixels, sharp Hi-DPI scaling, and font rendering.
 */

export const PALETTES = {
  vintage: {
    bg: '#9dac86',
    lit: '#1a2b1a',
    ghost: 'rgba(26, 43, 26, 0.085)',
    border: 'rgba(26, 43, 26, 0.12)'
  },
  mono: {
    bg: '#8b956d',
    lit: '#1f2415',
    ghost: 'rgba(31, 36, 21, 0.09)',
    border: 'rgba(31, 36, 21, 0.12)'
  },
  amber: {
    bg: '#c8ab6d',
    lit: '#2d1c0b',
    ghost: 'rgba(45, 28, 11, 0.08)',
    border: 'rgba(45, 28, 11, 0.12)'
  },
  cyber: {
    bg: '#0d120d',
    lit: '#39ff14',
    ghost: 'rgba(57, 255, 20, 0.06)',
    border: 'rgba(57, 255, 20, 0.12)'
  }
};

const FONT_3X5 = {
  '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
  '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
  '7': [[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
  '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
  '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
  'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'B': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
  'C': [[1,1,1],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  'D': [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
  'E': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
  'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  'G': [[1,1,1],[1,0,0],[1,0,1],[1,0,1],[1,1,1]],
  'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'J': [[0,0,1],[0,0,1],[0,0,1],[1,0,1],[1,1,1]],
  'K': [[1,0,1],[1,1,0],[1,0,0],[1,1,0],[1,0,1]],
  'L': [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  'M': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  'N': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,0,1]],
  'O': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  'P': [[1,1,1],[1,0,1],[1,1,1],[1,0,0],[1,0,0]],
  'Q': [[1,1,1],[1,0,1],[1,0,1],[1,1,1],[0,0,1]],
  'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  'S': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  'U': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  'V': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'W': [[1,0,1],[1,0,1],[1,0,1],[1,1,1],[1,0,1]],
  'X': [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  'Y': [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
  'Z': [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  '-': [[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  '+': [[0,0,0],[0,1,0],[1,1,1],[0,1,0],[0,0,0]],
  ':': [[0,0,0],[0,1,0],[0,0,0],[0,1,0],[0,0,0]],
  '!': [[0,1,0],[0,1,0],[0,1,0],[0,0,0],[0,1,0]],
  '?': [[1,1,0],[0,0,1],[0,1,0],[0,0,0],[0,1,0]],
  '.': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0]],
  '=': [[0,0,0],[1,1,1],[0,0,0],[1,1,1],[0,0,0]]
};

export class CanvasRenderer {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {Object} [options]
   * @param {number} [options.cols=10]
   * @param {number} [options.rows=20]
   * @param {string} [options.theme='vintage']
   * @param {boolean} [options.drawGhostGrid=true]
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.cols = options.cols || 10;
    this.rows = options.rows || 20;
    this.drawGhostGrid = options.drawGhostGrid !== undefined ? options.drawGhostGrid : true;

    this.palette = PALETTES[options.theme] || PALETTES.vintage;

    // Buffer: 0 = off, 1 = on, 2 = blink
    this.grid = new Uint8Array(this.cols * this.rows);

    // Blink state
    this.blinkTimer = 0;
    this.blinkState = false; // toggles every 125ms (~4Hz blink)
    this.blinkInterval = 0.125;

    // DPI scaling cache
    this.dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    this.displayWidth = 0;
    this.displayHeight = 0;
    this.cellWidth = 0;
    this.cellHeight = 0;

    if (this.canvas) {
      this.resize();
    }
  }

  /**
   * Resizes canvas buffer to match physical CSS dimensions with Hi-DPI crispness.
   */
  resize() {
    if (!this.canvas) return;

    this.dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    let rect = this.canvas.getBoundingClientRect();
    let width = rect.width || (this.cols === 4 ? 48 : 240);
    let height = rect.height || (this.rows === 4 ? 48 : 480);

    this.displayWidth = width;
    this.displayHeight = height;

    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);

    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
      this.ctx.imageSmoothingEnabled = false;
    }

    this.cellWidth = this.displayWidth / this.cols;
    this.cellHeight = this.displayHeight / this.rows;
  }

  /**
   * Changes current color palette.
   * @param {string|Object} theme 
   */
  setTheme(theme) {
    if (typeof theme === 'string' && PALETTES[theme]) {
      this.palette = PALETTES[theme];
    } else if (theme && typeof theme === 'object') {
      this.palette = { ...this.palette, ...theme };
    }
  }

  getCols() {
    return this.cols;
  }

  getRows() {
    return this.rows;
  }

  /**
   * Sets single pixel state.
   * @param {number} x Column index (0..cols-1)
   * @param {number} y Row index (0..rows-1)
   * @param {0|1|2} state 0 = off, 1 = on, 2 = blink
   */
  setPixel(x, y, state = 1) {
    const col = Math.floor(x);
    const row = Math.floor(y);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
    this.grid[row * this.cols + col] = state;
  }

  /**
   * Gets pixel state at (x, y).
   * @param {number} x 
   * @param {number} y 
   * @returns {number} 0, 1, or 2 (0 if out of bounds)
   */
  getPixel(x, y) {
    const col = Math.floor(x);
    const row = Math.floor(y);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return 0;
    return this.grid[row * this.cols + col];
  }

  /**
   * Clears the entire matrix to 0 (off).
   */
  clear() {
    this.grid.fill(0);
  }

  clearGrid() {
    this.clear();
  }

  /**
   * Fills entire matrix with the specified state.
   * @param {0|1|2} state 
   */
  fill(state = 1) {
    this.grid.fill(state);
  }

  /**
   * Inverts all lit pixels (0 -> 1, 1 -> 0, keeps 2).
   */
  invert() {
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i] === 0) this.grid[i] = 1;
      else if (this.grid[i] === 1) this.grid[i] = 0;
    }
  }

  /**
   * Draws a rectangle on the virtual matrix.
   * @param {number} x 
   * @param {number} y 
   * @param {number} width 
   * @param {number} height 
   * @param {0|1|2} state 
   * @param {boolean} filled 
   */
  drawRect(x, y, width, height, state = 1, filled = true) {
    const startX = Math.floor(x);
    const startY = Math.floor(y);
    const endX = startX + Math.floor(width);
    const endY = startY + Math.floor(height);

    for (let row = startY; row < endY; row++) {
      for (let col = startX; col < endX; col++) {
        if (filled || row === startY || row === endY - 1 || col === startX || col === endX - 1) {
          this.setPixel(col, row, state);
        }
      }
    }
  }

  /**
   * Draws a 2D matrix (binary array of arrays) at offset.
   * @param {number[][]} matrix 
   * @param {number} offsetX 
   * @param {number} offsetY 
   * @param {0|1|2} [state=1] 
   */
  drawMatrix(matrix, offsetX = 0, offsetY = 0, state = 1) {
    if (!matrix || !matrix.length) return;
    for (let r = 0; r < matrix.length; r++) {
      const rowArr = matrix[r];
      if (!rowArr) continue;
      for (let c = 0; c < rowArr.length; c++) {
        const val = rowArr[c];
        if (val) {
          const pixelState = (val === 2 || state === 2) ? 2 : (state !== undefined ? state : 1);
          this.setPixel(offsetX + c, offsetY + r, pixelState);
        }
      }
    }
  }

  /**
   * Draws text using the authentic 3x5 LCD pixel font.
   * @param {string} text 
   * @param {number} x Starting column
   * @param {number} y Starting row
   * @param {0|1|2} [state=1] 
   */
  drawText(text, x = 0, y = 0, state = 1) {
    if (!text) return;
    const str = String(text).toUpperCase();
    let currentX = Math.floor(x);
    const startY = Math.floor(y);

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const glyph = FONT_3X5[ch] || FONT_3X5[' '];

      if (glyph) {
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 3; c++) {
            if (glyph[r][c]) {
              this.setPixel(currentX + c, startY + r, state);
            }
          }
        }
      }
      currentX += 4; // 3 width + 1 column spacing
    }
  }

  /**
   * Draws a single numeric digit in 3x5 font.
   * @param {number|string} digit 
   * @param {number} x 
   * @param {number} y 
   * @param {0|1|2} [state=1] 
   */
  drawDigit(digit, x, y, state = 1) {
    this.drawText(String(digit)[0], x, y, state);
  }

  /**
   * Updates blink timer.
   * @param {number} deltaTime In seconds
   */
  updateBlink(deltaTime) {
    this.blinkTimer += deltaTime;
    if (this.blinkTimer >= this.blinkInterval) {
      this.blinkTimer -= this.blinkInterval;
      this.blinkState = !this.blinkState;
    }
  }

  /**
   * Flushes the virtual matrix to the physical HTML5 Canvas with segmented brick pixels.
   */
  render() {
    if (!this.ctx || !this.canvas) return;

    // Check if canvas was resized
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width && rect.height && (Math.abs(rect.width - this.displayWidth) > 1 || Math.abs(rect.height - this.displayHeight) > 1)) {
      this.resize();
    }

    const { ctx, cellWidth, cellHeight, cols, rows, palette, blinkState } = this;

    // 1. Clear background
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

    // Margins and paddings for authentic segmented brick look
    const gap = Math.max(1, Math.floor(cellWidth * 0.1));
    const pad = gap * 0.5;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pixelState = this.grid[r * cols + c];
        const x = c * cellWidth + pad;
        const y = r * cellHeight + pad;
        const w = cellWidth - gap;
        const h = cellHeight - gap;

        // Is pixel currently energized?
        const isEnergized = pixelState === 1 || (pixelState === 2 && blinkState);

        if (isEnergized) {
          // Lit Segmented Brick Pixel
          // Outer perimeter frame
          ctx.fillStyle = palette.lit;
          ctx.fillRect(x, y, w, h);

          // Inner gap matching substrate background
          const innerGap = Math.max(1, Math.round(w * 0.2));
          if (w > 5 && h > 5) {
            ctx.fillStyle = palette.bg;
            ctx.fillRect(x + innerGap, y + innerGap, w - innerGap * 2, h - innerGap * 2);

            // Inner solid pip core
            const pipGap = innerGap + Math.max(1, Math.round(w * 0.15));
            if (w - pipGap * 2 > 0 && h - pipGap * 2 > 0) {
              ctx.fillStyle = palette.lit;
              ctx.fillRect(x + pipGap, y + pipGap, w - pipGap * 2, h - pipGap * 2);
            }
          }
        } else if (this.drawGhostGrid) {
          // Passive unlit ghost pixel footprint
          ctx.strokeStyle = palette.ghost;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

          // Faint inner pip
          const pipGap = Math.max(2, Math.round(w * 0.35));
          if (w - pipGap * 2 > 0 && h - pipGap * 2 > 0) {
            ctx.fillStyle = palette.ghost;
            ctx.fillRect(x + pipGap, y + pipGap, w - pipGap * 2, h - pipGap * 2);
          }
        }
      }
    }
  }
}
