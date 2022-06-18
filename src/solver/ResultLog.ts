export class ResultLog{
    private numIdCheck:number;
    private numIdTarget:number;
    private result4way:number[]
    private resultCode:string;
    constructor(numIdCheck:number,numIdTarget:number,result4way:number[],resultCode:string){
        this.numIdCheck = numIdCheck;
        this.numIdTarget =numIdTarget;
        this.result4way = result4way;
        this.resultCode = resultCode;
    }

    public getNumIdCheck(){
        return this.numIdCheck;
    }

    
    public getNumIdTarget(){
        return this.numIdTarget;
    }

    
    public getResult4way(){
        return this.result4way;
    }

    
    public getResultCode(){
        return this.resultCode;
    }

    public consoleLog(){
        console.log("id= " + this.numIdTarget +" 4way= [" + this.result4way +"] resultCode= " +this.resultCode);
    }
}