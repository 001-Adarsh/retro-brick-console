import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SoundSystem } from '../../src/js/core/SoundSystem.js';

describe('SoundSystem Unit & Audio Tests', () => {
  let sound;
  let mockAudioContext;
  let mockMasterGain;

  beforeEach(() => {
    mockMasterGain = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
      },
    };

    mockAudioContext = {
      currentTime: 10,
      state: 'running',
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        gain: {
          value: 1,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          cancelScheduledValues: vi.fn(),
        },
      })),
      createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        type: 'square',
        frequency: {
          value: 440,
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      })),
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(1024)),
      })),
      createBufferSource: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        buffer: null,
      })),
      createBiquadFilter: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        type: 'lowpass',
        Q: {
          value: 3,
          setValueAtTime: vi.fn(),
        },
        frequency: {
          value: 1000,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      })),
      destination: {},
      resume: vi.fn().mockResolvedValue(),
    };

    globalThis.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      AudioContext: vi.fn(() => mockAudioContext),
      webkitAudioContext: vi.fn(() => mockAudioContext),
    };

    sound = new SoundSystem();
  });

  afterEach(() => {
    if (sound) sound.destroy();
  });

  it('initializes with default volume and unmuted state', () => {
    expect(sound.volume).toBe(0.8);
    expect(sound.isMuted()).toBe(false);
  });

  it('updates volume cleanly and clamps between 0 and 1', () => {
    sound.setVolume(0.5);
    expect(sound.getVolume()).toBe(0.5);

    sound.setVolume(1.5);
    expect(sound.getVolume()).toBe(1.0);

    sound.setVolume(-0.2);
    expect(sound.getVolume()).toBe(0.0);
  });

  it('toggles mute state and updates gain', () => {
    sound.mute();
    expect(sound.isMuted()).toBe(true);

    sound.unmute();
    expect(sound.isMuted()).toBe(false);

    sound.toggleMute();
    expect(sound.isMuted()).toBe(true);
  });

  it('plays procedural sound effects without throwing exceptions', () => {
    expect(() => sound.playMove()).not.toThrow();
    expect(() => sound.playRotate()).not.toThrow();
    expect(() => sound.playDrop()).not.toThrow();
    expect(() => sound.playScore()).not.toThrow();
    expect(() => sound.playGameOver()).not.toThrow();
    expect(() => sound.playExplosion()).not.toThrow();
  });

  it('suppresses audio output when muted', () => {
    sound.mute();
    const oscSpy = vi.spyOn(mockAudioContext, 'createOscillator');
    sound.playMove();
    expect(oscSpy).not.toHaveBeenCalled();
  });
});
