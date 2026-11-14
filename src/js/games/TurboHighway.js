/**
 * Retro Brick Game Console - TurboHighway
 * Top-down retro racer with 3 lanes, Nitro boost, EMP horn, and close-shave slipstreams.
 */

import { BaseGame } from '../core/BaseGame.js';

export class TurboHighway extends BaseGame {
  constructor() {
    super('turbo-highway', 'Turbo Highway', 'Racing');
    this.laneX = [1, 4, 7]; // X coordinates for lanes 0, 1, 2
    this.currentLane = 1;
    this.playerY = 16;
    this.distance = 0;
    this.scrollSpeed = 8; // rows per second base
    this.traffic = []; // { lane, y, speed, carType }
    this.spawnTimer = 0;
    this.spawnInterval = 1.8;
    this.empCooldown = 0;
    this.empPulseY = -1;
    this.isBoosting = false;
    this.isBraking = false;
    this.guardrailOffset = 0;
    this.invulnerableTimer = 0;
    this.nextCheckpoint = 1000;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.scrollSpeed = 6;
      this.spawnInterval = 2.4;
    } else if (diff === 'HARD') {
      this.scrollSpeed = 10;
      this.spawnInterval = 1.3;
    } else {
      this.scrollSpeed = 8;
      this.spawnInterval = 1.8;
    }

    this.currentLane = 1;
    this.distance = 0;
    this.traffic = [];
    this.spawnTimer = 0;
    this.empCooldown = 0;
    this.empPulseY = -1;
    this.invulnerableTimer = 0;
    this.nextCheckpoint = 1000;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= deltaTime;
    }

    if (this.empCooldown > 0) {
      this.empCooldown -= deltaTime;
    }

    // Lane switching
    if (input.isJustPressed('LEFT')) {
      if (this.currentLane > 0) {
        this.currentLane--;
        sound.playMove();
      }
    } else if (input.isJustPressed('RIGHT')) {
      if (this.currentLane < 2) {
        this.currentLane++;
        sound.playMove();
      }
    }

    // Throttle & Brake
    this.isBoosting = input.isDown('UP');
    this.isBraking = input.isDown('DOWN');

    let currentSpeed = this.scrollSpeed;
    if (this.isBoosting) currentSpeed *= 1.8;
    else if (this.isBraking) currentSpeed *= 0.6;

    // EMP Horn (Button A)
    if (input.isJustPressed('ACTION_A') && this.empCooldown <= 0) {
      this.empCooldown = 5.0;
      this.empPulseY = this.playerY;
      sound.playShoot();

      // Find car ahead in current lane
      for (const car of this.traffic) {
        if (car.lane === this.currentLane && car.y < this.playerY && car.y > this.playerY - 8) {
          car.y -= 7; // blasted forward
          this.addScore(15);
        }
      }
    }

    // Advance distance & score
    const distDelta = currentSpeed * deltaTime * 10;
    this.distance += distDelta;
    this.addScore(this.isBoosting ? 3 : 1);

    // Checkpoint
    if (this.distance >= this.nextCheckpoint) {
      this.addScore(500);
      sound.playLevelUp();
      this.nextCheckpoint += 1000;
      this.scrollSpeed += 0.5;
    }

    // Win condition at 10,000m
    if (this.distance >= 10000) {
      this.addScore(5000);
      sound.playVictory();
      this.gameOver();
      return;
    }

    // Guardrail animation scroll
    this.guardrailOffset = (this.guardrailOffset + currentSpeed * deltaTime) % 2;

    // Spawn traffic
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      const freeLanes = [0, 1, 2];
      const selectedLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
      this.traffic.push({
        lane: selectedLane,
        y: -3,
        speed: this.scrollSpeed * (0.35 + Math.random() * 0.3)
      });
    }

    // Update traffic positions
    const playerX = this.laneX[this.currentLane];

    for (let i = this.traffic.length - 1; i >= 0; i--) {
      const car = this.traffic[i];
      // Car moves down relative to player scroll
      const relativeSpeed = currentSpeed - car.speed;
      car.y += relativeSpeed * deltaTime;

      const carX = this.laneX[car.lane];

      // Collision Detection
      if (this.invulnerableTimer <= 0) {
        if (car.lane === this.currentLane) {
          // Overlapping Y interval [playerY, playerY+2] with [car.y, car.y+2]
          if (car.y + 2.5 >= this.playerY && car.y <= this.playerY + 2.5) {
            // Crash!
            sound.playExplosion();
            this.emitLives(this.lives - 1);
            this.invulnerableTimer = 2.0;
            this.traffic.splice(i, 1);

            if (this.lives <= 0) {
              this.gameOver();
              return;
            }
            continue;
          }
        } else {
          // Close-shave bonus (adjacent lane within Y)
          if (Math.abs(car.lane - this.currentLane) === 1) {
            if (Math.abs(car.y - this.playerY) < 1.0 && !car.closeShaveAwarded) {
              car.closeShaveAwarded = true;
              this.addScore(25);
              sound.playBounce();
            }
          }
        }
      }

      // Despawn off-screen cars
      if (car.y > 22 || car.y < -10) {
        this.traffic.splice(i, 1);
      }
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw dashed guardrails (col 0 and col 9)
    const offset = Math.floor(this.guardrailOffset);
    for (let r = 0; r < 20; r++) {
      if ((r + offset) % 2 === 0) {
        renderer.setPixel(0, r, 1);
        renderer.setPixel(9, r, 1);
      }
    }

    // 2. Draw traffic cars (2x3 blocks)
    for (const car of this.traffic) {
      const cy = Math.floor(car.y);
      const cx = this.laneX[car.lane];
      if (cy >= -3 && cy < 20) {
        // Front wheels
        renderer.setPixel(cx, cy, 1);
        renderer.setPixel(cx + 1, cy, 1);
        // Cabin
        renderer.setPixel(cx, cy + 1, 1);
        renderer.setPixel(cx + 1, cy + 1, 0);
        // Rear wheels
        renderer.setPixel(cx, cy + 2, 1);
        renderer.setPixel(cx + 1, cy + 2, 1);
      }
    }

    // 3. Draw player car
    const px = this.laneX[this.currentLane];
    const py = this.playerY;
    const playerState = this.invulnerableTimer > 0 ? 2 : 1;

    // Player racer glyph (2x3)
    renderer.setPixel(px, py, playerState);
    renderer.setPixel(px + 1, py, playerState);
    renderer.setPixel(px, py + 1, 0);
    renderer.setPixel(px + 1, py + 1, playerState);
    renderer.setPixel(px, py + 2, playerState);
    renderer.setPixel(px + 1, py + 2, playerState);

    // Boost flame effect
    if (this.isBoosting && py + 3 < 20) {
      renderer.setPixel(px, py + 3, 2);
      renderer.setPixel(px + 1, py + 3, 2);
    }
  }
}
