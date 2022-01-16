export class resultLog{
    private numIdCheck:number;
    private numIdTarget:number;
    private result:number[]
    private resultCode:string;

    constructor(numIdCheck:number,numIdTarget:number,result:number[],resultCode:string){
        this.numIdCheck = numIdCheck;
        this.numIdTarget =numIdTarget;
        this.result = result;
        this.resultCode = resultCode;
    }

    public getNumIdCheck(){
        return this.numIdCheck;
    }

    
    public getNumIdTarget(){
        return this.numIdTarget;
    }

    
    public getResult(){
        return this.result;
    }

    
    public getResultCode(){
        return this.resultCode;
    }
}