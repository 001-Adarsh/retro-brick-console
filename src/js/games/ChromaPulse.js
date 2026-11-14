/**
 * Retro Brick Game Console - ChromaPulse
 * Sequential 4-quadrant audio-visual memory with reverse echo rounds.
 */

import { BaseGame } from '../core/BaseGame.js';

export const QUADRANT_FREQS = {
  UP: 880,
  RIGHT: 659,
  DOWN: 440,
  LEFT: 329
};

export class ChromaPulse extends BaseGame {
  constructor() {
    super('chroma-pulse', 'Chroma Pulse', 'Puzzle');
    this.sequence = [];
    this.playerIndex = 0;
    this.playbackIndex = 0;
    this.playbackTimer = 0;
    this.playbackDuration = 0.35;
    this.isPlayback = true;
    this.activeQuadrant = null; // 'UP'|'RIGHT'|'DOWN'|'LEFT'
    this.isReverseRound = false;
    this.maxSequence = 20;
    this.hintUsed = false;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.playbackDuration = 0.5;
      this.maxSequence = 12;
    } else if (diff === 'HARD') {
      this.playbackDuration = 0.22;
      this.maxSequence = 30;
    } else {
      this.playbackDuration = 0.35;
      this.maxSequence = 20;
    }

    this.sequence = [];
    this.addStepToSequence();
    this.startPlayback();
  }

  addStepToSequence() {
    const quadrants = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    const nextQ = quadrants[Math.floor(Math.random() * 4)];
    this.sequence.push(nextQ);
  }

  startPlayback() {
    this.isPlayback = true;
    this.playbackIndex = 0;
    this.playbackTimer = 0;
    this.activeQuadrant = null;
    this.playerIndex = 0;
    this.hintUsed = false;

    // Check if this round is a reverse echo round (every 5th step)
    this.isReverseRound = this.sequence.length % 5 === 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // 1. Sequence Playback Phase
    if (this.isPlayback) {
      this.playbackTimer += deltaTime;

      if (this.playbackTimer < this.playbackDuration) {
        // Active pulse
        if (this.activeQuadrant === null && this.playbackIndex < this.sequence.length) {
          this.activeQuadrant = this.sequence[this.playbackIndex];
          sound.playTone(QUADRANT_FREQS[this.activeQuadrant], this.playbackDuration * 0.8, 'square');
        }
      } else if (this.playbackTimer < this.playbackDuration + 0.15) {
        // Inter-pulse gap
        this.activeQuadrant = null;
      } else {
        // Advance to next step
        this.playbackTimer = 0;
        this.playbackIndex++;
        if (this.playbackIndex >= this.sequence.length) {
          // Playback complete -> transition to Player Echo Phase
          this.isPlayback = false;
          this.activeQuadrant = null;
        }
      }
      return;
    }

    // 2. Player Input Phase
    let inputQ = null;
    if (input.isJustPressed('UP')) inputQ = 'UP';
    else if (input.isJustPressed('RIGHT')) inputQ = 'RIGHT';
    else if (input.isJustPressed('DOWN')) inputQ = 'DOWN';
    else if (input.isJustPressed('LEFT')) inputQ = 'LEFT';

    // Re-listen Hint (Button B)
    if (input.isJustPressed('ACTION_B') && !this.hintUsed) {
      this.hintUsed = true;
      this.startPlayback();
      return;
    }

    if (inputQ) {
      this.activeQuadrant = inputQ;
      sound.playTone(QUADRANT_FREQS[inputQ], 0.15, 'square');

      // Determine expected step (standard vs reverse echo)
      const expectedIndex = this.isReverseRound
        ? this.sequence.length - 1 - this.playerIndex
        : this.playerIndex;
      const expectedQ = this.sequence[expectedIndex];

      if (inputQ === expectedQ) {
        // Correct step!
        this.playerIndex++;
        this.addScore(25 * this.sequence.length);

        if (this.playerIndex >= this.sequence.length) {
          // Entire sequence successfully echoed!
          sound.playVictory();
          this.addScore(this.sequence.length * 50);
          this.emitLevel(this.sequence.length);

          if (this.sequence.length >= this.maxSequence) {
            this.addScore(5000);
            this.gameOver();
            return;
          }

          // Advance sequence
          this.addStepToSequence();
          this.playbackDuration = Math.max(0.16, this.playbackDuration * 0.96);
          this.startPlayback();
        }
      } else {
        // Strike / Error!
        sound.playExplosion();
        this.emitLives(this.lives - 1);
        if (this.lives <= 0) {
          this.gameOver();
          return;
        }
        // Re-play sequence
        this.startPlayback();
      }
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // Draw Crosshair Divider Lines
    for (let r = 0; r < 20; r++) {
      renderer.setPixel(4, r, 1);
      renderer.setPixel(5, r, 1);
    }
    for (let c = 0; c < 10; c++) {
      renderer.setPixel(c, 9, 1);
      renderer.setPixel(c, 10, 1);
    }

    // Quadrant bounds:
    // UP: x=1..8, y=2..6
    // RIGHT: x=7..9, y=12..17
    // DOWN: x=1..8, y=13..17
    // LEFT: x=0..2, y=12..17

    if (this.activeQuadrant === 'UP') {
      renderer.drawRect(2, 2, 6, 6, 1, true);
    } else if (this.activeQuadrant === 'RIGHT') {
      renderer.drawRect(6, 12, 4, 6, 1, true);
    } else if (this.activeQuadrant === 'DOWN') {
      renderer.drawRect(2, 12, 6, 6, 1, true);
    } else if (this.activeQuadrant === 'LEFT') {
      renderer.drawRect(0, 12, 4, 6, 1, true);
    }

    // Draw Reverse Indicator in Center if Reverse Round
    if (this.isReverseRound) {
      renderer.setPixel(4, 9, 2);
      renderer.setPixel(5, 10, 2);
    }
  }
}
