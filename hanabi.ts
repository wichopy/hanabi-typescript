export enum CardColor {
  red = 'red',
  yellow = 'yellow',
  green = 'green',
  blue = 'blue',
  white = 'white',
}

export enum GameStatus {
  playing = 'playing',
  over = 'over',
  win = 'win',
}

export class Card {
  id: number;
  value: number;
  color: CardColor;

  constructor(id: number, value: number, color: CardColor) {
    this.id = id;
    this.value = value;
    this.color = color;
  }

  serialize() {
    return {
      value: this.value,
      color: this.color,
      id: this.id,
    }
  }
}

interface Hint {
  cardIds: number[];
  message: string;
}

class Deck {
  cards: Card[];
  constructor(cards?: Card[]) {
    if (cards) {
      this.cards = cards
    } else {
      this.cards = this.buildDeck();
      this.shuffleDeck(this.cards)
    }
  }

  serialize() {
    return this.cards.map(card => card.serialize())
  }

  get length() {
    return this.cards.length;
  }

  shuffleDeck(deck: Card[]) {
    let count = deck.length;
    while(count) {
      deck.push(deck.splice(Math.floor(Math.random() * count), 1)[0]);
      count -= 1;
    }
    // https://medium.com/swlh/the-javascript-shuffle-62660df19a5d
    // const cutDeckVariant = deck.length / 2 + Math.floor(Math.random() * 9) - 4;
    // const leftHalf = deck.splice(0, cutDeckVariant);
    // let leftCount = leftHalf.length;
    // let rightCount = deck.length - Math.floor(Math.random() * 4);
    // while(leftCount > 0) {
    //   const takeAmount = Math.floor(Math.random() * 4);
    //   deck.splice(rightCount, 0, ...leftHalf.splice(leftCount, takeAmount));
    //   leftCount -= takeAmount;
    //   rightCount = rightCount - Math.floor(Math.random() * 4) + takeAmount;
    // }
    // deck.splice(rightCount, 0, ...leftHalf);
  }

  buildDeck() {
    const cards = Array(50)
    const cardColors = [CardColor.red, CardColor.yellow, CardColor.green, CardColor.blue, CardColor.white]
    const cardValues = [1,1,1,2,2,3,3,4,4,5]

    let i = 0
    for (let color of cardColors) {
      for (let value of cardValues) {
        cards[i] = new Card(i, value, color);
        i += 1
      }
    }

    return cards;
  }

  drawCard(): Card {
    const card = this.cards.pop()
    if (card !== undefined) {
      return card
    }

    throw new Error('Deck empty')
  }
}

class Player {
  id: number;
  hand: Card[];
  hints: Hint[];
  name: string;

  constructor(id: number, name?: string, hand?: Card[], hints?: Hint[]){
    this.id = id
    this.hints = []
    this.hand = []

    if (!name) {
      this.name = `Player $${this.id}`
    } else {
      this.name = name
    }

    if (hand) {
      this.hand = hand
    }

    if (hints) {
      this.hints = hints
    }
  }

  getInitialHand(cards: Card[]) {
    this.hand = cards;
  }

  receiveHint(hint: Hint) {
    this.hints.push(hint)
  }

  discardCard(cardId: number): Card | null {
    if (this.hand.length > 0) {
      const index = this.hand.findIndex(card => card.id === cardId)
      const card = this.hand.splice(index, 1)
      return card[0]
    }

    return null
  }

  playCard(cardId: number): Card {
    const index = this.hand.findIndex(card => card.id === cardId)
    const cards = this.hand.splice(index, 1)
    return cards[0]
  }

  serialize() {
    return {
      id: this.id,
      hand: this.hand.map(card => card.serialize()),
      hints: this.hints,
      name: this.name,
    }
  }
}

export enum CardPlayStatus {
  failed = 'failed',
  success = 'success',
  pileComplete = 'pileComplete'
}

export class PlaySpace {
  [CardColor.red]: Card[];
  [CardColor.blue]: Card[];
  [CardColor.yellow]: Card[];
  [CardColor.green]: Card[];

  constructor() {
    this.red = []
    this.blue = []
    this.yellow = []
    this.green = []
  }

  serialize() {
    return {
      red: this.red.map(card => card.serialize()),
      green: this.green.map(card => card.serialize()),
      blue: this.blue.map(card => card.serialize()),
      yellow: this.yellow.map(card => card.serialize()),
    }
  }

  complete(): boolean {
    let piles = [this.red, this.blue, this.yellow, this.green]
    for (let pile of piles) {
      if (pile.length < 5) {
        return false
      }
    }

    return true
  }

  addCardToPile(card: Card): CardPlayStatus {
    if (card.color === CardColor.white) {
      throw new Error('Only non white cards can use this method')
    }

    if (this[card.color].length === 0) {
      if (card.value !== 1) {
        return CardPlayStatus.failed
      } else {
        this[card.color].push(card)
        return CardPlayStatus.success
      }
    }

    if (card.value !== this[card.color].length -1) {
      return CardPlayStatus.failed
    } else {
      this[card.color].push(card)
      if (this[card.color].length === 5) {
        return CardPlayStatus.pileComplete
      } else {
        return CardPlayStatus.success
      }
    }
  }

