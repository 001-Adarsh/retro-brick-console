/**
 * Retro Brick Game Console - LabyrinthEscape
 * Procedural maze infiltration with keycard extraction, roving patrol bots, and sonar ping.
 */

import { BaseGame } from '../core/BaseGame.js';

export class LabyrinthEscape extends BaseGame {
  constructor() {
    super('labyrinth-escape', 'Labyrinth Escape', 'Adventure');
    this.player = { x: 1, y: 1 };
    this.keycard = { x: 8, y: 3, collected: false };
    this.escape = { x: 8, y: 18, unlocked: false };
    this.drones = []; // { x, y, dx, dy }
    this.maze = []; // 20 rows x 10 cols binary (1=wall, 0=path)
    this.oxygen = 60;
    this.totalOxygen = 60;
    this.sector = 1;
    this.maxSectors = 6;
    this.sonarCharges = 3;
    this.sonarPulseTimer = 0;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') this.totalOxygen = 90;
    else if (diff === 'HARD') this.totalOxygen = 40;
    else this.totalOxygen = 60;

    this.sector = 1;
    this.initSector();
  }

  initSector() {
    this.oxygen = this.totalOxygen;
    this.sonarCharges = 3;
    this.player = { x: 1, y: 1 };
    this.keycard = { x: 8, y: 4, collected: false };
    this.escape = { x: 8, y: 18, unlocked: false };

    // Generate maze with outer perimeter walls and interior partitions
    this.maze = Array.from({ length: 20 }, () => new Uint8Array(10));

    // Outer perimeter
    for (let c = 0; c < 10; c++) {
      this.maze[0][c] = 1;
      this.maze[19][c] = 1;
    }
    for (let r = 0; r < 20; r++) {
      this.maze[r][0] = 1;
      this.maze[r][9] = 1;
    }

    // Interior corridor walls with openings
    for (let r = 2; r < 18; r += 3) {
      for (let c = 1; c < 9; c++) {
        this.maze[r][c] = 1;
      }
      // Open 2 random doorways in each partition
      const door1 = 1 + Math.floor(Math.random() * 4);
      const door2 = 5 + Math.floor(Math.random() * 3);
      this.maze[r][door1] = 0;
      this.maze[r][door2] = 0;
    }

    // Ensure player, key, and exit are walkable
    this.maze[1][1] = 0;
    this.maze[4][8] = 0;
    this.maze[18][8] = 0;

    // Patrol drones
    this.drones = [];
    const diff = this.context.difficulty || 'MEDIUM';
    const droneCount = diff === 'HARD' ? 2 : (diff === 'MEDIUM' ? 1 : 0);

    if (droneCount >= 1) {
      this.drones.push({ x: 4, y: 8, dx: 1, dy: 0, moveTimer: 0 });
    }
    if (droneCount >= 2) {
      this.drones.push({ x: 5, y: 14, dx: -1, dy: 0, moveTimer: 0 });
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    if (this.sonarPulseTimer > 0) {
      this.sonarPulseTimer -= deltaTime;
    }

    // Oxygen timer
    this.oxygen -= deltaTime;
    if (this.oxygen <= 0) {
      sound.playExplosion();
      this.emitLives(this.lives - 1);
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      this.initSector();
      return;
    }

    // 1. Player Navigation
    let nx = this.player.x;
    let ny = this.player.y;
    let moved = false;

    if (input.isJustPressed('UP')) {
      ny--;
      moved = true;
    } else if (input.isJustPressed('DOWN')) {
      ny++;
      moved = true;
    } else if (input.isJustPressed('LEFT')) {
      nx--;
      moved = true;
    } else if (input.isJustPressed('RIGHT')) {
      nx++;
      moved = true;
    }

    if (moved) {
      if (nx >= 0 && nx < 10 && ny >= 0 && ny < 20 && !this.maze[ny][nx]) {
        this.player.x = nx;
        this.player.y = ny;
        sound.playMove();

        // Check Keycard Pickup
        if (!this.keycard.collected && this.player.x === this.keycard.x && this.player.y === this.keycard.y) {
          this.keycard.collected = true;
          this.escape.unlocked = true;
          this.addScore(200);
          sound.playScore();
        }

        // Check Escape Hatch
        if (this.escape.unlocked && this.player.x === this.escape.x && this.player.y === this.escape.y) {
          sound.playVictory();
          this.addScore(1000 + Math.round(this.oxygen * 15));
          this.sector++;
          this.emitLevel(this.sector);

          if (this.sector > this.maxSectors) {
            this.addScore(5000);
            this.gameOver();
            return;
          }

          this.initSector();
          return;
        }
      }
    }

    // 2. Sonar Ping (Button B)
    if (input.isJustPressed('ACTION_B') && this.sonarCharges > 0) {
      this.sonarCharges--;
      this.sonarPulseTimer = 1.0;
      sound.playTone(850, 0.15, 'triangle');
    }

    // 3. Update Patrol Drones
    for (const d of this.drones) {
      d.moveTimer += deltaTime;
      if (d.moveTimer >= 0.4) {
        d.moveTimer = 0;
        let dnx = d.x + d.dx;
        let dny = d.y + d.dy;

        // Bounce if hit wall
        if (dnx < 0 || dnx >= 10 || dny < 0 || dny >= 20 || this.maze[dny][dnx]) {
          d.dx *= -1;
          d.dy *= -1;
        } else {
          d.x = dnx;
          d.y = dny;
        }
      }

      // Check collision with player
      if (d.x === this.player.x && d.y === this.player.y) {
        sound.playExplosion();
        this.emitLives(this.lives - 1);
        if (this.lives <= 0) {
          this.gameOver();
          return;
        }
        this.player = { x: 1, y: 1 };
      }
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // Draw Maze Walls
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        if (this.maze[r][c]) {
          renderer.setPixel(c, r, 1);
        }
      }
    }

    // Draw Keycard (Blinking if not collected)
    if (!this.keycard.collected) {
      renderer.setPixel(this.keycard.x, this.keycard.y, 2);
    }

    // Draw Escape Hatch (Blinking when unlocked)
    renderer.setPixel(this.escape.x, this.escape.y, this.escape.unlocked ? 2 : 1);

    // Draw Patrol Drones
    for (const d of this.drones) {
      renderer.setPixel(d.x, d.y, 2);
    }

    // Draw Player (Solid or flashing on sonar)
    const pState = this.sonarPulseTimer > 0 ? 2 : 1;
    renderer.setPixel(this.player.x, this.player.y, pState);
  }
}
