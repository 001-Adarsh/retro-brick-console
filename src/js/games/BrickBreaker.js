/**
 * Retro Brick Game Console - BrickBreaker
 * Orbital demolition breakout with multi-hit bricks, deflection angles, and power capsules.
 */

import { BaseGame } from '../core/BaseGame.js';

export class BrickBreaker extends BaseGame {
  constructor() {
    super('brick-breaker', 'Brick Breaker', 'Arcade');
    this.paddleX = 3;
    this.paddleWidth = 3;
    this.balls = []; // { x, y, dx, dy }
    this.bricks = []; // 20 rows x 10 cols: 0=empty, 1=std, 2=armored(2hp), 3=titanium
    this.capsules = []; // { x, y, type: 'W'|'S' }
    this.laserActive = false;
    this.sector = 1;
    this.maxSectors = 8;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') this.paddleWidth = 4;
    else if (diff === 'HARD') this.paddleWidth = 2;
    else this.paddleWidth = 3;

    this.sector = 1;
    this.initSector();
  }

  initSector() {
    this.paddleX = Math.floor((10 - this.paddleWidth) / 2);
    this.balls = [{ x: 4.5, y: 17, dx: 4, dy: -8 }];
    this.capsules = [];
    this.laserActive = false;

    // Build brick wall in rows 2..5
    this.bricks = Array.from({ length: 20 }, () => new Uint8Array(10));
    for (let r = 2; r <= 5; r++) {
      for (let c = 0; c < 10; c++) {
        if (r === 2) this.bricks[r][c] = 2; // Armored
        else this.bricks[r][c] = 1; // Standard
      }
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // 1. Move Paddle
    if (input.isDown('LEFT') || input.isJustPressed('LEFT')) {
      if (this.paddleX > 0) this.paddleX--;
    } else if (input.isDown('RIGHT') || input.isJustPressed('RIGHT')) {
      if (this.paddleX + this.paddleWidth < 10) this.paddleX++;
    }

    // 2. Update Power Capsules
    for (let i = this.capsules.length - 1; i >= 0; i--) {
      const cap = this.capsules[i];
      cap.y += 5 * deltaTime;

      // Caught by paddle
      if (cap.y >= 18.5 && cap.y <= 19.5 && cap.x >= this.paddleX && cap.x < this.paddleX + this.paddleWidth) {
        sound.playLevelUp();
        this.addScore(100);
        if (cap.type === 'W' && this.paddleWidth < 5) this.paddleWidth++;
        this.capsules.splice(i, 1);
        continue;
      }

      if (cap.y > 20) {
        this.capsules.splice(i, 1);
      }
    }

    // 3. Update Balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      b.x += b.dx * deltaTime;
      b.y += b.dy * deltaTime;

      // Wall ricochet
      if (b.x <= 0) {
        b.x = 0;
        b.dx = Math.abs(b.dx);
        sound.playBounce();
      } else if (b.x >= 9) {
        b.x = 9;
        b.dx = -Math.abs(b.dx);
        sound.playBounce();
      }

      // Ceiling ricochet
      if (b.y <= 0) {
        b.y = 0;
        b.dy = Math.abs(b.dy);
        sound.playBounce();
      }

      // Brick Hit Check
      const bx = Math.round(b.x);
      const by = Math.round(b.y);
      if (by >= 0 && by < 20 && bx >= 0 && bx < 10 && this.bricks[by][bx] > 0) {
        const hp = this.bricks[by][bx];
        if (hp === 1) {
          this.bricks[by][bx] = 0;
          this.addScore(20);
          sound.playExplosion();

          // Chance to drop capsule
          if (Math.random() < 0.2) {
            this.capsules.push({ x: bx, y: by, type: 'W' });
          }
        } else if (hp === 2) {
          this.bricks[by][bx] = 1; // degrade armor
          this.addScore(50);
          sound.playBounce();
        }

        b.dy *= -1; // bounce
        this.checkSectorCleared();
      }

      // Paddle Rebound
      if (b.y >= 18.5 && b.dy > 0) {
        if (b.x >= this.paddleX - 0.5 && b.x <= this.paddleX + this.paddleWidth + 0.5) {
          const hitOffset = (b.x - (this.paddleX + this.paddleWidth / 2)) / (this.paddleWidth / 2);
          b.dx = hitOffset * 6;
          b.dy = -Math.abs(b.dy);
          b.y = 18.5;
          sound.playBounce();
        } else if (b.y > 20) {
          // Ball fell through
          this.balls.splice(i, 1);
        }
      }
    }

    // Ball Loss Check
    if (this.balls.length === 0) {
      sound.playExplosion();
      this.emitLives(this.lives - 1);
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      this.balls.push({ x: 4.5, y: 17, dx: 4, dy: -8 });
    }
  }

  checkSectorCleared() {
    let bricksLeft = 0;
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        if (this.bricks[r][c] > 0) bricksLeft++;
      }
    }

    if (bricksLeft === 0) {
      const sound = this.context.sound;
      sound.playVictory();
      this.addScore(1000 * this.sector);
      this.sector++;
      this.emitLevel(this.sector);

      if (this.sector > this.maxSectors) {
        this.addScore(5000);
        this.gameOver();
        return;
      }

      this.initSector();
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Bricks
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        const val = this.bricks[r][c];
        if (val === 1) {
          renderer.setPixel(c, r, 1);
        } else if (val === 2) {
          renderer.setPixel(c, r, 2); // Armored flashes
        }
      }
    }

    // 2. Draw Falling Capsules
    for (const cap of this.capsules) {
      renderer.setPixel(Math.round(cap.x), Math.round(cap.y), 2);
    }

    // 3. Draw Paddle
    renderer.drawRect(this.paddleX, 19, this.paddleWidth, 1, 1, true);

    // 4. Draw Balls
    for (const b of this.balls) {
      const bx = Math.min(9, Math.max(0, Math.round(b.x)));
      const by = Math.min(19, Math.max(0, Math.round(b.y)));
      renderer.setPixel(bx, by, 1);
    }
  }
}
