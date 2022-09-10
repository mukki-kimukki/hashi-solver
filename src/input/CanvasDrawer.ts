import { HashiController } from "../solver/HashiController";
import { Num } from "../solver/Num";
import { ResultLog } from "../solver/ResultLog";
import { HashiBaseConstants as hbc} from "../solver/HashiBaseConstants";
import { UiConstants as uc } from "./UiConstants";
import { InputLog } from "./inputLog";
import { CommonFunctions as cf } from "../common/CommonFunctions";

export class CanvasDrawer{
    readonly divCanvas:HTMLElement = document.getElementById("divCanvas") as HTMLElement;
    private numsCanvasList:HTMLCanvasElement[]=[];
    private numsContextList:CanvasRenderingContext2D[]=[];
    private inputLinesCanvasList:HTMLCanvasElement[]=[];
    private inputLinesContextList:CanvasRenderingContext2D[]=[];
    private inputDepth:number = 0;
    private solverLinesCanvasList:HTMLCanvasElement[]=[];
    private solverLinesContextList:CanvasRenderingContext2D[]=[];
    private solverMaxDepth:number = 0;


    private stepList:number[][]=[[]];

    /*
    private numsCharCanvas:HTMLCanvasElement;
    private numsCharContext:CanvasRenderingContext2D;
    private numsBgCanvas:HTMLCanvasElement;
    private numsBgContext:CanvasRenderingContext2D;
    private numsMaskCanvas:HTMLCanvasElement
    private numsMaskContext:CanvasRenderingContext2D;
    private linesCanvas:HTMLCanvasElement
    private linesContext:CanvasRenderingContext2D;
    private linesMaskCanvas:HTMLCanvasElement
    private linesMaskContext:CanvasRenderingContext2D;
    */
    private targetCanvas:HTMLCanvasElement
    private targetContext:CanvasRenderingContext2D;
    private targetMaskCanvas:HTMLCanvasElement
    private targetMaskContext:CanvasRenderingContext2D;

    private clickX:number[] = [];
    private clickY:number[] = [];
    private clickDrag:boolean[] =[];
    private width:number = 0;
    private height:number = 0;
    private lineWidth:number;
    private lineSpacing:number;
    private fontSize:string;
    
    private boardSize:number[];
    /** x:[0] y:[1] number:[2]*/
    private numPosDict:Map<number,number[]> = new Map();
    private numPathDict:Map<number,Path2D> = new Map();
    private resultPathArr:Path2D[] = [];//線の描画用
    private resultMaskMap:Map<number,Path2D> = new Map();//2本目を引く際の一本目マスク用

    constructor(hashiCtrl:HashiController){
        this.lineWidth =uc.gridSize/15;
        this.lineSpacing = uc.gridSize/5;
        this.fontSize = String(uc.gridSize*3/5) + "px";

        //CanvasElementとContextの取得
        this.targetCanvas = document.getElementById("targetCanvas") as HTMLCanvasElement;
        this.targetContext = this.targetCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.targetMaskCanvas = document.getElementById("targetMaskCanvas") as HTMLCanvasElement;
        this.targetMaskContext = this.targetMaskCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.targetCanvas.width = this.width;
        this.targetCanvas.height = this.height;
        this.targetMaskCanvas.width = this.width;
        this.targetMaskCanvas.height = this.height;
        /*
        this.linesCanvas = document.getElementById("linesCanvas") as HTMLCanvasElement;
        this.linesContext = this.linesCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.linesMaskCanvas = document.getElementById("linesMaskCanvas") as HTMLCanvasElement;
        this.linesMaskContext = this.linesMaskCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.numsBgCanvas = document.getElementById("numsBgCanvas") as HTMLCanvasElement;
        this.numsBgContext = this.numsBgCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.numsMaskCanvas = document.getElementById("numsMaskCanvas") as HTMLCanvasElement;
        this.numsMaskContext = this.numsMaskCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.numsCharCanvas = document.getElementById("numsCharCanvas") as HTMLCanvasElement;
        this.numsCharContext = this.numsCharCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.numsCharCanvas.width = this.width;
        this.numsCharCanvas.height = this.height;
        this.numsBgCanvas.width = this.width;
        this.numsBgCanvas.height = this.height;
        this.numsMaskCanvas.width = this.width;
        this.numsMaskCanvas.height = this.height;
        this.linesCanvas.width = this.width;
        this.linesCanvas.height = this.height;
        this.linesMaskCanvas.width = this.width;
        this.linesMaskCanvas.height = this.height;
        */

        //Context初期化

        this.targetContext.strokeStyle = uc.tgtColor;
        this.targetContext.lineWidth = this.lineWidth;
        this.targetMaskContext.fillStyle = uc.bgColor;

        
        
        /*
        this.numsCharContext.strokeStyle=uc.lineColor;
        this.numsCharContext.fillStyle=uc.lineColor
        this.numsCharContext.font=this.fontSize+ " Meiryo";
        this.numsCharContext.strokeRect(0,0,this.width,this.height);
        
        this.linesMaskContext.fillStyle = uc.bgColor;
        this.linesContext.strokeStyle = uc.lineColor;
        this.linesContext.lineWidth = this.lineWidth;

        this.numsBgContext.fillStyle=uc.bgColor;
        this.numsMaskContext.globalAlpha=0.2;
        */

        //盤面初期化
        this.boardSize = hashiCtrl.getBoardSize();
        this.width = (this.boardSize[0] + 1)  * uc.gridSize;
        this.height = (this.boardSize[1] + 1) * uc.gridSize;

        this.initDepth(uc.DrawType.inputLog,0);

    }

