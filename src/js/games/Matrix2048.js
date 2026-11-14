/**
 * Retro Brick Game Console - Matrix2048
 * Isotopic fusion sliding puzzle with 4-way tile fusion and quantum undo.
 */

import { BaseGame } from '../core/BaseGame.js';

export class Matrix2048 extends BaseGame {
  constructor() {
    super('matrix-2048', 'Matrix 2048', 'Puzzle');
    this.grid = []; // 4x4 matrix of numbers (0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048)
    this.previousState = null;
    this.undoCharges = 1;
    this.won = false;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';
    this.undoCharges = diff === 'EASY' ? 3 : (diff === 'HARD' ? 0 : 1);
    this.won = false;
    this.grid = Array.from({ length: 4 }, () => new Uint32Array(4));
    this.spawnTile();
    this.spawnTile();
  }

  spawnTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length > 0) {
      const pick = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[pick.r][pick.c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // Quantum Undo (Button B)
    if (input.isJustPressed('ACTION_B') && this.undoCharges > 0 && this.previousState) {
      this.undoCharges--;
      this.grid = this.previousState.map(row => new Uint32Array(row));
      this.previousState = null;
      sound.playRotate();
      return;
    }

    let moved = false;
    let dir = null;

    if (input.isJustPressed('UP')) dir = 'UP';
    else if (input.isJustPressed('DOWN')) dir = 'DOWN';
    else if (input.isJustPressed('LEFT')) dir = 'LEFT';
    else if (input.isJustPressed('RIGHT')) dir = 'RIGHT';

    if (dir) {
      // Save state for undo
      const backup = this.grid.map(row => new Uint32Array(row));
      moved = this.slide(dir);

      if (moved) {
        this.previousState = backup;
        sound.playMove();
        this.spawnTile();

        // Check 2048 Win
        if (!this.won && this.hasValue(2048)) {
          this.won = true;
          this.addScore(10000);
          sound.playVictory();
        }

        // Check Game Over (no valid moves)
        if (this.isGameOverState()) {
          this.gameOver();
        }
      }
    }
  }

  slide(direction) {
    let changed = false;

    // Helper to slide and merge a single 1D array of 4 numbers
    const processLine = (line) => {
      let filtered = line.filter(v => v !== 0);
      let merged = [];
      let scoreGained = 0;

      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const sum = filtered[i] * 2;
          merged.push(sum);
          scoreGained += sum;
          i++; // skip next merged element
        } else {
          merged.push(filtered[i]);
        }
      }

      while (merged.length < 4) {
        merged.push(0);
      }

      if (scoreGained > 0) {
        this.addScore(scoreGained);
      }

      return merged;
    };

    if (direction === 'LEFT') {
      for (let r = 0; r < 4; r++) {
        const original = [...this.grid[r]];
        const newLine = processLine(original);
        for (let c = 0; c < 4; c++) {
          if (this.grid[r][c] !== newLine[c]) changed = true;
          this.grid[r][c] = newLine[c];
        }
      }
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        const original = [...this.grid[r]].reverse();
        const newLine = processLine(original).reverse();
        for (let c = 0; c < 4; c++) {
          if (this.grid[r][c] !== newLine[c]) changed = true;
          this.grid[r][c] = newLine[c];
        }
      }
    } else if (direction === 'UP') {
      for (let c = 0; c < 4; c++) {
        const original = [this.grid[0][c], this.grid[1][c], this.grid[2][c], this.grid[3][c]];
        const newLine = processLine(original);
        for (let r = 0; r < 4; r++) {
          if (this.grid[r][c] !== newLine[r]) changed = true;
          this.grid[r][c] = newLine[r];
        }
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < 4; c++) {
        const original = [this.grid[3][c], this.grid[2][c], this.grid[1][c], this.grid[0][c]];
        const newLine = processLine(original).reverse();
        for (let r = 0; r < 4; r++) {
          if (this.grid[r][c] !== newLine[r]) changed = true;
          this.grid[r][c] = newLine[r];
        }
      }
    }

    return changed;
  }

  hasValue(val) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === val) return true;
      }
    }
    return false;
  }

  isGameOverState() {
    // If empty cells exist, game continues
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) return false;
      }
    }

    // Check horizontal/vertical merges
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.grid[r][c];
        if (c < 3 && val === this.grid[r][c + 1]) return false;
        if (r < 3 && val === this.grid[r + 1][c]) return false;
      }
    }

    return true;
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // Centered 4x4 layout:
    // Display width 10, cols spaced at x=1, 3, 5, 7 (width 2 each)
    // Rows at y=3, 7, 11, 15 (height 3 each)
    const colCoords = [1, 3, 5, 7];
    const rowCoords = [3, 7, 11, 15];

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.grid[r][c];
        const px = colCoords[c];
        const py = rowCoords[r];

        if (val > 0) {
          // Render tile frame
          renderer.drawRect(px, py, 2, 3, 1, false);

          // Render intensity based on log2 value
          const power = Math.log2(val);
          if (power >= 7) {
            // High tier (> 128): filled solid block
            renderer.drawRect(px, py, 2, 3, 1, true);
          } else if (power >= 4) {
            // Mid tier (16..64): inner center pip
            renderer.setPixel(px, py + 1, 1);
          }
        }
      }
    }
  }
}
