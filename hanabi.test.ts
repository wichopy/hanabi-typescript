import {Hanabi, PlaySpace, CardColor, GameStatus, CardPlayStatus } from './hanabi'
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
        hanabi.giveHint(0, hint)
        expect(hanabi.players[0].hints).toEqual([hint])
        expect(hanabi.blueTokens).toEqual(7)
      })
  
      it.todo('should only include a card color or card number in the hint')

      it('should return an error if no blue tokens are left', () => {
        hanabi.blueTokens = 0
        expect(() => hanabi.giveHint(1, {
          cardIds: [0],
          message: 'This is red'
        })).toThrow()
      })

      it('should switch players if successful', () => {
        const switchPlayerSpy = jest.spyOn(hanabi, 'nextPlayer')

        const hint = {
          cardIds:[ 0, 2],
          message: 'These 2 are red',
        }
        hanabi.giveHint(0, hint)

        expect(switchPlayerSpy).toBeCalledTimes(1)
      })

      it('should throw an error if not the players turn', () => {
        const hint = {
          cardIds:[ 0, 2],
          message: 'These 2 are red',
        }
        expect(() => hanabi.giveHint(2, hint)).toThrowError()
      })
    })

    describe('discarding cards', () => {
      it('should replace a card in player hand and increase blue tokens', () => {
        hanabi.blueTokens = 4
        const drawCardSpy = jest.spyOn(hanabi.deck, 'drawCard')
        const cardId = hanabi.players[0].hand[0].id
        hanabi.discardCard(0, cardId)

        expect(drawCardSpy).toBeCalledTimes(1)
        expect(hanabi.blueTokens).toEqual(5)
      })

      it('should not be possible if no cards are in the hand', () =>  {
        hanabi.players[0].hand = []
        expect(() => hanabi.discardCard(0, 0)).toThrow()
      })

      it('should throw an error is all blue tokens are not used', () => {
        expect(() => hanabi.discardCard(0, 0)).toThrow()
      })

      it('should switch players if successful', () => {
        const switchPlayerSpy = jest.spyOn(hanabi, 'nextPlayer')

        hanabi.blueTokens = 4
        const cardId = hanabi.players[0].hand[0].id
        hanabi.discardCard(0, cardId)

        expect(switchPlayerSpy).toBeCalledTimes(1)
      })

      it('should throw an error if not the players turn', () => {
        expect(() => hanabi.discardCard(2, 9)).toThrowError()
      })

      it('should throw an error if play doesn\'t have card id', () => {
        expect(() => hanabi.discardCard(2, 9)).toThrowError()
      })
    })

    describe('playing cards', () => {
      it('if invalid, activate a red token.', () => {
        const receivePlayCardMock = jest.fn(() => CardPlayStatus.failed)
        hanabi.playSpace.receivePlayCard = receivePlayCardMock
        hanabi.playCard(0, 0)

        expect(hanabi.redTokens).toEqual(2)
        expect(receivePlayCardMock).toBeCalledTimes(1)
      })

      it('should switch players if successful', () => {
          const switchPlayerSpy = jest.spyOn(hanabi, 'nextPlayer')
          const receivePlayCardMock = jest.fn(() => CardPlayStatus.success)
          hanabi.playSpace.receivePlayCard = receivePlayCardMock
          hanabi.playCard(0, 0)
  
          expect(switchPlayerSpy).toBeCalledTimes(1)
      })

      it('receive an additional blue token if pile complete', () => {
        const receivePlayCardMock = jest.fn(() => CardPlayStatus.pileComplete)
        hanabi.blueTokens = 5
        hanabi.playSpace.receivePlayCard = receivePlayCardMock
        hanabi.playCard(0, 0)

        expect(hanabi.blueTokens).toEqual(6)
      })

      it('no additional blue token if pile complete but all blue tokens unused', () => {
        const receivePlayCardMock = jest.fn(() => CardPlayStatus.pileComplete)
        hanabi.blueTokens = 8
        hanabi.playSpace.receivePlayCard = receivePlayCardMock
        hanabi.playCard(0, 0)

        expect(hanabi.blueTokens).toEqual(8)
      })

      it('should return an error if its not the players turn', () => {
        expect(() => hanabi.playCard(2, 0)).toThrowError()
      })

      it('After playing a card, draw a new card if cards are available in the deck', () => {
        const drawCardSpy = jest.spyOn(hanabi.deck, 'drawCard')
        hanabi.playCard(0, hanabi.players[0].hand[0].id)

        expect(drawCardSpy).toBeCalledTimes(1)
      })

      it('After playing a card, if deck is empty no cards are drawn', () => {
        const drawCardSpy = jest.spyOn(hanabi.deck, 'drawCard')
        hanabi.deck.cards = []
        hanabi.playCard(0, hanabi.players[0].hand[0].id)

        expect(drawCardSpy).toBeCalledTimes(0)
      })
    })
  })

  describe('game ending conditions', () => {
    it('game ends if all red tokens are activated', () => {
      hanabi.redTokens=1
      const receivePlayCardMock = jest.fn(() => CardPlayStatus.failed)
      hanabi.playSpace.receivePlayCard = receivePlayCardMock
      const gameOverSpy = jest.spyOn(hanabi, 'setGameOver')
      hanabi.playCard(0, 0)
      
      expect(gameOverSpy).toHaveBeenCalledTimes(1)
      expect(hanabi.redTokens).toEqual(0)
      expect(hanabi.status).toEqual(GameStatus.over)
    })

    it.todo('If all cards are drawn, put game into last turn.')
  
    it.todo('On the last turn, every player must play a card or give a hint.')

    it('game ends if all color piles are fully populated', () => {
      hanabi.playSpace.blue=Array(5).fill({ id: 0, value: 0, color: CardColor.white})
      hanabi.playSpace.red=Array(5).fill({ id: 0, value: 0, color: CardColor.white})
      hanabi.playSpace.yellow=Array(5).fill({ id: 0, value: 0, color: CardColor.white})
      hanabi.playSpace.green=Array(4).fill({ id: 0, value: 0, color: CardColor.white})

      const receivePlayCardMock = jest.fn(() => {
        hanabi.playSpace.green.push({ id: 0, value: 0, color: CardColor.white})
        return CardPlayStatus.pileComplete
      })
      hanabi.playSpace.receivePlayCard = receivePlayCardMock
      hanabi.playCard(0, 0)

      expect(hanabi.status).toEqual(GameStatus.win)
    })
  })

})

