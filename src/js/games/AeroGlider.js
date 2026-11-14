/**
 * Retro Brick Game Console - AeroGlider
 * Precision altitude flapping through high-voltage storm pylons.
 */

import { BaseGame } from '../core/BaseGame.js';

export class AeroGlider extends BaseGame {
  constructor() {
    super('aero-glider', 'Aero Glider', 'Arcade');
    this.gliderY = 10;
    this.velocity = 0;
    this.gravity = 14;
    this.flapStrength = -6;
    this.pylons = []; // { x, gapTop, gapHeight, passed }
    this.spawnTimer = 0;
    this.spawnInterval = 2.2;
    this.pylonsPassed = 0;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.gravity = 10;
      this.spawnInterval = 2.8;
      this.gapHeight = 6;
    } else if (diff === 'HARD') {
      this.gravity = 18;
      this.spawnInterval = 1.7;
      this.gapHeight = 4;
    } else {
      this.gravity = 14;
      this.spawnInterval = 2.2;
      this.gapHeight = 5;
    }

    this.gliderY = 10;
    this.velocity = 0;
    this.pylons = [];
    this.spawnTimer = 0;
    this.pylonsPassed = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // Upward Flap (Button A or Up)
    if (input.isJustPressed('ACTION_A') || input.isJustPressed('UP')) {
      this.velocity = this.flapStrength;
      sound.playRotate();
    }

    // Air Brake / Dive (Button B or Down)
    if (input.isDown('ACTION_B') || input.isDown('DOWN')) {
      this.velocity += 20 * deltaTime;
    }

    // Apply gravity
    this.velocity += this.gravity * deltaTime;
    this.gliderY += this.velocity * deltaTime;

    // Ceiling & Ground crash checks
    if (this.gliderY < 0) {
      this.gliderY = 0;
      this.velocity = 0;
    } else if (this.gliderY > 19) {
      sound.playExplosion();
      this.emitLives(this.lives - 1);
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      this.gliderY = 10;
      this.velocity = 0;
      return;
    }

    // Spawn Pylons
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      const minTop = 2;
      const maxTop = 20 - this.gapHeight - 2;
      const gapTop = minTop + Math.floor(Math.random() * (maxTop - minTop + 1));

      this.pylons.push({
        x: 9,
        gapTop,
        gapHeight: this.gapHeight,
        passed: false
      });
    }

    // Update Pylons
    const scrollSpeed = 4.0; // cols per sec
    for (let i = this.pylons.length - 1; i >= 0; i--) {
      const p = this.pylons[i];
      p.x -= scrollSpeed * deltaTime;

      const px = Math.round(p.x);
      const gy = Math.round(this.gliderY);

      // Collision Check (Glider at x=2)
      if (px === 2 || px === 3) {
        if (gy < p.gapTop || gy >= p.gapTop + p.gapHeight) {
          // Crash!
          sound.playExplosion();
          this.emitLives(this.lives - 1);
          this.pylons.splice(i, 1);
          if (this.lives <= 0) {
            this.gameOver();
            return;
          }
          this.gliderY = 10;
          this.velocity = 0;
          continue;
        }
      }

      // Passed Gate scoring
      if (!p.passed && p.x < 2) {
        p.passed = true;
        this.pylonsPassed++;
        this.addScore(10);
        sound.playScore();

        if (this.pylonsPassed % 10 === 0) {
          this.emitLevel(Math.floor(this.pylonsPassed / 10) + 1);
        }

        if (this.pylonsPassed >= 100) {
          sound.playVictory();
          this.addScore(5000);
          this.gameOver();
          return;
        }
      }

      if (p.x < -1) {
        this.pylons.splice(i, 1);
      }
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Pylons
    for (const p of this.pylons) {
      const px = Math.round(p.x);
      if (px >= 0 && px < 10) {
        // Top pylon
        for (let y = 0; y < p.gapTop; y++) {
          renderer.setPixel(px, y, 1);
        }
        // Bottom pylon
        for (let y = p.gapTop + p.gapHeight; y < 20; y++) {
          renderer.setPixel(px, y, 1);
        }
      }
    }

    // 2. Draw Glider (2x1 dart at x=2)
    const gy = Math.min(19, Math.max(0, Math.round(this.gliderY)));
    renderer.setPixel(2, gy, 1);
    renderer.setPixel(3, gy, 2); // Blinking nose
  }
}
