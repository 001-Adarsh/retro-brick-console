/**
 * Retro Brick Game Console - SoundSystem
 * 100% Procedural Web Audio API Sound Engine & Chiptune Synthesizer.
 * Zero external audio asset dependencies (.mp3, .wav).
 * 
 * Complies with browser autoplay policies, handles pause/resume lifecycles,
 * generates authentic 1989/1990s LCD handheld sound effects, and provides a
 * real-time procedural step-sequenced chiptune background music player.
 */

// Musical Note Frequency Table (Equal Temperament, A4 = 440Hz)
export const NOTES = {
  REST: 0,
  C3: 130.81, CS3: 138.59, D3: 146.83, DS3: 155.56, E3: 164.81, F3: 174.61, FS3: 185.00, G3: 196.00, GS3: 207.65, A3: 220.00, AS3: 233.08, B3: 246.94,
  C4: 261.63, CS4: 277.18, D4: 293.66, DS4: 311.13, E4: 329.63, F4: 349.23, FS4: 369.99, G4: 392.00, GS4: 415.30, A4: 440.00, AS4: 466.16, B4: 493.88,
  C5: 523.25, CS5: 554.37, D5: 587.33, DS5: 622.25, E5: 659.25, F5: 698.46, FS5: 739.99, G5: 783.99, GS5: 830.61, A5: 880.00, AS5: 932.33, B5: 987.77,
  C6: 1046.50, CS6: 1108.73, D6: 1174.66, DS6: 1244.51, E6: 1318.51, F6: 1396.91, FS6: 1479.98, G6: 1567.98, GS6: 1661.22, A6: 1760.00, AS6: 1864.66, B6: 1975.53
};

