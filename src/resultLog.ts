export class ResultLog{
    private numIdCheck:number;
    private numIdTarget:number;
    private result:number[]
    private resultCode:string;
    public static defaultResultArr:number[][][] = [[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],[[-1,0,0,0],[0,-1,0,0],[0,0,-1,0],[0,0,0,-1]]];
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

    public consoleLog(){
        console.log("id= " + this.numIdTarget +" 4way= [" + this.result +"] resultCode= " +this.resultCode);
    }
}