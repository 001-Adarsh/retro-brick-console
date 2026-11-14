/**
 * Retro Brick Game Console - TileMemory
 * Cryptographic matrix matching puzzle with glyph decoders and peek sonar.
 */

import { BaseGame } from '../core/BaseGame.js';

// 8 distinct 2x2 or 3x3 glyphs for cards
const GLYPHS = [
  // 0: Cross
  [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
  // 1: Plus
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  // 2: Square Box / Ring
  [[1, 1, 1], [1, 0, 1], [1, 1, 1]],
  // 3: Solid Pip
  [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
  // 4: Horizontal Bars
  [[1, 1, 1], [0, 0, 0], [1, 1, 1]],
  // 5: Vertical Bars
  [[1, 0, 1], [1, 0, 1], [1, 0, 1]],
  // 6: Diamond
  [[0, 1, 0], [1, 0, 1], [0, 1, 0]],
  // 7: Chevron
  [[1, 0, 1], [0, 1, 0], [0, 0, 0]]
];

export class TileMemory extends BaseGame {
  constructor() {
    super('tile-memory', 'Tile Memory', 'Puzzle');
    this.cols = 4;
    this.rows = 4;
    this.cards = []; // 2D array of { glyphId, revealed, matched }
    this.cursor = { x: 0, y: 0 };
    this.firstPick = null;
    this.secondPick = null;
    this.mismatchTimer = 0;
    this.peekTimer = 0;
    this.timeRemaining = 60;
    this.totalTime = 60;
    this.streak = 0;
    this.stage = 1;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.cols = 3;
      this.rows = 4;
      this.totalTime = 90;
    } else if (diff === 'HARD') {
      this.cols = 4;
      this.rows = 4;
      this.totalTime = 45;
    } else {
      this.cols = 4;
      this.rows = 4;
      this.totalTime = 60;
    }

    this.timeRemaining = this.totalTime;
    this.stage = 1;
    this.streak = 0;
    this.initBoard();
  }

  initBoard() {
    const totalTiles = this.cols * this.rows;
    const pairCount = totalTiles / 2;

    // Create paired glyph list
    const deck = [];
    for (let i = 0; i < pairCount; i++) {
      const g = i % GLYPHS.length;
      deck.push(g, g);
    }

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Build 2D cards grid
    this.cards = [];
    let idx = 0;
    for (let r = 0; r < this.rows; r++) {
      const rowArr = [];
      for (let c = 0; c < this.cols; c++) {
        rowArr.push({
          glyphId: deck[idx++],
          revealed: false,
          matched: false
        });
      }
      this.cards.push(rowArr);
    }

    this.cursor = { x: 0, y: 0 };
    this.firstPick = null;
    this.secondPick = null;
    this.mismatchTimer = 0;
    this.peekTimer = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // Countdown Timer
    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.emitLives(this.lives - 1);
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      this.timeRemaining = this.totalTime;
      this.initBoard();
      return;
    }

    // Mismatch flip-back delay
    if (this.mismatchTimer > 0) {
      this.mismatchTimer -= deltaTime;
      if (this.mismatchTimer <= 0) {
        if (this.firstPick && this.secondPick) {
          this.firstPick.revealed = false;
          this.secondPick.revealed = false;
          this.firstPick = null;
          this.secondPick = null;
        }
      }
      return; // Freeze cursor input during reveal
    }

    // Peek Sonar (Button B)
    if (this.peekTimer > 0) {
      this.peekTimer -= deltaTime;
    } else if (input.isJustPressed('ACTION_B')) {
      // Find two matching unmatched cards and briefly reveal
      const unmatched = [];
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (!this.cards[r][c].matched) {
            unmatched.push(this.cards[r][c]);
          }
        }
      }

      for (let i = 0; i < unmatched.length; i++) {
        for (let j = i + 1; j < unmatched.length; j++) {
          if (unmatched[i].glyphId === unmatched[j].glyphId) {
            unmatched[i].revealed = true;
            unmatched[j].revealed = true;
            this.peekTimer = 0.5;
            sound.playTone(700, 0.1, 'triangle');
            break;
          }
        }
        if (this.peekTimer > 0) break;
      }
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

    // Flip Card (Button A)
    if (input.isJustPressed('ACTION_A')) {
      const card = this.cards[this.cursor.y][this.cursor.x];
      if (!card.matched && !card.revealed) {
        card.revealed = true;
        sound.playRotate();

        if (!this.firstPick) {
          this.firstPick = card;
        } else if (!this.secondPick) {
          this.secondPick = card;

          // Compare
          if (this.firstPick.glyphId === this.secondPick.glyphId) {
            // Match!
            this.firstPick.matched = true;
            this.secondPick.matched = true;
            this.streak++;
            this.addScore(100 + this.streak * 50);
            sound.playScore();
            this.firstPick = null;
            this.secondPick = null;
            this.checkBoardCleared();
          } else {
            // Mismatch
            this.streak = 0;
            this.mismatchTimer = 0.8;
            sound.playBounce();
          }
        }
      }
    }
  }

  checkBoardCleared() {
    let allMatched = true;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.cards[r][c].matched) {
          allMatched = false;
          break;
        }
      }
    }

    if (allMatched) {
      const sound = this.context.sound;
      sound.playVictory();
      this.addScore(Math.round(this.timeRemaining * 20));
      this.stage++;
      this.emitLevel(this.stage);

      if (this.stage > 5) {
        this.addScore(3000);
        this.gameOver();
        return;
      }

      this.timeRemaining = Math.max(30, this.totalTime - (this.stage - 1) * 5);
      this.initBoard();
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // Center card grid in top 18 rows
    // Each card is 2x3 or 2x2. Spacing: 2 cols per card, 1 col gap.
    // 4 cards across cols: c*2 + 1 -> c=0:1, c=1:3, c=2:5, c=3:7
    // 4 cards down rows: r*4 + 1 -> r=0:1, r=1:5, r=2:9, r=3:13
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const card = this.cards[r][c];
        const cx = c * 2 + 1;
        const cy = r * 4 + 1;

        if (card.matched) {
          // Fully matched card: static lit border
          renderer.drawRect(cx, cy, 2, 3, 1, false);
        } else if (card.revealed) {
          // Revealed card: solid block or inner glyph
          renderer.drawRect(cx, cy, 2, 3, 1, true);
        } else {
          // Concealed tile: top-left and bottom-right corner pixel
          renderer.setPixel(cx, cy, 1);
          renderer.setPixel(cx + 1, cy + 2, 1);
        }

        // Draw cursor highlight around card
        if (this.cursor.x === c && this.cursor.y === r) {
          renderer.drawRect(cx - 0.5, cy - 0.5, 3, 4, 2, false);
        }
      }
    }

    // Draw horizontal countdown timer bar across row 19
    const timerRatio = this.timeRemaining / this.totalTime;
    const barWidth = Math.ceil(timerRatio * 10);
    for (let x = 0; x < barWidth; x++) {
      renderer.setPixel(x, 19, 1);
    }
  }
}
