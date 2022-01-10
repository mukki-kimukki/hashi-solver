export class resultLog{
    private _numIdCheck:number;
    private _numIdDraw:number;
    private _result:number[]
    private _resultCode:string;

    constructor(numIdCheck:number,numIdDraw:number,result:number[],resultCode:string){
        this._numIdCheck = numIdCheck;
        this._numIdDraw =numIdDraw;
        this._result = result;
        this._resultCode = resultCode;
    }

    public get numIdCheck(){
        return this._numIdCheck;
    }

    
    public get numIdDraw(){
        return this._numIdDraw;
    }

    
    public get result(){
        return this._result;
    }

    
    public get resultCode(){
        return this._resultCode;
    }
}