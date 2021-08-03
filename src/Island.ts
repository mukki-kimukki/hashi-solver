import { Num } from "./Num";

export class Island{
    private islandId:number;
    private numList:Map<number,Num>;   //島に属する全ての数字のIDリスト
    private activeNumList:Map<number,Num>;  //残りが0でない数字のリスト
	private isIslandEndChecked:boolean = false;	//手筋チェック済フラグ：無駄な検証をスキップ
    constructor(id:number,num:Num){
        this.islandId = id;
        this.numList = new Map<number,Num>();
        this.numList.set(id,num);
        this.activeNumList = new Map<number,Num>();
        this.activeNumList.set(id,num);
    }
    /**
     * mergeTargetをこの島にマージする
     * @param mergeTarget マージする島
     */
    public mergeIsland(mergeTarget:Island):void{
        //マージされる島のNumにマージ先の島Idをセットする
        mergeTarget.getNumList().forEach((num) => num.setParentIslandId(this.islandId));
        //リストのマージ
        this.numList = new Map([...this.numList.entries(),...mergeTarget.getNumList().entries()]);
        this.activeNumList = new Map([...this.activeNumList.entries(),...mergeTarget.getActiveNumList().entries()]);
        this.isIslandEndChecked =false;
    }

    public getNumList():Map<number,Num>{
        return this.numList;
    }
    
    public getActiveNumList():Map<number,Num>{
        return this.activeNumList;
    }

    /**
     * 残り0本になった数字のidを数字の所属する島に伝える
     * @param deleteId 残り0本となった数字のid
     */
    public inactivateNum(deleteId:number):void{
        this.activeNumList.delete(deleteId);
        this.isIslandEndChecked =false;
    }

    public getIsIslandEndChecked():boolean{
        return this.isIslandEndChecked;
    }

    public setIsIslandEndChecked(flg:boolean):void{
        this.isIslandEndChecked = flg;
    }
}