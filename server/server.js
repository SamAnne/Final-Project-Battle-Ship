import { WebSocketServer } from 'ws' 

const wss = new WebSocketServer({ port: 3000 })
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

        ws.send(JSON.stringify({ type: 'status', status: 'start'}))
        opponent.send(JSON.stringify({ type: 'status', status: 'start'}))

        // link the two players to each other
        ws.opponent = opponent
        opponent.opponent = ws
      }
    }
    if (msg.type === "status"){
      if (msg.status === "ready"){
        ws.ready = true;
        console.log("player ready");
        if (ws.opponent.ready){
          console.log("opponent ready");
          ws.send(JSON.stringify({ type: 'status', status: 'game', turn: false }));
          ws.opponent.send(JSON.stringify({ type: 'status', status: 'game', turn: true }));
        }
        else {
          console.log("opponent not ready");
          ws.send(JSON.stringify({ type: 'status', status: 'onr' })); // onr stands for opponent not ready
        }
      }
      else if (msg.status === "initBoard"){
        ws.board = msg.board;
      }
    }
    if (msg.type === "move"){
      let result;
      if (ws.opponent.board[msg.y][msg.x] === 'ship'){
        ws.opponent.board[msg.y][msg.x] = 'hit';
        result = 'hit';
      }
      else {
        result = 'miss';
      }
      ws.send(JSON.stringify({ type: 'move', status: result, x: msg.y, y: msg.x, turn: false }));
      ws.opponent.send(JSON.stringify({ type: 'move', status: result, x: msg.y, y: msg.x, turn: true }));
      if (ws.opponent.board.every(row => row.every(cell => cell !== 'ship'))){
        ws.send(JSON.stringify({type: "status", status: "win"}));
        ws.opponent.send(JSON.stringify({type: "status", status: "lose"}));
      }
    }
  })

  ws.on('close', ()=> {
    if (waitingPlayer === ws) {
      waitingPlayer = null
      return
    }

    // if they were in a game, let opponent know
    if (ws.opponent) {
      ws.opponent.send(JSON.stringify({ type: 'status', status: 'ol' })) // ol = opponent left
      ws.opponent.opponent = null 
    }
  });
})