import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CyberViper } from '../src/js/games/CyberViper.js';
import { FallingPoly } from '../src/js/games/FallingPoly.js';
import { BrickBreaker } from '../src/js/games/BrickBreaker.js';
import { Matrix2048 } from '../src/js/games/Matrix2048.js';

describe('GameLogic - Core Mechanics', () => {
  let mockRenderer;
  let mockSound;
  let mockStorage;
  let mockInput;
  let mockContext;

  beforeEach(() => {
    mockRenderer = {
      clear: vi.fn(),
      setPixel: vi.fn(),
      getPixel: vi.fn(() => 0),
      drawMatrix: vi.fn(),
      drawRect: vi.fn()
    };

    mockSound = {
      playMove: vi.fn(),
      playRotate: vi.fn(),
      playDrop: vi.fn(),
      playScore: vi.fn(),
      playLevelUp: vi.fn(),
      playGameOver: vi.fn(),
      playExplosion: vi.fn(),
      playBounce: vi.fn(),
      playVictory: vi.fn(),
      playTone: vi.fn()
    };

    mockStorage = {
      getHighScore: vi.fn(() => 0),
      setHighScore: vi.fn(() => true)
    };

    mockInput = {
      isDown: vi.fn(() => false),
      isJustPressed: vi.fn(() => false),
      isJustReleased: vi.fn(() => false)
    };

    mockContext = {
      renderer: mockRenderer,
      sound: mockSound,
      storage: mockStorage,
      input: mockInput,
      difficulty: 'MEDIUM',
      onScore: vi.fn(),
      onGameOver: vi.fn(),
      onLevelUp: vi.fn(),
      onLivesChange: vi.fn()
    };
  });

  describe('1. CyberViper (Movement, Steering, Food Growth & Collision)', () => {
    let viper;

    beforeEach(() => {
      viper = new CyberViper();
      viper.init(mockContext);
    });

    it('initializes with 4 body segments and downward orientation', () => {
      expect(viper.body.length).toBe(4);
      expect(viper.dir).toEqual({ x: 0, y: 1 });
      expect(viper.body[0]).toEqual({ x: 5, y: 6 }); // Head
      expect(viper.chip).toBeDefined();
    });

    it('advances head position in current direction and pops tail when no food eaten', () => {
      // Place food far away so it doesn't eat
      viper.chip = { x: 0, y: 0 };
      viper.dir = { x: 1, y: 0 };
      viper.nextDir = { x: 1, y: 0 };

      const oldTail = { ...viper.body[viper.body.length - 1] };
      viper.step();

      expect(viper.body.length).toBe(4);
      expect(viper.body[0]).toEqual({ x: 6, y: 6 }); // Head moved right
      // Previous tail should have been removed
      expect(viper.body.some(seg => seg.x === oldTail.x && seg.y === oldTail.y)).toBe(false);
    });

    it('prevents immediate 180-degree reversing into own neck', () => {
      viper.dir = { x: 0, y: 1 }; // Moving DOWN
      
      // Attempting to press UP should be rejected
      mockInput.isJustPressed.mockImplementation((key) => key === 'UP');
      viper.update(0.016);
      expect(viper.nextDir).toEqual({ x: 0, y: 1 }); // Still DOWN

      // Pressing LEFT should be accepted
      mockInput.isJustPressed.mockImplementation((key) => key === 'LEFT');
      viper.update(0.016);
      expect(viper.nextDir).toEqual({ x: -1, y: 0 }); // Accepted
    });

    it('grows body, awards points, and plays sound when eating chip', () => {
      const initialLength = viper.body.length;
      // Position chip directly ahead of head (5, 6) -> (5, 7)
      viper.chip = { x: 5, y: 7 };
      viper.dir = { x: 0, y: 1 };
      viper.nextDir = { x: 0, y: 1 };

      viper.step();

      // Tail was not popped, so length increased by 1
      expect(viper.body.length).toBe(initialLength + 1);
      expect(viper.body[0]).toEqual({ x: 5, y: 7 }); // Head is at chip
      expect(mockSound.playScore).toHaveBeenCalled();
      expect(viper.score).toBeGreaterThan(0);
    });

    it('detects wall collision in MEDIUM difficulty and decrements lives', () => {
      // Head at x=5, y=19; moving DOWN into bottom wall
      viper.body = [
        { x: 5, y: 19 },
        { x: 5, y: 18 },
        { x: 5, y: 17 },
        { x: 5, y: 16 }
      ];
      viper.dir = { x: 0, y: 1 };
      viper.nextDir = { x: 0, y: 1 };
      viper.ghostPhaseTimer = 0;

      const initialLives = viper.lives;
      viper.step();

      expect(mockSound.playExplosion).toHaveBeenCalled();
      expect(viper.lives).toBe(initialLives - 1);
      expect(mockContext.onLivesChange).toHaveBeenCalledWith(initialLives - 1);
    });

    it('detects self collision and decrements lives', () => {
      // Form a loop where moving RIGHT collides into own tail segment
      viper.body = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 5 },
        { x: 5, y: 5 } // Head re-enters
      ];
      viper.dir = { x: 1, y: 0 };
      viper.nextDir = { x: 1, y: 0 };
      viper.ghostPhaseTimer = 0;

      const initialLives = viper.lives;
      viper.step();

      expect(mockSound.playExplosion).toHaveBeenCalled();
      expect(viper.lives).toBe(initialLives - 1);
    });
  });

  describe('2. FallingPoly (Polyomino Rotation, Collision & Line Clearing)', () => {
    let poly;

    beforeEach(() => {
      poly = new FallingPoly();
      poly.init(mockContext);
    });

    it('spawns piece centered at top and initializes empty 20x10 board', () => {
      expect(poly.board.length).toBe(20);
      expect(poly.board[0].length).toBe(10);
      expect(poly.currentPiece).toBeDefined();
      expect(poly.pieceY).toBe(0);
      expect(poly.pieceX).toBeGreaterThanOrEqual(0);
    });

    it('rotates polyomino matrix clockwise accurately', () => {
      const original = [
        [1, 0],
        [1, 1]
      ];
      const rotated = poly.rotateMatrix(original, true);
      // Clockwise 90 deg:
      // [1, 1]
      // [1, 0]
      expect(rotated).toEqual([
        [1, 1],
        [1, 0]
      ]);
    });

    it('detects boundary and existing block collisions in isValidPosition', () => {
      const singleBlock = [[1]];

      // In-bounds
      expect(poly.isValidPosition(singleBlock, 0, 0)).toBe(true);
      expect(poly.isValidPosition(singleBlock, 9, 19)).toBe(true);

      // Out of bounds
      expect(poly.isValidPosition(singleBlock, -1, 0)).toBe(false);
      expect(poly.isValidPosition(singleBlock, 10, 0)).toBe(false);
      expect(poly.isValidPosition(singleBlock, 5, 20)).toBe(false);

      // Colliding with locked block
      poly.board[10][5] = 1;
      expect(poly.isValidPosition(singleBlock, 5, 10)).toBe(false);
      expect(poly.isValidPosition(singleBlock, 4, 10)).toBe(true);
    });

    it('locks piece to board and clears completed lines with cascading drop', () => {
      // Pre-fill bottom row 19 almost completely (columns 0..8 filled, col 9 open)
      for (let c = 0; c < 9; c++) {
        poly.board[19][c] = 1;
      }
      // Fill one block in row 18 at col 0
      poly.board[18][0] = 1;

      // Provide a 1x1 block as currentPiece positioned at x=9, y=19 to complete the row
      poly.currentPiece = [[1]];
      poly.pieceX = 9;
      poly.pieceY = 19;

      poly.lockPiece();

      // Row 19 should have been cleared!
      // Row 18 should have fallen to row 19, so row 19 col 0 should be 1
      expect(poly.board[19][0]).toBe(1);
      // And rest of row 19 should be 0
      for (let c = 1; c < 10; c++) {
        expect(poly.board[19][c]).toBe(0);
      }

      expect(poly.linesCleared).toBe(1);
      expect(poly.score).toBeGreaterThan(0);
      expect(mockSound.playScore).toHaveBeenCalled();
    });

    it('awards bonus points and sound for multi-line Tetro clear (4 lines)', () => {
      // Fill bottom 4 rows except column 9
      for (let r = 16; r < 20; r++) {
        for (let c = 0; c < 9; c++) {
          poly.board[r][c] = 1;
        }
      }

      // Slot an I-bar (4x1) into column 9
      poly.currentPiece = [
        [1],
        [1],
        [1],
        [1]
      ];
      poly.pieceX = 9;
      poly.pieceY = 16;

      poly.lockPiece();

      expect(poly.linesCleared).toBe(4);
      expect(mockSound.playVictory).toHaveBeenCalled();
      expect(poly.score).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('3. BrickBreaker (Paddle Movement, Ball Bounce & Brick Destruction)', () => {
    let breaker;

    beforeEach(() => {
      breaker = new BrickBreaker();
      breaker.init(mockContext);
    });

    it('initializes paddle width based on difficulty', () => {
      expect(breaker.paddleWidth).toBe(3); // MEDIUM default
      expect(breaker.paddleX).toBe(3); // Centered
      expect(breaker.balls.length).toBe(1);
    });

    it('moves and clamps paddle within playfield boundaries', () => {
      // Clamp at left boundary 0
      breaker.paddleX = 0;
      mockInput.isDown.mockImplementation((k) => k === 'LEFT');
      breaker.update(0.016);
      expect(breaker.paddleX).toBe(0);

      // Move right
      mockInput.isDown.mockImplementation((k) => k === 'RIGHT');
      breaker.update(0.016);
      expect(breaker.paddleX).toBe(1);

      // Clamp at right boundary (10 - paddleWidth = 7)
      breaker.paddleX = 7;
      breaker.update(0.016);
      expect(breaker.paddleX).toBe(7);
    });

    it('deflects ball upward when bouncing off paddle with English curve slice', () => {
      breaker.paddleX = 3;
      breaker.paddleWidth = 3;
      // Position ball falling directly onto right side of paddle at y=18.5
      breaker.balls = [{ x: 5.0, y: 18.5, dx: 0, dy: 8 }];

      breaker.update(0.016);

      const ball = breaker.balls[0];
      // dy must be inverted to negative (moving upward)
      expect(ball.dy).toBeLessThan(0);
      // dx should acquire rightward velocity due to hitting right edge of paddle
      expect(ball.dx).toBeGreaterThan(0);
      expect(mockSound.playBounce).toHaveBeenCalled();
    });

    it('destroys standard brick (hp=1) and bounces ball', () => {
      breaker.bricks[4][5] = 1; // Standard brick
      // Ball hits brick at (5, 4) moving upward
      breaker.balls = [{ x: 5, y: 4.1, dx: 0, dy: -8 }];

      breaker.update(0.016);

      // Brick should be destroyed (hp = 0)
      expect(breaker.bricks[4][5]).toBe(0);
      expect(breaker.balls[0].dy).toBeGreaterThan(0); // Bounced downward
      expect(breaker.score).toBeGreaterThan(0);
      expect(mockSound.playExplosion).toHaveBeenCalled();
    });

    it('degrades armored brick (hp=2 -> hp=1) on hit', () => {
      breaker.bricks[2][5] = 2; // Armored brick
      breaker.balls = [{ x: 5, y: 2.1, dx: 0, dy: -8 }];

      breaker.update(0.016);

      expect(breaker.bricks[2][5]).toBe(1); // Armor degraded to standard
      expect(breaker.balls[0].dy).toBeGreaterThan(0); // Bounced
      expect(mockSound.playBounce).toHaveBeenCalled();
    });

    it('decrements lives when ball falls through bottom gap', () => {
      const initialLives = breaker.lives;
      // Ball falls below screen
      breaker.balls = [{ x: 1, y: 20.5, dx: 0, dy: 8 }];
      breaker.paddleX = 5; // Paddle is away

      breaker.update(0.016);

      expect(breaker.lives).toBe(initialLives - 1);
      expect(mockSound.playExplosion).toHaveBeenCalled();
    });
  });

  describe('4. Matrix2048 (Grid Slide, Fusion & Quantum Undo)', () => {
    let puzzle;

    beforeEach(() => {
      puzzle = new Matrix2048();
      puzzle.init(mockContext);
    });

    it('initializes 4x4 grid with 2 starting tiles and difficulty-based undo charges', () => {
      expect(puzzle.grid.length).toBe(4);
      expect(puzzle.grid[0].length).toBe(4);
      expect(puzzle.undoCharges).toBe(1); // MEDIUM default

      let nonZeroCount = 0;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (puzzle.grid[r][c] > 0) nonZeroCount++;
        }
      }
      expect(nonZeroCount).toBe(2);
    });

    it('slides and merges adjacent matching numbers on LEFT move', () => {
      // Setup row 0 with [2, 2, 0, 4]
      puzzle.grid[0] = new Uint32Array([2, 2, 0, 4]);
      puzzle.grid[1] = new Uint32Array([0, 0, 0, 0]);
      puzzle.grid[2] = new Uint32Array([0, 0, 0, 0]);
      puzzle.grid[3] = new Uint32Array([0, 0, 0, 0]);

      const moved = puzzle.slide('LEFT');

      expect(moved).toBe(true);
      // [2, 2, 0, 4] merged should be [4, 4, 0, 0]
      expect(puzzle.grid[0][0]).toBe(4);
      expect(puzzle.grid[0][1]).toBe(4);
      expect(puzzle.grid[0][2]).toBe(0);
      expect(puzzle.grid[0][3]).toBe(0);
      expect(puzzle.score).toBeGreaterThan(0);
    });

    it('slides and merges numbers on UP move', () => {
      puzzle.grid[0] = new Uint32Array([4, 0, 0, 0]);
      puzzle.grid[1] = new Uint32Array([4, 0, 0, 0]);
      puzzle.grid[2] = new Uint32Array([8, 0, 0, 0]);
      puzzle.grid[3] = new Uint32Array([0, 0, 0, 0]);

      const moved = puzzle.slide('UP');

      expect(moved).toBe(true);
      // Column 0 had [4, 4, 8, 0] -> merges top two 4s into 8 -> [8, 8, 0, 0]
      expect(puzzle.grid[0][0]).toBe(8);
      expect(puzzle.grid[1][0]).toBe(8);
      expect(puzzle.grid[2][0]).toBe(0);
      expect(puzzle.grid[3][0]).toBe(0);
    });

    it('restores previous grid state when Quantum Undo (ACTION_B) is triggered', () => {
      puzzle.grid[0] = new Uint32Array([2, 0, 0, 0]);
      puzzle.grid[1] = new Uint32Array([0, 0, 0, 0]);
      puzzle.grid[2] = new Uint32Array([0, 0, 0, 0]);
      puzzle.grid[3] = new Uint32Array([0, 0, 0, 0]);

      const originalTile = puzzle.grid[0][0];

      // Perform a move
      mockInput.isJustPressed.mockImplementation((k) => k === 'RIGHT');
      puzzle.update(0.016);

      expect(puzzle.grid[0][0]).toBe(0); // Moved away from (0, 0)
      expect(puzzle.previousState).toBeDefined();

      // Trigger Undo via ACTION_B
      mockInput.isJustPressed.mockImplementation((k) => k === 'ACTION_B');
      puzzle.update(0.016);

      expect(puzzle.grid[0][0]).toBe(originalTile);
      expect(puzzle.undoCharges).toBe(0);
      expect(mockSound.playRotate).toHaveBeenCalled();
    });

    it('detects game over when grid is full and no adjacent merges remain', () => {
      // Full grid with alternating numbers (no merges possible)
      puzzle.grid = [
        new Uint32Array([2, 4, 2, 4]),
        new Uint32Array([4, 2, 4, 2]),
        new Uint32Array([2, 4, 2, 4]),
        new Uint32Array([4, 2, 4, 2])
      ];

      expect(puzzle.isGameOverState()).toBe(true);
    });
  });
});
