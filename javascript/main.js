// Gameboard Module
// Responsibility: Manage access and changes to Game Board states
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
// Responsibility: Manage access and changes to Player states
const players = (function () {
  const _playerOne = {
    id: "playerOne",
    score: 0,
    mark: 'X',
    moves: []
  };
  const _playerTwo = {
    id: "playerTwo",
    score: 0,
    mark: 'O',
    moves: []
  }

  function getPlayers() {
    return [_playerOne, _playerTwo];
  }
  function logMove(player, move) {
    player.moves.push(move);
  }
  function addPoint(player) {
    player.score += 1;
  }

  return {
    getPlayers,
    logMove,
    addPoint
  };
})();


// Display Controller Module
// Responsibility: Render and manage changes to interface
const displayController = (function (doc) {
  _gameBoard = doc.getElementById("game-board");

  function renderBoard(board) {
    let index = 0;
    board.forEach(mark => {
      let cell = doc.createElement("div");
      cell.classList.add("cell");
      cell.dataset["cell"] = index;
      cell.innerText = mark;
      cell.addEventListener("click", game.makeMove);
      if (_gameBoard) _gameBoard.appendChild(cell);
      index++;
    });
  }
  function promptPlayer(player) {
    console.log("Please make a move", player);
  }
  function updateCell(index, mark) {
    let cell = _gameBoard.children.item(index);
    cell.innerText = mark;
  }

  return {
    renderBoard,
    promptPlayer,
    updateCell
  };
// pass document element as argument to make dependency explicit
})(document);


// Game Module
// Responsibility: Manage access and changes to Game states
const game = (function (gameBoard, players, displayController) {
  let _winner;
  let _players = players.getPlayers();
  let _currentPlayer;

  function init() {
    _winner = null;
    _currentPlayer = _players[0];
    gameBoard.setupBoard();

    let board = gameBoard.getBoard();
    displayController.renderBoard(board);
  }
  function getMove() {
    displayController.promptPlayer(_currentPlayer.id);
  }
  function makeMove(e) {
    if (!e.target.innerText) {
      let index = parseInt(e.target.dataset.cell);
      e.target.removeEventListener("click", makeMove);

      gameBoard.addMark(index, _currentPlayer.mark);
      displayController.updateCell(index, _currentPlayer.mark);
      players.logMove(_currentPlayer, index);
      _evaluateMove();
    }
  }
  function _evaluateMove() {
    // Check if a player has won
    let movesToEvaluate = _currentPlayer.moves;

    if (movesToEvaluate.length >= 3) {
      if (_isWinningCombination(movesToEvaluate)) {
        _makeWinner(_currentPlayer);
      } else {
        _switchCurrentPlayer();
        getMove();
      }
    } else if (movesToEvaluate.length >= 5) {
      _makeWinner(_currentPlayer);
    } else {
      // Else make it other player's turn
      _switchCurrentPlayer();
      getMove();
    }
  }
  function _isWinningCombination(moves) {
    // Winning combinations will have an index sum of either
    // 3, 9, 12, 15, or 21
    let sum = moves.reduce((a, b) => a += b);
    return ([3, 9, 12 ,15 ,21].includes(sum));
  }
  function _switchCurrentPlayer() {
    _currentPlayer = _currentPlayer.id == "playerOne" ? _players[1] : _players[0];
  }
  function _makeWinner(player) {
    _winner = player;
    players.addPoint(player);
    _endGame();
  }
  function _endGame() {
    console.log(_winner.id, "has won");
  }

  return {
    init,
    getMove,
    makeMove
  };
// pass Modules as arguments to make dependency explicit
})(gameBoard, players, displayController);


// Init Game with IIFE
(function () {
  game.init();
  game.getMove();
})();