// Built-in authentic 8-bit procedural chiptune looping tracks
export const BGM_TRACKS = {
  anthem: {
    name: 'Brick Anthem',
    bpm: 144,
    steps: 32,
    lead: [
      NOTES.E5, NOTES.REST, NOTES.B4, NOTES.C5, NOTES.D5, NOTES.REST, NOTES.C5, NOTES.B4,
      NOTES.A4, NOTES.REST, NOTES.A4, NOTES.C5, NOTES.E5, NOTES.REST, NOTES.D5, NOTES.C5,
      NOTES.B4, NOTES.REST, NOTES.B4, NOTES.C5, NOTES.D5, NOTES.REST, NOTES.E5, NOTES.REST,
      NOTES.C5, NOTES.REST, NOTES.A4, NOTES.REST, NOTES.A4, NOTES.REST, NOTES.REST, NOTES.REST
    ],
    bass: [
      NOTES.A3, NOTES.REST, NOTES.E3, NOTES.REST, NOTES.A3, NOTES.REST, NOTES.E3, NOTES.REST,
      NOTES.A3, NOTES.REST, NOTES.E3, NOTES.REST, NOTES.A3, NOTES.REST, NOTES.E3, NOTES.REST,
      NOTES.G3, NOTES.REST, NOTES.D3, NOTES.REST, NOTES.G3, NOTES.REST, NOTES.D3, NOTES.REST,
      NOTES.A3, NOTES.REST, NOTES.E3, NOTES.REST, NOTES.A3, NOTES.REST, NOTES.REST, NOTES.REST
    ]
  },
  action: {
    name: 'Speed Racer',
    bpm: 160,
    steps: 32,
    lead: [
      NOTES.A4, NOTES.REST, NOTES.C5, NOTES.D5, NOTES.E5, NOTES.E5, NOTES.D5, NOTES.C5,
      NOTES.D5, NOTES.REST, NOTES.D5, NOTES.E5, NOTES.F5, NOTES.F5, NOTES.E5, NOTES.D5,
      NOTES.E5, NOTES.REST, NOTES.E5, NOTES.F5, NOTES.G5, NOTES.G5, NOTES.F5, NOTES.E5,
      NOTES.F5, NOTES.E5, NOTES.D5, NOTES.C5, NOTES.B4, NOTES.C5, NOTES.D5, NOTES.E5
    ],
    bass: [
      NOTES.A2, NOTES.A2, NOTES.E3, NOTES.A2, NOTES.A2, NOTES.A2, NOTES.E3, NOTES.A2,
      NOTES.D3, NOTES.D3, NOTES.A3, NOTES.D3, NOTES.D3, NOTES.D3, NOTES.A3, NOTES.D3,
      NOTES.E3, NOTES.E3, NOTES.B3, NOTES.E3, NOTES.E3, NOTES.E3, NOTES.B3, NOTES.E3,
      NOTES.A2, NOTES.A2, NOTES.E3, NOTES.A2, NOTES.A2, NOTES.A2, NOTES.E3, NOTES.A2
    ]
  },
  puzzle: {
    name: 'Mind Matrix',
    bpm: 116,
    steps: 32,
    lead: [
      NOTES.C5, NOTES.REST, NOTES.G4, NOTES.REST, NOTES.E4, NOTES.REST, NOTES.G4, NOTES.REST,
      NOTES.B4, NOTES.REST, NOTES.G4, NOTES.REST, NOTES.D4, NOTES.REST, NOTES.G4, NOTES.REST,
      NOTES.A4, NOTES.REST, NOTES.E4, NOTES.REST, NOTES.C4, NOTES.REST, NOTES.E4, NOTES.REST,
      NOTES.F4, NOTES.REST, NOTES.A4, NOTES.REST, NOTES.G4, NOTES.REST, NOTES.B4, NOTES.REST
    ],
    bass: [
      NOTES.C3, NOTES.REST, NOTES.REST, NOTES.REST, NOTES.G2, NOTES.REST, NOTES.REST, NOTES.REST,
      NOTES.A2, NOTES.REST, NOTES.REST, NOTES.REST, NOTES.F2, NOTES.REST, NOTES.REST, NOTES.REST,
      NOTES.C3, NOTES.REST, NOTES.REST, NOTES.REST, NOTES.G2, NOTES.REST, NOTES.REST, NOTES.REST,
      NOTES.F2, NOTES.REST, NOTES.G2, NOTES.REST, NOTES.C3, NOTES.REST, NOTES.REST, NOTES.REST
    ]
  },
  classic: {
    name: 'Vintage Title',
    bpm: 132,
    steps: 16,
    lead: [
      NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6,
      NOTES.B5, NOTES.G5, NOTES.E5, NOTES.D5,
      NOTES.C5, NOTES.E5, NOTES.A5, NOTES.C6,
      NOTES.G5, NOTES.E5, NOTES.C5, NOTES.REST
    ],
    bass: [
      NOTES.C3, NOTES.REST, NOTES.G3, NOTES.REST,
      NOTES.G3, NOTES.REST, NOTES.D3, NOTES.REST,
      NOTES.A3, NOTES.REST, NOTES.E3, NOTES.REST,
      NOTES.C3, NOTES.REST, NOTES.C3, NOTES.REST
    ]
  }
};

export class SoundSystem {
  /**
   * @param {Object} [storageManager=null] Optional persistence layer
   */
  constructor(storageManager = null) {
    this.storage = storageManager;
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;

    // Default configuration (0.0 to 1.0)
    this.volume = 0.8;
    this.muted = false;
    this.bgmVolume = 0.5;

    // Active voice tracking for zero memory leaks & instant stop
    this._activeVoices = new Set();
    this._scheduledBGMNodes = new Set();
    this._noiseBuffer = null;

    // BGM Sequencer state
    this.bgmTracks = BGM_TRACKS;
    this._bgmPlaying = false;
    this._bgmPaused = false;
    this._currentTrackName = 'anthem';
    this._currentStep = 0;
    this._nextNoteTime = 0;
    this._schedulerTimerId = null;

    // User interaction unlock listener state
    this._unlockHandler = null;
    this._isUnlocked = false;

    // Hydrate state from storage if available
    this._loadPersistedSettings();

    // Hook passive gesture listener for browser autoplay unlocking
    this._setupAutoplayUnlock();
  }

  /**
   * Initializes or binds external storage and unlocks the audio context.
   * @param {Object} [storageManager=null]
   * @returns {SoundSystem}
   */
  init(storageManager = null) {
    if (storageManager) {
      this.storage = storageManager;
      this._loadPersistedSettings();
    }
    this._ensureContext();
    return this;
  }

