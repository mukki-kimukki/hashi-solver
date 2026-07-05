
import { UiConstants as uc } from "./UiConstants";
import { Address, InputType, isAddress } from "../common/Types";
export class InputLog {
    private readonly rootAddress:Address|undefined;
    /**セットした数字 / URL / 盤面地図 / 線の引き先リスト([Address0, Address1,...]) */
    private readonly boardInput:number|string|number[][]|Address[];
    private readonly inputType:InputType;
    private readonly inputCode:string;
    private tryLog:InputLog[]=[];
    /**
     * @param inputCode  入力内容のコード値
     * @param inputType  UiConstants.InputType
     * @param boardInput セットした数字 / URL / 盤面地図 / 線の引き先リスト([Address0, Address1,...])
     * @param rootAddress [x, y]形式で線の引き元または数字マスの設定先を設定 
     */
    constructor(inputCode:string,inputType:InputType,boardInput:number|string|number[][]|Address[],rootAddress?:Address){
        //入力チェック
        switch(inputType){
            case InputType.number:
                if(typeof boardInput !== "number"){
                    throw new TypeError("指定した形式「" + inputType + "」に対して、boardInputの型がnumberではありません。");
                }
                if(typeof rootAddress === "undefined"){
                    throw new TypeError("指定した形式「" + inputType + "に対して、引数「rootAddress」が不足しています。")
                }else{
                    this.rootAddress = rootAddress;
                }
                break;
            case InputType.url:
                if(typeof boardInput !== "string"){
                    throw new TypeError("指定した形式「" + inputType + "」に対して、boardInputの型がstringではありません。");
                }
                break;
            case InputType.lines:
                if(typeof rootAddress === "undefined"){
                    throw new TypeError("指定した形式「" + inputType + "に対して、引数「rootAddress」が不足しています。")
                }else if(!Array.isArray(boardInput)){
                    throw new TypeError("指定した形式「" + inputType + "に対して、引数「boardInput」の型がany[]ではありません。")
                }else　if(!isAddress(boardInput[0])){
                    throw new TypeError("指定した形式「" + inputType + "に対して、引数「boardInput」の型がAddress[]ではありません。")
                }else{
                    this.rootAddress = rootAddress;
                }
                break;
            case InputType.board:
                if(!Array.isArray(boardInput)){
                    throw new TypeError("指定した形式「" + inputType + "に対して、引数「boardInput」の型がany[]ではありません。")
                }else if (!Array.isArray(boardInput[0])){
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

    public getRootAddress():Address{
        switch(this.inputType){
            case InputType.lines:
            case InputType.number:
                return this.rootAddress as Address;
            default:
                throw new TypeError("inputLogの形式が「lines」または「number」ではありません。")
        }
    }
    /**引き先となるアドレスのリストを返す[Address0, Address1,...] */
    public getToAddress():Address[]{
        if(this.inputType !== InputType.lines){
            throw new TypeError("inputLogの形式が「lines」ではありません。");
        }else{
            return this.boardInput as Address[];
        }
    }

    public getNumber():number {
        if(this.inputType !== InputType.number){
            throw new TypeError("inputLogの形式が「number」ではありません。");
        }else{
            return this.boardInput as number;
        }
    }

    public getUrl():string{
        if(this.inputType !== InputType.url){
            throw new TypeError("inputLogの形式が「url」ではありません。");
        }else{
            return this.boardInput as string;
        }
    }
        
    public getBoardAbst():number[][] {
        if(this.inputType !== InputType.board){
            throw new TypeError("inputLogの形式が「board」ではありません");
        }else{
            return this.boardInput as number[][];
        }
    }

}