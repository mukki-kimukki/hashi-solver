class Island{
    private islandId:number;
    private numList:Map<number,Num>;   //島に属する全ての数字のIDリスト
    private activeNumList:Map<number,Num>;  //残りが0でない数字のリスト
    constructor(id:number,num:Num){
        this.islandId = id;
        this.numList = new Map<number,Num>();
        this.numList.set(id,num);
        this.activeNumList = new Map<number,Num>();
        this.activeNumList.set(id,num);
    }

    public mergeIsland(fromIsland:Island):void{
        this.numList.forEach((num) => num.setParentIslandId(this.islandId));
        Object.assign(this.numList,fromIsland.getNumList());
        Object.assign(this.activeNumList,fromIsland.getActiveNumList);
    }

    public getNumList(){
        return this.numList;
    }
    
    public getActiveNumList(){
        return this.activeNumList;
    }

    public inactivateNum(deleteId:number):void{
        this.activeNumList.delete(deleteId);
    }
}