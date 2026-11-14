/**
 * Comprehensive Unit & Integration Tests for Duo Mode (2-Player / Multiplayer)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputController, InputActions } from '../src/js/ui/InputController.js';
import { Engine } from '../src/js/core/Engine.js';
import { StorageManager } from '../src/js/core/StorageManager.js';
import { BounceDuel } from '../src/js/games/BounceDuel.js';
import { GridTactics } from '../src/js/games/GridTactics.js';
import { FourInLine } from '../src/js/games/FourInLine.js';
import { ReflexRush } from '../src/js/games/ReflexRush.js';

describe('Duo Mode (2-Player Local Multiplayer)', () => {
  let input;

  beforeEach(() => {
    input = new InputController();
  });

  describe('InputController Duo Separation (P1 vs P2)', () => {
    it('dispatches P1 actions for WASD keys while maintaining generic actions', () => {
      // KeyW -> UP and P1_UP
      input._handleKeyDown({ code: 'KeyW', key: 'w' });
      expect(input.isDown(InputActions.UP)).toBe(true);
      expect(input.isDown(InputActions.P1_UP)).toBe(true);
      expect(input.isDown(InputActions.P2_UP)).toBe(false);
      expect(input.p1.isDown('UP')).toBe(true);
      expect(input.p2.isDown('UP')).toBe(false);

      input._handleKeyUp({ code: 'KeyW', key: 'w' });
      expect(input.isDown(InputActions.P1_UP)).toBe(false);
    });

    it('dispatches P2 actions for Arrow keys while maintaining generic actions', () => {
      // ArrowUp -> UP and P2_UP
      input._handleKeyDown({ code: 'ArrowUp', key: 'ArrowUp' });
      expect(input.isDown(InputActions.UP)).toBe(true);
      expect(input.isDown(InputActions.P2_UP)).toBe(true);
      expect(input.isDown(InputActions.P1_UP)).toBe(false);
      expect(input.p2.isDown('UP')).toBe(true);
      expect(input.p1.isDown('P1_UP')).toBe(false);

      input._handleKeyUp({ code: 'ArrowUp', key: 'ArrowUp' });
      expect(input.isDown(InputActions.P2_UP)).toBe(false);
    });

    it('separates Action A & B buttons between Player 1 and Player 2', () => {
      // Player 1 presses Space (Action A)
      input._handleKeyDown({ code: 'Space', key: ' ' });
      expect(input.p1.isDown('ACTION_A')).toBe(true);
      expect(input.p2.isDown('ACTION_A')).toBe(false);
      input._handleKeyUp({ code: 'Space', key: ' ' });

      // Player 2 presses Enter (Action A for P2)
      input._handleKeyDown({ code: 'Enter', key: 'Enter' });
      expect(input.p2.isDown('ACTION_A')).toBe(true);
      input._handleKeyUp({ code: 'Enter', key: 'Enter' });
    });
  });

  describe('Engine Duo Mode Lifecycle', () => {
    it('initializes in Solo mode by default and allows toggling Duo mode', () => {
      const storage = new StorageManager();
      const engine = new Engine({ storage });

      expect(engine.isDuo()).toBe(false);
      expect(engine.getContext().isDuoMode).toBe(false);
      expect(engine.getContext().playerCount).toBe(1);

      engine.setDuoMode(true);
      expect(engine.isDuo()).toBe(true);
      expect(engine.getContext().isDuoMode).toBe(true);
      expect(engine.getContext().playerCount).toBe(2);

      engine.setDuoMode(false);
      expect(engine.isDuo()).toBe(false);
    });
  });

  describe('BounceDuel in 2-Player Duo Mode', () => {
    let game;
    let mockContext;
    let onDuoScore;
    let onDuoGameOver;

    beforeEach(() => {
      game = new BounceDuel();
      onDuoScore = vi.fn();
      onDuoGameOver = vi.fn();

      mockContext = {
        input,
        sound: {
          playBounce: vi.fn(),
          playScore: vi.fn(),
          playVictory: vi.fn(),
          playExplosion: vi.fn(),
          playRotate: vi.fn(),
        },
        storage: new StorageManager(),
        difficulty: 'MEDIUM',
        isDuoMode: true,
        playerCount: 2,
        onScore: vi.fn(),
        onGameOver: vi.fn(),
        onDuoScore,
        onDuoGameOver,
      };

      game.init(mockContext);
    });

    it('enables human control for both paddles (P1 bottom, P2 top) without AI movement', () => {
      const initialP1X = game.playerX;
      const initialP2X = game.aiX;

      // Player 1 presses W-A-S-D: KeyA (Left)
      input._handleKeyDown({ code: 'KeyA', key: 'a' });
      game.update(0.016);
      input._handleKeyUp({ code: 'KeyA', key: 'a' });

      expect(game.playerX).toBe(initialP1X - 1);
      expect(game.aiX).toBe(initialP2X); // P2 paddle should not have moved yet

      // Player 2 presses ArrowRight
      input._handleKeyDown({ code: 'ArrowRight', key: 'ArrowRight' });
      game.update(0.016);
      input._handleKeyUp({ code: 'ArrowRight', key: 'ArrowRight' });

      expect(game.aiX).toBe(initialP2X + 1);
    });

    it('dispatches onDuoScore and onDuoGameOver when goals are scored in Duo Mode', () => {
      // Force ball past top boundary (Player 1 scores!)
      game.ball.y = 0.3;
      game.ball.dy = -5;
      game.aiX = 0; // AI/P2 paddle is away
      game.targetGoals = 2;
      game.playerScore = 1;

      game.update(0.016);

      expect(game.playerScore).toBe(2);
      expect(onDuoScore).toHaveBeenCalledWith(2, 0);
      expect(onDuoGameOver).toHaveBeenCalledWith('PLAYER 1', 2, 0);
      expect(game.isOver).toBe(true);
    });
  });

  describe('GridTactics in 2-Player Duo Mode (Tic-Tac-Toe)', () => {
    let game;
    let mockContext;
    let onDuoScore;

    beforeEach(() => {
      game = new GridTactics();
      onDuoScore = vi.fn();
      mockContext = {
        input,
        sound: {
          playMove: vi.fn(),
          playScore: vi.fn(),
          playLevelUp: vi.fn(),
          playBounce: vi.fn(),
          playVictory: vi.fn(),
          playGameOver: vi.fn(),
        },
        difficulty: 'EASY', // 3x3 board
        isDuoMode: true,
        playerCount: 2,
        onScore: vi.fn(),
        onLevelUp: vi.fn(),
        onDuoScore,
      };
      game.init(mockContext);
    });

    it('alternates turns between Player 1 (Token 1) and Player 2 (Token 2)', () => {
      expect(game.currentTurn).toBe(1);

      // Player 1 places at cursor (1, 1)
      game.cursor = { x: 0, y: 0 };
      input._handleKeyDown({ code: 'Space', key: ' ' });
      game.update(0.016);
      input._handleKeyUp({ code: 'Space', key: ' ' });

      expect(game.board[0][0]).toBe(1);
      expect(game.currentTurn).toBe(2);

      // Player 2 places at cursor (1, 1)
      game.cursor = { x: 1, y: 1 };
      input._handleKeyDown({ code: 'Enter', key: 'Enter' });
      game.update(0.016);
      input._handleKeyUp({ code: 'Enter', key: 'Enter' });

      expect(game.board[1][1]).toBe(2);
      expect(game.currentTurn).toBe(1);
    });
  });

  describe('ReflexRush in 2-Player Duo Mode (Quick-Draw Duel)', () => {
    let game;
    let mockContext;
    let onDuoScore;
    let onDuoGameOver;

    beforeEach(() => {
      game = new ReflexRush();
      onDuoScore = vi.fn();
      onDuoGameOver = vi.fn();

      mockContext = {
        input,
        sound: {
          playTone: vi.fn(),
          playScore: vi.fn(),
          playExplosion: vi.fn(),
          playVictory: vi.fn(),
          playMove: vi.fn(),
        },
        difficulty: 'MEDIUM',
        isDuoMode: true,
        playerCount: 2,
        onScore: vi.fn(),
        onDuoScore,
        onDuoGameOver,
      };

      game.init(mockContext);
    });

    it('awards point to Player 1 when P1 buzzes first on active directive', () => {
      game.currentPrompt = { type: 'A', targetCount: 1 };
      game.state = 'ACTIVE';

      // Player 1 buzzes in (Space)
      input._handleKeyDown({ code: 'Space', key: ' ' });
      game.update(0.016);
      input._handleKeyUp({ code: 'Space', key: ' ' });

      expect(game.p1Score).toBe(1);
      expect(game.p2Score).toBe(0);
      expect(game.duoWinner).toBe('P1');
      expect(onDuoScore).toHaveBeenCalledWith(1, 0);
    });

    it('awards point to Player 2 when P2 buzzes first on active directive', () => {
      game.currentPrompt = { type: 'A', targetCount: 1 };
      game.state = 'ACTIVE';

      // Player 2 buzzes in (Enter)
      input._handleKeyDown({ code: 'Enter', key: 'Enter' });
      game.update(0.016);
      input._handleKeyUp({ code: 'Enter', key: 'Enter' });

      expect(game.p2Score).toBe(1);
      expect(game.p1Score).toBe(0);
      expect(game.duoWinner).toBe('P2');
      expect(onDuoScore).toHaveBeenCalledWith(0, 1);
    });
  });
});
