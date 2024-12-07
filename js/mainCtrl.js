/*
SQ: Strategic question
DQ: The question of direction
CQ: The question of colour
CM: Candidate moves or moves worth considering
GM: Game move, most appropriate move
HM: Harmless move: it does nothing, but concedes nothing.
pap Pawn play
Pip Piece play
wsq on the white squares
bsq on the black squares
Sp Space
+Sp gain of space or space advantage
-Sp loss of space or space disadvantage
T tempo
+T gain of tempo
-T loss of tempo
S Strategy
+S reinforcement of the strategy
-S weakening of the strategy
M Material
+M gain of material
-M loss of material
C the centre
D Development
OD Best possible development (optimal)
+D Developing move or advantage in development
-D Disadvantage in development
I Initiative
+I Increase in the initiative
-I Decrease in the initiative
wI initiative on the white squares
+wI development of the white squared initiative
-wI loss of the white squared initiative
bI initiative on the black squares
+bI development of the black squared initiative
-bI loss of the black squared initiative
E: evaluation of the position
A: attention; pay close attention to
Ad: Advantage
Dis: Disadvantage
QS queenside
KS kingside
+KS kingside advantage
+QS queenside advantage
Sq square
Sqs squares, square complex
= exchange
>> put to the question, attack
> defend or protect
< prevent
* (space, piece, square) insufficiently well protected or under attack;
a piece which is passively placed or not placed to its best advantage
** (space, piece, square) sufficiently protected or not under attack;
a piece which is in play or placed to its best advantage

In addition, there are the usual designations of the pieces (K, Q, R, B, N) and p for pawn.
*/

