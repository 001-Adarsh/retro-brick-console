/**
 * Retro Brick Game Console - BounceDuel
 * Kinetic paddle deflector duel with English curve slice and smash spikes.
 */

import { BaseGame } from '../core/BaseGame.js';

export class BounceDuel extends BaseGame {
  constructor() {
    super('bounce-duel', 'Bounce Duel', 'Sports');
    this.playerX = 3;
    this.aiX = 3;
    this.paddleWidth = 3;
    this.ball = { x: 5, y: 10, dx: 4, dy: 6 };
    this.playerScore = 0;
    this.aiScore = 0;
    this.targetGoals = 7;
    this.midfieldBricks = []; // array of { x, y }
    this.smashActive = false;
    this.englishSpin = 0;
    this.rallyCount = 0;
  }

  init(context) {
    super.init(context);
    const diff = context.difficulty || 'MEDIUM';

    if (diff === 'EASY') {
      this.paddleWidth = 4;
      this.targetGoals = 4;
    } else if (diff === 'HARD') {
      this.paddleWidth = 2;
      this.targetGoals = 11;
    } else {
      this.paddleWidth = 3;
      this.targetGoals = 7;
    }

    this.playerScore = 0;
    this.aiScore = 0;
    this.rallyCount = 0;

    // Spawn 4 midfield bonus bricks
    this.midfieldBricks = [
      { x: 3, y: 9 },
      { x: 6, y: 9 },
      { x: 3, y: 11 },
      { x: 6, y: 11 }
    ];

    this.resetBall(1);
  }

  resetBall(servingTowards = 1) {
    this.ball.x = 4.5;
    this.ball.y = 10;
    this.ball.dx = (Math.random() < 0.5 ? 1 : -1) * (2 + Math.random() * 2);
    this.ball.dy = servingTowards * 6;
    this.smashActive = false;
    this.englishSpin = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    let playerMoved = 0;

    // 1. Player Paddle Movement
    if (input.isDown('LEFT') || input.isJustPressed('LEFT')) {
      if (this.playerX > 0) {
        this.playerX--;
        playerMoved = -1;
      }
    } else if (input.isDown('RIGHT') || input.isJustPressed('RIGHT')) {
      if (this.playerX + this.paddleWidth < 10) {
        this.playerX++;
        playerMoved = 1;
      }
    }

    // Smash Strike buffer (Button A)
    if (input.isJustPressed('ACTION_A')) {
      this.smashActive = true;
    }

    // English Curve Slice (Button B)
    if (input.isJustPressed('ACTION_B')) {
      this.englishSpin = playerMoved * 2;
      sound.playRotate();
    }

    // 2. AI Paddle Movement (Tracks ball with variable reaction delay)
    const diff = this.context.difficulty || 'MEDIUM';
    const aiCenter = this.aiX + this.paddleWidth / 2;
    const aiSpeed = diff === 'HARD' ? 1.0 : (diff === 'MEDIUM' ? 0.7 : 0.45);

    if (Math.random() < aiSpeed) {
      if (this.ball.x < aiCenter - 0.5 && this.aiX > 0) {
        this.aiX--;
      } else if (this.ball.x > aiCenter + 0.5 && this.aiX + this.paddleWidth < 10) {
        this.aiX++;
      }
    }

    // 3. Ball Physics & English Curve
    this.ball.x += (this.ball.dx + this.englishSpin) * deltaTime;
    this.ball.y += this.ball.dy * deltaTime;
    this.englishSpin *= 0.98; // decay spin

    // Wall Ricochets
    if (this.ball.x <= 0) {
      this.ball.x = 0;
      this.ball.dx = Math.abs(this.ball.dx);
      sound.playBounce();
    } else if (this.ball.x >= 9) {
      this.ball.x = 9;
      this.ball.dx = -Math.abs(this.ball.dx);
      sound.playBounce();
    }

    // Midfield Bricks Hit Check
    const bx = Math.round(this.ball.x);
    const by = Math.round(this.ball.y);
    for (let i = this.midfieldBricks.length - 1; i >= 0; i--) {
      const b = this.midfieldBricks[i];
      if (b.x === bx && b.y === by) {
        this.midfieldBricks.splice(i, 1);
        this.ball.dy *= -1;
        this.addScore(50);
        sound.playExplosion();
        break;
      }
    }

    // Paddle Hit: Player (Row 19)
    if (this.ball.y >= 18.5 && this.ball.dy > 0) {
      if (this.ball.x >= this.playerX - 0.6 && this.ball.x <= this.playerX + this.paddleWidth + 0.6) {
        // Hit!
        const hitOffset = (this.ball.x - (this.playerX + this.paddleWidth / 2)) / (this.paddleWidth / 2);
        this.ball.dx = hitOffset * 6 + playerMoved * 2;
        let speedMult = this.smashActive ? 1.5 : 1.05;
        this.ball.dy = -Math.abs(this.ball.dy) * speedMult;
        this.ball.y = 18;
        this.rallyCount++;
        this.addScore(this.smashActive ? 25 : 10);
        sound.playBounce();
        this.smashActive = false;
      } else if (this.ball.y > 19.5) {
        // Goal scored by AI!
        this.aiScore++;
        sound.playExplosion();
        if (this.aiScore >= this.targetGoals) {
          this.gameOver();
          return;
        }
        this.resetBall(-1);
      }
    }

    // Paddle Hit: AI (Row 1)
    if (this.ball.y <= 1.5 && this.ball.dy < 0) {
      if (this.ball.x >= this.aiX - 0.6 && this.ball.x <= this.aiX + this.paddleWidth + 0.6) {
        const hitOffset = (this.ball.x - (this.aiX + this.paddleWidth / 2)) / (this.paddleWidth / 2);
        this.ball.dx = hitOffset * 6;
        this.ball.dy = Math.abs(this.ball.dy) * 1.05;
        this.ball.y = 1.5;
        this.rallyCount++;
        sound.playBounce();
      } else if (this.ball.y < 0.5) {
        // Goal scored by Player!
        this.playerScore++;
        this.addScore(200);
        sound.playScore();
        if (this.playerScore >= this.targetGoals) {
          sound.playVictory();
          this.addScore(1500);
          this.gameOver();
          return;
        }
        this.resetBall(1);
      }
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Midfield Bricks
    for (const b of this.midfieldBricks) {
      renderer.setPixel(b.x, b.y, 2);
    }

    // 2. Draw AI Paddle (Row 1)
    renderer.drawRect(this.aiX, 1, this.paddleWidth, 1, 1, true);

    // 3. Draw Player Paddle (Row 19)
    renderer.drawRect(this.playerX, 19, this.paddleWidth, 1, 1, true);

    // 4. Draw Ball
    const bx = Math.min(9, Math.max(0, Math.round(this.ball.x)));
    const by = Math.min(19, Math.max(0, Math.round(this.ball.y)));
    renderer.setPixel(bx, by, this.smashActive ? 2 : 1);
  }
}
