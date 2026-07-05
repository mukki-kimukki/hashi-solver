import { Direction, N4way } from "../common/Types";
import { Num } from "../solver/Num";
import { buildCase } from "./numLogicTestBuilder";
import { PatternState } from "./numLogicTestDomain";

type NumSnapshot = {
  hands4way: N4way;
  remain4way: N4way;
  remainSelf: number;
  isEndSur: boolean[][];
  isLogicChecked: boolean;
};

type TestCase = {
  name: string;
  run: () => void;
};

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`);
  }
}

function snapshot(num: Num): NumSnapshot {
  return {
    hands4way: num.getHands4way(),
    remain4way: num.getRemain4way(),
    remainSelf: num.getRemainSelf(),
    isEndSur: num.getIsEndSur().map((arr) => arr.concat()),
    isLogicChecked: num.getIsLogicChecked(),
  };
}

function assertSnapshot(actual: NumSnapshot, expected: NumSnapshot, label: string): void {
  assertEqual(actual.hands4way, expected.hands4way, `${label}.hands4way`);
  assertEqual(actual.remain4way, expected.remain4way, `${label}.remain4way`);
  assertEqual(actual.remainSelf, expected.remainSelf, `${label}.remainSelf`);
  assertEqual(actual.isEndSur, expected.isEndSur, `${label}.isEndSur`);
  assertEqual(actual.isLogicChecked, expected.isLogicChecked, `${label}.isLogicChecked`);
}

function leftOnlyNum(pattern: PatternState, originalNumber = 2): Num {
  return buildCase(originalNumber, [
    pattern,
    PatternState.DeadEnd0,
    PatternState.DeadEnd0,
    PatternState.DeadEnd0,
  ]).num;
}

const testCases: TestCase[] = [
  {
    name: "drawFrom(1) updates remain/hands/end-state",
    run: () => {
      const num = leftOnlyNum(PatternState.DeadEnd2, 2);
      num.drawFrom(0, 1);
      assertSnapshot(snapshot(num), {
        hands4way: [1, 0, 0, 0],
        remain4way: [1, 0, 0, 0],
        remainSelf: 1,
        isEndSur: [
          [false, true, false],
          [true, false, false],
          [true, false, false],
          [true, false, false],
        ],
        isLogicChecked: false,
      }, "drawFrom1");
    },
  },
  {
    name: "drawFrom(2) converts dead-end-2 into dead-end-0",
    run: () => {
      const num = leftOnlyNum(PatternState.DeadEnd2, 2);
      num.drawFrom(0, 2);
      assertSnapshot(snapshot(num), {
        hands4way: [2, 0, 0, 0],
        remain4way: [0, 0, 0, 0],
        remainSelf: 0,
        isEndSur: [
          [true, false, false],
          [true, false, false],
          [true, false, false],
          [true, false, false],
        ],
        isLogicChecked: false,
      }, "drawFrom2");
    },
  },
  {
    name: "setRemain1way(1) clears dead-end-2 flag only",
    run: () => {
      const num = leftOnlyNum(PatternState.DeadEnd2, 2);
      num.setRemain1way(0, 1);
      assertSnapshot(snapshot(num), {
        hands4way: [0, 0, 0, 0],
        remain4way: [1, 0, 0, 0],
        remainSelf: 2,
        isEndSur: [
          [false, false, false],
          [true, false, false],
          [true, false, false],
          [true, false, false],
        ],
        isLogicChecked: false,
      }, "setRemain1way1");
    },
  },
  {
    name: "setRemain1way(0) with no hands marks dead-end-0",
    run: () => {
      const num = leftOnlyNum(PatternState.Open0NotDeadEnd2, 2);
      num.setRemain1way(0, 0);
      assertSnapshot(snapshot(num), {
        hands4way: [0, 0, 0, 0],
        remain4way: [0, 0, 0, 0],
        remainSelf: 2,
        isEndSur: [
          [true, false, false],
          [true, false, false],
          [true, false, false],
          [true, false, false],
        ],
        isLogicChecked: false,
      }, "setRemain1way0-nohands");
    },
  },
  {
    name: "setRemain1way(0) with existing hand keeps dead-end-0 false",
    run: () => {
      const num = leftOnlyNum(PatternState.Open1WithArmNotDeadEnd1, 2);
      num.setRemain1way(0, 0);
      assertSnapshot(snapshot(num), {
        hands4way: [1, 0, 0, 0],
        remain4way: [0, 0, 0, 0],
        remainSelf: 1,
        isEndSur: [
          [false, false, false],
          [true, false, false],
          [true, false, false],
          [true, false, false],
        ],
        isLogicChecked: false,
      }, "setRemain1way0-withhand");
    },
  },
  {
    name: "drawTo(fromRemain=0) forces remain-0 on the destination side",
    run: () => {
      const num = leftOnlyNum(PatternState.Open0NotDeadEnd2, 2);
      num.drawTo(0, 1, 0);
      assertSnapshot(snapshot(num), {
        hands4way: [1, 0, 0, 0],
        remain4way: [0, 0, 0, 0],
        remainSelf: 1,
        isEndSur: [
          [false, false, false],
          [true, false, false],
          [true, false, false],
          [true, false, false],
        ],
        isLogicChecked: false,
      }, "drawTo");
    },
  },
  {
    name: "checkLogics(true) applies the same draw returned by checkLogics(false)",
    run: () => {
      const num = buildCase(1, [
        PatternState.DeadEnd0,
        PatternState.DeadEnd0,
        PatternState.DeadEnd0,
        PatternState.Open1NotDeadEnd1,
      ]).num;
      const before = snapshot(num);
      const preview = num.checkLogics(false);
      const applied = num.checkLogics(true);
      assertEqual(applied[0], preview[0], "checkLogics.apply.result");
      assertEqual(applied[1], before.remainSelf - 1, "checkLogics.apply.remainSelf");
      assertSnapshot(snapshot(num), {
        hands4way: [0, 0, 0, 1],
        remain4way: [0, 0, 0, 0],
        remainSelf: 0,
        isEndSur: [
          [true, false, false],
          [true, false, false],
          [true, false, false],
          [false, false, false],
        ],
        isLogicChecked: true,
      }, "checkLogicsTrue");
    },
  },
  {
    name: "trySetRemain1way restores all state including isLogicChecked",
    run: () => {
      const num = buildCase(1, [
        PatternState.DeadEnd0,
        PatternState.DeadEnd0,
        PatternState.DeadEnd0,
        PatternState.Open1NotDeadEnd1,
      ]).num;
      num.checkLogics(true);
      const before = snapshot(num);
      num.trySetRemain1way(3, 0);
      assertSnapshot(snapshot(num), before, "trySetRemain1way.restore");
    },
  },
  {
    name: "trySetRemain2way restores all state including isLogicChecked",
    run: () => {
      const num = buildCase(2, [
        PatternState.Open1NotDeadEnd1,
        PatternState.Open1NotDeadEnd1,
        PatternState.DeadEnd0,
        PatternState.DeadEnd0,
      ]).num;
      num.checkLogics(true);
      const before = snapshot(num);
      num.trySetRemain2way(0, 0, 1, 0);
      assertSnapshot(snapshot(num), before, "trySetRemain2way.restore");
    },
  },
];

let errorCount = 0;
for (const testCase of testCases) {
  try {
    testCase.run();
  } catch (error) {
    errorCount += 1;
    console.log(`[FAIL] ${testCase.name}`);
    console.log(String(error));
    console.log("-------------------------");
  }
}

console.log(`checked state cases = ${testCases.length}`);
console.log(`error count = ${errorCount}`);
