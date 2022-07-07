import { Num } from "../solver/Num";

function remainOf(p:number):number{
    switch(p){
        case 0:
            //not行き止まり0
            return 0;
        case 1:
            //行き止まり0
            return 0;
        case 2:
            //not行き止まり腕なし1
            return 1;
        case 3:
            //not行き止まり腕あり1
            return 1;
        case 4:
            //行き止まり腕なし1
            return 1;
        case 5:
            //行き止まり腕あり1
            return 1;
        case 6:
            //not行き止まり2
            return 2;
        default: //case7;
            //行き止まり2
            return 2;
    }
}

function drawFlgP(p:number):boolean{
    switch(p){
        case 0:
            //not行き止まり0
            //m=3;
            //num.setRemain1way(dir,0);
            return false;
        case 1:
            //行き止まり0
            //m=0;
            //何もしない
            return false;
        case 2:
            //not行き止まり腕なし1
            //m=3;
            //num.setRemain1way(dir,1);
            return false;
        case 3:
            //not行き止まり腕あり1
            //m=3;
            //num.drawFrom(dir,1);
            //num.setRemain1way(dir,0);
            return true;
        case 4:
            //行き止まり腕なし1
            //m=1;
            //何もしない
            return false;
        case 5:
            //行き止まり腕あり1
            //m=2;
            //num.drawFrom(dir,1);
            return true;
        case 6:
            //not行き止まり2
            //m=3;
            //何もしない
            return false;
        default: //case7;
            //行き止まり2
            //m=2;
            //何もしない
            return false;
    }
}

function initMap(dir:number,p:number,numMap:number[][]):void{
    let x:number;
    let y:number;
    switch(dir){
        case 0:
            x=0;
            y=2;
            break;
        case 1:
            x=2;
            y=0;
            break;
        case 2:
            x=4;
            y=2;
            break;
        default:
            x=2;
            y=4;
            break;
    }
    let m:number;
    switch(p){
        case 0:
            //not行き止まり0
            m=3;
            break;
        case 1:
            //行き止まり0
            m=0;
            break;
        case 2:
            //not行き止まり腕なし1
            m=3;
            break;
        case 3:
            //not行き止まり腕あり1
            m=3;
            break;
        case 4:
            //行き止まり腕なし1
            m=1;
            break;
        case 5:
            //行き止まり腕あり1
            m=2;
            break;
        case 6:
            //not行き止まり2
            m=3;
            break;
        default: //case7;
            //行き止まり2
            m=2;
            break;
    }
    numMap[y][x]=m;
}

function initDir(dir:number,p:number,num:Num):void{
    switch(p){
        case 0:
            //not行き止まり0
            //m=3;
            num.setRemain1way(dir,0);
            break;
        case 1:
            //行き止まり0
            //m=0;
            //何もしない
            break;
        case 2:
            //not行き止まり腕なし1
            //m=3;
            num.setRemain1way(dir,1);
            break;
        case 3:
            //not行き止まり腕あり1
            //m=3;
            num.drawFrom(dir,1);
            num.setRemain1way(dir,1);
            break;
        case 4:
            //行き止まり腕なし1
            //m=1;
            //何もしない
            break;
        case 5:
            //行き止まり腕あり1
            //m=2;
            num.drawFrom(dir,1);
            break;
        case 6:
            //not行き止まり2
            //m=3;
            //何もしない
            break;
        default: //case7;
            //行き止まり2
            //m=2;
            //何もしない
            break;
    }
}

function initNum(n:number,p0:number,p1:number,p2:number,p3:number,numMap:number[][]):Num{
    const num = new Num(0,2,2,numMap,numMap,0);
    initDir(0,p0,num);
    initDir(1,p1,num);
    initDir(2,p2,num);
    initDir(3,p3,num);
    num.setIsLogicCheckedFalse();
    return num;
}

function checkEnd(p:number,hon:number):boolean{
    switch(p){
        case 0:
            //not行き止まり0
                //m=3;
                    //num.setRemain1way(dir,0);
            return false;
        case 1:
            //行き止まり0
                //m=0;
                    //何もしない
            return true;
        case 2:
            //not行き止まり腕なし1
                //m=3;
                    //num.setRemain1way(dir,1);
            return hon==0;
        case 3:
            //not行き止まり腕あり1
                //m=3;
                    //num.drawFrom(dir,1);
                    //num.setRemain1way(dir,0);
            return false;
        case 4:
            //行き止まり腕なし1
                //m=1;
                    //何もしない
            return true;
        case 5:
            //行き止まり腕あり1
                //m=2;
                    //num.drawFrom(dir,1);
            return hon==1;
        case 6:
            //not行き止まり2
                //m=3;
                    //何もしない
            return hon==0;
        default: //case7;
            //行き止まり2
                //m=2;
                    //何もしない
            return hon!=1;
    }
}

