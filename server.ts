// lib/app.ts
import express = require('express');
import {Hanabi} from './hanabi';
import {v4} from 'uuid'

interface PlayerSlot {
  filled: boolean;
  displayName: string;
}

function PlayerSlots(num: number): Record<number, PlayerSlot> {
  const slots: Record<number, PlayerSlot> = {}
  for (let i = 0; i < num; i++) {
    slots[i] = {
      filled: false,
      displayName: '',
    }
  }

  return slots
}

const sessions: Record<string, Hanabi> = {}
const players: Record<string, Record<number, PlayerSlot>> = {}

// Create a new express application instance
const app: express.Application = express();
app.use(express.json())

app.post('/create', function (req, res) {
  const gameId = v4()
  const { numPlayers } = req.body
  if (!numPlayers) {
    res.status(400).send('Need number of players')
    return
  }
  const game = new Hanabi(numPlayers)

  sessions[gameId] = game
  const playerSlots = PlayerSlots(numPlayers)
  playerSlots[0] = {
    filled: true,
    displayName: 'Player 0'
  }

  players[gameId] = playerSlots
  res.cookie('playerId', 0).status(201).json(gameId)
})

app.get('/session/:id', function(req, res) {
  const id = req.params.id
  const session = sessions[id]
  const playerId = req.cookies
  if (!session) {
    res.status(400).send('Invalid game ID')
    return
  }

  res.json(session.serialize(playerId))
})

app.put('/session/:id/join', function(req, res) {
  // Set player id cookie for client, sequential to join order.
  // If max players reacheda, return error.
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

export default app
