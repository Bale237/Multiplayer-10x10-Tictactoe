
let clientId
let gameId
let isTurn = false
let yourSymbol
let yourColor
let socket;
let board;
let game
let round
let gameOver
let tournamentOver
let tournamentRounds

let tilesList

const connectBtn = document.getElementById('connectBtn')
const newGameBtn = document.getElementById('newGame')
newGameBtn.disabled = true;
const currGames = document.getElementById('currGames')
const joinGame = document.getElementById('join')
joinGame.disabled = true;
const userCol = document.querySelector('.flex-col1')

var HOST = location.origin.replace(/^http/, 'ws')

connectBtn.addEventListener('click', () => {
    socket = new WebSocket(HOST)
    socket.onopen = function(event) {}
    newGameBtn.addEventListener('click', () => {
        const payLoad = {
            'method': 'create',
            'clientId': clientId
        }

        socket.send(JSON.stringify(payLoad))

    })

    socket.onmessage = function(msg) {
        const data = JSON.parse(msg.data)
        switch (data.method) {
            case 'connect':
                clientId = data.clientId
                $('#playername').val('Player' + clientId);
                connectBtn.disabled = true;
                newGameBtn.disabled = false;
                joinGame.disabled = false;
                break

            case 'create':
                // inform you have successfully created the game and been added as player1
                gameId = data.game.gameId
                newGameBtn.disabled = true;
                joinGame.disabled = true;
                yourSymbol = data.game.players[0].symbol
                yourColor = data.game.players[0].color
                break

            case 'gamesAvail':
                while (currGames.firstChild) {
                    currGames.removeChild(currGames.lastChild)
                }
                const games = data.games
                games.forEach((game) => {
                    const li = document.createElement('li')
                    li.addEventListener('click', selectGame)
                    li.innerText = game
                    currGames.appendChild(li)
                })
                break

            case 'join':
                gameId = data.game.gameId
                yourSymbol = data.game.players[1].symbol
                yourColor = data.game.players[1].color
                break

            case 'initialise':
                game = data.game
                board = game.board

                game.round++
                round = game.round

                game.gameOver = false
                game.tournamentOver = false
                tournamentRounds = game.tournamentOver

                gameOver = game.gameOver
                tournamentOver = game.tournamentOver
                break

            case 'drawBoard':
                const playername = $('#playername').val().trim();

                game.players.forEach((player) => {
                    if ( playername != '' && player.clientId == +clientId && playername != player.name ) {
                      player.name = playername;
                    }
                })

                configSaveButtonHandler();

                $('#scoretable > thead').append(`<tr><th>#</th><th>${ game.players[0].name }</th><th> ${ game.players[1].name } </th></tr>`);

                $('#restartbutton').on('click', multiplayerRestartButtonHandler)
                break

            case 'updateBoard':
                game = data.game
                game.round = round
                board = game.board

                tiles = document.querySelectorAll('.tile')
                tilesList = tiles

                index = 0
                tilesList.forEach(tile => {
                    if (board[index] == 'fas fa-times'){
                      tile.querySelector('.icon').classList.add('fas', 'fa-times')

                      tile.style.backgroundColor = 'rgb(255, 153, 0)';

                    } else if (board[index] == 'far fa-circle'){
                      tile.querySelector('.icon').classList.add('far', 'fa-circle')
                      tile.style.backgroundColor = 'rgb(0, 153, 51)';
                    }else{
                        tile.addEventListener('click', clicktile)
                    }
                    index++
                })

                game.players.forEach((player) => {
                    if (player.clientId == +clientId && player.isTurn == true) {
                        isTurn = true
                    }
                })
                break

            case 'gameEnds':
                playerpiece = data.playersymbol.join(' ');
                $('#gameendmessage').css({ 'display': 'inline' }).text(`${ data.player.name } has won the game`)
                gameOver = data.gameOver;
                game.gameOver = gameOver;
                setupMultiplayerScore( data.player, playerpiece);
                // Disable config button handler
                $('#configbutton').prop('disabled', true);
                break;

            case 'draw':
                $('#gameendmessage').css({ 'display': 'inline' }).text('The game is a draw');
                gameOver = data.gameOver;
                game.gameOver = gameOver;
                setupMultiplayerScore();
                // Disable config button handler
                $('#configbutton').prop('disabled', true);
                break

            case 'restart':
                // Make the gameendmessage invisible
                $('#gameendmessage').css({ 'display': 'none' });

                // Reset to the default tile color
                $('.tile').css({ "background-color": "" });

                // Remove player pieces from the board
                let $icons = $('.icon');
                $icons.removeClass( 'fas fa-times' );
                $icons.removeClass( 'far fa-circle' );

                // Enable config button
                $('#configbutton').prop('disabled', false);
                break
        }
    }

    socket.onclose = function(event) {

    }

    socket.onerror = function(err) {

    }
})

