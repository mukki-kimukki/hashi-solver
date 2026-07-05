import { N4way } from "../common/Types";
import { Num } from "../solver/Num";

type InitSnapshot = {
  surNumId: N4way;
  remain4way: N4way;
  isEndSur: boolean[][];
  remainSelf: number;
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

function snapshot(num: Num): InitSnapshot {
  return {
    surNumId: num.getSurNumId(),
    remain4way: num.getRemain4way(),
    isEndSur: num.getIsEndSur().map((arr) => arr.concat()),
    remainSelf: num.getRemainSelf(),
  };
}

function createBoard(center: number): number[][] {
  return [
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
    [-1, -1, center, -1, -1],
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
  ];
}

function createIdMap(): number[][] {
  return [
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
    [-1, -1, 0, -1, -1],
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
  ];
}

function createNum(board: number[][], idMap: number[][]): Num {
  return new Num(0, 2, 2, board, idMap, 0);
}

const testCases: TestCase[] = [
  {
    name: "wall on all sides keeps initial wall state",
    run: () => {
      const board = createBoard(3);
      const idMap = createIdMap();
      const num = createNum(board, idMap);
      assertEqual(snapshot(num), {
        surNumId: [-1, -1, -1, -1],
        remain4way: [0, 0, 0, 0],
        isEndSur: [
          [true, false, false],
          [true, false, false],
          [true, false, false],
          [true, false, false],
        ],
        remainSelf: 3,
      }, "all-wall");
    },
  },
  {
    name: "neighbor value 1 sets remain1 and dead-end-1 in the correct direction",
    run: () => {
      const board = createBoard(3);
      const idMap = createIdMap();
      board[2][0] = 1;
      board[0][2] = 1;
      board[2][4] = 1;
      board[4][2] = 1;
      idMap[2][0] = 10;
      idMap[0][2] = 11;
      idMap[2][4] = 12;
      idMap[4][2] = 13;
      const num = createNum(board, idMap);
      assertEqual(snapshot(num), {
        surNumId: [10, 11, 12, 13],
        remain4way: [1, 1, 1, 1],
        isEndSur: [
          [false, true, false],
          [false, true, false],
          [false, true, false],
          [false, true, false],
        ],
        remainSelf: 3,
      }, "all-one");
    },
  },
  {
    name: "neighbor value 2 sets remain2 and dead-end-2 in the correct direction",
    run: () => {
      const board = createBoard(3);
      const idMap = createIdMap();
      board[2][0] = 2;
      board[0][2] = 2;
      board[2][4] = 2;
      board[4][2] = 2;
      idMap[2][0] = 20;
      idMap[0][2] = 21;
      idMap[2][4] = 22;
      idMap[4][2] = 23;
      const num = createNum(board, idMap);
      assertEqual(snapshot(num), {
        surNumId: [20, 21, 22, 23],
        remain4way: [2, 2, 2, 2],
        isEndSur: [
          [false, false, true],
          [false, false, true],
          [false, false, true],
          [false, false, true],
        ],
        remainSelf: 3,
      }, "all-two");
    },
  },
  {
    name: "neighbor value 3 or more sets remain2 without dead-end flag",
    run: () => {
      const board = createBoard(3);
      const idMap = createIdMap();
      board[2][0] = 3;
      board[0][2] = 4;
      board[2][4] = 5;
      board[4][2] = 8;
      idMap[2][0] = 30;
      idMap[0][2] = 31;
      idMap[2][4] = 32;
      idMap[4][2] = 33;
      const num = createNum(board, idMap);
      assertEqual(snapshot(num), {
        surNumId: [30, 31, 32, 33],
        remain4way: [2, 2, 2, 2],
        isEndSur: [
          [false, false, false],
          [false, false, false],
          [false, false, false],
          [false, false, false],
        ],
        remainSelf: 3,
      }, "all-three-plus");
    },
  },
  {
    name: "search skips empty cells and stops at the first number in each direction",
    run: () => {
      const board = createBoard(2);
      const idMap = createIdMap();
      board[2][1] = -1;
      board[2][0] = 3;
      board[1][2] = -1;
      board[0][2] = 1;
      board[2][3] = -1;
      board[2][4] = 2;
      board[3][2] = -1;
      board[4][2] = 8;
      idMap[2][0] = 40;
      idMap[0][2] = 41;
      idMap[2][4] = 42;
      idMap[4][2] = 43;
      const num = createNum(board, idMap);
      assertEqual(snapshot(num), {
        surNumId: [40, 41, 42, 43],
        remain4way: [2, 1, 2, 2],
        isEndSur: [
          [false, false, false],
          [false, true, false],
          [false, false, true],
          [false, false, false],
        ],
        remainSelf: 2,
      }, "skip-empty-cells");
    },
  },
  {
    name: "center remainSelf caps each direction remain at 2 or less",
    run: () => {
      const board = createBoard(1);
      const idMap = createIdMap();
      board[2][0] = 8;
      board[0][2] = 8;
      board[2][4] = 8;
      board[4][2] = 8;
      idMap[2][0] = 50;
      idMap[0][2] = 51;
      idMap[2][4] = 52;
      idMap[4][2] = 53;
      const num = createNum(board, idMap);
      assertEqual(snapshot(num), {
        surNumId: [50, 51, 52, 53],
        remain4way: [1, 1, 1, 1],
        isEndSur: [
          [false, false, false],
          [false, false, false],
          [false, false, false],
          [false, false, false],
        ],
        remainSelf: 1,
      }, "center-cap");
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

console.log(`checked init cases = ${testCases.length}`);
console.log(`error count = ${errorCount}`);
