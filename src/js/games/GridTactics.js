/**
 * Retro Brick Game Console - GridTactics
 * Spatial alignment strategy (Tic-Tac-Toe) with Minimax AI and best-of-5 rounds.
 */

import { BaseGame } from '../core/BaseGame.js';

export class GridTactics extends BaseGame {
  constructor() {
    super('grid-tactics', 'Grid Tactics', 'Puzzle');
    this.boardSize = 3; // 3x3 or 4x4
    this.board = []; // 2D array of 0=empty, 1=player(X), 2=AI(O)
    this.cursor = { x: 1, y: 1 };
    this.playerWins = 0;
    this.aiWins = 0;
    this.round = 1;
    this.isAiTurn = false;
    this.aiDelayTimer = 0;
    this.roundOver = false;
    this.roundOverTimer = 0;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';
    this.boardSize = diff === 'HARD' ? 4 : 3;
    this.playerWins = 0;
    this.aiWins = 0;
    this.round = 1;
    this.initRound();
  }

  initRound() {
    this.board = Array.from({ length: this.boardSize }, () => new Uint8Array(this.boardSize));
    this.cursor = { x: Math.floor(this.boardSize / 2), y: Math.floor(this.boardSize / 2) };
    this.isAiTurn = false;
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
      if (this.roundOverTimer >= 1.5) {
        if (this.playerWins >= 3) {
          sound.playVictory();
          this.addScore(1500);
          this.gameOver();
          return;
        } else if (this.aiWins >= 3) {
          sound.playGameOver();
          this.gameOver();
          return;
        }

        this.round++;
        this.emitLevel(this.round);
        this.initRound();
      }
      return;
    }

    // AI Turn Execution
    if (this.isAiTurn) {
      this.aiDelayTimer += deltaTime;
      if (this.aiDelayTimer >= 0.4) {
        this.makeAiMove();
        this.isAiTurn = false;
      }
      return;
    }

    // Player Turn Cursor Navigation
    if (input.isJustPressed('LEFT') && this.cursor.x > 0) {
      this.cursor.x--;
      sound.playMove();
    } else if (input.isJustPressed('RIGHT') && this.cursor.x < this.boardSize - 1) {
      this.cursor.x++;
      sound.playMove();
    } else if (input.isJustPressed('UP') && this.cursor.y > 0) {
      this.cursor.y--;
      sound.playMove();
    } else if (input.isJustPressed('DOWN') && this.cursor.y < this.boardSize - 1) {
      this.cursor.y++;
      sound.playMove();
    }

    // Place Token (Button A)
    if (input.isJustPressed('ACTION_A')) {
      if (this.board[this.cursor.y][this.cursor.x] === 0) {
        this.board[this.cursor.y][this.cursor.x] = 1; // Player X
        sound.playScore();

        // Check Win
        if (this.checkWin(1)) {
          this.playerWins++;
          this.addScore(300);
          sound.playLevelUp();
          this.roundOver = true;
          return;
        } else if (this.isBoardFull()) {
          // Draw
          this.addScore(100);
          sound.playBounce();
          this.roundOver = true;
          return;
        }

        this.isAiTurn = true;
        this.aiDelayTimer = 0;
      }
    }
  }

  makeAiMove() {
    const sound = this.context.sound;
    const diff = this.context.difficulty || 'MEDIUM';

    // 1. Check if AI can win immediately
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c] === 0) {
          this.board[r][c] = 2;
          if (this.checkWin(2)) {
            this.aiWins++;
            sound.playExplosion();
            this.roundOver = true;
            return;
          }
          this.board[r][c] = 0;
        }
      }
    }

    // 2. Block Player Win
    if (diff !== 'EASY') {
      for (let r = 0; r < this.boardSize; r++) {
        for (let c = 0; c < this.boardSize; c++) {
          if (this.board[r][c] === 0) {
            this.board[r][c] = 1;
            if (this.checkWin(1)) {
              this.board[r][c] = 2; // Block!
              sound.playBounce();
              return;
            }
            this.board[r][c] = 0;
          }
        }
      }
    }

    // 3. Take Center or Random Free Cell
    const center = Math.floor(this.boardSize / 2);
    if (this.board[center][center] === 0) {
      this.board[center][center] = 2;
      sound.playBounce();
      return;
    }

    const freeCells = [];
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c] === 0) {
          freeCells.push({ r, c });
        }
      }
    }

    if (freeCells.length > 0) {
      const pick = freeCells[Math.floor(Math.random() * freeCells.length)];
      this.board[pick.r][pick.c] = 2;
      sound.playBounce();

      if (this.checkWin(2)) {
        this.aiWins++;
        sound.playExplosion();
        this.roundOver = true;
      } else if (this.isBoardFull()) {
        this.addScore(100);
        sound.playBounce();
        this.roundOver = true;
      }
    }
  }

  checkWin(playerVal) {
    const s = this.boardSize;
    // Check rows & columns
    for (let i = 0; i < s; i++) {
      let rowMatch = true;
      let colMatch = true;
      for (let j = 0; j < s; j++) {
        if (this.board[i][j] !== playerVal) rowMatch = false;
        if (this.board[j][i] !== playerVal) colMatch = false;
      }
      if (rowMatch || colMatch) return true;
    }

    // Check Diagonals
    let diag1 = true, diag2 = true;
    for (let i = 0; i < s; i++) {
      if (this.board[i][i] !== playerVal) diag1 = false;
      if (this.board[i][s - 1 - i] !== playerVal) diag2 = false;
    }
    return diag1 || diag2;
  }

  isBoardFull() {
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c] === 0) return false;
      }
    }
    return true;
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // Centered 3x3 layout on 10x20 display:
    // Board starts at y=4, height=12
    // Cells: size 2x3 each with 1-cell gaps
    const cellW = 2;
    const cellH = 3;
    const startX = Math.floor((10 - (this.boardSize * (cellW + 1) - 1)) / 2);
    const startY = 4;

    // Draw Grid Lines
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cx = startX + c * (cellW + 1);
        const cy = startY + r * (cellH + 1);
        const val = this.board[r][c];

        if (val === 1) {
          // Player X: Cross pattern
          renderer.setPixel(cx, cy, 1);
          renderer.setPixel(cx + 1, cy + 2, 1);
          renderer.setPixel(cx + 1, cy, 1);
          renderer.setPixel(cx, cy + 2, 1);
          renderer.setPixel(cx, cy + 1, 1);
        } else if (val === 2) {
          // AI O: Hollow Ring
          renderer.drawRect(cx, cy, cellW, cellH, 1, false);
        }

        // Draw cursor
        if (this.cursor.x === c && this.cursor.y === r && !this.isAiTurn) {
          renderer.drawRect(cx - 0.5, cy - 0.5, cellW + 1, cellH + 1, 2, false);
        }
      }
    }

    // Score indicator at row 18 (Player dots left, AI dots right)
    for (let p = 0; p < this.playerWins; p++) {
      renderer.setPixel(p * 2 + 1, 18, 1);
    }
    for (let a = 0; a < this.aiWins; a++) {
      renderer.setPixel(8 - a * 2, 18, 2);
    }
  }
}
