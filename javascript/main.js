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
    id: "playerOne",
    score: 0,
    mark: 'X'
  };
  const _playerTwo = {
    id: "playerTwo",
    score: 0,
    mark: 'O'
  }

  function getPlayers() {
    return [_playerOne, _playerTwo];
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
    getPlayers,
    addPoint,
    getScores
  };
})();


// Display Controller Module
const displayController = (function (doc) {
  _gameBoard = doc.getElementById("gameBoard");

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
  function askPlayer(player) {
    console.log("Please make a move", player);
  }
  function updateCell(index, mark) {
    let cell = _gameBoard.children.item(index);
    cell.innerText = mark;
  }

  return {
    renderBoard,
    askPlayer,
    updateCell
  };
// pass document element as argument to make dependency explicit
})(document);


// Game Module
const game = (function (gameBoard, displayController) {
  let _winner;
  let _currentPlayer;

  function init() {
    _winner = null;
    _currentPlayer = players.getPlayers()[0];
    gameBoard.setupBoard();

    let board = gameBoard.getBoard();
    displayController.renderBoard(board);
  }
  function getMove() {
    displayController.askPlayer(_currentPlayer.id);
  }
  function makeMove(e) {
    if (!e.target.innerText) {
      let index = e.target.dataset.cell;
      gameBoard.addMark(index, _currentPlayer.mark);
      displayController.updateCell(index, _currentPlayer.mark);
      _evaluateMove();
    }
  }
  function _evaluateMove() {
    // Check if a player has won
    let board = gameBoard.getBoard();
    if (!board.includes(null)) {
      _makeWinner(_currentPlayer)
    } else {
      // Else make it other player's turn
      _switchCurrentPlayer();
      getMove();
    }
  }
  function _switchCurrentPlayer() {
    switch (_currentPlayer.id) {
      case "playerOne":
        _currentPlayer = players.getPlayers()[1];
        break;
      case "playerTwo":
        _currentPlayer = players.getPlayers()[0];
        break;
    }
  }
  function _makeWinner(player) {
    _winner = player;
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
})(gameBoard, displayController);


// Init Game with IIFE
(function () {
  game.init();
  game.getMove();
})();
