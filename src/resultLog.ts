export class resultLog{
    private numIdCheck:number;
    private numIdDraw:number;
    private result:number[]
    private resultCode:string;

    constructor(numIdCheck:number,numIdDraw:number,result:number[],resultCode:string){
        this.numIdCheck = numIdCheck;
        this.numIdDraw =numIdDraw;
        this.result = result;
        this.resultCode = resultCode;
    }

    public getNumIdCheck(){
        return this.numIdCheck;
    }

    
    public getNumIdDraw(){
        return this.numIdDraw;
    }

    
    public getResult(){
        return this.result;
    }

    
    public getResultCode(){
        return this.resultCode;
    }
}