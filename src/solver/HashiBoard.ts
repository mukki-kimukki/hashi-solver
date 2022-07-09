
//盤面の数字配置や島の情報を保持する
import {Empty} from "./Empty";
import {Island} from "./Island";
import {Num} from "./Num";
import {ResultLog} from"./ResultLog";
import { hashiConstants } from "./hashiConstants";

export class HashiBoard {

	private height: number;
	private width: number;
	private boardAbst: number[][];	//数字配置
	private numIdMap: number[][];	//数字配置マスのid
	private boardEmpty: Empty[][];	//空白マス
	private numDict:Num[][];	//仮置き段階ごとに数字idと数字詳細を対応させる辞書
	private islands:Map<number,Island> = new Map<number,Island>();	//島と島に含まれる数字を対応させる辞書
	private numsToCheckStack: number[] = new Array();	//手筋チェック対象idのスタック
	private currentId:number = 0;	//スタート地点を分散させるため、最後のチェック箇所を記録する。
	private numCount:number;	//数字の数
	private resultLogArr:ResultLog[][] = [[]];
	private answerList:Num[][] = new Array();	//発見した解答のリスト
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
			this.numCount = id;

			id = 0;
			this.boardEmpty = new Array(this.height);
			this.numDict = new Array(1);
			this.numDict[0] = new Array(this.numCount);
			for(let y:number = 0; y < this.height; y++){
				this.boardEmpty[y] = new Array(this.width);
				for(let x = 0; x < this.width; x++){
					if(this.boardAbst[y][x] > 0){
						this.numDict[0][id] = new Num(0,y,x,this.boardAbst,this.numIdMap,id);
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

		this.numIdMap.forEach((rowIds,row) =>{
			boardNum[row] = new Array(this.width);
			rowIds.forEach((id,col) =>{
				if(id >= 0){
					boardNum[row][col] = this.numDict[depth][id];
				}
			});
		});
		return boardNum;
	}

	public getNumDict():Num[][]{
		return this.numDict;
	}

	public getBoardAbst():number[][]{
		return this.boardAbst;
	}

	public solve(maxdepth:number):string{
		let result = this.logicSolve(0,true);
		let usedDepth:number = maxdepth;
		if(result.charAt(0) == "9" || result == "010"){
			//解答完了
			usedDepth = 0;
		}else{
			if(maxdepth>0){
				let finishFlg:boolean=false;
				// console.log("@trial 1");
				// console.log("@trySetRemain0");
				for(let i:number = 0;i < this.numCount;i++){
					if(this.trySetRemain0(1,i)){
						result = this.logicSolve(0,true);
						if(result.charAt(0) == "9" || result == "010"){
							usedDepth = 1;
							finishFlg = true;
							break;
						}
					}
				}
				
				if(!finishFlg){
					//一段仮定(先読み)
					// console.log("@trialSolve");
					while(this.trialSolve(1,1)){
						result = this.logicSolve(0,false);
						if(result.charAt(0) == "9" || result == "010"){
							usedDepth = 1;
							finishFlg = true;
							break;
						}
					}

					if(!finishFlg){
						//効率化多段仮定
						if(maxdepth > 1){
							// console.log("@trialSolve-2");
							while(this.trialSolve(1,maxdepth)){
								result = this.logicSolve(0,false);
								if(result.charAt(0) == "9" || result == "010"){
									usedDepth = maxdepth;
									finishFlg = true;
									break;
								}
							}	
						}
					}
				}
			}
		}
		this.resultLogArr[0].push(new ResultLog([],[],[hashiConstants.all0Result],result + "-" + usedDepth));
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
					fromNum = this.getDepthNum(depth,numId);
					logicResult = fromNum.checkLogics(true);
					switch(logicResult[0][1].charAt(0)){
						case "9":	//破綻またはエラー
							// console.log("depth=" + depth + " " + fromNum.getAddress() + " " + logicResult[0]);
							this.resultLogArr[depth].push(new ResultLog([numId],[numId],[logicResult[0][0]],logicResult[0][1] + "-" + String(depth)));

							return logicResult[0][1]
						case "0":	//変化なし
							break;
						default:	//手筋実行あり(case "1")
							// console.log("depth=" + depth + " " + fromNum.getAddress() + " " + logicResult[0]);
							//仮定でない場合、確定内容の履歴を作成
							this.resultLogArr[depth].push(new ResultLog([numId],[numId],[logicResult[0][0]],logicResult[0][1]));
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
			}
			numId = this.numsToCheckStack.pop();
		}while(typeof numId === 'number')
		return this.checkResult(depth);
	}

	private initDepth(depth:number):void{
		this.islands.forEach((isl) => isl.makeNextDepth(depth));
		this.numDict[depth] = this.numDict[depth - 1].concat();
		this.resultLogArr.splice(depth);
		this.resultLogArr.push([]);
	}

	private trialSolve(depth:number,maxDepth:number):boolean{
		let result:boolean;
		let currentTrialId:number=this.currentId;
		for(let i:number = 0; i < this.numCount; i++){
			if(this.numDict[depth-1][currentTrialId].getRemainSelf()>0){
				//左と上向き仮定
				for(let j:number = 0; j < 2; j++){
					if(this.numDict[depth-1][currentTrialId].getRemain4way()[j] > 0){
						result = this.tryDir(depth,maxDepth,currentTrialId,j);
						if(result){
							return result;
						};
					}
				}
			}
			currentTrialId = (currentTrialId + 1) % this.numCount;
		};
		return false;
	}

	private tryDir(depth:number,maxDepth:number,tryTargetId:number,dir:number):boolean{
		//仮定するまえに手筋適用可能な有意仮定かで実行の足切り
		let prevTarget:Num = this.numDict[depth-1][tryTargetId];
		let tryTargetId2:number = prevTarget.getSurNumId()[dir];
		let prevTarget2:Num = this.numDict[depth-1][tryTargetId2];
		let resultCheck1:[[number[],string],number] = prevTarget.trySetRemain1way(dir,0);
		let resultCheck2:[[number[],string],number] = prevTarget2.trySetRemain1way((dir + 2) % 4,0);
		//このresultCheckは破綻にならない（破綻する場合通常手筋の適用範囲内）
		
		//有効な仮定の場合
		if(resultCheck1[0][1].charAt(0) == "1" || resultCheck2[0][1].charAt(0) == "1"){
			let solveResultCode:string;
			//仮定初期化
			this.initDepth(depth);

			let tryTarget:Num = this.getDepthNum(depth,tryTargetId);
			let tryTarget2:Num = this.getDepthNum(depth,tryTargetId2);
			
			//引き本数0の仮定
			// console.log("try-remain0 starts id= " + tryTargetId + " dir= " + dir);
			if(tryTarget.setRemain1way(dir,0)){
				this.numsToCheckStack.push(tryTargetId);
			}
			if(tryTarget2.setRemain1way((dir + 2) % 4,0)){
				this.numsToCheckStack.push(tryTargetId2);
			}
			this.resultLogArr[depth].push(new ResultLog([],[tryTargetId,tryTargetId2],[hashiConstants.defaultResultArr[1][dir],hashiConstants.defaultResultArr[1][(dir + 2) % 4]],"1T1S"));
			solveResultCode = this.logicSolve(depth,false);
			if(solveResultCode.charAt(0) == "9"){
				this.resultLogArr[depth - 1].push(new ResultLog([tryTargetId],[tryTargetId],[hashiConstants.defaultResultArr[0][dir]],"1T19",this.resultLogArr[depth]));
				// console.log("try-remain0 succeeded drawLine Id=" + tryTargetId + " dir= " + dir);
				this.drawFrom(depth - 1,tryTargetId,1,dir);
				return true;
			}else if(solveResultCode =="010"){
				//解答を見つけた場合、リストに加えてそれ以外の場合を継続して探索
				this.addAnswer(depth);
				//TODO解発見パターン
				return false;
			}else if(depth < maxDepth){
				//次の深さの仮定を実行する
				while(this.trialSolve(depth + 1,maxDepth)){
					solveResultCode = this.logicSolve(depth,false);
					if(solveResultCode.charAt(0) == "9"){
						this.resultLogArr[depth - 1].push(new ResultLog([],[tryTargetId],[hashiConstants.defaultResultArr[0][dir]],"1T39",this.resultLogArr[depth]));
						this.drawFrom(depth - 1,tryTargetId,1,dir);
						return true;
					}else if(solveResultCode =="010"){
						//解答を見つけた場合、リストに加えてそれ以外の場合を継続して探索
						this.addAnswer(depth);
						//TODO解発見パターン
						return false;
					}
				}
			}
		}
		//全探索の場合ここに分岐を追加する

		//線引き仮定：効率化のため次の深さの探索は行わない：ここを省いても全探索は保証できる
		if(prevTarget.getHands4way()[dir] == 0){
			// console.log("try draw starts id= " + tryTargetId + " dir= " + dir);
			//仮定初期化
			this.initDepth(depth);

			this.drawFrom(depth,tryTargetId,1,dir);
			this.resultLogArr[depth].push(new ResultLog([],[tryTargetId],[hashiConstants.defaultResultArr[0][dir]],"1T2S"));
			let solveResultCode:string = this.logicSolve(depth,false);
			if(solveResultCode.charAt(0) == "9"){
				let nextTarget = this.getDepthNum(depth - 1,tryTargetId);
				let nextTarget2 = this.getDepthNum(depth - 1,tryTargetId2);
				this.resultLogArr[depth - 1].push(new ResultLog([tryTargetId],[tryTargetId,tryTargetId2],[hashiConstants.defaultResultArr[1][dir],hashiConstants.defaultResultArr[1][(dir + 2) % 4]],"1T29",this.resultLogArr[depth]));
				// console.log("try draw succeeded id= " + tryTargetId + "id2 = " + tryTargetId2);
				nextTarget.setRemain1way(dir,0);
				nextTarget2.setRemain1way((dir + 2) % 4,0);
				this.numsToCheckStack.push(tryTargetId);
				this.numsToCheckStack.push(tryTargetId2);
				return true;
			}
			//TODO解発見パターン
		}
		//ここに到達する場合、未探索の枝がある
		return false;
	}

	/**
	 * 周囲の数字から対象の残り本数分引ききられた場合を仮定する
	 * @param depth 
	 * @param tryTargetId 
	 * @returns 
	 */
	private trySetRemain0(depth:number,tryTargetId:number):boolean{
		let targetNum0:Num = this.numDict[depth-1][tryTargetId];
		let targetRemain:number = targetNum0.getRemainSelf();
		if(targetRemain > 2 || targetRemain == 0 || (this.islands.get(targetNum0.getParentIslandId()) as Island).getActiveNumList(depth-1).length == 1){
			return false;
		}else{
			//残り本数と同じ残り引き本数の数字がない場合無意味なのでスキップ...条件1
			if(targetNum0.getRemain4way().findIndex(val => val == targetRemain) < 0){
				return false;
			}
			// console.log("try-deadend id=" + tryTargetId);
			//仮定初期化
			this.initDepth(depth);
			let hands4way:number[] = targetNum0.getHands4way();
			let remain4way:number[] = targetNum0.getRemain4way();
			let handsRemainDirCount:number = 0;
			let handsRemainDir:number = 0;
			let targetList:number[]=[];
			let targetDirList:number[]=[];
			targetNum0.getSurNumId().forEach((set0Id,dir) => {
				// console.log("dir=" + dir);
				//条件1の方向は含めない...条件2
				if(remain4way[dir] > 0 && (hands4way[dir] > 0 || remain4way[dir] != targetRemain)){
					this.getDepthNum(depth,set0Id).setRemain1way((dir + 2) % 4,0);
					this.numsToCheckStack.push(set0Id);
					targetList.push(set0Id);
					targetDirList.push(dir);
					handsRemainDirCount += 1;
					handsRemainDir= dir;
				}
			});
			if(handsRemainDirCount==0){
				return false;
			}
			let tempResultList:number[][]=[];
			targetDirList.forEach(dir=>{
				tempResultList.push(hashiConstants.defaultResultArr[1][(dir + 2)%4]);
			});
			this.resultLogArr[depth].push(new ResultLog([tryTargetId],targetList,tempResultList,"1T4S"));
			
			let solveResult:string = this.logicSolve(depth,false);
			//破綻した場合
			if(solveResult.charAt(0) == "9"){
				if( handsRemainDirCount == 1){
					// console.log("drawLine Id=" + tryTargetId + " dir= " + handsRemainDir);
					this.drawFrom(depth - 1, tryTargetId, 1, handsRemainDir);
					this.resultLogArr[depth].push(new ResultLog([tryTargetId],[tryTargetId],[hashiConstants.defaultResultArr[0][handsRemainDir]],"1T49"));

					return true;
				}
			}else{
				let tryTarget:Num = this.numDict[depth][tryTargetId];
		
				//調査対象に0本指定した数字以外から線を引いていた場合無効
				let drawDir:number = -1;
				let drawCount:number = tryTarget.getHands4way().reduce((prev,hon,dir) => {
					let tempFlg:boolean = hon > hands4way[dir];
					if(tempFlg){
						drawDir = dir;
					}
					return prev + Number(tempFlg);
				},0);
	
				//
				switch(drawCount){
					case 0:
						let targetIsland:Island = this.islands.get(tryTarget.getParentIslandId()) as Island
						//島で残っている数字が調査対象のみの場合(引ききりで行き止まりとなる場合)
						if((targetIsland.getActiveNumList(depth).length - Number(tryTarget.getRemainSelf() > 0)) == 0){
							targetNum0.getSurNumId().forEach((id,dir) =>{
								//条件2の対偶:線を引ききる可能性のある方向(条件2自体はset0の対象外を外すためにremain>0を加えている)
								if(hands4way[dir] == 0 && remain4way[dir] == targetRemain){
									// console.log("setRem0 Id=" + id + " dir= " + (dir + 2) % 4);
									this.numDict[depth - 1][id].setIsEndDirTrue((dir + 2) % 4,targetRemain);
									this.numsToCheckStack.push(id);
									this.resultLogArr[depth].push(new ResultLog([tryTargetId],[id],[hashiConstants.defaultResultArr[1][dir]],"1T41"));
								}
							});
							return true;
						}/*else{
							//実際の引きなしで残り0を仮定して効果がない場合は引きまで試す。
							//到達するまでの実行結果を流用するために2段目の仮定盤面を使用する。
						}
						*/
						break;
						/*
					case 1:
						if(this.trySetRemain0Sub(depth,tryTargetId,drawDir)){

						}else{
							return false;
						}
						break;
						*/
					default:
						break;
				}
			}
			return false;
		}
	}
	/*
	private trySetRemain0Sub(currentDepth:number,tryRootId:number,dir:number):boolean{
		this.initDepth(currentDepth + 1);
		let rootNum0:Num = this.numDict[currentDepth][tryRootId];
		let toNum:Num = this.getDepthNum(currentDepth + 1, rootNum0.getSurNumId()[dir]);
		this.drawFrom(currentDepth + 1,tryRootId,rootNum0.getRemainSelf(),dir);
		let result:string = this.logicSolve(currentDepth + 1,false);
		let rootParentIdAfter:number = this.numDict[currentDepth + 1][tryRootId].getParentIslandId();

		if(result =="902"){
			if((this.islands.get(rootParentIdAfter) as Island).getActiveNumList(currentDepth + 1).length == 0){
				return true;
			}else{
				return false;
			}
		}else{
			if(result.charAt(0) =="9"){
				return false;
			}else{
				return false;
			}
		}
	}
	*/
	private checkResult(depth:number):string{
		let islandsCount:number = 0;
		let activeIslandsCount:number = 0;
		let inactiveIsland:Island|null = null;
		for(let island of this.islands.values()){
			islandsCount += Number(island.getNumList(depth).length > 0);
			if(island.getActiveNumList(depth).length > 0){
				activeIslandsCount += 1;
			}else{
				inactiveIsland = island;
			}
		}
		if(activeIslandsCount > 0){
			if(activeIslandsCount < islandsCount){
				//孤立島あり
				if(depth == 0){
					this.resultLogArr[depth].push(new ResultLog([],(inactiveIsland as Island).getNumList(depth),[hashiConstants.all0Result],"902-" + String(depth)));
				}
				return "902"
			}else{
				return "091"
			}
		}else{
			if(islandsCount > 1){
				if(depth == 0){
					this.resultLogArr[depth].push(new ResultLog([],(inactiveIsland as Island).getNumList(depth),[hashiConstants.all0Result],"903-" + String(depth)));
				}
				return "903"
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
	 * @param notifyFlg 線引き後に周囲の数字に本数減を通知するか
	 * @returns 残り本数減で周囲の数字にチェック対象が出たか
	 */
	private drawFrom(depth:number,fromNumId:number,hon:number,dir:number){
		let fromNum:Num = this.getDepthNum(depth,fromNumId);
		let fromRemain:number = fromNum.drawFrom(dir,hon);

		//線と引き先
		this.drawLine(depth,fromNum,fromRemain,hon,dir);
		//0になった場合非活性化する
		if(fromRemain == 0){
			(this.islands.get(fromNum.getParentIslandId()) as Island).inactivateNum(depth,fromNum.getId());
		}
		if(fromRemain<=2){
			this.notify4way(depth,fromNumId,fromRemain);
		}
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
			let toId:number = fromNum.getSurNumId()[dir];
			toNum = this.getDepthNum(depth,toId);
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

			//数字引き
			toRemain = toNum.drawTo((dir+2)%4,hon,fromRemain);
			if(toRemain < 2){
				this.notify4way(depth,toId,toRemain);
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
			let nextId:number = fromNum.getSurNumId()[dir];
			if(nextId >= 0){
				if(this.numDict[depth][nextId].getRemainSelf() > 0){
					nextTarget = this.getDepthNum(depth,nextId);
					if(nextTarget.setRemain1way((dir+2)%4,fromRemain)){
						this.numsToCheckStack.push(nextTarget.getId());
					}
				}
			}
		}
	}

	private notify4way(depth:number,rootId:number,remain:number):boolean{
		let result:boolean = false;
		this.numDict[depth][rootId].getSurNumId().forEach((targetId,dir)=>{
			if(targetId>=0){
				let targetNum:Num = this.getDepthNum(depth,targetId);
				if(targetNum.getRemainSelf() > 0){
					let tempResult = targetNum.setRemain1way((dir+2)%4,remain);
					if(tempResult){
						this.numsToCheckStack.push(targetId);
					}
					result = result || tempResult;
				}
			}
		});
		return result;
	}

	private drawFrom4way(depth:number,fromId:number,draw4way:number[]):void{
		let targetNum = this.getDepthNum(depth,fromId);
		let remain:number = targetNum.execLogic(draw4way);
		this.drawTo4way(depth,targetNum,draw4way,remain);
		if(remain == 0){
			(this.islands.get(targetNum.getParentIslandId()) as Island).inactivateNum(depth,fromId);
		}
		
	}

	private drawTo4way(depth:number,fromNum:Num,draw4way:number[],remain:number){
		draw4way.forEach((hon,dir) => this.drawLine(depth,fromNum,remain,hon,dir));
	}

	private mergeIslands(depth:number,rootIslandId:number,mergeIslandId:number):void{
		let mergeIsland:Island =this.islands.get(mergeIslandId) as Island;
		mergeIsland.getNumList(depth).forEach((id)=>{
			this.getDepthNum(depth,id).setParentIslandId(rootIslandId);
		});
		(this.islands.get(rootIslandId) as Island).mergeIsland(depth,mergeIsland);
	}


	private checkEndIslands(depth:number):boolean{
		let result:boolean =false;
		let execResult0:boolean;
		let execResult1:boolean;
		this.islands.forEach((isl) => {
			//島ごとに出口が一つだけになっているか調べる
			switch(isl.getActiveNumList(depth).length){
				case 1:
					if(isl.getNumList(depth).length > 1 && !isl.getIsIslandEndChecked(depth)){
						let nextTarget:Num
						//出口が一つの島なら行き止まりを設定できる可能性がある。
						isl.getActiveNumList(depth).forEach((numId) => {
							nextTarget = this.getDepthNum(depth,numId);
							let remainSelf:number = nextTarget.getRemainSelf();
							let tempResult:boolean = nextTarget.setEnd();
							result =result||tempResult;
							if(tempResult){
								this.resultLogArr[depth].push(new ResultLog(isl.getNumList(depth).concat(),[numId],[hashiConstants.all0Result],"1I11"));
							}
							this.numsToCheckStack.push(nextTarget.getId());
							let statusChangeIdList:number[]=[];
							nextTarget.getSurNumId().forEach((surNumId,dir) => {
								//数字IDが0より大きく（存在する）出口数字が2以下の場合に行き止まりを設定できるかチェックする
								if(surNumId >= 0 && remainSelf <= 2){
									//自身の残り本数が、受け取った行き止まり手筋用残り本数より多い場合に成功する
									if(remainSelf <= this.numDict[depth][surNumId].getRemain4way()[(dir+2)%4]){
										tempResult = this.getDepthNum(depth,surNumId).setIsEndDirTrue((dir+2)%4,remainSelf);
										if(tempResult){
											statusChangeIdList.push(surNumId);
										}
										result= result || tempResult;
									}
								}
							});
							
							if(statusChangeIdList.length > 0){
								this.resultLogArr[depth].push(new ResultLog([numId],statusChangeIdList,[hashiConstants.all0Result],"1I12"));
							}
						});
					}
					break;
				case 2:
					if(isl.getNumList(depth).length > 2 && !isl.getIsIslandEndChecked(depth)){
						let numIds:number[] = isl.getActiveNumList(depth);
						let num0:Num = this.numDict[depth][numIds[0]];
						//出口の数字が二つでその数字が隣接している場合、残り0本の方向は行き止まりとして扱える
						num0.getSurNumId().forEach((id,dir) =>{
							//idが一致するのは高々1回なのでforeach中に操作してよい
							if(id == numIds[1]){
								let tempResult:boolean = false;
								let nextTarget0:Num = this.getDepthNum(depth,numIds[0]);
								let nextTarget1:Num = this.getDepthNum(depth,id);
								execResult0 = nextTarget0.setEnd();
								execResult1 = nextTarget1.setEnd();
								tempResult = tempResult || execResult0 || execResult1;
								let remainDir0:number = nextTarget0.getRemain4way()[dir];
								let remainDir1 = nextTarget1.getRemain4way()[(dir+2)%4];
								
								//numId[1]側が残り1,2でnumId[0]側から引ききって残り0にできる場合
								if(remainDir1 <= remainDir0 &&  remainDir1 === nextTarget1.getRemainSelf()){
									execResult0 = nextTarget0.setIsEndDirTrue(dir,remainDir0);
									tempResult = tempResult ||execResult0;
								}
								//numId[0]側が残り1,2でnumId[1]側から引ききって残り0にできる場合
								if(remainDir0 <= remainDir1 &&  remainDir0 === nextTarget0.getRemainSelf()){
									execResult1 = nextTarget1.setIsEndDirTrue((dir+2)%4,remainDir1);
									tempResult = tempResult ||execResult1;
								}
								
								if(tempResult){
									this.numsToCheckStack.push(numIds[0]);
									this.numsToCheckStack.push(numIds[1]);
									this.resultLogArr[depth].push(new ResultLog(isl.getNumList(depth).concat(),numIds.concat(),[hashiConstants.all0Result],"1I21"));
								}
								result = result || tempResult;
							}
						});
					}
					break;
				case 3:
					break;
				default:
					break;
			}
			isl.setIsIslandEndChecked(depth,true);
		});
		return result;
	}

	private checkMinHonsu(depth:number):boolean{
		let target:Num;
		let remain1:number
		let remain2:number
		for(let i:number  = 0; i < this.numCount; i ++){
			for(let area:number = 0; area < 4; area++){
				remain1 = this.numDict[depth][this.currentId].getRemain4way()[(area + 2) % 4];
				remain2 = this.numDict[depth][this.currentId].getRemain4way()[(area + 3) % 4];
				if(remain1 > 0 || remain2 >0){
					if(this.numDict[depth][this.currentId].checkMin1(area) == 2 ){
						let checkMinResult:[number,number[]] = this.checkMinHonsuSub(depth,this.currentId,area);
						if(checkMinResult[0] == 2){
							target = this.getDepthNum(depth,this.currentId);
							let result4way:number[] = target.getExecMin1result(area);
							this.drawFrom4way(depth,this.currentId,result4way);
							checkMinResult[1].push(this.currentId)
							this.resultLogArr[depth].push(new ResultLog(checkMinResult[1],[this.currentId],[result4way],"1M00"));
							//残りの数字のチェックは必要な時に再度実行でよいので手筋チェック成功時点で一旦打ち切り
							this.currentId = (this.currentId +1) % this.numCount;
							return true;
						}
					}
				}
			}
			this.currentId = (this.currentId +1) % this.numCount;
		}
		return false;
	}
	/**
	 * 
	 * @param depth 
	 * @param id 
	 * @param area 
	 * @returns [結果コード,チェック対象リスト]
	 */
	private checkMinHonsuSub(depth:number,id:number,area:number):[number,number[]]{
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
		//呼び出し元で両方向引けることを確かめてundefinedは発生しないようにしておく(checkMin1が1または2なら可)
		while(this.boardAbst[fromAddress[0] + y][fromAddress[1] + x] == 0){
			let idToAdd:number = this.boardEmpty[fromAddress[0] + y][fromAddress[1] + x].getSurNumId()[(area + 1) % 4];
			if(idToAdd >= 0){
				targetDict.push(idToAdd);
			}
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
				switch(this.numDict[depth][nextId].checkMin1((area + 2) % 4)){
					case 3:
					case 2:
						return [2,[]];
					case 1:
						let subResult:[number,number[]] = this.checkMinHonsuSub(depth,nextId,area);
						if(subResult[0] == 2){
							subResult[1].push(id);
							return subResult;
						}
						break;
				}
			};
			x += xinc;
			y += yinc;
		}

		return [0,[]];

	}

	private addAnswer(depth:number):void{
		let newAns:Num[] = new Array(this.numCount);
		this.numDict[depth].forEach((currentNum,i) => {
			newAns[i] = currentNum.clone(depth);
		});
		this.answerList.push(newAns);
	}

	public getResultLogArr():ResultLog[]{
		return this.resultLogArr[0];
	}
	
}


