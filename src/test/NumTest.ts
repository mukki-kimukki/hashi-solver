import { DefResult } from "../common/Types";
import { generateNumLogicCases } from "./numLogicCaseGenerator";
import { NumLogicCase } from "./numLogicTestBuilder";
import { expectResult } from "./numLogicOracle";

function hasDifferentDraw(actual: DefResult, expected: DefResult): boolean {
  return actual[0].some((cur, i) => cur !== expected[0][i]);
}

function printFailure(
  testCase: NumLogicCase,
  actual: DefResult,
  expected: DefResult
): void {
  console.log(`case ${testCase.caseId} remain=${testCase.remainSelf}`);
  console.log(" expected " + expected);
  console.log(" actual   " + actual);
  console.log("-------------------------");
}

function runCase(testCase: NumLogicCase): number {
  try {
    const actual = testCase.num.checkLogics(false)[0];
    const expected = expectResult(testCase.num, testCase.patterns);

    if (actual[1].charAt(0) !== expected[1].charAt(0)) {
      printFailure(testCase, actual, expected);
      return 1;
    }

    if (hasDifferentDraw(actual, expected)) {
      printFailure(testCase, actual, expected);
      return 1;
    }

    return 0;
  } catch (_error) {
    throw new Error(`error at ${testCase.caseId} remain=${testCase.remainSelf}`);
  }
}

let totalCount = 0;
let errorCount = 0;

for (const testCase of generateNumLogicCases()) {
  totalCount += 1;
  errorCount += runCase(testCase);
}

console.log(`checked cases = ${totalCount}`);
console.log(`error count = ${errorCount}`);
