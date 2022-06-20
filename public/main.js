const tictactoe = {
  mode: 'friend',
  rows : 10,
  cols: 10,
  neededToWin: 5,
  round: 0,
  numMoves: 0,
  maxMoves: 0,
  currentPlayer: 'player1',
  gameOver: false,
  tournamentRounds: 5,
  tournamentOver: false,

  player1: {
    name: 'Player 1',
    piece: 'fas fa-times',
    color: 'rgb(255, 153, 0)',
    score: 0,
  },
  player2: {
    name: 'Player 2',
    piece: 'far fa-circle',
    color: 'rgb(0, 153, 51)',
    score: 0,
  },

  initialiseGame: function ( rows, cols ) {
    for ( let row = 1; row <= this.rows; row++ ) {
      this[row] = {};
      for ( let col = 1; col <= this.cols; col++ ) {
        this[row][col] = '';
      }
    }
    this.numMoves = 0;
    this.maxMoves = this.rows * this.cols;
    this.gameOver = false;
    this.tournamentOver = false;
    this.round++;
  }, // END initialiseGame

  alreadyFilled: function ( row, col ) {
    return this[row][col] != '';
  }, // END alreadyFilled

  playerMove: function ( row, col, piece ) {
    if ( !this.gameOver ) {
      if ( !this.alreadyFilled ( row, col )) {
        this[row][col] = piece;
        this.numMoves++;
        return true;
      }
      return false;
    }
  }, // END playerMove

  isGameDrawn: function () {
    return this.numMoves === this.maxMoves;
  }, // END isGameDrawn


  checkForWin: function ( row, col, piece ) {
    let rowCount = 0;
    let colCount = 0;
    let diagCount = 0;
    let revDiagCount = 0;
    let neededToWin = this.neededToWin;
    let checkCol = 0;

    row = parseInt(row);
    col = parseInt(col);

    for ( let i = 1; i <= this.cols; i++ ) {
      // Check column that latest played piece is part of
      colCount += this[row][i] === piece ? 1 : ( colCount * -1 );

      // Check row that latest played piece is part of
      rowCount += this[i][col] === piece ? 1 : ( rowCount * -1 );

      // Check diagonal running top left to bottom right
      checkCol = col - row + i;
      if ( checkCol > 0 && checkCol <= this.cols ) {
        diagCount += this[i][checkCol] === piece ? 1 : ( diagCount * -1 );
      }

      // Check reverse diagonal running top right to bottom left
      checkCol = row + col - i;
      if ( checkCol > 0 && checkCol <= this.cols ) {
        revDiagCount += this[i][checkCol] === piece ? 1 : ( revDiagCount * -1 );
      }

      if (( rowCount === neededToWin ) || ( colCount === neededToWin ) || ( diagCount === neededToWin ) || ( revDiagCount === neededToWin )) {
        return true;
      }
    }
    return false;
  }, // END checkForWin
 }

 if($("#mode").val().trim() == 'friend'){
   $('.player1').show();
   $('.player2').show();
   $('.play').show();
   $('.flex-col2').hide();
   $('.player').hide();
   $('#join').hide();
 } else{
   $('.flex-col2').show();
   $('.player').show();
   $('#join').show();
   $('.player1').hide();
   $('.player2').hide();
   $('.play').hide();
 };

 // Set screen defaults
 $("#mode").val(tictactoe.mode)
 $('#player1name').val(tictactoe.player1.name);
 $('#player2name').val(tictactoe.player2.name);

 $('#mode').on("change", function(event){
   var mode = $('#mode').val()|| 0;
       if (mode == 'friend') {
         $('.player1').show();
         $('.player2').show();
         $('.play').show();
         $('.flex-col2').hide();
         $('.player').hide();
         $('#join').hide();
       } else {
         $('.flex-col2').show();
         $('.player').show();
         $('#join').show();
         $('.player1').hide();
         $('.player2').hide();
         $('.play').hide();
       }
 });

