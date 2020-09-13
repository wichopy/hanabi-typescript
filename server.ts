// lib/app.ts
import express = require('express');
import {Hanabi} from './hanabi';

const hanabi = new Hanabi(4)
// Create a new express application instance
const app: express.Application = express();

app.get('/', function (req, res) {
  res.json(hanabi.serialize());
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});