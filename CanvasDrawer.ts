import { HashiController } from "./solver/HashiController";
import { Num } from "./solver/Num";
import { ResultLog } from "./solver/ResultLog";

export class CanvasDrawer{
    private numsCanvas:HTMLCanvasElement;
    private numsContext:CanvasRenderingContext2D;
    private linesCanvas:HTMLCanvasElement
    private linesContext:CanvasRenderingContext2D;

    private clickX:number[] = [];
    private clickY:number[] = [];
    private clickDrag:boolean[] =[];
    private gridSize:number =60;

    
    private boardSize:number[] = [];
    private numDict:Num[][] =[[]];
    private resultLogArr:ResultLog[] = [];
    private numPosDict:Map<number,number[]> = new Map();
    private numPathDict:Map<number,Path2D> = new Map();
    private resultPathArr:Path2D[] = [];

    constructor(){
        
        let numsCanvas = document.getElementById("numbers") as HTMLCanvasElement;
        let numsContext = numsCanvas.getContext("2d") as CanvasRenderingContext2D;
        numsContext.strokeStyle = "black";
        numsContext.lineWidth = 1;
        
        this.numsCanvas = numsCanvas;
        this.numsContext = numsContext;
        

        let linesCanvas = document.getElementById("linesCanvas") as HTMLCanvasElement;
        let linesContext = linesCanvas.getContext("2d") as CanvasRenderingContext2D;
        linesContext.strokeStyle = "black";
        linesContext.lineWidth = 1;

        
        this.linesCanvas = linesCanvas;
        this.linesContext = linesContext;

        
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


        //数字の初期描画
        this.numsContext.strokeRect(0,0,width,height);
        let centerX:number;
        let centerY:number;
        this.numDict[0].forEach((num) =>{
            centerX = (num.getAddress()[0] + 1) * this.gridSize;
            centerY = (num.getAddress()[1] + 1) * this.gridSize;
            this.numPosDict.set(num.getId(), [centerX, centerY]);

            let numPath:Path2D = new Path2D();
            this.numPathDict.set(num.getId(),numPath);
            numPath.arc(centerX, centerY, 0, this.gridSize/2, Math.PI * 2);

            //初期描画は背後の線を覆うために円内を塗りつぶす
            this.numsContext.fillStyle="white"
            this.numsContext.fill(numPath);
            this.numsContext.stroke(numPath);

            if(num.getOriginalNumber()>0){
                this.numsContext.fillStyle="black"
                this.numsContext.fillText(String(num.getOriginalNumber()),centerX,centerY,this.gridSize);
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
        //確定段階毎に描画内容を分けて作成
        this.resultLogArr.forEach((result,i)=>{
            rootNumId = result.getNumIdTarget();
            rootNum = this.numDict[0][rootNumId];
            rootPos = this.numPosDict.get(rootNumId) as number[];
            let resultPath:Path2D = new Path2D;

            result.getResult4way().forEach((val,dir)=>{
                if(val>0){
                    //線記入
                    resultPath.moveTo(rootPos[0], rootPos[1]);
                    lineToPos =  this.numPosDict.get(rootNum.getSurNumId()[dir]) as number[];
                    resultPath.lineTo(lineToPos[0],lineToPos[1]);
                    
                }else if(val<0){
                    //×記入
                    //×の記入地点への数字中心からのずれ
                    switch(dir){
                        case 0:
                            xPosAdd = -this.gridSize/2;
                            yPosAdd = 0
                            break;
                        case 1:
                            xPosAdd = 0;
                            yPosAdd = -this.gridSize/2
                            break;
                        case 2:
                            xPosAdd = this.gridSize/2;
                            yPosAdd = 0
                            break;
                        case 3:
                            xPosAdd = 0;
                            yPosAdd = this.gridSize/2
                            break;
                        default:
                            //発生しない
                            break;
                    }
                    //左下→右上線
                    resultPath.moveTo(rootPos[0] + xPosAdd - this.gridSize/10, rootPos[1] + yPosAdd - this.gridSize/10);
                    resultPath.lineTo(rootPos[0] + xPosAdd + this.gridSize/10, rootPos[1] + yPosAdd + this.gridSize/10);
                    //左上→右下線
                    resultPath.moveTo(rootPos[0] + xPosAdd - this.gridSize/10, rootPos[1] + yPosAdd + this.gridSize/10);
                    resultPath.lineTo(rootPos[0] + xPosAdd + this.gridSize/10, rootPos[1] + yPosAdd - this.gridSize/10);
                }
            });

            this.resultPathArr.push(resultPath);
            this.linesContext.stroke(resultPath);
        });
    }
}