function selectGame(src) {
    gameId = +src.target.innerText
    joinGame.addEventListener('click', joingm, { once: true })
}

function joingm() {
    const payLoad = {
        'method': 'join',
        'clientId': clientId,
        'gameId': gameId
    }

    socket.send(JSON.stringify(payLoad))
}

function clicktile(event) {

    if (!isTurn || event.target.style.backgroundColor == 'rgb(255, 153, 0)' || (event.target.style.backgroundColor == 'rgb(0, 153, 51)'))
        return

    tileIcon = []

    if(yourSymbol[0] == 'fas'){
      tileIcon[0] = 'fas'
    }else {
      tileIcon[0] = 'far'
    }

    if(yourSymbol[1] == 'fa-times'){
      tileIcon[1] = 'fa-times'
    }else{
      tileIcon[1] = 'fa-circle'
    }

    const tileColor = yourColor == 'rgb(255, 153, 0)' ? 'rgb(255, 153, 0)' : 'rgb(0, 153, 51)'

    tile = event.target
    const row = tile.getAttribute('row')
    const col = tile.getAttribute('col')
    tile.querySelector('.icon').classList.add(tileIcon[0], tileIcon[1])
    tile.style.backgroundColor = tileColor;


    const tiles = document.querySelectorAll('.tile')
    index = 0
    tilesList.forEach(tile => {
        if (tile.style.backgroundColor == 'rgb(255, 153, 0)')
            board[index] = 'fas fa-times'
        if (tile.style.backgroundColor == 'rgb(0, 153, 51)')
            board[index] = 'far fa-circle'
        index++
    })
    isTurn = false
    makeMove(row, col)
}

function makeMove(row, col) {
    index = 0
    tilesList.forEach((tile) => {
        if (tile.style.backgroundColor == 'rgb(255, 153, 0)')
            game.board[index] == 'fas fa-times'

        if (tile.style.backgroundColor == 'rgb(0, 153, 51)')
            game.board[index] == 'far fa-circle'
        index++
    })

    tiles.forEach(tile => tile.removeEventListener('click', clicktile))
    const payLoad = {
        'method': 'makeMove',
        'game': game,
        'row': row,
        'col': col
    }
    socket.send(JSON.stringify(payLoad))
}

function setupMultiplayerScore(winningPlayer, playerSymbol) {
  const round = game.round;
  let player1score = 'draw';
  let player2score = 'draw';

  // Determine scoring for the current round
    if( playerSymbol == 'fas fa-times' ){
      game.players[0].score = winningPlayer.score;
      player1score = 1;
      player2score = 0;
    }else if(playerSymbol == 'far fa-circle'){
      game.players[1].score = winningPlayer.score;
      player2score = 1;
      player1score = 0;
    }

  // Update round score in table
  $('#scoretable > tbody').append(`<tr><td>${ round }</td><td>${ player1score }</td><td>${ player2score }</td></tr>`);

  // Update total score in table footer
  $('#player1score').text( game.players[0].score );
  $('#player2score').text( game.players[1].score );


  // Tournament winner
  let tournamentWinner = '';
  let tournamentWinnerName = '';

  if ( round == game.tournamentRounds ) {
    const confettiDuration = 5000;
    game.tournamentOver = true;

      if ( game.players[0].score === game.players[1].score ) {
        // Update tournament winner message
        $('#scorefooter > h2').text('The tournament ended in a draw');
      } else {
        tournamentWinner = game.players[0].score > game.players[1].score ? 0 : 1;
        tournamentWinnerName = game.players[tournamentWinner].name;

        // Update tournament winner message
        $('#scorefooter > h2').text(`${ tournamentWinnerName } has WON the tournament`);

        // Display confetti animation
        const mp = 150;
        const particleColors = {
              colorOptions: ["DodgerBlue", "OliveDrab", "Gold", "pink", "SlateBlue", "lightblue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"],
              colorIndex: 0,
              colorIncrementer: 0,
              colorThreshold: 10
        }

        // Run confetti animation
        $.confetti.restart();
        setTimeout( function() { $.confetti.stop(); }, confettiDuration );
      }
    }
} // END setupMultiplayerScore

function multiplayerRestartButtonHandler() {
  // If round was abandoned we don't count the round
    if ( !gameOver ){
      round--;
      game.round = round
    }

  // If tournament is over we blitz the score table
  if ( tournamentOver ) {

    // Reset the score table
    setupScoreTable();

    // Reset the round counter to 0
    round = 0;
    game.round = 0;

    // Reset player scores to 0
    game.players[0].score = 0;
    game.players[1].score = 0;
  }

  const payLoad = {
      'method': 'restart',
      'game': game
  }
  socket.send(JSON.stringify(payLoad))

} // END restartButtonHandler
