/**
 * Retro Brick Game Console - OrbPop
 * Molecular cluster cannon with ricochet aiming, trio popping, and avalanches.
 */

import { BaseGame } from '../core/BaseGame.js';

export class OrbPop extends BaseGame {
  constructor() {
    super('orb-pop', 'Orb Pop', 'Puzzle');
    this.grid = []; // 20 rows x 10 cols of orb types (0 = empty, 1, 2)
    this.cannonAngle = 0; // -3 to +3
    this.currentOrb = 1;
    this.reserveOrb = 2;
    this.flyingOrb = null; // { x, y, dx, dy, type }
    this.shotCount = 0;
  }

  init(context) {
    super.init(context);
    this.cannonAngle = 0;
    this.currentOrb = 1;
    this.reserveOrb = 2;
    this.flyingOrb = null;
    this.shotCount = 0;

    // Build initial ceiling clusters in rows 0..3
    this.grid = Array.from({ length: 20 }, () => new Uint8Array(10));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 10; c++) {
        this.grid[r][c] = (c + r) % 2 === 0 ? 1 : 2;
      }
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // Cannon Aiming
    if (!this.flyingOrb) {
      if (input.isJustPressed('LEFT') && this.cannonAngle > -3) {
        this.cannonAngle--;
        sound.playMove();
      } else if (input.isJustPressed('RIGHT') && this.cannonAngle < 3) {
        this.cannonAngle++;
        sound.playMove();
      }

      // Swap Orb (Button B)
      if (input.isJustPressed('ACTION_B')) {
        const temp = this.currentOrb;
        this.currentOrb = this.reserveOrb;
        this.reserveOrb = temp;
        sound.playRotate();
      }

      // Launch Orb (Button A)
      if (input.isJustPressed('ACTION_A')) {
        this.flyingOrb = {
          x: 4.5,
          y: 18,
          dx: this.cannonAngle * 2.5,
          dy: -12,
          type: this.currentOrb
        };
        sound.playShoot();
        this.currentOrb = Math.random() < 0.5 ? 1 : 2;
      }
    }