angular.module('App').controller('MainCtrl', [
    '$scope',
    '$rootScope',
    '$http',
    '$timeout',
    '$filter',
    'services',
    function ($scope, $rootScope, $http, $timeout, $filter, services) {
        $scope.shapes = {
            targets: true,
            arrows: true,
            //ennemies: true,
            //plans: true
        }

        var chess = new Chess()

        var cg = Chessground(document.getElementById('board'), {
            fen: chess.fen(),
            movable: {
                color: 'white',
                free: false,
                dests: services.toDests(chess),
            },
            draggable: {
                showGhost: false,
            },
        })
        cg.set({
            movable: {
                events: {
                    after: services.playOtherSide(cg, chess),
                },
            },
        })

        ////////////////////////////////////
        var update_comments = function () {
            $scope.actions = {}
            $scope.targets = {
                text: '',
                shapes: [],
            }
            $scope.arrows = {
                text: '',
                shapes: [],
            }
            $scope.ennemies = {
                text: '',
                shapes: [],
            }
            $scope.plans = {
                text: '',
                shapes: [],
            }
            $scope.weaknesses = {
                text: '',
                shapes: [],
            }

            var comments = chess.get_comment()
            if (!comments) {
                $scope.comments = ''
                return $scope.draw_shapes()
            }
            comments = comments.split(';')
            angular.forEach(comments, function (comment) {
                ////////////////////////////////////////////
                var circles = comment.match(/\[%csl [a-zA-Z0-9,]+\]/g)
                angular.forEach(circles, function (circle) {
                    splits = circle.substring(6, circle.length - 1).split(',')
                    $scope.targets.text = splits.join(', ')
                    angular.forEach(splits, function (s) {
                        s = s.trimStart().trim()
                        $scope.targets.shapes.push({
                            orig: s.substring(1, s.length),
                            brush: 'red',
                        })
                    })
                })

                ////////////////////////////////////////////
                var arrows = comment.match(/\[%cal [a-zA-Z0-9,]+\]/g)
                angular.forEach(arrows, function (arrow) {
                    splits = arrow.substring(6, arrow.length - 1).split(',')
                    $scope.arrows.text = splits.join(', ')
                    angular.forEach(splits, function (s) {
                        s = s.trimStart().trim()
                        $scope.arrows.shapes.push({
                            orig: s.substring(1, 3),
                            dest: s.substring(3, 5),
                            brush: 'yellow',
                        })
                    })
                })

                ////////////////////////////////////////////
                var ennemies = comment.match(/EP[.:]?\s?>>\s?[a-zA-Z0-9]+(,\s?[a-zA-Z0-9]+)*/g)
                if (ennemies) {
                    angular.forEach(ennemies, function (ennemy) {
                        var splits = ennemy.substring(7, ennemy.length).replace(/ /g, '').split(',')
                        $scope.ennemies.text = splits.join(', ')
                        angular.forEach(splits, function (s) {
                            s = s.trimStart().trim()
                            var cell = s.length == 2 ? s : s.substring(1, s.length)
                            $scope.ennemies.shapes.push({
                                orig: cell,
                                brush: 'red',
                            })
                        })
                    })
                }

                ////////////////////////////////////////////
                var weaknesses = comment.match(/_\|_[a-zA-Z0-9*]+(,\s?_\|_[a-zA-Z0-9*]+)*/g)
                if (weaknesses) {
                    var w = weaknesses[0].replace(/_\|_/g, '').replace(/\*/g, '').replace(/ /g, '')
                    var splits = w.split(', ')
                    $scope.weaknesses.text = splits.join(', ')

                    angular.forEach(splits, function (s) {
                        s = s.trimStart().trim()
                        var cell = s.length == 2 ? s : s.substring(1, s.length)
                        $scope.weaknesses.shapes.push({
                            orig: cell,
                            brush: 'blue',
                        })
                    })
                }
                ////////////////////////////////////////////
                var plan = comment.match(/Plan[.:]?\s?[a-zA-Z0-9]+(\s?[+\->]+\s?[a-zA-Z0-9]+)*/g)
                if (plan) {
                    var splits = plan[0]
                        .substring(5, plan[0].length)
                        .replace(/\s?[+\->]+\s?/g, ';')
                        .split(';')
                    $scope.plans.text = plan[0].replace(/Plan[ :]+/g, '')
                    angular.forEach(splits, function (s) {
                        s = s.trimStart().trim()
                        var cell = s.length == 2 ? s : s.substring(1, s.length)
                        $scope.plans.shapes.push({
                            orig: cell,
                            brush: 'green',
                        })
                    })
                }

                ////////////////////////////////////////////
                if (comment.match(/\+Ka/g)) {
                    $scope.actions.king_attack = true
                }

                ////////////////////////////////////////////
                if (comment.match(/wsq\)/g)) {
                    $scope.actions.colors = 'Cases blanches'
                }

                ////////////////////////////////////////////
                if (comment.match(/bsq\)/g)) {
                    $scope.actions.colors = 'Cases noires'
                }

                ////////////////////////////////////////////
                if (comment.match(/\+End/g)) {
                    $scope.actions.ending = true
                }

                ////////////////////////////////////////////
                if (comment.match(/\+PiS/g)) {
                    $scope.actions.piece_play = true
                }
            })

            $scope.draw_shapes()
            $scope.comments = comments
        }

        ////////////////////////////
        $scope.draw_comments = function () {}

        ////////////////////////////
        $scope.draw_shapes = function () {
            if (!$scope.show_shapes) {
                return cg.setAutoShapes([])
            }
            var shapes = []
            if ($scope.shapes.targets) shapes.push($scope.targets.shapes)
            if ($scope.shapes.arrows) shapes.push($scope.arrows.shapes)
            if ($scope.shapes.weaknesses) shapes.push($scope.weaknesses.shapes)
            if ($scope.shapes.ennemies) shapes.push($scope.ennemies.shapes)
            if ($scope.shapes.plans) shapes.push($scope.plans.shapes)
            cg.setAutoShapes(_.flatten(shapes))
        }

        ///////////////////////////
        $scope.rewind = function () {
            for (var i = 0; i < $scope.moves.length; i++) {
                chess.undo()
            }
            $scope.turn = chess.turn()

            update_comments()

            $scope.cpt = 0
            cg.set({
                fen: chess.fen(),
            })
        }

        ///////////////////////////
        $scope.previous = function () {
            chess.undo()
            update_comments()

            $scope.cpt = Math.max(0, $scope.cpt - 1)
            cg.set({
                fen: chess.fen(),
            })
        }

        ///////////////////////////
        $scope.next = function () {
            chess.move($scope.moves[$scope.cpt])
            $scope.cpt = Math.min($scope.moves.length, $scope.cpt + 1)
            cg.set({
                fen: chess.fen(),
            })
            update_comments()
        }

        /////////////////////////
        $scope.flip = function () {
            $timeout(function () {
                cg.toggleOrientation()
            }, 0)
        }

        //////////////////////////////
        $scope.init_pgns = function () {
            $scope.pgns = []
            $scope.choices = []

            function load(file, cb) {
                $http.get(file).then(function (res) {
                    var n = 0
                    var text = res.data
                    var splits = text.split('\n')
                    var string = ''
                    var n = 0
                    for (var i = 0; i < splits.length; i++) {
                        var line = splits[i].trim()
                        if (line.endsWith('1-0') || line.endsWith('0-1') || line.endsWith('1/2-1/2') || line.endsWith('*')) {
                            string += line
                            $scope.pgns[n + '-' + file] = string.trimStart()
                            $scope.selection = $scope.selection || n + '-' + file
                            $scope.choices.push(n + '-' + file)
                            n++
                            string = ''
                        } else if (line.startsWith('[') && line.endsWith(']')) {
                            string += line + '\n'
                        } else {
                            string += line + '\n'
                        }
                    }
                    if (cb) cb()
                })
            }
            load('middle-lesson.pgn', function () {
                load('middle-training.pgn', function () {
                    load('tactic-lesson.pgn', function () {
                        load('tactic-training.pgn', function () {
                            $scope.load_pgn()
                        })
                    })
                })
            })
        }

        ////////////////////////////
        $scope.load_pgn = function () {
            if (!$scope.selection) {
                var subchoices = $filter('filter')($scope.choices, $scope.file)
                $scope.selection = subchoices[0]
            }

            var res = chess.load_pgn($scope.pgns[$scope.selection])
            $scope.header = chess.header()
            $scope.moves = chess.history({
                verbose: true,
            })
            $scope.rewind()
        }

        ////////////////////////////////
        $scope.prev_pgn = function () {
            var index = $scope.choices.indexOf($scope.selection)
            $scope.selection = $scope.choices[Math.max(0, index - 1)]
            $scope.load_pgn()
        }

        ////////////////////////////////
        $scope.next_pgn = function () {
            var index = $scope.choices.indexOf($scope.selection)
            $scope.selection = $scope.choices[Math.min($scope.choices.length, index + 1)]
            $scope.load_pgn()
            return false
        }

        //////////////////////////////////
        document.onkeydown = function (e) {
            e = e || window.event
            $timeout(function () {
                if (e.keyCode == '38') {
                    $scope.show_shapes = !$scope.show_shapes
                    $scope.draw_shapes()
                    e.preventDefault()
                } else if (e.keyCode == '40') {
                    $scope.flip()
                    e.preventDefault()
                } else if (e.keyCode == '37') {
                    $scope.previous()
                    e.preventDefault()
                } else if (e.keyCode == '39') {
                    $scope.next()
                    e.preventDefault()
                } else if (e.keyCode == '54') {
                    $scope.next_pgn()
                    e.preventDefault()
                } else if (e.keyCode == '52') {
                    $scope.prev_pgn()
                    e.preventDefault()
                }
            }, 0)
        }

        //////////////////
        $scope.init_pgns()
    },
])
