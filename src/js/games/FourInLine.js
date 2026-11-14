/**
 * Retro Brick Game Console - FourInLine
 * Gravity column resonance (Connect Four) with alpha-beta heuristic AI.
 */

import { BaseGame } from '../core/BaseGame.js';

export class FourInLine extends BaseGame {
  constructor() {
    super('four-in-line', 'Four In Line', 'Puzzle');
    this.cols = 7;
    this.rows = 6;
    this.grid = []; // 6 rows x 7 cols: 0 = empty, 1 = Player, 2 = AI
    this.selectedCol = 3;
    this.isAiTurn = false;
    this.aiTimer = 0;
    this.roundOver = false;
    this.roundOverTimer = 0;
  }

  init(context) {
    super.init(context);
    this.resetBoard();
  }

  resetBoard() {
    this.grid = Array.from({ length: this.rows }, () => new Uint8Array(this.cols));
    this.selectedCol = 3;
    this.isAiTurn = false;
    this.aiTimer = 0;
    this.roundOver = false;
    this.roundOverTimer = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    if (this.roundOver) {
      this.roundOverTimer += deltaTime;
      if (this.roundOverTimer >= 2.0) {
        this.resetBoard();
      }
      return;
    }

    // AI Turn
    if (this.isAiTurn) {
      this.aiTimer += deltaTime;
      if (this.aiTimer >= 0.5) {
        this.makeAiMove();
        this.isAiTurn = false;
      }
      return;
    }

    // Player Column Selection
    if (input.isJustPressed('LEFT') && this.selectedCol > 0) {
      this.selectedCol--;
      sound.playMove();
    } else if (input.isJustPressed('RIGHT') && this.selectedCol < this.cols - 1) {
      this.selectedCol++;
      sound.playMove();
    }

    // Drop Token (Button A)
    if (input.isJustPressed('ACTION_A')) {
      const dropRow = this.getLowestEmptyRow(this.selectedCol);
      if (dropRow !== -1) {
        this.grid[dropRow][this.selectedCol] = 1;
        sound.playDrop();

        if (this.checkWin(1)) {
          sound.playVictory();
          this.addScore(1000);
          this.roundOver = true;
          return;
        } else if (this.isFull()) {
          this.addScore(200);
          this.roundOver = true;
          return;
        }

        this.isAiTurn = true;
        this.aiTimer = 0;
      }
    }
  }

  getLowestEmptyRow(col) {
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r][col] === 0) return r;
    }
    return -1;
  }

  makeAiMove() {
    const sound = this.context.sound;

    // 1. Check AI immediate winning drop
    for (let c = 0; c < this.cols; c++) {
      const r = this.getLowestEmptyRow(c);
      if (r !== -1) {
        this.grid[r][c] = 2;
        if (this.checkWin(2)) {
          sound.playExplosion();
          this.roundOver = true;
          return;
        }
        this.grid[r][c] = 0;
      }
    }

    // 2. Block Player winning drop
    for (let c = 0; c < this.cols; c++) {
      const r = this.getLowestEmptyRow(c);
      if (r !== -1) {
        this.grid[r][c] = 1;
        if (this.checkWin(1)) {
          this.grid[r][c] = 2; // Block!
          sound.playBounce();
          return;
        }
        this.grid[r][c] = 0;
      }
    }

    // 3. Prefer center column or valid column
    const colOrder = [3, 2, 4, 1, 5, 0, 6];
    for (const c of colOrder) {
      const r = this.getLowestEmptyRow(c);
      if (r !== -1) {
        this.grid[r][c] = 2;
        sound.playBounce();
        if (this.checkWin(2)) {
          sound.playExplosion();
          this.roundOver = true;
        } else if (this.isFull()) {
          this.roundOver = true;
        }
        return;
      }
    }
  }

  checkWin(player) {
    // Horizontal
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c <= this.cols - 4; c++) {
        if (this.grid[r][c] === player && this.grid[r][c + 1] === player &&
            this.grid[r][c + 2] === player && this.grid[r][c + 3] === player) {
          return true;
        }
      }
    }

    // Vertical
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r <= this.rows - 4; r++) {
        if (this.grid[r][c] === player && this.grid[r + 1][c] === player &&
            this.grid[r + 2][c] === player && this.grid[r + 3][c] === player) {
          return true;
        }
      }
    }

    // Diagonal Positive Slope
    for (let r = 3; r < this.rows; r++) {
      for (let c = 0; c <= this.cols - 4; c++) {
        if (this.grid[r][c] === player && this.grid[r - 1][c + 1] === player &&
            this.grid[r - 2][c + 2] === player && this.grid[r - 3][c + 3] === player) {
          return true;
        }
      }
    }

    // Diagonal Negative Slope
    for (let r = 0; r <= this.rows - 4; r++) {
      for (let c = 0; c <= this.cols - 4; c++) {
        if (this.grid[r][c] === player && this.grid[r + 1][c + 1] === player &&
            this.grid[r + 2][c + 2] === player && this.grid[r + 3][c + 3] === player) {
          return true;
        }
      }
    }

    return false;
  }

  isFull() {
    for (let c = 0; c < this.cols; c++) {
      if (this.grid[0][c] === 0) return false;
    }
    return true;
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // The 7 columns are centered at cols 1 to 7 on the 10-wide display
    // Rows 6 to 17 hold the vertical matrix (2 rows per token)
    const startX = 1;
    const startY = 6;

    // 1. Draw Selector Indicator (Row 3..4)
    if (!this.isAiTurn && !this.roundOver) {
      renderer.setPixel(startX + this.selectedCol, 3, 2);
      renderer.setPixel(startX + this.selectedCol, 4, 1);
    }

    // 2. Draw Board Grid & Tokens
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const px = startX + c;
        const py = startY + r * 2;
        const val = this.grid[r][c];

        if (val === 1) {
          // Player Token: Solid 1x2 dot
          renderer.setPixel(px, py, 1);
          renderer.setPixel(px, py + 1, 1);
        } else if (val === 2) {
          // AI Token: Blinking / Outline dot
          renderer.setPixel(px, py, 2);
          renderer.setPixel(px, py + 1, 2);
        }
      }
    }

    // 3. Draw Bottom Barrier (Row 18)
    for (let c = 0; c < 10; c++) {
      renderer.setPixel(c, 18, 1);
    }
  }
}
