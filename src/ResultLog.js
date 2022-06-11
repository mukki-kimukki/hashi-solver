"use strict";
exports.__esModule = true;
exports.ResultLog = void 0;
var ResultLog = /** @class */ (function () {
    function ResultLog(numIdCheck, numIdTarget, result, resultCode) {
        this.numIdCheck = numIdCheck;
        this.numIdTarget = numIdTarget;
        this.result = result;
        this.resultCode = resultCode;
    }
    ResultLog.prototype.getNumIdCheck = function () {
        return this.numIdCheck;
    };
    ResultLog.prototype.getNumIdTarget = function () {
        return this.numIdTarget;
    };
    ResultLog.prototype.getResult = function () {
        return this.result;
    };
    ResultLog.prototype.getResultCode = function () {
        return this.resultCode;
    };
    ResultLog.prototype.consoleLog = function () {
        console.log("id= " + this.numIdTarget + " 4way= [" + this.result + "] resultCode= " + this.resultCode);
    };
    ResultLog.defaultResultArr = [[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], [[-1, 0, 0, 0], [0, -1, 0, 0], [0, 0, -1, 0], [0, 0, 0, -1]]];
    return ResultLog;
}());
exports.ResultLog = ResultLog;
