const express = require('express')
const app = express()
const server = require('http').createServer(app);
const Websocket = require('ws');
const PORT = process.env.PORT || 3000
const games = {}
const INDEX = 'client.html';
const clients = {}

const wss = new Websocket.Server({ server:server })

app.use('/public', express.static(__dirname + '/public'))

app.use((req, res) => res.sendFile(INDEX, { root: __dirname }))

server.listen(PORT, () => console.log("listening on port:" + PORT))

wss.on('connection', function connection(ws){
    ws.on('open', connectionOpened)
    ws.on('close', () => {})
    ws.on('message', messageHandler)

    const clientId = Math.round(Math.random() * 100) + Math.round(Math.random() * 100) + Math.round(Math.random() * 100)
    clients[clientId] = { 'clientId': clientId, 'connection': ws }
    ws.send(JSON.stringify({ 'method': 'connect', 'clientId': clients[clientId].clientId }))
    sendAvailableGames()
})

function connectionOpened() {
    connection.send('connection with server opend')
}

function messageHandler(message) {
    const msg = JSON.parse(message)
    let player = {}
    switch (msg.method) {
        case 'create':
            // create logic
            player = {
                'clientId': msg.clientId,
                'name': 'player' + msg.clientId,
                'symbol': ['fas', 'fa-times'],
                'color': 'rgb(255, 153, 0)',
                'score': 0,
                'isTurn': true
            }
            const gameId = Math.round(Math.random() * 100) + Math.round(Math.random() * 100) + Math.round(Math.random() * 100)
            const board = new Array(parseInt(10*10));
            const round = 0
            const gameOver = false
            const tournamentRounds = 5
            const tournamentOver = false
            games[gameId] = {
                'gameId': gameId,
                'players': Array(player),
                'board': board,
                'round': round,
                'tournamentRounds': tournamentRounds,
                'tournamentOver': tournamentOver,
                'gameOver': gameOver
            }
            const payLoad = {
                'method': 'create',
                'game': games[gameId]
            }
            const conn = clients[msg.clientId].connection
            conn.send(JSON.stringify(payLoad))
            sendAvailableGames()
            break;

        case 'join':
            // join game logic
            player = {
                'clientId': msg.clientId,
                'name': 'player' + msg.clientId,
                'symbol': ['far', 'fa-circle'],
                'color': 'rgb(0, 153, 51)',
                'score': 0,
                'isTurn': false,
            }
            games[msg.gameId].players.push(player)

            clients[msg.clientId].connection.send(JSON.stringify({
                'method': 'join',
                'game': games[msg.gameId]
            }))

            initialise(games[msg.gameId])
            drawBoard(games[msg.gameId])
            makeMove(games[msg.gameId])
            break;

        case 'makeMove':
            games[msg.game.gameId].board = msg.game.board
            games[msg.game.gameId].round  = msg.game.round;

            let currPlayer
            let playerSymbol
            let winner
            const row = msg.row
            const col = msg.col
            msg.game.players.forEach((player) => {
                if (player.isTurn) {
                    currPlayer = player.clientId
                    playerSymbol = player.symbol
                    winner = player
                }
            })

            if(checkForWin(row, col, playerSymbol, games[msg.game.gameId].board)) {
              games[msg.game.gameId].gameOver = true
              winner.score++
              games[msg.game.gameId].players.forEach((player) => {
                  if (player.color == winner.color) {
                      player.score = winner.score
                  }
              })

              const payLoad = {
                  'method': 'gameEnds',
                  'playersymbol': playerSymbol,
                  'player': winner,
                  'gameOver': games[msg.game.gameId].gameOver
              }

              games[msg.game.gameId].players.forEach(player => {
                  clients[player.clientId].connection.send(JSON.stringify(payLoad))
              })
              break
            } else if (isDraw(games[msg.game.gameId].board)) {
              games[msg.game.gameId].gameOver = true
              const payLoad = {
                  'method': 'draw',
                  'gameOver': games[msg.game.gameId].gameOver
              }
              games[msg.game.gameId].players.forEach(player => {
                  clients[player.clientId].connection.send(JSON.stringify(payLoad))
              })
              break
            }
            games[msg.game.gameId].players.forEach((player) => {
                player.isTurn = !player.isTurn
            })
            makeMove(games[msg.game.gameId])
            break;

        case 'restart':
            games[msg.game.gameId].board  = new Array(parseInt(10*10));
            games[msg.game.gameId].round  = msg.game.round;

            const restart = {
                'method': 'restart',
                'game': games[msg.game.gameId]
            }

            games[msg.game.gameId].players.forEach(player => {
                clients[player.clientId].connection.send(JSON.stringify(restart))
            })

            initialise(games[msg.game.gameId])
            makeMove(games[msg.game.gameId])
            break;
    }
}

function makeMove(game) {
    const payLoad = {
        'method': 'updateBoard',
        'game': game
    }

    game.players.forEach((player) => {
        clients[player.clientId].connection.send(JSON.stringify(payLoad))
    })
}

function drawBoard(game) {
    const payLoad = {
        'method': 'drawBoard',
        'game': game
    }

    game.players.forEach((player) => {
        clients[player.clientId].connection.send(JSON.stringify(payLoad))
    })
}

function initialise(game) {
    const payLoad = {
        'method': 'initialise',
        'game': game
    }

    game.players.forEach((player) => {
        clients[player.clientId].connection.send(JSON.stringify(payLoad))
    })
}

function sendAvailableGames() {

    const allGames = []
    for (const k of Object.keys(games)) {
        if (games[k].players.length < 2) {
            allGames.push(games[k].gameId)
        }
    }
    const payLoad = { 'method': 'gamesAvail', 'games': allGames }
    for (const c of Object.keys(clients))

    { clients[c].connection.send(JSON.stringify(payLoad)) }
}

function checkForWin( row, col, piecearray, board ) {
  let rowCount = 0;
  let colCount = 0;
  let diagCount = 0;
  let revDiagCount = 0;
  let neededToWin = 5;
  let checkCol = 0;

  row = parseInt(row);
  col = parseInt(col);

  twodimensionalboard = {}
  i=0
  for ( let row = 1; row <=10; row++ ) {
    twodimensionalboard[row] = {};
    for ( let col = 1; col <=10; col++ ) {
      twodimensionalboard[row][col] = board[i];
      i++
    }
  }

  piece = piecearray.join(' ');


  for ( let i = 1; i <=10; i++ ) {
    // Check column that latest played piece is part of
    colCount += twodimensionalboard[row][i] == piece ? 1 : ( colCount * -1 );

    // Check row that latest played piece is part of
    rowCount += twodimensionalboard[i][col] == piece ? 1 : ( rowCount * -1 );

    // Check diagonal running top left to bottom right
    checkCol = col - row + i;
    if ( checkCol > 0 && checkCol <= 10 ) {
      diagCount += twodimensionalboard[i][checkCol] == piece ? 1 : ( diagCount * -1 );
    }

    // Check reverse diagonal running top right to bottom left
    checkCol = row + col - i;
    if ( checkCol > 0 && checkCol <= 10 ) {
      revDiagCount += twodimensionalboard[i][checkCol] == piece ? 1 : ( revDiagCount * -1 );
    }

    if (( rowCount == neededToWin ) || ( colCount == neededToWin ) || ( diagCount == neededToWin ) || ( revDiagCount == neededToWin )) {
      return true;
    }
  }
  return false;
}

function isDraw(board){
  for( let id = 0; id < board.length; id++){
      if(board[id] == null){
        return false
      }
  }
  return true
}
