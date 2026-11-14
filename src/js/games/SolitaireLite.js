/**
 * Retro Brick Game Console - SolitaireLite
 * Cyber-deck sorting card game with tableau columns, waste pile, and foundations.
 */

import { BaseGame } from '../core/BaseGame.js';

export class SolitaireLite extends BaseGame {
  constructor() {
    super('solitaire-lite', 'Solitaire Lite', 'Card');
    this.deck = []; // { rank: 1..7, suit: 1|2 } (1=solid, 2=hollow)
    this.waste = [];
    this.foundations = [[], []]; // foundation 0: suit 1, foundation 1: suit 2
    this.tableau = [[], [], [], []]; // 4 columns
    this.selected = null; // { zone: 'waste'|'tableau', col: number, cardIndex: number }
    this.cursor = { zone: 'deck', col: 0 }; // zones: 'deck', 'waste', 'found0', 'found1', 'col0'..'col3'
  }

  init(context) {
    super.init(context);
    this.initDeck();
  }

  initDeck() {
    // 28 cards total: 2 sets of ranks 1..7 for 2 suits
    const allCards = [];
    for (let s = 1; s <= 2; s++) {
      for (let r = 1; r <= 7; r++) {
        allCards.push({ rank: r, suit: s });
        allCards.push({ rank: r, suit: s });
      }
    }

    // Shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    this.foundations = [[], []];
    this.waste = [];
    this.tableau = [[], [], [], []];

    // Deal to 4 tableau columns
    for (let col = 0; col < 4; col++) {
      for (let i = 0; i <= col; i++) {
        this.tableau[col].push(allCards.pop());
      }
    }

    this.deck = allCards;
    this.selected = null;
    this.cursor = { zone: 'deck', col: 0 };
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isPaused || this.isOver) return;

    const input = this.context.input;
    const sound = this.context.sound;

    // Draw card from Deck (Select button or cursor on deck + Button A)
    if (input.isJustPressed('SELECT')) {
      this.drawCardFromDeck();
      return;
    }

    // Cursor Navigation
    if (input.isJustPressed('UP')) {
      if (this.cursor.zone.startsWith('col')) {
        this.cursor.zone = 'waste';
        sound.playMove();
      }
    } else if (input.isJustPressed('DOWN')) {
      if (!this.cursor.zone.startsWith('col')) {
        this.cursor.zone = 'col0';
        this.cursor.col = 0;
        sound.playMove();
      }
    } else if (input.isJustPressed('LEFT')) {
      if (this.cursor.zone === 'waste') this.cursor.zone = 'deck';
      else if (this.cursor.zone === 'found1') this.cursor.zone = 'found0';
      else if (this.cursor.zone.startsWith('col') && this.cursor.col > 0) {
        this.cursor.col--;
        this.cursor.zone = `col${this.cursor.col}`;
      }
      sound.playMove();
    } else if (input.isJustPressed('RIGHT')) {
      if (this.cursor.zone === 'deck') this.cursor.zone = 'waste';
      else if (this.cursor.zone === 'found0') this.cursor.zone = 'found1';
      else if (this.cursor.zone.startsWith('col') && this.cursor.col < 3) {
        this.cursor.col++;
        this.cursor.zone = `col${this.cursor.col}`;
      }
      sound.playMove();
    }

    // Action A (Pick up / Drop card)
    if (input.isJustPressed('ACTION_A')) {
      if (this.cursor.zone === 'deck') {
        this.drawCardFromDeck();
      } else if (!this.selected) {
        // Pick up card
        if (this.cursor.zone === 'waste' && this.waste.length > 0) {
          this.selected = { zone: 'waste', card: this.waste[this.waste.length - 1] };
          sound.playRotate();
        } else if (this.cursor.zone.startsWith('col')) {
          const colCards = this.tableau[this.cursor.col];
          if (colCards.length > 0) {
            this.selected = { zone: 'tableau', col: this.cursor.col, card: colCards[colCards.length - 1] };
            sound.playRotate();
          }
        }
      } else {
        // Drop card onto destination
        this.tryMoveSelectedCard();
      }
    }

