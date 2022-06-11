"use strict";
exports.__esModule = true;
exports.Island = void 0;
var Island = /** @class */ (function () {
    function Island(id) {
        this.isIslandEndChecked = [false]; //手筋チェック済フラグ：無駄な検証をスキップ
        this.islandId = id;
        this.numList = [[id]];
        this.activeNumList = [[id]];
    }
    /**
     * mergeTargetをこの島にマージする
     * @param mergeTarget マージする島
     */
    Island.prototype.mergeIsland = function (depth, mergeTarget) {
        //リストのマージ
        this.numList[depth] = this.numList[depth].concat(mergeTarget.getNumList(depth));
        this.activeNumList[depth] = this.activeNumList[depth].concat(mergeTarget.getActiveNumList(depth));
        mergeTarget.inactivateMergedIsland(depth);
        this.isIslandEndChecked[depth] = false;
    };
    Island.prototype.getNumList = function (depth) {
        return this.numList[depth];
    };
    Island.prototype.getActiveNumList = function (depth) {
        return this.activeNumList[depth];
    };
    Island.prototype.inactivateMergedIsland = function (depth) {
        this.numList[depth] = [];
        this.activeNumList[depth] = [];
    };
    /**
     * 残り0本になった数字のidを数字の所属する島に伝える
     * @param deleteId 残り0本となった数字のid
     */
    Island.prototype.inactivateNum = function (depth, deleteId) {
        this.activeNumList[depth].splice(this.activeNumList[depth].indexOf(deleteId), 1);
        this.isIslandEndChecked[depth] = false;
    };
    Island.prototype.getIsIslandEndChecked = function (depth) {
        return this.isIslandEndChecked[depth];
    };
    Island.prototype.setIsIslandEndChecked = function (depth, flg) {
        this.isIslandEndChecked[depth] = flg;
    };
    Island.prototype.makeNextDepth = function (depth) {
        this.deleteTrial(depth);
        this.numList[depth] = this.numList[depth - 1].concat();
        this.activeNumList[depth] = this.activeNumList[depth - 1].concat();
        this.isIslandEndChecked[depth] = this.isIslandEndChecked[depth - 1];
    };
    Island.prototype.deleteTrial = function (depth) {
        this.numList.splice(depth);
        this.activeNumList.splice(depth);
        this.isIslandEndChecked.splice(depth);
    };
    Island.prototype.getId = function () {
        return this.islandId;
    };
    return Island;
}());
exports.Island = Island;
