/**
 * Retro Brick Game Console - IronTanks
 * Tactical grid tank combat defending the Power Core with destructible terrain.
 */

import { BaseGame } from '../core/BaseGame.js';

export class IronTanks extends BaseGame {
  constructor() {
    super('iron-tanks', 'Iron Tanks', 'Action');
    this.player = { x: 4, y: 16, dir: 'UP' }; // dir: 'UP', 'DOWN', 'LEFT', 'RIGHT'
    this.coreHealth = 3;
    this.coreMaxHealth = 3;
    this.coreUndamaged = true;
    this.wave = 1;
    this.maxWaves = 10;
    this.enemiesRemaining = 5;
    this.enemies = []; // { x, y, dir, type, hp, moveTimer, shootTimer }
    this.playerBullets = []; // { x, y, dx, dy }
    this.enemyBullets = []; // { x, y, dx, dy }
    this.walls = []; // 10x20 map: 0 = empty, 1 = brick (destructible), 2 = steel
    this.spawnTimer = 0;
    this.decoyCooldown = 0;
    this.invulnerableTimer = 0;
  }

  init(context) {
    super.init(context);
    this.wave = 1;
    this.coreHealth = 3;
    this.initWave();
  }

  initWave() {
    this.coreUndamaged = true;
    this.player = { x: 4, y: 16, dir: 'UP' };
    this.playerBullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.invulnerableTimer = 0;

    const diff = this.context.difficulty || 'MEDIUM';
    if (diff === 'EASY') this.enemiesRemaining = 3 + this.wave;
    else if (diff === 'HARD') this.enemiesRemaining = 5 + this.wave * 2;
    else this.enemiesRemaining = 4 + this.wave;

    this.spawnTimer = 0;

    // Generate arena walls
    this.walls = Array.from({ length: 20 }, () => new Uint8Array(10));

    // Power Core surround barrier (bricks around row 19 cols 4-5)
    this.walls[18][3] = 1;
    this.walls[18][4] = 1;
    this.walls[18][5] = 1;
    this.walls[18][6] = 1;
    this.walls[19][3] = 1;
    this.walls[19][6] = 1;

    // Scatter tactical obstacles
    const midRows = [4, 7, 10, 13];
    for (const r of midRows) {
      this.walls[r][2] = 1;
      this.walls[r][3] = 1;
      this.walls[r][6] = 1;
      this.walls[r][7] = 1;
      if (r === 7 || r === 10) {
        this.walls[r][0] = 2; // steel
        this.walls[r][9] = 2; // steel
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
    if (this.decoyCooldown > 0) {
      this.decoyCooldown -= deltaTime;
    }

    // 1. Player Direction & Movement
    let moved = false;
    let targetX = this.player.x;
    let targetY = this.player.y;

    if (input.isJustPressed('UP')) {
      this.player.dir = 'UP';
      targetY--;
      moved = true;
    } else if (input.isJustPressed('DOWN')) {
      this.player.dir = 'DOWN';
      targetY++;
      moved = true;
    } else if (input.isJustPressed('LEFT')) {
      this.player.dir = 'LEFT';
      targetX--;
      moved = true;
    } else if (input.isJustPressed('RIGHT')) {
      this.player.dir = 'RIGHT';
      targetX++;
      moved = true;
    }

    if (moved) {
      // Validate collision (player is 2x2 bounding box)
      if (this.canMoveTank(targetX, targetY)) {
        this.player.x = targetX;
        this.player.y = targetY;
        sound.playMove();
      }
    }

    // 2. Fire Cannon (Button A)
    if (input.isJustPressed('ACTION_A') && this.playerBullets.length < 2) {
      let bx = this.player.x;
      let by = this.player.y;
      let dx = 0;
      let dy = 0;

      if (this.player.dir === 'UP') {
        bx += 0.5;
        by -= 1;
        dy = -12;
      } else if (this.player.dir === 'DOWN') {
        bx += 0.5;
        by += 2;
        dy = 12;
      } else if (this.player.dir === 'LEFT') {
        bx -= 1;
        by += 0.5;
        dx = -12;
      } else if (this.player.dir === 'RIGHT') {
        bx += 2;
        by += 0.5;
        dx = 12;
      }

      this.playerBullets.push({ x: bx, y: by, dx, dy });
      sound.playShoot();
    }

    // 3. Deploy Decoy Barrier (Button B)
    if (input.isJustPressed('ACTION_B') && this.decoyCooldown <= 0) {
      this.decoyCooldown = 10.0;
      const bx = Math.min(8, Math.max(0, this.player.x));
      const by = Math.min(18, Math.max(0, this.player.y + (this.player.dir === 'UP' ? 2 : -1)));
      this.walls[by][bx] = 1;
      this.walls[by][bx + 1] = 1;
      sound.playTone(400, 0.1, 'sawtooth');
    }

    // 4. Spawn Enemies
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= 2.5 && this.enemiesRemaining > 0 && this.enemies.length < 3) {
      this.spawnTimer = 0;
      this.enemiesRemaining--;
      const spawnX = Math.random() < 0.5 ? 0 : 8;
      const typeRoll = Math.random();
      let type = 'scout';
      let hp = 1;

      if (this.wave >= 2 && typeRoll > 0.6) {
        type = 'cruiser';
        hp = 2;
      }
      if (this.wave >= 3 && typeRoll > 0.85) {
        type = 'juggernaut';
        hp = 3;
      }

      this.enemies.push({
        x: spawnX,
        y: 0,
        dir: 'DOWN',
        type,
        hp,
        moveTimer: 0,
        moveInterval: type === 'scout' ? 0.35 : (type === 'cruiser' ? 0.5 : 0.7),
        shootTimer: 0
      });
    }

    // 5. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.moveTimer += deltaTime;
      e.shootTimer += deltaTime;

      if (e.moveTimer >= e.moveInterval) {
        e.moveTimer = 0;
        // Simple AI: Move toward Power Core at (4..5, 19)
        const dirs = [];
        if (e.y < 17) dirs.push('DOWN', 'DOWN'); // heavily favor down
        if (e.x < 4) dirs.push('RIGHT');
        else if (e.x > 5) dirs.push('LEFT');
        else dirs.push(Math.random() < 0.5 ? 'LEFT' : 'RIGHT');

        const chosenDir = dirs[Math.floor(Math.random() * dirs.length)];
        e.dir = chosenDir;

        let nx = e.x;
        let ny = e.y;
        if (chosenDir === 'DOWN') ny++;
        else if (chosenDir === 'UP') ny--;
        else if (chosenDir === 'LEFT') nx--;
        else if (chosenDir === 'RIGHT') nx++;

        if (this.canMoveTank(nx, ny, e)) {
          e.x = nx;
          e.y = ny;
        }
      }

      // Enemy shoot
      if (e.shootTimer >= 1.8 && this.enemyBullets.length < 3) {
        e.shootTimer = 0;
        let bx = e.x + 0.5;
        let by = e.y + 2;
        this.enemyBullets.push({ x: bx, y: by, dx: 0, dy: 8 });
      }
    }

    // 6. Update Bullets
    this.updateBullets(this.playerBullets, true, deltaTime);
    this.updateBullets(this.enemyBullets, false, deltaTime);

    // 7. Check Wave Cleared
    if (this.enemiesRemaining === 0 && this.enemies.length === 0) {
      sound.playVictory();
      this.addScore(500 * this.wave);
      if (this.coreUndamaged) {
        this.addScore(300);
      }
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

  canMoveTank(x, y, excludeTank = null) {
    if (x < 0 || x > 8 || y < 0 || y > 18) return false;
    // Core collision check (4..5, 19)
    if (y + 1 >= 19 && (x <= 5 && x + 1 >= 4)) return false;

    // Wall collision check (tank is 2x2)
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        if (this.walls[y + r][x + c] > 0) return false;
      }
    }

    return true;
  }

