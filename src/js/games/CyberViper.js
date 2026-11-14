/**
 * Retro Brick Game Console - CyberViper
 * Circuit board serpent with turbo sprint, overcharge chips, and ghost phase.
 */

import { BaseGame } from '../core/BaseGame.js';

export class CyberViper extends BaseGame {
  constructor() {
    super('cyber-viper', 'Cyber Viper', 'Arcade');
    this.body = []; // array of { x, y }
    this.dir = { x: 0, y: 1 }; // current moving direction
    this.nextDir = { x: 0, y: 1 };
    this.moveTimer = 0;
    this.moveInterval = 0.2; // base step interval
    this.chip = { x: 5, y: 10 };
    this.overchargeChip = null; // { x, y, timer }
    this.ghostPhaseTimer = 0;
    this.isSprinting = false;
    this.glitches = []; // array of { x, y }
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.moveInterval = 0.28;
    } else if (diff === 'HARD') {
      this.moveInterval = 0.14;
    } else {
      this.moveInterval = 0.2;
    }

    // Initial 4 segments
    this.body = [
      { x: 5, y: 6 },
      { x: 5, y: 5 },
      { x: 5, y: 4 },
      { x: 5, y: 3 }
    ];
    this.dir = { x: 0, y: 1 };
    this.nextDir = { x: 0, y: 1 };
    this.moveTimer = 0;
    this.overchargeChip = null;
    this.ghostPhaseTimer = 0;
    this.isSprinting = false;

    // Spawn glitches on Hard
    this.glitches = [];
    if (diff === 'HARD') {
      this.glitches.push({ x: 2, y: 12 }, { x: 7, y: 8 });
    }

