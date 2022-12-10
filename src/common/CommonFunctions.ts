export namespace CommonFunctions {
    export function decodeUrl(url:string):number[][]{
        let urlSplit:string[] = url.split("/");
        let height:number = parseInt(urlSplit[urlSplit.length - 2],10);
        let width:number = parseInt(urlSplit[urlSplit.length - 3]);
        let boardAbst:number[][] = new Array(height);
        
        for(let y:number = 0;y <height;y++){
            boardAbst[y] = new Array(width);
            for(let x:number = 0; x<width; x++){
                boardAbst[y][x] = -1;
            }
        }
        let coded: string = urlSplit[urlSplit.length - 1];
        let pos:number = 0;
        let charNum:number;
        let interval:number;
        for(let i = 0; i < coded.length; i++ ) {
            charNum =  parseInt(coded.charAt(i),36);
            interval = charNum - 15;
            if (interval > 0) {
                pos += interval;
            }else {
                boardAbst[Math.floor(pos/width)][pos%width] = charNum;
                pos++;
            }
        }
        return boardAbst;
    }
}