function expectResult(num:Num,p0:number,p1:number,p2:number,p3:number):[number[],string]{
    let list:number[][]=[];
    const remain4way:number[] = num.getRemain4way();
    const n:number=num.getRemainSelf();
    const max0:number = Math.min(n,remain4way[0])
    for(let hon0:number=0;hon0 <= max0;hon0++){
        const tempResult0:number[] = [hon0,0,0,0];
        const remain0 = n-hon0;
        const endFlg0 = checkEnd(p0,hon0);
        const max1:number = Math.min(remain0,remain4way[1]);
        for(let hon1:number=0;hon1 <= max1;hon1++){
            let tempResult1:number[] = tempResult0.concat();
            tempResult1[1]=hon1;
            const remain1 = remain0-hon1;
            const endFlg1 = endFlg0 && checkEnd(p1,hon1);
            const max2:number = Math.min(remain1,remain4way[2]);
            for(let hon2:number=0;hon2 <= max2;hon2++){
                let tempResult2:number[] = tempResult1.concat();
                tempResult2[2]=hon2;
                const hon3 = remain1-hon2;
                tempResult2[3]=hon3;
                const endFlg2 = endFlg1 && checkEnd(p2,hon2);
                const endFlg3 = endFlg2 && checkEnd(p3,hon3);
                if(endFlg3){
                    if(hon0===remain4way[0] && hon1===remain4way[1] && hon2===remain4way[2] && hon3===remain4way[3]){
                        list.push(tempResult2);
                    }
                }else{
                    if(hon3 <= remain4way[3]){
                        list.push(tempResult2);
                    }
                }
            }
        }
    }
    //破綻チェック
    if(list.length==0){
        return [[0,0,0,0],"9"];
    }else{
        const result = list.reduce((prev,cur)=>{
            let next:number[] = prev.concat();
            next[0] = Math.min(prev[0],cur[0]);
            next[1] = Math.min(prev[1],cur[1]);
            next[2] = Math.min(prev[2],cur[2]);
            next[3] = Math.min(prev[3],cur[3]);
            return next;
        },list[0]);
        if(result.findIndex(hon=>hon>0)>=0){
            return [result,"1"];
        }else{
            return [result,"0"];
        }
    }
}


function testNum(n:number,p0:number,p1:number,p2:number,p3:number):number{
    let numMap:number[][]=[[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1]];
    initMap(0,p0,numMap);
    initMap(1,p1,numMap);
    initMap(2,p2,numMap);
    initMap(3,p3,numMap);
    numMap[2][2]=n;
    const num = initNum(n,p0,p1,p2,p3,numMap);
    const actual:[number[],string] = num.checkLogics(false)[0];
    const expect:[number[],string] = expectResult(num,p0,p1,p2,p3);
    if(actual[1].charAt(0) !== expect[1].charAt(0)){
        const remain:number = n - Number(drawFlgP(p0)) - Number(drawFlgP(p1)) - Number(drawFlgP(p2)) - Number(drawFlgP(p3));
        console.log("at n = " + remain + " p0p1p2p3 =" + String(p0)+String(p1)+String(p2)+String(p3));
        console.log(" expected " + expect);
        console.log(" actualy  " + actual);
        console.log("-------------------------");
        return 1;
    }else if(actual[0].reduce((prev,cur,i,exp = expect[0])=>Number(prev == 1 || cur != exp[i]),0)){
        const remain:number = n - Number(drawFlgP(p0)) - Number(drawFlgP(p1)) - Number(drawFlgP(p2)) - Number(drawFlgP(p3));
        console.log("at n = " + remain + " p0p1p2p3 =" + String(p0)+String(p1)+String(p2)+String(p3));
        console.log(" expected " + expect);
        console.log(" actualy  " + actual);
        console.log("-------------------------");
        return 1;
    }else{
        return 0;
    }
}

function checkDrawCount(n:number,p0:number,p1:number,p2:number,p3:number):boolean{
    //線を引く準備が必要な場合
    if(drawFlgP(p0)||drawFlgP(p1)||drawFlgP(p2)||drawFlgP(p3)){
        //線を引く準備が不可能であればfalse
        return (n > remainOf(p0) + remainOf(p1) + remainOf(p2) + remainOf(p3));
    }else{
        return true;
    }
}


let errorCount:number = 0;
//ヒント数字場合分けループ
for(let n=1;n<9;n++){
    //方向毎の情報設定ループ
    for(let p0=0;p0<8;p0++){
        for(let p1=0;p1<8;p1++){
            for(let p2=0;p2<8;p2++){
                for(let p3=0;p3<8;p3++){
                    //そもそも準備が不可能なパターンは実施しない
                        if(checkDrawCount(n,p0,p1,p2,p3)){
                            errorCount += testNum(n,p0,p1,p2,p3);
                        }
                    }
                }
            }
        }
    }