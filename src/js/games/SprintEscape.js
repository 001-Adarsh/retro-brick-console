/**
 * Retro Brick Game Console - SprintEscape
 * Dystopian rooftop parkour runner with double-jumps, low slides, and scrolling rooftops.
 */

import { BaseGame } from '../core/BaseGame.js';

export class SprintEscape extends BaseGame {
  constructor() {
    super('sprint-escape', 'Sprint Escape', 'Runner');
    this.runnerY = 14;
    this.velocityY = 0;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.isSliding = false;
    this.slideTimer = 0;
    this.distance = 0;
    this.scrollSpeed = 6.0; // cols per second
    this.platforms = []; // { x, width, height }
    this.hazards = []; // { x, y, type: 'spike'|'overhead'|'cube' }
    this.spawnTimer = 0;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') this.scrollSpeed = 5.0;
    else if (diff === 'HARD') this.scrollSpeed = 8.0;
    else this.scrollSpeed = 6.5;

    this.runnerY = 14;
    this.velocityY = 0;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.isSliding = false;
    this.slideTimer = 0;
    this.distance = 0;
    this.platforms = [{ x: 0, width: 14 }];
    this.hazards = [];
    this.spawnTimer = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // 1. Jump (Button A or Up) - Supports Double Jump!
    if (input.isJustPressed('ACTION_A') || input.isJustPressed('UP')) {
      if (this.isGrounded || this.jumpCount < 2) {
        this.velocityY = -10;
        this.isGrounded = false;
        this.isSliding = false;
        this.jumpCount++;
        sound.playRotate();
      }
    }

    // 2. Low Slide (Button B or Down)
    if ((input.isJustPressed('ACTION_B') || input.isJustPressed('DOWN')) && this.isGrounded) {
      this.isSliding = true;
      this.slideTimer = 0.6;
      sound.playMove();
    }

    if (this.isSliding) {
      this.slideTimer -= deltaTime;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 3. Gravity & Physics
    if (!this.isGrounded) {
      this.velocityY += 24 * deltaTime;
      this.runnerY += this.velocityY * deltaTime;
    }

    // 4. Scroll Platforms & Hazards
    this.distance += this.scrollSpeed * deltaTime * 10;
    this.addScore(1);

    // Platform generation
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= 1.5) {
      this.spawnTimer = 0;
      const gap = Math.random() < 0.4 ? 2 : 0;
      const platW = 6 + Math.floor(Math.random() * 6);
      const lastX = this.platforms.length > 0 ? this.platforms[this.platforms.length - 1].x + this.platforms[this.platforms.length - 1].width : 10;

      this.platforms.push({ x: lastX + gap, width: platW });

      // Spawn hazard on platform
      if (Math.random() < 0.5) {
        const hazardType = Math.random() < 0.5 ? 'overhead' : 'spike';
        this.hazards.push({
          x: lastX + gap + Math.floor(platW / 2),
          y: hazardType === 'overhead' ? 12 : 15,
          type: hazardType
        });
      } else if (Math.random() < 0.4) {
        this.hazards.push({
          x: lastX + gap + Math.floor(platW / 2),
          y: 13,
          type: 'cube'
        });
      }
    }

    // Shift platforms
    const shift = this.scrollSpeed * deltaTime;
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const p = this.platforms[i];
      p.x -= shift;
      if (p.x + p.width < -2) {
        this.platforms.splice(i, 1);
      }
    }

    // Shift hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.x -= shift;

      // Collision with runner (runner x=2..3, y=runnerY..runnerY+1)
      const hx = Math.round(h.x);
      const hy = Math.round(h.y);

      if (hx >= 2 && hx <= 3) {
        if (h.type === 'cube') {
          // Pickup!
          this.addScore(50);
          sound.playScore();
          this.hazards.splice(i, 1);
          continue;
        } else if (h.type === 'spike') {
          // Spike hit if grounded
          if (this.runnerY >= 14) {
            this.handleCrash();
            return;
          }
        } else if (h.type === 'overhead') {
          // Overhead hit if NOT sliding
          if (!this.isSliding && this.runnerY <= 14) {
            this.handleCrash();
            return;
          }
        }
      }

      if (h.x < -2) {
        this.hazards.splice(i, 1);
      }
    }

    // Test Ground Collision (runner x=2, base platform height y=16)
    let supported = false;
    for (const p of this.platforms) {
      if (2 >= p.x && 2 < p.x + p.width) {
        supported = true;
        break;
      }
    }

    if (supported && this.runnerY >= 14 && this.velocityY >= 0) {
      this.runnerY = 14;
      this.velocityY = 0;
      this.isGrounded = true;
      this.jumpCount = 0;
    } else if (!supported && this.runnerY >= 14) {
      this.isGrounded = false;
    }

    // Falling into building gap
    if (this.runnerY > 19) {
      this.handleCrash();
      return;
    }

    // Check Win (5000 meters)
    if (this.distance >= 5000) {
      sound.playVictory();
      this.addScore(5000);
      this.gameOver();
    }
  }

  handleCrash() {
    const sound = this.context.sound;
    sound.playExplosion();
    this.emitLives(this.lives - 1);
    if (this.lives <= 0) {
      this.gameOver();
      return;
    }
    this.runnerY = 14;
    this.velocityY = 0;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.platforms = [{ x: 0, width: 14 }];
    this.hazards = [];
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Rooftops (Row 16..17)
    for (const p of this.platforms) {
      const sx = Math.floor(p.x);
      const ex = Math.floor(p.x + p.width);
      for (let x = sx; x < ex; x++) {
        if (x >= 0 && x < 10) {
          renderer.setPixel(x, 16, 1);
          renderer.setPixel(x, 17, 1);
        }
      }
    }

    // 2. Draw Hazards
    for (const h of this.hazards) {
      const hx = Math.round(h.x);
      if (hx >= 0 && hx < 10) {
        if (h.type === 'spike') {
          renderer.setPixel(hx, 15, 2);
        } else if (h.type === 'overhead') {
          renderer.setPixel(hx, 13, 1);
          renderer.setPixel(hx, 12, 1);
        } else if (h.type === 'cube') {
          renderer.setPixel(hx, 13, 2);
        }
      }
    }

    // 3. Draw Runner Avatar
    const ry = Math.round(this.runnerY);
    if (this.isSliding) {
      // Low slide: 2x1 flat on ground
      renderer.setPixel(2, 15, 1);
      renderer.setPixel(3, 15, 1);
    } else {
      // Upright runner: 2x2
      renderer.setPixel(2, ry, 1);
      renderer.setPixel(3, ry, 1);
      renderer.setPixel(2, ry + 1, 1);
      renderer.setPixel(3, ry + 1, 1);
    }
  }
}
