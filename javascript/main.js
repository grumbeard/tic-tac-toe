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
    id: 1,
    name: null,
    score: 0,
    mark: 'x',
    moves: []
  };
  const _playerTwo = {
    id: 2,
    name: null,
    score: 0,
    mark: 'o',
    moves: []
  }

  function setPlayerNames() {
    let inputs = game.form.elements;

    _playerOne.name = inputs[id="player-one-name"].value || "PLAYER 1";
    _playerTwo.name = inputs[id="player-two-name"].value || "PLAYER 2";
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
  function resetScores() {
    _playerOne.score = 0;
    _playerTwo.score = 0;
  }
  function resetMoves() {
    _playerOne.moves = [];
    _playerTwo.moves = [];
  }

  return {
    setPlayerNames,
    getPlayers,
    logMove,
    addPoint,
    resetScores,
    resetMoves
  };
})();


// Display Controller Module
// Responsibility: Render and manage changes to interface
const displayController = (function (doc) {

  function renderBoard(boardData) {
    // Clear board of existing moves
    game.gameBoard.innerHTML = "";

    let index = 0;
    boardData.forEach(cellData => {
      let cell = doc.createElement("div");
      cell.classList.add("cell");
      cell.dataset["cell"] = index;
      cell.innerText = cellData;
      if (game.gameBoard) game.gameBoard.appendChild(cell);
      index++;
    });
  }
  function updateNames(players) {
    game.playerNames[0].innerText = players[0].name.toUpperCase();
    game.playerNames[1].innerText = players[1].name.toUpperCase();
  }
  function clearInputs() {
    game.form.elements[id="player-one-name"].value = null;
    game.form.elements[id="player-two-name"].value = null;
  }
  function displayScore(players) {
    game.playerScores[0].innerText = players[0].score;
    game.playerScores[1].innerText = players[1].score;
  }
  function promptPlayer(player) {
    console.log("Please make a move", player.name);
  }
  function updateCell(index, mark) {
    let cell = game.gameBoard.children.item(index);
    cell.innerText = mark;
  }
  function hide(element) {
    if (!element.classList.contains("hide")) element.classList.add("hide");
  }
  function show(element) {
    if (element.classList.contains("hide")) element.classList.remove("hide");
  }
  function renderWinningCombo(boardData, combo) {
    boardData.forEach((mark, index) => {
      boardData[index] = (combo.includes(index)) ? mark.toUpperCase() : mark;
    });
    renderBoard(boardData);
  }
  function renderDraw(boardData, currentMark) {
    boardData.forEach((mark, index) => {
      if (mark != currentMark) {
        boardData[index] = "draw";
      }
    });
    renderBoard(boardData);
  }

  return {
    renderBoard,
    updateNames,
    clearInputs,
    displayScore,
    promptPlayer,
    updateCell,
    hide,
    show,
    renderWinningCombo,
    renderDraw
  };
// pass document element as argument to make dependency explicit
})(document);


// Game Module
// Responsibility: Manage access and changes to Game states
const game = (function (doc, gameBoard, players, displayController) {
  let _winner;
  let _players = players.getPlayers();
  let _currentPlayer;

  function init() {
    this.form = doc.getElementById("start-popup");
    this.popup = doc.querySelector(".popup-container");
    this.playerNames = [
      doc.getElementById("player-one-name"),
      doc.getElementById("player-two-name")
    ];

    this.form.addEventListener("submit", _initGame);
  }
  function _initGame(e) {
    e.preventDefault();
    console.log("start");
    displayController.hide(game.popup);
    players.setPlayerNames();
    displayController.updateNames(_players);
    displayController.clearInputs();

    // Remove unnecessary DOM caches
    game.form.removeEventListener("click", _initGame);
    delete game.form;
    delete game.popup;
    delete game.playerNames;

    _cacheDom.call(game);
    _initRound.call(game);
    _initControls.call(game);
  }
  function _cacheDom() {
    this.gameBoard = doc.getElementById("game-board");
    this.restartBtn = doc.getElementById("restart-btn");
    this.nextRoundBtn = doc.getElementById("next-round-btn");
    this.playerScores = [
      doc.getElementById("player-one-score"),
      doc.getElementById("player-two-score")
    ];
  }
  function _initRound() {
    _winner = null;
    players.resetMoves();
    _currentPlayer = _players[0];
    gameBoard.setupBoard();

    displayController.renderBoard(gameBoard.getBoard());
    _bindCellEvents();
    displayController.displayScore(_players);
    displayController.hide(game.nextRoundBtn);
    _getMove();
  }
  function _bindCellEvents() {
    game.gameBoard.childNodes.forEach(cell => {
      cell.addEventListener("click", _makeMove);
    });
  }
  function _initControls() {
    // Separate init of controls because reinitialization of controls
    // unnecessary when restarting game / setting up next round
    this.restartBtn.addEventListener("click", _restartGame);
    this.nextRoundBtn.addEventListener("click", _initRound);
  }
  function _getMove() {
    displayController.promptPlayer(_currentPlayer);
  }
  function _makeMove(e) {
    if (!e.target.innerText) {
      let index = parseInt(e.target.dataset.cell);
      e.target.removeEventListener("click", _makeMove);

      gameBoard.addMark(index, _currentPlayer.mark);
      displayController.updateCell(index, _currentPlayer.mark);
      players.logMove(_currentPlayer, index);
      _evaluateMove();
    }
  }
  function _evaluateMove() {
    // Check if a player has won
    let movesToEvaluate = _currentPlayer.moves;

    if (movesToEvaluate.length >= 5) {
      _drawRound();
    } else if (movesToEvaluate.length >= 3) {
      if (_isWinningCombination(movesToEvaluate)) {
        _makeWinner(_currentPlayer);
      } else {
        _switchCurrentPlayer();
        _getMove();
      }
    } else {
      // Else make it other player's turn
      _switchCurrentPlayer();
      _getMove();
    }
    console.log([_players[0].score, _players[1].score]);
  }
  function _isWinningCombination(moves) {
    const winningCombo = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    let result = false;

    winningCombo.forEach(combo => {
      if (combo.every(num => moves.includes(num))) {
        result = true;
        let boardData = gameBoard.getBoard();
        displayController.renderWinningCombo(boardData, combo);
      }
    });

    return result;
  }
  function _switchCurrentPlayer() {
    _currentPlayer = _currentPlayer.id == 1 ? _players[1] : _players[0];
  }
  function _makeWinner(player) {
    _winner = player;
    players.addPoint(player);
    displayController.displayScore(_players);
    _endRound();
  }
  function _drawRound() {
    console.log("DRAW");
    displayController.renderDraw(gameBoard.getBoard(), _currentPlayer.mark);
    _freezeBoard();
  }
  function _endRound() {
    console.log(_winner.name, "has won");
    _freezeBoard();
    displayController.show(game.nextRoundBtn);
  }
  function _freezeBoard() {
    game.gameBoard.childNodes.forEach(cell => {
      cell.removeEventListener("click", _makeMove);
    });
  }
  function _restartGame() {
    console.log("Restarting");
    players.resetScores();
    players.resetMoves();
    init.call(game);
    displayController.show(game.popup);
  }

  return { init };
// pass Modules as arguments to make dependency explicit
})(document, gameBoard, players, displayController);


// Init Game with IIFE
(function () { game.init() })();
