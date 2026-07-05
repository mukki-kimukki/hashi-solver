import { DefResult, MutableN4way, N4way } from "../common/Types";
import { Num } from "../solver/Num";
import { getPatternSpec, PatternState, PatternTuple } from "./numLogicTestDomain";

function checkEnd(pattern: PatternState, hon: number): boolean {
  return getPatternSpec(pattern).isEndAfterDraw(hon);
}

function enumerateFeasibleDraws(
  num: Num,
  patterns: PatternTuple
): MutableN4way[] {
  const list: MutableN4way[] = [];
  const remain4way: N4way = num.getRemain4way();
  const remainSelf = num.getRemainSelf();
  const max0 = Math.min(remainSelf, remain4way[0]);

  for (let hon0 = 0; hon0 <= max0; hon0++) {
    const tempResult0: MutableN4way = [hon0, 0, 0, 0];
    const remain0 = remainSelf - hon0;
    const endFlg0 = checkEnd(patterns[0], hon0);
    const max1 = Math.min(remain0, remain4way[1]);

    for (let hon1 = 0; hon1 <= max1; hon1++) {
      const tempResult1: MutableN4way = [
        tempResult0[0],
        tempResult0[1],
        tempResult0[2],
        tempResult0[3],
      ];
      tempResult1[1] = hon1;
      const remain1 = remain0 - hon1;
      const endFlg1 = endFlg0 && checkEnd(patterns[1], hon1);
      const max2 = Math.min(remain1, remain4way[2]);

      for (let hon2 = 0; hon2 <= max2; hon2++) {
        const tempResult2: MutableN4way = [
          tempResult1[0],
          tempResult1[1],
          tempResult1[2],
          tempResult1[3],
        ];
        tempResult2[2] = hon2;
        const hon3 = remain1 - hon2;
        tempResult2[3] = hon3;

        if (hon3 <= remain4way[3]) {
          const endFlg2 = endFlg1 && checkEnd(patterns[2], hon2);
          const endFlg3 = endFlg2 && checkEnd(patterns[3], hon3);
          if (endFlg3) {
            if (
              hon0 === remain4way[0] &&
              hon1 === remain4way[1] &&
              hon2 === remain4way[2] &&
              hon3 === remain4way[3]
            ) {
              list.push(tempResult2);
            }
          } else {
            list.push(tempResult2);
          }
        }
      }
    }
  }

  return list;
}

function reduceCommonDraw(draws: MutableN4way[]): MutableN4way {
  return draws.reduce((prev, cur) => {
    const next: MutableN4way = [prev[0], prev[1], prev[2], prev[3]];
    next[0] = Math.min(prev[0], cur[0]);
    next[1] = Math.min(prev[1], cur[1]);
    next[2] = Math.min(prev[2], cur[2]);
    next[3] = Math.min(prev[3], cur[3]);
    return next;
  }, draws[0]);
}

export function expectResult(num: Num, patterns: PatternTuple): DefResult {
  const feasibleDraws = enumerateFeasibleDraws(num, patterns);

  if (feasibleDraws.length === 0) {
    if (num.getRemainSelf() === 0) {
      return [[0, 0, 0, 0], "0"];
    }
    return [[0, 0, 0, 0], "9"];
  }

  const result = reduceCommonDraw(feasibleDraws);
  if (result.some((hon) => hon !== 0)) {
    return [result, "1"];
  }
  return [result, "0"];
}