    this.spawnChip();
  }

  spawnChip() {
    let attempts = 0;
    let found = false;
    while (attempts < 100 && !found) {
      attempts++;
      const cx = Math.floor(Math.random() * 10);
      const cy = Math.floor(Math.random() * 20);

      const inBody = this.body.some(seg => seg.x === cx && seg.y === cy);
      const inGlitch = this.glitches.some(g => g.x === cx && g.y === cy);
      if (!inBody && !inGlitch) {
        this.chip = { x: cx, y: cy };
        found = true;
      }
    }

    // 25% chance to spawn an Overcharge chip if none exists
    if (!this.overchargeChip && Math.random() < 0.25) {
      let ocAttempts = 0;
      while (ocAttempts < 50) {
        ocAttempts++;
        const ox = Math.floor(Math.random() * 10);
        const oy = Math.floor(Math.random() * 20);
        const inBody = this.body.some(seg => seg.x === ox && seg.y === oy);
        if (!inBody && (ox !== this.chip.x || oy !== this.chip.y)) {
          this.overchargeChip = { x: ox, y: oy, timer: 8.0 };
          break;
        }
      }
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    if (this.ghostPhaseTimer > 0) {
      this.ghostPhaseTimer -= deltaTime;
    }

    if (this.overchargeChip) {
      this.overchargeChip.timer -= deltaTime;
      if (this.overchargeChip.timer <= 0) {
        this.overchargeChip = null;
      }
    }

    // Steering (disallowing immediate 180-degree turn)
    if (input.isJustPressed('UP') && this.dir.y === 0) {
      this.nextDir = { x: 0, y: -1 };
    } else if (input.isJustPressed('DOWN') && this.dir.y === 0) {
      this.nextDir = { x: 0, y: 1 };
    } else if (input.isJustPressed('LEFT') && this.dir.x === 0) {
      this.nextDir = { x: -1, y: 0 };
    } else if (input.isJustPressed('RIGHT') && this.dir.x === 0) {
      this.nextDir = { x: 1, y: 0 };
    }

    // Turbo Sprint (Button A)
    this.isSprinting = input.isDown('ACTION_A');

    // Sonar Pulse (Button B)
    if (input.isJustPressed('ACTION_B')) {
      sound.playTone(800, 0.08, 'triangle');
    }

    let currentInterval = this.isSprinting ? this.moveInterval * 0.5 : this.moveInterval;
    this.moveTimer += deltaTime;

    if (this.moveTimer >= currentInterval) {
      this.moveTimer = 0;
      this.step();
    }
  }

  step() {
    const sound = this.context.sound;
    this.dir = { ...this.nextDir };

    const head = this.body[0];
    let nx = head.x + this.dir.x;
    let ny = head.y + this.dir.y;

    const wrapMode = this.context.difficulty === 'EASY';

    if (wrapMode) {
      if (nx < 0) nx = 9;
      else if (nx > 9) nx = 0;
      if (ny < 0) ny = 19;
      else if (ny > 19) ny = 0;
    } else {
      // Wall collision in Medium / Hard
      if (nx < 0 || nx > 9 || ny < 0 || ny > 19) {
        if (this.ghostPhaseTimer <= 0) {
          sound.playExplosion();
          this.emitLives(this.lives - 1);
          if (this.lives <= 0) {
            this.gameOver();
            return;
          }
          // Reset viper position
          this.resetViperPosition();
          return;
        } else {
          // Ghost phase wraps borders
          if (nx < 0) nx = 9;
          else if (nx > 9) nx = 0;
          if (ny < 0) ny = 19;
          else if (ny > 19) ny = 0;
        }
      }
    }

    // Glitch collision
    for (const g of this.glitches) {
      if (nx === g.x && ny === g.y && this.ghostPhaseTimer <= 0) {
        sound.playExplosion();
        this.emitLives(this.lives - 1);
        if (this.lives <= 0) {
          this.gameOver();
          return;
        }
        this.resetViperPosition();
        return;
      }
    }

    // Self collision
    if (this.ghostPhaseTimer <= 0) {
      for (let i = 0; i < this.body.length - 1; i++) {
        if (this.body[i].x === nx && this.body[i].y === ny) {
          sound.playExplosion();
          this.emitLives(this.lives - 1);
          if (this.lives <= 0) {
            this.gameOver();
            return;
          }
          this.resetViperPosition();
          return;
        }
      }
    }

    // Move head forward
    const newHead = { x: nx, y: ny };
    this.body.unshift(newHead);

    // Check Chip Eating
    let ateChip = false;
    if (nx === this.chip.x && ny === this.chip.y) {
      ateChip = true;
      sound.playScore();
      const pts = 10 * this.body.length * this.level + (this.isSprinting ? 30 : 0);
      this.addScore(pts);
      this.spawnChip();

      // Speed up slightly every 5 chips
      if (this.body.length % 5 === 0) {
        this.moveInterval = Math.max(0.08, this.moveInterval * 0.94);
        this.emitLevel(this.level + 1);
      }

      // Win check at 100 segments
      if (this.body.length >= 100) {
        sound.playVictory();
        this.addScore(10000);
        this.gameOver();
        return;
      }
    }

    // Check Overcharge Chip
    if (this.overchargeChip && nx === this.overchargeChip.x && ny === this.overchargeChip.y) {
      sound.playLevelUp();
      this.addScore(50 * this.level);
      this.ghostPhaseTimer = 3.5; // Ghost Phase active
      this.overchargeChip = null;
    }

    // If no chip was eaten, pop tail segment
    if (!ateChip) {
      this.body.pop();
    }
  }

  resetViperPosition() {
    this.body = [
      { x: 5, y: 6 },
      { x: 5, y: 5 },
      { x: 5, y: 4 },
      { x: 5, y: 3 }
    ];
    this.dir = { x: 0, y: 1 };
    this.nextDir = { x: 0, y: 1 };
    this.ghostPhaseTimer = 1.5;
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // Draw Chip
    renderer.setPixel(this.chip.x, this.chip.y, 1);

    // Draw Overcharge Chip (Blinking)
    if (this.overchargeChip) {
      renderer.setPixel(this.overchargeChip.x, this.overchargeChip.y, 2);
    }

    // Draw Glitch Obstacles
    for (const g of this.glitches) {
      renderer.setPixel(g.x, g.y, 2);
    }

    // Draw Viper Body
    const isGhost = this.ghostPhaseTimer > 0;
    for (let i = 1; i < this.body.length; i++) {
      const seg = this.body[i];
      renderer.setPixel(seg.x, seg.y, isGhost ? 2 : 1);
    }

    // Draw Viper Head (Blinking)
    if (this.body.length > 0) {
      const head = this.body[0];
      renderer.setPixel(head.x, head.y, 2);
    }
  }
}
