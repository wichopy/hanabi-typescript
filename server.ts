// lib/app.ts
import express = require('express');
import {Hanabi} from './hanabi';
import {v4} from 'uuid'
const hanabi = new Hanabi(4)

const sessions: Record<string, Hanabi> = {}
// Create a new express application instance
const app: express.Application = express();
app.use(express.json())

app.get('/', function (req, res) {
  res.json(hanabi.serialize());
});

app.post('/create', function (req, res) {
  const gameId = v4()

  const { numPlayers } = req.body
  if (!numPlayers) {
    res.status(400).send('Need number of players')
    return
  }
  const game = new Hanabi(numPlayers)

  sessions[gameId] = game
  res.json(gameId)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});