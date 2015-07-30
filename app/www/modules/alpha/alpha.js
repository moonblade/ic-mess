angular.module('Gunt.alpha', ['ionic', 'Gunt.controllers', 'ngOpenFB', 'Gunt.factories', 'Gunt'])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $stateProvider
        .state('app.gateone', {
            url: '/gateone',
            views: {
                'menuContent': {
                    templateUrl: 'modules/alpha/views/tictactoe.html',
                    controller: 'TicTacToeCtrl'
                },
                'fabContent': {
                    template: ''
                }
            }
        })

    ;
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/login');
})


.controller('TicTacToeCtrl', function($scope, GameLogic, AiLogic, $timeout) {
    $scope.board = null;
    $scope.announcement = null;

    $scope.opponent = 'AI';
    $scope.goesFirst = 'Me';
    $scope.opponentMark = 'o';
    $scope.playerMark = 'x';

    $scope.newGame = function() {
        $scope.announcement = null;
        $scope.gameEnded = false;
        $scope.board = GameLogic.newBoard();
        $scope.playerMark = ($scope.opponentMark === 'x') ? 'o' : 'x';
        if (($scope.goesFirst === 'Them') &&
            ($scope.opponent === 'human')) {
            var cache = $scope.playerMark;
            $scope.playerMark = $scope.opponentMark;
            $scope.opponentMark = cache;
        }
        if ($scope.opponent === 'AI') {
            AiLogic.me = $scope.opponentMark;
            AiLogic.them = $scope.playerMark;
        }
        if (($scope.goesFirst === 'Them') &&
            ($scope.opponent === 'AI')) {
            var openingMove = AiLogic.decideMove($scope.board);

            $scope.aiMove(openingMove);
        }
    };
    $scope.newGame();
    $scope.gameEnded = false;

    $scope.gameEnd = function(winner) {
        if (winner) {
            $scope.gameEnded = true;
            $scope.announcement = winner + ' wins!';
        } else {
            $scope.gameEnded = true;
            $scope.announcement = 'Nobody wins!';
        }

        $timeout(function() {
            $scope.board = null;
            $scope.newGame();
        }, 1000);
    };

    $scope.aiMove = function(where) {

        var row = where.row,
            col = where.column;

        $scope.board[row][col].space = $scope.opponentMark;
    };

    $scope.userMove = function(where) {
        var rowIndex = where.row,
            colIndex = where.column,
            winner,
            space = $scope.board[rowIndex][colIndex].space;

        if ((space === '') && (!$scope.gameEnded)) {
            $scope.board[rowIndex][colIndex].space = $scope.playerMark;
            winner = GameLogic.won($scope.board);
            if (winner) {
                $scope.gameEnd(winner);
            } else {
                if (GameLogic.draw($scope.board)) {
                    $scope.gameEnd();
                } else {
                    if ($scope.opponent === 'AI') {
                        var response = AiLogic.decideMove($scope.board);
                        $scope.aiMove(response);
                        winner = GameLogic.won($scope.board);
                        if (winner) {
                            $scope.gameEnd(winner);
                        } else {
                            if (GameLogic.draw($scope.board)) {
                                $scope.gameEnd();
                            }
                        }
                    } else {
                        var cache = $scope.playerMark;
                        $scope.playerMark = $scope.opponentMark;
                        $scope.opponentMark = cache;
                    }
                }
            }
        }
    };

    $scope.isLast = function(check) {
        return check ? 'last' : null;
    };
})


