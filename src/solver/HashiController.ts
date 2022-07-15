import { HashiBoard } from "./HashiBoard";
import { HashiConstants  as hc} from "./HashiConstants";
import { Num } from "./Num";
import { ResultLog } from "./ResultLog";
export class HashiController{
    private hashiBoard:HashiBoard;
    private solveTime:number;

    constructor(url?:string){
        this.solveTime=0;
        if(typeof(url) ==='undefined'){
            this.hashiBoard = new HashiBoard(10,10);
        }else{
            this.hashiBoard = new HashiBoard(url);
        }
    }

    public solve(maxdepth:number):void{
        console.log("start");
        const startTime = new Date().getTime();
        let result = this.hashiBoard.solve(maxdepth);
        const endTime = new Date().getTime();
        this.solveTime = endTime -startTime;
        console.log("finished: " + (this.solveTime) + " ms");
        console.log(result);
        console.log(hc.resultDict.get(result));
        this.hashiBoard.getResultLogArr().forEach(log=>log.consoleLog());
        this.output(0);
            
    }

    private output(depth:number):void{
        let result = this.hashiBoard.getBoardNum(depth);
        let boardAbst = this.hashiBoard.getBoardAbst();
        let describe:string[][] = boardAbst.map((row) => row.map((val) => {
                if(val == 0){
                    return  " ";
                }else{
                    return String(val);
                }
            }));
        let hands4way:number[];
        let pos:number;
        let line:string;
        result.forEach((row,y) => {
            row.forEach((num,x) => {
                if(boardAbst[y][x] != 0){
                    hands4way = num.getHands4way();
                    //横線描画
                    pos = 1;
                    if(hands4way[2] > 0){
                        if(hands4way[2] == 2){
                            line = "=";
                        }else{
                            line = "-";
                        }
                        do{
                            describe[y][x + pos] = line;
                            pos++;
                        }while(boardAbst[y][x + pos] == 0)
                    }
                    //縦線描画
                    pos = 1;
                    if(hands4way[3] > 0){
                        if(hands4way[3] == 2){
                            line = "∥";
                        }else{
                            line = "|";
                        }
                        do{
                            describe[y + pos][x] = line;
                            pos++;
                        }while(boardAbst[y + pos][x] == 0)
                    }
                }
            });
        });
        describe.forEach((row) => console.log(row.join('') + '\n'));
    }

    public getBoardSize():number[]{
        return [this.hashiBoard.getWidth(),this.hashiBoard.getHeight()];
    }

    public getNumDict():Num[][]{
        return this.hashiBoard.getNumDict();
    }

    public getResultLog():ResultLog[]{
        return this.hashiBoard.getResultLogArr();
    }
}