describe('Play Space', () => {
  let playSpace = new PlaySpace()

  beforeEach(() => {
    playSpace = new PlaySpace()
  })

  it('should return true on valid plays', () => {
    expect(playSpace.receivePlayCard({ id: 0, value: 1, color: CardColor.red })).toEqual(CardPlayStatus.success)
  })

  it('should include card in piles on valid plays', () => {
    expect(playSpace.receivePlayCard({ id: 0, value: 1, color: CardColor.red })).toEqual(CardPlayStatus.success)
    expect(playSpace.red.length).toEqual(1)
  })

  it('should return false on invalid plays', () => {
    expect(playSpace.receivePlayCard({ id: 0, value: 3, color: CardColor.red })).toEqual(CardPlayStatus.failed)
  })

  it('should handle white cards by auto placing them in the appropriate pile', () => {
    playSpace.blue = Array(3).fill({ id: 0, value: 0, color: CardColor.white})
    playSpace.red = Array(2).fill({ id: 0, value: 0, color: CardColor.white})
    playSpace.green = Array(4).fill({ id: 0, value: 0, color: CardColor.white})
    playSpace.yellow = Array(1).fill({ id: 0, value: 0, color: CardColor.white})

    const white3Card = { id: 0, value: 3, color: CardColor.white }
    expect(playSpace.receivePlayCard(white3Card)).toEqual(CardPlayStatus.success)
    expect(playSpace.red[2]).toEqual(white3Card)

    const white2Card = { id: 0, value: 2, color: CardColor.white }
    expect(playSpace.receivePlayCard(white2Card)).toEqual(CardPlayStatus.success)
    expect(playSpace.yellow[1]).toEqual(white2Card)
  })

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