/**
 * Retro Brick Game Console - Froggero
 * Transit hazard crosser with moving vehicles, floating logs, and docking bays.
 */

import { BaseGame } from '../core/BaseGame.js';

export class Froggero extends BaseGame {
  constructor() {
    super('froggero', 'Froggero', 'Arcade');
    this.frog = { x: 5, y: 19 };
    this.docks = [false, false, false, false, false]; // 5 docking bays at row 1 (cols 1, 3, 5, 7, 9)
    this.trafficLanes = []; // { y, speed, width, cars: [x1, x2] }
    this.canalLanes = []; // { y, speed, width, logs: [x1, x2] }
    this.dragonfly = null; // { x, y, timer }
    this.timeLimit = 45;
    this.timeRemaining = 45;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') this.timeLimit = 60;
    else if (diff === 'HARD') this.timeLimit = 30;
    else this.timeLimit = 45;

    this.docks = [false, false, false, false, false];
    this.initLanes();
    this.resetFrog();
  }

  initLanes() {
    this.trafficLanes = [
      { y: 18, speed: 3.0, width: 2, cars: [1, 6] },
      { y: 17, speed: -4.0, width: 2, cars: [3, 8] },
      { y: 16, speed: 2.5, width: 3, cars: [2, 7] },
      { y: 15, speed: -5.0, width: 2, cars: [0, 5] }
    ];

    this.canalLanes = [
      { y: 13, speed: 2.5, width: 3, logs: [1, 6] },
      { y: 12, speed: -3.0, width: 3, logs: [2, 7] },
      { y: 11, speed: 3.5, width: 4, logs: [0, 5] },
      { y: 10, speed: -2.5, width: 3, logs: [3, 8] },
      { y: 9, speed: 4.0, width: 3, logs: [1, 6] },
      { y: 8, speed: -3.0, width: 4, logs: [2, 7] },
      { y: 7, speed: 2.0, width: 3, logs: [0, 5] },
      { y: 6, speed: -3.5, width: 3, logs: [3, 8] },
      { y: 5, speed: 2.5, width: 3, logs: [1, 6] },
      { y: 4, speed: -4.0, width: 4, logs: [2, 7] },
      { y: 3, speed: 3.0, width: 3, logs: [0, 6] },
      { y: 2, speed: -2.5, width: 3, logs: [1, 7] }
    ];
  }

  resetFrog() {
    this.frog = { x: 5, y: 19 };
    this.timeRemaining = this.timeLimit;
    this.dragonfly = null;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.handleDeath();
      return;
    }

    // 1. Frog Movement
    let moved = false;
    let leapDistance = 1;

    // Super Leap (Button A)
    if (input.isJustPressed('ACTION_A')) {
      leapDistance = 2;
    }

    if (input.isJustPressed('UP') || (input.isJustPressed('ACTION_A') && input.isDown('UP'))) {
      this.frog.y = Math.max(1, this.frog.y - leapDistance);
      moved = true;
      this.addScore(10 * leapDistance);
    } else if (input.isJustPressed('DOWN')) {
      this.frog.y = Math.min(19, this.frog.y + 1);
      moved = true;
    } else if (input.isJustPressed('LEFT')) {
      this.frog.x = Math.max(0, this.frog.x - 1);
      moved = true;
    } else if (input.isJustPressed('RIGHT')) {
      this.frog.x = Math.min(9, this.frog.x + 1);
      moved = true;
    }

    if (moved) {
      sound.playMove();
    }

    // Tongue Snap (Button B)
    if (input.isJustPressed('ACTION_B') && this.dragonfly) {
      if (Math.abs(this.frog.x - this.dragonfly.x) <= 2 && this.frog.y > this.dragonfly.y) {
        this.addScore(250);
        sound.playScore();
        this.dragonfly = null;
      }
    }

