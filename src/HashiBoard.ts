
//盤面の数字配置や島の情報を保持する

 class HashiBoard {

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
				charNum =  parseInt(coded.charAt(i),16);
				interval = charNum - 15;
				if (interval > 0) {
					pos += interval;
				}else {
					this.boardAbst[pos%this.width][pos/this.width] = charNum;
					this.numIdMap[pos%this.width][pos/this.width] = id;
					id ++;
					pos++;
				}
			}
			this.boardNum = new Array(this.height);
			this.boardEmpty = new Array(this.height);
			for(let y:number = 0; y < this.height; y++){
				this.boardNum[y] = new Array(this.width);
				this.boardEmpty[y] = new Array(this.width);
				for(let x = 0; x < this.width; x++){
					if(this.boardAbst[y][x] > 0){
						this.boardNum[y][x] = new Num(y,x,this.boardAbst,this.numIdMap,id);
						this.boardEmpty[y][x] = new Empty(y,x,this.numIdMap)
						this.numDict.set(id,this.boardNum[y][x]);
						this.islands.set(id,new Island(id,this.boardNum[y][x]))
						this.numsToCheckStack.push(id);
						id += 1;
					}else{
						this.numIdMap[y][x] = -1;
					}
				}
			}

			console.log(this.boardAbst)
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
		while(typeof numId === 'number'){
			fromNum = this.numDict.get(numId) as Num
			logicResult = (fromNum).checkLogics(true);
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
		return this.checkResult();
	}

	private checkResult():string{
		if(this.islands.size != 1){
			return "902"
		}else{
			let remainFlg:boolean = true;
			this.islands.forEach((island) => remainFlg = island.getActiveNumList().size == 0);	//ここに到達する場合はforeach対象の島が一つしかない
			if(remainFlg){
				return "901"
			}
		}
		return "001";
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
						this.boardEmpty[fromAddress[0]][fromAddress[1] + pos].getHorNumId().forEach((id,i) =>{
							if(id > 0){
								(this.numDict.get(id) as Num).setRemain1way(3 - 2 * i,0);	//id>0で存在判定可能 上→下の順にidがくるので、0にするのは下→上の順
								this.numsToCheckStack.push(id);
							}
						});
						pos--;
					}
					break;
				case 1:
					pos = -1;	//上
					while(this.boardAbst[fromAddress[0] + pos][fromAddress[1]] == 0){
						this.boardEmpty[fromAddress[0] + pos][fromAddress[1]].getVerNumId().forEach((id,i) =>{
							if(id > 0){
								(this.numDict.get(id) as Num).setRemain1way(2 - 2 * i,0);	//id>0で存在判定可能 左→右の順にidがくるので、0にするのは右→左の順
								this.numsToCheckStack.push(id);
							}
						});
						pos--;
					}
					break;
				case 2:
					pos = 1;		//右
					while(this.boardAbst[fromAddress[0]][fromAddress[1] + pos] == 0){
						this.boardEmpty[fromAddress[0]][fromAddress[1] + pos].getHorNumId().forEach((id,i) =>{
							if(id > 0){
								(this.numDict.get(id) as Num).setRemain1way(3 - 2 * i,0);	//id>0で存在判定可能 上→下の順にidがくるので、0にするのは下→上の順
								this.numsToCheckStack.push(id);
							}
						});
						pos++;
					}
					break;
				case 3:
					pos = 1;	//下
					while(this.boardAbst[fromAddress[0] + pos][fromAddress[1]] == 0){
						this.boardEmpty[fromAddress[0] + pos][fromAddress[1]].getVerNumId().forEach((id,i) =>{
							if(id > 0){
								(this.numDict.get(id) as Num).setRemain1way(2 - 2 * i,0);	//id>0で存在判定可能 左→右の順にidがくるので、0にするのは右→左の順
								this.numsToCheckStack.push(id);
							}
						});
						pos++;
					}
					break;
			}
			//数字引き
			toRemain = toNum.drawIn((dir+2)%4,hon);
			if(toRemain < 2){
				toNum.getSurNumId().forEach((id) => {
					nextTarget = this.numDict.get(id);
					if(nextTarget != undefined){
						nextTarget.setRemain1way((dir+2)%4,toRemain);
						this.numsToCheckStack.push(id);
					}
				});
			}

			//島のマージ
			let fromParentId = fromNum.getParentIslandId();
			let toParentId = toNum.getParentIslandId();
			if(fromParentId != toParentId){
				this.mergeIslands(fromParentId,toParentId)
			};
		}else if(fromRemain < 2){	//残り引き本数減:0本方向に通知して手筋チェック対象に加える
			nextTarget = this.numDict.get(fromNum.getSurNumId()[dir]);
			if(nextTarget != undefined){
				nextTarget.setRemain1way((dir+2)%4,fromRemain);
				this.numsToCheckStack.push(nextTarget.getId());
			}
		}
	}

	private mergeIslands(fromId:number,toId:number):void{
		(this.islands.get(toId) as Island).mergeIsland(this.islands.get(fromId) as Island);
		this.islands.delete(fromId);
	}
	
}


