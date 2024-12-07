angular.module('App', ['ngMaterial'])
  .factory('services', function() {
    //////////////////////////////
    var toDests = function(chess) {
      const dests = new Map();
      chess.SQUARES.forEach(s => {
        const ms = chess.moves({
          square: s,
          verbose: true
        });
        if (ms.length) dests.set(s, ms.map(m => m.to));
      });
      return dests;
    }

    //////////////////////////////
    var toColor = function(chess) {
      return (chess.turn() === 'w') ? 'white' : 'black';
    }

    //////////////////////////////
    var playOtherSide = function(cg, chess) {
      return (orig, dest) => {
        chess.move({
          from: orig,
          to: dest
        });
        cg.set({
          turnColor: toColor(chess),
          movable: {
            color: toColor(chess),
            dests: toDests(chess)
          }
        });
      };
    }

    //////////////////////////////////////////////
    var findPiece = function(chess, type, color) {
      //var letters = "hgfedcba"
      var letters = "abcdefgh"
      var board = chess.board()
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          var cell = board[i][j];
          if (cell && cell.type == type && cell.color == color) {
            console.log(i+","+j+" = "+letters[j]+(8-i))
            return letters[j]+(8-i)
          }
        }
      }
      return null
    }

    ///////////////////////
    return {
      toDests: toDests,
      playOtherSide: playOtherSide,
      findPiece: findPiece
    }
  })
