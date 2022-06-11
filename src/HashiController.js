"use strict";
exports.__esModule = true;
exports.HashiController = void 0;
var HashiBoard_1 = require("./HashiBoard");
var HashiController = /** @class */ (function () {
    function HashiController(url) {
        this.hashiBoard = new HashiBoard_1.HashiBoard(url);
    }
    HashiController.prototype.solve = function (maxdepth) {
        console.log("start");
        var startTime = new Date().getTime();
        var result = this.hashiBoard.solve(maxdepth);
        var endTime = new Date().getTime();
        console.log("finished: " + (endTime - startTime) + " ms");
        console.log(result);
        this.hashiBoard.getResultLogArr().forEach(function (log) { return log.consoleLog(); });
        this.output(0);
    };
    HashiController.prototype.output = function (depth) {
        var result = this.hashiBoard.getBoardNum(depth);
        var boardAbst = this.hashiBoard.getBoardAbst();
        var describe = boardAbst.map(function (row) { return row.map(function (val) {
            if (val == 0) {
                return " ";
            }
            else {
                return String(val);
            }
        }); });
        var hands4way;
        var pos;
        var line;
        result.forEach(function (row, y) {
            row.forEach(function (num, x) {
                if (boardAbst[y][x] != 0) {
                    hands4way = num.getHands4way();
                    //横線描画
                    pos = 1;
                    if (hands4way[2] > 0) {
                        if (hands4way[2] == 2) {
                            line = "=";
                        }
                        else {
                            line = "-";
                        }
                        do {
                            describe[y][x + pos] = line;
                            pos++;
                        } while (boardAbst[y][x + pos] == 0);
                    }
                    //縦線描画
                    pos = 1;
                    if (hands4way[3] > 0) {
                        if (hands4way[3] == 2) {
                            line = "∥";
                        }
                        else {
                            line = "|";
                        }
                        do {
                            describe[y + pos][x] = line;
                            pos++;
                        } while (boardAbst[y + pos][x] == 0);
                    }
                }
            });
        });
        describe.forEach(function (row) { return console.log(row.join('') + '\n'); });
    };
    return HashiController;
}());
exports.HashiController = HashiController;
