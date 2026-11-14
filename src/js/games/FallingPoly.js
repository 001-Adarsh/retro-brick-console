/**
 * Retro Brick Game Console - FallingPoly
 * Rotational polyomino puzzle with extended shapes, hold slot, and cascade line clears.
 */

import { BaseGame } from '../core/BaseGame.js';

// Polyomino definitions (4x4 or 3x3 matrices)
const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  // Quantum Polyominoes
  CORNER: [
    [1, 1],
    [1, 0]
  ],
  BAR: [
    [1, 1, 1]
  ],
  CROSS: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ]
};

const STANDARD_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
const QUANTUM_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L', 'CORNER', 'BAR', 'CROSS'];

export class FallingPoly extends BaseGame {
  constructor() {
    super('falling-poly', 'Falling Poly', 'Puzzle');
    this.board = []; // 20 rows x 10 cols
    this.currentPiece = null;
    this.pieceX = 0;
    this.pieceY = 0;
    this.nextPieceKey = null;
    this.holdPieceKey = null;
    this.canHold = true;
    this.gravityTimer = 0;
    this.gravityInterval = 0.8;
    this.linesCleared = 0;
    this.dasTimer = 0;
    this.dasDir = 0;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.gravityInterval = 0.9;
    } else if (diff === 'HARD') {
      this.gravityInterval = 0.45;
    } else {
      this.gravityInterval = 0.7;
    }

    this.board = Array.from({ length: 20 }, () => new Uint8Array(10));
    this.linesCleared = 0;
    this.holdPieceKey = null;
    this.canHold = true;

