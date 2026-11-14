/**
 * Retro Brick Game Console - LCD HUD Controller
 * Manages 7-segment numeric telemetry, speed meter, lives icons,
 * next piece 4x4 LCD submatrix preview, and status flags.
 */

export class HUD {
  /**
   * @param {Object} [elements={}] Optional DOM elements overrides
   */
  constructor(elements = {}) {
    const hasDoc = typeof document !== 'undefined';
    this.elScore = elements.score !== undefined ? elements.score : (hasDoc ? document.getElementById('hud-score') : null);
    this.elHiScore = elements.hiScore !== undefined ? elements.hiScore : (hasDoc ? document.getElementById('hud-hiscore') : null);
    this.elLevel = elements.level !== undefined ? elements.level : (hasDoc ? document.getElementById('hud-level') : null);
    this.elSpeedMeter = elements.speedMeter !== undefined ? elements.speedMeter : (hasDoc ? document.getElementById('hud-speed-meter') : null);
    this.elLives = elements.lives !== undefined ? elements.lives : (hasDoc ? document.getElementById('hud-lives') : null);
    this.elFlagPause = elements.flagPause !== undefined ? elements.flagPause : (hasDoc ? document.getElementById('hud-flag-pause') : null);
    this.elFlagSound = elements.flagSound !== undefined ? elements.flagSound : (hasDoc ? document.getElementById('hud-flag-sound') : null);
    this.subCanvas = elements.submatrixCanvas !== undefined ? elements.submatrixCanvas : (hasDoc ? document.getElementById('submatrix-canvas') : null);
    this.ghostGrid = elements.ghostGrid !== undefined ? elements.ghostGrid : (hasDoc ? document.getElementById('ghost-grid') : null);
    this.liveAnnouncer = elements.liveAnnouncer !== undefined ? elements.liveAnnouncer : (hasDoc ? document.getElementById('aria-live-announcer') : null);

    this.subCtx = this.subCanvas && typeof this.subCanvas.getContext === 'function' ? this.subCanvas.getContext('2d') : null;

    // Cached values
    this.score = 0;
    this.hiScore = 0;
    this.level = 1;
    this.speed = 1;
    this.lives = 3;
    this.maxLives = 3;
    this.isPaused = false;
    this.isMuted = false;

    // Submatrix grid size
    this.subCols = 4;
    this.subRows = 4;

    this.initGhostGrid();
    this.clearNextPiece();
    this.reset();
  }