    public setSolverMaxDepth(solverMaxDepth:number){
        this.solverMaxDepth = solverMaxDepth;
    }
    /**
     * 
     * @param drawType inputLog(盤面作成ログ)またはsolveLog(解答ログ)
     * @param depth 盤面作成または解答単体での深度
     */
    private initDepth(drawType:uc.DrawType,depth:number):void{
        this.initLinesCanvas(depth,drawType);

        if(drawType === uc.DrawType.inputLog){
            this.initNumsCanvas(depth);
        }
    }

    private initLinesCanvas(depth:number,drawType:uc.DrawType):void{
        let linesCanvasList:HTMLCanvasElement[];
        let linesContextList:CanvasRenderingContext2D[];
        let zIndex:number;
        if(drawType === uc.DrawType.inputLog){
            this.inputDepth = depth;
            linesCanvasList = this.inputLinesCanvasList;
            linesContextList = this.inputLinesContextList;
            zIndex = depth;
        }else{
            linesCanvasList = this.solverLinesCanvasList;
            linesContextList = this.solverLinesContextList;
            zIndex = this.inputDepth + depth + 1;
        }
        //クリア処理
        linesContextList.splice(depth).forEach(ctx=>{
            ctx.clearRect(0,0,this.width,this.height);
        });
        linesCanvasList.splice(depth).forEach(canvas=>{
            canvas.remove();
        });

        //canvas生成
        let linesCanvasTemp:HTMLCanvasElement = document.createElement("canvas");
        let linesContextTemp:CanvasRenderingContext2D =linesCanvasTemp.getContext("2d") as CanvasRenderingContext2D;
        linesCanvasTemp.id=drawType + "linesDepth" + String(depth);
        linesCanvasTemp.style.zIndex=String(zIndex);
        linesCanvasTemp.width = this.width;
        linesCanvasTemp.height = this.height;
        linesContextTemp.strokeStyle = uc.lineColor;
        linesContextTemp.lineWidth = this.lineWidth;
        linesCanvasList.push(linesCanvasTemp);
        linesContextList.push(linesContextTemp);

    }


    private initNumsCanvas(depth:number):void{
        //Canvas初期化
        this.numsContextList.splice(depth).forEach(ctx=>{
            ctx.clearRect(0,0,this.width,this.height);
        });
        this.numsCanvasList.splice(depth).forEach(canvas=>{
            canvas.remove();
        });

        let numsCanvasTemp:HTMLCanvasElement =document.createElement("canvas");
        let numsContextTemp:CanvasRenderingContext2D =numsCanvasTemp.getContext("2d") as CanvasRenderingContext2D;
        numsCanvasTemp.id="numsDepth"+String(depth);
        numsCanvasTemp.style.zIndex=String(depth + this.solverMaxDepth + 1);
        numsCanvasTemp.width = this.width;
        numsCanvasTemp.height = this.height;
        numsContextTemp.strokeStyle=uc.lineColor;
        numsContextTemp.fillStyle=uc.lineColor
        numsContextTemp.font=this.fontSize+ " Meiryo";
        this.numsCanvasList.push(numsCanvasTemp);
        this.numsContextList.push(numsContextTemp);

    }

    public drawInput(depth:number,logs:InputLog[]){
        //TODO URL以外、線引きなどのパターン実装
        let boardAbst:number[][]=[[]];
        logs.forEach(log=>{
            switch(log.getInputCode()){
                case hbc.resultCode.rcI00:
                    boardAbst = cf.decodeUrl(log.getUrl());
                    boardAbst.forEach((row,y)=>{
                        row.forEach((num,x)=>{
                            if(num>=0){
                                this.drawNum(x,y,num,depth);
                            }
                        });
                    });
                    break;
                default:
                    break;
            }
        })
        this.initAndDrawNumPaths(boardAbst);
        

    }

