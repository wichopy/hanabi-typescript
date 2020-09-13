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
    })

    describe('playing cards', () => {
      it.todo('if valid, include cards in the valid cards pile.')

      it.todo('if invalid, activate a red token.')
    })
  })

  describe('game ending conditions', () => {
    it.todo('game ends if all red tokens are activated')

    it.todo('game ends if all cards are played')

    it.todo('game ends if all colors are fulling populated')
  })

})