  receivePlayCard(card: Card): CardPlayStatus {
    if (card.color === CardColor.white) {
      let piles = [this.red, this.blue, this.yellow, this.green]
      if (card.value === 1) {
        for (let pile of piles) {
          if (pile.length === 0) {
            pile.push(card)
            return CardPlayStatus.success
          }
        }

        return CardPlayStatus.failed
      }

      for (let pile of piles) {
        if (pile.length === card.value - 1) {
          pile.push(card)
          if (pile.length === 5) {
            return CardPlayStatus.pileComplete
          }
          return CardPlayStatus.success
        }
      }

      return CardPlayStatus.failed
    }

    return this.addCardToPile(card)
  }
}

export class Hanabi {
  deck: Deck;
  numPlayers: number;
  players: Player[];
  blueTokens = 8;
  redTokens = 3;
  playSpace: PlaySpace;
  status = GameStatus.playing;
  currentTurn = 0;

  constructor(numPlayers: number, playerNames = []) {
    this.deck = new Deck();
    this.playSpace = new PlaySpace();
    this.numPlayers = numPlayers;
    this.players = Array(this.numPlayers)
    for (let i = 0; i < this.numPlayers; i++) {
      this.players[i] = new Player(i, playerNames[i])
    }

    this.dealInitialHands()
  }

  dealInitialHands() {
    let playerIndex = 0;
    let cardsPerPlayer = this.numPlayers < 5 ? 5 : 4
    const hands: Card[][] = []
    while(this.deck.length > 50 - this.numPlayers * cardsPerPlayer) {
      if (!hands[playerIndex]) {
        hands[playerIndex] = []
      }
      hands[playerIndex].push(this.deck.drawCard())
      playerIndex += playerIndex === this.numPlayers - 1 ? -(this.numPlayers-1) : 1
    }

    for (let i = 0; i < this.numPlayers; i++) {
      this.players[i].getInitialHand(hands[i])
    }
  }

  nextPlayer() {
    this.currentTurn = this.currentTurn === this.numPlayers ? 0 : this.currentTurn + 1
  }

  giveHint(playerId: number, hint: Hint) {
    if (this.status === GameStatus.over) {
      throw new Error('Game is ended, cannot make anymore plays')
    }
    
    if (this.blueTokens === 0) {
      throw new Error('No blue tokens left, must discard a card to get more.')
    }

    this.blueTokens -= 1
    this.players[playerId].receiveHint(hint)
    this.nextPlayer()
  }

  discardCard(playerId: number, cardId: number) {
    if (this.status === GameStatus.over) {
      throw new Error('Game is ended, cannot make anymore plays')
    }

    if (this.blueTokens === 8) {
      throw new Error('No blue tokens used, cannot get more.')
    }

    const discardedCard = this.players[playerId].discardCard(cardId)

    if (!discardedCard) {
      throw new Error('Card not in hand')
    }

    this.blueTokens += 1
    const drawnCard = this.deck.drawCard()
    this.players[playerId].hand.push(drawnCard)
    this.nextPlayer()
  }

  setGameOver() {
    this.status = GameStatus.over
  }

  setGameWin() {
    this.status = GameStatus.win
  }

  playCard(playerId: number, cardId: number) {
    if (this.status === GameStatus.over) {
      throw new Error('Game is ended, cannot make anymore plays')
    }

    const card = this.players[playerId].playCard(cardId)
    const playStatus = this.playSpace.receivePlayCard(card)

    if (playStatus === CardPlayStatus.failed) {
      this.activateRedToken()
      return
    }

    if (playStatus === CardPlayStatus.pileComplete && this.blueTokens < 8) {
      this.blueTokens += 1
    }

    if (this.playSpace.complete()) {
      this.setGameWin()
      return
    }

    this.nextPlayer()
  }

  activateRedToken() {
    this.redTokens -= 1

    if (this.redTokens === 0) {
      this.setGameOver()
    }
  }

  /**
   * Return game state to the client, with the player id as a paramater.
   * The player should not be able to see their own cards.
   * 
   * @param playerId id of the player viewing the game.
   */
  serialize(playerId?: number) {
    let players
    if (playerId === undefined) {
      players = this.players.map(player => player.serialize())
    } else {
      players = this.players.filter(player => player.id !== playerId).map(player => player.serialize())
    }
    return {
      deck: this.deck.serialize(),
      numPlayers: this.numPlayers,
      players,
      blueTokens: this.blueTokens,
      redTokens: this.redTokens,
      playSpace: this.playSpace.serialize(),
      status: this.status,
    }
  }
}

// const hanabi = new Hanabi(4)
// console.log(hanabi.deck.cards[0])
// console.log(hanabi.deck.cards[45])
// console.log(hanabi.deck.cards[20])
// console.log(hanabi.players[0] && hanabi.players[1].hand)