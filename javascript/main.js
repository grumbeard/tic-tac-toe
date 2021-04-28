// Player Factory
// Responsibility: Generate Player instances
// (Each Player) Has Knowledge Of: Player Mark, Player Moves
const playerFactory = (id, mark) => {
  // const person = Object.create(player.prototype);

  function resetMoves() {
    this.moves = [];
  }
  function resetScore() {
    this.score = 0;
  }
  function addPoints(points) {
    this.score += points;
  }
  function logMove(move) {
    this.moves.push(move);
  }

  return {
    id: id,
    name: null,
    score: 0,
    mark: mark,
    moves: [],
    resetMoves,
    resetScore,
    addPoints,
    logMove
  };
};


// Gameboard Module
// Responsibility: Manage access and changes to Game Board states
// Has Knowledge Of: Marks on Game Board
const gameBoard = (function () {
  let _boardSize = 3;
  let _gameBoard;


  function resetBoard() {
    // Empty existing gameboard if exists
    _gameBoard = [];
    for (let i = 0; i < _boardSize; i++) {
      _gameBoard[i] = [];
      for (let j = 0; j < _boardSize; j++) {
        _gameBoard[i].push(null);
      }
    }
  }
  function getBoard() {
    return _gameBoard;
  }
  function addMark(rowIndex, columnIndex, mark) {
    _gameBoard[rowIndex].splice(columnIndex, 1, mark);
  }


  return {
    resetBoard,
    getBoard,
    addMark
  };
})();


// Display Controller Module
// Responsibility: Render and manage changes to interface
// Has Knowledge Of: DOM objects, Interface Design
const displayController = (function (doc) {
  // public variables
  const dom = {
    gameBoard: null,
    restartBtn: null,
    nextRoundBtn: null,
  };

  // private variables
  let _playerScores;


  function initPopup() {
    // These temporary properties will be removed after game start
    dom.form = doc.getElementById("start-popup");
    dom.popup = doc.querySelector(".popup-container");
    _show(dom.popup);
  }
  function renderStartGame(playersData) {
    _hide(dom.popup);
    _cacheDom();
    _updateNames(playersData);
    _displayScore(playersData);
    _clearInputs();

    // Remove unnecessary DOM caches
    delete dom.form;
    delete dom.popup;
    delete dom._playerNames;
  }
  function _updateNames(playersData) {
    let inputs = dom.form.elements;
    playersData[0].name = inputs["player-one"].value || "PLAYER 1";
    playersData[1].name = inputs["player-two"].value || "PLAYER 2";

    // This temporary property will be removed after game start
    dom.playerNames = [
      doc.getElementById("player-one-name"),
      doc.getElementById("player-two-name")
    ];
    dom.playerNames[0].innerText = playersData[0].name.toUpperCase();
    dom.playerNames[1].innerText = playersData[1].name.toUpperCase();
  }
  function _cacheDom() {
    dom.gameBoard = doc.getElementById("game-board");
    dom.restartBtn = doc.getElementById("restart-btn");
    dom.nextRoundBtn = doc.getElementById("next-round-btn");
    _playerScores = [
      doc.getElementById("player-one-score"),
      doc.getElementById("player-two-score")
    ];
  }
  function renderStartRound(boardData) {
    // Clear board of existing moves
    _hide(dom.nextRoundBtn);
    dom.gameBoard.innerHTML = "";

    let rowIndex = 0;
    boardData.forEach(rowData => {
      let columnIndex = 0;
      rowData.forEach(cellData => {
        let cell = doc.createElement("div");
        cell.classList.add("cell");
        cell.dataset["row"] = rowIndex;
        cell.dataset["column"] = columnIndex;
        cell.innerText = cellData;
        dom.gameBoard.appendChild(cell);
        columnIndex++;
      })
      rowIndex++;
    });
  }
  function _clearInputs() {
    dom.form.elements["player-one"].value = null;
    dom.form.elements["player-two"].value = null;
  }
  function _displayScore(playersData) {
    _playerScores[0].innerText = playersData[0].score;
    _playerScores[1].innerText = playersData[1].score;
  }
  function updateCell(rowIndex, columnIndex, mark) {
    let cell = [...dom.gameBoard.children].find(cell => {
      return (cell.dataset.row == rowIndex) && (cell.dataset.column == columnIndex);
    });
    cell.innerText = mark;
  }
  function _hide(element) {
    if (!element.classList.contains("hide")) element.classList.add("hide");
  }
  function _show(element) {
    if (element.classList.contains("hide")) element.classList.remove("hide");
  }
  function renderWinningCombo(boardData, combo, winningMark) {
    combo.forEach(move => {
      boardData[move[0]][move[1]] = winningMark.toUpperCase();
    });
    renderStartRound(boardData);
  }
  function renderDraw(boardData, currentMark) {
    boardData.forEach(row => {
      row.forEach((mark, columnIndex) => {
        if (mark != currentMark) {
          row[columnIndex] = "draw";
        }
      });
    });
    renderStartRound(boardData);
    _show(dom.nextRoundBtn);
  }
  function renderEnd(playersData) {
    _displayScore(playersData);
    _show(dom.nextRoundBtn);
  }


  return {
    initPopup,
    renderStartGame,
    renderStartRound,
    updateCell,
    renderWinningCombo,
    renderDraw,
    renderEnd,
    dom
  };
// pass document element as argument to make dependency explicit
})(document);


