/**
 * Retro Brick Game Console - Application Entry Point
 * Wires together Engine, SoundSystem, StorageManager, GameRegistry,
 * InputController, HUD, ModalManager, and ScreenManager.
 */

import { InputController, InputActions } from './ui/InputController.js';
import { HUD } from './ui/HUD.js';
import { ModalManager } from './ui/ModalManager.js';
import { ScreenManager, ScreenState } from './ui/ScreenManager.js';
import { Engine } from './core/Engine.js';
import { StorageManager } from './core/StorageManager.js';
import { SoundSystem } from './core/SoundSystem.js';
import { GameRegistry } from './core/GameRegistry.js';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Storage & Audio Foundation
  const storage = new StorageManager();
  const sound = new SoundSystem(storage);

  // 2. Input Pipeline
  const input = new InputController();
  input.attach();
  input.bindAllDataActions();

  // 3. LCD HUD Telemetry
  const hud = new HUD();
  const initialSettings = storage.getSettings();
  hud.setMuted(!!initialSettings.soundMuted);

  // 4. Accessible Modal Overlays
  const modalManager = new ModalManager();

  // 5. Canvases for Virtual Dot-Matrix Display
  const primaryCanvas = document.getElementById('main-canvas');
  const subCanvas = document.getElementById('submatrix-canvas');

  // 6. Game Engine Loop (60Hz fixed tick)
  const engine = new Engine({
    canvas: primaryCanvas,
    subCanvas: subCanvas,
    input,
    sound,
    storage,
    hud,
    callbacks: {
      onScore: (score) => {
        hud.updateScore(score);
        if (engine.activeGameId) {
          const currentHi = storage.getHighScore(engine.activeGameId);
          if (score > currentHi) {
            hud.updateHighScore(score);
          }
        }
      },
      onLevelUp: (level) => {
        hud.updateLevel(level);
        hud.updateSpeed(Math.min(10, level));
      },
      onLivesChange: (lives) => {
        hud.updateLives(lives);
      },
      onGameOver: (finalScore) => {
        const gameId = engine.activeGameId;
        if (gameId) {
          storage.setHighScore(gameId, finalScore);
        }
        screenManager.transitionTo(ScreenState.GAMEOVER, {
          score: finalScore,
          level: hud.level,
        });
      },
    },
  });

  // 7. Console State Machine
  const screenManager = new ScreenManager({
    input,
    hud,
    modalManager,
    engine,
  });

  // Game launch handler
  screenManager.onGameSelected = (game) => {
    sound.playButtonClick();
    hud.reset();
    const hi = storage.getHighScore(game.id);
    hud.updateHighScore(hi);

    engine.loadGame(game.id);
    engine.start();
    hud.announce(`Launched ${game.title}`);
  };

  // Game restart handler
  screenManager.onGameRestart = () => {
    sound.playButtonClick();
    hud.reset();
    if (engine.activeGameId) {
      const hi = storage.getHighScore(engine.activeGameId);
      hud.updateHighScore(hi);
    }
    engine.restart();
    hud.announce('Game restarted');
  };

  // Synchronize difficulty and sound changes
  window.addEventListener('console:difficultychange', (e) => {
    if (e.detail?.difficulty) {
      engine.setDifficulty(e.detail.difficulty);
    }
  });

  window.addEventListener('console:volumechange', (e) => {
    if (e.detail?.volume !== undefined) {
      sound.setVolume(e.detail.volume / 100);
    }
  });

  window.addEventListener('console:mutechange', (e) => {
    if (e.detail?.muted !== undefined) {
      if (e.detail.muted) sound.mute();
      else sound.unmute();
      hud.setMuted(sound.isMuted());
    }
  });

  // Dedicated hardware button shortcuts:
  // Sound button
  const soundBtn = document.querySelector('[data-action="SOUND"]');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      hud.setMuted(isMuted);
      hud.announce(isMuted ? 'Sound Muted' : 'Sound On');
    });
  }

  // Start the console boot self-test
  screenManager.start();

  // Expose global console interface for debugging, testing, and accessibility
  window.__RETRO_CONSOLE__ = {
    input,
    hud,
    modalManager,
    screenManager,
    engine,
    sound,
    storage,
    GameRegistry,
  };
});