    // Update Flying Orb Physics
    if (this.flyingOrb) {
      const orb = this.flyingOrb;
      orb.x += orb.dx * deltaTime;
      orb.y += orb.dy * deltaTime;

      // Ricochet off side walls
      if (orb.x <= 0) {
        orb.x = 0;
        orb.dx = Math.abs(orb.dx);
        sound.playBounce();
      } else if (orb.x >= 9) {
        orb.x = 9;
        orb.dx = -Math.abs(orb.dx);
        sound.playBounce();
      }

      const gx = Math.min(9, Math.max(0, Math.round(orb.x)));
      const gy = Math.min(19, Math.max(0, Math.round(orb.y)));

      // Hit ceiling or adjacent existing orb
      let hit = false;
      if (gy <= 0) {
        hit = true;
      } else {
        // Check neighbor cells
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = gy + dr;
            const nc = gx + dc;
            if (nr >= 0 && nr < 20 && nc >= 0 && nc < 10) {
              if (this.grid[nr][nc] > 0) {
                hit = true;
                break;
              }
            }
          }
          if (hit) break;
        }
      }

      if (hit) {
        // Lock orb to grid
        const lockRow = Math.max(0, Math.min(18, gy));
        this.grid[lockRow][gx] = orb.type;
        this.flyingOrb = null;
        sound.playDrop();

        // Check Matches (3+)
        const matched = this.findMatchingCluster(gx, lockRow, orb.type);
        if (matched.length >= 3) {
          for (const m of matched) {
            this.grid[m.r][m.c] = 0;
          }
          this.addScore(matched.length * 30);
          sound.playScore();

          // Avalanche check (unsupported orbs fall)
          this.dropFloatingOrbs();
        }

        this.shotCount++;
        // Shift ceiling down every 5 shots
        if (this.shotCount % 5 === 0) {
          this.shiftCeilingDown();
        }

        // Check Win (board empty)
        if (this.isBoardEmpty()) {
          sound.playVictory();
          this.addScore(2000);
          this.gameOver();
          return;
        }

        // Check Lose (orbs reached baseline)
        if (this.hasOrbsAtBottom()) {
          this.gameOver();
          return;
        }
      }
    }
  }

  findMatchingCluster(startX, startY, targetType) {
    const visited = Array.from({ length: 20 }, () => new Uint8Array(10));
    const matched = [];
    const queue = [{ c: startX, r: startY }];
    visited[startY][startX] = 1;

    while (queue.length > 0) {
      const { c, r } = queue.shift();
      matched.push({ c, r });

      const neighbors = [
        { c: c - 1, r },
        { c: c + 1, r },
        { c, r: r - 1 },
        { c, r: r + 1 }
      ];

      for (const n of neighbors) {
        if (n.c >= 0 && n.c < 10 && n.r >= 0 && n.r < 20) {
          if (!visited[n.r][n.c] && this.grid[n.r][n.c] === targetType) {
            visited[n.r][n.c] = 1;
            queue.push(n);
          }
        }
      }
    }

    return matched;
  }

  dropFloatingOrbs() {
    // Find all orbs connected to ceiling (row 0)
    const connected = Array.from({ length: 20 }, () => new Uint8Array(10));
    const queue = [];

    for (let c = 0; c < 10; c++) {
      if (this.grid[0][c] > 0) {
        connected[0][c] = 1;
        queue.push({ c, r: 0 });
      }
    }

    while (queue.length > 0) {
      const { c, r } = queue.shift();
      const neighbors = [
        { c: c - 1, r },
        { c: c + 1, r },
        { c, r: r - 1 },
        { c, r: r + 1 }
      ];

      for (const n of neighbors) {
        if (n.c >= 0 && n.c < 10 && n.r >= 0 && n.r < 20) {
          if (!connected[n.r][n.c] && this.grid[n.r][n.c] > 0) {
            connected[n.r][n.c] = 1;
            queue.push(n);
          }
        }
      }
    }

    // Any cell with grid > 0 but not connected drops!
    let dropped = 0;
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        if (this.grid[r][c] > 0 && !connected[r][c]) {
          this.grid[r][c] = 0;
          dropped++;
        }
      }
    }

    if (dropped > 0) {
      this.addScore(dropped * 100);
      this.context.sound.playVictory();
    }
  }

  shiftCeilingDown() {
    this.grid.pop();
    const newRow = new Uint8Array(10);
    for (let c = 0; c < 10; c++) {
      newRow[c] = Math.random() < 0.5 ? 1 : 2;
    }
    this.grid.unshift(newRow);
  }

  isBoardEmpty() {
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        if (this.grid[r][c] > 0) return false;
      }
    }
    return true;
  }

  hasOrbsAtBottom() {
    for (let c = 0; c < 10; c++) {
      if (this.grid[18][c] > 0) return true;
    }
    return false;
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Orbs on Grid
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        const val = this.grid[r][c];
        if (val === 1) {
          renderer.setPixel(c, r, 1); // Solid Orb
        } else if (val === 2) {
          renderer.setPixel(c, r, 2); // Blinking / Striped Orb
        }
      }
    }

    // 2. Draw Cannon & Aim Guide Line (Row 19)
    renderer.setPixel(4, 19, 1);
    renderer.setPixel(5, 19, 1);
    const aimX = Math.min(9, Math.max(0, 4.5 + this.cannonAngle));
    renderer.setPixel(Math.round(aimX), 18, 2);

    // 3. Draw Flying Orb
    if (this.flyingOrb) {
      const fx = Math.min(9, Math.max(0, Math.round(this.flyingOrb.x)));
      const fy = Math.min(19, Math.max(0, Math.round(this.flyingOrb.y)));
      renderer.setPixel(fx, fy, this.flyingOrb.type === 1 ? 1 : 2);
    }
  }
}
