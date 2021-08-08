
//盤面の数字配置や島の情報を保持する
import {Empty} from "./Empty";
import {Island} from "./Island";
import {Num} from "./Num";


export class HashiBoard {

	private height: number;
	private width: number;
	private boardAbst: number[][];	//数字配置
	private numIdMap: number[][];	//数字配置マスのid
	private boardNum: Num[][];		//詳細情報を持つ数字配置
	private boardEmpty: Empty[][];	//空白マス
	private numDict:Map<number,Num> = new Map<number,Num>();	//数字idと数字詳細を対応させる辞書
	private islands:Map<number,Island> = new Map<number,Island>();	//島と島に含まれる数字を対応させる辞書
	private numsToCheckStack: number[] = new Array();	//手筋チェック対象idのスタック

	constructor(height:number,width:number)
	constructor(url:string)
	
	constructor(param1:any,param2?:number){
		if (param2 === undefined){
			//if url is given
			let urlSplit:string[] = param1.split("/");
			this.height = parseInt(urlSplit[urlSplit.length - 2],10);
			this.width = parseInt(urlSplit[urlSplit.length - 3]);
			this.boardAbst = new Array(this.height);
			this.numIdMap = new Array(this.height);
			
			for(let y:number = 0;y <this.height;y++){
				this.boardAbst[y] = new Array(this.width);
				this.numIdMap[y] = new Array(this.width);
				for(let x:number = 0; x<this.width; x++){
					this.boardAbst[y][x] = 0;
					this.numIdMap[y][x] = 0;
				}
			}
			let coded: string = urlSplit[urlSplit.length - 1];
			let pos:number = 0;		//current position in the board
			let charNum:number		//number(16) in url
			let id:number = 1		//id of numbers in board
			let interval:number
			for(let i = 0; i < coded.length; i++ ) {
				charNum =  parseInt(coded.charAt(i),36);
				interval = charNum - 15;
				if (interval > 0) {
					pos += interval;
				}else {
					this.boardAbst[Math.floor(pos/this.width)][pos%this.width] = charNum;
					this.numIdMap[Math.floor(pos/this.width)][pos%this.width] = id;

					id ++;
					pos++;
				}
			}
			id = 1;
			this.boardNum = new Array(this.height);
			this.boardEmpty = new Array(this.height);
			for(let y:number = 0; y < this.height; y++){
				this.boardNum[y] = new Array(this.width);
				this.boardEmpty[y] = new Array(this.width);
				for(let x = 0; x < this.width; x++){
					if(this.boardAbst[y][x] > 0){
						this.boardNum[y][x] = new Num(y,x,this.boardAbst,this.numIdMap,id);
						this.numDict.set(id,this.boardNum[y][x]);
						this.islands.set(id,new Island(id,this.boardNum[y][x]))
						this.numsToCheckStack.push(id);
						id += 1;
					}else{
						this.boardEmpty[y][x] = new Empty(y,x,this.numIdMap)
					}
				}
			}
		}else{
			//if board size is given
			this.height = param1;
			this.width = param2;
			this.boardAbst = new Array(this.height);
			this.boardNum = new Array(this.height);
			this.boardEmpty = new Array(this.height);
			this.numIdMap = new Array(this.height);
			for(let i:number = 0;i <this.height;i++){
				this.boardAbst[i] = new	Array(this.width);
				this.boardNum[i] = new	Array(this.width);
				this.boardEmpty[i] = new Array(this.width);
				this.numIdMap = new Array(this.width);
			}
		}
	}

	public getHeight():number{
		return this.height;
	}

	public getWidth():number{
		return this.width;
	}

	public getBoardNum():Num[][]{
		return this.boardNum;
	}

	public getBoardAbst():number[][]{
		return this.boardAbst;
	}

	public solve(depth:number):string{
		let result = this.logicSolve();
		if(depth>0){
			result = this.checkResult();
		}
		return result;

	}
	
