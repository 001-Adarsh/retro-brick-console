/**
 * Retro Brick Game Console - CosmoDefender
 * Vertical space combat shooter with alien formations, dive-bombers, and EMP shockwaves.
 */

import { BaseGame } from '../core/BaseGame.js';

export class CosmoDefender extends BaseGame {
  constructor() {
    super('cosmo-defender', 'Cosmo Defender', 'Shooter');
    this.playerX = 3;
    this.playerY = 18;
    this.playerLasers = []; // { x, y }
    this.aliens = []; // { x, y, alive, inFormation, diveDx, diveDy }
    this.alienBullets = []; // { x, y }
    this.swarmDir = 1;
    this.swarmStepTimer = 0;
    this.swarmStepInterval = 0.6;
    this.diveTimer = 0;
    this.empCharges = 2;
    this.invulnerableTimer = 0;
    this.wave = 1;
    this.maxWaves = 8;
  }

  init(context) {
    super.init(context);
    this.wave = 1;
    this.empCharges = 2;
    this.initWave();
  }

  initWave() {
    this.playerX = 3;
    this.playerY = 18;
    this.playerLasers = [];
    this.alienBullets = [];
    this.invulnerableTimer = 0;
    this.swarmDir = 1;

    const diff = this.context.difficulty || 'MEDIUM';
    if (diff === 'EASY') this.swarmStepInterval = 0.75;
    else if (diff === 'HARD') this.swarmStepInterval = 0.4;
    else this.swarmStepInterval = 0.55;

    // Spawn 2 rows of 4 aliens in formation (cols 1, 3, 5, 7, rows 2, 4)
    this.aliens = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        this.aliens.push({
          x: 1 + c * 2,
          y: 2 + r * 2,
          alive: true,
          isCommander: r === 0 && (c === 1 || c === 2),
          inFormation: true,
          diveDx: 0,
          diveDy: 0
        });
      }
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= deltaTime;
    }

    // 1. Player Navigation
    if (input.isJustPressed('LEFT') || input.checkAutoRepeat('LEFT', 180, 80)) {
      if (this.playerX > 0) this.playerX--;
    } else if (input.isJustPressed('RIGHT') || input.checkAutoRepeat('RIGHT', 180, 80)) {
      if (this.playerX < 7) this.playerX++;
    }

    if (input.isJustPressed('UP') && this.playerY > 16) {
      this.playerY--;
    } else if (input.isJustPressed('DOWN') && this.playerY < 18) {
      this.playerY++;
    }

    // 2. Fire Primary Blasters (Button A)
    if (input.isJustPressed('ACTION_A') && this.playerLasers.length < 3) {
      this.playerLasers.push({ x: this.playerX + 1, y: this.playerY - 1 });
      sound.playShoot();
    }

    // 3. EMP Shockwave (Button B)
    if (input.isJustPressed('ACTION_B') && this.empCharges > 0) {
      this.empCharges--;
      this.alienBullets = []; // vaporize all bullets
      sound.playTone(300, 0.25, 'sawtooth');
      this.addScore(50);
    }

    // 4. Update Player Lasers
    for (let i = this.playerLasers.length - 1; i >= 0; i--) {
      const laser = this.playerLasers[i];
      laser.y -= 16 * deltaTime;

      if (laser.y < 0) {
        this.playerLasers.splice(i, 1);
        continue;
      }

      // Check hit on aliens
      const lx = Math.round(laser.x);
      const ly = Math.round(laser.y);
      let hit = false;

      for (const a of this.aliens) {
        if (a.alive && Math.abs(a.x - lx) <= 1 && Math.abs(a.y - ly) <= 1) {
          a.alive = false;
          hit = true;
          sound.playExplosion();
          const pts = a.isCommander ? 150 : (a.inFormation ? 20 : 50);
          this.addScore(pts);
          break;
        }
      }

      if (hit) {
        this.playerLasers.splice(i, 1);
      }
    }

    // 5. Update Swarm Formation Step
    this.swarmStepTimer += deltaTime;
    if (this.swarmStepTimer >= this.swarmStepInterval) {
      this.swarmStepTimer = 0;

      // Find boundaries of living formation aliens
      let minX = 10, maxX = 0;
      let livingCount = 0;
      for (const a of this.aliens) {
        if (a.alive && a.inFormation) {
          livingCount++;
          if (a.x < minX) minX = a.x;
          if (a.x > maxX) maxX = a.x;
        }
      }

      if (livingCount > 0) {
        let stepDown = false;
        if ((this.swarmDir === 1 && maxX >= 8) || (this.swarmDir === -1 && minX <= 1)) {
          this.swarmDir *= -1;
          stepDown = true;
        }

        for (const a of this.aliens) {
          if (a.alive && a.inFormation) {
            if (stepDown) {
              a.y++;
              if (a.y >= 16) {
                // Swarm breached base!
                this.gameOver();
                return;
              }
            } else {
              a.x += this.swarmDir;
            }
          }
        }
      }
    }

    // 6. Dive-Bombers & Alien Fire
    this.diveTimer += deltaTime;
    if (this.diveTimer >= 2.0) {
      this.diveTimer = 0;
      // Pick random formation alien to dive
      const candidates = this.aliens.filter(a => a.alive && a.inFormation);
      if (candidates.length > 0) {
        const diver = candidates[Math.floor(Math.random() * candidates.length)];
        diver.inFormation = false;
        diver.diveDx = diver.x < this.playerX ? 1 : -1;
        diver.diveDy = 6;
      }

      // Alien fires bullet
      if (this.alienBullets.length < 3 && candidates.length > 0) {
        const shooter = candidates[Math.floor(Math.random() * candidates.length)];
        this.alienBullets.push({ x: shooter.x, y: shooter.y + 1 });
      }
    }

    // Update diving aliens
    for (const a of this.aliens) {
      if (a.alive && !a.inFormation) {
        a.y += a.diveDy * deltaTime;
        a.x += a.diveDx * deltaTime * 1.5;

        // Reset if passed bottom
        if (a.y > 20) {
          a.y = 1;
          a.x = Math.floor(Math.random() * 8) + 1;
          a.inFormation = true;
        }

        // Check crash with player
        if (this.invulnerableTimer <= 0) {
          if (Math.abs(a.x - (this.playerX + 1)) <= 1.2 && Math.abs(a.y - this.playerY) <= 1.2) {
            sound.playExplosion();
            this.emitLives(this.lives - 1);
            this.invulnerableTimer = 2.0;
            a.alive = false;
            if (this.lives <= 0) {
              this.gameOver();
              return;
            }
          }
        }
      }
    }

    // 7. Update Alien Bullets
    for (let i = this.alienBullets.length - 1; i >= 0; i--) {
      const b = this.alienBullets[i];
      b.y += 8 * deltaTime;

      if (b.y > 20) {
        this.alienBullets.splice(i, 1);
        continue;
      }

      if (this.invulnerableTimer <= 0) {
        if (Math.abs(b.x - (this.playerX + 1)) <= 1.0 && Math.abs(b.y - this.playerY) <= 1.0) {
          sound.playExplosion();
          this.emitLives(this.lives - 1);
          this.invulnerableTimer = 2.0;
          this.alienBullets.splice(i, 1);
          if (this.lives <= 0) {
            this.gameOver();
            return;
          }
        }
      }
    }

    // 8. Wave Clear Check
    const remaining = this.aliens.filter(a => a.alive).length;
    if (remaining === 0) {
      sound.playVictory();
      this.addScore(500 * this.wave);
      this.wave++;
      this.emitLevel(this.wave);

      if (this.wave > this.maxWaves) {
        this.addScore(5000);
        this.gameOver();
        return;
      }

      this.initWave();
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Living Aliens
    for (const a of this.aliens) {
      if (a.alive) {
        const ax = Math.round(a.x);
        const ay = Math.round(a.y);
        const aState = a.inFormation ? 1 : 2;
        renderer.setPixel(ax, ay, aState);
        renderer.setPixel(ax + 1, ay, aState);
      }
    }

    // 2. Draw Player Cruiser (3x2 delta wing)
    const px = this.playerX;
    const py = this.playerY;
    const pState = this.invulnerableTimer > 0 ? 2 : 1;

    // Delta wing: row py has center tip, row py+1 has wings
    renderer.setPixel(px + 1, py, pState);
    renderer.setPixel(px, py + 1, pState);
    renderer.setPixel(px + 1, py + 1, pState);
    renderer.setPixel(px + 2, py + 1, pState);

    // 3. Draw Lasers
    for (const l of this.playerLasers) {
      renderer.setPixel(Math.round(l.x), Math.round(l.y), 1);
    }

    // 4. Draw Alien Bullets
    for (const b of this.alienBullets) {
      renderer.setPixel(Math.round(b.x), Math.round(b.y), 2);
    }
  }
}
