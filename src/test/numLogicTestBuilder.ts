import { Directions, Direction } from "../common/Types";
import { Num } from "../solver/Num";
import {
  DIR_TO_POS,
  drawCountOf,
  getPatternSpec,
  PatternState,
  PatternTuple,
  remainOf,
} from "./numLogicTestDomain";

export type NumLogicCase = {
  originalNumber: number;
  patterns: PatternTuple;
  board: number[][];
  num: Num;
  remainSelf: number;
  caseId: string;
};

export function createEmptyBoard(): number[][] {
  return [
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
  ];
}

export function initMap(
  dir: Direction,
  pattern: PatternState,
  board: number[][]
): void {
  const pos = DIR_TO_POS[dir];
  board[pos.y][pos.x] = getPatternSpec(pattern).mapValue;
}

export function initDir(dir: Direction, pattern: PatternState, num: Num): void {
  getPatternSpec(pattern).applyToNum(dir, num);
}

export function buildBoard(
  originalNumber: number,
  patterns: PatternTuple
): number[][] {
  const board = createEmptyBoard();
  Directions.forEach((dir) => {
    initMap(dir, patterns[dir], board);
  });
  board[2][2] = originalNumber;
  return board;
}

export function buildNum(board: number[][], patterns: PatternTuple): Num {
  const num = new Num(0, 2, 2, board, board, 0);
  Directions.forEach((dir) => {
    initDir(dir, patterns[dir], num);
  });
  num.setIsLogicCheckedFalse();
  return num;
}

export function formatCaseId(
  originalNumber: number,
  patterns: PatternTuple
): string {
  return `n=${originalNumber} p=${patterns.join("")}`;
}

export function buildCase(
  originalNumber: number,
  patterns: PatternTuple
): NumLogicCase {
  const board = buildBoard(originalNumber, patterns);
  const num = buildNum(board, patterns);
  return {
    originalNumber,
    patterns,
    board,
    num,
    remainSelf:
      originalNumber -
      drawCountOf(patterns[0]) -
      drawCountOf(patterns[1]) -
      drawCountOf(patterns[2]) -
      drawCountOf(patterns[3]),
    caseId: formatCaseId(originalNumber, patterns),
  };
}

export function isCaseBuildable(
  originalNumber: number,
  patterns: PatternTuple
): boolean {
  const drawCountSum =
    drawCountOf(patterns[0]) +
    drawCountOf(patterns[1]) +
    drawCountOf(patterns[2]) +
    drawCountOf(patterns[3]);
  if (drawCountSum > 0) {
    return (
      originalNumber - drawCountSum >= 0 &&
      originalNumber >=
        remainOf(patterns[0]) +
          remainOf(patterns[1]) +
          remainOf(patterns[2]) +
          remainOf(patterns[3])
    );
  }
  return true;
}
