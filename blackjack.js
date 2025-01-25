class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  toString() {
    return `${this.value}${this.suit}`;
  }
}

class Deck {
  constructor() {
    this.reset();
  }

  reset() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    this.cards = [];

    for (let suit of suits) {
      for (let value of values) {
        this.cards.push(new Card(suit, value));
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() {
    return this.cards.pop();
  }
}

class BlackjackGame {
  constructor() {
    this.deck = new Deck();
    this.playerHand = [];
    this.dealerHand = [];
    this.activeHand = false;
    this.setupEventListeners();
    this.hideGameElements(); // Hide elements on initial load
  }

  hideGameElements() {
    // Hide all game elements initially
    document.querySelector('.dealer-hand').style.display = 'none';
    document.querySelector('.player-hand').style.display = 'none';
    document.querySelector('.actions').style.display = 'none';
    document.getElementById('message').style.display = 'none';
  }

  showGameElements() {
    // Hide welcome message
    document.getElementById('welcome-message').style.display = 'none';
    // Show all game elements when hand is dealt
    document.querySelector('.dealer-hand').style.display = 'block';
    document.querySelector('.player-hand').style.display = 'block';
    document.querySelector('.actions').style.display = 'flex';
    document.getElementById('message').style.display = 'block';
  }

  calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
      if (card.value === 'A') {
        aces += 1;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    for (let i = 0; i < aces; i++) {
      if (value + 11 <= 21) {
        value += 11;
      } else {
        value += 1;
      }
    }

    return value;
  }

  getBasicStrategy() {
    const playerValue = this.calculateHandValue(this.playerHand);
    const dealerUpcard = this.dealerHand[0].value;
    const dealerUpcardValue = this.calculateHandValue([this.dealerHand[0]]);
    const isPair =
      this.playerHand.length === 2 && this.playerHand[0].value === this.playerHand[1].value;
    const isSoft = this.playerHand.some((card) => card.value === 'A') && playerValue <= 21;

    // Pairs
    if (isPair) {
      if (['A', '8'].includes(this.playerHand[0].value)) return 'split';
      if (
        this.playerHand[0].value === '9' &&
        !['7', '10', 'J', 'Q', 'K', 'A'].includes(dealerUpcard)
      )
        return 'split';
      if (['2', '3', '7'].includes(this.playerHand[0].value) && dealerUpcardValue <= 7)
        return 'split';
      if (
        ['4', '6'].includes(this.playerHand[0].value) &&
        dealerUpcardValue >= 2 &&
        dealerUpcardValue <= 7
      )
        return 'split';
    }

    // Soft hands
    if (isSoft) {
      if (playerValue >= 19) return 'stand';
      if (playerValue === 18) {
        if (['2', '3', '4', '5', '6'].includes(dealerUpcard)) return 'double';
        if (['7', '8'].includes(dealerUpcard)) return 'stand';
        return 'hit';
      }
      if (playerValue === 17 && dealerUpcardValue >= 3 && dealerUpcardValue <= 6) return 'double';
      if (playerValue === 16 && dealerUpcardValue >= 4 && dealerUpcardValue <= 6) return 'double';
      if (playerValue === 15 && dealerUpcardValue >= 4 && dealerUpcardValue <= 6) return 'double';
      if (playerValue === 14 && dealerUpcardValue >= 5 && dealerUpcardValue <= 6) return 'double';
      if (playerValue === 13 && dealerUpcardValue >= 5 && dealerUpcardValue <= 6) return 'double';
      return 'hit';
    }

    // Hard hands
    if (playerValue >= 17) return 'stand';
    if (playerValue >= 13 && dealerUpcardValue <= 6) return 'stand';
    if (playerValue === 12 && dealerUpcardValue >= 4 && dealerUpcardValue <= 6) return 'stand';
    if (playerValue === 11) return 'double';
    if (playerValue === 10 && dealerUpcardValue <= 9) return 'double';
    if (playerValue === 9 && dealerUpcardValue >= 3 && dealerUpcardValue <= 6) return 'double';

    return 'hit';
  }

  setupEventListeners() {
    document.getElementById('deal').addEventListener('click', () => this.dealNewHand());
    document.getElementById('hit').addEventListener('click', () => this.handleAction('hit'));
    document.getElementById('stand').addEventListener('click', () => this.handleAction('stand'));
    document.getElementById('double').addEventListener('click', () => this.handleAction('double'));
    document.getElementById('split').addEventListener('click', () => this.handleAction('split'));
  }

  dealNewHand() {
    this.deck.reset();
    this.playerHand = [this.deck.deal(), this.deck.deal()];
    this.dealerHand = [this.deck.deal()];
    this.activeHand = true;
    this.showGameElements();
    // Clear the previous message
    document.getElementById('message').textContent = '';
    document.getElementById('message').style.backgroundColor = '';
    this.updateDisplay();
    this.updateButtonStates();
  }

  handleAction(action) {
    const correctAction = this.getBasicStrategy();
    const message = document.getElementById('message');

    if (action === correctAction) {
      message.textContent = `Correct! '${action}' is the optimal play in this situation.`;
      message.style.backgroundColor = '#4CAF50';
    } else {
      message.textContent = `Incorrect. The optimal play would be to ${correctAction}.`;
      message.style.backgroundColor = '#f44336';
    }

    this.activeHand = false;
    this.updateButtonStates();
  }

  updateButtonStates() {
    const dealButton = document.getElementById('deal');
    const actionButtons = document.querySelectorAll('.actions button');

    dealButton.disabled = this.activeHand;
    actionButtons.forEach((button) => {
      button.disabled = !this.activeHand;
    });
  }

  updateDisplay() {
    const dealerCards = document.getElementById('dealer-cards');
    const playerCards = document.getElementById('player-cards');
    const handValue = document.getElementById('hand-value');

    dealerCards.innerHTML = '';
    playerCards.innerHTML = '';

    this.dealerHand.forEach((card) => {
      dealerCards.innerHTML += `<div class="card" data-suit="${card.suit}">${card.value}${card.suit}</div>`;
    });

    this.playerHand.forEach((card) => {
      playerCards.innerHTML += `<div class="card" data-suit="${card.suit}">${card.value}${card.suit}</div>`;
    });

    handValue.textContent = `Hand Value: ${this.calculateHandValue(this.playerHand)}`;
  }
}

// Start the game
const game = new BlackjackGame();
