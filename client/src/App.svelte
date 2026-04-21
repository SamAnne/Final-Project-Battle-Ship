<script>
  const ws = new WebSocket("ws://localhost:3000")
  let screen = $state('menu') // 'menu' | 'game'
  let gameBoard = $state(Array.from({ length: 10 }, () => Array(10).fill(null)));
  let opponentBoard = $state(Array.from({ length: 10 }, () => Array(10).fill(null)));
  let selectedShip = $state(null)
  let orientation = $state('horizontal')
  let client_id = 0;
  let placedShips = $state([])
  let allShipsPlaced = $state(false);
  let myTurn = $state(false);
  let result = $state(null);
  const ships = [
    { name: 'Carrier', length: 5 },
    { name: 'Battleship', length: 4 },
    { name: 'Cruiser', length: 3 },
    { name: 'Submarine', length: 3 },
    { name: 'Destroyer', length: 2 },
  ]

  function selectShip(ship) {
    selectedShip = ship;
    console.log($state.snapshot(selectedShip));
  }

  function placeOnCell(x, y) {
    if (!selectedShip) return
    // validate and place
  }
  function startGame() {
    ws.send(JSON.stringify({
      type: "init"
    }));
  }

  function reset(){
    gameBoard = Array.from({ length: 10 }, () => Array(10).fill(null))
    placedShips = [];
    selectedShip = null
  }

  function ready(){
    ws.send(JSON.stringify({
      type: "status",
      status: "ready"
    }));
  }

  function placeShip(x,y){
    console.log(x,y);
    if (selectedShip){
      console.log("adding selected ship");
      let xpos = x;
      for(let i = 0; i < selectedShip.length; i++){
        gameBoard[y][xpos] = 'ship';
        xpos++;
      }
      placedShips = [...placedShips, selectedShip.name]
      selectedShip = null;
    }
  }

  function playerMove(x,y){
    ws.send(JSON.stringify({
      type: "move",
      x: x,
      y: y
    }));
  }
  
  ws.onopen = () => {
    console.log("Connected to server!");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("onmessage", data);
    if (data.type === 'status') {
      if (data.status === 'waiting') {
        screen = 'waiting'
      } else if (data.status === 'start') {
        screen = 'placement'
      } else if (data.status === 'opponentLeft') {
        screen = 'menu'
      } else if (data.status === 'game'){
        myTurn = data.turn
        screen ='game';
        ws.send(JSON.stringify({
          type: "status",
          status: "initBoard",
          board: gameBoard
        }));
      } else if (data.status === 'onr'){
        allShipsPlaced = true;
      } else if (data.status === 'win'){
        screen = 'end';
        result = data.status;
      } else if (data.status === 'lose'){
        screen = 'end';
        result = data.status;
      }
    }
    else if (data.type === 'move'){
      if (myTurn){
        opponentBoard[data.x][data.y] = data.status;
        myTurn = data.turn;
      }
      else {
        myTurn = data.turn;
        gameBoard[data.x][data.y] = data.status;
      }
    }
  }
</script>

<main>
  
  <div class="container">
    {#if screen === 'menu'}
    <div class="menu">
      <h1>Battleship</h1>
      <button onclick={startGame}>Start Game</button>
    </div>

    {:else if screen === 'waiting'}
    <div class="waiting settings">
      <h1>Waiting for opponent...</h1>
      <div class="spinner"></div>
    </div>


    {:else if screen === 'placement'}
    <h1>Battleship</h1>
    <div class="grid">
      {#each Array(10) as _, y}
        {#each Array(10) as _, x}
          <button
            class="game-square"
            onclick={() => placeShip(x, y)}
            id={"cell-${x}${y}"}
            class:hit={gameBoard[y][x] === 'hit'}
            class:miss={gameBoard[y][x] === 'miss'}
            class:ship={gameBoard[y][x] === 'ship'}
          >
          </button>
        {/each}
      {/each}
    </div>
    {#if allShipsPlaced}
      <div class="settings">
        <div class="spinner"></div>
        <p>Waiting for opponent to place ships...</p>
      </div>
    {/if}
    <div class="ships">
      {#each ships.filter(s => !placedShips.includes(s.name)) as ship}
        <div class="ship-row">
          <span>{ship.name}</span>
          <div class="ship" onclick={() => selectShip(ship)}>
            {#each Array(ship.length) as _, i}
              <div class="ship-cell"></div>
            {/each}
          </div>
        </div>
      {/each}
      {#if !allShipsPlaced}
        <div class="settingsButtons">
          <button onclick={reset}>Reset</button>
          <button onclick={ready}>Confirm</button>
        </div>
      {/if}
    </div>
    
    {:else if screen === 'game'}
      <h1>Opponent Board</h1>
      <div class="grid">
        {#each Array(10) as _, y}
          {#each Array(10) as _, x}
            <button
              class="game-square"
              onclick={() => playerMove(x, y)}
              id={"cell-${x}${y}"}
              class:hit={opponentBoard[y][x] === 'hit'}
              class:miss={opponentBoard[y][x] === 'miss'}
              class:ship={opponentBoard[y][x] === 'ship'}
              disabled={!myTurn || opponentBoard[y][x] === 'hit' || opponentBoard[y][x] === 'miss'}
            >
            </button>
          {/each}
        {/each}
      </div>
      <h1>My Board</h1>
      <div class="grid">
        {#each Array(10) as _, y}
          {#each Array(10) as _, x}
            <button
              class="game-square"
              id={"cell-${x}${y}"}
              class:hit={gameBoard[y][x] === 'hit'}
              class:miss={gameBoard[y][x] === 'miss'}
              class:ship={gameBoard[y][x] === 'ship'}
              disabled=true
            >
            </button>
          {/each}
        {/each}
      </div>
    {:else if screen === 'end'}
    <h1>You {result}!</h1>
    <button onclick={() => screen = 'menu'}>Play Again</button>
    {/if}
  </div>
</main>

<style>
  .settings{
    padding-top: 20px;
    padding-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .settingsButtons {
    padding-top: 20px;
    padding-bottom: 20px;
  }
  button.game-square {
    width: 50px;
    height: 50px;
    border: 1px black solid;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(10, 50px);
    grid-template-rows: repeat(10, 50px);
  }
  body {
    margin: 0;
    overflow-y: auto;  /* make sure scrolling is allowed */
  }
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;  /* change height to min-height */
    padding: 20px; 
  }
  .ship {
    display: flex;
    gap: 0;
  }

  .ship:hover .ship-cell{
    background-color: darkgray;
  }

  .ship-cell {
    width: 50px;
    height: 50px;
    background-color: gray;
    padding: 0;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #ccc;
    border-top-color: #333;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  button.game-square.hit { background-color: red; }
  button.game-square.miss { background-color: lightblue; }
  button.game-square.ship { background-color: gray; }
</style>