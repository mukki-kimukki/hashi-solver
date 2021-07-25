class HashiController{
    private hashiBoard:HashiBoard;
    private isLands = new Map();
    constructor(url:string){
        this.hashiBoard = new HashiBoard(url);
    }

    public solve(depth:number):void{
        
        let result = this.hashiBoard.solve(depth);
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
        console.log(describe.join('\n') + '\n\n');
    }
}