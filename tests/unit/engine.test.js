import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Engine, EngineState } from '../../src/js/core/Engine.js';
import { StorageManager } from '../../src/js/core/StorageManager.js';
import { createMockRenderer, createMockSound, createMockInput } from '../fixtures/game-fixtures.js';

describe('Engine Core Unit Tests', () => {
  let engine;
  let renderer;
  let sound;
  let input;
  let storage;

  beforeEach(() => {
    renderer = createMockRenderer();
    sound = createMockSound();
    input = createMockInput();
    storage = new StorageManager();

    engine = new Engine({
      renderer,
      sound,
      input,
      storage,
    });
  });

  it('initializes with default state', () => {
    expect(engine.state).toBe(EngineState.IDLE);
    expect(engine.activeGame).toBeNull();
    expect(engine.isDuoMode).toBe(false);
    expect(engine.isDuo()).toBe(false);
  });

  it('loads a game by ID and initializes its context', () => {
    const success = engine.loadGame('brick-stacker');

    expect(success).toBe(true);
    expect(engine.activeGame).toBeDefined();
    expect(engine.activeGameId).toBe('brick-stacker');
    expect(engine.state).toBe(EngineState.RUNNING);

    const ctx = engine.getContext();
    expect(ctx.isDuoMode).toBe(false);
    expect(ctx.playerCount).toBe(1);
  });

  it('supports toggling duo mode', () => {
    engine.setDuoMode(true);
    expect(engine.isDuoMode).toBe(true);
    expect(engine.isDuo()).toBe(true);
    expect(engine.getContext().playerCount).toBe(2);

    engine.setDuoMode(false);
    expect(engine.isDuoMode).toBe(false);
    expect(engine.isDuo()).toBe(false);
    expect(engine.getContext().playerCount).toBe(1);
  });

  it('handles pause and resume without state corruption', () => {
    engine.loadGame('brick-stacker');
    expect(engine.state).toBe(EngineState.RUNNING);

    engine.pause();
    expect(engine.state).toBe(EngineState.PAUSED);

    engine.resume();
    expect(engine.state).toBe(EngineState.RUNNING);

    engine.unloadGame();
    expect(engine.state).toBe(EngineState.IDLE);
  });

  it('handles restart by resetting the current game', () => {
    engine.loadGame('brick-stacker');
    const resetSpy = vi.spyOn(engine.activeGame, 'reset');

    engine.restart();
    expect(resetSpy).toHaveBeenCalledTimes(1);
  });

  it('cleans up previous game when loading a new game', () => {
    engine.loadGame('brick-stacker');
    const firstGame = engine.activeGame;
    const destroySpy = vi.spyOn(firstGame, 'destroy');

    engine.loadGame('turbo-highway');
    expect(destroySpy).toHaveBeenCalledTimes(1);
    expect(engine.activeGameId).toBe('turbo-highway');
  });
});
