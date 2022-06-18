import { HashiController } from "../solver/HashiController";
import { Num } from "../solver/Num";
import { ResultLog } from "../solver/ResultLog";

export class CanvasDrawer{
    private numsCanvas:HTMLCanvasElement;
    private numsContext:CanvasRenderingContext2D;
    private linesCanvas:HTMLCanvasElement
    private linesContext:CanvasRenderingContext2D;
    private maskCanvas:HTMLCanvasElement
    private maskContext:CanvasRenderingContext2D;

    private clickX:number[] = [];
    private clickY:number[] = [];
    private clickDrag:boolean[] =[];
    private gridSize:number =30;
    private lineWidth:number =this.gridSize/15;
    private lineSpacing:number =this.gridSize/5 ;
    private fontSize:string = String(this.gridSize) + "px";
    private bgColor:string ="white";
    private lineColor:string="black";
    private tgtColor:string="red";
    
    private boardSize:number[] = [];
    private numDict:Num[][] =[[]];
    private resultLogArr:ResultLog[] = [];
    private numPosDict:Map<number,number[]> = new Map();
    private numPathDict:Map<number,Path2D> = new Map();
    private resultPathArr:Path2D[] = [];//線の描画用
    private resultMaskMap:Map<number,Path2D> = new Map();//2本目を引く際の一本目マスク用

    constructor(){
        
        let numsCanvas = document.getElementById("numbersCanvas") as HTMLCanvasElement;
        let numsContext = numsCanvas.getContext("2d") as CanvasRenderingContext2D;
        numsContext.strokeStyle = this.lineColor;
        numsContext.lineWidth = this.lineWidth;
        
        this.numsCanvas = numsCanvas;
        this.numsContext = numsContext;
        

        let linesCanvas = document.getElementById("linesCanvas") as HTMLCanvasElement;
        let linesContext = linesCanvas.getContext("2d") as CanvasRenderingContext2D;
        linesContext.strokeStyle = this.lineColor;
        linesContext.fillStyle = this.bgColor;
        linesContext.lineWidth = this.lineWidth;

        
        this.linesCanvas = linesCanvas;
        this.linesContext = linesContext;

        
        let maskCanvas = document.getElementById("maskCanvas") as HTMLCanvasElement;
        let maskContext = maskCanvas.getContext("2d") as CanvasRenderingContext2D;

        
        this.maskCanvas = maskCanvas;
        this.maskContext = maskContext;

        
    }

    public drawNums(hashiCntl:HashiController){
        this.boardSize = hashiCntl.getBoardSize();
        this.numDict = hashiCntl.getNumDict();

        let width:number = (this.boardSize[0] + 1)  * this.gridSize;
        let height:number = (this.boardSize[1] + 1) * this.gridSize;

        this.numsCanvas.width = width;
        this.numsCanvas.height = height;
        this.linesCanvas.width = width;
        this.linesCanvas.height = height;
        this.maskCanvas.width = width;
        this.maskCanvas.height = height;


        //数字の初期描画
        this.numsContext.strokeRect(0,0,width,height);
        let centerX:number;
        let centerY:number;
        this.numDict[0].forEach((num) =>{
            centerX = (num.getAddress()[1] + 1) * this.gridSize;
            centerY = (num.getAddress()[0] + 1) * this.gridSize;
            this.numPosDict.set(num.getId(), [centerX, centerY]);

            let numPath:Path2D = new Path2D();
            this.numPathDict.set(num.getId(),numPath);
            numPath.arc(centerX, centerY, this.gridSize/3, 0,Math.PI * 2);
            numPath.closePath();

            //初期描画は背後の線を覆うために円内を塗りつぶす
            this.numsContext.fillStyle="white"
            this.numsContext.fill(numPath);
            this.numsContext.strokeStyle="black"
            this.numsContext.stroke(numPath);

            if(num.getOriginalNumber()>0){
                this.numsContext.fillStyle="black"
                this.numsContext.font=this.fontSize;
                this.numsContext.fillText(String(num.getOriginalNumber()),centerX, centerY, this.gridSize);
            }
        });
    }

    public drawAllResult(hashiCntl:HashiController):void{
        this.resultLogArr = hashiCntl.getResultLog();
        let rootNumId:number;
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
            rootNumId = result.getNumIdTarget();
            rootNum = this.numDict[0][rootNumId];
            rootPos = this.numPosDict.get(rootNumId) as number[];
            let resultPath:Path2D = new Path2D;
            let resultPathMask:Path2D = new Path2D;
            let masked:boolean = false;
            result.getResult4way().forEach((val,dir)=>{
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

            this.resultPathArr.push(resultPath);

            if(masked){
                this.resultMaskMap.set(i,resultPathMask);

                this.maskContext.fillStyle = this.bgColor;
                this.maskContext.fill(resultPathMask);
                
                this.linesContext.strokeStyle = this.lineColor;
                this.linesContext.stroke(resultPath);
            }else{
                this.linesContext.lineWidth = this.lineWidth;
                this.linesContext.strokeStyle = this.lineColor;
                this.linesContext.stroke(resultPath);
            }
        });

    }

    public clearAll():void{
        this.numsContext.clearRect(0,0,this.numsCanvas.width,this.numsCanvas.height);
        this.linesContext.clearRect(0,0,this.linesCanvas.width,this.linesCanvas.height);
        this.maskContext.clearRect(0,0,this.maskCanvas.width,this.maskCanvas.height);
    }

    public clearLines():void{
        this.linesContext.clearRect(0,0,this.linesCanvas.width,this.linesCanvas.height);
        this.maskContext.clearRect(0,0,this.maskCanvas.width,this.maskCanvas.height);
    }
}