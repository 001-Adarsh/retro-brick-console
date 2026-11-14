/**
 * Retro Brick Game Console - ReflexRush
 * Neural synapse reflex evaluator with split-second micro-challenges and fake-outs.
 */

import { BaseGame } from '../core/BaseGame.js';

export class ReflexRush extends BaseGame {
  constructor() {
    super('reflex-rush', 'Reflex Rush', 'Action');
    this.currentPrompt = null; // { type: 'A'|'B'|'UP'|'DOWN'|'LEFT'|'RIGHT'|'FAKEOUT', count: number }
    this.reactionWindow = 1.0;
    this.timeRemaining = 1.0;
    this.trialsCompleted = 0;
    this.maxTrials = 50;
    this.streak = 0;
    this.pressCount = 0;
    this.state = 'WAITING'; // 'WAITING', 'ACTIVE', 'FEEDBACK'
    this.feedbackTimer = 0;
    this.wasSuccess = false;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') this.reactionWindow = 1.2;
    else if (diff === 'HARD') this.reactionWindow = 0.55;
    else this.reactionWindow = 0.85;

    this.trialsCompleted = 0;
    this.streak = 0;
    this.startNewTrial();
  }

  startNewTrial() {
    this.state = 'ACTIVE';
    this.timeRemaining = this.reactionWindow;
    this.pressCount = 0;

    const diff = this.context.difficulty || 'MEDIUM';
    const prompts = ['A', 'UP', 'DOWN', 'LEFT', 'RIGHT'];
    if (diff !== 'EASY') {
      prompts.push('FAKEOUT', 'TAP_B');
    }

    const type = prompts[Math.floor(Math.random() * prompts.length)];
    this.currentPrompt = {
      type,
      targetCount: type === 'TAP_B' ? 3 : 1
    };

    if (this.context && this.context.sound) {
      this.context.sound.playTone(type === 'FAKEOUT' ? 220 : 660, 0.08, 'square');
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    if (this.state === 'FEEDBACK') {
      this.feedbackTimer -= deltaTime;
      if (this.feedbackTimer <= 0) {
        if (this.trialsCompleted >= this.maxTrials) {
          sound.playVictory();
          this.addScore(5000);
          this.gameOver();
          return;
        }
        this.startNewTrial();
      }
      return;
    }

    // Active Trial Countdown
    this.timeRemaining -= deltaTime;

    // Check Timeout
    if (this.timeRemaining <= 0) {
      if (this.currentPrompt.type === 'FAKEOUT') {
        // Successfully avoided pressing!
        this.handleSuccess();
      } else {
        // Failed by timeout
        this.handleFailure();
      }
      return;
    }

    // Evaluate Input
    const pressedA = input.isJustPressed('ACTION_A');
    const pressedB = input.isJustPressed('ACTION_B');
    const pressedUp = input.isJustPressed('UP');
    const pressedDown = input.isJustPressed('DOWN');
    const pressedLeft = input.isJustPressed('LEFT');
    const pressedRight = input.isJustPressed('RIGHT');

    const anyPressed = pressedA || pressedB || pressedUp || pressedDown || pressedLeft || pressedRight;

    if (!anyPressed) return;

    if (this.currentPrompt.type === 'FAKEOUT') {
      // Pressed a button during fakeout -> Fail!
      this.handleFailure();
      return;
    }

    if (this.currentPrompt.type === 'A' && pressedA) {
      this.handleSuccess();
    } else if (this.currentPrompt.type === 'UP' && pressedUp) {
      this.handleSuccess();
    } else if (this.currentPrompt.type === 'DOWN' && pressedDown) {
      this.handleSuccess();
    } else if (this.currentPrompt.type === 'LEFT' && pressedLeft) {
      this.handleSuccess();
    } else if (this.currentPrompt.type === 'RIGHT' && pressedRight) {
      this.handleSuccess();
    } else if (this.currentPrompt.type === 'TAP_B' && pressedB) {
      this.pressCount++;
      sound.playMove();
      if (this.pressCount >= this.currentPrompt.targetCount) {
        this.handleSuccess();
      }
    } else {
      // Wrong button pressed!
      this.handleFailure();
    }
  }

  handleSuccess() {
    const sound = this.context.sound;
    sound.playScore();

    this.trialsCompleted++;
    this.streak++;
    const latency = this.reactionWindow - this.timeRemaining;
    let bonus = 100 + Math.round(this.timeRemaining * 200);
    if (latency < 0.25) bonus += 250; // Godlike reflex

    this.addScore(bonus);
    this.wasSuccess = true;
    this.state = 'FEEDBACK';
    this.feedbackTimer = 0.35;

    // Accelerate speed slightly
    this.reactionWindow = Math.max(0.35, this.reactionWindow * 0.98);
    if (this.trialsCompleted % 5 === 0) {
      this.emitLevel(Math.floor(this.trialsCompleted / 5) + 1);
    }
  }

  handleFailure() {
    const sound = this.context.sound;
    sound.playExplosion();
    this.streak = 0;
    this.emitLives(this.lives - 1);
    this.wasSuccess = false;
    this.state = 'FEEDBACK';
    this.feedbackTimer = 0.5;

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    if (this.state === 'FEEDBACK') {
      // Flash screen for success or error
      if (this.wasSuccess) {
        renderer.drawRect(3, 7, 4, 4, 1, true);
      } else {
        renderer.drawRect(2, 6, 6, 6, 2, false);
      }
      return;
    }

    // Draw Directive Glyph
    const type = this.currentPrompt.type;

    if (type === 'A') {
      // Large [A] glyph in center (y=7..11)
      renderer.drawRect(3, 7, 4, 5, 1, false);
      renderer.setPixel(4, 9, 1);
      renderer.setPixel(5, 9, 1);
    } else if (type === 'TAP_B') {
      // [B] with mash dots
      renderer.drawRect(3, 7, 4, 5, 2, false);
      for (let i = 0; i < this.pressCount; i++) {
        renderer.setPixel(4 + i, 14, 1);
      }
    } else if (type === 'UP') {
      // Arrow Up
      renderer.setPixel(4, 7, 1);
      renderer.setPixel(5, 7, 1);
      renderer.setPixel(3, 8, 1);
      renderer.setPixel(6, 8, 1);
      renderer.drawRect(4, 9, 2, 3, 1, true);
    } else if (type === 'DOWN') {
      // Arrow Down
      renderer.drawRect(4, 7, 2, 3, 1, true);
      renderer.setPixel(3, 10, 1);
      renderer.setPixel(6, 10, 1);
      renderer.setPixel(4, 11, 1);
      renderer.setPixel(5, 11, 1);
    } else if (type === 'LEFT') {
      // Arrow Left
      renderer.drawRect(5, 8, 3, 2, 1, true);
      renderer.setPixel(4, 7, 1);
      renderer.setPixel(3, 8, 1);
      renderer.setPixel(3, 9, 1);
      renderer.setPixel(4, 10, 1);
    } else if (type === 'RIGHT') {
      // Arrow Right
      renderer.drawRect(2, 8, 3, 2, 1, true);
      renderer.setPixel(5, 7, 1);
      renderer.setPixel(6, 8, 1);
      renderer.setPixel(6, 9, 1);
      renderer.setPixel(5, 10, 1);
    } else if (type === 'FAKEOUT') {
      // Warning Stop Hand / Cross
      renderer.drawRect(2, 6, 6, 6, 2, true);
    }

    // Rapidly shrinking reaction timer bar (Row 18)
    const ratio = Math.max(0, this.timeRemaining / this.reactionWindow);
    const barW = Math.ceil(ratio * 10);
    for (let x = 0; x < barW; x++) {
      renderer.setPixel(x, 18, 1);
    }
  }
}
