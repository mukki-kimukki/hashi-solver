"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
exports.HashiBoard = void 0;
//盤面の数字配置や島の情報を保持する
var Empty_1 = require("./Empty");
var Island_1 = require("./Island");
var Num_1 = require("./Num");
var ResultLog_1 = require("./ResultLog");
var HashiBoard = /** @class */ (function () {
    function HashiBoard(param1, param2) {
        this.islands = new Map(); //島と島に含まれる数字を対応させる辞書
        this.numsToCheckStack = new Array(); //手筋チェック対象idのスタック
        this.currentId = 0; //スタート地点を分散させるため、最後のチェック箇所を記録する。
        this.resultLogArr = new Array();
        this.answerList = new Array(); //発見した解答のリスト
        if (param2 === undefined) {
            //if url is given
            var urlSplit = param1.split("/");
            this.height = parseInt(urlSplit[urlSplit.length - 2], 10);
            this.width = parseInt(urlSplit[urlSplit.length - 3]);
            this.boardAbst = new Array(this.height);
            this.numIdMap = new Array(this.height);
            for (var y = 0; y < this.height; y++) {
                this.boardAbst[y] = new Array(this.width);
                this.numIdMap[y] = new Array(this.width);
                for (var x = 0; x < this.width; x++) {
                    this.boardAbst[y][x] = 0;
                    this.numIdMap[y][x] = -1;
                }
            }
            var coded = urlSplit[urlSplit.length - 1];
            var pos = 0;
            var charNum = void 0;
            var id = 0;
            var interval = void 0;
            for (var i = 0; i < coded.length; i++) {
                charNum = parseInt(coded.charAt(i), 36);
                interval = charNum - 15;
                if (interval > 0) {
                    pos += interval;
                }
                else {
                    this.boardAbst[Math.floor(pos / this.width)][pos % this.width] = charNum;
                    this.numIdMap[Math.floor(pos / this.width)][pos % this.width] = id;
                    id++;
                    pos++;
                }
            }
            this.numCount = id;
            id = 0;
            this.boardEmpty = new Array(this.height);
            this.numDict = new Array(1);
            this.numDict[0] = new Array(this.numCount);
            for (var y = 0; y < this.height; y++) {
                this.boardEmpty[y] = new Array(this.width);
                for (var x = 0; x < this.width; x++) {
                    if (this.boardAbst[y][x] > 0) {
                        this.numDict[0][id] = new Num_1.Num(0, y, x, this.boardAbst, this.numIdMap, id);
                        this.islands.set(id, new Island_1.Island(id));
                        this.numsToCheckStack.push(id);
                        id += 1;
                    }
                    else {
                        this.boardEmpty[y][x] = new Empty_1.Empty(y, x, this.numIdMap);
                    }
                }
            }
        }
        else {
            //if board size is given
            this.height = param1;
            this.width = param2;
            this.numCount = 0;
            this.boardAbst = new Array(this.height);
            this.boardEmpty = new Array(this.height);
            this.numIdMap = new Array(this.height);
            this.numDict = new Array(1);
            for (var i = 0; i < this.height; i++) {
                this.boardAbst[i] = new Array(this.width);
                this.boardEmpty[i] = new Array(this.width);
                this.numIdMap = new Array(this.width);
            }
        }
    }
    HashiBoard.prototype.getHeight = function () {
        return this.height;
    };
    HashiBoard.prototype.getWidth = function () {
        return this.width;
    };
    HashiBoard.prototype.getBoardNum = function (depth) {
        var _this = this;
        var boardNum = new Array(this.height);
        this.numIdMap.forEach(function (rowIds, row) {
            boardNum[row] = new Array(_this.width);
            rowIds.forEach(function (id, col) {
                if (id >= 0) {
                    boardNum[row][col] = _this.numDict[depth][id];
                }
            });
        });
        return boardNum;
    };
    HashiBoard.prototype.getBoardAbst = function () {
        return this.boardAbst;
    };
    HashiBoard.prototype.solve = function (maxdepth) {
        var result = this.logicSolve(0, true);
        if (result.charAt(0) == "9") {
            return result;
        }
        else if (result == "010") {
            return result;
        }
        if (maxdepth > 0) {
            // console.log("@trial 1");
            // console.log("@trySetRemain0");
            for (var i = 0; i < this.numCount; i++) {
                if (this.trySetRemain0(1, i)) {
                    result = this.logicSolve(0, true);
                    if (result.charAt(0) == "9") {
                        return result;
                    }
                    else if (result == "010") {
                        return result;
                    }
                }
            }
            //一段仮定(先読み)
            // console.log("@trialSolve");
            while (this.trialSolve(1, 1)) {
                result = this.logicSolve(0, false);
                if (result.charAt(0) == "9") {
                    return result;
                }
                else if (result == "010") {
                    return result;
                }
            }
            //効率化多段仮定
            if (maxdepth > 1) {
                // console.log("@trialSolve-2");
                while (this.trialSolve(1, maxdepth)) {
                    result = this.logicSolve(0, false);
                    if (result.charAt(0) == "9") {
                        return result;
                    }
                    else if (result == "010") {
                        return result;
                    }
                }
            }
        }
        return result;
    };
    HashiBoard.prototype.logicSolve = function (depth, useCountFlg) {
        var _this = this;
        //手筋領域
        var numId = this.numsToCheckStack.pop();
        var fromNum;
        var logicResult;
        var islandCheckResult;
        do {
            //本数確定系ループ
            do {
                //島手筋ループ
                while (typeof numId === 'number') {
                    //数字手筋ループ
                    fromNum = this.getDepthNum(depth, numId);
                    logicResult = fromNum.checkLogics(true);
                    switch (logicResult[0][1].charAt(0)) {
                        case "9": //破綻またはエラー
                            // console.log("depth=" + depth + " " + fromNum.getAddress() + " " + logicResult[0]);
                            return logicResult[0][1];
                        case "0": //変化なし
                            break;
                        default: //手筋実行あり(case "1")
                            // console.log("depth=" + depth + " " + fromNum.getAddress() + " " + logicResult[0]);
                            //仮定でない場合、確定内容の履歴を作成
                            if (depth == 0) {
                                this.resultLogArr.push(new ResultLog_1.ResultLog(numId, numId, logicResult[0][0], logicResult[0][1]));
                            }
                            logicResult[0][0].forEach(function (hon, dir) { return _this.drawLine(depth, fromNum, logicResult[1], hon, dir); });
                            //残り本数が0の場合は島に伝える
                            if (logicResult[1] == 0) {
                                this.islands.get(fromNum.getParentIslandId()).inactivateNum(depth, numId);
                            }
                            break;
                    }
                    numId = this.numsToCheckStack.pop();
                }
                //島手筋が全てチェックし終わるまでループ
                islandCheckResult = this.checkEndIslands(depth);
                numId = this.numsToCheckStack.pop();
            } while (islandCheckResult);
            if (depth == 0 && useCountFlg) {
                this.checkMinHonsu(depth);
            }
            numId = this.numsToCheckStack.pop();
        } while (typeof numId === 'number');
        return this.checkResult(depth);
    };
    HashiBoard.prototype.initDepth = function (depth) {
        this.islands.forEach(function (isl) { return isl.makeNextDepth(depth); });
        this.numDict[depth] = this.numDict[depth - 1].concat();
    };
    HashiBoard.prototype.trialSolve = function (depth, maxDepth) {
        var result;
        for (var i = 0; i < this.numCount; i++) {
            //左と上向き仮定
            for (var j = 0; j < 2; j++) {
                if (this.numDict[depth - 1][this.currentId].getRemain4way()[j] > 0) {
                    result = this.tryDir(depth, maxDepth, this.currentId, j);
                    if (result) {
                        return result;
                    }
                    ;
                }
            }
            this.currentId = (this.currentId + 1) % this.numCount;
        }
        ;
        return false;
    };
    HashiBoard.prototype.tryDir = function (depth, maxDepth, tryTargetId, dir) {
        //仮定するまえに手筋適用可能な有意仮定かで実行の足切り
        var prevTarget = this.numDict[depth - 1][tryTargetId];
        var tryTargetId2 = prevTarget.getSurNumId()[dir];
        var prevTarget2 = this.numDict[depth - 1][tryTargetId2];
        var resultCheck1 = prevTarget.trySetRemain1way(dir, 0);
        var resultCheck2 = prevTarget2.trySetRemain1way((dir + 2) % 4, 0);
        //このresultCheckは破綻にならない（破綻する場合通常手筋の適用範囲内）
        //有効な仮定の場合
        if (resultCheck1[0][1].charAt(0) == "1" || resultCheck2[0][1].charAt(0) == "1") {
            var solveResultCode = void 0;
            //仮定初期化
            this.initDepth(depth);
            var tryTarget = this.getDepthNum(depth, tryTargetId);
            var tryTarget2 = this.getDepthNum(depth, tryTargetId2);
            //引き本数0の仮定
            // console.log("try-remain0 starts id= " + tryTargetId + " dir= " + dir);
            if (tryTarget.setRemain1way(dir, 0)) {
                this.numsToCheckStack.push(tryTargetId);
            }
            if (tryTarget2.setRemain1way((dir + 2) % 4, 0)) {
                this.numsToCheckStack.push(tryTargetId2);
            }
            solveResultCode = this.logicSolve(depth, false);
            if (solveResultCode.charAt(0) == "9") {
                if (depth == 1) {
                    this.resultLogArr.push(new ResultLog_1.ResultLog(tryTargetId, tryTargetId, ResultLog_1.ResultLog.defaultResultArr[0][dir], "1T01"));
                }
                // console.log("try-remain0 succeeded drawLine Id=" + tryTargetId + " dir= " + dir);
                this.drawFrom(depth - 1, tryTargetId, 1, dir);
                return true;
            }
            else if (solveResultCode == "010") {
                //解答を見つけた場合、リストに加えてそれ以外の場合を継続して探索
                this.addAnswer(depth);
                return false;
            }
            else if (depth < maxDepth) {
                //次の深さの仮定を実行する
                while (this.trialSolve(depth + 1, maxDepth)) {
                    solveResultCode = this.logicSolve(depth, false);
                    if (solveResultCode.charAt(0) == "9") {
                        this.drawFrom(depth - 1, tryTargetId, 1, dir);
                        return true;
                    }
                }
            }
        }
        //全探索の場合ここに分岐を追加する
        //線引き仮定：効率化のため次の深さの探索は行わない：ここを省いても全探索は保証できる
        if (prevTarget.getHands4way()[dir] == 0) {
            // console.log("try draw starts id= " + tryTargetId + " dir= " + dir);
            //仮定初期化
            this.initDepth(depth);
            this.drawFrom(depth, tryTargetId, 1, dir);
            var solveResultCode = this.logicSolve(depth, false);
            if (solveResultCode.charAt(0) == "9") {
                var nextTarget = this.getDepthNum(depth - 1, tryTargetId);
                var nextTarget2 = this.getDepthNum(depth - 1, nextTarget.getSurNumId()[dir]);
                if (depth == 1) {
                    this.resultLogArr.push(new ResultLog_1.ResultLog(tryTargetId, tryTargetId, ResultLog_1.ResultLog.defaultResultArr[1][dir], "1T02"));
                    // console.log("try draw succeeded id= " + tryTargetId + "id2 = " + tryTargetId2);
                }
                nextTarget.setRemain1way(dir, 0);
                nextTarget2.setRemain1way((dir + 2) % 4, 0);
                this.numsToCheckStack.push(tryTargetId);
                this.numsToCheckStack.push(tryTargetId2);
                return true;
            }
            //全探索とは無関係のため、破綻以外は解答を見つけてもスルー
        }
        //ここに到達する場合、未探索の枝がある
        return false;
    };
    /**
     * 周囲の数字から対象の残り本数分引ききられた場合を仮定する
     * @param depth
     * @param tryTargetId
     * @returns
     */
    HashiBoard.prototype.trySetRemain0 = function (depth, tryTargetId) {
        var _this = this;
        var targetNum0 = this.numDict[depth - 1][tryTargetId];
        var targetRemain = targetNum0.getRemainSelf();
        if (targetRemain > 2 || targetRemain == 0 || this.islands.get(targetNum0.getParentIslandId()).getNumList(depth - 1).length == 1) {
            return false;
        }
        else {
            //残り本数と同じ残り引き本数の数字がない場合無意味なのでスキップ
            if (targetNum0.getRemain4way().findIndex(function (val) { return val == targetRemain; }) < 0) {
                return false;
            }
            // console.log("try-deadend id=" + tryTargetId);
            //仮定初期化
            this.initDepth(depth);
            var hands4way_1 = targetNum0.getHands4way();
            var remain4way_1 = targetNum0.getRemain4way();
            var handsRemainDirCount_1 = 0;
            var handsRemainDir_1 = 0;
            targetNum0.getSurNumId().forEach(function (set0Id, dir) {
                // console.log("dir=" + dir);
                if (hands4way_1[dir] > 0 && remain4way_1[dir] == hands4way_1[dir]) {
                    _this.getDepthNum(depth, set0Id).setRemain1way((dir + 2) % 4, 0);
                    _this.numsToCheckStack.push(set0Id);
                    if (remain4way_1[dir] > 0) {
                        handsRemainDirCount_1 += 1;
                        handsRemainDir_1 = dir;
                    }
                }
            });
            var solveResult = this.logicSolve(depth, false);
            //破綻した場合のみ盤面進行
            if (solveResult.charAt(0) == "9") {
                //引けないと仮定した方向(手がつながっている方向で残り1本以上)が1方向のみの場合
                if (handsRemainDirCount_1 == 1) {
                    // console.log("drawLine Id=" + tryTargetId + " dir= " + handsRemainDir);
                    this.drawFrom(depth - 1, tryTargetId, 1, handsRemainDir_1);
                    this.resultLogArr.push(new ResultLog_1.ResultLog(tryTargetId, tryTargetId, ResultLog_1.ResultLog.defaultResultArr[1][handsRemainDir_1], "1T03"));
                    return true;
                }
                else {
                    var tryTarget = this.numDict[depth][tryTargetId];
                    //調査対象に線を引いていた場合無効
                    var failFlg = tryTarget.getHands4way().findIndex(function (hon, dir) {
                        hon > hands4way_1[dir];
                    }) >= 0;
                    //
                    if (!failFlg) {
                        var targetIsland = this.islands.get(tryTarget.getParentIslandId());
                        if ((targetIsland.getActiveNumList(depth).length - Number(tryTarget.getRemainSelf())) == 0) {
                            targetNum0.getSurNumId().forEach(function (id, dir) {
                                if (hands4way_1[dir] == 0 && remain4way_1[dir] == targetRemain) {
                                    // console.log("setRem0 Id=" + id + " dir= " + (dir + 2) % 4);
                                    _this.numDict[depth - 1][id].setIsEndSurTrue((dir + 2) % 4, targetRemain);
                                    _this.numsToCheckStack.push(id);
                                    _this.resultLogArr.push(new ResultLog_1.ResultLog(tryTargetId, id, ResultLog_1.ResultLog.defaultResultArr[1][dir], "1T02"));
                                }
                            });
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    };
    HashiBoard.prototype.checkResult = function (depth) {
        var e_1, _a;
        var islandsCount = 0;
        var activeIslandsCount = 0;
        try {
            for (var _b = __values(this.islands.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var island = _c.value;
                islandsCount += Number(island.getNumList(depth).length > 0);
                activeIslandsCount += Number(island.getActiveNumList(depth).length > 0);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (activeIslandsCount > 0) {
            if (activeIslandsCount < islandsCount) {
                //孤立島あり
                return "902";
            }
            else {
                return "091";
            }
        }
        else {
            if (islandsCount > 1) {
                return "903";
            }
            else {
                return "010";
            }
        }
    };
    HashiBoard.prototype.getDepthNum = function (depth, id) {
        var tempNum = this.numDict[depth][id];
        if (tempNum.getDepth() == depth) {
            return tempNum;
        }
        else {
            return this.numDict[depth][id] = tempNum.clone(depth);
        }
    };
    /**
     * 根元の数字から線引き処理をする
     * @param depth 仮定の深度
     * @param fromNum 引き元の数字
     * @param hon 引き本数
     * @param dir 引き方向
     */
    HashiBoard.prototype.drawFrom = function (depth, fromNumId, hon, dir) {
        var fromNum = this.getDepthNum(depth, fromNumId);
        var fromRemain = fromNum.drawIn(dir, hon);
        //線と引き先
        if (hon > 0) {
            this.drawLine(depth, fromNum, fromRemain, hon, dir);
            //0になった場合非活性化する
            if (fromRemain == 0) {
                this.islands.get(fromNum.getParentIslandId()).inactivateNum(depth, fromNum.getId());
            }
        }
    };
    /**
     * 線と引き先のみの線引き処理
     * @param depth
     * @param fromNum
     * @param fromRemain 引いた後の残り本数
     * @param hon
     * @param dir
     */
    HashiBoard.prototype.drawLine = function (depth, fromNum, fromRemain, hon, dir) {
        var _this = this;
        var nextTarget;
        var toNum;
        var toRemain;
        if (hon > 0) { //線引き
            toNum = this.getDepthNum(depth, fromNum.getSurNumId()[dir]);
            //空白引き
            var fromAddress = fromNum.getAddress();
            var pos = void 0;
            switch (dir) {
                case 0:
                    pos = -1; //左
                    while (this.boardAbst[fromAddress[0]][fromAddress[1] + pos] == 0) {
                        this.boardEmpty[fromAddress[0]][fromAddress[1] + pos].getVerNumId().forEach(function (id, i) {
                            if (id >= 0) {
                                nextTarget = _this.getDepthNum(depth, id);
                                if (nextTarget.getRemainSelf() > 0) {
                                    if (nextTarget.setRemain1way(3 - 2 * i, 0)) { //上→下の順にidがくるので、0にするのは下→上の順
                                        _this.numsToCheckStack.push(id);
                                    }
                                    ;
                                }
                            }
                        });
                        pos--;
                    }
                    break;
                case 1:
                    pos = -1; //上
                    while (this.boardAbst[fromAddress[0] + pos][fromAddress[1]] == 0) {
                        this.boardEmpty[fromAddress[0] + pos][fromAddress[1]].getHorNumId().forEach(function (id, i) {
                            if (id >= 0) {
                                nextTarget = _this.getDepthNum(depth, id);
                                if (nextTarget.getRemainSelf() > 0) {
                                    if (nextTarget.setRemain1way(2 - 2 * i, 0)) { //id>=0で存在判定可能 左→右の順にidがくるので、0にするのは右→左の順
                                        _this.numsToCheckStack.push(id);
                                    }
                                    ;
                                }
                            }
                        });
                        pos--;
                    }
                    break;
                case 2:
                    pos = 1; //右
                    while (this.boardAbst[fromAddress[0]][fromAddress[1] + pos] == 0) {
                        this.boardEmpty[fromAddress[0]][fromAddress[1] + pos].getVerNumId().forEach(function (id, i) {
                            if (id >= 0) {
                                nextTarget = _this.getDepthNum(depth, id);
                                if (nextTarget.getRemainSelf() > 0) {
                                    if (nextTarget.setRemain1way(3 - 2 * i, 0)) { //id>=0で存在判定可能 上→下の順にidがくるので、0にするのは下→上の順
                                        _this.numsToCheckStack.push(id);
                                    }
                                    ;
                                }
                            }
                        });
                        pos++;
                    }
                    break;
                case 3:
                    pos = 1; //下
                    while (this.boardAbst[fromAddress[0] + pos][fromAddress[1]] == 0) {
                        this.boardEmpty[fromAddress[0] + pos][fromAddress[1]].getHorNumId().forEach(function (id, i) {
                            if (id >= 0) {
                                nextTarget = _this.getDepthNum(depth, id);
                                if (nextTarget.getRemainSelf() > 0) {
                                    if (nextTarget.setRemain1way(2 - 2 * i, 0)) { //id>=0で存在判定可能 左→右の順にidがくるので、0にするのは右→左の順
                                        _this.numsToCheckStack.push(id);
                                    }
                                    ;
                                }
                            }
                        });
                        pos++;
                    }
                    break;
            }
            //数字引き
            toRemain = toNum.drawIn((dir + 2) % 4, hon);
            if (toRemain < 2) {
                toNum.getSurNumId().forEach(function (id, nextDir) {
                    if (id >= 0) {
                        nextTarget = _this.getDepthNum(depth, id);
                        if (nextTarget.getRemainSelf() > 0) {
                            if (nextTarget.setRemain1way((nextDir + 2) % 4, toRemain)) {
                                _this.numsToCheckStack.push(id);
                            }
                            ;
                        }
                    }
                });
                //引き先が0になった場合非活性化する
                if (toRemain == 0) {
                    this.islands.get(toNum.getParentIslandId()).inactivateNum(depth, toNum.getId());
                }
            }
            //島のマージ
            var fromParentId = fromNum.getParentIslandId();
            var toParentId = toNum.getParentIslandId();
            //引き元と引き先の島Idが異なる場合は島をマージする
            if (fromParentId != toParentId) {
                this.mergeIslands(depth, fromParentId, toParentId);
            }
            ;
        }
        else if (fromRemain < 2) { //残り引き本数減:0本方向に通知して手筋チェック対象に加える
            var nextId = fromNum.getSurNumId()[dir];
            if (nextId >= 0) {
                if (this.numDict[depth][nextId].getRemainSelf() > 0) {
                    nextTarget = this.getDepthNum(depth, nextId);
                    if (nextTarget.setRemain1way((dir + 2) % 4, fromRemain)) {
                        this.numsToCheckStack.push(nextTarget.getId());
                    }
                }
            }
        }
    };
    HashiBoard.prototype.mergeIslands = function (depth, rootIslandId, mergeIslandId) {
        var _this = this;
        var mergeIsland = this.islands.get(mergeIslandId);
        mergeIsland.getNumList(depth).forEach(function (id) {
            _this.getDepthNum(depth, id).setParentIslandId(rootIslandId);
        });
        this.islands.get(rootIslandId).mergeIsland(depth, mergeIsland);
    };
    HashiBoard.prototype.checkEndIslands = function (depth) {
        var _this = this;
        var result = false;
        var execResult;
        var execResult0;
        var execResult1;
        this.islands.forEach(function (isl) {
            //島ごとに出口が一つだけになっているか調べる
            switch (isl.getActiveNumList(depth).length) {
                case 1:
                    if (isl.getNumList(depth).length > 1 && !isl.getIsIslandEndChecked(depth)) {
                        var nextTarget_1;
                        //出口が一つの島なら行き止まりを設定できる可能性がある。
                        isl.getActiveNumList(depth).forEach(function (numId) {
                            nextTarget_1 = _this.getDepthNum(depth, numId);
                            var remainSelf = nextTarget_1.getRemainSelf();
                            var tempResult = nextTarget_1.setEnd();
                            _this.numsToCheckStack.push(nextTarget_1.getId());
                            nextTarget_1.getSurNumId().forEach(function (surNumId, dir) {
                                //数字IDが0より大きく（存在する）出口数字が2以下の場合に行き止まりを設定できるかチェックする
                                if (surNumId >= 0 && remainSelf <= 2) {
                                    //自身の残り本数が、受け取った行き止まり手筋用残り本数より多い場合に成功する
                                    if (remainSelf <= _this.numDict[depth][surNumId].getRemain4way()[(dir + 2) % 4]) {
                                        execResult = _this.getDepthNum(depth, surNumId).setIsEndSurTrue((dir + 2) % 4, remainSelf);
                                        tempResult = tempResult || execResult;
                                    }
                                }
                            });
                        });
                    }
                    break;
                case 2:
                    if (isl.getNumList(depth).length > 2 && !isl.getIsIslandEndChecked(depth)) {
                        var numIds_1 = isl.getActiveNumList(depth);
                        var num0 = _this.numDict[depth][numIds_1[0]];
                        //出口の数字が二つでその数字が隣接している場合、残り0本の方向は行き止まりとして扱える
                        num0.getSurNumId().forEach(function (id, dir) {
                            //idが一致するのは高々1回なのでforeach中に操作してよい
                            if (id == numIds_1[1]) {
                                var tempResult = false;
                                var nextTarget0 = _this.getDepthNum(depth, numIds_1[0]);
                                var nextTarget1 = _this.getDepthNum(depth, id);
                                execResult0 = nextTarget0.setEnd();
                                execResult1 = nextTarget0.setEnd();
                                tempResult = tempResult || execResult0 || execResult1;
                                var remainDir0 = nextTarget0.getRemain4way()[dir];
                                var remainDir1 = nextTarget1.getRemain4way()[(dir + 2) % 4];
                                if (remainDir0 <= 2 && remainDir0 == remainDir1 && remainDir0 == nextTarget0.getRemainSelf() && remainDir0 == nextTarget1.getRemainSelf()) {
                                    execResult0 = nextTarget0.setIsEndSurTrue(dir, remainDir0);
                                    execResult1 = nextTarget1.setIsEndSurTrue((dir + 2) % 4, remainDir1);
                                    tempResult = tempResult || execResult0 || execResult1;
                                }
                                if (tempResult) {
                                    _this.numsToCheckStack.push(numIds_1[0]);
                                    _this.numsToCheckStack.push(numIds_1[1]);
                                }
                                result = result || tempResult;
                            }
                        });
                    }
                    break;
            }
            isl.setIsIslandEndChecked(depth, true);
        });
        return result;
    };
    HashiBoard.prototype.checkMinHonsu = function (depth) {
        var _this = this;
        var target;
        var remain1;
        var remain2;
        for (var i = 0; i < this.numCount; i++) {
            for (var area = 0; area < 4; area++) {
                remain1 = this.numDict[depth][this.currentId].getRemain4way()[(area + 2) % 4];
                remain2 = this.numDict[depth][this.currentId].getRemain4way()[(area + 3) % 4];
                if (remain1 > 0 || remain2 > 0) {
                    if (this.numDict[depth][this.currentId].checkMin1(area) == 2) {
                        if (this.checkMinHonsuSub(depth, this.currentId, area) == 2) {
                            target = this.getDepthNum(depth, this.currentId);
                            var result4way = target.getExecMin1result(area);
                            result4way.forEach(function (hon, dir) {
                                if (hon > 0) {
                                    // console.log("drawLine Id=" + this.currentId + "dir= " + dir);
                                    _this.drawFrom(depth, _this.currentId, hon, dir);
                                }
                            });
                            this.resultLogArr.push(new ResultLog_1.ResultLog(i, i, result4way, "1M00"));
                            //残りの数字のチェックは必要な時に再度実行でよいので手筋チェック成功時点で一旦打ち切り
                            this.currentId = (this.currentId + 1) % this.numCount;
                            return true;
                        }
                    }
                }
            }
            this.currentId = (this.currentId + 1) % this.numCount;
        }
        return false;
    };
    HashiBoard.prototype.checkMinHonsuSub = function (depth, id, area) {
        var xinc;
        var yinc;
        switch (area) {
            case 0:
                xinc = -1;
                yinc = 0;
                break;
            case 1:
                xinc = 0;
                yinc = -1;
                break;
            case 2:
                xinc = 1;
                yinc = 0;
                break;
            default: //3
                xinc = 0;
                yinc = 1;
                break;
        }
        var x = xinc;
        var y = yinc;
        var targetDict = [];
        var fromAddress = this.numDict[depth][id].getAddress();
        //呼び出し元で両方向引けることを確かめてundefinedは発生しないようにしておく(checkMin1が1または2なら可)
        while (this.boardAbst[fromAddress[0] + y][fromAddress[1] + x] == 0) {
            var idToAdd = this.boardEmpty[fromAddress[0] + y][fromAddress[1] + x].getSurNumId()[(area + 1) % 4];
            if (idToAdd >= 0) {
                targetDict.push(idToAdd);
            }
            x += xinc;
            y += yinc;
        }
        switch (area) {
            case 0:
                xinc = 0;
                yinc = -1;
                break;
            case 1:
                xinc = 1;
                yinc = 0;
                break;
            case 2:
                xinc = 0;
                yinc = 1;
                break;
            default: //3
                xinc = -1;
                yinc = 0;
                break;
        }
        x = xinc;
        y = yinc;
        while (this.boardAbst[fromAddress[0] + y][fromAddress[1] + x] == 0) {
            var nextId = this.boardEmpty[fromAddress[0] + y][fromAddress[1] + x].getSurNumId()[area];
            if (targetDict.includes(nextId)) {
                switch (this.numDict[depth][nextId].checkMin1((area + 2) % 4)) {
                    case 3:
                    case 2:
                        return 2;
                    case 1:
                        if (this.checkMinHonsuSub(depth, nextId, area) == 2) {
                            return 2;
                        }
                        break;
                }
            }
            ;
            x += xinc;
            y += yinc;
        }
        return 0;
    };
    HashiBoard.prototype.addAnswer = function (depth) {
        var newAns = new Array(this.numCount);
        this.numDict[depth].forEach(function (currentNum, i) {
            newAns[i] = currentNum.clone(depth);
        });
        this.answerList.push(newAns);
    };
    HashiBoard.prototype.getResultLogArr = function () {
        return this.resultLogArr;
    };
    return HashiBoard;
}());
exports.HashiBoard = HashiBoard;
