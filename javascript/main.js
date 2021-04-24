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
    mark: 'x',
    moves: []
  };
  const _playerTwo = {
    id: "playerTwo",
    score: 0,
    mark: 'o',
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
  function resetScores() {
    _playerOne.score = 0;
    _playerTwo.score = 0;
  }
  function resetMoves() {
    _playerOne.moves = [];
    _playerTwo.moves = [];
  }

  return {
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
      cell.addEventListener("click", game.makeMove);
      if (game.gameBoard) game.gameBoard.appendChild(cell);
      index++;
    });
  }
  function displayScore(players) {
    game.playerScores[0].innerText = players[0].score;
    game.playerScores[1].innerText = players[1].score;
  }
  function promptPlayer(player) {
    console.log("Please make a move", player);
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
    this.startBtn = doc.getElementById("start-btn");
    this.popup = doc.querySelector(".popup-container");
    this.startBtn.addEventListener("click", _initGame);
  }
  function _initGame() {
    console.log("start");
    displayController.hide(game.popup);
    _cacheDom.call(game);
    _initRound.call(game);
    _initControls.call(game);
  }
  function _cacheDom() {
    this.gameBoard = doc.getElementById("game-board");
    this.restartBtn = doc.getElementById("restart-btn");
    this.nextRoundBtn = doc.getElementById("next-round-btn");
    this.playerScores = [
      doc.querySelector("#player-one-score"),
      doc.querySelector("#player-two-score")
    ];
  }
  function _initRound() {
    _winner = null;
    players.resetMoves();
    _currentPlayer = _players[0];
    gameBoard.setupBoard();

    displayController.renderBoard(gameBoard.getBoard());
    displayController.displayScore(_players);
    displayController.hide(game.nextRoundBtn);
    _getMove();
  }
  function _initControls() {
    // Separate init of controls because reinitialization of controls
    // unnecessary when restarting game / setting up next round
    this.restartBtn.addEventListener("click", _restartGame);
    this.nextRoundBtn.addEventListener("click", _initRound);
  }
  function _getMove() {
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
    _currentPlayer = _currentPlayer.id == "playerOne" ? _players[1] : _players[0];
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
    console.log(_winner.id, "has won");
    _freezeBoard();
    displayController.show(game.nextRoundBtn);
  }
  function _freezeBoard() {
    game.gameBoard.childNodes.forEach(cell => {
      cell.removeEventListener("click", makeMove);
    });
  }
  function _restartGame() {
    console.log("Restarting");
    players.resetScores();
    players.resetMoves();
    _initRound();
  }

  return {
    init,
    makeMove
  };
// pass Modules as arguments to make dependency explicit
})(document, gameBoard, players, displayController);


// Init Game with IIFE
(function () { game.init() })();