	private logicSolve():string{
		//手筋領域
		let numId:number|undefined = this.numsToCheckStack.pop();
		let fromNum:Num;
		let logicResult:[[number[],string],number];
		let islandCheckResult:boolean;
		do{
			while(typeof numId === 'number'){
				fromNum = this.numDict.get(numId) as Num
				logicResult = fromNum.checkLogics(true);
				//console.log(fromNum.getAddress());
				//console.log(logicResult[0]);
				switch(logicResult[0][1].charAt(0)){
					case "9":	//破綻またはエラー
						return logicResult[0][1]
					case "0":	//変化なし
						break;
					default:	//手筋実行あり
						logicResult[0][0].forEach((hon,dir) => this.drawLine(fromNum,logicResult[1],hon,dir));
						//残り本数が0の場合は島に伝える
						if(logicResult[1] == 0){
							(this.islands.get(fromNum.getParentIslandId()) as Island).inactivateNum(numId);
						}
						break;
				}
				numId = this.numsToCheckStack.pop();
			}
			//島手筋が全てチェックし終わるまでループ
			islandCheckResult = this.checkEndIslands()
			numId = this.numsToCheckStack.pop();
		}while(islandCheckResult)
		return this.checkResult();
	}

	private checkResult():string{
		if(this.islands.size != 1){
			return "092"
		}else{
			if(Array.from(this.islands.values())[0].getActiveNumList().size != 0){
				return "091"
			}
		}
		return "010";
	}

	private drawLine(fromNum:Num,fromRemain:number,hon:number,dir:number){
		let nextTarget:Num|undefined;
		let toNum:Num;

		let toRemain:number;
		if(hon > 0){	//線引き
			toNum = this.numDict.get(fromNum.getSurNumId()[dir]) as Num;	//線引きなのでundefinedにはならない
			//空白引き
			let fromAddress = fromNum.getAddress();
			let pos:number;
			switch(dir){
				case 0:
					pos = -1;	//左
					while(this.boardAbst[fromAddress[0]][fromAddress[1] + pos] == 0){
						this.boardEmpty[fromAddress[0]][fromAddress[1] + pos].getVerNumId().forEach((id,i) =>{
							if(id > 0){
								nextTarget = this.numDict.get(id) as Num;
								if(nextTarget.getRemainSelf() >0){
									if(nextTarget.setRemain1way(3 - 2 * i,0)){ 	//id>0で存在判定可能 上→下の順にidがくるので、0にするのは下→上の順
										this.numsToCheckStack.push(id);
									};
								}
							}
						});
						pos--;
					}
					break;
				case 1:
					pos = -1;	//上
					while(this.boardAbst[fromAddress[0] + pos][fromAddress[1]] == 0){
						this.boardEmpty[fromAddress[0] + pos][fromAddress[1]].getHorNumId().forEach((id,i) =>{
							if(id > 0){
								nextTarget = this.numDict.get(id) as Num;
								if(nextTarget.getRemainSelf() >0){
									if(nextTarget.setRemain1way(2 - 2 * i,0)){	//id>0で存在判定可能 左→右の順にidがくるので、0にするのは右→左の順
										this.numsToCheckStack.push(id);
									};
								}
							}
						});
						pos--;
					}
					break;
				case 2:
					pos = 1;		//右
					while(this.boardAbst[fromAddress[0]][fromAddress[1] + pos] == 0){
						this.boardEmpty[fromAddress[0]][fromAddress[1] + pos].getVerNumId().forEach((id,i) =>{
							if(id > 0){
								nextTarget = this.numDict.get(id) as Num;
								if(nextTarget.getRemainSelf() >0){
									if(nextTarget.setRemain1way(3 - 2 * i,0)){	//id>0で存在判定可能 上→下の順にidがくるので、0にするのは下→上の順
										this.numsToCheckStack.push(id);
									};
								}
							}
						});
						pos++;
					}
					break;
				case 3:
					pos = 1;	//下
					while(this.boardAbst[fromAddress[0] + pos][fromAddress[1]] == 0){
						this.boardEmpty[fromAddress[0] + pos][fromAddress[1]].getHorNumId().forEach((id,i) =>{
							if(id > 0){
								nextTarget = this.numDict.get(id) as Num;
								if(nextTarget.getRemainSelf() >0){
									if(nextTarget.setRemain1way(2 - 2 * i,0)){	//id>0で存在判定可能 左→右の順にidがくるので、0にするのは右→左の順
										this.numsToCheckStack.push(id);
									};
								}
							}
						});
						pos++;
					}
					break;
			}
			//数字引き
			toRemain = toNum.drawIn((dir+2)%4,hon);
			if(fromRemain == 0){
				if(toNum.setRemain1way((dir+2)%4,0)){
					this.numsToCheckStack.push(toNum.getId());
				};
			}
			if(toRemain < 2){
				toNum.getSurNumId().forEach((id,nextDir) => {
					if(id > 0){
						nextTarget = this.numDict.get(id) as Num;
						if(nextTarget.getRemainSelf() > 0){
							if(nextTarget.setRemain1way((nextDir+2)%4,toRemain)){
								this.numsToCheckStack.push(id);
							};
						}
					}
				});
				//引き先が0になった場合非活性化する
				if(toRemain == 0){
					(this.islands.get(toNum.getParentIslandId()) as Island).inactivateNum(toNum.getId());
				}
			}

			//島のマージ
			let fromParentId = fromNum.getParentIslandId();
			let toParentId = toNum.getParentIslandId();
			//引き元と引き先の島Idが異なる場合は島をマージする
			if(fromParentId != toParentId){
				this.mergeIslands(fromParentId,toParentId)
			};
		}else if(fromRemain < 2){	//残り引き本数減:0本方向に通知して手筋チェック対象に加える
			nextTarget = this.numDict.get(fromNum.getSurNumId()[dir]);
			if(nextTarget != undefined){
				if(nextTarget.getRemainSelf() > 0){
					if(nextTarget.setRemain1way((dir+2)%4,fromRemain)){
						this.numsToCheckStack.push(nextTarget.getId());
					};
				}
			}
		}
	}