    // Auto-move to Foundation (Button B)
    if (input.isJustPressed('ACTION_B')) {
      this.autoMoveToFoundation();
    }
  }

  drawCardFromDeck() {
    const sound = this.context.sound;
    if (this.deck.length > 0) {
      this.waste.push(this.deck.pop());
      sound.playMove();
    } else if (this.waste.length > 0) {
      // Re-deal waste to deck
      this.deck = this.waste.reverse();
      this.waste = [];
      sound.playRotate();
    }
  }

  tryMoveSelectedCard() {
    const sound = this.context.sound;
    const { card, zone, col } = this.selected;

    if (this.cursor.zone.startsWith('col')) {
      const destCol = this.cursor.col;
      const targetColCards = this.tableau[destCol];

      let canPlace = false;
      if (targetColCards.length === 0) {
        // Empty column accepts any card
        canPlace = true;
      } else {
        const topCard = targetColCards[targetColCards.length - 1];
        // Must be descending rank and alternating suit
        if (card.rank === topCard.rank - 1 && card.suit !== topCard.suit) {
          canPlace = true;
        }
      }

      if (canPlace) {
        // Remove from source
        if (zone === 'waste') this.waste.pop();
        else if (zone === 'tableau') this.tableau[col].pop();

        targetColCards.push(card);
        this.addScore(25);
        sound.playScore();
      } else {
        sound.playBounce();
      }
    }
    this.selected = null;
  }

  autoMoveToFoundation() {
    const sound = this.context.sound;
    let cardToMove = null;
    let removeSource = null;

    if (this.cursor.zone === 'waste' && this.waste.length > 0) {
      cardToMove = this.waste[this.waste.length - 1];
      removeSource = () => this.waste.pop();
    } else if (this.cursor.zone.startsWith('col')) {
      const colCards = this.tableau[this.cursor.col];
      if (colCards.length > 0) {
        cardToMove = colCards[colCards.length - 1];
        removeSource = () => colCards.pop();
      }
    }

    if (cardToMove) {
      const fIdx = cardToMove.suit - 1;
      const fStack = this.foundations[fIdx];
      const expectedRank = fStack.length === 0 ? 1 : fStack[fStack.length - 1].rank + 1;

      if (cardToMove.rank === expectedRank) {
        removeSource();
        fStack.push(cardToMove);
        this.addScore(150);
        sound.playLevelUp();
        this.checkWin();
      } else {
        sound.playBounce();
      }
    }
  }

  checkWin() {
    if (this.foundations[0].length === 7 && this.foundations[1].length === 7) {
      this.context.sound.playVictory();
      this.addScore(3000);
      this.gameOver();
    }
  }

  render(context) {
    super.render(context);
    const renderer = context.renderer;

    // 1. Draw Deck (x=0..1, y=1..2)
    if (this.deck.length > 0) {
      renderer.drawRect(0, 1, 2, 2, 1, false);
    }
    // 2. Draw Waste (x=3..4, y=1..2)
    if (this.waste.length > 0) {
      const topWaste = this.waste[this.waste.length - 1];
      renderer.drawRect(3, 1, 2, 2, topWaste.suit, true);
    }

    // 3. Draw Foundations (x=6..7, x=8..9, y=1..2)
    renderer.drawRect(6, 1, 2, 2, 1, false);
    renderer.drawRect(8, 1, 2, 2, 2, false);

    // 4. Draw Tableau Columns (Cols 0, 3, 6, 9, rows 5..18)
    const colXs = [0, 3, 6, 9];
    for (let c = 0; c < 4; c++) {
      const cards = this.tableau[c];
      const px = colXs[c];
      for (let i = 0; i < cards.length; i++) {
        const py = 5 + i * 2;
        if (py < 19) {
          renderer.drawRect(px, py, 2, 2, cards[i].suit, true);
        }
      }
    }

    // 5. Draw Cursor
    if (this.cursor.zone === 'deck') renderer.drawRect(0, 1, 2, 2, 2, false);
    else if (this.cursor.zone === 'waste') renderer.drawRect(3, 1, 2, 2, 2, false);
    else if (this.cursor.zone.startsWith('col')) {
      const px = colXs[this.cursor.col];
      const colCards = this.tableau[this.cursor.col];
      const py = Math.min(18, 5 + colCards.length * 2);
      renderer.drawRect(px, py, 2, 2, 2, false);
    }
  }
}
