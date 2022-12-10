
import { UiConstants as uc } from "./UiConstants";
export class InputLog {
    private readonly rootAddress:number[]|undefined;
    /**セットした数字 / URL / 盤面地図 / 線の引き先リスト([[x0, y0], [x1, y1],...]) */
    private readonly boardInput:number|string|number[][];
    private readonly inputType:uc.InputType;
    private readonly inputCode:string;
    private tryLog:InputLog[]=[];
    /**
     * @param inputCode  
     * @param inputType  UiConstants.InputType
     * @param boardInput セットした数字 / URL / 盤面地図 / 線の引き先リスト([[x0, y0], [x1, y1],...])
     * @param rootAddress [x, y]形式で線の引き元または数字マスの設定先を設定 
     */
    constructor(inputCode:string,inputType:uc.InputType,boardInput:number|string|number[][],rootAddress?:number[]){
        //入力チェック
        switch(inputType){
            case uc.InputType.number:
                if(typeof boardInput !== "number"){
                    throw new TypeError("指定した形式「" + inputType + "」に対して、boardInputの型がnumberではありません。");
                }
                if(typeof rootAddress === "undefined"){
                    throw new TypeError("指定した形式「" + inputType + "に対して、引数「rootAddress」が不足しています。")
                }else{
                    this.rootAddress = rootAddress;
                }
                break;
            case uc.InputType.url:
                if(typeof boardInput !== "string"){
                    throw new TypeError("指定した形式「" + inputType + "」に対して、boardInputの型がstringではありません。");
                }
                break;
            case uc.InputType.lines:
                if(typeof rootAddress === "undefined"){
                    throw new TypeError("指定した形式「" + inputType + "に対して、引数「rootAddress」が不足しています。")
                }else{
                    this.rootAddress = rootAddress;
                }
            case uc.InputType.board:
                try {
                    if(typeof (boardInput as number[][])[0][0] !== "number"){
                        throw new TypeError()
                    }
                } catch (error) {
                    throw new TypeError("指定した形式「" + inputType + "」に対して、boardInputの型がnumber[][]ではありません。");
                }
                break;
            default:
                throw new Error("クラスinputLogの入力形式がまだ設定されていません。")
        }
        this.boardInput = boardInput;
        this.inputType = inputType;
        this.inputCode = inputCode;
    }

    public setLog(log:InputLog[]):void{
        this.tryLog = log;
    }

    public getLog():InputLog[]{
        return this.tryLog;
    }

    public getInputCode():string{
        return this.inputCode;
    }
    /**
     * 
     * @returns [x, y]
     */
    public getRootAddress():number[]{
        switch(this.inputType){
            case uc.InputType.lines:
            case uc.InputType.number:
                return this.rootAddress as number[];
            default:
                throw new TypeError("inputLogの形式が「lines」または「number」ではありません。")
        }
    }
    /**引き先となるアドレスのリストを返す[[x0, y0], [x1, y1],...] */
    public getToAddress():number[][]{
        if(this.inputType !== uc.InputType.lines){
            throw new TypeError("inputLogの形式が「lines」ではありません。");
        }else{
            return this.boardInput as number[][];
        }
    }

    public getNumber():number {
        if(this.inputType !== uc.InputType.number){
            throw new TypeError("inputLogの形式が「number」ではありません。");
        }else{
            return this.boardInput as number;
        }
    }

    public getUrl():string{
        if(this.inputType !== uc.InputType.url){
            throw new TypeError("inputLogの形式が「url」ではありません。");
        }else{
            return this.boardInput as string;
        }
    }
        
    public getBoardAbst():number[][] {
        if(this.inputType !== uc.InputType.board){
            throw new TypeError("inputLogの形式が「board」ではありません");
        }else{
            return this.boardInput as number[][];
        }
    }

}