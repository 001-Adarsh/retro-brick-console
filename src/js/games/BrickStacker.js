/**
 * Retro Brick Game Console - BrickStacker
 * Precision high-rise tower stacking puzzle with overhang shearing and wind shear.
 */

import { BaseGame } from '../core/BaseGame.js';

export class BrickStacker extends BaseGame {
  constructor() {
    super('brick-stacker', 'Brick Stacker', 'Puzzle');
    this.tower = []; // Array of { startX, width } for each placed row (from y=19 up)
    this.currentRow = 19;
    this.girderX = 0;
    this.girderWidth = 3;
    this.girderDir = 1; // 1 = right, -1 = left
    this.moveTimer = 0;
    this.moveInterval = 0.16; // speed
    this.brakeActive = false;
    this.brakeTimer = 0;
    this.brakeCharges = 3;
    this.perfectStreak = 0;
    this.stage = 1;
    this.windShearTimer = 0;
    this.shearedParts = []; // animated falling debris { x, y, width, life }
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.girderWidth = 4;
      this.moveInterval = 0.22;
      this.brakeCharges = 4;
    } else if (diff === 'HARD') {
      this.girderWidth = 3;
      this.moveInterval = 0.12;
      this.brakeCharges = 2;
    } else {
      this.girderWidth = 3;
      this.moveInterval = 0.16;
      this.brakeCharges = 3;
    }