.factory('AiLogic', function() {
    var ailogic = {};

    ailogic.them = 'x';
    ailogic.me = 'o';


    ailogic.formatMoveData = function(move) {
        return [{
            row: 0,
            column: 0
        }, {
            row: 0,
            column: 1
        }, {
            row: 0,
            column: 2
        }, {
            row: 1,
            column: 0
        }, {
            row: 1,
            column: 1
        }, {
            row: 1,
            column: 2
        }, {
            row: 2,
            column: 0
        }, {
            row: 2,
            column: 1
        }, {
            row: 2,
            column: 2
        }][move];

    };

    ailogic.flattenBoardData = function(board) {
        var flattenedBoard = [];
        for (var r = 0; r < board.length; r++) {
            var row = board[r];
            for (var c = 0; c < row.length; c++) {
                var cell = row[c];
                flattenedBoard.push(cell.space);
            }
        }
        return flattenedBoard;
    };

    ailogic.max = function(arr) {
        return Math.max.apply(null, arr);
    };

    ailogic.equivalentMoves = function(arr) {
        var maxEl = this.max(arr);
        return arr.map(function(move, idx) {
            if (move === maxEl) {
                return idx;
            } else {
                return null;
            }
        }).filter(function(el) {
            return (el !== null);
        });
    };

    ailogic.randomEquivalentMove = function(arr) {
        var equivalentMoves = this.equivalentMoves(arr);
        var randomIndex = Math.floor(Math.random() * equivalentMoves.length);
        return equivalentMoves[randomIndex];
    };

    ailogic.decideMove = function(board) {
        var flatBoard = this.flattenBoardData(board);
        var moves = [];
        for (var c = 0; c < flatBoard.length; c++) {
            var cell = flatBoard[c];
            // if I can move there 
            if (cell === '') {
                // I will imagine 
                var imaginaryBoard = angular.copy(flatBoard);
                imaginaryBoard[c] = this.me;
                // what they will do if I move there? 
                var moveValue = this.imaginaryMoveThem(imaginaryBoard);
                // Push my evaluation of this move to the moves array 
                moves.push(moveValue);
            } else {
                moves.push(null);
            }
        }

        // Pick randomly from moves judged to be the best   
        var randomMove = this.randomEquivalentMove(moves);
        return this.formatMoveData(randomMove);
    };

    ailogic.imaginaryMoveThem = function(board) {
        var draw = this.drawn(board);
        var iWin = this.won(board, this.me);
        var theyWin = this.won(board, this.them);
        if (iWin) {
            return 1;
        } else if (theyWin) {
            return -1;
        } else if (draw) {
            return 0;
        } else {
            var bestMoveValue = 100;
            for (var c = 0; c < board.length; c++) {
                var cell = board[c];
                // If they can move there 
                if (cell === '') {
                    // imagine what it'll be like for me 
                    var imaginaryBoard = angular.copy(board);
                    imaginaryBoard[c] = this.them;
                    // when they move there.  
                    var availableMoveValue = this.imaginaryMoveMe(imaginaryBoard);
                    // If this move is bad for me 

                    if (availableMoveValue < bestMoveValue) {
                        // they will do it.  
                        bestMoveValue = availableMoveValue;
                    }
                    // If this move allows them to win,
                    if (availableMoveValue === -1) {
                        // they will do it. 
                        break;
                    }
                }
            }
            return bestMoveValue;
        }
    };

    ailogic.imaginaryMoveMe = function(board) {
        var draw = this.drawn(board);
        var iWon = this.won(board, this.me);
        var theyWon = this.won(board, this.them);
        if (iWon) {
            return 1;
        } else if (theyWon) {
            return -1;
        } else if (draw) {
            return 0;
        } else {
            var bestMoveValue = -100;
            for (var c = 0; c < board.length; c++) {
                var cell = board[c];
                // If I move there 
                if (cell === '') {
                    var imaginaryBoard = angular.copy(board);
                    imaginaryBoard[c] = this.me;
                    // what can they do? 
                    var availableMoveValue = this.imaginaryMoveThem(imaginaryBoard);
                    // Choose the move in which they can do the least. 
                    if (availableMoveValue > bestMoveValue) {
                        bestMoveValue = availableMoveValue;
                    }
                    // If I can win w/ this move 
                    if (availableMoveValue === 1) {
                        // let me win! 
                        break;
                    }
                }
            }
            return bestMoveValue;
        }
    };

    ailogic.drawn = function(flatBoard) {
        // it is a draw when there is nowhere left to move 
        return flatBoard.every(function(cell) {
            return (cell !== '');
        });
    };

    ailogic.won = function(flatBoard, player) {
        return (((flatBoard[0] === player) && (flatBoard[1] === player) && (flatBoard[2] === player)) ||
            ((flatBoard[3] === player) && (flatBoard[4] === player) && (flatBoard[5] === player)) ||
            ((flatBoard[6] === player) && (flatBoard[7] === player) && (flatBoard[8] === player)) ||
            ((flatBoard[0] === player) && (flatBoard[3] === player) && (flatBoard[6] === player)) ||
            ((flatBoard[1] === player) && (flatBoard[4] === player) && (flatBoard[7] === player)) ||
            ((flatBoard[2] === player) && (flatBoard[5] === player) && (flatBoard[8] === player)) ||
            ((flatBoard[0] === player) && (flatBoard[4] === player) && (flatBoard[8] === player)) ||
            ((flatBoard[2] === player) && (flatBoard[4] === player) && (flatBoard[6] === player)));
    };

    return ailogic;
})

