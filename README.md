# Description

This program allows the user to start a game of Battleship where another user can join to begin the game. Both users can play against each other and the websocket will update each user on the moves and who won or lost.

# Installation Guide

Make sure that you have Node.js installed and download the project, then make sure all dependencies are installed as well.

# Running Project

To start the server in the server directory, use the command:
 ```bash
 node server.js
 ``` 
 This needs to be run after installing the dependences so no errors occur. Then the server will be hosted locally and will be accessible on any browser as localhost:3000. 

 To start the front-end Svelte client, use the command:
 ```bash
 npm run dev
 ```
 

# Configurations

The ships are configurable in the beginning of the game by clicking on a ship, then clicking somewhere on the grid. 

## Output

The output shows the Battleship grid of both players that is updated depending on the moves of each user. Initially, both user's place their ships and wait until the other user has finished. Then, a game of Battleship starts with both grids: one showing the user's ship placements and whether it's a hit/miss and the opponent's grid where the user can hit/miss.