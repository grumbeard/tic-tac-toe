// Player Factory
// Responsibility: Generate Player instances
// (Each Player) Has Knowledge Of: Player Mark, Player Moves
const createPlayer = (id, mark) => {

  const player = Object.create(playerPrototype);

  player.id = id;
  player.name = null;
  player.score = 0;
  player.mark = mark;
  player.moves = [];
  player.isComputer = false;

  return player;

};

// Player Prototype
// Responsibility: Define avaiable player behavior
const playerPrototype = {

  resetMoves: function () {
    this.moves = [];
  },

  resetScore: function () {
    this.score = 0;
  },

  addPoints: function (points) {
    this.score += points;
  },

  logMove: function (move) {
    this.moves.push(move);
  },

  makeComputer: function () {
    this.isComputer = true;
  }

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
      for (let j = 0; j < _boardSize; j++) {
        _gameBoard.push({
          row: i,
          column: j,
          mark: null
        });
      }
    }
  }

  function getBoard() {
    return _gameBoard;
  }

  function addMark(row, column, mark) {
    let cell = _gameBoard.find(cell => {
      return cell.row == row && cell.column == column;
    });
    cell.mark = mark;
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

  const _popup = doc.getElementById("popup-container");
  const _form = doc.getElementById("start-popup");
  const _gameBoard = doc.getElementById("game-board");
  const _restartBtn = doc.getElementById("restart-btn");
  const _nextRoundBtn = doc.getElementById("next-round-btn");
  const _computerBtn = doc.getElementById("computer-btn");
  const _playerNames = doc.getElementsByClassName("player-name");
  const _playerScores = doc.getElementsByClassName("player-score");


  function init() {
    // Run what doesn't need to be repeated when restarting game
    _show(_popup);
    _form.addEventListener("submit", gameController.initGame);
    _computerBtn.addEventListener("click", gameController.initWithComputer);
    _restartBtn.addEventListener("click", gameController.restartGame);
    _nextRoundBtn.addEventListener("click", gameController.startRound);
  }

  function renderStartGame(playersData) {
    // Run what doesn't need to be repeated when starting new round
    _hide(_popup);
    _updateNames(playersData);
    _displayScore(playersData);
    _clearInputs();
  }

  function renderStartRound() {
    // Run only what is necessary when setting up new round
    _hide(_nextRoundBtn);
    _gameBoard.innerHTML = "";
    _renderBoard();
  }

  function renderRestartGame() {
    _show(_popup);
  }

  function renderWin(winningMark) {
    game.getWinningCombo().forEach(move => {
      updateCell(move.row, move.column, winningMark.toUpperCase());
    });
  }

  function renderDraw(currentMark) {
    _freezeBoard();
    gameBoard.getBoard().forEach(cell => {
      if (cell.mark != currentMark) {
        updateCell(cell.row, cell.column, "draw");
      }
    });
    _show(_nextRoundBtn);
  }

  function renderEnd(playersData) {
    _freezeBoard();
    _displayScore(playersData);
    _show(_nextRoundBtn);
  }

  function _renderBoard() {
    gameBoard.getBoard().forEach(cell => {
      let cellElement = doc.createElement("div");
      cellElement.classList.add("cell");
      cellElement.dataset["row"] = cell.row;
      cellElement.dataset["column"] = cell.column;
      cellElement.innerText = cell.mark;
      cellElement.addEventListener("click", gameController.handlePlayerMove);
      _gameBoard.appendChild(cellElement);
    });
  }

  function updateCell(row, column, mark) {
    let cell = [..._gameBoard.children].find(cell => {
      return (cell.dataset.row == row) && (cell.dataset.column == column);
    });
    cell.innerText = mark;
    // Freeze cell
    cell.removeEventListener("click", gameController.makeMove);
  }

  function _updateNames(playersData) {
    playersData.forEach((player, i) => {
      player.name = _form.elements[`player-${i+1}-name-input`].value || `PLAYER ${i+1}`
      _playerNames[i].innerText = player.name.toUpperCase();
    });
  }

  function _displayScore(playersData) {
    playersData.forEach((player, i) => {
      _playerScores[i].innerText = player.score;
    });
  }

  function _clearInputs() {
    for (let i = 0; i < _playerNames.length; i++) {
      _form.elements[`player-${i+1}-name-input`].value = null;
    }
  }

  function _hide(element) {
    if (!element.classList.contains("hide")) element.classList.add("hide");
  }

  function _show(element) {
    if (element.classList.contains("hide")) element.classList.remove("hide");
  }

  function _freezeBoard() {
    _gameBoard.childNodes.forEach(cell => {
      cell.removeEventListener("click", gameController.makeMove);
    });
  }


  return {
    init,
    renderStartGame,
    renderRestartGame,
    renderStartRound,
    updateCell,
    renderWin,
    renderDraw,
    renderEnd
  };

})(document);




