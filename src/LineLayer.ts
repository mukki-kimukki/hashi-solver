 
 /*盤面に引かれた線の情報を全て、または仮置き段階毎に分けて保持する
 */
 class LineLayer {

	private lineLayer: number[][][];	//each cell has 4 way line status
	private sumLines: number[][];
	constructor(y:number,x:number){
		this.lineLayer = new Array<Array<Array<number>>>();
		for(let i :number =0; i < x; i ++){
			for(let j :number =0; j < y; j ++){
				for(let k :number =0; k < 3; k ++){
					this.lineLayer[i][j][k] = 0
				}
			}
		}
		this.sumLines = new Array<Array<number>>()
		for(let i :number =0; i < x; i ++){
			for(let j :number =0; j < y; j ++){
					this.sumLines[i][j] = 0
			}
		}
	}

	public setLineLayer(lineLayer:number[][][]):void{
		this.lineLayer =  lineLayer
	}
	public getLineLayer():number[][][]{
		return this.lineLayer
	}

	public changeLine(y:number,x:number,dir:number,n:number):void{
		this.lineLayer[y][x][dir] += n
	}
}