
//盤面の数字配置や島の情報を保持する
import {Empty} from "./Empty";
import {Island} from "./Island";
import {Num} from "./Num";
import {resultLog} from"./resultLog";


export class HashiBoard {

	private height: number;
	private width: number;
	private boardAbst: number[][];	//数字配置
	private numIdMap: number[][];	//数字配置マスのid
	private boardEmpty: Empty[][];	//空白マス
	private numDict:Num[][];	//仮置き段階ごとに数字idと数字詳細を対応させる辞書
	private islands:Map<number,Island> = new Map<number,Island>();	//島と島に含まれる数字を対応させる辞書
	private numsToCheckStack: number[] = new Array();	//手筋チェック対象idのスタック
	private numsForTrialStack: number[][] = new Array();	//仮定チェック対象idのスタック
	private currentId:number = 0;	//手筋チェックをする際にスタート地点を分散させるため、最後のチェック箇所を記録する。
	private numCount:number;	//数字の数
	private resultLogArr:resultLog[] = new Array();
	private answerList:string[][][] = new Array();	//発見した解答のリスト
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
					this.numIdMap[y][x] = -1;
				}
			}
			let coded: string = urlSplit[urlSplit.length - 1];
			let pos:number = 0;
			let charNum:number;
			let id:number = 0;
			let interval:number;
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
			this.numCount = id + 1;

			id = 0;
			this.boardEmpty = new Array(this.height);
			this.numDict = new Array(1);
			for(let y:number = 0; y < this.height; y++){
				this.boardEmpty[y] = new Array(this.width);
				this.numDict[0] = new Array(this.numCount);
				for(let x = 0; x < this.width; x++){
					if(this.boardAbst[y][x] > 0){
						this.numDict[0][id] =new Num(0,y,x,this.boardAbst,this.numIdMap,id);
						this.islands.set(id,new Island(id));
						this.numsToCheckStack.push(id);
						id += 1;
					}else{
						this.boardEmpty[y][x] = new Empty(y,x,this.numIdMap);
					}
				}
			}
		}else{
			//if board size is given
			this.height = param1;
			this.width = param2;
			this.numCount = 0;
			this.boardAbst = new Array(this.height);
			this.boardEmpty = new Array(this.height);
			this.numIdMap = new Array(this.height);
			this.numDict = new Array(1);
			for(let i:number = 0;i <this.height;i++){
				this.boardAbst[i] = new	Array(this.width);
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

	public getBoardNum(depth:number):Num[][]{
		let boardNum:Num[][] = new Array(this.height);
		for(let i  = 0; i++; i< this.height){
			boardNum[i] = new Array(this.width);
		}
		this.numIdMap.forEach((rowIds,row) =>{
			return rowIds.forEach((id,col) =>{
				if(id >= 0){
					boardNum[row][col] = this.numDict[depth][id];
				}
			});
		});
		return boardNum;
	}

	public getBoardAbst():number[][]{
		return this.boardAbst;
	}

	public solve(maxdepth:number):string{
		let result = this.logicSolve(0,true);
		if(result.charAt(0) == "9"){
			return result;
		}else if(result == "010"){
			return result;
		}
		if(maxdepth>0){
			//仮定処理の初期化
			this.numsForTrialStack = new Array(maxdepth);
			this.numsForTrialStack[0] = new Array(this.numCount);
			for(let i:number = 0;i < this.numCount;i++){
				this.numsForTrialStack[0][i] = i;

				if(this.trySetRemain0(1,i)){
					result = this.logicSolve(0,true);
					if(result.charAt(0) == "9"){
						return result;
					}else if(result == "010"){
						return result;
					}
				}
			}
			
			//一段仮定(先読み)
			while(this.trialSolve(1,1)){
				result = this.logicSolve(0,false);
				if(result.charAt(0) == "9"){
					return result;
				}else if(result == "010"){
					return result;
				}
			}

			//効率化多段仮定
			if(maxdepth > 1){
				while(this.trialSolve(1,maxdepth)){
					result = this.logicSolve(0,false);
					if(result.charAt(0) == "9"){
						return result;
					}else if(result == "010"){
						return result;
					}
				}	
			}
		}
		return result;

	}
	
	private logicSolve(depth:number,useCountFlg:boolean):string{
		//手筋領域
		let numId:number|undefined = this.numsToCheckStack.pop();
		let fromNum:Num;
		let logicResult:[[number[],string],number];
		let islandCheckResult:boolean;
		do{
			//本数確定系ループ
			do{
				//島手筋ループ
				while(typeof numId === 'number'){
					//数字手筋ループ
					fromNum = this.numDict[depth][numId] as Num
					logicResult = fromNum.checkLogics(true);
					//console.log(fromNum.getAddress());
					//console.log(logicResult[0]);
					switch(logicResult[0][1].charAt(0)){
						case "9":	//破綻またはエラー
							return logicResult[0][1]
						case "0":	//変化なし
							if(depth>0){
								this.numsForTrialStack[depth].push(numId);
							}
							break;
						default:	//手筋実行あり
							//仮定でない場合、確定内容の履歴を作成
							if(depth == 0){
								this.resultLogArr.push(new resultLog(numId,numId,logicResult[0][0],logicResult[0][1]));
							}
							logicResult[0][0].forEach((hon,dir) => this.drawLine(depth,fromNum,logicResult[1],hon,dir));
							//残り本数が0の場合は島に伝える
							if(logicResult[1] == 0){
								(this.islands.get(fromNum.getParentIslandId()) as Island).inactivateNum(depth,numId);
							}
							break;
					}
					numId = this.numsToCheckStack.pop();
				}
				//島手筋が全てチェックし終わるまでループ
				islandCheckResult = this.checkEndIslands(depth)
				numId = this.numsToCheckStack.pop();
			}while(islandCheckResult)
			if(depth == 0 && useCountFlg){
				this.checkMinHonsu(depth);
				numId = this.numsToCheckStack.pop();
			}
		}while(typeof numId === 'number')
		return this.checkResult(depth);
	}

	private trialSolve(depth:number,maxDepth:number):boolean{
		let result:boolean;
		let numId:number;
		while(this.numsForTrialStack[depth-1].length > 0){
			numId = this.numsForTrialStack[depth-1].pop() as number;
			//左と上向き仮定
			for(let i:number = 0; i < 2; i++){
				if(this.numDict[depth-1][numId].getRemain4way()[i] > 0){
					result = this.tryDir(depth,maxDepth,numId,i);
					if(result){
						return result;
					};
				}
			}
		};
		return false;
	}

	private tryDir(depth:number,maxDepth:number,tryTargetId:number,dir:number):boolean{
		let solveResultCode:string;
		let tryResult:boolean;
		let tryTarget:Num = this.getDepthNum(depth,tryTargetId);
		let tryTargetId2:number = tryTarget.getSurNumId()[dir];
		let tryTarget2:Num = this.getDepthNum(depth,tryTargetId2);
		this.islands.forEach((isl) => isl.makeNextDepth(depth));
		this.numDict[depth] = this.numDict[depth - 1].concat();
		
		//引き本数0の仮定
		tryTarget.setRemain1way(dir,0);
		tryTarget2.setRemain1way((dir + 2) % 4,0);
		this.numsToCheckStack.push(tryTargetId);
		this.numsToCheckStack.push(tryTargetId2);
		this.numsForTrialStack[depth] = new Array();
		solveResultCode = this.logicSolve(depth,false);
		if(solveResultCode.charAt(0) == "9"){
			this.drawFrom(depth - 1,tryTarget,1,dir);
			return true;
		}else if(solveResultCode =="010"){
			//解答を見つけた場合、リストに加えてそれ以外の場合を継続して探索
			this.addAnswer(depth);
			return true;
		}else if(this.numsForTrialStack[depth][0] != tryTargetId2 && this.numsForTrialStack[depth][1] != tryTargetId && depth < maxDepth){
			//破綻も解発見もしなかったが、有効な仮定であった場合のみ次の深さの仮定を実行する
			tryResult = this.trialSolve(depth + 1,maxDepth);
			while(tryResult){
				solveResultCode = this.logicSolve(depth,false);
				if(solveResultCode.charAt(0) == "9"){
					this.drawFrom(depth - 1,tryTarget,1,dir);
					return true;
				}else if(solveResultCode =="010"){
					//解答を見つけた場合、リストに加えてそれ以外の場合を継続して探索
					this.addAnswer(depth);
					return true;
				}
				tryResult = this.trialSolve(depth + 1,maxDepth);
			}
		}
		//線引き仮定：効率化のため次の深さの探索は行わない：ここを省いても全探索は保証できる
		if(tryTarget.getHands4way()[dir] == 0){
			this.islands.forEach((isl) => isl.makeNextDepth(depth));
			this.numDict[depth] = this.numDict[depth-1].concat();
			this.drawFrom(depth,tryTarget,1,dir);
			this.numsToCheckStack.push(tryTarget.getId());
			this.numsToCheckStack.push(tryTarget2.getId());
			solveResultCode = this.logicSolve(depth,false);
			if(solveResultCode.charAt(0) == "9"){
				let nextTarget = this.getDepthNum(depth - 1,tryTargetId);
				let nextTarget2 = this.getDepthNum(depth - 1,nextTarget.getSurNumId()[dir]);
				nextTarget.setRemain1way(dir,0);
				nextTarget2.setRemain1way((dir + 2) % 4,0);
				this.numsToCheckStack.push(nextTarget.getId());
				this.numsToCheckStack.push(nextTarget2.getId());
				return true;
			}else if(solveResultCode =="010"){
				//解答を見つけた場合、リストに加えてそれ以外の場合を継続して探索
				this.addAnswer(depth);
				return true;
			}
		}
		//ここに到達する場合、未探索の枝がある
		return false;
	}

	private trySetRemain0(depth:number,tryTargetId:number):boolean{
		let targetNum0:Num = this.numDict[depth-1][tryTargetId];
		let targetRemain:number = targetNum0.getRemainSelf();
		if(targetRemain > 2 || targetRemain == 0 || (this.islands.get(targetNum0.getParentIslandId()) as Island).getNumList(depth).length == 1){
			return false;
		}else{
			//残り本数と同じ残り引き本数の数字がない場合無意味なのでスキップ
			if(targetNum0.getRemain4way().findIndex(val => val == targetRemain) < 0){
				return false;
			}

			this.islands.forEach((isl) => isl.makeNextDepth(depth));
			this.numDict[depth] = this.numDict[depth - 1].concat();
			let hands4way:number[] = targetNum0.getHands4way();
			let remain4way:number[] = targetNum0.getRemain4way();
			let handsRemainDirCount:number = 0;
			let handsRemainDir:number = 0;
			targetNum0.getSurNumId().forEach((set0Id,dir) => {
				if(hands4way[dir]>0){
					this.getDepthNum(depth,set0Id).setRemain1way((dir + 2) % 4,0);
					this.numsToCheckStack.push(set0Id);
					if(remain4way[dir] > 0){
						handsRemainDirCount += 1;
						handsRemainDir= dir;
					}
				}
			});
			let solveResult:string = this.logicSolve(depth,false);
			let tryResult:boolean = false;
			//破綻した場合かつ引けないと仮定した方向(手がつながっている方向で残り1本以上)が1方向のみの場合
			if(solveResult.charAt(0) == "9" && handsRemainDirCount == 1){
				this.drawLine(depth - 1, targetNum0,targetNum0.getRemainSelf() - 1, 1, handsRemainDir);
				tryResult = true;
			}
			let tryTarget:Num = this.numDict[depth][tryTargetId];

			//調査対象に線を引いていた場合無効
			let failFlg:boolean = tryTarget.getHands4way().findIndex((hon,dir) => {
				(hon > 0) && (hands4way[dir] == 0)
			}) >= 0;

			//
			if(!failFlg){
				let targetIsland:Island = this.islands.get(tryTarget.getParentIslandId()) as Island
				if((targetIsland.getActiveNumList(depth).length - Number(tryTarget.getRemainSelf())) == 0){
					targetNum0.getSurNumId().forEach((id,dir) =>{
						if(hands4way[dir] == 0 && remain4way[dir] == targetRemain){
							this.numDict[depth - 1][id].setIsEndSurTrue((dir + 2) % 4,targetRemain);
							this.numsToCheckStack.push(id);
						}
					});
					tryResult = true;
				}
			}
			return tryResult;
		}
	}

	/**
	 * 仮定の方式に合わせてスタックをリセットする
	 * @param depth スタックを再設定する仮定の深さ
	 * @param method 仮定方法-0:効率化あり,1:全探索
	 */
	private resetTrialStack(depth:number,method:number){

	}

	private checkResult(depth:number):string{
		let islandsCount:number = 0;
		let activeIslandsCount:number = 0;
		let activeIslandId:number = 0;
		for(let island of this.islands.values()){
			islandsCount += Number(island.getNumList(depth).length > 0);
			activeIslandsCount += Number(island.getActiveNumList(depth).length > 0);
			activeIslandId = island.getId();
		}
		if(activeIslandsCount > 0){
			return "091"
		}else{
			if(islandsCount > 1){
				return "902"
			}else{
				return "010";
			}
		}
	}

	private getDepthNum(depth:number,id:number):Num{
		let tempNum = this.numDict[depth][id];
		if(tempNum.getDepth() == depth){
			return tempNum;
		}else{
			return this.numDict[depth][id] = tempNum.clone(depth);
		}
	}
	/**
	 * 根元の数字から線引き処理をする
	 * @param depth 仮定の深度
	 * @param fromNum 引き元の数字
	 * @param hon 引き本数
	 * @param dir 引き方向
	 */
	private drawFrom(depth:number,fromNum:Num,hon:number,dir:number){
		let fromRemain:number = fromNum.drawIn(dir,hon);
		let nextTarget:Num
		if(fromRemain < 2){
			fromNum.getSurNumId().forEach((id,nextDir) => {
				if(id >= 0){
					nextTarget = this.getDepthNum(depth,id);
					if(nextTarget.getRemainSelf() > 0){
						if(nextTarget.setRemain1way((nextDir+2)%4,fromRemain)){
							this.numsToCheckStack.push(id);
						};
					}
				}
			});
			//0になった場合非活性化する
			if(fromRemain == 0){
				(this.islands.get(fromNum.getParentIslandId()) as Island).inactivateNum(depth,fromNum.getId());
			}
		}
		
		//線と引き先
		this.drawLine(depth,fromNum,fromRemain,hon,dir);

	}
	
	/**
	 * 線と引き先のみの線引き処理
	 * @param depth 
	 * @param fromNum 
	 * @param fromRemain 引いた後の残り本数
	 * @param hon 
	 * @param dir 
	 */
	private drawLine(depth:number,fromNum:Num,fromRemain:number,hon:number,dir:number){
		let nextTarget:Num;
		let toNum:Num;

		let toRemain:number;
		if(hon > 0){	//線引き
			toNum = this.getDepthNum(depth,fromNum.getSurNumId()[dir]);
			//空白引き
			let fromAddress = fromNum.getAddress();
			let pos:number;
			switch(dir){
				case 0:
					pos = -1;	//左
					while(this.boardAbst[fromAddress[0]][fromAddress[1] + pos] == 0){
						this.boardEmpty[fromAddress[0]][fromAddress[1] + pos].getVerNumId().forEach((id,i) =>{
							if(id >= 0){
								nextTarget = this.getDepthNum(depth,id);
								if(nextTarget.getRemainSelf() >0){
									if(nextTarget.setRemain1way(3 - 2 * i,0)){ 	//上→下の順にidがくるので、0にするのは下→上の順
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
							if(id >= 0){
								nextTarget = this.getDepthNum(depth,id);
								if(nextTarget.getRemainSelf() >0){
									if(nextTarget.setRemain1way(2 - 2 * i,0)){	//id>=0で存在判定可能 左→右の順にidがくるので、0にするのは右→左の順
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
							if(id >= 0){
								nextTarget = this.getDepthNum(depth,id);
								if(nextTarget.getRemainSelf() >0){
									if(nextTarget.setRemain1way(3 - 2 * i,0)){	//id>=0で存在判定可能 上→下の順にidがくるので、0にするのは下→上の順
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
							if(id >= 0){
								nextTarget = this.getDepthNum(depth,id);
								if(nextTarget.getRemainSelf() >0){
									if(nextTarget.setRemain1way(2 - 2 * i,0)){	//id>=0で存在判定可能 左→右の順にidがくるので、0にするのは右→左の順
										this.numsToCheckStack.push(id);
									};
								}
							}
						});
						pos++;
					}
					break;
			}
			if(fromRemain == 0){
				if(toNum.setRemain1way((dir+2)%4,0)){
					this.numsToCheckStack.push(toNum.getId());
				};
			}

			//数字引き
			toRemain = toNum.drawIn((dir+2)%4,hon);
			if(toRemain < 2){
				toNum.getSurNumId().forEach((id,nextDir) => {
					if(id >= 0){
						nextTarget = this.getDepthNum(depth,id);
						if(nextTarget.getRemainSelf() > 0){
							if(nextTarget.setRemain1way((nextDir+2)%4,toRemain)){
								this.numsToCheckStack.push(id);
							};
						}
					}
				});
				//引き先が0になった場合非活性化する
				if(toRemain == 0){
					(this.islands.get(toNum.getParentIslandId()) as Island).inactivateNum(depth,toNum.getId());
				}
			}

			//島のマージ
			let fromParentId = fromNum.getParentIslandId();
			let toParentId = toNum.getParentIslandId();
			//引き元と引き先の島Idが異なる場合は島をマージする
			if(fromParentId != toParentId){
				this.mergeIslands(depth,fromParentId,toParentId);
			};
		}else if(fromRemain < 2){	//残り引き本数減:0本方向に通知して手筋チェック対象に加える
			nextTarget = this.getDepthNum(depth,fromNum.getSurNumId()[dir]);
			if(nextTarget != undefined){
				if(nextTarget.getRemainSelf() > 0){
					if(nextTarget.setRemain1way((dir+2)%4,fromRemain)){
						this.numsToCheckStack.push(nextTarget.getId());
					}
				}
			}
		}
	}

	private mergeIslands(depth:number,rootIslandId:number,mergeIslandId:number):void{
		let mergeIsland:Island =this.islands.get(mergeIslandId) as Island;
		mergeIsland.getNumList(depth).forEach((id)=>{
			this.numDict[depth][id].setParentIslandId(rootIslandId);
		});
		(this.islands.get(rootIslandId) as Island).mergeIsland(depth,mergeIsland);
	}


	private checkEndIslands(depth:number):boolean{
		let resultFlg:boolean =false;
		let nextTarget:Num
		this.islands.forEach((isl) => {
			//島ごとに出口が一つだけになっているか調べる
			switch(isl.getActiveNumList(depth).length){
				case 1:
					if(isl.getNumList(depth).length > 1 && !isl.getIsIslandEndChecked(depth)){
						//出口が一つの島なら行き止まりを設定できる可能性がある。
						isl.setIsIslandEndChecked(depth,true);
						isl.getActiveNumList(depth).forEach((numId) => {
							nextTarget = this.getDepthNum(depth,numId);
							let remainSelf:number = nextTarget.getRemainSelf();
							nextTarget.setEnd();
							this.numsToCheckStack.push(nextTarget.getId());
							resultFlg = true;
							nextTarget.getSurNumId().forEach((surNumId,dir) => {
								//数字IDが0より大きく（存在する）出口数字が2以下の場合に行き止まりを設定できるかチェックする
								if(surNumId >= 0 && remainSelf <= 2){
									//自身の残り本数が、受け取った行き止まり手筋用残り本数より多い場合に成功する
									if(remainSelf <= this.numDict[depth][surNumId].getRemainSelf()){
										this.getDepthNum(depth,surNumId).setIsEndSurTrue((dir+2)%4,remainSelf);
									}
								}
							});
						});
					}
					break;
				case 2:
					//出口の数字が二つでその数字が隣接している場合、残り本数が同じで2本以下なら確定が発生する。
					let nums = isl.getActiveNumList(depth).map((id) => this.numDict[depth][id]);
					let remainSelf0 = nums[0].getRemainSelf();
					if(remainSelf0 <= 2 && remainSelf0 == nums[1].getRemainSelf()){
						nums[0].getSurNumId().forEach((id,dir) =>{
							if(id == nums[1].getId() && nums[0].getRemain4way()[dir] == nums[0].getRemain4way()[(dir+2)%4]){
								nextTarget = this.getDepthNum(depth,nums[0].getId());
								nextTarget.setIsEndSurTrue(dir,remainSelf0);
								this.numsToCheckStack.push(nextTarget.getId());
								resultFlg = true;
							}
						});
					}
					break;
			}
		});
		return resultFlg;
	}

	private checkMinHonsu(depth:number):void{
		let target:Num;
		for(let i:number  = 0; i < this.numCount; i ++){
			for(let area:number = 0; area < 4; area++){
				//currentIdは0スタートで1ずれているので1加算する
				if(this.numDict[depth][this.currentId + 1].getMin1(area) == 2){
					if(this.checkMinHonsuSub(depth,this.currentId + 1,area) == 2){
						target = this.getDepthNum(depth,this.currentId + 1);

						let hon:number = target.getRemain4way()[(area + 2) % 4];
						this.drawFrom(depth,target,hon,(area + 2) % 4);

						hon = target.getRemain4way()[(area + 3) % 4];
						this.drawFrom(depth,target,hon,(area + 3) % 4);

						this.currentId = (this.currentId +1) % this.numCount;
						return;
					}
					
				}
			}
			this.currentId = (this.currentId +1) % this.numCount;
		}
	}

	private checkMinHonsuSub(depth:number,id:number,area:number):number{
		let xinc:number;
		let yinc:number;
		switch(area){
			case 0:
				xinc = -1
				yinc = 0
				break;
			case 1:
				xinc = 0
				yinc = -1
				break;
			case 2:
				xinc = 1
				yinc = 0
				break;
			default:	//3
				xinc = 0
				yinc = 1
				break;
		}
		let x = xinc;
		let y = yinc;
		let targetDict:number[] =[];
		let fromAddress = this.numDict[depth][id].getAddress();
		//checkMinHonsuの段階で両方向引けることを確かめているので条件にundefinedは発生しない
		while(this.boardAbst[fromAddress[0] + y][fromAddress[1] + x] == 0){
			targetDict.push(this.boardEmpty[fromAddress[0] + y][fromAddress[1] + x].getSurNumId()[(area + 1) % 4]);
			x += xinc;
			y += yinc;
		}
		
		switch(area){
			case 0:
				xinc = 0
				yinc = -1
				break;
			case 1:
				xinc = 1
				yinc = 0
				break;
			case 2:
				xinc = 0
				yinc = 1
				break;
			default:	//3
				xinc = -1
				yinc = 0
				break;
		}
		x = xinc;
		y = yinc;
		
		while(this.boardAbst[fromAddress[0] + y][fromAddress[1] + x] == 0){
			let nextId = this.boardEmpty[fromAddress[0] + y][fromAddress[1] + x].getSurNumId()[area];
			if(targetDict.includes(nextId)){
				switch(this.numDict[depth][nextId].getMin1((area + 2) % 4)){
					case 3:
					case 2:
						return 2;
					case 1:
						if(this.checkMinHonsuSub(depth,nextId,area) == 2){
							return 2;
						}
						break;
				}
			};
			x += xinc;
			y += yinc;
		}

		return 0;

	}

	private addAnswer(depth:number):void{
		//TODO
	}
	
}