    this.initialGirderWidth = this.girderWidth;
    this.resetStage();
  }

  resetStage() {
    this.tower = [];
    this.currentRow = 19;
    this.girderX = Math.floor((10 - this.girderWidth) / 2);
    this.girderDir = 1;
    this.moveTimer = 0;
    this.brakeActive = false;
    this.brakeTimer = 0;
    this.perfectStreak = 0;
    this.shearedParts = [];
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // Handle Precision Brake (Button B)
    if (this.brakeActive) {
      this.brakeTimer -= deltaTime;
      if (this.brakeTimer <= 0) {
        this.brakeActive = false;
      }
    } else if (input.isJustPressed('ACTION_B') && this.brakeCharges > 0) {
      this.brakeCharges--;
      this.brakeActive = true;
      this.brakeTimer = 1.0;
      sound.playTone(520, 0.08, 'triangle');
    }

    // Check Drop Input (Button A or Down)
    if (input.isJustPressed('ACTION_A') || input.isJustPressed('DOWN')) {
      this.lockGirder();
      return;
    }

    // Check Manual Steer / Nudge (Left / Right)
    if (input.isJustPressed('LEFT')) {
      if (this.girderX > 0) {
        this.girderX--;
        this.girderDir = -1;
        this.moveTimer = 0;
        sound.playMove();
      }
    } else if (input.isJustPressed('RIGHT')) {
      if (this.girderX + this.girderWidth < 10) {
        this.girderX++;
        this.girderDir = 1;
        this.moveTimer = 0;
        sound.playMove();
      }
    }

    // Update Sheared Debris Animation
    for (let i = this.shearedParts.length - 1; i >= 0; i--) {
      const p = this.shearedParts[i];
      p.y += deltaTime * 8;
      p.life -= deltaTime;
      if (p.life <= 0 || p.y > 20) {
        this.shearedParts.splice(i, 1);
      }
    }

    // Advance Girder Movement
    const currentSpeed = this.brakeActive ? this.moveInterval * 1.6 : this.moveInterval;
    this.moveTimer += deltaTime;

    // Wind Shear effect
    const diff = this.context.difficulty;
    const hasWind = (diff === 'HARD' && this.currentRow <= 16) || (diff === 'MEDIUM' && this.currentRow <= 10);
    if (hasWind) {
      this.windShearTimer += deltaTime;
      if (this.windShearTimer > 1.2) {
        this.windShearTimer = 0;
        if (Math.random() < 0.35) {
          this.girderDir *= -1;
        }
      }
    }

    if (this.moveTimer >= currentSpeed) {
      this.moveTimer = 0;
      this.girderX += this.girderDir;

      // Bounce at boundaries
      if (this.girderX + this.girderWidth >= 10) {
        this.girderX = 10 - this.girderWidth;
        this.girderDir = -1;
        sound.playMove();
      } else if (this.girderX <= 0) {
        this.girderX = 0;
        this.girderDir = 1;
        sound.playMove();
      }
    }
  }

  lockGirder() {
    const sound = this.context.sound;
    const floorIndex = 20 - this.currentRow;

    if (this.currentRow === 19) {
      // First base floor
      this.tower[19] = { startX: this.girderX, width: this.girderWidth };
      this.addScore(10 * floorIndex);
      sound.playDrop();
      this.currentRow--;
      this.checkFloorAdvancement();
      return;
    }

    const base = this.tower[this.currentRow + 1];
    const baseStart = base.startX;
    const baseEnd = base.startX + base.width;

    const girderStart = this.girderX;
    const girderEnd = this.girderX + this.girderWidth;

    const overlapStart = Math.max(girderStart, baseStart);
    const overlapEnd = Math.min(girderEnd, baseEnd);
    const overlapWidth = overlapEnd - overlapStart;

    if (overlapWidth <= 0) {
      // Complete Miss -> Stack topples, lose life
      sound.playExplosion();
      this.emitLives(this.lives - 1);
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      // Re-try current floor with current width
      this.girderX = Math.floor((10 - this.girderWidth) / 2);
      this.perfectStreak = 0;
      return;
    }

    // Check Perfect Alignment
    if (girderStart === baseStart && this.girderWidth === base.width) {
      this.perfectStreak++;
      this.addScore(50 + 10 * floorIndex);
      sound.playScore();

      // Bonus width restore on 3 consecutive perfect drops
      if (this.perfectStreak >= 3 && this.girderWidth < this.initialGirderWidth) {
        this.girderWidth++;
        this.perfectStreak = 0;
        sound.playLevelUp();
      }
    } else {
      // Sheared overhang
      this.perfectStreak = 0;
      const shearedW = this.girderWidth - overlapWidth;
      const shearX = girderStart < baseStart ? girderStart : overlapEnd;
      this.shearedParts.push({
        x: shearX,
        y: this.currentRow,
        width: shearedW,
        life: 0.6
      });

      this.girderWidth = overlapWidth;
      this.addScore(10 * floorIndex);
      sound.playDrop();
    }

    // Lock floor
    this.tower[this.currentRow] = { startX: overlapStart, width: overlapWidth };
    this.currentRow--;

    // Grant brake charge every 3 floors
    if (floorIndex % 3 === 0 && this.brakeCharges < 4) {
      this.brakeCharges++;
    }

    this.checkFloorAdvancement();
  }

  checkFloorAdvancement() {
    if (this.currentRow < 0) {
      // Skyscraper Stage Cleared!
      const sound = this.context.sound;
      sound.playVictory();
      this.addScore(1000);
      this.stage++;
      this.emitLevel(this.stage);

      if (this.stage > 5) {
        // Complete Game Win
        this.addScore(5000);
        this.gameOver();
        return;
      }

      // Accelerate oscillation for next stage
      this.moveInterval = Math.max(0.06, this.moveInterval * 0.88);
      this.resetStage();
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // Render placed tower floors
    for (let r = 19; r > this.currentRow; r--) {
      const floor = this.tower[r];
      if (floor) {
        renderer.drawRect(floor.startX, r, floor.width, 1, 1, true);
      }
    }

    // Render active oscillating girder
    if (this.currentRow >= 0 && !this.isOver) {
      const girderState = this.brakeActive ? 2 : 1;
      renderer.drawRect(this.girderX, this.currentRow, this.girderWidth, 1, girderState, true);
    }

    // Render sheared falling parts
    for (const part of this.shearedParts) {
      const py = Math.floor(part.y);
      if (py >= 0 && py < 20) {
        renderer.drawRect(part.x, py, part.width, 1, 2, true);
      }
    }
  }
}