// Game Module
// Responsibility: Define Gameplay Logic
// Has Knowledge Of: Win Scenarios, Gameplay Logic
const game = (function () {
  let _winningCombo = null;
  const _winningCombos = [
      [[0,0], [0,1], [0,2]],
      [[1,0], [1,1], [1,2]],
      [[2,0], [2,1], [2,2]],
      [[0,0], [1,0], [2,0]],
      [[0,1], [1,1], [2,1]],
      [[0,2], [1,2], [2,2]],
      [[0,0], [1,1], [2,2]],
      [[0,2], [1,1], [2,0]]
    ];


  function evaluateMoves(moves) {
    // Check if a player has won
    let result = null;
    if (moves.length >= 3) {
      if (_isWinningCombination(moves)) {
        result = "win"
      } else if (moves.length >= 5) {
        result = "draw";
      }
    }
    return result;
  }
  function _isWinningCombination(moves) {
    let result = false;
    _winningCombos.forEach(combo => {
      // Check if each move in this winning combo can be found in player's moves
      let comboMatch = combo.every(comboMove => {
        return moves.some(playerMove => {
          return checkArraysEqual(comboMove, playerMove);
        });
      });

      if (comboMatch) {
        result = true;
        _winningCombo = combo;
      }
    });

    return result;
  }
  function checkArraysEqual(arr1, arr2) {
    if (arr1.length != arr2.length) return false;
    // Check if array elements are equal and in same order
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] != arr2[i]) return false;
    }
    return true;
  }
  function getWinningCombo() {
    return _winningCombo;
  }


  return {
    evaluateMoves,
    getWinningCombo
  };
// pass Modules as arguments to make dependency explicit
})();



// Game Controller Module
// Responsibility: Implement Gameplay Logic
// Has Knowledge Of: Gameplay Logic, States in other Modules
const gameController = (function (gameBoard, playerFactory, displayController) {
  let _playerCount = 2;
  let _players = [];
  let _currentPlayer;
  let _gameBoard;
  let _winner;


  function initGame(e) {
    e.preventDefault();

    _initPlayers();
    displayController.renderStartGame(_players);

    _initControls();
    _initRound();
  }
  function _initPlayers() {
    let _marks = ["x", "o"]
    for (let i = 0; i < _playerCount; i++) {
      _players.push(playerFactory(i, _marks[i]));
    }
  }
  function _initGameBoard() {
    gameBoard.resetBoard();
    _gameBoard = gameBoard.getBoard();
  }
  function _initRound() {
    _initGameBoard();
    _players.forEach(player => player.resetMoves());
    _currentPlayer = _players[0];
    _winner = null;
    displayController.renderStartRound(_gameBoard);
    _initGameBoardSensors();
  }
  function _initGameBoardSensors() {
    displayController.dom.gameBoard.childNodes.forEach(cell => {
      cell.addEventListener("click", _makeMove);
    });
  }
  function _initControls() {
    // Separate init of controls because reinitialization of controls
    // unnecessary when restarting game / setting up next round
    displayController.dom.restartBtn.addEventListener("click", _restartGame);
    displayController.dom.nextRoundBtn.addEventListener("click", _initRound);
  }
  function _restartGame() {
    _players.forEach(player => player.resetScore());
    _players.forEach(player => player.resetMoves());

    displayController.initPopup();
  }
  function _makeMove(e) {
    // Mark game board only if no mark exists for cell
    if (!e.target.innerText) {
      let row = parseInt(e.target.dataset.row);
      let column = parseInt(e.target.dataset.column);
      // Freeze cell
      e.target.removeEventListener("click", _makeMove);

      gameBoard.addMark(row, column, _currentPlayer.mark);
      displayController.updateCell(row, column, _currentPlayer.mark);
      _currentPlayer.logMove([row, column]);
      _handleOutcome();
    }
  }
  function _handleOutcome() {
    let outcome = game.evaluateMoves(_currentPlayer.moves);

    switch (outcome) {
      case "win":
        _makeWinner(_currentPlayer);
        break
      case "draw":
        _drawRound();
        break
      // Else make it other player's turn
      default:
        _switchCurrentPlayer();
    }

  }
  function _makeWinner(player) {
    _winner = player;
    player.addPoints(1);
    displayController.renderWinningCombo(_gameBoard, game.getWinningCombo(), _currentPlayer.mark);
    _endRound();
  }
  function _drawRound() {
    _freezeBoard();
    displayController.renderDraw(_gameBoard, _currentPlayer.mark);
  }
  function _endRound() {
    _freezeBoard();
    displayController.renderEnd(_players);
  }
  function _switchCurrentPlayer() {
    _currentPlayer = (_currentPlayer == _players[0]) ? _players[1] : _players[0];
  }
  function _freezeBoard() {
    displayController.dom.gameBoard.childNodes.forEach(cell => {
      cell.removeEventListener("click", _makeMove);
    });
  }



  return { initGame };
})(gameBoard, playerFactory, displayController);



// Get user input for player names
displayController.initPopup();
displayController.dom.form.addEventListener("submit", gameController.initGame);
