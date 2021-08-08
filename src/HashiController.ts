import { HashiBoard } from "./HashiBoard";
import { ResultPatterns } from "./hashiConstants";
export class HashiController{
    private hashiBoard:HashiBoard;
    constructor(url:string){
        this.hashiBoard = new HashiBoard(url);
    }

    public duplicate():void{
        const startTime = new Date().getTime();
        //this.hashiBoard =JSON.parse(JSON.stringify(this.hashiBoard)) as HashiBoard;
        const endTime = new Date().getTime();
        console.log("duplicated: " + (endTime -startTime) + " ms");
    }

    public solve(depth:number):void{
        console.log("start");
        const startTime = new Date().getTime();
        let result = this.hashiBoard.solve(depth);
        const endTime = new Date().getTime();
        console.log("finished: " + (endTime -startTime) + " ms");
        this.output();
        console.log(ResultPatterns.resultDict.get(result));
            
    }

    private output():void{
        let result = this.hashiBoard.getBoardNum();
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
}