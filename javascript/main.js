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

  return { addPoint };
})();


// Display Controller Module
const displayController = (function (doc) {
  const gameBoard = doc.getElementById("gameBoard");

  function renderBoard(board) {
    board.forEach(mark => {
      let cell = doc.createElement("div");
      cell.classList.add("cell");
      cell.innerText = mark;
      gameBoard.appendChild(cell);
    });
  }

  return {
    renderBoard
  };
})(document);


// Game Module (IIFE)
(function () {
  const game = {
    hasGameEnded: false,
    init: function () {
      gameBoard.setupBoard();

      let board = gameBoard.getBoard();
      displayController.renderBoard(board);
    }
  }

  game.init();
})();
