class Num {

	private id:number;
	private address:number[];
	private surNumId:[number,number,number,number] = [-1,-1,-1,-1];


    private hands4way:number[]=[0,0,0,0];   //left,up,right,down

	//自身の残り引き本数
	private remainSelf:number;				

	//周囲の残り引き本数：初期化時に壁だった場合を初期値とすると0
    private remain4way:number[] = [0,0,0,0];


	//自身が所属する島の末端かどうか
	//[末端が自身のみ,一本引いた場合に唯一の末端（行き止まり）,二本引いた場合唯一の末端（行き止まり）]
	private isEndSelf:boolean[] = [true,false,false];

	//周囲が行き止まり（行き止まり予備軍）かどうか
	private isEndSur:boolean[][]  		//boolean(4*3) 4方向(LeftUpRightDown)について何本(012)か引くと行き止まりになるか:初期値0は壁を想定してtrue
	= [[true,false,false],[true,false,false],[true,false,false],[true,false,false]];

	private isChecked:boolean = false;	//手筋チェック済フラグ：無駄な検証をスキップ

	
	public constructor(y:number, x:number, board:number[][], idMap:number[][], id:number) {

		this.id = id;
		this.address = [y,x];
		this.remainSelf = board[y][x];
		if(board[y][x] == 1){
			this.isEndSelf[1] = true;
		}else if(board[y][x] == 2) {
			this.isEndSelf[2] = true;
		}

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
						this.remain4way[0] = 2;
						this.isEndSur[0][2] = true;
						break;
					case 1:				//1なら孤立シマ＋残り1本
						this.remain4way[0] = 1;
						this.isEndSur[0][1] = true;
						break;
					default:			//それ以外は引き本数残りが2で初期化
						this.remain4way[0] = 2;
						break;
				}
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
						this.remain4way[2] = 2;
						this.isEndSur[2][2] = true;
						break;
					case 1:		//1なら孤立シマ＋残り1本
						this.remain4way[2] = 1;
						this.isEndSur[2][1] = true;
						break;
					default:					//それ以外は引き本数残りが2
						this.remain4way[2] = 2;
						break;
				}
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
						this.remain4way[0] = 2;
						this.isEndSur[0][2] = true;
						break;
					case 1:				//1なら孤立シマ＋残り1本
						this.remain4way[0] = 1;
						this.isEndSur[0][1] = true;
						break;
					default:			//それ以外は引き本数残りが2で初期化
						this.remain4way[0] = 2;
						break;
				}
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
						this.remain4way[0] = 2;
						this.isEndSur[0][2] = true;
						break;
					case 1:				//1なら孤立シマ＋残り1本
						this.remain4way[0] = 1;
						this.isEndSur[0][1] = true;
						break;
					default:			//それ以外は引き本数残りが2で初期化
						this.remain4way[0] = 2;
						break;
				}
				break;
			}else {
				pos++;
			}
		}
	}

	public getId():number{
		return this.id;
	}

	public getAddress():number[]{
		return this.address;
	}

	public getSurNumId():number[]{
		return this.surNumId;
	}

	public getHands4way():number[]{
		return this.hands4way;
	}

	public setRemain1way(dir:number,remain:number):void{	//remain < 2
		this.remain4way[dir] = remain;
		this.isChecked = false;
		if(remain == 0){
			this.isEndSur[dir][2] = false;
			this.isEndSur[dir][1] = false;
			this.isEndSur[dir][0] = this.hands4way[dir] == 0;
		}else{
			this.isEndSur[dir][2] = false;
		}
	}

	public setIsEndSurTrue(dir:number,remainNum:number,isEnd:boolean){
		this.isEndSur[dir][remainNum] = isEnd;
		this.isChecked = false;
	}

	//数字マスに線を引き残り本数と行き止まり状況のタプルを返すメソッド
	/**
	 *
	 * @param {number}hon the number of hand(s) drawn to this:1 or 2
	 * @param {number}dir the number that indicates the direction the drown hand(s) be from :left=0,up=1,right=2,down=3
	 * @param {boolean[4]}isoChange the dead end status of a direction from which the hands are drawn
	 * @returns {number,boolean[2]} [the total remaining number of hands/ whether the number will be dead end or not if 1 or 2 hands are drawn to it]
	 */
	 public drawIn(dir:number,hon:number):number {
		this.hands4way[dir] += hon;
		this.remain4way[dir] -= hon;
		this.remainSelf -= hon;
		this.changeEndStatus(dir,hon);
		return this.remainSelf;
	}

	private drawSelf(hon:number[]):void{
		for(let dir = 0; dir < 4; dir++){
			this.hands4way[dir] += hon[dir];
			this.remain4way[dir] -= hon[dir];
			this.changeEndStatus(dir,hon[dir]);
		}
		this.remainSelf = this.remainSelf - hon.reduce((val,num) =>val + num);
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
			};
		};
	}

	/**
	 * @param	execFlg 手筋を実行するか
	 * @return [線の引き先方向と本数,残り本数,手筋番号]
	 */
	public checkLogics(execFlg : boolean):[[number[],string],number]{
		if(this.isChecked){
			return [[[0,0,0,0],"000"],this.remainSelf];
		}
		let numberLogicResult:[number[],string]
		let sumRemain4way = this.remain4way.reduce(function(prev,cur){return prev + cur});
		//this.minRemain4way = this.remain4way.reduce(function(prev,cur){return Math.min(prev,cur)});
		let remain0count:number = this.remain4way.reduce((prev,cur) => {return prev + Number(cur == 0) })
		let remain1count:number = this.remain4way.reduce((prev,cur) => {return prev + Number(cur == 1) })
		let isEndSurCount:number[] =[0,0,0];
		for(let arr of this.isEndSur){
			isEndSurCount[0] += Number(arr[0]);
			isEndSurCount[1] += Number(arr[1]);
			isEndSurCount[2] += Number(arr[2]);
		}
		if(sumRemain4way<this.remainSelf){	//周囲の残り本数が引く必要のある本数より少なければ破綻
			return [[[0,0,0,0],"901"],0];
		}else if(sumRemain4way == this.remainSelf){
			numberLogicResult = [this.remain4way.concat(),""];	//全て腕を使い切るパターン
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

				default:
					return [[[0,0,0,0],"999"],0];
			}
		}
		if(execFlg){
			this.drawSelf(numberLogicResult[0]);
			this.isChecked = true;
			return [numberLogicResult,this.remainSelf];
		}else{
			return [numberLogicResult,this.remainSelf - numberLogicResult[0].reduce((prev,cur) => prev + cur)];
		}
	}
	//残り本数毎の手筋を別で保持
	/**
	 * @param
	 * @return [線の引き先方向と本数,腕を使い切ったか]
	 */
		private logic7():[number[],string]{
			let logicResult :[number[],string];
			logicResult=[[1,1,1,1],"701"];
			return logicResult;
		}
		private logic6(remain1count:number,isEndSurCount:number[]):[number[],string]{
			let logicResult :[number[],string];
			if(remain1count == 1){	//1隣接6
				
				//行き止まり2が3方向、かつ、残り1の方向にまだ線を引いていない場合は追加で引ける
				if(isEndSurCount[2] == 3 && this.hands4way[this.remain4way.findIndex((val)=>val==1)] == 0){
					logicResult = [[1,1,1,1],"631"];
				}else{
					logicResult = [this.remain4way.map((val) => val-1),"611"];
				}
			}else{
				switch(isEndSurCount[2]){
					case 4:
						logicResult = [[1,1,1,1],"622"];
					case 3:
						logicResult = [this.isEndSur.map((val) => Number(!val[2])),"621"];	//残り1方向が残り1本の可能性は排除済み
					default:
						logicResult = [[0,0,0,0],"000"];
				}
			}
			return logicResult;
		}
		private logic5(remain0count:number,remain1count:number,isEndSurCount:number[]):[number[],string]{
			let logicResult :[number[],string];
			if(remain0count == 1){
				logicResult = [this.isEndSur.map((val) => Number(!val[0])),"501"];	//壁5
			}else{
				switch(remain1count){
					case 2:	//残り本数は6以上かつ残り1が2方向なので周囲の残り本数は1122で確定
						if(isEndSurCount[2] == 2){
							switch(isEndSurCount[1]){
								case 1:
									logicResult = [this.isEndSur.map((val) => Number(!val[1] && !val[2])),"531"];
									break;
								case 2:
									logicResult = [[1,1,1,1],"532"];
									break;
								default:
									logicResult = [[0,0,0,0],"000"];
									break;
							}
						}else{	//奇数なので行き止まり1がないと孤立手筋は使えない
							logicResult = [this.remain4way.map((val) => val-1),"511"];	//壁なし＋1122で確定なのでremain4way-1で残り2の方向だけ1になる
						}
						break;
					case 1:
						let tempResult = this.isEndSur.map((val, i) => Number(!val[1] && !val[2] && this.hands4way[i] == 0));
						if(tempResult.findIndex((val) => val == 1) >= 0){
							logicResult = [tempResult,"521"];
						}else{
							logicResult =[[0,0,0,0],"000"];
						}
						break;
					default:
						logicResult =[[0,0,0,0],"000"];
						break;
				}
			}
			return logicResult
		}
		private logic4(remain0count:number,remain1count:number,isEndSurCount:number[]):[number[],string]{
			let logicResult :[number[],string];
			if(remain0count == 1){
				if(remain1count == 1){
					if(isEndSurCount[2] == 2 && isEndSurCount[0] == 1 && this.remain4way.findIndex((val,i) => val == 1 && this.hands4way[i] == 0)){
						logicResult = [this.remain4way.map((val) =>Number(val != 0) ),"431"];
					}else{
						logicResult = [this.remain4way.map((val) => Number(val==2)),"411"];
					}
				}else{
					if(isEndSurCount[0] == 1){
						switch(isEndSurCount[2]){
							case 2:
								let tempResult = this.isEndSur.map((val,i) => Number(!val[2] && !val[0] && (this.hands4way[i] == 0)));
								if(tempResult.findIndex((val) => val == 1) >= 0){
									logicResult = [tempResult,"421"];
								}else{
									logicResult = [[0,0,0,0],"000"];
								}
								break;
							case 3:
								logicResult = [this.isEndSur.map((val) => Number(val[2])),"422"];
								break;
							default:
								logicResult = [[0,0,0,0],"000"];
								break;
						}
					}else{
						logicResult = [[0,0,0,0],"000"];
					}
				}
			}else{
				if(isEndSurCount[1] == 2){
					switch(isEndSurCount[2]){
						case 1:
							let tempResult = this.isEndSur.map((val,i) => Number((!val[1] && !val[2]) && (this.hands4way[i] == 0)));
							if(tempResult.findIndex((val) => val == 1) >= 0){
								logicResult = [tempResult,"423"];
							}else{
								logicResult =[[0,0,0,0],"000"];
							}
							break;
						case 2:
							logicResult = [this.remain4way.map((val) => val-1),"424"];	//4方向残りが1122なので1引くと2の方向になる
							break;
						default:
							logicResult =[[0,0,0,0],"000"];
							break;
					}
				}else{
					if(remain1count == 3){
						logicResult = [this.remain4way.map((val) => val - 1),"412"];	//必ず残りは5本以上なので1でない方向は2,1112からそれぞれ1を引いて2の方向だけ1
					}else{
						logicResult = [[0,0,0,0],"000"];
					}
				}
			}
			return	logicResult;
		}
		private logic3(remain0count:number,remain1count:number,isEndSurCount:number[]):[number[],string]{
			let logicResult :[number[],string];
			if(isEndSurCount[0] == 1){	
				switch(isEndSurCount[1]){	//行き止まり1の数で分岐
					case 2:
						if(isEndSurCount[2] == 1){	//壁*1行き止まり1*2行き止まり2*1
							logicResult = [this.isEndSur.map((val) => Number(!val[0])),"331"];	//壁以外全方向
						}else{	//壁*1行き止まり1*2通常2*1　（壁1*1行き止まり1*2+通常1*1は使い切りなのでここでは起こらない
							logicResult = [this.remain4way.map((val)=> Number(val == 2)),"311"];
						}
						break;
					case 1:
						switch(isEndSurCount[2]){
							case 2:		//壁*1行き止まり1*1行き止まり2*2
								logicResult = [this.isEndSur.map((val) => Number(val[2])),"322"];	//行き止まり2の方向
								break;
							case 1:		//壁*1行き止まり1*1行き止まり2*1
								let tempResult = this.isEndSur.map((val,i)=>Number(!(val[0] || val[1] || val[2]) && (this.hands4way[i]==0)));
								if(this.isEndSelf[0] && tempResult.findIndex((val) => val == 1) >= 0){
									logicResult = [tempResult,"321"];	//通常2の方向
								}else{
									logicResult =[[0,0,0,0],"000"];
								}
								break;
							default:
								if(remain1count == 2){	//壁1+通常1*2 + 2*1 上の方と内容的にはダブっている
									logicResult = [this.remain4way.map((val) => Number(val == 2)) ,"311"];
								}else{
									logicResult = [[0,0,0,0],"000"];
								}
								break;
						}
					default:
						logicResult = [[0,0,0,0],"000"];
				}
			}else{
				switch(remain0count){
					case 2:
						logicResult = [this.isEndSur.map((val) => Number(!val[0])),"301"];	//壁以外に一本ずつ
						break;
					case 1:
						if(remain1count == 2){
							logicResult = [this.remain4way.map((val) => Number(val == 2)) ,"311"];
						}else{
							logicResult = [[0,0,0,0],"000"];
						}
						break;
				default:
					let tempResult = this.isEndSur.map((val,i) => Number(!val[1] && (this.hands4way[i]==0)));
					if(isEndSurCount[1] == 3 && tempResult.findIndex((val) => val == 1) >= 0){
						logicResult = [tempResult,"323"];	//3方向行き止まり1
					}else{
						logicResult = [[0,0,0,0],"000"];
					}
					break;
				}
			}
			return	logicResult;
		}
		private logic2(remain0count:number,remain1count:number,isEndSurCount:number[]):[number[],string]{
			let logicResult :[number[],string];
			switch (isEndSurCount[0]){		//壁の数で分岐
				case 1:
					let tempResult = this.isEndSur.map((val,i) =>Number(!(val[0] || val[1]) && (this.hands4way[i]==0)));
					if(isEndSurCount[1] == 2 && tempResult.findIndex((val) => val == 1) >= 0){
						logicResult = [tempResult,"221"];
					}else{
						logicResult = [[0,0,0,0],"000"];
					}
					break;
				case 2:
					if(remain1count == 1){
							logicResult = [this.remain4way.map((val) => Number(val == 2)),"211"];
					}else{
							switch(isEndSurCount[2]) {
								case 1:
									logicResult = [this.isEndSur.map((val) => Number(!(val[0] || val[2]))),"222"];
									break;
								case 2:
									logicResult = [this.isEndSur.map((val) => Number(val[2])),"223"];
									break;
								default:
									logicResult = [[0,0,0,0],"000"];
									break;
							}
					}
				default:		//case 3 は破綻か全腕消費パターンなのでここでは起こらない
					if(remain0count == 2 && remain1count == 1){
						logicResult = [this.remain4way.map((val) => Number(val == 2)),"211"];
					}else{
						logicResult = [[0,0,0,0],"000"];
					}
					break;
			}
			return logicResult;
		}
		private logic1(remain0count:number,isEndSurCount:number[]):[number[],string]{
			let logicResult :[number[],string];
			switch(remain0count){
				case 3:
					logicResult = [this.isEndSur.map((val) => Number(!val[0])),"101"];
					break;
				case 2:
					if(isEndSurCount[0] == 2){
						switch(isEndSurCount[1]){
							case 1:
								logicResult = [this.remain4way.map((val) => Number(val == 2)),"123"];
								break;
							case 2:
								logicResult = [[0,0,0,0],"902"];
								break;
							default:
								logicResult = [[0,0,0,0],"000"];
								break;
						}
					}else{
						logicResult = [[0,0,0,0],"000"];
					}
					break;
				case 1:
					if(isEndSurCount[0] == 1){
						switch(isEndSurCount[1]){
							case 3:
								logicResult = [[0,0,0,0],"902"];
								break;
							case 2:
								logicResult = [this.isEndSur.map((val) => Number(!val[0] && !val[1])),"122"];
								break;
							default:
								logicResult = [[0,0,0,0],"000"];
								break;

						}
					}else{
						logicResult = [[0,0,0,0],"000"];
					}
					break;
				default:
					switch(isEndSurCount[1]){
						case 3:
						   logicResult = [this.remain4way.map((val)=> Number(val == 2)),"121"];
						   break;
						case 4:
							logicResult = [[0,0,0,0],"902"];
							break;
						default:
						   logicResult = [[0,0,0,0],"000"];
						   break;
				   }
					break;
			}
			return logicResult;
		}

}
