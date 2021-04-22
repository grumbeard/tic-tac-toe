// Gameboard Module
const gameBoard = (function () {
  let _boardSize = 3;
  let _gameBoard = [];

  function getBoard() {
    return _gameBoard;
  }
  function addMark(index, mark) {
    _gameBoard.splice(index, 1, mark);
  }
  function setupBoard() {
    _gameBoard = [];
    for (let i = 0; i < _boardSize**2; i++) {
      _gameBoard.push(null);
    }
  }

  return {
    getBoard,
    addMark,
    setupBoard
  };
})();


// Players Module
const players = (function () {
  const _playerOne = {
    score: 0,
    mark: 'X'
  };
  const _playerTwo = {
    score: 0,
    mark: 'O'
  }

  function addPoint(player) {
    if (player == "playerOne") {
      _playerOne.score += 1;
    } else if (player == "playerTwo") {
      _playerTwo.score += 1;
    }
  }
  function getScores() {
    return {
      playerOne: _playerOne.score,
      playerTwo: _playerTwo.score
    };
  }

  return {
    addPoint,
    getScores
  };
})();


// Display Controller Module
const displayController = (function (doc) {
  const gameBoard = doc.getElementById("gameBoard");

  function renderBoard(board) {
    board.forEach(mark => {
      let cell = doc.createElement("div");
      cell.classList.add("cell");
      cell.innerText = mark;
      if (gameBoard) gameBoard.appendChild(cell);
    });
  }
  function askPlayer(player) {
    console.log("Please make a move", player);
  }

  return {
    renderBoard,
    askPlayer
  };
// pass document element as argument to make dependency explicit
})(document);


// Game Module
const game = (function (gameBoard, displayController) {
  let _hasEnded = false;
  let _winner = null;
  let _currentPlayer = "playerOne";

  function init() {
    _hasEnded = false;
    _winner = null;
    _currentPlayer = "playerOne";
    gameBoard.setupBoard();

    let board = gameBoard.getBoard();
    displayController.renderBoard(board);
  }
  function hasEnded() {
    return _hasEnded;
  }
  function getMove() {
    displayController.askPlayer(_currentPlayer);
  }
  function evaluateMove() {
    // Check if a player has won
    _makeWinner("playerOne");
  }
  function _makeWinner(player) {
    _winner = player;
    _endGame();
  }
  function _endGame() {
    _hasEnded = true;
    console.log(_winner, "has won");
  }

  return {
    init,
    hasEnded,
    getMove,
    evaluateMove
  };
// pass Modules as arguments to make dependency explicit
})(gameBoard, displayController);


// Init Game with IIFE
(function () {
  game.init();
  while (!game.hasEnded()) {
    game.getMove();
    game.evaluateMove();
  }
})();