    this.nextPieceKey = this.getRandomShapeKey();
    this.spawnNextPiece();
  }

  getRandomShapeKey() {
    const isHard = this.context && this.context.difficulty === 'HARD';
    const pool = isHard ? QUANTUM_KEYS : STANDARD_KEYS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  spawnNextPiece() {
    const key = this.nextPieceKey;
    this.currentPiece = this.cloneMatrix(SHAPES[key]);
    this.nextPieceKey = this.getRandomShapeKey();

    // Center piece at top
    this.pieceX = Math.floor((10 - this.currentPiece[0].length) / 2);
    this.pieceY = 0;
    this.canHold = true;

    // Notify UI of next piece preview
    if (this.context && this.context.ui) {
      this.context.ui.showNextPiece(SHAPES[this.nextPieceKey]);
    }

    // Check immediate game over (blocked at spawn)
    if (!this.isValidPosition(this.currentPiece, this.pieceX, this.pieceY)) {
      this.gameOver();
    }
  }

  cloneMatrix(matrix) {
    return matrix.map(row => [...row]);
  }

  rotateMatrix(matrix, clockwise = true) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = Array.from({ length: cols }, () => new Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (clockwise) {
          result[c][rows - 1 - r] = matrix[r][c];
        } else {
          result[cols - 1 - c][r] = matrix[r][c];
        }
      }
    }
    return result;
  }

  isValidPosition(piece, offsetX, offsetY) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c]) {
          const bx = offsetX + c;
          const by = offsetY + r;
          if (bx < 0 || bx >= 10 || by >= 20) return false;
          if (by >= 0 && this.board[by][bx]) return false;
        }
      }
    }
    return true;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // 1. Horizontal Shift (with DAS)
    if (input.isJustPressed('LEFT')) {
      if (this.isValidPosition(this.currentPiece, this.pieceX - 1, this.pieceY)) {
        this.pieceX--;
        sound.playMove();
      }
      this.dasDir = -1;
      this.dasTimer = 0.25;
    } else if (input.isJustPressed('RIGHT')) {
      if (this.isValidPosition(this.currentPiece, this.pieceX + 1, this.pieceY)) {
        this.pieceX++;
        sound.playMove();
      }
      this.dasDir = 1;
      this.dasTimer = 0.25;
    } else if (input.isDown('LEFT') && this.dasDir === -1) {
      this.dasTimer -= deltaTime;
      if (this.dasTimer <= 0) {
        this.dasTimer = 0.08;
        if (this.isValidPosition(this.currentPiece, this.pieceX - 1, this.pieceY)) {
          this.pieceX--;
          sound.playMove();
        }
      }
    } else if (input.isDown('RIGHT') && this.dasDir === 1) {
      this.dasTimer -= deltaTime;
      if (this.dasTimer <= 0) {
        this.dasTimer = 0.08;
        if (this.isValidPosition(this.currentPiece, this.pieceX + 1, this.pieceY)) {
          this.pieceX++;
          sound.playMove();
        }
      }
    }

    // 2. Rotations (Button A = CW, Button B = CCW)
    if (input.isJustPressed('ACTION_A')) {
      const rotated = this.rotateMatrix(this.currentPiece, true);
      if (this.isValidPosition(rotated, this.pieceX, this.pieceY)) {
        this.currentPiece = rotated;
        sound.playRotate();
      } else if (this.isValidPosition(rotated, this.pieceX - 1, this.pieceY)) {
        this.pieceX--; // Wall kick left
        this.currentPiece = rotated;
        sound.playRotate();
      } else if (this.isValidPosition(rotated, this.pieceX + 1, this.pieceY)) {
        this.pieceX++; // Wall kick right
        this.currentPiece = rotated;
        sound.playRotate();
      }
    }

    // 3. Hold Slot (Select or Button B if alternate)
    if (input.isJustPressed('SELECT') && this.canHold) {
      sound.playRotate();
      const currentKey = this.getKeyForPiece(this.currentPiece);
      if (this.holdPieceKey) {
        const temp = this.holdPieceKey;
        this.holdPieceKey = currentKey;
        this.currentPiece = this.cloneMatrix(SHAPES[temp]);
        this.pieceX = Math.floor((10 - this.currentPiece[0].length) / 2);
        this.pieceY = 0;
      } else {
        this.holdPieceKey = currentKey;
        this.spawnNextPiece();
      }
      this.canHold = false;
    }

    // 4. Hard Drop (Up)
    if (input.isJustPressed('UP')) {
      let droppedCells = 0;
      while (this.isValidPosition(this.currentPiece, this.pieceX, this.pieceY + 1)) {
        this.pieceY++;
        droppedCells++;
      }
      this.addScore(droppedCells * 2);
      this.lockPiece();
      return;
    }

    // 5. Gravity & Soft Drop (Down)
    const isSoftDrop = input.isDown('DOWN');
    const interval = isSoftDrop ? 0.05 : this.gravityInterval;

    this.gravityTimer += deltaTime;
    if (this.gravityTimer >= interval) {
      this.gravityTimer = 0;
      if (this.isValidPosition(this.currentPiece, this.pieceX, this.pieceY + 1)) {
        this.pieceY++;
        if (isSoftDrop) this.addScore(1);
      } else {
        this.lockPiece();
      }
    }
  }

  getKeyForPiece(matrix) {
    // Helper to find matching shape key
    for (const [key, shape] of Object.entries(SHAPES)) {
      if (shape.length === matrix.length && shape[0].length === matrix[0].length) {
        return key;
      }
    }
    return 'T';
  }

  lockPiece() {
    const sound = this.context.sound;
    sound.playDrop();

    // Stamp piece to board
    for (let r = 0; r < this.currentPiece.length; r++) {
      for (let c = 0; c < this.currentPiece[r].length; c++) {
        if (this.currentPiece[r][c]) {
          const bx = this.pieceX + c;
          const by = this.pieceY + r;
          if (by >= 0 && by < 20 && bx >= 0 && bx < 10) {
            this.board[by][bx] = 1;
          }
        }
      }
    }

    // Check full rows
    let rowsCleared = 0;
    for (let r = 19; r >= 0; r--) {
      let isFull = true;
      for (let c = 0; c < 10; c++) {
        if (!this.board[r][c]) {
          isFull = false;
          break;
        }
      }

      if (isFull) {
        rowsCleared++;
        // Remove row and drop rows above
        this.board.splice(r, 1);
        this.board.unshift(new Uint8Array(10));
        r++; // Re-check same row index
      }
    }

    if (rowsCleared > 0) {
      this.linesCleared += rowsCleared;
      const pts = [0, 100, 300, 500, 1000][rowsCleared] * this.level;
      this.addScore(pts);

      if (rowsCleared === 4) {
        sound.playVictory(); // Quantum Cascade!
      } else {
        sound.playScore();
      }

      // Check level up (every 10 lines)
      const newLvl = Math.floor(this.linesCleared / 10) + 1;
      if (newLvl > this.level) {
        this.emitLevel(newLvl);
        this.gravityInterval = Math.max(0.12, this.gravityInterval * 0.9);
      }

      // Win condition: 150 lines
      if (this.linesCleared >= 150) {
        sound.playVictory();
        this.addScore(10000);
        this.gameOver();
        return;
      }
    }

    this.spawnNextPiece();
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Board Blocks
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        if (this.board[r][c]) {
          renderer.setPixel(c, r, 1);
        }
      }
    }

    // 2. Draw Ghost Landing Piece
    if (this.currentPiece && !this.isOver) {
      let ghostY = this.pieceY;
      while (this.isValidPosition(this.currentPiece, this.pieceX, ghostY + 1)) {
        ghostY++;
      }
      if (ghostY !== this.pieceY) {
        renderer.drawMatrix(this.currentPiece, this.pieceX, ghostY, 2);
      }

      // 3. Draw Active Falling Piece
      renderer.drawMatrix(this.currentPiece, this.pieceX, this.pieceY, 1);
    }
  }
}
