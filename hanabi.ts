enum CardColor {
  red = 'red',
  yellow = 'yellow',
  green = 'green',
  blue = 'blue',
  white = 'white',
}

class Card {
  value: number;
  color: CardColor;

  constructor(value: number, color: CardColor) {
    this.value = value;
    this.color = color;
  }
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
        cards[i] = new Card(value, color);
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
  hand?: Card[];
  hints?: string[] | null;

  getInitialHand(cards: Card[]) {
    this.hand = cards;
  }

  receiveHint(hint: string) {
    this.hints?.push(hint)
  }
}

class Hanabi {
  deck: Deck;
  numPlayers: number;
  players: Player[];

  constructor(numPlayers: number) {
    this.deck = new Deck();
    this.numPlayers = numPlayers;
    this.players = Array(this.numPlayers)
    for (let i = 0; i < this.numPlayers; i++) {
      this.players[i] = new Player()
    }

    this.dealInitialHands()
  }

  dealInitialHands() {
    let playerIndex = 0;
    const hands: Card[][] = []
    while(this.deck.length >= 50 - this.numPlayers * 5) {
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
}

const hanabi = new Hanabi(4)
console.log(hanabi.deck.cards[0])
console.log(hanabi.deck.cards[45])
console.log(hanabi.deck.cards[20])
console.log(hanabi.players[0] && hanabi.players[1].hand)