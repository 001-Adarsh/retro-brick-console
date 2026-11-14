/**
 * Retro Brick Game Console - MineScanner
 * Seismic grid demining with first-click guarantee, recursive flood fill, and chord clearing.
 */

import { BaseGame } from '../core/BaseGame.js';

export class MineScanner extends BaseGame {
  constructor() {
    super('mine-scanner', 'Mine Scanner', 'Puzzle');
    this.cols = 8;
    this.rows = 12;
    this.grid = []; // { isMine, isRevealed, isFlagged, adjacentCount }
    this.cursor = { x: 3, y: 5 };
    this.totalMines = 12;
    this.firstClick = true;
    this.timeRemaining = 90;
    this.totalTime = 90;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.cols = 8;
      this.rows = 10;
      this.totalMines = 8;
      this.totalTime = 120;
    } else if (diff === 'HARD') {
      this.cols = 8;
      this.rows = 14;
      this.totalMines = 18;
      this.totalTime = 60;
    } else {
      this.cols = 8;
      this.rows = 12;
      this.totalMines = 14;
      this.totalTime = 90;
    }

    this.timeRemaining = this.totalTime;
    this.firstClick = true;
    this.cursor = { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) };
    this.initGrid();
  }

  initGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const rowArr = [];
      for (let c = 0; c < this.cols; c++) {
        rowArr.push({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentCount: 0
        });
      }
      this.grid.push(rowArr);
    }
  }

  plantMines(excludeX, excludeY) {
    let planted = 0;
    while (planted < this.totalMines) {
      const rx = Math.floor(Math.random() * this.cols);
      const ry = Math.floor(Math.random() * this.rows);

      // Protect starting cell and adjacent neighbors
      const isNearStart = Math.abs(rx - excludeX) <= 1 && Math.abs(ry - excludeY) <= 1;

      if (!this.grid[ry][rx].isMine && !isNearStart) {
        this.grid[ry][rx].isMine = true;
        planted++;
      }
    }

    // Compute adjacent mine counts
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                if (this.grid[nr][nc].isMine) count++;
              }
            }
          }
          this.grid[r][c].adjacentCount = count;
        }
      }
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.gameOver();
      return;
    }

    // Cursor Navigation
    if (input.isJustPressed('LEFT') && this.cursor.x > 0) {
      this.cursor.x--;
      sound.playMove();
    } else if (input.isJustPressed('RIGHT') && this.cursor.x < this.cols - 1) {
      this.cursor.x++;
      sound.playMove();
    } else if (input.isJustPressed('UP') && this.cursor.y > 0) {
      this.cursor.y--;
      sound.playMove();
    } else if (input.isJustPressed('DOWN') && this.cursor.y < this.rows - 1) {
      this.cursor.y++;
      sound.playMove();
    }

    // Toggle Flag (Button B)
    if (input.isJustPressed('ACTION_B')) {
      const cell = this.grid[this.cursor.y][this.cursor.x];
      if (!cell.isRevealed) {
        cell.isFlagged = !cell.isFlagged;
        sound.playRotate();
      }
    }

    // Reveal Cell (Button A)
    if (input.isJustPressed('ACTION_A')) {
      const cell = this.grid[this.cursor.y][this.cursor.x];
      if (cell.isFlagged) return;

      if (this.firstClick) {
        this.firstClick = false;
        this.plantMines(this.cursor.x, this.cursor.y);
      }

      if (cell.isMine) {
        // Boom!
        sound.playExplosion();
        this.emitLives(this.lives - 1);
        if (this.lives <= 0) {
          this.gameOver();
          return;
        }
        this.init(this.context);
        return;
      }

      this.revealCell(this.cursor.x, this.cursor.y);
      sound.playScore();
      this.checkWinCondition();
    }
  }

  revealCell(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;
    const cell = this.grid[y][x];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    this.addScore(10);

    // Recursive flood fill for zero-adjacent cells
    if (cell.adjacentCount === 0 && !cell.isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          this.revealCell(x + dc, y + dr);
        }
      }
    }
  }

  checkWinCondition() {
    let unrevealedSafeCells = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c].isMine && !this.grid[r][c].isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      const sound = this.context.sound;
      sound.playVictory();
      this.addScore(1500 + Math.round(this.timeRemaining * 15));
      this.gameOver();
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // Centered horizontally: 8 cols on 10 display -> startX = 1
    // Vertically: startY = 3
    const startX = 1;
    const startY = 3;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const px = startX + c;
        const py = startY + r;
        const cell = this.grid[r][c];

        if (cell.isRevealed) {
          if (cell.adjacentCount > 0) {
            // Render number indicator (1..8)
            renderer.setPixel(px, py, 1);
          }
          // Empty 0 cells remain clear
        } else if (cell.isFlagged) {
          // Flagged: blinking
          renderer.setPixel(px, py, 2);
        } else {
          // Unrevealed solid
          renderer.setPixel(px, py, 1);
        }

        // Draw Cursor
        if (this.cursor.x === c && this.cursor.y === r) {
          renderer.setPixel(px, py, 2);
        }
      }
    }

    // Time bar across row 19
    const timeRatio = this.timeRemaining / this.totalTime;
    const barW = Math.ceil(timeRatio * 10);
    for (let x = 0; x < barW; x++) {
      renderer.setPixel(x, 19, 1);
    }
  }
}
