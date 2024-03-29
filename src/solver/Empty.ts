export class Empty{
	private id4way:number[] = [-1,-1,-1,-1];

    constructor(y:number,x:number,numIdMap:number[][]){
		let pos:number = -1;						//縦または横方向の(x,y)からの相対位置:左から調べるので初期値は-1
		//左の数字を見つけて情報を与える
		while(x + pos >= 0) {
			//左に数字を見つけた場合
			if(numIdMap[y][x + pos] > 0) {
                this.id4way[0] = numIdMap[y][x+pos];
				break;
			}else {
				pos--;
			}
		}

		//右の数字を見つけて情報を与える
		pos = 1;

		while(x + pos < numIdMap[0].length){
			//右に数字を見つけた場合
			if(numIdMap[y][x + pos] > 0) {
                this.id4way[2] = numIdMap[y][x+pos];
				break;
			}else {
				pos++;
			}
		}

		pos = -1;
		//上の数字を見つけて情報を与える
		while(y + pos >= 0) {
			//上に数字を見つけた場合
			if(numIdMap[y + pos][x] > 0) {
                this.id4way[1]=numIdMap[y+pos][x];
				break;
			}else {
				pos--;
			}
		}

		//下の数字を見つけて情報を与える
		pos = 1;

		while(y + pos < numIdMap.length) {
			//下に数字を見つけた場合
			if(numIdMap[y + pos][x] > 0) {
                this.id4way[3]=numIdMap[y+pos][x];
				break;
			}else {
				pos++;
			}
		}
	}
	/**
	@returns [leftId,rightId]
	*/
    public getHorNumId():[number,number]{
        return [this.id4way[0],this.id4way[2]];
    }
	/**
	@returns [upId,downId]
	*/
    public getVerNumId():[number,number]{
        return [this.id4way[1],this.id4way[3]];
    }


	public getSurNumId():number[]{
		return this.id4way;
	}
}