  /**
   * Ensures the Web Audio context and audio routing graph are instantiated.
   * Lazily initialized on demand to satisfy browser autoplay policies.
   * @private
   * @returns {AudioContext|null}
   */
  _ensureContext() {
    if (typeof window === 'undefined') {
      return null; // Non-browser / Node.js test environment
    }

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('[SoundSystem] Web Audio API is not supported in this environment.');
        return null;
      }

      try {
        this.ctx = new AudioCtx();
        this._setupAudioGraph();
      } catch (err) {
        console.warn('[SoundSystem] Failed to construct AudioContext:', err);
        return null;
      }
    }

    // Attempt context resume if currently suspended
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this._isUnlocked = true;
      }).catch(() => {
        // Ignored: will retry on the next genuine user interaction
      });
    }

    return this.ctx;
  }

  /**
   * Constructs the master gain and bus hierarchy.
   * [Oscillators / Noise] -> [SFX / BGM Gain] -> [Master Gain] -> [ctx.destination]
   * @private
   */
  _setupAudioGraph() {
    if (!this.ctx) return;

    // Master bus (controls overall volume and hard mute)
    this.masterGain = this.ctx.createGain();
    const targetGain = this.muted ? 0.0 : this.volume;
    this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // SFX sub-bus
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    // BGM sub-bus
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);
  }

  /**
   * Pre-generates or returns a cached 1-second white noise buffer for percussive
   * sound effects and explosions, avoiding repeated allocations.
   * @private
   * @returns {AudioBuffer|null}
   */
  _getNoiseBuffer() {
    if (this._noiseBuffer) return this._noiseBuffer;
    if (!this.ctx) return null;

    const sampleRate = this.ctx.sampleRate || 44100;
    const bufferSize = sampleRate; // 1 second of white noise
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this._noiseBuffer = buffer;
    return buffer;
  }

  /**
   * Registers passive DOM listeners to unlock the audio context on first user interaction.
   * @private
   */
  _setupAutoplayUnlock() {
    if (typeof window === 'undefined') return;

    const unlockEvents = ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown'];
    const unlock = () => {
      this.resume().then(() => {
        this._isUnlocked = true;
        unlockEvents.forEach(evt => window.removeEventListener(evt, unlock, true));
        this._unlockHandler = null;
      }).catch(() => {});
    };

    unlockEvents.forEach(evt => window.addEventListener(evt, unlock, { capture: true, once: false, passive: true }));
    this._unlockHandler = unlock;
    this._unlockEvents = unlockEvents;
  }

  /**
   * Resumes the AudioContext explicitly. Safe to invoke in response to button clicks.
   * @returns {Promise<void>}
   */
  async resume() {
    const ctx = this._ensureContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
      this._isUnlocked = true;
    }
  }

  /**
   * Suspends the AudioContext (useful when browser tab loses focus).
   * @returns {Promise<void>}
   */
  async suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      await this.ctx.suspend();
    }
  }

  // =========================================================================
  // Core Sound Effects Library
  // =========================================================================

  /**
   * Play Move: Short 15ms blip (square wave, ~440Hz -> 300Hz).
   * Low-latency acoustic tick for D-pad movements.
   */
  playMove() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.015;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + duration);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._registerVoice(osc, gain, now, duration);
  }

  /**
   * Play Rotate: Crisp 30ms chirp (square wave, ~600Hz -> 900Hz).
   * Upward frequency sweep indicating brick rotation or secondary move.
   */
  playRotate() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.030;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + duration);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._registerVoice(osc, gain, now, duration);
  }

  /**
   * Play Drop: 40ms percussive thud (triangle wave, ~150Hz -> 60Hz).
   * Low punchy frequency impact when a brick lands on the stack.
   */
  playDrop() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.040;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + duration);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._registerVoice(osc, gain, now, duration);
  }

  /**
   * Play Score: 80ms rising tone (~523Hz -> 659Hz).
   * Snappy two-tone arpeggio reward (C5 to E5) for cleared lines and point scores.
   */
  playScore() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.080;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + duration);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._registerVoice(osc, gain, now, duration);
  }

  /**
   * Play Level Up: 250ms fanfare arpeggio (C5 - E5 - G5 - C6).
   * 4-note staccato fanfare celebrating stage progress or level advancement.
   */
  playLevelUp() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0.000, d: 0.055 }, // C5
      { f: 659.25, t: 0.060, d: 0.055 }, // E5
      { f: 783.99, t: 0.120, d: 0.055 }, // G5
      { f: 1046.50, t: 0.180, d: 0.070 } // C6
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.0001, now + note.t);
      gain.gain.linearRampToValueAtTime(0.28, now + note.t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      this._registerVoice(osc, gain, now + note.t, note.d);
    }
  }

  /**
   * Play Game Over: 400ms descending sad slide (~400Hz -> 100Hz).
   * Melancholy glissando marking player demise or game terminal state.
   */
  playGameOver() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.400;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.setValueAtTime(0.28, now + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._registerVoice(osc, gain, now, duration);
  }

  /**
   * Play Shoot: 60ms laser frequency drop (~1200Hz -> 200Hz).
   * Authentic space laser/missile frequency drop for shooters and tanks.
   */
  playShoot() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.060;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._registerVoice(osc, gain, now, duration);
  }

  /**
   * Play Explosion: 200ms white noise burst with lowpass filter sweep (~1200Hz -> 80Hz).
   * Dynamic noise burst for alien detonations, crash impacts, and block breaks.
   */
  playExplosion() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const noiseBuffer = this._getNoiseBuffer();
    if (!noiseBuffer) return;

    const now = ctx.currentTime;
    const duration = 0.200;

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + duration);
    filter.Q.setValueAtTime(3.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.40, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    this._registerVoice(source, gain, now, duration);
  }

  /**
   * Play Bounce: 35ms harmonic blip (~880Hz).
   * Resonant blip for paddle ball deflections and wall bounces.
   */
  playBounce() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.035;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.015);
    osc.frequency.exponentialRampToValueAtTime(840, now + duration);

    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._registerVoice(osc, gain, now, duration);
  }

  /**
   * Play Victory: 500ms triumphant retro tune.
   * Multi-note triumphant retro jingle (G4-C5-E5-G5-C6) for stage clear / victory.
   */
  playVictory() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 392.00, t: 0.000, d: 0.065 }, // G4
      { f: 523.25, t: 0.070, d: 0.065 }, // C5
      { f: 659.25, t: 0.140, d: 0.065 }, // E5
      { f: 783.99, t: 0.210, d: 0.085 }, // G5
      { f: 1046.50, t: 0.310, d: 0.190 } // C6
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.0001, now + note.t);
      gain.gain.linearRampToValueAtTime(0.30, now + note.t + 0.003);
      gain.gain.setValueAtTime(0.30, now + note.t + note.d * 0.75);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      this._registerVoice(osc, gain, now + note.t, note.d);
    }
  }

  /**
   * Play Button Click: Tactile mechanical click.
   * Ultra-short dual-element transient reproducing a silicone membrane dome switch.
   */
  playButtonClick() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Transient pitch micro-chirp (8ms)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.008);

    oscGain.gain.setValueAtTime(0.14, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    this._registerVoice(osc, oscGain, now, 0.008);

    // 2. High-pass mechanical snap noise (6ms)
    const noiseBuffer = this._getNoiseBuffer();
    if (noiseBuffer) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2400, now);
      bandpass.Q.setValueAtTime(2.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.006);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      this._registerVoice(noiseSource, noiseGain, now, 0.006);
    }
  }

  /**
   * Play Pause: Subtle two-tone cue when pausing or unpausing gameplay.
   */
  playPause() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 600, t: 0.000, d: 0.035 },
      { f: 400, t: 0.040, d: 0.035 }
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.20, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      this._registerVoice(osc, gain, now + note.t, note.d);
    }
  }

  /**
   * Play Boot: Iconic ascending 3-note power-on chime.
   */
  playBoot() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 659.25, t: 0.000, d: 0.065 }, // E5
      { f: 830.61, t: 0.070, d: 0.065 }, // G#5
      { f: 987.77, t: 0.140, d: 0.140 }  // B5
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.0001, now + note.t);
      gain.gain.linearRampToValueAtTime(0.28, now + note.t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      this._registerVoice(osc, gain, now + note.t, note.d);
    }
  }

  /**
   * Synthesize a custom procedural tone.
   * @param {number} frequency Frequency in Hz
   * @param {number} durationSeconds Duration in seconds
   * @param {'square'|'triangle'|'sawtooth'|'sine'|'noise'} [type='square'] Oscillator waveform
   * @param {number} [gain=0.3] Peak gain (0.0 to 1.0)
   */
  playTone(frequency, durationSeconds, type = 'square', gain = 0.3) {
    if (this.muted || durationSeconds <= 0) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dur = Math.max(0.005, Number(durationSeconds) || 0.05);
    const targetGain = Math.max(0.0001, Math.min(1.0, Number(gain) || 0.3));

    if (type === 'noise') {
      const buffer = this._getNoiseBuffer();
      if (!buffer) return;
      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const g = ctx.createGain();
      g.gain.setValueAtTime(targetGain, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(g);
      g.connect(this.sfxGain);
      this._registerVoice(src, g, now, dur);
      return;
    }

    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = ['square', 'triangle', 'sawtooth', 'sine'].includes(type) ? type : 'square';
    osc.frequency.setValueAtTime(Math.max(20, frequency || 440), now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(targetGain, now + 0.003);
    g.gain.setValueAtTime(targetGain, now + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(g);
    g.connect(this.sfxGain);
    this._registerVoice(osc, g, now, dur);
  }

  /**
   * Helper that tracks scheduled sound nodes for clean garbage collection & immediate stops.
   * @private
   */
  _registerVoice(source, gainNode, startTime, duration) {
    const stopTime = startTime + duration;
    try {
      source.start(startTime);
      source.stop(stopTime);
    } catch (e) {
      return;
    }

    const voice = { source, gainNode };
    this._activeVoices.add(voice);

    source.onended = () => {
      try {
        source.disconnect();
        gainNode.disconnect();
      } catch (e) {}
      this._activeVoices.delete(voice);
    };
  }

  // =========================================================================
  // Procedural BGM Step Sequencer
  // =========================================================================

  /**
   * Starts playing a looping procedural chiptune background track.
   * @param {string} [trackName='anthem'] 'anthem' | 'action' | 'puzzle' | 'classic'
   */
  startBGM(trackName = 'anthem') {
    if (trackName && this.bgmTracks[trackName]) {
      this._currentTrackName = trackName;
    }

    this.stopBGM();

    const ctx = this._ensureContext();
    if (!ctx) return;

    this._bgmPlaying = true;
    this._bgmPaused = false;
    this._currentStep = 0;
    this._nextNoteTime = ctx.currentTime + 0.05;

    // High-precision lookahead scheduler running at 25ms interval
    this._schedulerTimerId = setInterval(() => {
      this._scheduleBGMNotes();
    }, 25);
  }

  /**
   * Lookahead audio scheduling tick for the active BGM pattern.
   * Ensures zero timer drift by scheduling Web Audio events ahead of time.
   * @private
   */
  _scheduleBGMNotes() {
    if (!this._bgmPlaying || this._bgmPaused || !this.ctx) return;

    const track = this.bgmTracks[this._currentTrackName] || this.bgmTracks.anthem;
    const stepDuration = 60 / (track.bpm * 4); // 16th note step
    const scheduleAheadTime = 0.12; // 120ms lookahead window

    while (this._nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      const step = this._currentStep;
      const noteTime = this._nextNoteTime;
      const leadNote = track.lead[step];
      const bassNote = track.bass ? track.bass[step] : 0;

      // Authentic retro staccato envelope (70% tone, 30% gap)
      if (leadNote > 0) {
        this._scheduleBGMVoice(leadNote, noteTime, stepDuration * 0.72, 'square', 0.22);
      }

      if (bassNote > 0) {
        this._scheduleBGMVoice(bassNote, noteTime, stepDuration * 0.85, 'triangle', 0.28);
      }

      this._nextNoteTime += stepDuration;
      this._currentStep = (this._currentStep + 1) % track.steps;
    }
  }

  /**
   * Schedules a single musical note on the BGM sub-bus.
   * @private
   */
  _scheduleBGMVoice(freq, startTime, duration, waveform, peakGain) {
    if (this.muted) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.003);
    gain.gain.setValueAtTime(peakGain, startTime + duration * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);

    const voice = { osc, gain };
    this._scheduledBGMNodes.add(voice);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (e) {}
      this._scheduledBGMNodes.delete(voice);
    };
  }

  /**
   * Stops BGM playback and resets sequence position.
   */
  stopBGM() {
    this._bgmPlaying = false;
    this._bgmPaused = false;
    this._currentStep = 0;

    if (this._schedulerTimerId) {
      clearInterval(this._schedulerTimerId);
      this._schedulerTimerId = null;
    }

    for (const voice of this._scheduledBGMNodes) {
      try {
        voice.osc.stop();
        voice.osc.disconnect();
        voice.gain.disconnect();
      } catch (e) {}
    }
    this._scheduledBGMNodes.clear();
  }

  /**
   * Temporarily pauses BGM playback without resetting current step.
   */
  pauseBGM() {
    if (!this._bgmPlaying || this._bgmPaused) return;
    this._bgmPaused = true;

    if (this._schedulerTimerId) {
      clearInterval(this._schedulerTimerId);
      this._schedulerTimerId = null;
    }

    for (const voice of this._scheduledBGMNodes) {
      try {
        voice.osc.stop();
        voice.osc.disconnect();
        voice.gain.disconnect();
      } catch (e) {}
    }
    this._scheduledBGMNodes.clear();
  }

  /**
   * Resumes BGM playback from paused position.
   */
  resumeBGM() {
    if (!this._bgmPlaying || !this._bgmPaused) return;
    this._bgmPaused = false;

    const ctx = this._ensureContext();
    if (!ctx) return;

    this._nextNoteTime = ctx.currentTime + 0.05;
    this._schedulerTimerId = setInterval(() => {
      this._scheduleBGMNotes();
    }, 25);
  }

  /**
   * Toggles BGM playback on or off.
   * @returns {boolean} True if BGM is now playing
   */
  toggleBGM() {
    if (this.isBGMPlaying()) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM(this._currentTrackName);
      return true;
    }
  }

  /**
   * Checks whether BGM is actively playing and not paused.
   * @returns {boolean}
   */
  isBGMPlaying() {
    return this._bgmPlaying && !this._bgmPaused;
  }

  /**
   * Changes the active BGM track.
   * @param {string} trackName 
   */
  setBGMTrack(trackName) {
    if (this.bgmTracks[trackName]) {
      this._currentTrackName = trackName;
      if (this.isBGMPlaying()) {
        this.startBGM(trackName);
      }
    }
  }

  /**
   * Returns the key of the current BGM track.
   * @returns {string}
   */
  getCurrentBGMTrack() {
    return this._currentTrackName;
  }

  /**
   * Sets the BGM volume level (0.0 to 1.0).
   * @param {number} volume 
   */
  setBGMVolume(volume) {
    const clamped = Math.max(0, Math.min(1, Number(volume) || 0));
    this.bgmVolume = clamped;
    if (this.bgmGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
      this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, now + 0.02);
    }
  }

  /**
   * Returns current BGM volume.
   * @returns {number}
   */
  getBGMVolume() {
    return this.bgmVolume;
  }

  // =========================================================================
  // Master Volume & Mute Management
  // =========================================================================

  /**
   * Sets master console volume (0.0 to 1.0) and persists the preference.
   * Applies smooth anti-pop crossfade.
   * @param {number} volume 
   */
  setVolume(volume) {
    const clamped = Math.max(0, Math.min(1, Number(volume) || 0));
    this.volume = clamped;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const targetGain = this.muted ? 0.0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.02);
    }

    this._persistSettings();
  }

  /**
   * Returns master volume level (0.0 to 1.0).
   * @returns {number}
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Toggles sound muting state and persists the change.
   * @returns {boolean} True if muted, false if unmuted
   */
  toggleMute() {
    this.muted = !this.muted;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const targetGain = this.muted ? 0.0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.02);
    }

    this._persistSettings();
    return this.muted;
  }

  /**
   * Explicitly mutes audio.
   */
  mute() {
    if (!this.muted) {
      this.toggleMute();
    }
  }

  /**
   * Explicitly unmutes audio.
   */
  unmute() {
    if (this.muted) {
      this.toggleMute();
    }
  }

  /**
   * Checks whether console sound is currently muted.
   * @returns {boolean}
   */
  isMuted() {
    return this.muted;
  }

  /**
   * Stops all active sound effects and BGM immediately.
   */
  stopAll() {
    for (const voice of this._activeVoices) {
      try {
        voice.source.stop();
        voice.source.disconnect();
        voice.gainNode.disconnect();
      } catch (e) {}
    }
    this._activeVoices.clear();
    this.stopBGM();
  }

  // =========================================================================
  // Persistence Helpers
  // =========================================================================

  /**
   * Loads saved volume and mute states from StorageManager or window.localStorage.
   * @private
   */
  _loadPersistedSettings() {
    try {
      if (this.storage && typeof this.storage.getSettings === 'function') {
        const settings = this.storage.getSettings();
        if (typeof settings.volume === 'number' && !isNaN(settings.volume)) {
          this.volume = Math.max(0, Math.min(1, settings.volume));
        }
        if (typeof settings.soundMuted === 'boolean') {
          this.muted = settings.soundMuted;
        }
        return;
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        const savedVol = window.localStorage.getItem('RETRO_BRICK_SOUND_VOLUME');
        if (savedVol !== null) {
          const num = parseFloat(savedVol);
          if (!isNaN(num)) this.volume = Math.max(0, Math.min(1, num));
        }
        const savedMute = window.localStorage.getItem('RETRO_BRICK_SOUND_MUTED');
        if (savedMute !== null) {
          this.muted = savedMute === 'true';
        }
      }
    } catch (e) {
      // Storage unavailable or blocked
    }
  }

  /**
   * Persists current volume and mute state defensively.
   * @private
   */
  _persistSettings() {
    try {
      if (this.storage && typeof this.storage.saveSettings === 'function') {
        this.storage.saveSettings({
          volume: this.volume,
          soundMuted: this.muted
        });
        return;
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('RETRO_BRICK_SOUND_VOLUME', this.volume.toString());
        window.localStorage.setItem('RETRO_BRICK_SOUND_MUTED', this.muted.toString());
      }
    } catch (e) {
      // Storage save error ignored
    }
  }

  // =========================================================================
  // Cleanup & Teardown
  // =========================================================================

  /**
   * Cleanly disposes the audio system, cancels timers, disconnects nodes,
   * closes the AudioContext, and removes window gesture listeners.
   */
  dispose() {
    this.stopAll();

    // Remove window interaction listener if still registered
    if (this._unlockHandler && this._unlockEvents && typeof window !== 'undefined') {
      this._unlockEvents.forEach(evt => {
        window.removeEventListener(evt, this._unlockHandler, true);
      });
      this._unlockHandler = null;
    }

    // Disconnect master sub-buses
    try {
      if (this.sfxGain) this.sfxGain.disconnect();
      if (this.bgmGain) this.bgmGain.disconnect();
      if (this.masterGain) this.masterGain.disconnect();
    } catch (e) {}

    // Close AudioContext
    if (this.ctx) {
      try {
        if (typeof this.ctx.close === 'function' && this.ctx.state !== 'closed') {
          this.ctx.close();
        }
      } catch (e) {}
      this.ctx = null;
    }

    this._noiseBuffer = null;
    this.storage = null;
  }

  /**
   * Alias for dispose() adhering to standard engine lifecycle conventions.
   */
  destroy() {
    this.dispose();
  }
}

// Singleton helper pattern
let defaultInstance = null;

/**
 * Retrieves the global SoundSystem singleton instance.
 * @param {Object} [storageManager=null]
 * @returns {SoundSystem}
 */
export function getSoundSystem(storageManager = null) {
  if (!defaultInstance) {
    defaultInstance = new SoundSystem(storageManager);
  } else if (storageManager && !defaultInstance.storage) {
    defaultInstance.init(storageManager);
  }
  return defaultInstance;
}

export const soundSystem = getSoundSystem();

export default SoundSystem;
