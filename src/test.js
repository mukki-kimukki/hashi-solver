"use strict";
exports.__esModule = true;
var HashiController_1 = require("./HashiController");
if (process.argv[0].length > 0) {
    var hashiCntr = new HashiController_1.HashiController(process.argv[3]);
    hashiCntr.solve(Number(process.argv[2]));
}
