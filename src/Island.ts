export class Island{
    private islandId:number;
    private numList:number[][];   //仮置き段階毎の島に属する全ての数字のIDリスト
    private activeNumList:number[][];  //仮置き段階ごとに残りが0でない数字のリスト
	private isIslandEndChecked:boolean[] = [false];	//手筋チェック済フラグ：無駄な検証をスキップ
    constructor(id:number){
        this.islandId = id;
        this.numList = [[id]];
        this.activeNumList = [[id]];
    }
    /**
     * mergeTargetをこの島にマージする
     * @param mergeTarget マージする島
     */
    public mergeIsland(depth:number,mergeTarget:Island):void{
        //リストのマージ
        this.numList[depth] = this.numList[depth].concat(mergeTarget.getNumList(depth));
        this.activeNumList[depth] = this.activeNumList[depth].concat(mergeTarget.getActiveNumList(depth));
        mergeTarget.inactivateMergedIsland(depth);
        this.isIslandEndChecked[depth] =false;
    }

    public getNumList(depth:number):number[]{
        return this.numList[depth];
    }
    
    public getActiveNumList(depth:number):number[]{
        return this.activeNumList[depth];
    }

    public inactivateMergedIsland(depth:number):void{
        this.numList[depth] = [];
        this.activeNumList[depth] = [];
    }

    /**
     * 残り0本になった数字のidを数字の所属する島に伝える
     * @param deleteId 残り0本となった数字のid
     */
    public inactivateNum(depth:number,deleteId:number):void{
        this.activeNumList[depth].splice(this.activeNumList[depth].indexOf(deleteId));
        this.isIslandEndChecked[depth] =false;
    }

    public getIsIslandEndChecked(depth:number):boolean{
        return this.isIslandEndChecked[depth];
    }

    public setIsIslandEndChecked(depth:number,flg:boolean):void{
        this.isIslandEndChecked[depth] = flg;
    }

    public makeNextDepth(depth:number):void{
        this.numList[depth] = this.numList[depth - 1].concat();
        this.activeNumList[depth] = this.activeNumList[depth - 1].concat();
        this.isIslandEndChecked[depth] = this.isIslandEndChecked[depth - 1];
    }

    public deleteTrial(depth:number):void{
        this.numList.splice(depth);
        this.activeNumList.splice(depth);
    }

    public getId():number{
        return this.islandId;
    }
}