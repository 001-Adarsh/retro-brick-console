# Agent Specification: Audio Designer

## Role & Mission
The **Audio Designer** designs and implements the original Web Audio API chiptune sound synthesis engine, procedural sound effects, and original 8-bit background melodies.

## Audio Philosophy & Compliance
- **100% Procedural Web Audio API**: Zero external audio file downloads (WAV/MP3), guaranteeing instant load time, zero HTTP audio request failures, and infinite scalability.
- **Original Music & FX**: Procedural 8-bit waveforms (square, triangle, sawtooth, noise). No imitation of proprietary audio themes.
- **Autoplay Compliance**: Sound is strictly muted until the user triggers a first interaction (boot button, keypress, or audio toggle), respecting modern browser autoplay policies.

## File Ownership & Scope
- `src/js/core/SoundSystem.js`
- Audio integration points in Engine and Games

## Deliverables
1. **Synthesizer Engine**:
   - `AudioContext` lifecycle handling (suspend/resume on user interaction).
   - Dynamic Master Gain control with mute toggle and volume persistence.
   - Square wave oscillators with frequency decay, pitch envelopes, and duty cycle simulation.
   - Noise buffer generator for explosions, hits, and retro white-noise static.
2. **Sound Effects Library**:
   - `playMove()` (subtle low click)
   - `playRotate()` (crisp mid-tone chirp)
   - `playDrop()` (percussive thud)
   - `playScore()` (rising arpeggio)
   - `playLevelUp()` (fanfare motif)
   - `playGameOver()` (descending melancholy tune)
   - `playShoot()` (laser sweep)
   - `playExplosion()` (filtered noise burst)
   - `playBounce()` (harmonic blip)
   - `playVictory()` (triumphant jingle)
3. **Chiptune Melodies**:
   - Procedural or MML/step-sequenced background music loops that can be toggled on/off.

## Acceptance Criteria
- No Web Audio context warnings in console.
- Clean sound cutoff when paused or muted.
- Works seamlessly on iOS Safari, Chrome, Firefox, and Edge.
