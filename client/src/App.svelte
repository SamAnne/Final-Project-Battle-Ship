<script>
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from './assets/vite.svg'
  import heroImg from './assets/hero.png'
  import Counter from './lib/Counter.svelte'

  const ws = new WebSocket("ws://localhost:3000")
  let screen = $state('menu') // 'menu' | 'game'
  let gameBoard = $state(Array(100).fill(null));
  let selectedShip = $state(null)
  let orientation = $state('horizontal')
  let client_id = 0;
  let myTurn = null;
  const ships = [
    { name: 'Carrier', length: 5 },
    { name: 'Battleship', length: 4 },
    { name: 'Cruiser', length: 3 },
    { name: 'Submarine', length: 3 },
    { name: 'Destroyer', length: 2 },
  ]

  function selectShip(ship) {
    console.log(ship);
    selectedShip = ship
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
        myTurn = data.turn
        screen = 'placement'
      } else if (data.status === 'opponentLeft') {
        screen = 'menu'
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
    <div class="waiting">
      <h1>Waiting for opponent...</h1>
      <div class="spinner"></div>
    </div>


    {:else if screen === 'placement'}
    <h1>Battleship</h1>
    <div class="grid">
      {#each gameBoard as square, idx}
        <button class="game-square" onclick={() => playerMove(idx)}>{square}</button>
      {/each}
    </div>
    <div class="ships">
      {#each ships as ship}
        <div class="ship-row">
          <span>{ship.name}</span>
          <div class="ship" onclick={() => selectShip(ship)}>
            {#each Array(ship.length) as _, i}
              <div class="ship-cell"></div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    {/if}
  </div>
</main>

<style>
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
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
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
</style>