import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Engine, EngineState, FIXED_DT, MAX_FRAME_TIME } from '../../src/js/core/Engine.js';
import { StorageManager } from '../../src/js/core/StorageManager.js';
import { createMockRenderer, createMockSound, createMockInput } from '../fixtures/game-fixtures.js';

describe('Engine Game Loop & Timestep', () => {
  let engine;

  beforeEach(() => {
    engine = new Engine({
      renderer: createMockRenderer(),
      sound: createMockSound(),
      input: createMockInput(),
      storage: new StorageManager(),
    });

    engine.loadGame('brick-stacker');
  });

  afterEach(() => {
    if (engine) engine.stop();
  });

  it('runs fixed-timestep updates based on accumulator', () => {
    expect(engine.state).toBe(EngineState.RUNNING);

    const updateSpy = vi.spyOn(engine.activeGame, 'update');
    engine.lastTime = 1000;

    // Simulate 34ms elapsed (~2 frames at 60Hz: 16.67ms each)
    engine._loop(1034);

    expect(updateSpy).toHaveBeenCalledTimes(2);
  });

  it('clamps large delta time spikes to prevent spiral of death', () => {
    const updateSpy = vi.spyOn(engine.activeGame, 'update');
    engine.lastTime = 1000;

    // Simulate huge delta (e.g., 5000ms tab freeze)
    engine._loop(6000);

    // Clamped by MAX_FRAME_TIME (0.1s = 6 updates at 60Hz)
    expect(updateSpy.mock.calls.length).toBeLessThanOrEqual(7);
  });

  it('does not update game logic when paused', () => {
    engine.pause();
    expect(engine.state).toBe(EngineState.PAUSED);

    const updateSpy = vi.spyOn(engine.activeGame, 'update');
    engine.lastTime = 1000;

    engine._loop(1050);

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('cancels animation frame cleanly on stop', () => {
    engine.start();
    expect(engine.rafId).not.toBeNull();

    engine.stop();
    expect(engine.rafId).toBeNull();
  });
});