// Game Module
// Responsibility: Define Gameplay Logic
// Has Knowledge Of: Win Scenarios, Gameplay Logic
const game = (function () {

  let _winningCombo = null;
  const _winningCombos = [
      [{row: 0, column: 0}, {row: 0, column: 1}, {row: 0, column: 2}],
      [{row: 1, column: 0}, {row: 1, column: 1}, {row: 1, column: 2}],
      [{row: 2, column: 0}, {row: 2, column: 1}, {row: 2, column: 2}],
      [{row: 0, column: 0}, {row: 1, column: 0}, {row: 2, column: 0}],
      [{row: 0, column: 1}, {row: 1, column: 1}, {row: 2, column: 1}],
      [{row: 0, column: 2}, {row: 1, column: 2}, {row: 2, column: 2}],
      [{row: 0, column: 0}, {row: 1, column: 1}, {row: 2, column: 2}],
      [{row: 0, column: 2}, {row: 1, column: 1}, {row: 2, column: 0}]
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
          return checkMovesEqual(comboMove, playerMove);
        });
      });

      if (comboMatch) {
        result = true;
        _winningCombo = combo;
      }
    });

    return result;
  }

  function checkMovesEqual(move1, move2) {
    return (move1.row == move2.row && move1.column == move2.column);
  }

  function getWinningCombo() {
    return _winningCombo;
  }


  return {
    evaluateMoves,
    getWinningCombo
  };

})();



// Game Controller Module
// Responsibility: Implement Gameplay Logic
// Has Knowledge Of: Gameplay Logic, States in other Modules
const gameController = (function () {

  let _playerCount = 2;
  let _players = [];
  let _currentPlayer;
  let _winner;


  function initGame(e) {
    e.preventDefault();
    _initPlayers();
    displayController.renderStartGame(_players);
    startRound();
  }

  function _initPlayers() {
    let _marks = ["x", "o"]
    _players = [];
    for (let i = 0; i < _playerCount; i++) {
      _players.push(createPlayer(i, _marks[i]));
    }
  }

  function startRound() {
    _players.forEach(player => player.resetMoves());
    _currentPlayer = _players[0];
    _winner = null;
    gameBoard.resetBoard();
    displayController.renderStartRound();
  }

  function restartGame() {
    _players.forEach(player => player.resetScore());
    _players.forEach(player => player.resetMoves());

    displayController.renderRestartGame();
  }

  function _makeMove(move) {
    // Mark game board only if no mark exists for cell
    let row = move.row;
    let column = move.column;

    gameBoard.addMark(row, column, _currentPlayer.mark);
    displayController.updateCell(row, column, _currentPlayer.mark);
    _currentPlayer.logMove({ row: row, column: column });
    _handleOutcome();
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
        if (_currentPlayer.isComputer) _handleComputerMove(_currentPlayer);
    }
  }

  function _makeWinner(player) {
    _winner = player;
    player.addPoints(1);
    displayController.renderWin(_currentPlayer.mark);
    _endRound();
  }

  function _drawRound() {
    displayController.renderDraw(_currentPlayer.mark);
  }

  function _endRound() {
    displayController.renderEnd(_players);
  }

  function _switchCurrentPlayer() {
    _currentPlayer = (_currentPlayer == _players[0]) ? _players[1] : _players[0];
  }

  function initWithComputer(e) {
    initGame(e);
    _players[1].makeComputer();
  }

  function handlePlayerMove(e) {
    if (!e.target.innerText) {
      let row = parseInt(e.target.dataset.row);
      let column = parseInt(e.target.dataset.column);
      _makeMove({ row: row, column: column });
    }
  }

  function _handleComputerMove(computer) {
    let cells = gameBoard.getBoard().filter(cell => !cell.mark);
    let cell = cells[Math.floor(Math.random() * (cells.length + 1))];

    let row = cell.row;
    let column = cell.column;
    _makeMove({ row: row, column: column })
  }


  return {
    initGame,
    startRound,
    restartGame,
    initWithComputer,
    handlePlayerMove
  };

})();




// Get user input for player names
displayController.init();
