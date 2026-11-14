/**
 * Verification test for SoundSystem.js in Vitest with Web Audio API mock
 */
import { describe, it, expect, beforeEach } from 'vitest';
import SoundSystem, { soundSystem, getSoundSystem, NOTES, BGM_TRACKS } from '../src/js/core/SoundSystem.js';
import { StorageManager } from '../src/js/core/StorageManager.js';

class MockAudioParam {
  setValueAtTime() { return this; }
  linearRampToValueAtTime() { return this; }
  exponentialRampToValueAtTime() { return this; }
}

class MockAudioNode {
  connect() {}
  disconnect() {}
}

class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam();
}

class MockOscillatorNode extends MockAudioNode {
  frequency = new MockAudioParam();
  start() {}
  stop() {}
}

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  destination = new MockAudioNode();
  createGain() { return new MockGainNode(); }
  createOscillator() { return new MockOscillatorNode(); }
  createBuffer() {
    return {
      getChannelData: () => new Float32Array(44100)
    };
  }
  createBufferSource() {
    return {
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createBiquadFilter() {
    return {
      connect: () => {},
      disconnect: () => {},
      frequency: new MockAudioParam(),
      Q: new MockAudioParam(),
      type: 'lowpass'
    };
  }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
}

describe('SoundSystem', () => {
  beforeEach(() => {
    globalThis.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      AudioContext: MockAudioContext,
      webkitAudioContext: MockAudioContext
    };
    globalThis.AudioContext = MockAudioContext;
    globalThis.webkitAudioContext = MockAudioContext;
  });

  it('exports valid classes, singletons, and note tables', () => {
    expect(SoundSystem).toBeDefined();
    expect(soundSystem).toBeDefined();
    expect(typeof getSoundSystem).toBe('function');
    expect(NOTES.A4).toBe(440);
    expect(BGM_TRACKS.anthem).toBeDefined();
    expect(BGM_TRACKS.action).toBeDefined();
    expect(BGM_TRACKS.puzzle).toBeDefined();
    expect(BGM_TRACKS.classic).toBeDefined();
  });

  it('integrates with StorageManager for volume and mute state', () => {
    const storage = new StorageManager();
    const instance = new SoundSystem(storage);
    expect(instance.getVolume()).toBe(0.8);
    expect(instance.isMuted()).toBe(false);

    instance.setVolume(0.5);
    expect(instance.getVolume()).toBe(0.5);
    expect(storage.getSettings().volume).toBe(0.5);

    const muted = instance.toggleMute();
    expect(muted).toBe(true);
    expect(instance.isMuted()).toBe(true);
    expect(storage.getSettings().soundMuted).toBe(true);

    instance.unmute();
    expect(instance.isMuted()).toBe(false);
    expect(storage.getSettings().soundMuted).toBe(false);
  });

  it('safely handles all SFX invocations in mocked audio environment', () => {
    const storage = new StorageManager();
    const instance = new SoundSystem(storage);

    expect(() => {
      instance.playMove();
      instance.playRotate();
      instance.playDrop();
      instance.playScore();
      instance.playLevelUp();
      instance.playGameOver();
      instance.playShoot();
      instance.playExplosion();
      instance.playBounce();
      instance.playVictory();
      instance.playButtonClick();
      instance.playPause();
      instance.playBoot();
      instance.playTone(440, 0.05, 'square', 0.1);
    }).not.toThrow();
  });

  it('manages BGM lifecycle cleanly', () => {
    const storage = new StorageManager();
    const instance = new SoundSystem(storage);

    instance.startBGM('anthem');
    expect(instance.isBGMPlaying()).toBe(true);

    instance.pauseBGM();
    expect(instance.isBGMPlaying()).toBe(false);

    instance.resumeBGM();
    expect(instance.isBGMPlaying()).toBe(true);

    instance.stopBGM();
    expect(instance.isBGMPlaying()).toBe(false);

    instance.toggleBGM('action');
    expect(instance.isBGMPlaying()).toBe(true);

    instance.toggleBGM();
    expect(instance.isBGMPlaying()).toBe(false);
  });

  it('cleans up via dispose/destroy', () => {
    const storage = new StorageManager();
    const instance = new SoundSystem(storage);
    expect(() => instance.dispose()).not.toThrow();
  });
});
