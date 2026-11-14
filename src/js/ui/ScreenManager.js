/**
 * Retro Brick Game Console - Screen Manager
 * Finite state machine coordinating console states:
 * BOOT -> MENU -> PLAYING -> PAUSED -> GAMEOVER
 */

export const ScreenState = Object.freeze({
  BOOT: 'BOOT',
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
});

export const GAMES_CATALOG = [
  { id: 'brick-stacker', title: 'BRICK STACKER', category: 'PUZZLE', index: 1 },
  { id: 'turbo-highway', title: 'TURBO HIGHWAY', category: 'RACING', index: 2 },
  { id: 'iron-tanks', title: 'IRON TANKS', category: 'ACTION', index: 3 },
  { id: 'cyber-viper', title: 'CYBER VIPER', category: 'ARCADE', index: 4 },
  { id: 'falling-poly', title: 'FALLING POLY', category: 'PUZZLE', index: 5 },
  { id: 'cosmo-defender', title: 'COSMO DEFENDER', category: 'SHOOTER', index: 6 },
  { id: 'bounce-duel', title: 'BOUNCE DUEL', category: 'ARCADE', index: 7 },
  { id: 'tile-memory', title: 'TILE MEMORY', category: 'PUZZLE', index: 8 },
  { id: 'labyrinth-escape', title: 'LABYRINTH ESCAPE', category: 'ACTION', index: 9 },
  { id: 'froggero', title: 'FROGGERO', category: 'ARCADE', index: 10 },
  { id: 'mole-hammer', title: 'MOLE HAMMER', category: 'REFLEX', index: 11 },
  { id: 'chroma-pulse', title: 'CHROMA PULSE', category: 'PUZZLE', index: 12 },
  { id: 'grid-tactics', title: 'GRID TACTICS', category: 'STRATEGY', index: 13 },
  { id: 'four-in-line', title: 'FOUR IN LINE', category: 'STRATEGY', index: 14 },
  { id: 'mine-scanner', title: 'MINE SCANNER', category: 'PUZZLE', index: 15 },
  { id: 'matrix-2048', title: 'MATRIX 2048', category: 'PUZZLE', index: 16 },
  { id: 'aero-glider', title: 'AERO GLIDER', category: 'ARCADE', index: 17 },
  { id: 'brick-breaker', title: 'BRICK BREAKER', category: 'ARCADE', index: 18 },
  { id: 'pinball-bounce', title: 'PINBALL BOUNCE', category: 'ARCADE', index: 19 },
  { id: 'sprint-escape', title: 'SPRINT ESCAPE', category: 'ACTION', index: 20 },
  { id: 'orb-pop', title: 'ORB POP', category: 'PUZZLE', index: 21 },
  { id: 'solitaire-lite', title: 'SOLITAIRE LITE', category: 'CARDS', index: 22 },
  { id: 'reflex-rush', title: 'REFLEX RUSH', category: 'REFLEX', index: 23 },
];

export class ScreenManager {
  /**
   * @param {Object} services Injected infrastructure services
   * @param {import('./ModalManager.js').ModalManager} services.modalManager
   * @param {import('./HUD.js').HUD} services.hud
   * @param {import('./InputController.js').InputController} services.input
   * @param {Object} [services.sound]
   * @param {Object} [services.storage]
   * @param {Object} [services.engine]
   */
  constructor(services) {
    this.modalManager = services.modalManager;
    this.hud = services.hud;
    this.input = services.input;
    this.sound = services.sound || null;
    this.storage = services.storage || null;
    this.engine = services.engine || null;

    this.state = ScreenState.BOOT;
    this.selectedGameIndex = 0;
    this.pauseOptionIndex = 0;

    // Difficulty, Mode and Theme settings
    this.difficulty = 'MEDIUM';
    this.isDuoMode = false;
    this.theme = 'classic';
    this.volume = 80;

    // Callbacks
    this.onGameSelected = null;
    this.onGameRestart = null;

    this._bindDomEvents();
  }

  /**
   * Toggle between 1P Solo and 2P Duo Mode.
   */
  toggleDuoMode() {
    this.setDuoMode(!this.isDuoMode);
  }

