import request from "supertest"
import app from './server'

describe('Rest Api', () => {
  const agent = request.agent(app)
  test('creates new games', async () => {
    const res = await agent.post('/create')
      .send({
        numPlayers: 4,
      })
      .expect(201)
      .expect('set-cookie', 'playerId=0; Path=/')
      
    expect(res.body.length).toEqual(36)
  })

  test('returns error if number of players not defined', async() => {
      const res = await request(app).post('/create')
        .send({})
      expect(res.status).toEqual(400)
      expect(res.text).toEqual('Need number of players')
    // expect(res.statusCode).toEqual(400)
    // expect(res.error.text).toEqual('Need number of players')
  })
})