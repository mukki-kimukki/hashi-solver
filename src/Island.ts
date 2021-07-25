class Island{
    private numList:Map<number,Num>;   //島に属する全ての数字のIDリスト
    private activeNumList:Map<number,Num>;
    constructor(id:number,num:Num){
        this.numList = new Map<number,Num>();
        this.numList.set(id,num);
        this.activeNumList = new Map<number,Num>();
        this.activeNumList.set(id,num);
    }

    public mergeIsland(island:Island):void{
        Object.assign(this.numList,island.getNumList());
        Object.assign(this.activeNumList,island.getActiveNumList);
    }

    public getNumList(){
        return this.numList;
    }
    
    public getActiveNumList(){
        return this.activeNumList;
    }
}