const drawBoard = function ( numRows, numCols ) {
  const $gameboard = $('#gameboard');
  const gameboardWidth = parseInt($gameboard.width());
  const tileSpacing = 3;
  const tileSize = ( gameboardWidth / numCols ) - ( tileSpacing * 2 );

  // Set header message
  $('#gameheadermessage > h6').text(`Match ${ tictactoe.neededToWin } in a row to win`);

  // Set endmessage div height and width --- this is an overlay of the gameboard
  const $endmessage = $('#gameendmessage');
  const paddingTop = ( gameboardWidth / 2 ) - 60;
  const paddingLeftRight = 20;
  $endmessage.css({
    'height': `${ gameboardWidth - paddingTop }px`,
    'padding': `${ paddingTop }px ${ paddingLeftRight }px 0`,
    'width': `${ gameboardWidth - ( paddingLeftRight * 2 ) }px`
  });

  let id = 0
  for ( i = 1; i <= numRows; i++ ) {
    for ( j = 1; j <= numCols; j++ ) {
      $gameboard.append(`<div class='tile' id='${ id }' row='${ i }' col='${ j }'></div>`);

      // Add the div that will contain the played piece icon
      $('#' + id).append(`<div class='icon'></span>`);
      id++
    }
  }

  // Set width, height and margin of each tile
  const $tiles = $('.tile');
  $tiles.css({
    'height': `${ tileSize }px`,
    'width': `${ tileSize }px`,
    'margin': `${ tileSpacing }px`,
    'font-size': `${ tileSize * 0.5 }px`
  });

  const $icons = $('.icon');
  $icons.css({ 'margin-top': `${ tileSize * 0.5 / 2}px`});
} // END drawBoard

const setupScoreTable = function () {
  // Empty the score table if needed
  const $scoreTable = $('#scoretable');
  $scoreTable.empty();
  $scoreTable.append('<thead></thead>').append('<tbody></tbody>').append('<tfoot></tfoot>');

  // Initialise score table
  updateScoreTableHeader();

  $('#scoretable > tfoot').append(`<tr><td>Total</td><td id="player1score">0</td><td id="player2score">0</td></tr>`);


  // Reset the footer message
  $('#scorefooter > h2').empty();
} // END setupScoreTable

const updateScoreTableHeader = function () {
  const tournamentRounds = tictactoe.tournamentRounds;

  // Update message that appears above the score table
  $('#scoreheadermessage > h6').text(`Best of ${ tournamentRounds } ${ tournamentRounds === 1 ? ' round' : ' rounds' } Tournament`)

  // Remove the table header
  $('#scoretable > thead').empty();


  // Reset the table header player names
    const mode = tictactoe.mode
    if(mode == 'friend'){
      const player1name = tictactoe.player1.name;
      const player2name = tictactoe.player2.name;
      $('#scoretable > thead').append(`<tr><th>#</th><th>${ player1name }</th><th>${ player2name }</th></tr>`);
    }
} // END updateScoreTableHeader