.factory('GameLogic', function () {

    var gamelogic = {};

    gamelogic.newBoard = function() {
      return [
      [
        {position: {row: 0, column: 0}, space: ''}, 
        {position: {row: 0, column: 1}, space: ''}, 
        {position: {row: 0, column: 2}, space: ''}
      ],
      [
        {position: {row: 1, column: 0}, space: ''}, 
        {position: {row: 1, column: 1}, space: ''}, 
        {position: {row: 1, column: 2}, space: ''}
      ],
      [
        {position: {row: 2, column: 0}, space: ''}, 
        {position: {row: 2, column: 1}, space: ''}, 
        {position: {row: 2, column: 2}, space: ''}
      ]];
    };

    gamelogic.allWins = function() {
      return [
        // horizontal wins  
        [{row: 0, column: 0},{row: 0, column: 1},{row: 0, column: 2}],
        [{row: 1, column: 0},{row: 1, column: 1},{row: 1, column: 2}],
        [{row: 2, column: 0},{row: 2, column: 1},{row: 2, column: 2}],
        // vertical wins 
        [{row: 0, column: 0},{row: 1, column: 0},{row: 2, column: 0}],
        [{row: 0, column: 1},{row: 1, column: 1},{row: 2, column: 1}],
        [{row: 0, column: 2},{row: 1, column: 2},{row: 2, column: 2}],
        // diagonal wins 
        [{row: 0, column: 0},{row: 1, column: 1},{row: 2, column: 2}],
        [{row: 0, column: 2},{row: 1, column: 1},{row: 2, column: 0}]  
      ];
    };

    gamelogic.won = function(board) {
      var wins = this.allWins();
      for(var i = 0; i < wins.length; i++) {  
        var win = wins[i];

        var cells = this.getCells(board, win);
       
        if (this.threeInRow(cells)) {
          return cells[0];
        }
      }

      return false; 
    };

    gamelogic.getCells = function(board, row) {
      return row.map(function(cell) {
        return board[cell.row][cell.column].space; 
      });
    };

    gamelogic.draw = function(board) {
      var row, 
         cell, 
        empty; 
      for (var r = 0; r < board.length; r++) {
        row = board[r];
        for (var c = 0; c < row.length; c++) {
          cell = row[c];
          empty = cell.space === ''; 
          if (empty) {
            return false; 
          }
        }
      }

      return true; 
    };

    gamelogic.threeInRow = function(cells) {
      var firstCell = cells[0], 
         secondCell = cells[1], 
          thirdCell = cells[2];
      return (
        (firstCell === secondCell) && 
        (secondCell === thirdCell) &&
        (firstCell !== '')
      );
    };

    return gamelogic; 
    
  })

;
