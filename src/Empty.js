"use strict";
exports.__esModule = true;
exports.Empty = void 0;
var Empty = /** @class */ (function () {
    function Empty(y, x, numIdMap) {
        this.id4way = [-1, -1, -1, -1];
        var pos = -1; //縦または横方向の(x,y)からの相対位置:左から調べるので初期値は-1
        //左の数字を見つけて情報を与える
        while (x + pos >= 0) {
            //左に数字を見つけた場合
            if (numIdMap[y][x + pos] > 0) {
                this.id4way[0] = numIdMap[y][x + pos];
                break;
            }
            else {
                pos--;
            }
        }
        //右の数字を見つけて情報を与える
        pos = 1;
        while (x + pos < numIdMap[0].length) {
            //右に数字を見つけた場合
            if (numIdMap[y][x + pos] > 0) {
                this.id4way[2] = numIdMap[y][x + pos];
                break;
            }
            else {
                pos++;
            }
        }
        pos = -1;
        //上の数字を見つけて情報を与える
        while (y + pos >= 0) {
            //上に数字を見つけた場合
            if (numIdMap[y + pos][x] > 0) {
                this.id4way[1] = numIdMap[y + pos][x];
                break;
            }
            else {
                pos--;
            }
        }
        //下の数字を見つけて情報を与える
        pos = 1;
        while (y + pos < numIdMap.length) {
            //下に数字を見つけた場合
            if (numIdMap[y + pos][x] > 0) {
                this.id4way[3] = numIdMap[y + pos][x];
                break;
            }
            else {
                pos++;
            }
        }
    }
    /**
    @returns [leftId,rightId]
    */
    Empty.prototype.getHorNumId = function () {
        return [this.id4way[0], this.id4way[2]];
    };
    /**
    @returns [upId,downId]
    */
    Empty.prototype.getVerNumId = function () {
        return [this.id4way[1], this.id4way[3]];
    };
    Empty.prototype.getSurNumId = function () {
        return this.id4way;
    };
    return Empty;
}());
exports.Empty = Empty;