    // 2. Update Traffic
    for (const lane of this.trafficLanes) {
      for (let i = 0; i < lane.cars.length; i++) {
        lane.cars[i] = (lane.cars[i] + lane.speed * deltaTime + 12) % 12;
      }

      // Check collision with cars if frog is on this lane
      if (this.frog.y === lane.y) {
        for (const carX of lane.cars) {
          const cx = Math.floor(carX);
          if (this.frog.x >= cx && this.frog.x < cx + lane.width) {
            this.handleDeath();
            return;
          }
        }
      }
    }

    // 3. Update Canal Logs
    let onLog = false;
    for (const lane of this.canalLanes) {
      for (let i = 0; i < lane.logs.length; i++) {
        lane.logs[i] = (lane.logs[i] + lane.speed * deltaTime + 12) % 12;
      }

      // If frog is on canal row, test if resting on a log
      if (this.frog.y === lane.y) {
        for (const logX of lane.logs) {
          const lx = Math.floor(logX);
          if (this.frog.x >= lx && this.frog.x < lx + lane.width) {
            onLog = true;
            // Drift with the log
            this.frog.x += lane.speed * deltaTime;
            break;
          }
        }
      }
    }

    // If in canal (rows 2..13) and not on log, drown!
    if (this.frog.y >= 2 && this.frog.y <= 13) {
      this.frog.x = Math.round(this.frog.x);
      if (!onLog || this.frog.x < 0 || this.frog.x > 9) {
        this.handleDeath();
        return;
      }
    }

    // 4. Docking Bay Goal Check (Row 1)
    if (this.frog.y === 1) {
      const dockPositions = [1, 3, 5, 7, 9];
      const dockIdx = dockPositions.indexOf(Math.round(this.frog.x));

      if (dockIdx !== -1 && !this.docks[dockIdx]) {
        // Successful docking!
        this.docks[dockIdx] = true;
        sound.playScore();
        this.addScore(200 + Math.round(this.timeRemaining * 10));

        // Check all 5 docks filled
        if (this.docks.every(Boolean)) {
          sound.playVictory();
          this.addScore(1000 * this.level);
          this.emitLevel(this.level + 1);

          if (this.level > 5) {
            this.addScore(5000);
            this.gameOver();
            return;
          }

          this.docks = [false, false, false, false, false];
        }

        this.resetFrog();
      } else {
        // Missed dock or already occupied
        this.handleDeath();
        return;
      }
    }
  }

  handleDeath() {
    const sound = this.context.sound;
    sound.playExplosion();
    this.emitLives(this.lives - 1);
    if (this.lives <= 0) {
      this.gameOver();
      return;
    }
    this.resetFrog();
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Docks (Row 1)
    const dockCols = [1, 3, 5, 7, 9];
    for (let i = 0; i < dockCols.length; i++) {
      if (this.docks[i]) {
        renderer.setPixel(dockCols[i], 1, 1);
      } else {
        renderer.setPixel(dockCols[i], 1, 2); // open dock flashes
      }
    }

    // 2. Draw Canal Logs (Rows 2..13)
    for (const lane of this.canalLanes) {
      for (const lx of lane.logs) {
        const sx = Math.floor(lx);
        for (let w = 0; w < lane.width; w++) {
          const px = sx + w;
          if (px >= 0 && px < 10) {
            renderer.setPixel(px, lane.y, 1);
          }
        }
      }
    }

    // 3. Draw Median Strip (Row 14)
    for (let c = 0; c < 10; c += 2) {
      renderer.setPixel(c, 14, 1);
    }

    // 4. Draw Traffic (Rows 15..18)
    for (const lane of this.trafficLanes) {
      for (const cx of lane.cars) {
        const sx = Math.floor(cx);
        for (let w = 0; w < lane.width; w++) {
          const px = sx + w;
          if (px >= 0 && px < 10) {
            renderer.setPixel(px, lane.y, 1);
          }
        }
      }
    }

    // 5. Draw Frog
    const fx = Math.min(9, Math.max(0, Math.round(this.frog.x)));
    const fy = Math.min(19, Math.max(0, Math.round(this.frog.y)));
    renderer.setPixel(fx, fy, 2);
  }
}