const updateScoreTable = function ( winningPlayer ) {
  const round = tictactoe.round;
  let player1score = 'draw';
  let player2score = 'draw';

  // Determine scoring for the current round
  if ( winningPlayer === 'player1' || winningPlayer === 'player2' ) {
    tictactoe[winningPlayer].score++;
    player1score = winningPlayer === 'player1' ? 1 : 0;
    player2score = winningPlayer === 'player2' ? 1 : 0;
  }


  // Update round score in table
  if ( tictactoe.mode == 'friend' )
  {
    $('#scoretable > tbody').append(`<tr><td>${ round }</td><td>${ player1score }</td><td>${ player2score }</td></tr>`);

    // Update total score in table footer
    $('#player1score').text( tictactoe.player1.score );
    $('#player2score').text( tictactoe.player2.score );
  }

  // Tournament winner
  let tournamentWinner = '';
  let tournamentWinnerName = '';

  if ( round === tictactoe.tournamentRounds ) {
    const confettiDuration = 5000;
    tictactoe.tournamentOver = true;

    if ( tictactoe.player1.score === tictactoe.player2.score ) {
      // Update tournament winner message
      $('#scorefooter > h2').text('The tournament ended in a draw');
    } else {
      tournamentWinner = tictactoe.player1.score > tictactoe.player2.score ? 'player1' : 'player2';
      tournamentWinnerName = tictactoe[tournamentWinner].name;

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
} // END updateScoreTable

const tileClickHandler = function () {
  const clickedSquareId =  this.id;
  const $clickedSquare = $('#' + clickedSquareId);
  const row = $clickedSquare.attr('row');
  const col = $clickedSquare.attr('col');
  const playerPiece = tictactoe[tictactoe.currentPlayer].piece;

  if(tictactoe.playerMove ( row, col, playerPiece )){
    const $icon = $('#' + clickedSquareId + ' .icon');
    $icon.addClass( playerPiece );

    const playerColor = tictactoe[tictactoe.currentPlayer].color;
    $clickedSquare.css({ 'background-color': playerColor });

    if( tictactoe.checkForWin( row, col, playerPiece )) {
      const playerName = tictactoe[tictactoe.currentPlayer].name;
      $('#gameendmessage').css({ 'display': 'inline' }).text(`${ playerName } has won the game`)
      tictactoe.gameOver = true;
      updateScoreTable ( tictactoe.currentPlayer );
      // Game has been won - toggle players for the next round
      if( tictactoe.mode == 'computer' ) {
        tictactoe.currentPlayer === 'player1';
      }else{
        tictactoe.currentPlayer = tictactoe.currentPlayer === 'player1' ? 'player2' : 'player1';
      }
      // Disable config button handler
      $('#configbutton').prop('disabled', true);
      return true;
    } else if ( tictactoe.isGameDrawn()) {
      $('#gameendmessage').css({ 'display': 'inline' }).text('The game is a draw');
      tictactoe.gameOver = true;
      updateScoreTable ();
      // Game has been drawn - toggle players for the next round
      if( tictactoe.mode == 'computer' ) {
        tictactoe.currentPlayer === 'player1';
      }else{
        tictactoe.currentPlayer = tictactoe.currentPlayer === 'player1' ? 'player2' : 'player1';
      }
      // Disable config button handler
      $('#configbutton').prop('disabled', true);
      return true;
    }
    // Game is in progress - toggle players for the next turn in current game
    tictactoe.currentPlayer = tictactoe.currentPlayer === 'player1' ? 'player2' : 'player1';
  }

} // END tileClickHandler

const restartButtonHandler = function () {

  // If round was abandoned we don't count the round
  if ( !tictactoe.gameOver ){
    tictactoe.round--;
  }

  // If tournament is over we blitz the score table
  if ( tictactoe.tournamentOver ) {
    // Reset the score table
    setupScoreTable();

    // Reset the round counter to 0
    tictactoe.round = 0;

    // Reset player scores to 0
    tictactoe.player1.score = 0;
    tictactoe.player2.score = 0;
  }

  // Now initialise everything in the game object
  tictactoe.initialiseGame();

  // Make the gameendmessage invisible
  $('#gameendmessage').css({ 'display': 'none' });

  // Reset to the default tile color
  $('.tile').css({ "background-color": "" });

  // Remove player pieces from the board
  let $icons = $('.icon');
  $icons.removeClass( tictactoe.player1.piece );
  $icons.removeClass( tictactoe.player2.piece );

  // Enable config button
  $('#configbutton').prop('disabled', false);
} // END restartButtonHandler

const configButtonHandler = function () {
  $('.close').css({ 'display': 'inline' });
  $('#configform').css({ 'display': 'block' });

  if($("#mode").val().trim() == 'friend'){
    $('.player1').show();
    $('.player2').show();
    $('.play').show();
    $('.flex-col2').hide();
    $('.player').hide();
    $('#join').hide();
  } else{
    $('.flex-col2').show();
    $('.player').show();
    $('#join').show();
    $('.player1').hide();
    $('.player2').hide();
    $('.play').hide();
  };
  $('#mode').on("change", function(event){
		var mode = $('#mode').val()|| 0;
        if (mode == 'friend') {
          $('.player1').show();
          $('.player2').show();
          $('.play').show();
          $('.flex-col2').hide();
          $('.player').hide();
          $('#join').hide();
        } else {
          $('.flex-col2').show();
          $('.player').show();
          $('#join').show();
          $('.player1').hide();
          $('.player2').hide();
          $('.play').hide();

        }
  });

  // Set screen defaults
  $("#mode").val(tictactoe.mode)
  $('#player1name').val(tictactoe.player1.name);
  $('#player2name').val(tictactoe.player2.name);
} // END configButtonHandler

const configSaveButtonHandler = function () {
  // var gameData = e.data.arg1;
  let modeChange = false;
  let nameChange = false;

  const mode = $("#mode").val().trim();
  const player1name = $('#player1name').val().trim();
  const player2name = $('#player2name').val().trim();


  // Game Mode changes
  if ( mode != '' && mode != tictactoe.mode ) {
    tictactoe.mode = mode;
    modeChange = true;
  }

  // Player name changes
  if ( player1name != '' && player1name != tictactoe.player1.name ) {
    tictactoe.player1.name = player1name;
    nameChange = true;
  }

  if ( player2name != '' && player2name != tictactoe.player2.name ) {
    tictactoe.player2.name = player2name;
    nameChange = true;
  }

  if(tictactoe.mode != 'friend'){
    $('.tile').remove();
    drawBoard( tictactoe.rows, tictactoe.cols );
    updateScoreTableHeader();
    setupScoreTable();
    setupClickHandlers();
    setupConfigButton();
  }else {
    $('.tile').remove();
    tictactoe.initialiseGame();
    tictactoe.round = 1;
    tictactoe.currentPlayer = 'player1';
    tictactoe.player1.score = 0;
    tictactoe.player2.score = 0;
    drawBoard( tictactoe.rows, tictactoe.cols );
    updateScoreTableHeader();
    setupScoreTable();
    setupClickHandlers();
    setupConfigButton();
  }

  // Close the Menu form
  $('#closeconfig').trigger('click');
} // END configButtonSaveHandler

const setupConfigButton = function () {
  $('#closeconfig').on('click', function() {
    $('#configform').css({ 'display': 'none' });
  });
} // END setupConfigButton

const setupClickHandlers = function () {
  // Add tile click handler
  if(tictactoe.mode == 'multiplayer'){

    // Add restart button handler
    // $('#restartbutton').on('click', restartButtonHandler);

    // Add config button handler
    $('#configbutton').on('click', configButtonHandler);

    // Add config save button handler
    $('#configSaveButton').on('click', configSaveButtonHandler);

    // Add config close button handler
    setupConfigButton();
  } else {
    $('.tile').on('click', tileClickHandler);

    // Add restart button handler
    $('#restartbutton').on('click', restartButtonHandler);

    // Add config button handler
    $('#configbutton').on('click', configButtonHandler);

    // Add config save button handler
    $('#configSaveButton').on('click', configSaveButtonHandler);

    // Add config close button handler
    setupConfigButton();
  }
}

$(function() {

  // tictactoe.initialiseGame();
  // drawBoard( tictactoe.rows, tictactoe.cols );
  // Setup an empty score table
  // setupScoreTable();

  // let gameData = new Array(parseInt(tictactoe.rows*tictactoe.cols));
  // Add button handlers
   $('#configSaveButton').on('click', configSaveButtonHandler);
});
