import { WebSocketServer } from 'ws' 

const wss = new WebSocketServer({ port: 3000 })

const games = {} // store game state here
let client_id = 0;
let waitingPlayer = null;

wss.on('connection', (ws) => {
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data)
    if (msg.type === "init"){
      if (waitingPlayer === null) {
        // first player, make them wait
        waitingPlayer = ws
        client_id++
        ws.send(JSON.stringify({ type: 'status', status: 'waiting', id: client_id }))
      } else {
        // second player joined, start the game
        const opponent = waitingPlayer
        waitingPlayer = null

        ws.send(JSON.stringify({ type: 'status', status: 'start', turn: false }))
        opponent.send(JSON.stringify({ type: 'status', status: 'start', turn: true }))

        // link the two players to each other
        ws.opponent = opponent
        opponent.opponent = ws
      }
    }
  })
})