import { HashiController } from "../solver/HashiController";
import { Num } from "../solver/Num";
import { ResultLog } from "../solver/ResultLog";

export class CanvasDrawer{
    private numsCanvas:HTMLCanvasElement;
    private numsContext:CanvasRenderingContext2D;
    private numsMaskCanvas:HTMLCanvasElement
    private numsMaskContext:CanvasRenderingContext2D;
    private linesCanvas:HTMLCanvasElement
    private linesContext:CanvasRenderingContext2D;
    private linesMaskCanvas:HTMLCanvasElement
    private linesMaskContext:CanvasRenderingContext2D;

    private clickX:number[] = [];
    private clickY:number[] = [];
    private clickDrag:boolean[] =[];
    private gridSize:number;
    private lineWidth:number;
    private lineSpacing:number;
    private fontSize:string;
    private bgColor:string ="white";
    private lineColor:string="black";
    private tgtColor:string="red";
    private tgtFillColor:string="red";
    private checkColor:string="rgb(30,200,200)";
    private checkFillColor:string="rgb(30,200,200)";
    
    private boardSize:number[] = [];
    private numDict:Num[][] =[[]];
    private resultLogArr:ResultLog[] = [];
    private numPosDict:Map<number,number[]> = new Map();
    private numPathDict:Map<number,Path2D> = new Map();
    private resultPathArr:Path2D[] = [];//線の描画用
    private resultMaskMap:Map<number,Path2D> = new Map();//2本目を引く際の一本目マスク用

    constructor(gridSize:number){
        this.gridSize = gridSize;
        this.lineWidth =this.gridSize/15;
        this.lineSpacing = this.gridSize/5;
        this.fontSize = String(this.gridSize*3/5) + "px";

        this.numsCanvas = document.getElementById("numsCanvas") as HTMLCanvasElement;
        this.numsContext = this.numsCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.numsContext.strokeStyle = this.lineColor;
        this.numsContext.lineWidth = this.lineWidth;
        

        this.linesCanvas = document.getElementById("linesCanvas") as HTMLCanvasElement;
        this.linesContext = this.linesCanvas.getContext("2d") as CanvasRenderingContext2D;
        this.linesContext.strokeStyle = this.lineColor;
        this.linesContext.fillStyle = this.bgColor;
        this.linesContext.lineWidth = this.lineWidth;

        
        this.linesMaskCanvas = document.getElementById("linesMaskCanvas") as HTMLCanvasElement;
        this.linesMaskContext = this.linesMaskCanvas.getContext("2d") as CanvasRenderingContext2D;

        
        this.numsMaskCanvas = document.getElementById("numsMaskCanvas") as HTMLCanvasElement;
        this.numsMaskContext = this.numsMaskCanvas.getContext("2d") as CanvasRenderingContext2D;


        
    }

    public drawNums(hashiCntl:HashiController){
        this.boardSize = hashiCntl.getBoardSize();
        this.numDict = hashiCntl.getNumDict();

        let width:number = (this.boardSize[0] + 1)  * this.gridSize;
        let height:number = (this.boardSize[1] + 1) * this.gridSize;

        this.numsCanvas.width = width;
        this.numsCanvas.height = height;
        this.numsMaskCanvas.width = width;
        this.numsMaskCanvas.height = height;
        this.linesCanvas.width = width;
        this.linesCanvas.height = height;
        this.linesMaskCanvas.width = width;
        this.linesMaskCanvas.height = height;


        //数字の初期描画
        this.numsContext.strokeRect(0,0,width,height);
        let centerX:number;
        let centerY:number;
        this.numDict[0].forEach((num) =>{
            centerX = (num.getAddress()[1] + 1) * this.gridSize;
            centerY = (num.getAddress()[0] + 1) * this.gridSize;
            this.numPosDict.set(num.getId(), [centerX, centerY]);

            let numPath:Path2D = new Path2D();
            numPath.arc(centerX, centerY, this.gridSize/3, 0,Math.PI * 2);
            numPath.closePath();
            this.numPathDict.set(num.getId(),numPath);

            //初期描画は背後の線を覆うために円内を塗りつぶす
            this.numsContext.fillStyle="white"
            this.numsContext.fill(numPath);
            this.numsContext.strokeStyle="black"
            this.numsContext.stroke(numPath);

            if(num.getOriginalNumber()>0){
                this.numsContext.fillStyle="black"
                this.numsContext.font=this.fontSize+ " Meiryo";
                this.numsContext.fillText(String(num.getOriginalNumber()),centerX -this.gridSize/5, centerY + this.gridSize/5);
            }
        });
    }