  updateBullets(bullets, isPlayer, dt) {
    const sound = this.context.sound;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.dx * dt;
      b.y += b.dy * dt;

      const gridX = Math.floor(b.x);
      const gridY = Math.floor(b.y);

      // Boundary check
      if (gridX < 0 || gridX >= 10 || gridY < 0 || gridY >= 20) {
        bullets.splice(i, 1);
        continue;
      }

      // Wall hit check
      if (this.walls[gridY][gridX] > 0) {
        if (this.walls[gridY][gridX] === 1) {
          // Destructible brick shattered
          this.walls[gridY][gridX] = 0;
          sound.playBounce();
        } else {
          // Steel ricochet
          sound.playTone(600, 0.05, 'sawtooth');
        }
        bullets.splice(i, 1);
        continue;
      }

      // Core hit check
      if (gridY >= 19 && (gridX === 4 || gridX === 5)) {
        this.coreHealth--;
        this.coreUndamaged = false;
        sound.playExplosion();
        bullets.splice(i, 1);

        if (this.coreHealth <= 0) {
          this.gameOver();
          return;
        }
        continue;
      }

      if (isPlayer) {
        // Check hits on enemies
        let hitEnemy = false;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (gridX >= e.x && gridX <= e.x + 1 && gridY >= e.y && gridY <= e.y + 1) {
            e.hp--;
            hitEnemy = true;
            if (e.hp <= 0) {
              sound.playExplosion();
              const pts = e.type === 'scout' ? 50 : (e.type === 'cruiser' ? 100 : 250);
              this.addScore(pts);
              this.enemies.splice(j, 1);
            } else {
              sound.playBounce();
            }
            break;
          }
        }
        if (hitEnemy) {
          bullets.splice(i, 1);
          continue;
        }
      } else {
        // Enemy bullet hitting player
        if (this.invulnerableTimer <= 0) {
          if (gridX >= this.player.x && gridX <= this.player.x + 1 &&
              gridY >= this.player.y && gridY <= this.player.y + 1) {
            sound.playExplosion();
            this.emitLives(this.lives - 1);
            this.invulnerableTimer = 2.0;
            bullets.splice(i, 1);

            if (this.lives <= 0) {
              this.gameOver();
              return;
            }
            continue;
          }
        }
      }
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Walls
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        if (this.walls[r][c] === 1) {
          renderer.setPixel(c, r, 1);
        } else if (this.walls[r][c] === 2) {
          renderer.setPixel(c, r, 2); // Steel barrier
        }
      }
    }

    // 2. Draw Power Core (x=4..5, y=19)
    const coreState = this.coreHealth < this.coreMaxHealth ? 2 : 1;
    renderer.setPixel(4, 19, coreState);
    renderer.setPixel(5, 19, coreState);

    // 3. Draw Player Tank (2x2 base + 1 turret pixel)
    const px = this.player.x;
    const py = this.player.y;
    const pState = this.invulnerableTimer > 0 ? 2 : 1;

    renderer.drawRect(px, py, 2, 2, pState, true);
    if (this.player.dir === 'UP' && py > 0) renderer.setPixel(px, py - 1, pState);
    else if (this.player.dir === 'DOWN' && py < 18) renderer.setPixel(px, py + 2, pState);
    else if (this.player.dir === 'LEFT' && px > 0) renderer.setPixel(px - 1, py, pState);
    else if (this.player.dir === 'RIGHT' && px < 8) renderer.setPixel(px + 2, py, pState);

    // 4. Draw Enemies
    for (const e of this.enemies) {
      const eState = e.hp > 1 ? 2 : 1;
      renderer.drawRect(e.x, e.y, 2, 2, eState, true);
      // Direction indicator
      if (e.dir === 'DOWN' && e.y < 18) renderer.setPixel(e.x, e.y + 2, 1);
      else if (e.dir === 'UP' && e.y > 0) renderer.setPixel(e.x, e.y - 1, 1);
      else if (e.dir === 'LEFT' && e.x > 0) renderer.setPixel(e.x - 1, e.y, 1);
      else if (e.dir === 'RIGHT' && e.x < 8) renderer.setPixel(e.x + 2, e.y, 1);
    }

    // 5. Draw Bullets
    for (const b of this.playerBullets) {
      renderer.setPixel(Math.floor(b.x), Math.floor(b.y), 1);
    }
    for (const b of this.enemyBullets) {
      renderer.setPixel(Math.floor(b.x), Math.floor(b.y), 2);
    }
  }
}