	private mergeIslands(fromId:number,toId:number):void{
		(this.islands.get(fromId) as Island).mergeIsland(this.islands.get(toId) as Island);
		this.islands.delete(toId);
	}

	private checkEndIslands():boolean{
		let resultFlg:boolean =false;
		this.islands.forEach((isl) => {
			//島ごとに出口が一つだけになっているか調べる
			switch(isl.getActiveNumList().size){
				case 1:
					if(isl.getNumList().size > 1 && !isl.getIsIslandEndChecked()){
						//出口が一つの島なら行き止まりを設定できる可能性がある。
						isl.setIsIslandEndChecked(true);
						isl.getActiveNumList().forEach((num) => {
							let remainSelf:number = num.getRemainSelf();
							num.setEnd();
							this.numsToCheckStack.push(num.getId());
							resultFlg = true;
							num.getSurNumId().forEach((surNumId,dir) => {
								//数字IDが0より大きく（存在する）出口数字が2以下の場合に行き止まりを設定できるかチェックする
								let tempResult:boolean;
								if(surNumId > 0 && remainSelf <= 2){
									tempResult =(this.numDict.get(surNumId) as Num).setIsEndSurTrue((dir+2)%4,remainSelf);
									if(tempResult){
										this.numsToCheckStack.push(surNumId);
									}
								}
							})
						})
						
					}
					break;
				case 2:
					//出口の数字が二つでその数字が隣接している場合、残り本数が同じで2本以下なら確定が発生する。
					let nums = Array.from(isl.getActiveNumList().values());
					let remainSelf0 = nums[0].getRemainSelf();
					if(remainSelf0 <= 2 && remainSelf0 == nums[1].getRemainSelf()){
						nums[0].getSurNumId().forEach((id,dir) =>{
							if(id == nums[1].getId() && nums[0].getRemain4way()[dir] == nums[0].getRemain4way()[(dir+2)%4]){
								nums[0].setRemain1way(dir,0);
								this.numsToCheckStack.push(nums[0].getId());
								resultFlg = true;
							}
						});
					}
					break;
			}

		})
		return resultFlg;
	}
	
}


