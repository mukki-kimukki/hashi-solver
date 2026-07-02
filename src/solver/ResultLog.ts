import { N4way } from "../common/Types";

export type BranchOutcome = "contradiction" | "solved" | "continued" | "unknown";

export type BranchLog = {
    readonly label: string;
    readonly assumption: ResultLog | undefined;
    readonly logs: ResultLog[];
    readonly outcome: BranchOutcome;
};

export class ResultLog{
    private readonly numIdCheck:number[];
    private readonly numIdTarget:number[];
    private readonly result4wayList:N4way[]
    private readonly resultCode:string;
    private readonly branches:BranchLog[];

    public static branch(label:string, logs:ResultLog[], outcome:BranchOutcome = "unknown"):BranchLog{
        const copiedLogs = logs.concat();
        return {
            label,
            assumption: copiedLogs[0],
            logs: copiedLogs,
            outcome,
        };
    }

    constructor(numIdCheck:number[],numIdTarget:number[],result4wayList:N4way[],resultCode:string,branches?:BranchLog[]|ResultLog[]){
        this.numIdCheck = numIdCheck;
        this.numIdTarget =numIdTarget;
        this.result4wayList = result4wayList;
        this.resultCode = resultCode;
        this.branches = this.normalizeBranches(branches);
    }

    private normalizeBranches(branches?:BranchLog[]|ResultLog[]):BranchLog[]{
        if(typeof branches === "undefined" || branches.length === 0){
            return [];
        }
        if(branches[0] instanceof ResultLog){
            return [ResultLog.branch("trial", branches as ResultLog[], "unknown")];
        }
        return (branches as BranchLog[]).map((branch) => {
            const copiedLogs = branch.logs.concat();
            return {
                label: branch.label,
                assumption: branch.assumption ?? copiedLogs[0],
                logs: copiedLogs,
                outcome: branch.outcome,
            };
        });
    }

    public getCheckedNumIdList():number[]{
        return this.numIdCheck;
    }

    public getTargetNumIdList():number[]{
        return this.numIdTarget;
    }

    public getResult4wayList():N4way[]{
        return this.result4wayList;
    }

    public getResultCode():string{
        return this.resultCode;
    }

    public getBranches():BranchLog[]{
        return this.branches;
    }

    public hasBranches():boolean{
        return this.branches.length > 0;
    }

    /** @deprecated Use getBranches() for branch-aware UI. */
    public getTryLog():ResultLog[]{
        return this.branches[0]?.logs ?? [];
    }

    public consoleLog():void{
        console.log("id= " + this.numIdTarget +" 4way= [" + this.result4wayList +"] resultCode= " +this.resultCode);
    }

}
