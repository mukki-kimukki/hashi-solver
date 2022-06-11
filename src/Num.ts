export class Num {

	private id:number;
	private depth:number;
	private parentIslandId:number;
	private address:[number,number];
	private surNumId:number[] = [-1,-1,-1,-1];


    private hands4way:number[]=[0,0,0,0];   //left,up,right,down

	//自身の残り引き本数
	private remainSelf:number;				

	//周囲の残り引き本数：初期化時に壁だった場合を初期値とすると0
    private remain4way:number[] = [0,0,0,0];


	//周囲が行き止まり（行き止まり予備軍）かどうか
	private isEndSur:boolean[][]  		//boolean(4*3) 4方向(LeftUpRightDown)について何本(012)か引くと行き止まりになるか:初期値0は壁を想定してtrue
	= [[true,false,false],[true,false,false],[true,false,false],[true,false,false]];

	private isLogicChecked:boolean = false;	//手筋チェック済フラグ：無駄な検証をスキップ

	public constructor(depth:number, y:number, x:number, board:number[][], idMap:number[][], id:number)
	public constructor(depth:number,originalNum:Num)
	
	public constructor(depth:number,y:number|Num, x?:number, board?:number[][], idMap?:number[][], id?:number) {
		if(typeof y === 'number' && typeof x === 'number' && typeof board !== 'undefined' && typeof idMap !== 'undefined' && typeof id !== 'undefined'){
			this.id = id;
			this.depth = depth;
			this.parentIslandId = id;
			this.address = [y,x];
			this.remainSelf = board[y][x];
	
			let pos:number = -1;						//縦または横の相対位置:左から調べるので初期値は-1
			let tempNum:number;
	
			//左の数字を見つける
			while(x + pos >= 0) {
				tempNum = board[y][x + pos];
	
				//左に数字を見つけた場合
				if(tempNum > 0) {
					this.surNumId[0] = idMap[y][x+pos];
					switch (tempNum){
						case 2:				//2なら孤立シマ＋残り2本
							this.remain4way[0] = Math.min(this.remainSelf,2);
							if(tempNum > 1){
								this.isEndSur[0][2] = true;
							}
							break;
						case 1:				//1なら孤立シマ＋残り1本
							this.remain4way[0] = 1;
							this.isEndSur[0][1] = true;
							break;
						default:			//それ以外は引き本数残りが2で初期化
							this.remain4way[0] = Math.min(this.remainSelf,2);
							break;
					}
					this.isEndSur[0][0] = false;	//数字を見つけているので壁ではなくなる
					break;
				}else {
					pos--;
				}
			}
	
			//右の数字を見つける
			pos = 1;
	
			while(x + pos < board[0].length) {
				tempNum = board[y][x + pos];
	
				//右に数字を見つけた場合
				if(tempNum > 0) {
					this.surNumId[2] = idMap[y][x + pos];
					switch(tempNum) {
						case 2:				//2なら孤立シマ＋残り2本
							this.remain4way[2] = Math.min(this.remainSelf,2);
							if(tempNum > 1){
								this.isEndSur[2][2] = true;
							}
							break;
						case 1:		//1なら孤立シマ＋残り1本
							this.remain4way[2] = 1;
							this.isEndSur[2][1] = true;
							break;
						default:					//それ以外は引き本数残りが2
							this.remain4way[2] = Math.min(this.remainSelf,2);
							break;
					}
					this.isEndSur[2][0] = false;	//数字を見つけているので壁ではなくなる
					break;
				}else {
					pos++;
				}
			}
	
			pos = -1;
			//上の数字を見つける
			while(y + pos >= 0) {
				tempNum = board[y + pos][x];
	
				//上に数字を見つけた場合
				if(tempNum > 0) {
					this.surNumId[1] = idMap[y + pos][x];
					switch (tempNum){
						case 2:				//2なら孤立シマ＋残り2本
							this.remain4way[1] = Math.min(this.remainSelf,2);
							if(tempNum > 1){
								this.isEndSur[1][2] = true;
							}
							break;
						case 1:				//1なら孤立シマ＋残り1本
							this.remain4way[1] = 1;
							this.isEndSur[1][1] = true;
							break;
						default:			//それ以外は引き本数残りが2で初期化
							this.remain4way[1] = Math.min(this.remainSelf,2);
							break;
					}
					this.isEndSur[1][0] = false;	//数字を見つけているので壁ではなくなる
					break;
				}else {
					pos--;
				}
			}
	
			//下の数字を見つける
			pos = 1;
	
			while(y + pos < board.length) {
				tempNum = board[y + pos][x];
	
				//下に数字を見つけた場合
				if(tempNum > 0) {
					this.surNumId[3] = idMap[y + pos][x];
					switch (tempNum){
						case 2:				//2なら孤立シマ＋残り2本
							this.remain4way[3] = Math.min(this.remainSelf,2);
							if(tempNum > 1){
								this.isEndSur[3][2] = true;
							}
							break;
						case 1:				//1なら孤立シマ＋残り1本
							this.remain4way[3] = 1;
							this.isEndSur[3][1] = true;
							break;
						default:			//それ以外は引き本数残りが2で初期化
							this.remain4way[3] = Math.min(this.remainSelf,2);
							break;
					}
					this.isEndSur[3][0] = false;	//数字を見つけているので壁ではなくなる
					break;
				}else {
					pos++;
				}
			}
			//console.log("numId =" + this.id + " remain= " + this.remain4way);
		}else{
			let original = y as Num;
			this.id = original.getId();
			this.depth = depth;
			this.address = original.getAddress();
			this.surNumId = original.getSurNumId().concat();
			this.remain4way = original.getRemain4way().concat();
			this.remainSelf = original.getRemainSelf();
			this.parentIslandId = original.getParentIslandId();
			this.isLogicChecked = original.getIsLogicChecked();
			let origIsEndSur = original.getIsEndSur();
			this.isEndSur = [origIsEndSur[0].concat(),origIsEndSur[1].concat(),origIsEndSur[2].concat(),origIsEndSur[3].concat()];
			this.hands4way = original.getHands4way().concat();
		}
	}

	public getId():number{
		return this.id;
	}

	public getDepth():number{
		return this.depth;
	}

	public getParentIslandId():number{
		return this.parentIslandId;
	}

	public setParentIslandId(id:number):void{
		this.parentIslandId = id;
	}

	public getAddress():[number,number]{
		return this.address;
	}

	public getSurNumId():number[]{
		return this.surNumId;
	}

	public getHands4way():number[]{
		return this.hands4way;
	}

	public getRemainSelf():number{
		return this.remainSelf;
	}

	public getRemain4way():number[]{
		return this.remain4way;
	}

	public getIsLogicChecked():boolean{
		return this.isLogicChecked;
	}

	public getIsEndSur():boolean[][]{
		return this.isEndSur;
	}

	public clone(depth:number):Num{
		return new Num(depth,this);
	}

	/**
	 * 残り本数が減少した場合trueを返す
	 * @param dir 方向
	 * @param remain 残り本数
	 * @returns 
	 */
	public setRemain1way(dir:number,remain:number):boolean{	//remain < 2
		if(remain < this.remain4way[dir]){
			this.remain4way[dir] = remain;
			this.isLogicChecked = false;
			if(remain == 0){
				this.isEndSur[dir][2] = false;
				this.isEndSur[dir][1] = false;
				this.isEndSur[dir][0] = (this.hands4way[dir] == 0 || this.isEndSur[dir][0]);
			}else{
				this.isEndSur[dir][2] = false;
			}
			return true;
		}else{
			return false;
		}

	}

	/**
	 * 状態が変化した場合trueを返す
	 * @param dir 
	 * @param remainNum 
	 * @returns 
	 */
	public setIsEndSurTrue(dir:number,remainNum:number):boolean{
		if(!this.isEndSur[dir][remainNum]){
			this.isEndSur[dir][remainNum] = true;
			this.isLogicChecked = false;
			return true;
		}else{
			return false;
		}
	}

	/**
	 * 自身を島の末端として設定し、状態が変化した場合trueを返す
	 */
	public setEnd():boolean{
		let result:boolean = false;
		this.remain4way.forEach((val,dir) =>{
			if(val == 0 && !this.isEndSur[dir][0]){
				this.isLogicChecked = false;
				this.isEndSur[dir][0] = true;
				result = true;
			}
		})
		return result;
	}

	//数字マスに線を引き,残り本数を返す
	/**
	 *@param dir 方向
	 *@param hon 引き本数
	 *@returns 残り引き本数
	 */
	 public drawIn(dir:number,hon:number):number {
		this.hands4way[dir] += hon;
		this.remain4way[dir] -= hon;
		this.remainSelf -= hon;
		this.changeEndStatus(dir,hon);
		return this.remainSelf;
	}

	private drawSelf(result:number[]):void{
		this.remainSelf -= result.reduce((prev,cur) => prev + cur)
		result.forEach((hon,dir) =>{
			if(hon > 0){
				this.hands4way[dir] += hon;
				this.remain4way[dir] = Math.min(this.remainSelf, this.remain4way[dir] - hon);
				this.changeEndStatus(dir,hon);
			}
		});
	}

	private changeEndStatus(dir:number,hon:number):void{
		if(hon == 2){
			this.isEndSur[dir][0] = this.isEndSur[dir][2];
			this.isEndSur[dir][2] =	false;
		}else{
			if(this.isEndSur[dir][2]) {
				this.isEndSur[dir][2] = false;
				this.isEndSur[dir][1] = true;
			}else if(this.isEndSur[dir][1]){
				this.isEndSur[dir][1] =false;
				this.isEndSur[dir][0] =true;
				//TODO ここで行き止まり通知を出せる
			};
		};
	}

	public trySetRemain1way(dir:number,remain:number):[[number[],string],number]{
		let saveRemain = this.remain4way[dir];
		let saveisEnd = this.isEndSur[dir].concat();
		this.setRemain1way(dir,remain);

		let result = this.checkLogics(false);

		this.remain4way[dir] = saveRemain;
		this.isEndSur[dir] = saveisEnd;
		return result;
	}
	public trySetRemain2way(dir1:number,remain1:number,dir2:number,remain2:number):[[number[],string],number]{
		let saveRemain1 = this.remain4way[dir1];
		let saveisEnd1 = this.isEndSur[dir1].concat();
		this.setRemain1way(dir1,remain1);
		let saveRemain2 = this.remain4way[dir2];
		let saveisEnd2 = this.isEndSur[dir2].concat();
		this.setRemain1way(dir2,remain2);

		let result = this.checkLogics(false);

		this.remain4way[dir1] = saveRemain1;
		this.isEndSur[dir1] = saveisEnd1;
		this.remain4way[dir2] = saveRemain2;
		this.isEndSur[dir2] = saveisEnd2;

		return result;
		
	}
	/**
	 * @param	execFlg 線引きを実行するか、調べるだけか
	 * @return [[線の引き先方向ごと本数,手筋番号],残り本数]
	 */
	public checkLogics(execFlg : boolean):[[number[],string],number]{
		if(this.isLogicChecked){
			return [[[0,0,0,0],"001"],this.remainSelf];
		}
		let numberLogicResult:[number[],string]
		let sumRemain4way = this.remain4way.reduce((prev,cur) =>prev + cur);
		//this.minRemain4way = this.remain4way.reduce(function(prev,cur){return Math.min(prev,cur)});
		let remain0count:number = 0;
		for(let i:number = 0; i < 4 ;i++){
			remain0count = remain0count + Number(this.remain4way[i] == 0);
		}
		let remain1count:number = 0;
		for(let i:number = 0; i < 4 ;i++){
			remain1count = remain1count + Number(this.remain4way[i] == 1);
		}
		let isEndSurCount:number[] =[0,0,0];
		for(let arr of this.isEndSur){
			isEndSurCount[0] += Number(arr[0]);
			isEndSurCount[1] += Number(arr[1]);
			isEndSurCount[2] += Number(arr[2]);
		}
		//if(this.id == 1){
			// console.log("id = 1 sumRemain4way" + sumRemain4way + " remainSelf " + this.remainSelf);
			// console.log(this.remain4way);
		//}
		if(sumRemain4way<this.remainSelf){	//周囲の残り本数が引く必要のある本数より少なければ破綻
			return [[[0,0,0,0],"901"],0];
		}else if(sumRemain4way == this.remainSelf){
			if(this.remainSelf == 0){
				numberLogicResult = [[0,0,0,0],"002"];
			}else{
				numberLogicResult = [this.remain4way.concat(),"1X01"];	//全て腕を使い切るパターン
			}
		}else{
			switch (this.remainSelf) {
				case 7:
					numberLogicResult = this.logic7();
					break;
				case 6:
					numberLogicResult = this.logic6(remain1count,isEndSurCount);
					break;
				case 5:
					numberLogicResult = this.logic5(remain0count,remain1count,isEndSurCount);
					break;
				case 4:
					numberLogicResult = this.logic4(remain0count,remain1count,isEndSurCount);
					break;
				case 3:
					numberLogicResult = this.logic3(remain0count,remain1count,isEndSurCount);
					break;
				case 2:
					numberLogicResult = this.logic2(remain0count,remain1count,isEndSurCount);
					break;
				case 1:
					numberLogicResult = this.logic1(remain0count,isEndSurCount);
					break;
				case 0:
					numberLogicResult = [[0,0,0,0],"0000"]
					break;

				default:
					return [[[0,0,0,0],"999"],0];
			}
		}
		if(numberLogicResult[1].charAt(0) == "0"){
			return [numberLogicResult,this.remainSelf];
		}else{
			// console.log("id= " + this.id + " remainSelf= " + this.remainSelf + " remain4way = " + this.remain4way);
			if(execFlg){
				this.drawSelf(numberLogicResult[0]);
				this.isLogicChecked = true;
				return [numberLogicResult,this.remainSelf];
				
			}else{
				return [numberLogicResult,this.remainSelf - numberLogicResult[0].reduce((prev,cur) => prev + cur)];
			}
		}
	}

	/** 保留した手筋を実行する場合に使用
	 * 
	 * @param draw4way 
	 */
	public execLogic(draw4way:number[]):void{
		this.drawSelf(draw4way);
		this.isLogicChecked = true;
	}

	/**　残り本数毎の手筋を別で保持
	 * @param
	 * @return [線の引き先方向ごとの本数,結果コード]
	 */
	private logic7():[number[],string]{
		let logicResult :[number[],string];
		logicResult=[[1,1,1,1],"1701"];
		return logicResult;
	}
	private logic6(remain1count:number,isEndSurCount:number[]):[number[],string]{
		let logicResult :[number[],string];
		if(remain1count == 1){	//1隣接6
			
			//行き止まり2が3方向、かつ、残り1の方向にまだ線を引いていない場合は追加で引ける
			if(isEndSurCount[2] == 3 && this.hands4way[this.remain4way.findIndex((val)=>val==1)] == 0){
				logicResult = [[1,1,1,1],"1631"];
			}else{
				logicResult = [this.remain4way.map((val) => val-1),"1611"];
			}
		}else{
			switch(isEndSurCount[2]){
				case 4:
					logicResult = [[1,1,1,1],"1622"];
				case 3:
					logicResult = [this.isEndSur.map((val) => Number(!val[2])),"1621"];	//残り1方向が残り1本の可能性は排除済み
				default:
					logicResult = [[0,0,0,0],"00061"];
			}
		}
		return logicResult;
	}
	private logic5(remain0count:number,remain1count:number,isEndSurCount:number[]):[number[],string]{
		let logicResult :[number[],string];
		if(remain0count == 1){
			logicResult = [this.remain4way.map((val) => Number(val != 0)),"1501"];	//壁5
		}else{
			switch(remain1count){
				case 2:	//残り本数は6以上かつ残り1が2方向なので周囲の残り本数は1122で確定
					if(isEndSurCount[2] == 2){
						switch(isEndSurCount[1]){
							case 1:
								logicResult = [this.isEndSur.map((val) => Number(!val[1])),"1531"];
								break;
							case 2:
								logicResult = [[1,1,1,1],"1532"];
								break;
							default:
								logicResult = [[0,0,0,0],"00051"];
								break;
						}
					}else{	//奇数なので行き止まり1がないと孤立手筋は使えない
						logicResult = [this.remain4way.map((val) => val-1),"1511"];	//壁なし＋1122で確定なのでremain4way-1で残り2の方向だけ1になる
					}
					break;
				case 1:
					if(isEndSurCount[1] == 1){
						switch(isEndSurCount[2]){
							case 2:
								let tempResult = this.isEndSur.map((val, i) => Number(!val[1] && !val[2] && this.hands4way[i] == 0));
								if(tempResult.findIndex((val) => val == 1) >= 0){
									logicResult = [tempResult,"1521"];
								}else{
									logicResult =[[0,0,0,0],"00052"];
								}
								break;
							case 3:
								logicResult =[this.isEndSur.map((val) => Number(val[2])),"1522"];
								break;
							default:
								logicResult =[[0,0,0,0],"00053"];
						}

					}else{
						logicResult =[[0,0,0,0],"00054"];
					}
					break;
				default:
					logicResult =[[0,0,0,0],"00055"];
					break;
			}
		}
		return logicResult
	}
	private logic4(remain0count:number,remain1count:number,isEndSurCount:number[]):[number[],string]{
		let logicResult :[number[],string];
		if(remain0count == 1){
			if(remain1count == 1){
				if(isEndSurCount[2] == 2 && isEndSurCount[0] == 1 && this.hands4way.findIndex((hon,i) => hon > 0 && !this.isEndSur[i][0])<0){
					logicResult = [this.remain4way.map((val) =>Number(val != 0) ),"1431"];
				}else{
					logicResult = [this.remain4way.map((val) => Number(val==2)),"1411"];
				}
			}else{
				if(isEndSurCount[0] == 1){
					switch(isEndSurCount[2]){
						case 2:
							let tempResult = this.isEndSur.map((val,i) => Number(!val[2] && !val[0] && (this.hands4way[i] == 0)));
							if(tempResult.findIndex((val) => val == 1) >= 0){
								logicResult = [tempResult,"1421"];
							}else{
								logicResult = [[0,0,0,0],"00041"];
							}
							break;
						case 3:
							logicResult = [this.isEndSur.map((val) => Number(val[2])),"1422"];
							break;
						default:
							logicResult = [[0,0,0,0],"00042"];
							break;
					}
				}else{
					logicResult = [[0,0,0,0],"00043"];
				}
			}
		}else{
			if(isEndSurCount[1] == 2){
				switch(isEndSurCount[2]){
					case 1:
						let tempResult = this.isEndSur.map((val,i) => Number((!val[1] && !val[2]) && (this.hands4way[i] == 0)));
						if(tempResult.findIndex((val) => val == 1) >= 0){
							logicResult = [tempResult,"1423"];
						}else{
							logicResult =[[0,0,0,0],"00044"];
						}
						break;
					case 2:
						logicResult = [this.remain4way.map((val) => val-1),"1424"];	//4方向残りが1122なので1引くと2の方向になる
						break;
					default:
						logicResult =[[0,0,0,0],"00045"];
						break;
				}
			}else{
				if(remain1count == 3){
					logicResult = [this.remain4way.map((val) => val - 1),"1412"];	//必ず残りは5本以上なので1でない方向は2,1112からそれぞれ1を引いて2の方向だけ1
				}else{
					logicResult = [[0,0,0,0],"00046"];
				}
			}
		}
		return	logicResult;
	}
	private logic3(remain0count:number,remain1count:number,isEndSurCount:number[]):[number[],string]{
		let logicResult :[number[],string];
		switch(remain0count){
			case 2:
				logicResult = [this.remain4way.map((val) => Number(val>0)),"1301"];	//壁以外に一本ずつ
				break;
			case 1:
				if(isEndSurCount[0] == 1){	
					switch(isEndSurCount[1]){	//行き止まり1の数で分岐
						case 2:
							if(isEndSurCount[2]){	//壁*1行き止まり1*2行き止まり2*1
								logicResult = [this.isEndSur.map((val,i) => Number(!val[0] && this.hands4way[i]==0)),"1331"];	//壁以外で腕が伸びていない方向
							}else{	//壁*1行き止まり1*2通常2*1　（壁1*1行き止まり1*2+通常1*1は使い切りなのでここでは起こらない
								logicResult = [this.remain4way.map((val)=> Number(val == 2)),"1311"];
							}
							break;
						case 1:
							switch(isEndSurCount[2]){
								case 2:		//壁*1行き止まり1*1行き止まり2*2
									logicResult = [this.isEndSur.map((val) => Number(val[2])),"1322"];	//行き止まり2の方向
									break;
								case 1:		//壁*1行き止まり1*1行き止まり2*1
									let tempResult = this.remain4way.map((val,i)=>Number(val==2 && !this.isEndSur[i][2]));
									if(tempResult.findIndex((val) => val == 1) >= 0){
										logicResult = [tempResult,"1321"];	//通常2の方向
									}else{
										logicResult =[[0,0,0,0],"00031"];
									}
									break;
								default:
									if(remain1count == 2){	//壁1+通常1*2 + 2*1 上の方と内容的にはダブっている
										logicResult = [this.remain4way.map((val) => Number(val == 2)) ,"1311"];
									}else{
										logicResult = [[0,0,0,0],"00032"];
									}
									break;
							}
							break;
						default:
							logicResult = [[0,0,0,0],"00033"];
					}
				}else{
					if(remain1count == 2){
						logicResult = [this.remain4way.map((val) => Number(val == 2)) ,"1311"];
					}else{
						logicResult = [[0,0,0,0],"00034"];
					}
				}
				break;
			default:
				let tempResult = this.isEndSur.map((val,i) => Number(!val[1] && (this.hands4way[i]==0)));
				if(isEndSurCount[1] == 3 && tempResult.findIndex((val) => val == 1) >= 0){
					logicResult = [tempResult,"1323"];	//3方向行き止まり1
				}else{
					logicResult = [[0,0,0,0],"00035"];
				}
				break;
		}
		return	logicResult;
	}
	private logic2(remain0count:number,remain1count:number,isEndSurCount:number[]):[number[],string]{
		let logicResult :[number[],string];
		switch (isEndSurCount[0]){		//壁の数で分岐
			case 1:
				let tempResult = this.isEndSur.map((val,i) =>Number(!(val[0] || val[1]) && (this.hands4way[i]==0)));
				if(isEndSurCount[1] == 2 && tempResult.findIndex((val) => val == 1) >= 0){
					logicResult = [tempResult,"1221"];
				}else{
					if(remain0count == 2 && remain1count == 1){
						logicResult = [this.remain4way.map((val) => Number(val ==2)),"1211"];
					}else{
						logicResult = [[0,0,0,0],"00021"];
					}
				}
				break;
			case 2:
				if(remain1count == 1){
					if(isEndSurCount[2] == 1 && this.remain4way.findIndex((val,i) =>val == 1 && this.hands4way[i] == 0) >= 0){
						logicResult =[this.isEndSur.map((val) => Number(!val[0])),"1231"]
					}else{
						logicResult = [this.remain4way.map((val) => Number(val == 2)),"1211"];
					}
				}else{
						switch(isEndSurCount[2]) {
							case 1:
								logicResult = [this.isEndSur.map((val) => Number(!(val[0] || val[2]))),"1222"];
								break;
							case 2:
								logicResult = [this.isEndSur.map((val) => Number(val[2])),"1223"];
								break;
							default:
								logicResult = [[0,0,0,0],"00022"];
								break;
						}
				}
				break;
			default:		//case 3 は破綻か全腕消費パターンなのでここでは起こらない
				if(remain0count == 2 && remain1count == 1){
					logicResult = [this.remain4way.map((val) => Number(val == 2)),"1211"];
				}else{
					logicResult = [[0,0,0,0],"00023"];
				}
				break;
		}
		return logicResult;
	}
	private logic1(remain0count:number,isEndSurCount:number[]):[number[],string]{
		let logicResult :[number[],string];
		switch(remain0count){
			case 3:
				logicResult = [this.remain4way.map((val) => Number(val > 0)),"1101"];
				break;
			case 2:
				if(isEndSurCount[0] == 2){
					switch(isEndSurCount[1]){
						case 1:
							let tempResult = this.isEndSur.map((val,dir) => Number(!val[0] && !val[1] && this.hands4way[dir] == 0));
							if(tempResult.findIndex((val) => val == 1) >= 0){
								logicResult = [tempResult,"1123"];
							}else{
								logicResult = [[0,0,0,0],"00011"];
							}
							break;
						case 2:
							switch(this.hands4way.reduce((prev,cur) => prev + Number(cur > 0))){
								case 0:
									logicResult = [[0,0,0,0],"902"]
									break;
								case 1:
									logicResult = [this.hands4way.map((hon,i) => Number(hon == 0 && this.isEndSur[i][1])),"1124"]
									break;
								default:	//case 2
									logicResult = [[0,0,0,0],"00012"];
									break;
							}
							break;
						default:
							logicResult = [[0,0,0,0],"00013"];
							break;
					}
				}else{
					logicResult = [[0,0,0,0],"00013"];
				}
				break;
			case 1:
				if(isEndSurCount[0] == 1){
					switch(isEndSurCount[1]){
						case 3:
							if(this.hands4way.findIndex((val,i) =>val > 0 && this.isEndSur[i][1] == true) > 0){
								logicResult = [[0,0,0,0],"00014"];
							}else{
								logicResult = [[0,0,0,0],"902"];
							}
							break;
						case 2:
							if(this.hands4way.findIndex((val,i) =>val > 0 && this.isEndSur[i][1] == true) > 0){
								logicResult = [[0,0,0,0],"00015"];
							}else{
								logicResult = [this.isEndSur.map((val) => Number(val[0] == false && val[1] == false)),"1121"];
							}
							break;
						default:
							logicResult = [[0,0,0,0],"00016"];
							break;

					}
				}else{
					logicResult = [[0,0,0,0],"00017"];
				}
				break;
			default:
				switch(isEndSurCount[1]){
					case 3:
						logicResult = [this.isEndSur.map((val)=> Number(!val[1])),"1121"];
						break;
					case 4:
						if(this.hands4way.findIndex((val,i) =>val > 0 && this.isEndSur[i][1] == true) > 0){
							logicResult = [[0,0,0,0],"00018"];
						}else{
							logicResult = [[0,0,0,0],"902"];
						}
						break;
					default:
						logicResult = [[0,0,0,0],"00019"];
						break;
				}
				break;
		}
		return logicResult;
	}

	/**
	 * 最低1本引かれるかどうかを指定したエリアについて判定した結果を返す
	 * 3:既に一方向引き済　2:最低一方向 1:チェイン　0:なし
	 * 
	 */
	public checkMin1(i:number):number{
		//残り2本以上かつ調査対象エリアの引きがまだ0本かつ線を対象エリアの2方向に引くことができる
		if(this.remainSelf > 2 && this.hands4way[i] == 0 && this.hands4way[(i + 1) % 4] == 0 && this.remain4way[i] > 0 && this.remain4way[(i + 1) % 4] > 0 ){
			let min = this.remainSelf - this.remain4way[(i + 2) % 4] - this.remain4way[(i + 3) % 4];
			//反対側エリア2方向から本数があふれて調査対象側に1本以上引かれるか
			if(min > 0){
				//最低一本
				return 2;
			}else{
				//findIndexで見つかった値は012の残り本数、複数が同時にtrueとなることはないので最初に見つかったものでOK
				let diffEndSurSum = this.remainSelf - this.isEndSur[(i + 2) % 4].findIndex(val => val) - this.isEndSur[(i + 3) % 4].findIndex(val => val);	//remainSelf > 2　なので-1が入ると必ず>0
				//areaの2方向が0本であることは確認済みの分岐のため、areaの反対側が分断になるかを確認すればよい。
				if(diffEndSurSum == 0){
					//分断回避のため最低一本
					return 2;
				}else if(min + Math.min(this.remain4way[i],this.remain4way[(i + 1) % 4]) > 0){
					//斜めチェイン（判定先送り）
					return 1;
				}else{
					return 0;
				}
			}
		}else{
			if(this.hands4way[i] > 0 || this.hands4way[(i + 1) % 4] > 0){
				return 3;
			}else{
				return 0;

			}
		}
	}

	/**
	 * 最低一方向のエリアを渡し、最低引き本数を返す。
	 * @param min1area 最低一本の方向
	 * @returns 本数配列
	 */
	public getExecMin1result(area:number):number[]{
		let areaRemain:number = this.remainSelf - Math.max(this.remain4way[area],this.remain4way[(area+1)%4]);
		let result:number[] = [0,0,0,0];
		result[(area+2)%4] = areaRemain - this.remain4way[(area+3)%4];
		result[(area+3)%4] = areaRemain - this.remain4way[(area+2)%4];
		return result;
	}
}
