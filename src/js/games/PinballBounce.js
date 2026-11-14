/**
 * Retro Brick Game Console - PinballBounce
 * Kinetic graviton arcade table with dual flippers, pop bumpers, and tilt mechanics.
 */

import { BaseGame } from '../core/BaseGame.js';

export class PinballBounce extends BaseGame {
  constructor() {
    super('pinball-bounce', 'Pinball Bounce', 'Arcade');
    this.ball = { x: 9, y: 18, vx: 0, vy: 0 };
    this.inPlunger = true;
    this.plungerTension = 0;
    this.leftFlipperActive = false;
    this.rightFlipperActive = false;
    this.popBumpers = [
      { x: 3, y: 4, radius: 1 },
      { x: 6, y: 4, radius: 1 }
    ];
    this.dropTargets = [true, true, true]; // x=3, 4, 5 at row 9
    this.tiltCount = 0;
    this.isTilted = false;
    this.gravity = 9.8;
  }

  init(context) {
    super.init(context);
    this.tiltCount = 0;
    this.isTilted = false;
    this.resetBall();
  }

  resetBall() {
    this.ball = { x: 9, y: 18, vx: 0, vy: 0 };
    this.inPlunger = true;
    this.plungerTension = 0;
    this.leftFlipperActive = false;
    this.rightFlipperActive = false;
    this.dropTargets = [true, true, true];
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // 1. Plunger Mechanics
    if (this.inPlunger) {
      if (input.isDown('DOWN')) {
        this.plungerTension = Math.min(1.0, this.plungerTension + deltaTime * 1.5);
      } else if (this.plungerTension > 0.1) {
        // Release plunger shot!
        this.inPlunger = false;
        this.ball.vy = -12 * (0.5 + this.plungerTension * 0.5);
        this.ball.vx = -1.5;
        this.plungerTension = 0;
        sound.playShoot();
      }
      return;
    }

    // 2. Flipper Actuation
    this.leftFlipperActive = !this.isTilted && (input.isDown('LEFT') || input.isJustPressed('LEFT'));
    this.rightFlipperActive = !this.isTilted && (input.isDown('ACTION_A') || input.isJustPressed('ACTION_A'));

    // 3. Table Nudge & Tilt
    if (input.isJustPressed('UP') || input.isJustPressed('ACTION_B')) {
      this.tiltCount++;
      sound.playTone(450, 0.05, 'sawtooth');
      this.ball.vx += (Math.random() - 0.5) * 4;
      this.ball.vy -= 2;

      if (this.tiltCount >= 3) {
        this.isTilted = true; // Flippers disabled!
      }
    }

    // 4. Ball Gravity & Movement
    this.ball.vy += this.gravity * deltaTime;
    this.ball.x += this.ball.vx * deltaTime;
    this.ball.y += this.ball.vy * deltaTime;

    // Wall Ricochets (left x=0, right x=9, top y=0)
    if (this.ball.x <= 0) {
      this.ball.x = 0;
      this.ball.vx = Math.abs(this.ball.vx) * 0.8;
      sound.playBounce();
    } else if (this.ball.x >= 9) {
      this.ball.x = 9;
      this.ball.vx = -Math.abs(this.ball.vx) * 0.8;
      sound.playBounce();
    }

    if (this.ball.y <= 0) {
      this.ball.y = 0;
      this.ball.vy = Math.abs(this.ball.vy) * 0.8;
      sound.playBounce();
    }

    // 5. Pop Bumpers Collision
    for (const pb of this.popBumpers) {
      const dist = Math.hypot(this.ball.x - pb.x, this.ball.y - pb.y);
      if (dist < 1.4) {
        this.ball.vx = (this.ball.x - pb.x) * 8;
        this.ball.vy = (this.ball.y - pb.y) * 8;
        this.addScore(50);
        sound.playBounce();
      }
    }

    // 6. Drop Targets (Row 9, cols 3, 4, 5)
    if (Math.round(this.ball.y) === 9) {
      const col = Math.round(this.ball.x);
      if (col >= 3 && col <= 5 && this.dropTargets[col - 3]) {
        this.dropTargets[col - 3] = false;
        this.ball.vy = Math.abs(this.ball.vy);
        this.addScore(100);
        sound.playScore();

        // Check all cleared
        if (this.dropTargets.every(t => !t)) {
          this.addScore(1000);
          sound.playVictory();
          this.dropTargets = [true, true, true]; // reset bank
        }
      }
    }

    // 7. Flippers Contact (Row 18)
    // Left Flipper: cols 2..4
    // Right Flipper: cols 5..7
    if (this.ball.y >= 17.5 && this.ball.y <= 18.5 && this.ball.vy > 0) {
      if (this.ball.x >= 2 && this.ball.x <= 4 && this.leftFlipperActive) {
        this.ball.vy = -10;
        this.ball.vx = 3;
        sound.playBounce();
      } else if (this.ball.x >= 5 && this.ball.x <= 7 && this.rightFlipperActive) {
        this.ball.vy = -10;
        this.ball.vx = -3;
        sound.playBounce();
      }
    }

    // 8. Ball Drain (Bottom row 20)
    if (this.ball.y > 20) {
      sound.playExplosion();
      this.emitLives(this.lives - 1);
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      this.resetBall();
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Pop Bumpers
    for (const pb of this.popBumpers) {
      renderer.setPixel(pb.x, pb.y, 2);
    }

    // 2. Draw Drop Target Bank (Row 9)
    for (let i = 0; i < 3; i++) {
      if (this.dropTargets[i]) {
        renderer.setPixel(3 + i, 9, 1);
      }
    }

    // 3. Draw Flippers (Row 18)
    const leftY = this.leftFlipperActive ? 17 : 18;
    renderer.drawRect(2, leftY, 3, 1, 1, true);

    const rightY = this.rightFlipperActive ? 17 : 18;
    renderer.drawRect(5, rightY, 3, 1, 1, true);

    // 4. Draw Ball
    const bx = Math.min(9, Math.max(0, Math.round(this.ball.x)));
    const by = Math.min(19, Math.max(0, Math.round(this.ball.y)));
    renderer.setPixel(bx, by, 1);
  }
}
