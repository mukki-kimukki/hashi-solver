export class ResultLog{
    private readonly numIdCheck:number[];
    private readonly numIdTarget:number[];
    private readonly result4wayList:number[][]
    private readonly resultCode:string;
    private readonly tryLog:ResultLog[];
    constructor(numIdCheck:number[],numIdTarget:number[],result4wayList:number[][],resultCode:string,tryLog?:ResultLog[]){
        this.numIdCheck = numIdCheck;
        this.numIdTarget =numIdTarget;
        this.result4wayList = result4wayList;
        this.resultCode = resultCode;
        typeof tryLog !== "undefined"? this.tryLog = tryLog: this.tryLog=[];
    }

    public getCheckedNumIdList(){
        return this.numIdCheck;
    }

    
    public getTargetNumIdList(){
        return this.numIdTarget;
    }

    
    public getResult4wayList(){
        return this.result4wayList;
    }

    
    public getResultCode(){
        return this.resultCode;
    }

    public getTryLog(){
        return this.tryLog;
    }

    public consoleLog(){
        console.log("id= " + this.numIdTarget +" 4way= [" + this.result4wayList +"] resultCode= " +this.resultCode);
    }

}