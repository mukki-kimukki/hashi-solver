import { Num } from "../solver/Num";

const enum Dir {
    Left = 0,
    Up = 1,
    Right = 2,
    Down = 3,
}

const enum PatternState {
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

type PatternSpec = {
    mapValue:number;
    drawCount:number;
    remain:number;
    applyToNum:(dir:Dir, num:Num)=>void;
    isEndAfterDraw:(hon:number)=>boolean;
};

const DIR_TO_POS: Record<Dir,{x:number;y:number}> = {
    [Dir.Left]: {x:0,y:2},
    [Dir.Up]: {x:2,y:0},
    [Dir.Right]: {x:4,y:2},
    [Dir.Down]: {x:2,y:4},
};

const PATTERN_SPECS: Record<PatternState,PatternSpec> = {
    [PatternState.Draw1DeadEnd0]: {
        mapValue: 1,
        drawCount: 1,
        remain: 0,
        applyToNum: (dir, num) => {
            num.drawFrom(dir,1);
        },
        isEndAfterDraw: () => true,
    },
    [PatternState.Open2NotDeadEnd0]: {
        mapValue: 3,
        drawCount: 2,
        remain: 0,
        applyToNum: (dir, num) => {
            num.drawFrom(dir,2);
        },
        isEndAfterDraw: () => false,
    },
    [PatternState.DeadEnd0]: {
        mapValue: 2,
        drawCount: 0,
        remain: 0,
        applyToNum: (dir, num) => {
            num.setRemain1way(dir,0);
        },
        isEndAfterDraw: () => true,
    },
    [PatternState.Open1NotDeadEnd1]: {
        mapValue: 3,
        drawCount: 0,
        remain: 1,
        applyToNum: (dir, num) => {
            num.setRemain1way(dir,1);
        },
        isEndAfterDraw: (hon) => hon === 0,
    },
    [PatternState.Open1WithArmNotDeadEnd1]: {
        mapValue: 3,
        drawCount: 1,
        remain: 1,
        applyToNum: (dir, num) => {
            num.drawFrom(dir,1);
            num.setRemain1way(dir,1);
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
            num.drawFrom(dir,1);
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

const PATTERN_STATES: PatternState[] = [
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

function getPatternSpec(pattern:PatternState):PatternSpec{
    const spec = PATTERN_SPECS[pattern];
    if(spec === undefined){
        throw new RangeError(`unknown pattern state: ${pattern}`);
    }
    return spec;
}

function remainOf(pattern:PatternState):number{
    return getPatternSpec(pattern).remain;
}

function drawCountOf(pattern:PatternState):number{
    return getPatternSpec(pattern).drawCount;
}

function initMap(dir:Dir, pattern:PatternState, numMap:number[][]):void{
    const pos = DIR_TO_POS[dir];
    numMap[pos.y][pos.x] = getPatternSpec(pattern).mapValue;
}

function initDir(dir:Dir, pattern:PatternState, num:Num):void{
    getPatternSpec(pattern).applyToNum(dir, num);
}

function initNum(
    p0:PatternState,
    p1:PatternState,
    p2:PatternState,
    p3:PatternState,
    numMap:number[][],
):Num{
    const num = new Num(0,2,2,numMap,numMap,0);
    initDir(Dir.Left,p0,num);
    initDir(Dir.Up,p1,num);
    initDir(Dir.Right,p2,num);
    initDir(Dir.Down,p3,num);
    num.setIsLogicCheckedFalse();
    return num;
}

function checkEnd(pattern:PatternState,hon:number):boolean{
    return getPatternSpec(pattern).isEndAfterDraw(hon);
}

function expectResult(
    num:Num,
    p0:PatternState,
    p1:PatternState,
    p2:PatternState,
    p3:PatternState,
):[number[],string]{
    const list:number[][] = [];
    const remain4way:number[] = num.getRemain4way();
    const n:number = num.getRemainSelf();
    const max0:number = Math.min(n,remain4way[0]);

    for(let hon0 = 0;hon0 <= max0;hon0++){
        const tempResult0:number[] = [hon0,0,0,0];
        const remain0 = n - hon0;
        const endFlg0 = checkEnd(p0,hon0);
        const max1:number = Math.min(remain0,remain4way[1]);
        for(let hon1 = 0;hon1 <= max1;hon1++){
            const tempResult1:number[] = tempResult0.concat();
            tempResult1[1] = hon1;
            const remain1 = remain0 - hon1;
            const endFlg1 = endFlg0 && checkEnd(p1,hon1);
            const max2:number = Math.min(remain1,remain4way[2]);
            for(let hon2 = 0;hon2 <= max2;hon2++){
                const tempResult2:number[] = tempResult1.concat();
                tempResult2[2] = hon2;
                const hon3 = remain1 - hon2;
                tempResult2[3] = hon3;
                if(hon3 <= remain4way[3]){
                    const endFlg2 = endFlg1 && checkEnd(p2,hon2);
                    const endFlg3 = endFlg2 && checkEnd(p3,hon3);
                    if(endFlg3){
                        if(
                            hon0 === remain4way[0] &&
                            hon1 === remain4way[1] &&
                            hon2 === remain4way[2] &&
                            hon3 === remain4way[3]
                        ){
                            list.push(tempResult2);
                        }
                    }else{
                        list.push(tempResult2);
                    }
                }
            }
        }
    }

    if(list.length === 0){
        if(n === 0){
            return [[0,0,0,0],"0"];
        }
        return [[0,0,0,0],"9"];
    }

    const result = list.reduce((prev,cur)=>{
        const next:number[] = prev.concat();
        next[0] = Math.min(prev[0],cur[0]);
        next[1] = Math.min(prev[1],cur[1]);
        next[2] = Math.min(prev[2],cur[2]);
        next[3] = Math.min(prev[3],cur[3]);
        return next;
    },list[0]);

    if(result.some((hon)=>hon !== 0)){
        return [result,"1"];
    }
    return [result,"0"];
}

function testNum(
    n:number,
    p0:PatternState,
    p1:PatternState,
    p2:PatternState,
    p3:PatternState,
):number{
    const numMap:number[][] = [
        [-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1],
    ];
    initMap(Dir.Left,p0,numMap);
    initMap(Dir.Up,p1,numMap);
    initMap(Dir.Right,p2,numMap);
    initMap(Dir.Down,p3,numMap);
    numMap[2][2] = n;
    const num = initNum(p0,p1,p2,p3,numMap);

    try{
        const actual:[number[],string] = num.checkLogics(false)[0];
        const expect:[number[],string] = expectResult(num,p0,p1,p2,p3);
        const remain:number = n - drawCountOf(p0) - drawCountOf(p1) - drawCountOf(p2) - drawCountOf(p3);

        if(actual[1].charAt(0) !== expect[1].charAt(0)){
            console.log("at n = " + remain + " p0p1p2p3 =" + String(p0)+String(p1)+String(p2)+String(p3));
            console.log(" expected " + expect);
            console.log(" actualy  " + actual);
            console.log("-------------------------");
            return 1;
        }

        if(actual[0].some((cur,i)=>cur !== expect[0][i])){
            console.log("at n = " + remain + " p0p1p2p3 =" + String(p0)+String(p1)+String(p2)+String(p3));
            console.log(" expected " + expect);
            console.log(" actualy  " + actual);
            console.log("-------------------------");
            return 1;
        }

        return 0;
    }catch(e){
        const remain:number = n - drawCountOf(p0) - drawCountOf(p1) - drawCountOf(p2) - drawCountOf(p3);
        throw new Error("error at remain= " + remain + " p0p1p2p3 =" + String(p0)+String(p1)+String(p2)+String(p3));
    }
}

function checkDrawCount(
    n:number,
    p0:PatternState,
    p1:PatternState,
    p2:PatternState,
    p3:PatternState,
):boolean{
    const drawCountSum:number = drawCountOf(p0) + drawCountOf(p1) + drawCountOf(p2) + drawCountOf(p3);
    if(drawCountSum > 0){
        return (n - drawCountSum) >= 0 && n >= (remainOf(p0) + remainOf(p1) + remainOf(p2) + remainOf(p3));
    }
    return true;
}

let errorCount:number = 0;
for(let n = 1;n < 9;n++){
    for(const p0 of PATTERN_STATES){
        for(const p1 of PATTERN_STATES){
            for(const p2 of PATTERN_STATES){
                for(const p3 of PATTERN_STATES){
                    if(checkDrawCount(n,p0,p1,p2,p3)){
                        errorCount += testNum(n,p0,p1,p2,p3);
                    }
                }
            }
        }
    }
}
console.log("error count = " + errorCount);