  /**
   * Set Solo or Duo mode.
   * @param {boolean} enabled 
   */
  setDuoMode(enabled) {
    this.isDuoMode = !!enabled;
    if (this.hud && typeof this.hud.setDuoMode === 'function') {
      this.hud.setDuoMode(this.isDuoMode);
    }
    if (this.engine && typeof this.engine.setDuoMode === 'function') {
      this.engine.setDuoMode(this.isDuoMode);
    }
    this._updateMenuCard();
    if (this.hud && typeof this.hud.announce === 'function') {
      this.hud.announce(this.isDuoMode ? 'Duo Mode Enabled: 2 Players.' : 'Solo Mode Enabled: 1 Player.');
    }
  }

  /**
   * Initialize state machine and start boot self-test.
   */
  start() {
    this.loadSettings();
    this.transitionTo(ScreenState.BOOT);
  }

  /**
   * Finite state machine transition.
   * @param {string} newState 
   * @param {Object} [payload] 
   */
  transitionTo(newState, payload = {}) {
    this.state = newState;

    switch (newState) {
      case ScreenState.BOOT:
        this._runBootSequence();
        break;

      case ScreenState.MENU:
        if (this.hud && typeof this.hud.setPaused === 'function') {
          this.hud.setPaused(false);
        }
        if (this.modalManager) {
          this.modalManager.closeAll();
          this.modalManager.open('menu');
        }
        this._updateMenuCard();
        if (this.hud && typeof this.hud.announce === 'function') {
          this.hud.announce(`Menu. Selected game: ${this.getCurrentGame().title}`);
        }
        break;

      case ScreenState.PLAYING:
        if (this.modalManager) {
          this.modalManager.closeAll();
        }
        if (this.hud && typeof this.hud.setPaused === 'function') {
          this.hud.setPaused(false);
        }
        if (this.engine && typeof this.engine.resume === 'function') {
          this.engine.resume();
        }
        break;

      case ScreenState.PAUSED:
        if (this.hud && typeof this.hud.setPaused === 'function') {
          this.hud.setPaused(true);
        }
        this.pauseOptionIndex = 0;
        this._updatePauseMenuSelection();
        if (this.modalManager) {
          this.modalManager.open('pause');
        }
        if (this.engine && typeof this.engine.pause === 'function') {
          this.engine.pause();
        }
        break;

      case ScreenState.GAMEOVER:
        if (this.hud && typeof this.hud.setPaused === 'function') {
          this.hud.setPaused(false);
        }
        this._populateGameOverModal(payload);
        if (this.modalManager) {
          this.modalManager.open('gameover');
        }
        break;
    }
  }

  /**
   * Return currently highlighted game metadata.
   */
  getCurrentGame() {
    return GAMES_CATALOG[this.selectedGameIndex];
  }

  /**
   * Navigate menu game selector.
   * @param {number} delta -1 or +1
   */
  changeSelectedGame(delta) {
    const total = GAMES_CATALOG.length;
    this.selectedGameIndex = (this.selectedGameIndex + delta + total) % total;
    this._updateMenuCard();
    if (this.sound && typeof this.sound.playMove === 'function') {
      this.sound.playMove();
    }
  }

  /**
   * Launch the currently selected game.
   */
  launchSelectedGame() {
    const game = this.getCurrentGame();
    if (this.onGameSelected) {
      this.onGameSelected(game);
    }
    this.transitionTo(ScreenState.PLAYING);
  }

  /**
   * Internal boot self-test sequence (1200ms).
   */
  _runBootSequence() {
    if (this.modalManager) {
      this.modalManager.open('boot');
    }

    if (typeof document !== 'undefined') {
      const gridTest = document.getElementById('boot-grid-test');
      const marquee = document.getElementById('boot-marquee');
      const progressFill = document.getElementById('boot-progress-fill');

      if (gridTest && gridTest.children && gridTest.children.length === 0) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < 80; i++) {
          const brick = document.createElement('div');
          brick.className = 'test-brick';
          frag.appendChild(brick);
        }
        gridTest.appendChild(frag);
      }

      if (marquee) marquee.textContent = 'SYSTEM TEST';
      if (progressFill) progressFill.style.width = '25%';

      setTimeout(() => {
        if (marquee) marquee.textContent = 'BRICK 23 IN 1';
        if (progressFill) progressFill.style.width = '70%';
      }, 400);