  /**
   * Generates the 10x20 passive ghost brick footprint grid on the main playfield.
   */
  initGhostGrid() {
    if (typeof document === 'undefined' || !this.ghostGrid || (this.ghostGrid.children && this.ghostGrid.children.length > 0)) return;
    try {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 200; i++) {
        const brick = document.createElement('div');
        brick.className = 'ghost-brick';
        fragment.appendChild(brick);
      }
      this.ghostGrid.appendChild(fragment);
    } catch {
      // Ignore in mock environment
    }
  }

  /**
   * Formats a number into authentic 6-digit LCD segments with unlit leading zeroes.
   * @param {number} value 
   * @returns {string} HTML string
   */
  format7Segment(value) {
    const clamped = Math.max(0, Math.min(999999, Math.floor(value)));
    const str = clamped.toString().padStart(6, '0');

    // Find first non-zero index (keep at least the last digit lit)
    let firstNonZero = str.search(/[1-9]/);
    if (firstNonZero === -1) {
      firstNonZero = 5; // All zeroes, illuminate the last '0'
    }

    const unlit = str.substring(0, firstNonZero);
    const lit = str.substring(firstNonZero);

    if (unlit.length === 0) {
      return `<span>${lit}</span>`;
    }
    return `<span class="unlit-digits">${unlit}</span><span>${lit}</span>`;
  }

  /**
   * Update active score.
   * @param {number} score 
   */
  updateScore(score) {
    this.score = score;
    if (this.elScore) {
      this.elScore.innerHTML = this.format7Segment(score);
    }
  }

  /**
   * Update high score.
   * @param {number} hiScore 
   */
  updateHighScore(hiScore) {
    this.hiScore = hiScore;
    if (this.elHiScore) {
      this.elHiScore.innerHTML = this.format7Segment(hiScore);
    }
  }

  /**
   * Update level number (1 to 10 or 99).
   * @param {number} level 
   */
  updateLevel(level) {
    this.level = level;
    if (this.elLevel) {
      const str = Math.max(1, Math.min(99, Math.floor(level))).toString().padStart(2, '0');
      this.elLevel.textContent = str;
    }
  }

  /**
   * Update speed meter bar (1 to 10 segment pips).
   * @param {number} speed 
   */
  updateSpeed(speed) {
    this.speed = Math.max(1, Math.min(10, Math.floor(speed)));
    if (!this.elSpeedMeter) return;

    if (typeof this.elSpeedMeter.querySelectorAll === 'function') {
      const pips = this.elSpeedMeter.querySelectorAll('.meter-pip');
      pips.forEach((pip, idx) => {
        if (idx < this.speed) {
          pip.classList?.add('lit');
        } else {
          pip.classList?.remove('lit');
        }
      });
    }

    if (typeof this.elSpeedMeter.setAttribute === 'function') {
      this.elSpeedMeter.setAttribute('aria-label', `Speed Gauge: ${this.speed} of 10`);
    }
  }

  /**
   * Update remaining lives icons.
   * @param {number} lives Current remaining lives
   * @param {number} maxLives Max capacity (default 3)
   */
  updateLives(lives, maxLives = 3) {
    this.lives = Math.max(0, lives);
    this.maxLives = Math.max(this.lives, maxLives);
    if (!this.elLives) return;

    // Rebuild or update life icons
    if (typeof document !== 'undefined' && this.elLives.children && this.elLives.children.length !== this.maxLives) {
      this.elLives.innerHTML = '';
      for (let i = 0; i < this.maxLives; i++) {
        const icon = document.createElement('div');
        icon.className = 'life-icon lit';
        this.elLives.appendChild(icon);
      }
    }

    if (typeof this.elLives.querySelectorAll === 'function') {
      const icons = this.elLives.querySelectorAll('.life-icon');
      icons.forEach((icon, idx) => {
        if (idx < this.lives) {
          icon.classList?.add('lit');
        } else {
          icon.classList?.remove('lit');
        }
      });
    }

    if (typeof this.elLives.setAttribute === 'function') {
      this.elLives.setAttribute('aria-label', `${this.lives} Lives Remaining`);
    }
  }

  /**
   * Toggle pause status flag.
   * @param {boolean} isPaused 
   */
  setPaused(isPaused) {
    this.isPaused = !!isPaused;
    if (this.elFlagPause) {
      if (this.isPaused) {
        this.elFlagPause.classList?.add('active');
        this.announce('Game Paused');
      } else {
        this.elFlagPause.classList?.remove('active');
      }
    }
  }

  /**
   * Toggle sound status flag.
   * @param {boolean} isMuted 
   */
  setMuted(isMuted) {
    this.isMuted = !!isMuted;
    if (this.elFlagSound) {
      if (this.isMuted) {
        this.elFlagSound.classList?.remove('active');
        this.elFlagSound.textContent = 'MUTE';
      } else {
        this.elFlagSound.classList?.add('active');
        this.elFlagSound.textContent = '♪ ON';
      }
    }
  }

  /**
   * Render a 4x4 binary polyomino or radar matrix into the submatrix canvas.
   * @param {number[][]} matrix 
   */
  showNextPiece(matrix) {
    if (!this.subCtx || !this.subCanvas) return;

    const width = this.subCanvas.width || 48;
    const height = this.subCanvas.height || 48;
    const cellW = width / this.subCols;
    const cellH = height / this.subRows;

    this.subCtx.clearRect(0, 0, width, height);

    if (!matrix || !Array.isArray(matrix)) {
      this.clearNextPiece();
      return;
    }

    const rows = matrix.length;
    const cols = matrix[0] ? matrix[0].length : 0;
    const offX = Math.floor((this.subCols - cols) / 2);
    const offY = Math.floor((this.subRows - rows) / 2);

    const litColor = (typeof getComputedStyle !== 'undefined' && typeof document !== 'undefined')
      ? getComputedStyle(document.documentElement).getPropertyValue('--lcd-pixel-lit').trim() || '#1a2b1a'
      : '#1a2b1a';
    const ghostColor = (typeof getComputedStyle !== 'undefined' && typeof document !== 'undefined')
      ? getComputedStyle(document.documentElement).getPropertyValue('--lcd-pixel-ghost').trim() || 'rgba(26, 43, 26, 0.08)'
      : 'rgba(26, 43, 26, 0.08)';

    // Draw grid
    for (let r = 0; r < this.subRows; r++) {
      for (let c = 0; c < this.subCols; c++) {
        const matR = r - offY;
        const matC = c - offX;
        const isLit = matR >= 0 && matR < rows && matC >= 0 && matC < cols && matrix[matR][matC] === 1;

        const x = c * cellW;
        const y = r * cellH;

        if (isLit) {
          // Draw authentic LCD brick pixel
          this.subCtx.fillStyle = litColor;
          this.subCtx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
          this.subCtx.clearRect(x + 2.5, y + 2.5, cellW - 5, cellH - 5);
          this.subCtx.fillRect(x + 4, y + 4, cellW - 8, cellH - 8);
        } else {
          // Passive unlit ghost footprint
          this.subCtx.strokeStyle = ghostColor;
          this.subCtx.lineWidth = 1;
          this.subCtx.strokeRect(x + 1.5, y + 1.5, cellW - 3, cellH - 3);
        }
      }
    }
  }

  /**
   * Clear the submatrix canvas.
   */
  clearNextPiece() {
    if (!this.subCtx || !this.subCanvas) return;
    const width = this.subCanvas.width || 48;
    const height = this.subCanvas.height || 48;
    const cellW = width / this.subCols;
    const cellH = height / this.subRows;
    const ghostColor = (typeof getComputedStyle !== 'undefined' && typeof document !== 'undefined')
      ? getComputedStyle(document.documentElement).getPropertyValue('--lcd-pixel-ghost').trim() || 'rgba(26, 43, 26, 0.08)'
      : 'rgba(26, 43, 26, 0.08)';

    this.subCtx.clearRect(0, 0, width, height);

    for (let r = 0; r < this.subRows; r++) {
      for (let c = 0; c < this.subCols; c++) {
        const x = c * cellW;
        const y = r * cellH;
        this.subCtx.strokeStyle = ghostColor;
        this.subCtx.lineWidth = 1;
        this.subCtx.strokeRect(x + 1.5, y + 1.5, cellW - 3, cellH - 3);
      }
    }
  }

  /**
   * Temporarily broadcast an accessible message to screen readers.
   * @param {string} text 
   */
  announce(text) {
    if (this.liveAnnouncer) {
      this.liveAnnouncer.textContent = text;
    }
  }

  /**
   * Reset all HUD telemetry to default level 1 state.
   */
  reset() {
    this.updateScore(0);
    this.updateLevel(1);
    this.updateSpeed(1);
    this.updateLives(3);
    this.setPaused(false);
    this.clearNextPiece();
  }
}
