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
    }
  }
}

interface Hint {
  cardIds: number[];
  message: string;
}

class Deck {
  cards: Card[];
  constructor() {
    this.cards = this.buildDeck();
    this.shuffleDeck(this.cards)
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
  hand?: Card[];
  hints: Hint[];

  constructor(id: number){
    this.id = id
    this.hints = []
  }

  getInitialHand(cards: Card[]) {
    this.hand = cards;
  }

  receiveHint(hint: Hint) {
    this.hints.push(hint)
    console.log(this.hints)
  }

  discardCard(cardId: number) {
    if (this.hand) {
      const index = this.hand.findIndex(card => card.id === cardId)
      const card = this.hand.splice(index, 1)
      return card
    }
  }

  playCard(cardId: number): Card {
    if (this.hand) {
      const index = this.hand.findIndex(card => card.id === cardId)
      const cards = this.hand.splice(index, 1)
      return cards[0]
    }
  }

  serialize() {
    return {
      id: this.id,
      hand: this.hand?.map(card => card.serialize()),
      hints: this.hints,
    }
  }
}

export class PlaySpace {
  red: Card[];
  blue: Card[];
  yellow: Card[];
  green: Card[];

  constructor() {
    this.red = []
    this.blue = []
    this.yellow = []
    this.green = []
  }

  receivePlayCard(card: Card): boolean {
    if (card.color === CardColor.white) {
      let piles = [this.red, this.blue, this.yellow, this.green]
      if (card.value === 1) {
        for (let pile of piles) {
          if (pile.length === 0) {
            pile.push(card)
            return true
          }
        }

        return false
      }

      for (let pile of piles) {
        if (pile.length === card.value - 1) {
          pile.push(card)
          return true
        }
      }

      return false
    }

    if (card.color === CardColor.red) {
      if (this.red.length === 0)
      if (card.value !== 1) {
        return false
      } else {
        this.red.push(card)
        return true
      }
    }


    if (card.color === CardColor.green) {
      if (this.green.length === 0)
      if (card.value !== 1) {
        return false
      } else {
        this.green.push(card)
        return true
      }
    }


    if (card.color === CardColor.blue) {
      if (this.blue.length === 0)
      if (card.value !== 1) {
        return false
      } else {
        this.blue.push(card)
        return true
      }
    }


    if (card.color === CardColor.yellow) {
      if (this.yellow.length === 0)
      if (card.value !== 1) {
        return false
      } else {
        this.yellow.push(card)
        return true
      }
    }

    return false
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

  constructor(numPlayers: number) {
    this.deck = new Deck();
    this.playSpace = new PlaySpace();
    this.numPlayers = numPlayers;
    this.players = Array(this.numPlayers)
    for (let i = 0; i < this.numPlayers; i++) {
      this.players[i] = new Player(i)
    }

    this.dealInitialHands()
  }

  dealInitialHands() {
    let playerIndex = 0;
    const hands: Card[][] = []
    while(this.deck.length > 50 - this.numPlayers * 5) {
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

  giveHint(playerId: number, hint: Hint) {
    if (this.status === GameStatus.over) {
      throw new Error('Game is ended, cannot make anymore plays')
    }
    
    if (this.blueTokens === 0) {
      throw new Error('No blue tokens left, must discard a card to get more.')
    }
    this.blueTokens -= 1
    this.players[playerId].receiveHint(hint)
  }

  discardCard(playerId: number, cardId: number) {
    if (this.status === GameStatus.over) {
      throw new Error('Game is ended, cannot make anymore plays')
    }

    this.players[playerId].discardCard(cardId)
    this.blueTokens += 1
    this.players[playerId].hand?.push(this.deck.drawCard())
  }

  playCard(playerId: number, cardId: number) {
    if (this.status === GameStatus.over) {
      throw new Error('Game is ended, cannot make anymore plays')
    }

    const card = this.players[playerId].playCard(cardId)
    const success = this.playSpace.receivePlayCard(card)

    if (!success) {
      this.activateRedToken()
    }
  }

  activateRedToken() {
    this.redTokens -= 1

    if (this.redTokens === 0) {
      this.status = GameStatus.over
    }
  }

  /**
   * Return game state to the client, with the player id as a paramater.
   * The player should not be able to see their own cards.
   * 
   * @param playerId id of the player viewing the game.
   */
  serialize(playerId?: number) {
    if (playerId === undefined) {
      return this.players.map(player => player.serialize())
    }
    return this.players.filter(player => player.id !== playerId).map(player => player.serialize())
  }
}

// const hanabi = new Hanabi(4)
// console.log(hanabi.deck.cards[0])
// console.log(hanabi.deck.cards[45])
// console.log(hanabi.deck.cards[20])
// console.log(hanabi.players[0] && hanabi.players[1].hand)