    public drawAllResult(hashiCntl:HashiController):void{
        this.resultLogArr = hashiCntl.getResultLog();
        let rootNumIdList:number[];
        let rootNum:Num;
        let rootPos:number[];
        let lineToPos:number[];
        let xPosAdd:number;
        let yPosAdd:number;
        let pathLog:boolean[][]=new Array();//(id,dir)で線を引いたか格納
        for(let i:number = 0; i<this.numDict[0].length; i++){
            pathLog.push([false, false, false, false]);
        }
        //確定段階毎に描画内容を分けて作成
        this.resultLogArr.forEach((result,i)=>{
            const rootNumIdList:number[] = result.getTargetNumIdList();
            let rootNumId:number;
            let resultPath:Path2D = new Path2D;
            let resultPathMask:Path2D = new Path2D;
            let masked:boolean = false;
            result.getResult4wayList().forEach((result4way,i)=>{
                rootNumId =rootNumIdList[i];
                rootNum = this.numDict[0][rootNumId];
                rootPos = this.numPosDict.get(rootNumId) as number[];
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
                        let diff:number = this.gridSize/2;
                        switch(dir){
                            case 0:
                                xPosAdd = -diff;
                                yPosAdd = 0;
                                break;
                            case 1:
                                xPosAdd = 0;
                                yPosAdd = -diff;
                                break;
                            case 2:
                                xPosAdd = diff;
                                yPosAdd = 0;
                                break;
                            case 3:
                                xPosAdd = 0;
                                yPosAdd = diff;
                                break;
                            default:
                                //発生しない
                                break;
                        }
                        //×のサイズ
                        let diff2:number=this.gridSize/6
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

                this.linesMaskContext.fillStyle = this.bgColor;
                this.linesMaskContext.fill(resultPathMask);
                
                this.linesContext.strokeStyle = this.lineColor;
                this.linesContext.stroke(resultPath);
            }else{
                this.linesContext.lineWidth = this.lineWidth;
                this.linesContext.strokeStyle = this.lineColor;
                this.linesContext.stroke(resultPath);
            }
        });

    }

    public drawSteps(step:number):void{
        this.clearLines();
        this.linesContext.lineWidth = this.lineWidth;
        this.linesContext.strokeStyle = this.lineColor;
        this.linesMaskContext.fillStyle = this.bgColor;
        for(let i:number=0; i<step; i++){
            this.linesContext.stroke(this.resultPathArr[i]);
            if(this.resultMaskMap.has(i)){
                this.linesMaskContext.fill((this.resultMaskMap.get(i) as Path2D));
            }
        }
        this.linesContext.strokeStyle = this.tgtColor;
        this.linesContext.stroke(this.resultPathArr[step]);
        let checkNumIdList:number[] = this.resultLogArr[step].getCheckedNumIdList().concat();
        let targetNumIdList:number[] = this.resultLogArr[step].getTargetNumIdList().concat();
        //ターゲットがチェックリストに含まれる場合、チェックリストの描画対象からターゲットを外す
        targetNumIdList.forEach(id=>{
            let targetIndexInCheckList:number = checkNumIdList.indexOf(id);
            if(targetIndexInCheckList >= 0){
                checkNumIdList.splice(targetIndexInCheckList,1);
            }
        });
        this.numsMaskContext.globalAlpha=0.2;

        this.numsMaskContext.fillStyle = this.checkFillColor;
        checkNumIdList.forEach((checkNumId)=>{
            this.numsMaskContext.fill(this.numPathDict.get(checkNumId) as Path2D);
        });
        
        this.numsMaskContext.fillStyle = this.tgtFillColor;
        targetNumIdList.forEach((targetNumId)=>{
            this.numsMaskContext.fill(this.numPathDict.get(targetNumId) as Path2D);
        });

        this.numsMaskContext.globalAlpha=1;
        if(this.resultMaskMap.has(step)){
            this.linesMaskContext.fillStyle = this.bgColor;
            this.linesMaskContext.fill((this.resultMaskMap.get(step) as Path2D));
        }
    }

    public clearAll():void{
        this.numsContext.clearRect(0,0,this.numsCanvas.width,this.numsCanvas.height);
        this.numsMaskContext.clearRect(0,0,this.numsMaskCanvas.width,this.numsMaskCanvas.height);
        this.linesContext.clearRect(0,0,this.linesCanvas.width,this.linesCanvas.height);
        this.linesMaskContext.clearRect(0,0,this.linesMaskCanvas.width,this.linesMaskCanvas.height);
    }

    public clearLines():void{
        this.linesContext.clearRect(0,0,this.linesCanvas.width,this.linesCanvas.height);
        this.linesMaskContext.clearRect(0,0,this.linesMaskCanvas.width,this.linesMaskCanvas.height);
        this.numsMaskContext.clearRect(0,0,this.numsMaskCanvas.width,this.numsMaskCanvas.height);
    }
}