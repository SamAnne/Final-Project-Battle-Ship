import { WebSocketServer } from 'ws' 

const wss = new WebSocketServer({ port: 3000 })

const games = {} // store game state here

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const msg = JSON.parse(data)
  })
})