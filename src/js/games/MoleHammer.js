/**
 * Retro Brick Game Console - MoleHammer
 * High-reflex conduit strike with hammer reticle, gold bots, and hazard coils.
 */

import { BaseGame } from '../core/BaseGame.js';

export class MoleHammer extends BaseGame {
  constructor() {
    super('mole-hammer', 'Mole Hammer', 'Action');
    this.conduits = []; // 3x3 array of { x, y, state: 'empty'|'bot'|'gold'|'hazard', timer }
    this.reticle = { x: 1, y: 1 };
    this.popTimer = 0;
    this.popInterval = 0.9;
    this.popDuration = 0.8;
    this.roundTime = 45;
    this.timeRemaining = 45;
    this.streak = 0;
    this.sweepCharges = 3;
    this.sector = 1;
    this.maxSectors = 5;
    this.hammerStunTimer = 0;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.popDuration = 1.1;
      this.popInterval = 1.0;
      this.roundTime = 60;
    } else if (diff === 'HARD') {
      this.popDuration = 0.55;
      this.popInterval = 0.6;
      this.roundTime = 30;
    } else {
      this.popDuration = 0.8;
      this.popInterval = 0.85;
      this.roundTime = 45;
    }

    this.sector = 1;
    this.initSector();
  }

  initSector() {
    this.timeRemaining = this.roundTime;
    this.sweepCharges = 3;
    this.streak = 0;
    this.hammerStunTimer = 0;
    this.reticle = { x: 1, y: 1 };

    // Set up 3x3 conduit coordinates centered on the 10x20 screen
    // Columns at x=1, 4, 7 (width 2 each)
    // Rows at y=4, 9, 14 (height 2 each)
    const colCoords = [1, 4, 7];
    const rowCoords = [4, 9, 14];

    this.conduits = [];
    for (let r = 0; r < 3; r++) {
      const rowArr = [];
      for (let c = 0; c < 3; c++) {
        rowArr.push({
          col: c,
          row: r,
          x: colCoords[c],
          y: rowCoords[r],
          type: 'empty',
          timer: 0
        });
      }
      this.conduits.push(rowArr);
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    if (this.hammerStunTimer > 0) {
      this.hammerStunTimer -= deltaTime;
    }

    // Round countdown
    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      sound.playVictory();
      this.addScore(1000);
      this.sector++;
      this.emitLevel(this.sector);

      if (this.sector > this.maxSectors) {
        this.addScore(5000);
        this.gameOver();
        return;
      }

      this.popDuration = Math.max(0.4, this.popDuration * 0.9);
      this.initSector();
      return;
    }

    // Reticle Navigation
    if (input.isJustPressed('LEFT') && this.reticle.x > 0) {
      this.reticle.x--;
      sound.playMove();
    } else if (input.isJustPressed('RIGHT') && this.reticle.x < 2) {
      this.reticle.x++;
      sound.playMove();
    } else if (input.isJustPressed('UP') && this.reticle.y > 0) {
      this.reticle.y--;
      sound.playMove();
    } else if (input.isJustPressed('DOWN') && this.reticle.y < 2) {
      this.reticle.y++;
      sound.playMove();
    }

    // Hammer Strike (Button A)
    if (input.isJustPressed('ACTION_A') && this.hammerStunTimer <= 0) {
      this.strikeConduit(this.reticle.x, this.reticle.y);
    }

    // Sweep Strike (Button B)
    if (input.isJustPressed('ACTION_B') && this.sweepCharges > 0 && this.hammerStunTimer <= 0) {
      this.sweepCharges--;
      sound.playShoot();
      this.strikeConduit(this.reticle.x, this.reticle.y);
      if (this.reticle.x + 1 < 3) {
        this.strikeConduit(this.reticle.x + 1, this.reticle.y);
      } else if (this.reticle.x - 1 >= 0) {
        this.strikeConduit(this.reticle.x - 1, this.reticle.y);
      }
    }

    // Update Conduits
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cond = this.conduits[r][c];
        if (cond.type !== 'empty') {
          cond.timer -= deltaTime;
          if (cond.timer <= 0) {
            cond.type = 'empty';
          }
        }
      }
    }

    // Spawn Rogue Bots
    this.popTimer += deltaTime;
    if (this.popTimer >= this.popInterval) {
      this.popTimer = 0;

      // Pick empty conduit
      const empties = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (this.conduits[r][c].type === 'empty') {
            empties.push(this.conduits[r][c]);
          }
        }
      }

      if (empties.length > 0) {
        const target = empties[Math.floor(Math.random() * empties.length)];
        const roll = Math.random();
        const diff = this.context.difficulty || 'MEDIUM';

        if (diff !== 'EASY' && roll < 0.25) {
          target.type = 'hazard'; // radioactive coil
        } else if (roll > 0.8) {
          target.type = 'gold'; // gold bot
        } else {
          target.type = 'bot'; // standard rogue bot
        }
        target.timer = this.popDuration;
      }
    }
  }

  strikeConduit(col, row) {
    const sound = this.context.sound;
    const cond = this.conduits[row][col];

    if (cond.type === 'bot') {
      cond.type = 'empty';
      this.streak++;
      const pts = Math.round(50 * (1 + this.streak * 0.1));
      this.addScore(pts);
      sound.playScore();
    } else if (cond.type === 'gold') {
      cond.type = 'empty';
      this.streak += 2;
      this.addScore(150);
      sound.playLevelUp();
    } else if (cond.type === 'hazard') {
      cond.type = 'empty';
      this.streak = 0;
      this.hammerStunTimer = 1.5;
      sound.playExplosion();
      this.emitLives(this.lives - 1);
      if (this.lives <= 0) {
        this.gameOver();
      }
    } else {
      // Missed strike
      sound.playBounce();
      this.streak = 0;
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw 3x3 Conduits
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cond = this.conduits[r][c];

        // Draw conduit frame
        renderer.drawRect(cond.x, cond.y, 2, 2, 1, false);

        // Draw emerging bot
        if (cond.type === 'bot') {
          renderer.drawRect(cond.x, cond.y, 2, 2, 1, true);
        } else if (cond.type === 'gold') {
          renderer.drawRect(cond.x, cond.y, 2, 2, 2, true); // Blinking gold
        } else if (cond.type === 'hazard') {
          renderer.setPixel(cond.x, cond.y, 2);
          renderer.setPixel(cond.x + 1, cond.y + 1, 2);
        }
      }
    }

    // 2. Draw Targeting Reticle
    const targetCond = this.conduits[this.reticle.y][this.reticle.x];
    const retState = this.hammerStunTimer > 0 ? 2 : 1;
    renderer.drawRect(targetCond.x - 0.5, targetCond.y - 0.5, 3, 3, retState, false);

    // 3. Draw Round Time Bar (Row 19)
    const timeWidth = Math.ceil((this.timeRemaining / this.roundTime) * 10);
    for (let x = 0; x < timeWidth; x++) {
      renderer.setPixel(x, 19, 1);
    }
  }
}
