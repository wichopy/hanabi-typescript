import {Hanabi, PlaySpace, Card, CardColor } from './hanabi'
describe('Hanabi', () => {
  let numPlayers = 3
  let hanabi = new Hanabi(numPlayers)
  beforeEach(() => {
    hanabi = new Hanabi(numPlayers)
  })

  describe('intialize', () => {
    it('should initialize with specified number of players', () => {
      expect(hanabi.numPlayers).toEqual(3)
    })
  
    describe('when 4 or more players', () => {
      let numPlayers = 5
      let hanabi = new Hanabi(numPlayers)
      beforeEach(() => {
        hanabi = new Hanabi(numPlayers)
      })
      it('should initialize with a 50 carddeck and deal 4 cards per player ', () => {
        expect(hanabi.deck.length).toEqual(50 - 4 * numPlayers)
        for (let i = 0; i < numPlayers; i++) {
          expect(hanabi.players[i].hand.length).toEqual(4)
        }
      })
    })

    it('should initialize with a 50 carddeck and deal 5 cards per player when less than 4 players', () => {
      expect(hanabi.deck.length).toEqual(50 - 5 * numPlayers)
      for (let i = 0; i < numPlayers; i++) {
        expect(hanabi.players[i].hand.length).toEqual(5)
      }
    })

    it('should have 8 blue tokens', () => {
      expect(hanabi.blueTokens).toEqual(8)
    })

    it('should have 3 red tokens', () => {
      expect(hanabi.redTokens).toEqual(3)
    })
  })

  describe('player actions', () => {
    describe('hint giving', () => {
      it('store hints on a player and decreases blue tokens', () => {
        const hint = {
          cardIds:[ 0, 2],
          message: 'These 2 are red',
        }
        hanabi.giveHint(2, hint)
        console.log(hanabi.players[0])
        expect(hanabi.players[2].hints).toEqual([hint])
        expect(hanabi.blueTokens).toEqual(7)
      })
  
      it.todo('should only include a card color or card number in the hint')

      it.todo('should not do anything if no blu e tokens are left')
    })

    describe('discarding cards', () => {
      it.todo('should replace a card in player hand and increase blue tokens')

      it.todo('should not be pissible if the deck is empty')

      it('should not be possible if no cards are in the hand', () =>  {
        hanabi.players[0].hand = []
        expect(hanabi.discardCard(0, 0)).toEqual(false)
      })
    })

    describe('playing cards', () => {
      it('if invalid, activate a red token.', () => {
        const receivePlayCardMock = jest.fn(() => false)
        hanabi.playSpace.receivePlayCard = receivePlayCardMock
        hanabi.playCard(0, 0)

        expect(hanabi.redTokens).toEqual(2)
        expect(receivePlayCardMock).toBeCalledTimes(1)
      })
    })
  })

  describe('game ending conditions', () => {
    it.todo('game ends if all red tokens are activated')

    it.todo('game ends if all cards are played')

    it.todo('game ends if all color piles are fully populated')
  })

})

describe('Play Space', () => {
  let playSpace = new PlaySpace()

  beforeEach(() => {
    playSpace = new PlaySpace()
  })

  it('should return true on valid plays', () => {
    expect(playSpace.receivePlayCard(new Card(0, 1, CardColor.red))).toEqual(true)
  })

  it('should include card in piles on valid plays', () => {
    expect(playSpace.receivePlayCard(new Card(0, 1, CardColor.red))).toEqual(true)
    expect(playSpace.red.length).toEqual(1)
  })

  it('should return false on invalid plays', () => {
    expect(playSpace.receivePlayCard(new Card(0, 3, CardColor.red))).toEqual(false)
  })

  it.todo('should handle white cards by auto placing them in the appropriate pile')

  it.todo('should allow a user to specify which coloumn they want to place a white card if there is more than 1 possibility.')

  it('should determine if all the color piles are not fully populated', () => {
    playSpace.blue = Array(4)
    playSpace.red = Array(5)
    playSpace.green = Array(5)
    playSpace.yellow = Array(5)

    expect(playSpace.complete()).toBeFalsy()
  })

  it('should determine if all the color piles are populated', () => {
    playSpace.blue = Array(5)
    playSpace.red = Array(5)
    playSpace.green = Array(5)
    playSpace.yellow = Array(5)

    expect(playSpace.complete()).toBeTruthy()
  })
})