    private initAndDrawNumPaths(boardAbst:number[][]){
        //数字の初期描画
        let centerX:number;
        let centerY:number;
        let id:number = 0;
        this.numPosDict = new Map();
        this.numPathDict = new Map();
        boardAbst.forEach((row,y) =>{
            row.forEach((orgNumber,x)=>{
                if(orgNumber > -1){
                    centerX = (x + 1) * uc.gridSize;
                    centerY = (y + 1) * uc.gridSize;
                    const numPos:number[] = [centerX, centerY, orgNumber];
                    this.numPosDict.set(id, numPos);
        
                    const numPath:Path2D = new Path2D();
                    numPath.arc(centerX, centerY, uc.gridSize/3, 0,Math.PI * 2);
                    numPath.closePath();
                    this.numPathDict.set(id,numPath);
                    id += 1;

                    this.numsContextList[0].fill(numPath);
                    this.numsContextList[0].stroke(numPath);
            
                    if(numPos[2]>0){
                        this.numsContextList[depth].fillText(String(numPos[2]),numPos[0] -uc.gridSize/5, numPos[1] + uc.gridSize/5);
                    }
                }
            });

        });

    }


    public initResultPaths(depth:number,log:ResultLog[]):void{
        let rootNum:Num;
        let rootPos:number[];
        let lineToPos:number[];
        let xPosAdd:number;
        let yPosAdd:number;
        let pathLog:boolean[][]=new Array();//(id,dir)で線を引いたか格納
        for(let i:number = 0; i<this.numPathDict[depth].size; i++){
            pathLog.push([false, false, false, false]);
        }
        //確定段階毎に描画内容を分けて作成
        log.forEach((result,i)=>{
            const rootNumIdList:number[] = result.getTargetNumIdList();
            let rootNumId:number;
            let resultPath:Path2D = new Path2D;
            let resultPathMask:Path2D = new Path2D;
            let masked:boolean = false;
            result.getResult4wayList().forEach((result4way,i)=>{
                rootNumId =rootNumIdList[i];
                rootNum = this.numDict[this.inputDepth][rootNumId];
                rootPos = this.numPosDict[this.inputDepth].get(rootNumId) as number[];
                result4way.forEach((val,dir)=>{
                    if(val>0){
                        //線記入
                        lineToPos =  this.numPosDict.get(rootNum.getSurNumId()[dir]) as number[];
                        let logNumId:number; 
                        let logDir:number;
                        //線の引き方向を右か下にそろえた時の根元と方向
                        if(dir>1){
                            logNumId = rootNumId;
                            logDir = dir;
                        }else{
                            logNumId = rootNum.getSurNumId()[dir];
                            logDir = dir + 2;
                        }
                        
                        //線記入済みチェック
                        if(pathLog[logNumId][logDir] || val===2){
                            //1本目引き済みまたは2本同時引き
                            if(rootPos[0]===lineToPos[0]){
                                resultPath.rect(rootPos[0] - this.lineSpacing/2, Math.min(rootPos[1],lineToPos[1]), this.lineSpacing, Math.abs(rootPos[1] - lineToPos[1]));
                            }else{
                                resultPath.rect(Math.min(rootPos[0],lineToPos[0]), rootPos[1] - this.lineSpacing/2, Math.abs(rootPos[0] - lineToPos[0]), this.lineSpacing);
                            }
    
                            if(val!==2){
                                
                                if(rootPos[0]===lineToPos[0]){
                                    resultPathMask.rect(rootPos[0] - (this.lineSpacing - this.lineWidth)/2, Math.min(rootPos[1],lineToPos[1]), this.lineSpacing -this.lineWidth, Math.abs(rootPos[1] - lineToPos[1]));
                                }else{
                                    resultPathMask.rect(Math.min(rootPos[0],lineToPos[0]), rootPos[1] - (this.lineSpacing - this.lineWidth)/2, Math.abs(rootPos[0] - lineToPos[0]), this.lineSpacing - this.lineWidth);
                                }
        
                                masked=true;
                            }
    
                        }else{
                            //1本目未
                            resultPath.moveTo(rootPos[0], rootPos[1]);
                            resultPath.lineTo(lineToPos[0],lineToPos[1]);
                            pathLog[logNumId][logDir]=true;
                        }
    
    
                    }else if(val<0){
                        //×記入
                        //×の記入地点への数字中心からのずれ
                        xPosAdd =  hbc.dirX[dir] * uc.gridSize/2;
                        yPosAdd =  hbc.dirY[dir] * uc.gridSize/2;
                        //×のサイズ
                        let diff2:number=uc.gridSize/6
                        //左下→右上線
                        resultPath.moveTo(rootPos[0] + xPosAdd - diff2, rootPos[1] + yPosAdd - diff2);
                        resultPath.lineTo(rootPos[0] + xPosAdd + diff2, rootPos[1] + yPosAdd + diff2);
                        //左上→右下線
                        resultPath.moveTo(rootPos[0] + xPosAdd - diff2, rootPos[1] + yPosAdd + diff2);
                        resultPath.lineTo(rootPos[0] + xPosAdd + diff2, rootPos[1] + yPosAdd - diff2);
                    }
                });
            });

            this.resultPathArr.push(resultPath);

            if(masked){
                this.resultMaskMap.set(i,resultPathMask);
                this.linesMaskContext.fill(resultPathMask);
                this.linesContext.stroke(resultPath);
            }else{
                this.linesContext.stroke(resultPath);
            }
        });

    }
    private drawNum(x:number,y:number,orgNumber:number,depth:number):void{
        const centerX = (x + 1) * uc.gridSize;
        const centerY = (y + 1) * uc.gridSize;
        const numPos:number[] = [centerX, centerY, orgNumber];
        this.numPosDict.set(id, numPos);

        const numPath:Path2D = new Path2D();
        numPath.arc(centerX, centerY, uc.gridSize/3, 0,Math.PI * 2);
        numPath.closePath();
        this.numPathDict.set(id,numPath);

        this.numsContextList[0].fill(numPath);
        this.numsContextList[0].stroke(numPath);

        if(numPos[2]>0){
            this.numsContextList[depth].fillText(String(numPos[2]),numPos[0] -uc.gridSize/5, numPos[1] + uc.gridSize/5);

    }

    public drawSteps(depth:number,step:number,drawType:uc.DrawType):void{
        this.clearLines();
        for(let i:number=0; i<=step; i++){
            this.linesContext.stroke(this.resultPathArr[i]);
            if(this.resultMaskMap.has(i)){
                this.linesMaskContext.fill((this.resultMaskMap.get(i) as Path2D));
            }
        }
        this.targetContext.stroke(this.resultPathArr[step]);
        if(this.resultMaskMap.has(step)){
            this.targetMaskContext.fill((this.resultMaskMap.get(step) as Path2D));
        }
        let checkNumIdList:number[] = this.resultLogArr[step].getCheckedNumIdList().concat();
        let targetNumIdList:number[] = this.resultLogArr[step].getTargetNumIdList().concat();
        //手筋実行対象がチェック対象リストに含まれる場合に描画対象から外す
        targetNumIdList.forEach(id=>{
            let targetIndexInCheckList:number = checkNumIdList.indexOf(id);
            if(targetIndexInCheckList >= 0){
                checkNumIdList.splice(targetIndexInCheckList,1);
            }
        });

        this.numsMaskContext.fillStyle = uc.checkFillColor;
        checkNumIdList.forEach((checkNumId)=>{
            this.numsMaskContext.fill(this.numPathDict.get(checkNumId) as Path2D);
        });
        
        this.numsMaskContext.fillStyle = uc.tgtFillColor;
        targetNumIdList.forEach((targetNumId)=>{
            this.numsMaskContext.fill(this.numPathDict.get(targetNumId) as Path2D);
        });

        if(this.resultMaskMap.has(step)){
            this.linesMaskContext.fill((this.resultMaskMap.get(step) as Path2D));
        }
    }

    public clearAll():void{
        this.numsBgContext.clearRect(0,0,this.width,this.height);
        this.numsCharContext.clearRect(0,0,this.width,this.height);
        this.numsMaskContext.clearRect(0,0,this.width,this.height);
        this.linesContext.clearRect(0,0,this.width,this.height);
        this.linesMaskContext.clearRect(0,0,this.width,this.height);
        this.targetContext.clearRect(0,0,this.width,this.height);
        this.targetMaskContext.clearRect(0,0,this.width,this.height);
    }

    public clearLines():void{
        this.linesContext.clearRect(0,0,this.width,this.height);
        this.linesMaskContext.clearRect(0,0,this.width,this.height);
        this.targetContext.clearRect(0,0,this.width,this.height);
        this.targetMaskContext.clearRect(0,0,this.width,this.height);
        this.numsMaskContext.clearRect(0,0,this.width,this.height);
    }

}