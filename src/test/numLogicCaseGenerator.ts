import { buildCase, isCaseBuildable, NumLogicCase } from "./numLogicTestBuilder";
import { PATTERN_STATES, PatternState, PatternTuple } from "./numLogicTestDomain";

function toPatternTuple(
  p0: PatternState,
  p1: PatternState,
  p2: PatternState,
  p3: PatternState
): PatternTuple {
  return [p0, p1, p2, p3];
}

export function* generateNumLogicCases(): Generator<NumLogicCase> {
  for (let originalNumber = 1; originalNumber < 9; originalNumber++) {
    for (const p0 of PATTERN_STATES) {
      for (const p1 of PATTERN_STATES) {
        for (const p2 of PATTERN_STATES) {
          for (const p3 of PATTERN_STATES) {
            const patterns = toPatternTuple(p0, p1, p2, p3);
            if (!isCaseBuildable(originalNumber, patterns)) {
              continue;
            }
            yield buildCase(originalNumber, patterns);
          }
        }
      }
    }
  }
}
