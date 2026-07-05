import { Direction } from "../common/Types";
import { Num } from "../solver/Num";

export const enum PatternState {
  Draw1DeadEnd0 = -1,
  Open2NotDeadEnd0 = 0,
  DeadEnd0 = 1,
  Open1NotDeadEnd1 = 2,
  Open1WithArmNotDeadEnd1 = 3,
  DeadEndNoArm1 = 4,
  DeadEndWithArm1 = 5,
  Open0NotDeadEnd2 = 6,
  DeadEnd2 = 7,
}

export type PatternSpec = {
  mapValue: number;
  drawCount: number;
  remain: number;
  applyToNum: (dir: Direction, num: Num) => void;
  isEndAfterDraw: (hon: number) => boolean;
};

export type PatternTuple = [
  PatternState,
  PatternState,
  PatternState,
  PatternState,
];

export const DIR_TO_POS: Record<Direction, { x: number; y: number }> = {
  0: { x: 0, y: 2 },
  1: { x: 2, y: 0 },
  2: { x: 4, y: 2 },
  3: { x: 2, y: 4 },
};

export const PATTERN_SPECS: Record<PatternState, PatternSpec> = {
  [PatternState.Draw1DeadEnd0]: {
    mapValue: 1,
    drawCount: 1,
    remain: 0,
    applyToNum: (dir, num) => {
      num.drawFrom(dir, 1);
    },
    isEndAfterDraw: () => true,
  },
  [PatternState.Open2NotDeadEnd0]: {
    mapValue: 3,
    drawCount: 2,
    remain: 0,
    applyToNum: (dir, num) => {
      num.drawFrom(dir, 2);
    },
    isEndAfterDraw: () => false,
  },
  [PatternState.DeadEnd0]: {
    mapValue: 2,
    drawCount: 0,
    remain: 0,
    applyToNum: (dir, num) => {
      num.setRemain1way(dir, 0);
    },
    isEndAfterDraw: () => true,
  },
  [PatternState.Open1NotDeadEnd1]: {
    mapValue: 3,
    drawCount: 0,
    remain: 1,
    applyToNum: (dir, num) => {
      num.setRemain1way(dir, 1);
    },
    isEndAfterDraw: (hon) => hon === 0,
  },
  [PatternState.Open1WithArmNotDeadEnd1]: {
    mapValue: 3,
    drawCount: 1,
    remain: 1,
    applyToNum: (dir, num) => {
      num.drawFrom(dir, 1);
      num.setRemain1way(dir, 1);
    },
    isEndAfterDraw: () => false,
  },
  [PatternState.DeadEndNoArm1]: {
    mapValue: 1,
    drawCount: 0,
    remain: 1,
    applyToNum: () => undefined,
    isEndAfterDraw: () => true,
  },
  [PatternState.DeadEndWithArm1]: {
    mapValue: 2,
    drawCount: 1,
    remain: 1,
    applyToNum: (dir, num) => {
      num.drawFrom(dir, 1);
    },
    isEndAfterDraw: (hon) => hon === 1,
  },
  [PatternState.Open0NotDeadEnd2]: {
    mapValue: 3,
    drawCount: 0,
    remain: 2,
    applyToNum: () => undefined,
    isEndAfterDraw: (hon) => hon === 0,
  },
  [PatternState.DeadEnd2]: {
    mapValue: 2,
    drawCount: 0,
    remain: 2,
    applyToNum: () => undefined,
    isEndAfterDraw: (hon) => hon !== 1,
  },
};

export const PATTERN_STATES: readonly PatternState[] = [
  PatternState.Draw1DeadEnd0,
  PatternState.Open2NotDeadEnd0,
  PatternState.DeadEnd0,
  PatternState.Open1NotDeadEnd1,
  PatternState.Open1WithArmNotDeadEnd1,
  PatternState.DeadEndNoArm1,
  PatternState.DeadEndWithArm1,
  PatternState.Open0NotDeadEnd2,
  PatternState.DeadEnd2,
];

export function getPatternSpec(pattern: PatternState): PatternSpec {
  const spec = PATTERN_SPECS[pattern];
  if (spec === undefined) {
    throw new RangeError(`unknown pattern state: ${pattern}`);
  }
  return spec;
}

export function remainOf(pattern: PatternState): number {
  return getPatternSpec(pattern).remain;
}

export function drawCountOf(pattern: PatternState): number {
  return getPatternSpec(pattern).drawCount;
}
