import {Hanabi} from './hanabi'

describe('Hanabi', () => {
  const numPlayers = 4
  let hanabi = new Hanabi(numPlayers)
  beforeEach(() => {
    hanabi = new Hanabi(numPlayers)
  })

  describe('intialize', () => {
    it('should initialize with specified number of players', () => {
      expect(hanabi.numPlayers).toEqual(4)
    })
  
    it('should initialize with a 50 carddeck and deal 5 x num players', () => {
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

  describe('hint giving', () => {
    it('store hints on a player', () => {
      const hint = {
        cardIds:[ 0, 2],
        message: 'These 2 are red',
      }
      hanabi.giveHint(2, hint)
      console.log(hanabi.players[0])
      expect(hanabi.players[2].hints).toEqual([hint])
    })

    it.todo('should only include a card color or card number in the hint')
  })
})