      setTimeout(() => {
        if (progressFill) progressFill.style.width = '100%';
      }, 900);
    }

    // Phase 1: Power-on beep
    if (this.sound && typeof this.sound.playTone === 'function') {
      try {
        this.sound.playTone(2400, 0.15, 'square', 0.2);
      } catch {}
    }

    setTimeout(() => {
      this.transitionTo(ScreenState.MENU);
    }, 1200);
  }

  /**
   * Update the Game Selector DOM card and render thumbnail preview.
   */
  _updateMenuCard() {
    if (typeof document === 'undefined') return;
    const game = this.getCurrentGame();
    const elIndex = document.getElementById('menu-game-index');
    const elTitle = document.getElementById('menu-game-title');
    const elCat = document.getElementById('menu-game-category');
    const elHiScore = document.getElementById('menu-game-hiscore');

    if (elIndex) elIndex.textContent = `GAME ${String(game.index).padStart(2, '0')} / 23`;
    if (elTitle) elTitle.textContent = game.title;
    if (elCat) elCat.textContent = game.category;

    const hiScore = this.getHighScore(game.id);
    if (elHiScore) elHiScore.textContent = `HI-SCORE: ${String(hiScore).padStart(6, '0')}`;

    const btnMode = document.getElementById('menu-mode-toggle');
    if (btnMode) {
      btnMode.textContent = this.isDuoMode ? 'MODE: 2P DUO' : 'MODE: 1P SOLO';
      btnMode.classList.toggle('duo-active', this.isDuoMode);
      btnMode.setAttribute('aria-pressed', String(this.isDuoMode));
    }

    this._drawGamePreview(game);
  }

  /**
   * Draw an authentic 8x8 or 4x4 LCD pixel thumbnail for the selected game.
   * @param {Object} game 
   */
  _drawGamePreview(game) {
    if (typeof document === 'undefined') return;
    const canvas = document.getElementById('menu-preview-canvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width || 64;
    const h = canvas.height || 64;

    ctx.clearRect(0, 0, w, h);

    const litColor = (typeof getComputedStyle !== 'undefined' && typeof document !== 'undefined')
      ? getComputedStyle(document.documentElement).getPropertyValue('--lcd-pixel-lit').trim() || '#1a2b1a'
      : '#1a2b1a';
    ctx.fillStyle = litColor;

    const cellSize = w / 8;
    const drawGrid = (pattern) => {
      for (let r = 0; r < pattern.length; r++) {
        for (let c = 0; c < pattern[r].length; c++) {
          if (pattern[r][c] === 1) {
            ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
          }
        }
      }
    };

    switch (game.index % 6) {
      case 1:
        drawGrid([
          [0, 0, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1],
        ]);
        break;
      case 2:
        drawGrid([
          [1, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 1, 1, 0, 0, 0, 1],
          [1, 0, 1, 1, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 1, 1, 1],
          [1, 0, 0, 0, 0, 1, 1, 1],
          [1, 0, 0, 1, 1, 0, 0, 1],
          [1, 0, 0, 1, 1, 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 0, 1],
        ]);
        break;
      case 3:
        drawGrid([
          [0, 0, 0, 1, 1, 0, 0, 0],
          [0, 0, 0, 1, 1, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 0],
          [0, 1, 0, 1, 1, 0, 1, 0],
          [0, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 0, 0, 0, 0, 1, 1],
          [1, 1, 0, 0, 0, 0, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1],
        ]);
        break;
      case 4:
        drawGrid([
          [0, 0, 0, 0, 1, 1, 0, 0],
          [0, 0, 0, 0, 1, 1, 0, 0],
          [0, 1, 1, 1, 1, 0, 0, 0],
          [0, 1, 1, 0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 1, 0, 0, 0, 0, 0, 0],
        ]);
        break;
      case 5:
        drawGrid([
          [0, 0, 0, 1, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 0, 0],
          [0, 0, 1, 0, 0, 1, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 1, 1, 1, 1, 0, 1],
          [1, 0, 0, 1, 1, 0, 0, 1],
          [0, 0, 1, 0, 0, 1, 0, 0],
        ]);
        break;
      default:
        drawGrid([
          [1, 1, 0, 0, 0, 0, 1, 1],
          [1, 1, 0, 1, 1, 0, 1, 1],
          [0, 0, 1, 1, 1, 1, 0, 0],
          [0, 0, 1, 1, 1, 1, 0, 0],
          [1, 1, 0, 1, 1, 0, 1, 1],
          [1, 1, 0, 0, 0, 0, 1, 1],
          [0, 0, 1, 1, 1, 1, 0, 0],
          [0, 0, 1, 1, 1, 1, 0, 0],
        ]);
        break;
    }
  }

  /**
   * Populate Game Over modal with score, level, and high score badge.
   * @param {Object} data 
   */
  _populateGameOverModal(data = {}) {
    const finalScore = data.score ?? (this.hud ? this.hud.score : 0);
    const finalLevel = data.level ?? (this.hud ? this.hud.level : 1);
    const game = this.getCurrentGame();

    const previousHi = this.getHighScore(game.id);
    const isNewRecord = finalScore > previousHi;

    if (isNewRecord) {
      this.setHighScore(game.id, finalScore);
      if (this.hud && typeof this.hud.updateHighScore === 'function') {
        this.hud.updateHighScore(finalScore);
      }
    }

    if (typeof document !== 'undefined') {
      const elScore = document.getElementById('gameover-score-val');
      const elHi = document.getElementById('gameover-hiscore-val');
      const elLvl = document.getElementById('gameover-level-val');
      const elBadge = document.getElementById('gameover-record-badge');

      if (elScore) elScore.textContent = String(finalScore).padStart(6, '0');
      if (elHi) elHi.textContent = String(Math.max(finalScore, previousHi)).padStart(6, '0');
      if (elLvl) elLvl.textContent = String(finalLevel);
      if (elBadge) {
        if (isNewRecord) {
          elBadge.classList?.remove('hidden');
        } else {
          elBadge.classList?.add('hidden');
        }
      }
    }

    if (this.hud && typeof this.hud.announce === 'function') {
      this.hud.announce(`Game Over. Final score: ${finalScore}. ${isNewRecord ? 'New high score!' : ''}`);
    }
  }

  /**
   * Update pause menu cursor selection visual.
   */
  _updatePauseMenuSelection() {
    if (typeof document === 'undefined') return;
    const options = document.querySelectorAll('.pause-option');
    options.forEach((opt, idx) => {
      const text = opt.textContent.replace(/^[>\s]+/, '');
      if (idx === this.pauseOptionIndex) {
        opt.classList?.add('selected');
        opt.textContent = `> ${text}`;
        if (typeof opt.focus === 'function') opt.focus();
      } else {
        opt.classList?.remove('selected');
        opt.textContent = `  ${text}`;
      }
    });
  }

  /**
   * Handle user selection of a pause menu item.
   */
  _selectPauseOption() {
    switch (this.pauseOptionIndex) {
      case 0: // Resume
        this.transitionTo(ScreenState.PLAYING);
        break;
      case 1: // Restart
        if (this.onGameRestart) {
          this.onGameRestart();
        }
        this.transitionTo(ScreenState.PLAYING);
        break;
      case 2: // High Scores
        this.openHighScoresModal();
        break;
      case 3: // Settings
        this.openSettingsModal();
        break;
      case 4: // Main Menu
        this.transitionTo(ScreenState.MENU);
        break;
    }
  }

  /**
   * Open the High Scores modal and populate the table.
   */
  openHighScoresModal() {
    this._populateHighScoresTable();
    if (this.modalManager) {
      this.modalManager.open('highscores');
    }
  }

  /**
   * Open the Settings modal and refresh control states.
   */
  openSettingsModal() {
    this._refreshSettingsModal();
    if (this.modalManager) {
      this.modalManager.open('settings');
    }
  }

  /**
   * Populate the high scores leaderboard table.
   */
  _populateHighScoresTable() {
    if (typeof document === 'undefined') return;
    const tbody = document.getElementById('highscores-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    GAMES_CATALOG.forEach((g) => {
      const score = this.getHighScore(g.id);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${String(g.index).padStart(2, '0')}</td>
        <td>${g.title}</td>
        <td class="score-num">${String(score).padStart(6, '0')}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  /**
   * Populate the settings modal controls from current properties.
   */
  _refreshSettingsModal() {
    if (typeof document === 'undefined') return;
    const volSlider = document.getElementById('setting-volume');
    const volNum = document.getElementById('setting-volume-num');
    const audioBtn = document.getElementById('setting-audio-toggle');
    const themeSelect = document.getElementById('setting-theme');
    const hapticsBtn = document.getElementById('setting-haptics-toggle');

    if (volSlider) volSlider.value = this.volume;
    if (volNum) volNum.textContent = `${this.volume}%`;

    if (audioBtn) {
      const isMuted = this.hud ? this.hud.isMuted : false;
      audioBtn.textContent = isMuted ? 'SOUND: OFF' : 'SOUND: ON';
      if (isMuted) audioBtn.classList?.remove('active');
      else audioBtn.classList?.add('active');
    }

    if (themeSelect) {
      themeSelect.value = this.theme;
    }

    if (hapticsBtn && this.input && typeof this.input.isHapticsEnabled === 'function') {
      const enabled = this.input.isHapticsEnabled();
      hapticsBtn.textContent = enabled ? 'ENABLED' : 'DISABLED';
      if (enabled) hapticsBtn.classList?.add('active');
      else hapticsBtn.classList?.remove('active');
    }

    const diffButtons = document.querySelectorAll('#setting-difficulty-group .segmented-btn');
    diffButtons.forEach((btn) => {
      if (btn.getAttribute('data-diff') === this.difficulty) {
        btn.classList?.add('active');
      } else {
        btn.classList?.remove('active');
      }
    });
  }

  /**
   * Apply LCD Theme to the screen window.
   * @param {'classic'|'mono'|'amber'|'cyber'} theme 
   */
  setTheme(theme) {
    this.theme = theme;
    if (typeof document === 'undefined') return;
    const windowEl = document.getElementById('lcd-screen-window');
    if (!windowEl) return;

    windowEl.classList?.remove('theme-mono-1989', 'theme-amber-night', 'theme-cyber-high-contrast');

    if (theme === 'mono') {
      windowEl.classList?.add('theme-mono-1989');
    } else if (theme === 'amber') {
      windowEl.classList?.add('theme-amber-night');
    } else if (theme === 'cyber') {
      windowEl.classList?.add('theme-cyber-high-contrast');
    }

    this.saveSettings();
  }

  /**
   * Set difficulty tier.
   * @param {'EASY'|'MEDIUM'|'HARD'} diff 
   */
  setDifficulty(diff) {
    this.difficulty = diff;
    this._refreshSettingsModal();
    this.saveSettings();
  }

  /**
   * Set volume (0 to 100).
   * @param {number} val 
   */
  setVolume(val) {
    this.volume = Math.max(0, Math.min(100, Math.floor(val)));
    if (this.sound && typeof this.sound.setVolume === 'function') {
      this.sound.setVolume(this.volume / 100);
    }
    if (typeof document !== 'undefined') {
      const volNum = document.getElementById('setting-volume-num');
      if (volNum) volNum.textContent = `${this.volume}%`;
    }
    this.saveSettings();
  }

  /**
   * Toggle audio mute.
   */
  toggleSound() {
    let muted = false;
    if (this.sound && typeof this.sound.toggleMute === 'function') {
      muted = this.sound.toggleMute();
    } else if (this.hud) {
      muted = !this.hud.isMuted;
    }
    if (this.hud && typeof this.hud.setMuted === 'function') {
      this.hud.setMuted(muted);
    }
    this._refreshSettingsModal();
    this.saveSettings();
  }

  /**
   * Get high score from storage or localStorage.
   * @param {string} gameId 
   * @returns {number}
   */
  getHighScore(gameId) {
    if (this.storage && typeof this.storage.getHighScore === 'function') {
      return this.storage.getHighScore(gameId);
    }
    if (typeof localStorage === 'undefined') return 0;
    try {
      const val = localStorage.getItem(`brick_hiscore_${gameId}`);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Save high score to storage or localStorage.
   * @param {string} gameId 
   * @param {number} score 
   */
  setHighScore(gameId, score) {
    if (this.storage && typeof this.storage.setHighScore === 'function') {
      return this.storage.setHighScore(gameId, score);
    }
    if (typeof localStorage === 'undefined') return false;
    try {
      localStorage.setItem(`brick_hiscore_${gameId}`, String(score));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all stored high scores.
   */
  clearAllHighScores() {
    if (typeof localStorage !== 'undefined') {
      try {
        GAMES_CATALOG.forEach((g) => {
          localStorage.removeItem(`brick_hiscore_${g.id}`);
        });
      } catch {}
    }
    this._populateHighScoresTable();
    if (this.hud && typeof this.hud.updateHighScore === 'function') {
      this.hud.updateHighScore(0);
    }
    if (this.hud && typeof this.hud.announce === 'function') {
      this.hud.announce('All high scores cleared.');
    }
  }

  /**
   * Reset all settings and high scores to factory defaults.
   */
  factoryReset() {
    this.clearAllHighScores();
    this.difficulty = 'MEDIUM';
    this.setTheme('classic');
    this.setVolume(80);
    if (this.input && typeof this.input.setHapticsEnabled === 'function') {
      this.input.setHapticsEnabled(true);
    }
    if (this.hud && typeof this.hud.setMuted === 'function') {
      this.hud.setMuted(false);
    }
    this.saveSettings();
    this._refreshSettingsModal();
    if (this.hud && typeof this.hud.announce === 'function') {
      this.hud.announce('Factory reset complete.');
    }
  }

  /**
   * Save settings to localStorage.
   */
  saveSettings() {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = {
        theme: this.theme,
        difficulty: this.difficulty,
        volume: this.volume,
        muted: this.hud ? this.hud.isMuted : false,
        haptics: this.input && typeof this.input.isHapticsEnabled === 'function' ? this.input.isHapticsEnabled() : true,
      };
      localStorage.setItem('brick_settings', JSON.stringify(data));
    } catch {}
  }

  /**
   * Load settings from localStorage.
   */
  loadSettings() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('brick_settings');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.theme) this.setTheme(data.theme);
        if (data.difficulty) this.difficulty = data.difficulty;
        if (typeof data.volume === 'number') this.setVolume(data.volume);
        if (typeof data.muted === 'boolean' && this.hud) this.hud.setMuted(data.muted);
        if (typeof data.haptics === 'boolean' && this.input) this.input.setHapticsEnabled(data.haptics);
      }
    } catch {}
  }

  /**
   * Wire DOM buttons and control handlers.
   */
  _bindDomEvents() {
    if (typeof document === 'undefined') return;

    // Menu arrows
    const btnPrev = document.getElementById('menu-btn-prev');
    const btnNext = document.getElementById('menu-btn-next');
    if (btnPrev) btnPrev.addEventListener('click', () => this.changeSelectedGame(-1));
    if (btnNext) btnNext.addEventListener('click', () => this.changeSelectedGame(1));

    // Menu launch button
    const btnStart = document.getElementById('menu-btn-start');
    if (btnStart) btnStart.addEventListener('click', () => this.launchSelectedGame());

    // Menu mode toggle (Solo 1P vs Duo 2P)
    const btnMode = document.getElementById('menu-mode-toggle');
    if (btnMode) btnMode.addEventListener('click', () => this.toggleDuoMode());

    // Menu sub-links
    const linkScores = document.getElementById('menu-link-scores');
    const linkSettings = document.getElementById('menu-link-settings');
    if (linkScores) linkScores.addEventListener('click', () => this.openHighScoresModal());
    if (linkSettings) linkSettings.addEventListener('click', () => this.openSettingsModal());

    // Hardware Meta buttons: Sound, Pause, Reset
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) btnSound.addEventListener('click', () => this.toggleSound());

    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        if (this.state === ScreenState.PLAYING) {
          this.transitionTo(ScreenState.PAUSED);
        } else if (this.state === ScreenState.PAUSED) {
          this.transitionTo(ScreenState.PLAYING);
        }
      });
    }

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (this.state === ScreenState.PLAYING || this.state === ScreenState.PAUSED) {
          if (this.onGameRestart) this.onGameRestart();
          this.transitionTo(ScreenState.PLAYING);
        } else {
          this.transitionTo(ScreenState.BOOT);
        }
      });
    }

    // Hardware Start & Select buttons
    const btnHwStart = document.getElementById('btn-start');
    if (btnHwStart) {
      btnHwStart.addEventListener('click', () => {
        if (this.state === ScreenState.MENU) {
          this.launchSelectedGame();
        } else if (this.state === ScreenState.PAUSED) {
          this._selectPauseOption();
        } else if (this.state === ScreenState.GAMEOVER) {
          if (this.onGameRestart) this.onGameRestart();
          this.transitionTo(ScreenState.PLAYING);
        }
      });
    }

    const btnHwSelect = document.getElementById('btn-select');
    if (btnHwSelect) {
      btnHwSelect.addEventListener('click', () => {
        if (this.state === ScreenState.MENU) {
          this.changeSelectedGame(1);
        } else if (this.state === ScreenState.GAMEOVER) {
          this.transitionTo(ScreenState.MENU);
        }
      });
    }

    // Pause options list
    const pauseOpts = document.querySelectorAll('.pause-option');
    pauseOpts.forEach((opt, idx) => {
      opt.addEventListener('click', () => {
        this.pauseOptionIndex = idx;
        this._selectPauseOption();
      });
    });

    // Game Over buttons
    const btnGoRestart = document.getElementById('gameover-btn-restart');
    const btnGoMenu = document.getElementById('gameover-btn-menu');
    if (btnGoRestart) {
      btnGoRestart.addEventListener('click', () => {
        if (this.onGameRestart) this.onGameRestart();
        this.transitionTo(ScreenState.PLAYING);
      });
    }
    if (btnGoMenu) {
      btnGoMenu.addEventListener('click', () => this.transitionTo(ScreenState.MENU));
    }

    // High Scores Modal buttons
    const btnScoresClose = document.getElementById('scores-btn-close');
    const btnScoresClear = document.getElementById('scores-btn-clear');
    if (btnScoresClose) btnScoresClose.addEventListener('click', () => this.modalManager?.close('highscores'));
    if (btnScoresClear) btnScoresClear.addEventListener('click', () => this.clearAllHighScores());

    // Settings Modal controls
    const volSlider = document.getElementById('setting-volume');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => this.setVolume(parseInt(e.target.value, 10)));
    }

    const audioToggle = document.getElementById('setting-audio-toggle');
    if (audioToggle) audioToggle.addEventListener('click', () => this.toggleSound());

    const diffButtons = document.querySelectorAll('#setting-difficulty-group .segmented-btn');
    diffButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const diff = btn.getAttribute('data-diff');
        if (diff) this.setDifficulty(diff);
      });
    });

    const themeSelect = document.getElementById('setting-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));
    }

    const hapticsToggle = document.getElementById('setting-haptics-toggle');
    if (hapticsToggle) {
      hapticsToggle.addEventListener('click', () => {
        const next = !this.input.isHapticsEnabled();
        this.input.setHapticsEnabled(next);
        this._refreshSettingsModal();
        this.saveSettings();
      });
    }

    const btnFactoryReset = document.getElementById('setting-reset-factory');
    if (btnFactoryReset) {
      btnFactoryReset.addEventListener('click', () => {
        if (typeof confirm === 'function') {
          if (confirm('Reset all scores and settings to factory defaults?')) {
            this.factoryReset();
          }
        } else {
          this.factoryReset();
        }
      });
    }

    const btnSettingsClose = document.getElementById('settings-btn-close');
    if (btnSettingsClose) {
      btnSettingsClose.addEventListener('click', () => this.modalManager?.close('settings'));
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (this.state === ScreenState.MENU) {
          if (e.key === 'ArrowLeft' || e.code === 'KeyA') {
            this.changeSelectedGame(-1);
          } else if (e.key === 'ArrowRight' || e.code === 'KeyD') {
            this.changeSelectedGame(1);
          } else if (e.key === 'Enter' || e.code === 'Space') {
            this.launchSelectedGame();
          }
        } else if (this.state === ScreenState.PAUSED) {
          if (e.key === 'ArrowUp' || e.code === 'KeyW') {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            this.pauseOptionIndex = (this.pauseOptionIndex - 1 + 5) % 5;
            this._updatePauseMenuSelection();
          } else if (e.key === 'ArrowDown' || e.code === 'KeyS') {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            this.pauseOptionIndex = (this.pauseOptionIndex + 1) % 5;
            this._updatePauseMenuSelection();
          } else if (e.key === 'Enter' || e.code === 'Space') {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            this._selectPauseOption();
          }
        }
      });
    }
  }
}
